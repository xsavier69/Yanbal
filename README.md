# La invitación de [NOMBRE] — página de consultora Yanbal

Página web de una consultora independiente de Yanbal. Tiene tres partes:

| Ruta | Qué es | Para quién |
| --- | --- | --- |
| `/` | **Invitación** para empezar como consultora | Mujeres que buscan un ingreso extra |
| `/productos` | Catálogo con pedidos por WhatsApp | Clientas que quieren comprar |
| `/mi-tienda` | Panel de administración | Solo ella |
| `/privacidad` | Qué pasa con los datos del formulario | Quien deje sus datos |

El trabajo principal de la página es **invitar**. La tienda sigue existiendo,
pero ya no es la portada.

> **Antes de publicar, lee la [nota legal](#nota-legal-léela-antes-de-publicar).**

## Prioridad del proyecto

El panel tiene que ser facilísimo de usar para una persona mayor sin
experiencia técnica. Ante cualquier duda, gana la simplicidad.

---

## Qué falta por llenar

La página funciona con datos vacíos: donde falta algo **se muestra entre
corchetes** (`[TU NOMBRE]`, `[CIUDAD]`) sobre fondo amarillo, y las fotos
aparecen como un recuadro punteado. Así se ve de un vistazo qué queda
pendiente, sin inventar nada.

Todo se llena desde **Mi tienda → Ajustes de mi página**, sin tocar código.

---

## Datos de Amada y catálogo de Yanbal

- **Nombre, ciudad y WhatsApp por defecto** viven en
  [`src/lib/identity.ts`](./src/lib/identity.ts) (Amada Ocaña, Cuenca,
  +593 93 994 7562). Se usan mientras el panel no tenga esos datos llenos, y
  lo que se escriba en **Ajustes** siempre gana. Así el botón flotante de
  WhatsApp **siempre** está, aunque la base de datos esté vacía.
- **Todo lo de "productos" es únicamente el catálogo oficial de Yanbal.**
  "Ver mis productos" (arriba de la portada y en el pie) abre en una pestaña
  nueva el PDF `public/catalogo-yanbal.pdf` (campaña 10). **La tienda propia
  está en pausa:** `/productos` redirige al mismo PDF (`next.config.ts`,
  redirección temporal), y el código de la tienda y del panel de productos
  sigue ahí, sin tocar, para reactivarlo cuando se quiera: basta quitar esa
  redirección y volver a enlazar `/productos`.
- **Cada campaña (~25 días) el catálogo cambia.** Reemplaza
  `public/catalogo-yanbal.pdf` por el nuevo (mismo nombre) y sube el cambio.
  Cada PDF pesa ~13 MB y se queda en el historial de git para siempre.
- El service worker **no guarda el PDF** en el celular de las visitantes.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4
- Supabase (Postgres + Storage + Auth)
- Vercel (deploy, plan gratuito)
- Tipografías: Instrument Serif y Albert Sans (invitación), Atkinson
  Hyperlegible Next (panel), cargadas con `next/font/google`
- `browser-image-compression` para comprimir fotos en el celular
- `qrcode-generator` para el código QR del volante
- PWA instalable (manifest + íconos + service worker mínimo)

## 1. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com) (plan gratuito).
2. **SQL Editor → New query**, y corre **en este orden**:
   1. [`supabase/schema.sql`](./supabase/schema.sql)
   2. [`supabase/migrations/001_campana_y_secciones.sql`](./supabase/migrations/001_campana_y_secciones.sql)
   3. [`supabase/migrations/002_incorporacion.sql`](./supabase/migrations/002_incorporacion.sql)
   - Antes de correr `schema.sql`, reemplaza `'CAMBIA-ESTO@ejemplo.com'`
     dentro de `is_admin()` por el correo real de ella.
   - Los tres archivos se pueden volver a correr cuando cambien: no borran
     productos, ajustes ni personas interesadas.
   - Para no subir el correo a git, guarda tu copia como
     `supabase/schema.local.sql` (git la ignora).
3. **Authentication → Users → Add user**: crea su cuenta con **Auto Confirm
   User** marcado.
4. **Authentication → Sign In / Providers**: desactiva
   *Allow new users to sign up*, para que nadie más pueda crear cuentas.
5. **Project Settings → API**: copia el *Project URL* y la llave
   *anon public* (o *publishable*).

## 2. Variables de entorno

Copia `.env.example` a `.env.local` y complétalo. Están explicadas ahí mismo.

`ADMIN_EMAIL` hace dos cosas: es la cuenta que las reglas de la base
reconocen como dueña, y el panel solo se muestra a esa cuenta.

## 3. Correr en local

```bash
npm install
npm run dev
```

Sin llaves de Supabase la página arranca igual, en **modo demostración** con
datos de ejemplo.

## 4. Desplegar en Vercel

1. Sube el repositorio a GitHub.
2. En [vercel.com](https://vercel.com), **Add New → Project** e importa el
   repositorio.
3. Agrega las variables de entorno. **`NEXT_PUBLIC_SITE_URL` debe guardarse
   como `Config`, no como `Secret`**: Vercel no deja convertir un Secret
   después, y habría que borrarlo y volver a crearlo.
4. **Deploy**. Cuando tengas la URL final, ponla en `NEXT_PUBLIC_SITE_URL` y
   vuelve a desplegar.

Cada `git push` a la rama principal se despliega solo.

---

## Modelo de datos

Ver [`supabase/schema.sql`](./supabase/schema.sql) y las migraciones.

- **products** — nombre, precio, oferta, categoría, descripción, foto,
  disponible.
- **settings** — una sola fila con todo lo que ella edita: datos de la tienda,
  campaña, "cómo comprar", y los textos y fotos de la invitación.
  `sections_visible` (jsonb) guarda el interruptor de cada sección.
- **testimonials** — `type` distingue `'clienta'` (catálogo) de `'equipo'`
  (invitación).
- **leads** — personas interesadas en ser consultoras. Datos personales: ver
  [Privacidad](#privacidad-y-datos-personales).
- **lead_throttle** — freno anti-spam. Guarda un hash, nunca una IP.

Categorías fijas en el código (`src/lib/types.ts`), para que ella no tenga que
administrar una lista más.

---

## Seguridad

- Lectura pública de `products`, `settings` y los `testimonials` visibles.
- Solo la cuenta de ella (`is_admin()`) escribe productos, ajustes y
  testimonios.
- **`leads` no tiene política de lectura pública ni de inserción pública.** La
  única puerta de entrada es la función `submit_lead()`, que valida el
  consentimiento y aplica el freno anti-spam antes de escribir. Nadie puede
  listar las personas interesadas desde fuera del panel.
- El bucket `product-images` es de lectura pública y escritura solo para
  `is_admin()`; acepta JPG, PNG y WebP de hasta 3 MB.
- La base valida largos de texto y precios (`*_data_check`), además de la
  validación de la app.
- Encabezados de seguridad en `next.config.ts`; el panel se sirve con
  `Cache-Control: private, no-store`.
- El service worker solo guarda en caché el catálogo público; nunca
  `/mi-tienda` ni las llamadas a Supabase.

### Anti-spam del formulario

Sin captchas visuales, porque serían una barrera para el público al que va
dirigida la página. En su lugar, tres señales baratas:

1. **Campo trampa** (honeypot) que una persona nunca ve.
2. **Tiempo mínimo**: un envío en menos de 3 segundos es un robot.
3. **Freno por conexión y por número**: 5 envíos por hora, y un mismo número
   no se repite en 24 horas.

A los robots se les responde "ok" para que no aprendan qué los delató.

**Limitación conocida:** el freno usa un hash de la conexión, y quien insista
puede rotarlo. Para el tamaño de esta página es proporcionado; si algún día
llega spam en serio, hay que meter el envío detrás de una llave de servidor.

---

## Privacidad y datos personales

El formulario recoge datos personales, así que aplica la **Ley Orgánica de
Protección de Datos Personales del Ecuador**:

- **Consentimiento obligatorio**, sin casilla premarcada. La base rechaza
  cualquier registro con `consent = false`.
- **No se pide cédula, correo ni datos de pago.** Eso va solo en el registro
  oficial de Yanbal.
- **No se guarda la dirección IP.** Para el freno anti-spam se usa un hash con
  sal (`LEAD_SALT`), que no permite volver a la IP original.
- **El correo de aviso no lleva el teléfono**, solo el nombre y la ciudad. El
  detalle se ve dentro del panel, que está protegido.
- **Botón de borrado** en cada persona del panel, para cumplir de inmediato si
  alguien pide que borren sus datos.
- [`/privacidad`](./src/app/privacidad/page.tsx) lo explica en lenguaje
  sencillo.

---

## Decisiones de diseño

### Sistema visual — "Catálogo Yanbal"

La página se parece al catálogo oficial de Yanbal, no a una plantilla. Los
colores no se inventaron: se midieron del PDF de la campaña 10.

| Token | Hex | Uso | Contraste |
| --- | --- | --- | --- |
| Coral Yanbal | `#F2683B` | Botones, etiquetas y bloques de color (41% de la superficie del catálogo) | tinta encima: 5,3:1 (AA) |
| Tinta | `#231F20` | Texto, pie, filetes de contraste (el negro cálido del catálogo) | 16:1 sobre blanco |
| Coral oscuro | `#BF4318` | Enlaces y texto de acento; relleno con letra blanca | 5,2:1 sobre blanco |
| Durazno | `#FABEAC` | Fondo del hueco de foto | tinta encima: 10:1 |
| Durazno suave | `#FEF1EC` | Bandas de respiro entre secciones | tinta encima: 14,8:1 |
| Carmesí | `#AE294C` | Errores | 6,5:1 sobre blanco |

- **El coral `#F2683B` no sirve como texto sobre blanco** (3,1:1). Por eso el
  texto de botones y etiquetas coral va en tinta negra, y para enlaces y
  texto de acento existe el coral oscuro.
- Sin degradados, sin sombras, sin píldoras: botones rectos de 4px de radio,
  etiquetas rectangulares como las del catálogo ("OFERTA TOP"), filetes finos.
- **Cada título lleva una barrita coral encima**, como las etiquetas del
  catálogo: la marca aparece sin un adorno más grande.
- Los nombres de variable heredados (`--color-blue`, `--color-sky`,
  `--color-midnight`, `--color-gold`…) se mantuvieron aunque su valor cambió
  por completo: Tailwind v4 genera clases (`text-blue`, `bg-sky`…) a partir de
  ese nombre y ya estaban en uso. Renombrarlas sin tocar cada componente
  haría que cayeran, en silencio, en los colores por defecto de Tailwind.
- El blanco y el coral no se mezclan con texto fino: en bandas oscuras o
  coral, los enlaces y el foco del teclado cambian de color (`.on-midnight`,
  `.on-coral`) para seguir viéndose.

### El logo

El logotipo de Yanbal (vectorial, extraído del catálogo oficial) aparece
**pequeño y de apoyo**: arriba a la izquierda (15px) y en el pie, en blanco
(18px). Nunca como protagonista. Vive en `src/lib/yanbalLogo.ts`. Ver la nota
legal al final: hay que confirmar con su directora el uso de la marca.

### Tipografía

- **Instrument Serif** para los titulares: elegante, de un solo peso, en el
  espíritu de la serif del catálogo (Ogg). La jerarquía sale del tamaño.
- **Albert Sans** para el texto: grotesca geométrica, hermana de Maison Neue
  (la del catálogo, que es de pago).
- **Atkinson Hyperlegible Next** se mantiene en el panel completo (incluido el
  login): es la que mejor se lee para ella. El panel vive dentro de una zona
  `.panel-scope`.
- Detalle de CSS que costó encontrar: una variable CSS solo cae hacia los
  descendientes, nunca hacia arriba. `<body>` fija su fuente leyendo la
  variable en su propio nivel; un `<div class="panel-scope">` más abajo que
  solo *redefine la variable* no la cambia. Por eso `.panel-scope` declara su
  propia `font-family`.

### Portada

- **En el celular la foto es pequeña** (32% del ancho) y va junto a quién es
  ella, para que el titular, el texto y los botones se vean sin bajar. Antes
  ocupaba todo el ancho. En escritorio pasa a una columna propia, grande, a la
  derecha, sobre un bloque coral desplazado (el gesto de las fotos del
  catálogo).
- **"Ver mis productos" es un botón coral** en la barra de arriba, junto al
  logo, y lleva al catálogo oficial en PDF.
- **No hay firma.** Se quitó por completo (componentes, campo del panel,
  imagen de compartir y la migración que habilitaba SVG).

### Estructura

- Una columna de lectura de 62 caracteres; la portada usa una retícula propia
  de dos columnas en escritorio.
- **Numeración solo en "Cómo empiezas"**, porque es la única secuencia real.
- Cierre en un bloque coral, como la franja final del catálogo, y pie en
  negro cálido con el logo.

### Fotografía

Las fotos de producto y el retrato se muestran sobre un fondo durazno suave,
con la misma proporción 4:5. "Quitar el fondo" (`@imgly/background-removal`)
no se construyó: el costo en un celular con internet lenta no compensaba.

### Movimiento

Curva `--ease-out` en todo; nunca `ease-in` ni `transition: all`. Los botones
se hunden 2% al presionar. Los enlaces refuerzan su subrayado con el mouse
(solo con puntero). Las confirmaciones del panel entran desde abajo. Nada se
anima al hacer scroll y no hay animaciones que arranquen solas. Lo que ella
toca muchas veces al día (disponible/agotado, estado de una persona) no se
anima.

### Un detalle técnico que muerde

Las utilidades de Tailwind v4 viven en una **capa de menor prioridad** que las
clases propias de `globals.css`. Por eso `pt-0` no le gana a `.page-section`,
y los ajustes de espaciado se hacen con modificadores propios (`.is-tight`,
`.is-flush`) y no con utilidades.

### El panel (modo Operate)

Misma paleta, pero la claridad manda: campos con caja completa, Atkinson,
botones de 56px, sin adornos. Ningún flujo cambió.

---

## Reglas de honestidad (no las rompas)

Están metidas en el código, no solo en esta documentación:

- **Ninguna cifra de ingresos inventada.** Los beneficios salen de lo que ella
  escriba, y si escribe números **el panel le exige la fuente** antes de
  guardar.
- **El aviso siempre visible**, nunca dentro de un desplegable: *"Lo que ganes
  depende de tus ventas y del tiempo que le dediques. No es un ingreso fijo ni
  garantizado."*
- **Sin urgencia falsa** ni promesas de "ingreso pasivo".
- **Solo testimonios reales**, con permiso de la persona.
- **Una fecha de campaña vencida nunca se muestra**: la banda cambia sola a un
  aviso suave.
- Se mantiene el sello **"Página de consultora independiente Yanbal"**. El
  logo de Yanbal aparece solo como apoyo, pequeño (ver nota legal).
- La pregunta *"¿Es oficial de Yanbal?"* **siempre se muestra**, aunque ella
  deje la respuesta vacía, con un texto base que aclara que esta página no es
  de la empresa.

---

## Lo que NO se construyó, y por qué

- **Carrito con pago en línea.** El pedido se cierra por WhatsApp, como en
  toda la venta directa. Un checkout con pagos agrega obligaciones que ella no
  puede sostener.
- **Filtros por ingredientes, familia olfativa o tipo de piel.** Los usa el
  sitio oficial de Yanbal, que tiene ficha técnica por producto. Ella tendría
  que llenar cinco campos más por producto. No compensa.
- **Blog, tutoriales o contenido.** Requiere mantenimiento constante.
- **Fotos del catálogo oficial de Yanbal.** Solo fotos propias de ella.

> **Cambio respecto a la versión anterior:** el README anterior excluía la
> sección *"Únete a mi equipo"* porque la incorporación tiene reglas propias y
> formularios oficiales de Yanbal. Esa decisión se revirtió: invitar es ahora
> el trabajo principal de la página. El registro sigue haciéndose en el
> sistema oficial de Yanbal; esta página solo recoge el contacto y explica el
> camino.

---

## Limitaciones conocidas

- **El correo de aviso necesita una cuenta de Resend** con dominio verificado.
  Sin `RESEND_API_KEY`, `NOTIFY_EMAIL` y `NOTIFY_FROM` no se envía nada, y el
  registro se guarda igual.
- **Quien ya tenga el enlace antiguo llega ahora a la invitación**, no a la
  tienda. Es lo buscado, pero conviene saberlo. Arriba hay un enlace discreto
  a `/productos`.
- El service worker da caché básica solo del catálogo público. El panel
  necesita internet.
- El número de WhatsApp se guarda como ella lo escribe (`0991234567`) y la app
  lo convierte a formato internacional para los enlaces.
- El formulario solo acepta **celulares de Ecuador** (`09XXXXXXXX`).
- "Historias de mi equipo" se oculta con menos de 2 testimonios, así que al
  principio no se verá.
- El carrito de varios productos en un solo mensaje sigue sin construirse.
- Las subcategorías, las variantes por tono y los destacados ("Mis
  recomendados") quedaron fuera de esta entrega.
- **La calidad final depende de la foto que ella suba.** El fondo durazno y
  el bloque coral ayudan, pero no arreglan una foto oscura o movida. La guía
  ("Cómo tomar fotos bonitas de mis productos") existe por eso.
- **"Quitar el fondo" no se construyó** (ver la sección de Fotografía en
  Decisiones de diseño): el costo de rendimiento en un celular con internet
  lenta no compensaba para esta entrega.
- **Lighthouse sí corrió en este entorno**, contra una compilación de
  producción real (`next start`), en modo móvil, dos veces (servidor en
  frío y ya caliente): Accesibilidad 96, Buenas prácticas 100, SEO 100 en
  ambas corridas. `CLS: 0`, exactamente lo que buscaba el `aspect-ratio`
  fijo de cada foto. El de Rendimiento salió 57 las dos veces, con un
  tiempo de bloqueo alto (0,9–1,1s): no es la base de datos despertando
  (eso solo afectó la primera respuesta del servidor, no el resultado
  general), sino que Lighthouse simula un celular con el CPU 4 veces más
  lento sobre una máquina de este entorno que ya tiene poco CPU disponible.
  No es representativo de un teléfono real contra el CDN de Vercel; hay que
  repetirlo una vez desplegado, desde el propio Chrome (F12 → Lighthouse) o
  desde PageSpeed Insights.

---

## Nota legal: léela antes de publicar

Antes de que esta página se comparta con nadie, **[NOMBRE] tiene que confirmar
con su directora**:

1. **Si Yanbal permite páginas propias de reclutamiento.** Las empresas de
   venta directa suelen tener reglas sobre el uso de su marca y sobre quién
   puede invitar. Esto es lo más importante de esta lista.
2. **Cómo se registra en MAYA a una persona que ella invita**, para que se le
   reconozca la incorporación. Si no, puede perder el crédito de su propio
   trabajo.
3. **Qué datos de beneficios puede publicar** y con qué fuente.
4. **Si Yanbal da crédito para el kit**, antes de marcar esa casilla.
5. **Si puede ofrecer el catálogo oficial en PDF desde su propia página.**
   Hoy el PDF viaja con el sitio (`public/catalogo-yanbal.pdf`). Si Yanbal
   prefiere que no se aloje una copia, hay que cambiar el enlace por el del
   catálogo digital oficial (`CATALOG_PDF_PATH` en `src/lib/identity.ts`).

6. **Si puede usar el logo de Yanbal en su página.** Aparece pequeño, arriba
   y en el pie (`src/lib/yanbalLogo.ts`). Si no se permite, se quita
   borrando los dos `<YanbalLogo />`; el resto no depende de él. Los colores
   y la composición del catálogo son de la marca; las fotos y los textos
   deben ser suyos.

Además: la página no recoge cédula, correo ni datos de pago, y el sello de
"consultora independiente" aparece en la portada y en el pie.
