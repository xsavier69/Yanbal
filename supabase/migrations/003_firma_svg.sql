-- ============================================================================
-- Migración 003 — Permitir SVG en el bucket de fotos (solo para la firma)
--
-- Cómo usar: Supabase -> SQL Editor -> New query -> pega todo -> Run.
-- Se puede correr más de una vez sin problema.
-- ============================================================================

update storage.buckets
set allowed_mime_types = array[
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml'
]
where id = 'product-images';

-- No hace falta tocar las políticas de storage.objects: ya exigen
-- is_admin() para escribir, y esa regla no distingue por tipo de archivo.
