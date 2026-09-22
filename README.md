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

### Sistema visual

Concepto: **"la invitación de [NOMBRE]"**. La página debe sentirse como una
invitación personal, no como una landing de multinivel.

| Token | Hex | Uso | Contraste verificado |
| --- | --- | --- | --- |
| Tinta | `#1B2433` | Texto principal | 15,6:1 blanco |
| Azul cúpula | `#1F4E8C` | Titulares, botones, enlaces | 8,3:1 blanco · 7,0:1 celeste |
| Celeste mayólica | `#E3ECF7` | Fondo de secciones alternas | — |
| Oro joya | `#9A6F1E` | **Solo decorativo** | 4,50:1 blanco · **3,77:1 celeste** |
| Oro texto | `#7A5716` | Cuando el oro debe llevar texto | 6,6:1 blanco · 5,5:1 celeste |

Inspirada en las cúpulas azules de la Catedral de Cuenca y el dorado de la
bisutería. Se evitó a propósito el crema con terracota, los degradados y el
rosa genérico de "belleza".

- **El oro se usa solo donde está su mano**: la firma y la línea fina que va
  debajo. En ningún otro sitio. Así el dorado significa algo.
- **El oro joya no pasa el contraste AA sobre el celeste** (3,77:1), y el
  celeste es fondo de sección. Por eso existe el token *oro texto*. El oro
  decorativo nunca lleva texto encima.
- La paleta original no cubría los estados del panel, así que se añadieron
  `--color-ok` y `--color-bad`, ambos verificados.

### Tipografía

- **Young Serif** para titulares. Tiene **un solo peso (400)**: la jerarquía
  sale del tamaño y el espaciado, nunca de la negrita.
- **Atkinson Hyperlegible Next** para texto e interfaz, diseñada para máxima
  legibilidad.
- Titular de portada con `clamp(32px, 9vw, 48px)`. A 48px fijos, en una
  pantalla de 360px la frase ocupa más de 4 líneas y empuja el botón fuera de
  la vista.

### El elemento memorable

La firma real de ella, revelándose al cargar. Es la única animación que
arranca sola en toda la página, y respeta `prefers-reduced-motion`.

**Cómo está hecha, y por qué:** se revela de izquierda a derecha con una
máscara CSS, **no** animando el trazo. Una firma fotografiada y vectorizada
automáticamente produce *contornos rellenos*, no un trazo continuo, y
`stroke-dashoffset` sobre un contorno se ve mal; sobre un PNG no funciona en
absoluto. El barrido con máscara se ve casi igual y acepta cualquier archivo
que ella entregue. Si algún día se consigue un SVG vectorizado *por línea
central*, se puede cambiar a trazo real.

### Estructura

- Una columna en móvil, alineada a la izquierda, ancho de lectura de 65
  caracteres. Solo la portada va a dos columnas en escritorio (`.is-hero`, que
  se ensancha a 64rem mientras el resto se queda en 34rem).
- **Numeración solo en "Cómo empiezas"**, porque es la única secuencia real.
- Sin tarjetas idénticas con sombra, sin etiquetas en mayúsculas sobre los
  títulos, sin una palabra en color dentro de un titular.
- Las tarjetas de producto conservan su forma, porque ahí sí son objetos
  separados, pero perdieron la sombra.
- La foto de portada usa 4:3 en móvil y 4:5 en escritorio. Con 4:5 en el
  celular, el botón principal quedaba muy por debajo del borde de la pantalla.

### Un detalle técnico que muerde

Las utilidades de Tailwind v4 viven en una **capa de menor prioridad** que las
clases propias de `globals.css`. Por eso `pt-0` no le gana a `.page-section`, y
los ajustes de espaciado de secciones se hacen con modificadores propios
(`.is-tight`, `.is-flush`, `.is-hero`) y no con utilidades.

### El panel

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
