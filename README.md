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

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4
- Supabase (Postgres + Storage + Auth)
- Vercel (deploy, plan gratuito)
- Tipografías: Newsreader e Instrument Sans (invitación y catálogo),
  Atkinson Hyperlegible Next (panel), cargadas con `next/font/google`
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

Ver también [`.claude/impeccable/PRODUCT.md`](.claude/impeccable/PRODUCT.md)
y [`.claude/impeccable/DESIGN.md`](.claude/impeccable/DESIGN.md): el plan de
diseño completo, con los wireframes y las decisiones que se pidió revisar
antes de construir.

### Sistema visual — "Estuche de joyería"

La página se siente como abrir un estuche: fondo sereno, una pieza
protagonista bien iluminada (ella, o el producto) y detalles finos en
dorado champán. El dorado marca exactamente dos cosas en toda la página: su
firma y el marco de su retrato. Nada más lo usa.

| Token | Hex | Uso | Contraste verificado |
| --- | --- | --- | --- |
| Tinta | `#1A1F2B` | Texto principal | 15,4:1 sobre porcelana (AAA) |
| Porcelana | `#F6F7F9` | Fondo base | — |
| Medianoche | `#14213D` | Portada, pie de página, bandas de énfasis | — |
| Dome (azul) | `#1F4E8C` | Botones y enlaces | 7,8:1 sobre porcelana (AAA) |
| Champán | `#B8955C` | **Solo decorativo, solo sobre medianoche** | 5,7:1 sobre medianoche |
| Champán texto | `#86662F` | Texto dorado, solo sobre fondo claro | 5,0:1 sobre porcelana (AA) |

Inspirada en las cúpulas azules de la Catedral de Cuenca (el "dome") y en el
dorado de la bisutería. Se evitó a propósito el crema con terracota, el
fondo casi negro con un acento ácido y el estilo "periódico" de radio cero
en todo: son los tres patrones que un generador de diseño produce por
defecto, y ninguno encajaba con este encargo.

- **El champán se usa solo donde está su mano**: la firma y el filete que
  enmarca su retrato. En ningún otro sitio. Así el dorado significa algo.
- **El champán decorativo no pasa el contraste AA sobre fondo claro**
  (2,6:1 sobre porcelana) — por eso existe el token *champán texto*, un
  tono más oscuro, y por eso el decorativo nunca lleva texto encima ni
  aparece fuera de una banda medianoche. Es el mismo error de la paleta
  anterior (un dorado que fallaba sobre un fondo claro), corregido esta
  vez separando los dos usos en dos tokens desde el principio.
- **El azul "dome" casi desaparece sobre medianoche** (1,9:1). Dentro de
  cualquier banda oscura (portada, pie, cierre), los enlaces y el foco del
  teclado cambian a porcelana/dorado en vez de azul — si no, un enlace del
  pie de página sería casi invisible. Es la regla `.on-midnight` del CSS.
- **La línea decorativa (`--color-line`, heredada como "mist") no sirve de
  borde de campo**: da 1,16:1, prácticamente invisible. El borde en reposo
  de un campo usa un tono más oscuro (`--color-line-strong`, 3,23:1), que sí
  llega al mínimo de 3:1 que pide WCAG para el borde de un componente.
- Los nombres de variable heredados de la versión anterior (`--color-sky`,
  `--color-line-strong`, `--color-gold`…) se mantuvieron a propósito aunque
  su valor y su sentido cambiaron por completo: Tailwind v4 genera clases
  (`bg-sky`, `border-line`, `text-gold`…) a partir de ese nombre, y ya
  estaban en uso en varios componentes. Renombrar la variable sin tocar cada
  componente haría que esas clases cayeran, en silencio, en el azul "sky"
  que trae Tailwind por defecto.

### Tipografía

- **Newsreader**, con eje óptico variable, para los titulares. Un titular
  grande y uno pequeño usan la misma fuente, pero el navegador ajusta el
  trazo automáticamente según el tamaño (`font-optical-sizing: auto`).
- **Instrument Sans** para el texto de la invitación y el catálogo.
- **Atkinson Hyperlegible Next** se mantiene en el panel: sigue siendo la
  que mejor se lee para ella. El panel entero (incluido el login) vive
  dentro de una zona `.panel-scope` que fuerza esta tipografía sin importar
  dónde aparezca el componente en el árbol.
