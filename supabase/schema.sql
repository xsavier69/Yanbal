-- ============================================================================
-- Yanbal Store - Amada Ocaña
-- Esquema de base de datos para Supabase (Postgres + Storage + Auth)
--
-- Cómo usar:
--   1. Entra al panel de tu proyecto en https://supabase.com
--   2. Ve a "SQL Editor" -> "New query"
--   3. Pega todo este archivo y dale "Run"
--   4. Crea la usuaria admin en Authentication -> Users -> Add user,
--      usando el mismo correo que pondrás en la variable ADMIN_EMAIL.
-- ============================================================================

-- Extensión necesaria para generar uuid (gen_random_uuid)
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Tabla: products
-- ----------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(10, 2) not null,
  offer_price numeric(10, 2),
  category text not null,
  description text,
  image_url text,
  available boolean not null default true,
  created_at timestamptz not null default now()
);

-- Categorías fijas permitidas (se valida también en el código de la app)
alter table public.products
  drop constraint if exists products_category_check;
alter table public.products
  add constraint products_category_check
  check (category in (
    'Fragancias',
    'Maquillaje',
    'Cuidado facial',
    'Cuidado corporal',
    'Joyería',
    'Otros'
  ));

-- Validación de datos también en la base (por si algo se salta la app).
-- "not valid" = solo revisa filas nuevas o editadas; no falla por datos viejos.
alter table public.products
  drop constraint if exists products_data_check;
alter table public.products
  add constraint products_data_check
  check (
    char_length(btrim(name)) between 1 and 80
    and price > 0 and price <= 9999.99
    and (offer_price is null or (offer_price > 0 and offer_price < price))
    and (description is null or char_length(description) <= 500)
  ) not valid;

create index if not exists products_available_idx on public.products (available);
create index if not exists products_category_idx on public.products (category);
create index if not exists products_created_at_idx on public.products (created_at desc);

-- ----------------------------------------------------------------------------
-- Tabla: settings (una sola fila con id = 1)
-- ----------------------------------------------------------------------------
create table if not exists public.settings (
  id integer primary key default 1,
  whatsapp_number text,
  store_name text,
  welcome_message text,
  about_text text,
  about_photo_url text,
  delivery_area text,
  business_hours text,
  constraint settings_singleton check (id = 1)
);

alter table public.settings
  drop constraint if exists settings_data_check;
alter table public.settings
  add constraint settings_data_check
  check (
    (store_name is null or char_length(store_name) <= 60)
    and (welcome_message is null or char_length(welcome_message) <= 200)
    and (about_text is null or char_length(about_text) <= 300)
    and (delivery_area is null or char_length(delivery_area) <= 80)
    and (business_hours is null or char_length(business_hours) <= 80)
    and (whatsapp_number is null or char_length(whatsapp_number) <= 20)
  ) not valid;

-- Crea la única fila de configuración si no existe todavía
insert into public.settings (id)
values (1)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.products enable row level security;
alter table public.settings enable row level security;

-- Lectura pública (cualquiera puede ver el catálogo, sin iniciar sesión)
drop policy if exists "products_select_public" on public.products;
create policy "products_select_public"
  on public.products for select
  to anon, authenticated
  using (true);

drop policy if exists "settings_select_public" on public.settings;
create policy "settings_select_public"
  on public.settings for select
  to anon, authenticated
  using (true);

-- Escritura solo para la persona autenticada cuyo correo coincide con el
-- correo admin. IMPORTANTE: reemplaza el correo de abajo por el mismo que
-- vas a usar en ADMIN_EMAIL y en la cuenta de Supabase Auth de Amada.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    lower(auth.jwt() ->> 'email') = lower('CAMBIA-ESTO@ejemplo.com'),
    false
  );
$$;

drop policy if exists "products_write_admin" on public.products;
create policy "products_write_admin"
  on public.products for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "settings_write_admin" on public.settings;
create policy "settings_write_admin"
  on public.settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- Storage: bucket de fotos de productos y de "sobre mí"
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Solo fotos, y de tamaño razonable (la app ya las comprime a ~300 KB)
update storage.buckets
set file_size_limit = 3145728,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'product-images';

-- Lectura pública de las fotos
drop policy if exists "product_images_read_public" on storage.objects;
create policy "product_images_read_public"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

-- Solo Amada (is_admin) puede subir, reemplazar o borrar fotos
drop policy if exists "product_images_write_admin" on storage.objects;
create policy "product_images_write_admin"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product_images_update_admin" on storage.objects;
create policy "product_images_update_admin"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product_images_delete_admin" on storage.objects;
create policy "product_images_delete_admin"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

-- ============================================================================
-- Fin del esquema.
-- Siguiente paso: en Authentication -> Users, crea la cuenta de Amada con su
-- correo y una contraseña, y pon ese mismo correo en ADMIN_EMAIL (.env).
-- ============================================================================
