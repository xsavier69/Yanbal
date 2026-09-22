-- ============================================================================
-- Migración 002 — Página de invitación, personas interesadas y testimonios
--
-- Cómo usar: Supabase -> SQL Editor -> New query -> pega todo -> Run.
-- Se puede correr más de una vez sin problema (no borra nada).
-- Requiere haber corrido antes schema.sql y 001_campana_y_secciones.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- settings: datos de la página de invitación
-- Todo puede quedar vacío; la página muestra [ASÍ] lo que falta por llenar.
-- ----------------------------------------------------------------------------
alter table public.settings
  add column if not exists consultant_name text,
  add column if not exists city text,
  add column if not exists years_selling smallint,
  add column if not exists hero_photo_url text,
  add column if not exists signature_url text,
  add column if not exists why_me_custom text,
  add column if not exists kit_info text,
  add column if not exists credit_available boolean not null default false,
  add column if not exists benefits text,
  add column if not exists benefits_source text,
  add column if not exists official_join_url text,
  add column if not exists closing_text text,
  -- Respuestas de las preguntas frecuentes de incorporación.
  -- Las preguntas son fijas en el código; aquí van solo las respuestas.
  add column if not exists join_faq jsonb not null default '{}'::jsonb;

alter table public.settings
  drop constraint if exists settings_join_check;
alter table public.settings
  add constraint settings_join_check
  check (
    (consultant_name is null or char_length(consultant_name) <= 60)
    and (city is null or char_length(city) <= 60)
    and (years_selling is null or years_selling between 0 and 70)
    and (why_me_custom is null or char_length(why_me_custom) <= 200)
    and (kit_info is null or char_length(kit_info) <= 300)
    and (benefits is null or char_length(benefits) <= 600)
    and (benefits_source is null or char_length(benefits_source) <= 120)
    and (closing_text is null or char_length(closing_text) <= 400)
    and (
      official_join_url is null
      or (char_length(official_join_url) <= 300 and official_join_url ~* '^https?://')
    )
    and jsonb_typeof(join_faq) = 'object'
  ) not valid;

-- ----------------------------------------------------------------------------
-- testimonials — comentarios de clientas y de su equipo
-- ----------------------------------------------------------------------------
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  text text not null,
  type text not null default 'clienta',
  time_selling text,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.testimonials
  drop constraint if exists testimonials_type_check;
alter table public.testimonials
  add constraint testimonials_type_check check (type in ('clienta', 'equipo'));

alter table public.testimonials
  drop constraint if exists testimonials_data_check;
alter table public.testimonials
  add constraint testimonials_data_check
  check (
    char_length(btrim(name)) between 2 and 40
    and char_length(btrim(text)) between 2 and 200
    and (time_selling is null or char_length(time_selling) <= 40)
  ) not valid;

create index if not exists testimonials_type_idx on public.testimonials (type);

alter table public.testimonials enable row level security;

-- Cualquiera lee los testimonios que están marcados como visibles
drop policy if exists "testimonials_select_public" on public.testimonials;
create policy "testimonials_select_public"
  on public.testimonials for select
  to anon, authenticated
  using (visible = true);

-- Solo la admin los crea, edita o borra (y ve los ocultos)
drop policy if exists "testimonials_write_admin" on public.testimonials;
create policy "testimonials_write_admin"
  on public.testimonials for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- leads — personas que dejan sus datos porque quieren ser consultoras
--
-- IMPORTANTE: estos son datos personales (Ley Orgánica de Protección de Datos
-- Personales del Ecuador). Nadie fuera de la cuenta admin puede leerlos.
-- ----------------------------------------------------------------------------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  city text,
  availability text,
  status text not null default 'nueva',
  contacted_at timestamptz,
  consent boolean not null,
  source text,
  created_at timestamptz not null default now()
);

alter table public.leads
  drop constraint if exists leads_consent_check;
alter table public.leads
  -- Sin consentimiento no se guarda nada. Es la base legal del registro.
  add constraint leads_consent_check check (consent = true);

alter table public.leads
  drop constraint if exists leads_status_check;
alter table public.leads
  add constraint leads_status_check
  check (status in ('nueva', 'escrita', 'unida', 'no_interesa'));

alter table public.leads
  drop constraint if exists leads_data_check;
alter table public.leads
  add constraint leads_data_check
  check (
    char_length(btrim(name)) between 2 and 60
    and phone ~ '^593[0-9]{9}$'
    and (city is null or char_length(city) <= 60)
    and (availability is null or availability in ('horas', 'medio_tiempo', 'no_se'))
    and (source is null or source in ('whatsapp', 'facebook', 'volante', 'directo'))
  ) not valid;

create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_created_at_idx on public.leads (created_at desc);

alter table public.leads enable row level security;

-- Nadie puede leer, editar ni borrar salvo la admin.
-- Ojo: NO hay política de insert para anon. Los envíos del formulario entran
-- únicamente por la función submit_lead() de más abajo, que valida primero.
drop policy if exists "leads_admin_all" on public.leads;
create policy "leads_admin_all"
  on public.leads for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- Freno anti-spam
-- Guarda un hash de la conexión, nunca la dirección IP en claro.
-- ----------------------------------------------------------------------------
create table if not exists public.lead_throttle (
  ip_hash text primary key,
  hits smallint not null default 1,
  window_start timestamptz not null default now()
);

alter table public.lead_throttle enable row level security;
-- Sin políticas: nadie la toca directamente, solo submit_lead().

-- ----------------------------------------------------------------------------
-- submit_lead() — la única puerta de entrada del formulario
--
-- security definer: corre con permisos del dueño, así que puede escribir en
-- leads aunque quien llama (anon) no tenga permiso para tocar esa tabla.
-- Nunca devuelve datos de otras personas: solo dice si se pudo o no.
-- ----------------------------------------------------------------------------
create or replace function public.submit_lead(
  p_name text,
  p_phone text,
  p_city text,
  p_availability text,
  p_consent boolean,
  p_source text,
  p_ip_hash text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hits smallint;
begin
  if p_consent is not true then
    return jsonb_build_object('ok', false, 'error', 'consent');
  end if;

  -- Limpia ventanas viejas (más de una hora)
  delete from lead_throttle where window_start < now() - interval '1 hour';

  -- Máximo 5 envíos por hora desde la misma conexión
  select hits into v_hits from lead_throttle where ip_hash = p_ip_hash;
  if v_hits is not null and v_hits >= 5 then
    return jsonb_build_object('ok', false, 'error', 'rate');
  end if;

  -- Un mismo número no se repite en 24 horas (evita el doble toque y el spam)
  if exists (
    select 1 from leads
    where phone = p_phone and created_at > now() - interval '24 hours'
  ) then
    return jsonb_build_object('ok', true, 'duplicate', true);
  end if;

  insert into lead_throttle (ip_hash) values (p_ip_hash)
    on conflict (ip_hash) do update set hits = lead_throttle.hits + 1;

  insert into leads (name, phone, city, availability, consent, source)
  values (
    btrim(p_name),
    p_phone,
    nullif(btrim(coalesce(p_city, '')), ''),
    p_availability,
    true,
    coalesce(p_source, 'directo')
  );

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.submit_lead(text, text, text, text, boolean, text, text) from public;
grant execute on function public.submit_lead(text, text, text, text, boolean, text, text) to anon, authenticated;

-- ============================================================================
-- Fin de la migración 002.
-- ============================================================================
