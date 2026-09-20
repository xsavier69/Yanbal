# Mi tienda — Catálogo Yanbal de Amada Ocaña

Tienda-catálogo web para una consultora independiente de productos Yanbal.
Tiene dos partes:

- **Catálogo público (`/`)**: las clientas ven los productos y piden por
  WhatsApp.
- **Panel de administración (`/mi-tienda`)**: Amada sube, edita, marca como
  agotado o borra productos desde su celular.

Prioridad del proyecto: el panel tiene que ser facilísimo de usar para una
persona mayor sin experiencia técnica. Ante cualquier duda técnica, gana la
simplicidad.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres + Storage + Auth)
- Vercel (deploy, plan gratuito)
- `browser-image-compression` para comprimir fotos en el celular antes de
  subirlas
- PWA instalable (manifest + íconos + service worker mínimo)

## 1. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com) (plan gratuito).
2. Ve a **SQL Editor** → **New query**, pega el contenido de
   [`supabase/schema.sql`](./supabase/schema.sql) y dale **Run**.
   - Antes de correrlo, abre el archivo y reemplaza
     `'CAMBIA-ESTO@ejemplo.com'` dentro de la función `is_admin()` por el
     correo real que va a usar Amada para entrar al panel.
3. Ve a **Authentication → Users → Add user** y crea la cuenta de Amada:
   - Correo: el mismo que pusiste en `is_admin()`.
   - Contraseña: la que ella va a usar para entrar a "Mi tienda".
   - Marca la casilla de **Auto Confirm User** para que no necesite
     confirmar por correo.
4. Ve a **Project Settings → API** y copia:
   - **Project URL** → será `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → será `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Variables de entorno

Copia `.env.example` a `.env.local` y completa los valores:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
ADMIN_EMAIL=correo-de-amada@ejemplo.com
NEXT_PUBLIC_SITE_URL=https://mitienda.vercel.app
```

`ADMIN_EMAIL` es informativo para quien mantiene el proyecto: el control de
acceso real ocurre en `supabase/schema.sql` (RLS), así que asegúrate de que
ambos correos coincidan.

## 3. Correr en local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000` para el catálogo y
`http://localhost:3000/mi-tienda` para el panel.

## 4. Desplegar en Vercel

1. Sube este repositorio a GitHub.
2. En [vercel.com](https://vercel.com), **Add New Project** → importa el
   repositorio.
3. En **Environment Variables**, agrega las mismas variables de
   `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `ADMIN_EMAIL`, `NEXT_PUBLIC_SITE_URL` con la URL final que te da Vercel).
4. Dale **Deploy**.
5. Cuando tengas la URL final, actualiza `NEXT_PUBLIC_SITE_URL` con esa URL
   y vuelve a desplegar (para que el link se vea bien al compartirlo por
   WhatsApp).

Después de desplegar, sigue [`GUIA-ABUELITA.md`](./GUIA-ABUELITA.md) para
instalar "Mi tienda" en el celular de Amada.

## Modelo de datos

Ver [`supabase/schema.sql`](./supabase/schema.sql) para el detalle completo
de tablas, políticas de seguridad (RLS) y el bucket de Storage.

- **products**: nombre, precio, precio de oferta (opcional), categoría,
  descripción (opcional), foto, disponible/agotado.
- **settings**: una sola fila con el número de WhatsApp, nombre de la
  tienda, mensaje de bienvenida y los datos de "Sobre mí".

Categorías fijas (no editables desde el panel, para mantenerlo simple):
Fragancias, Maquillaje, Cuidado facial, Cuidado corporal, Joyería, Otros.

## Seguridad

- Lectura pública de `products` y `settings` (cualquiera puede ver el
  catálogo sin iniciar sesión).
- Solo la cuenta autenticada de Amada puede insertar, editar o borrar
  productos y ajustes.
- El bucket `product-images` es de lectura pública y escritura solo para la
  cuenta autenticada.

## Decisiones de diseño

- **Un solo formulario, un solo camino.** No hay menús escondidos ni
  gestos como swipe o mantener presionado: cada acción tiene un botón
  visible con texto.
- **Botones grandes (mínimo 56px) y texto grande (mínimo 18px)** en todo el
  panel, pensado para una persona de 60+ años usando el celular.
- **Categorías como tarjetas, no como lista desplegable**, porque son más
  fáciles de tocar y de entender de un vistazo.
- **Compresión de fotos en el celular** antes de subir (máx. ~1200px,
  ~300 KB) para que la subida sea rápida incluso con internet lenta, sin
  que Amada tenga que hacer nada distinto.
- **Mensajes de error que dicen qué hacer**, no códigos técnicos
  ("Falta el precio del producto" en vez de "Validation error").
- **Sin identidad visual de Yanbal.** El catálogo usa una paleta y
  tipografía propias; solo hay un sello de texto que aclara que es la
  página de una consultora independiente, no el sitio oficial de la marca.
- **RLS simplificado a "solo autenticados pueden escribir".** Como solo
  existe una cuenta admin (la de Amada), la política compara el correo del
  token contra un correo fijo en la función `is_admin()` dentro del SQL,
  evitando depender de configuración extra en la base de datos.

## Limitaciones conocidas

- El carrito de "varios productos en un solo mensaje" no está incluido en
  esta primera versión (quedó marcado como fase 2 en el brief); cada
  producto pide por WhatsApp de forma individual.
- El service worker (`public/sw.js`) da caché básica "red primero, si falla
  usa lo último guardado"; no es una app 100% offline, solo ayuda a que la
  página instalada abra algo si el internet falla un momento.
- Las categorías son fijas en el código (`src/lib/types.ts`) para que Amada
  no tenga que administrar una lista adicional; cambiarlas requiere editar
  el código y el `check` de `supabase/schema.sql`.
- Si en el futuro hay más de una persona administrando la tienda, hay que
  ajustar `is_admin()` en `supabase/schema.sql` para aceptar varios correos.
