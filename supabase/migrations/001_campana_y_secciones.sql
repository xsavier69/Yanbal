-- ============================================================================
-- Migración 001 — Campaña, "Cómo comprar" e interruptores de secciones
--
-- Cómo usar: Supabase -> SQL Editor -> New query -> pega todo -> Run.
-- Se puede correr más de una vez sin problema (no borra nada).
-- Requiere haber corrido antes supabase/schema.sql.
-- ============================================================================

alter table public.settings
  add column if not exists campaign_number smallint,
  add column if not exists campaign_end_date date,
  add column if not exists official_catalog_url text,
  add column if not exists payment_methods text,
  add column if not exists delivery_info text,
  -- Un interruptor por sección: {"campaign": false} oculta esa sección.
  -- Si una sección no aparece aquí, se considera visible.
  add column if not exists sections_visible jsonb not null default '{}'::jsonb;

-- "not valid" = revisa filas nuevas o editadas; no falla por datos viejos.
alter table public.settings
  drop constraint if exists settings_campaign_check;
alter table public.settings
  add constraint settings_campaign_check
  check (
    (campaign_number is null or campaign_number between 1 and 99)
    and (
      official_catalog_url is null
      or (
        char_length(official_catalog_url) <= 300
        and official_catalog_url ~* '^https?://'
      )
    )
    and (payment_methods is null or char_length(payment_methods) <= 120)
    and (delivery_info is null or char_length(delivery_info) <= 160)
    and jsonb_typeof(sections_visible) = 'object'
  ) not valid;

-- Las políticas RLS de settings (lectura pública, escritura solo is_admin)
-- ya cubren las columnas nuevas: no hace falta tocarlas.
