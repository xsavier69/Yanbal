-- ============================================================================
-- Migración 002 — Página de invitación y testimonios
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

-- Nota: esta página ya no recoge datos personales (no hay tabla de personas
-- interesadas). Quien quiere más información escribe por WhatsApp.
-- Si en algún momento corriste una versión anterior de esta migración, puedes
-- borrar lo que sobra con:
--   drop function if exists public.submit_lead(text, text, text, text, boolean, text, text);
--   drop table if exists public.lead_throttle;
--   drop table if exists public.leads;

-- ============================================================================
-- Fin de la migración 002.
-- ============================================================================