- Escala 1.25: `16 / 18 / 22 / 28 / 35 / 44 / 56px`. El titular de portada
  usa `clamp(44px, 8vw, 72px)`.
- **Detalle real de CSS que costó encontrar:** una variable CSS solo cae
  hacia los elementos de más abajo en el árbol, nunca hacia arriba. El
  `<body>` fija su tipografía leyendo la variable en su propio nivel; un
  `<div class="panel-scope">` más abajo que solo *redefine la variable* no
  cambia lo que `<body>` ya decidió. Por eso `.panel-scope` no solo redefine
  la variable, sino que declara su propia `font-family`: así el texto
  corriente (el que no tiene su propia regla de fuente, como un párrafo o un
  campo) la recibe por herencia normal.

### El elemento memorable: la firma real

Se dibuja con un SVG real, trazo por trazo (`stroke-dashoffset`, 1400ms,
`cubic-bezier(0.77, 0, 0.175, 1)`, 300ms de espera). Es la única animación
que arranca sola en toda la página, y respeta `prefers-reduced-motion` (con
movimiento reducido, aparece completa, sin animar). Se repite, ya dibujada y
más pequeña, en el cierre de la página.

- **Solo funciona como trazo real si el archivo es un `.svg` vectorizado
  por línea central.** Si sube una foto o un PNG, se degrada sola a una
  revelación por máscara (de izquierda a derecha), la misma técnica de la
  versión anterior: una firma fotografiada no tiene un trazo continuo que
  animar.
- **El bucket de fotos ahora acepta SVG**, pero solo en el campo de la
  firma (migración `003_firma_svg.sql`). Cualquier otro campo de foto
  (retrato, productos) rechaza un SVG con un mensaje claro: un vector no
  tiene sentido en una foto de producto, y complica el recorte y la
  compresión.
- **El SVG que sube se sanea antes de insertarse en la página**
  (`src/lib/sanitizeSvg.ts`): solo se conservan etiquetas de dibujo (path,
  line, polígonos…) y atributos de presentación, nunca `<script>` ni
  manejadores `on*`. Solo la cuenta admin puede subir una firma, pero un
  SVG puede llevar código, y esta página lo inserta directo en el DOM
  (`dangerouslySetInnerHTML`) para poder animar cada trazo por separado.

### Fotografía

- **El "platillo":** toda foto de producto se muestra sobre el mismo fondo
  (`--color-sky`, un tono apenas más oscuro que la porcelana), en la misma
  proporción 4:5, sin recortar (`object-fit: contain`). Fotos de calidad
  distinta se leen como una sola colección.
- **El retrato de portada** va sin radio, con un filete de 1px en champán
  desplazado 12px del borde (un marco de galería), verificado a 425×532px
  en escritorio dentro de una caja de 449×556px. En el celular, en cambio,
  sangra al borde de la pantalla: es la única ruptura deliberada del margen
  de página en todo el sitio, y siempre es ella.
- **"Quitar el fondo" (`@imgly/background-removal`) no se construyó en esta
  entrega.** Ese paquete descarga un modelo de decenas de MB y corre
  inferencia en el celular: choca de frente con el objetivo de LCP < 2s en
  4G y con todo lo que el proyecto ya hace para ser liviano en un teléfono
  viejo. Queda como mejora aparte, bien acotada (botón opcional, nada se
  descarga hasta que ella lo toca), para cuando el resto esté validado.
- **Sin LQIP (miniatura difuminada) real.** El `aspect-ratio` fijo de cada
  foto ya garantiza cero salto de layout (CLS = 0), que es el objetivo de
  rendimiento real. Un blur de verdad necesitaría generarse al subir la
  foto (con una librería de servidor que Supabase no ofrece gratis) y
  guardarse en la base; no compensaba bloquear el resto de la entrega por
  eso.

### Estructura

- Una columna en móvil, ancho de lectura de 62 caracteres. Solo la portada
  usa una retícula propia de **12 columnas** en escritorio: el retrato en
  las columnas 1 a 5, el texto en las columnas 7 a 12, y la columna 6 como
  respiro — nunca 50/50. El resto de la página vuelve a una columna
  centrada.
- **Numeración solo en "Cómo empiezas"**, porque es la única secuencia real.
- Sin tarjetas idénticas con sombra, sin etiquetas en mayúsculas sobre los
  títulos, sin una palabra en color dentro de un titular.
- El precio de oferta va en tinta, no en azul ni en rojo; el precio anterior
  se tacha en gris, a 70% del tamaño. La insignia "Nuevo" es texto con
  filete, nunca una pastilla de color rellena (a diferencia de "Agotado" y
  el porcentaje de descuento, que sí son señales de estado y se quedan como
  pastillas).
- Cada página termina en una banda de medianoche (`.site-footer`): es el
  gesto de "cerrar el estuche" que se repite igual en la invitación y en el
  catálogo.

### Movimiento

Las mismas curvas en todo el sitio: `--ease-out` para lo que aparece,
`--ease-in-out` para la firma. Nunca `ease-in`, nunca `transition: all`.
Los botones se hunden 3% al presionarlos (120ms). Los enlaces de texto
revelan un subrayado que crece desde la izquierda, solo en dispositivos con
puntero (`@media (hover: hover)`), para no dejar un rastro visual pegado en
el dedo de quien usa el celular. Las confirmaciones del panel entran desde
abajo. Nada se anima al hacer scroll, no hay carrusel automático. Cambiar
"disponible/agotado" o el estado de una persona interesada — lo que ella
toca muchas veces al día — sigue sin ninguna animación.

### Un detalle técnico que muerde

Las utilidades de Tailwind v4 viven en una **capa de menor prioridad** que las
clases propias de `globals.css`. Por eso `pt-0` no le gana a `.page-section`, y
los ajustes de espaciado de secciones se hacen con modificadores propios
(`.is-tight`, `.is-flush`, `.is-hero`) y no con utilidades.

### El panel (modo Operate)

Misma paleta base, pero la claridad manda: sin firma animada, sin filete
decorativo, sin retrato con marco, sin retícula asimétrica. El panel se ve
de la misma familia, no de la misma audacia.

- **La pantalla principal casi no cambia**: sigue siendo "＋ Agregar producto"
  y la lista de productos. Eso es el 95% de lo que ella hace.
- Cuando hay personas nuevas, aparece **arriba de todo** una tarjeta grande:
  "Tienes 3 personas nuevas interesadas".
- Todo lo demás vive detrás de un botón al fondo: **"Ajustes de mi página"**,
  con secciones plegadas, **una sola abierta a la vez** y **un botón Guardar
  por sección**. Nada se guarda solo.
- Cada sección tiene su interruptor "Mostrar en mi página", con texto
  explícito: *"Esta sección se ve en tu página"* / *"Esta sección está
  oculta"*.
- Si escribe algo y abre otra sección, el título muestra "· sin guardar".
- Los estados de una persona interesada son **botones grandes**, no un menú
  desplegable.
- Botones de 48px o más; los principales, de 56px.

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
- Se mantiene el sello **"Página de consultora independiente Yanbal"**, sin
  logo ni tipografía oficial de la marca.
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
- **La calidad final del "estuche" depende de las fotos que ella suba.** El
  platillo uniforme y el marco del retrato ayudan a que fotos de celular se
  vean como una colección, pero no arreglan una foto oscura o movida. La
  guía nueva ("Cómo tomar fotos bonitas de mis productos") existe por eso.
- **"Quitar el fondo" no se construyó** (ver la sección de Fotografía en
  Decisiones de diseño): el costo de rendimiento en un celular con internet
  lenta no compensaba para esta entrega.
- La firma se anima como trazo real solo con un archivo `.svg` vectorizado
  por línea central. Con una foto o un PNG se ve bien igual, pero como
  revelación, no como trazo.
- Este proyecto no tiene Chrome instalado en el entorno de compilación, así
  que Lighthouse no se pudo correr aquí; los números de rendimiento hay que
  sacarlos una vez desplegado, desde el propio Chrome (F12 → Lighthouse).

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

Además: la página no lleva logo ni tipografía oficial de Yanbal, no recoge
cédula, correo ni datos de pago, y el sello de "consultora independiente"
aparece en la portada y en el pie. Las fotos y textos deben ser suyos.
