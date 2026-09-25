# DESIGN.md — "Estuche de joyería"

Estado: **propuesta, sin construir**. Este documento es el punto de control
antes de tocar código, según se pidió.

## Herramientas del proceso

`impeccable` no tiene instalados `scripts/context.mjs` ni los archivos de
`reference/` (`new-work.md`, `craft-floor.md`, `init.md`) en este entorno —
solo existe su `SKILL.md`. Por eso `PRODUCT.md` y este `DESIGN.md` se
escribieron a mano siguiendo la estructura que ese `SKILL.md` describe
(contexto de producto; tokens de color, tipo, layout; el elemento firma),
en vez de generarse con el script. La revisión contra `frontend-design` sí
se hizo completa, con el texto real de esa skill. `craft-floor.md` no se
pudo cargar antes de construir porque no existe en disco; lo primero que
haré al empezar a programar es intentar localizarlo de nuevo, y si sigue sin
existir, aplicaré su intención documentada (piso de calidad: responsive,
foco visible, `prefers-reduced-motion`) sin el archivo.

---

## 1. Concepto

**"Estuche de joyería."** La página se siente como abrir un estuche: fondo
sereno, una pieza protagonista bien iluminada (ella, o el producto) y
detalles finos en dorado. El dorado nunca decora porque sí: marca
exactamente dos cosas en toda la página — su firma y el borde que enmarca
su retrato.

## 2. Paleta — verificada, no copiada

| Token | Hex | Uso | Contraste |
|---|---|---|---|
| `--midnight` | `#14213D` | Portada, pie, bandas de énfasis | fondo |
| `--ink` | `#1A1F2B` | Texto principal sobre claro | 15,4:1 sobre porcelana (AAA) |
| `--porcelain` | `#F6F7F9` | Fondo base | — |
| `--platter` | `#EDEFF3` | Fondo del "platillo" de fotos de producto | — (ver §6) |
| `--mist` | `#E3E7EE` | Separador puramente decorativo | 1,16:1 — **no sirve para bordes de campo** |
| `--mist-line` | `#7C8AA8` | Borde de campo en reposo | 3,23:1 sobre porcelana (AA no-texto) |
| `--dome` | `#1F4E8C` | Botones, enlaces (azul de las cúpulas de Cuenca) | 7,75:1 sobre porcelana y blanco (AAA) |
| `--champagne` | `#B8955C` | Solo decoración sobre `--midnight`: firma, filete 1px | 5,70:1 sobre medianoche |
| `--champagne-text` | `#86662F` | Texto pequeño en dorado, solo sobre fondo claro | 4,95:1 sobre porcelana (AA) |
| `--error` | `#9B2C2C` | Mensajes de error | 7,02:1 sobre porcelana (AAA) |

**Dos correcciones mías, con la cuenta hecha:**

1. **`--champagne` no sirve como texto sobre porcelana** (2,62:1, falla).
   El brief ya lo restringía a "solo sobre `--midnight`", así que aquí solo
   lo hago explícito en código: dos tokens, dos usos, sin excepción. Es el
   mismo error que rompió la paleta anterior (el dorado no pasaba sobre el
   celeste); esta vez el token decorativo nunca se aplica a texto sobre
   fondo claro.
2. **`--mist` no alcanza el 3:1 que pide WCAG para el borde de un campo**
   (1,16:1, prácticamente invisible). Si el campo depende de esa línea para
   notarse como campo — no solo como decoración — necesita más contraste.
   Añadí `--mist-line` (`#7C8AA8`, 3,23:1) para el borde en reposo de los
   inputs. `--mist` se queda para líneas puramente decorativas donde ya hay
   otra señal de separación (espacio, cambio de fondo).

Proporción del brief (70/20/8/2) se respeta: `--dome` y `--champagne` son
los únicos acentos de color en una página que por lo demás es porcelana,
medianoche y tinta.

## 3. Tipografía — confirmada en Google Fonts y en `next/font`

| Rol | Fuente | Confirmado |
|---|---|---|
| Titulares | **Newsreader**, eje óptico (`opsz`) | Existe en Google Fonts; `next/font/google` soporta ejes extra con `axes: ['opsz']` (documentado en `node_modules/next/dist/docs`) |
| Texto e interfaz (landing/catálogo) | **Instrument Sans** | Pesos 400/500/600/700 + variable |
| Panel `/mi-tienda` | **Atkinson Hyperlegible Next** (se mantiene) | Ya en uso, sin cambios |
| Precios | Instrument Sans, `font-variant-numeric: tabular-nums` | — |

Carga: `next/font/google`, `display: "swap"`, `subsets: ["latin", "latin-ext"]`
en los tres. Newsreader con `weight: "variable"`, `axes: ["opsz"]`, y CSS
usa `font-optical-sizing: auto` para que el navegador mueva el eje óptico
según el tamaño real.

Escala (1.25): `16 / 18 / 22 / 28 / 35 / 44 / 56`. Titular de portada:
`clamp(44px, 8vw, 72px)` — no un valor fijo por breakpoint, para que no
salte de golpe entre 44 y 72 sino que seas la propia pantalla la que decida.
Tracking `-0.01em` a partir de 35px, `-0.02em` a partir de 44px.

## 4. Layout — grid concreto, no solo "asimétrico"

- Espaciado en base 8px. Separación entre secciones: `96px` en móvil,
  `160px` en escritorio (variables `--space-section-m` / `--space-section-d`).
- Ancho de lectura: `62ch` para párrafos y listas. El retrato de portada
  **no** respeta esa medida: sangra al borde de la pantalla en móvil y ocupa
  una columna propia en escritorio (ver wireframe). Es la única ruptura
  deliberada de la retícula, y siempre es la misma: el retrato de ella.
- **Retícula de escritorio, 12 columnas:** portada = retrato en columnas
  `1–5` (5/12), texto en columnas `7–12` (6/12), columna `6` como respiro.
  Nunca 50/50. El resto de secciones (`Qué hace una consultora`, `Cómo
  empiezas`, FAQ, formulario) vuelve a una columna centrada de 62ch — la
  asimetría es exclusiva de la portada, no un gesto que se repite y se
  vuelve decorativo.
- Radios con jerarquía, sin repetir un valor para todo: `2px` en campos,
  `999px` en botones, `0px` en el retrato (con su filete dorado
  desplazado 12px, "marco de galería"), `6px` en fotos de producto.
- Cero sombras. La separación es espacio, filete de 1px en `--mist`, o
  cambio de fondo entre `--porcelain` y `--midnight`.

## 5. El elemento memorable: la firma

- Se dibuja con un SVG real (`public/firma.svg`), vectorizado por línea
  central — no la máscara de barrido de la versión anterior. Esto ya lo
  hace posible: **hace falta un SVG vectorizado**, no una foto. Si el
  archivo que llega es una foto o un PNG, el trazo no se puede animar como
  trazo (es la misma limitación técnica que documenté antes); en ese caso
  degrado a una revelación por máscara, igual de elegante pero no un trazo
  real. Lo dejo como decisión pendiente de qué archivo entregue ella.
- Animación: `stroke-dasharray` / `stroke-dashoffset`, 1400ms,
  `cubic-bezier(0.77, 0, 0.175, 1)`, con 300ms de espera antes de empezar.
  Una sola vez por carga, nunca al hacer scroll de nuevo a la sección.
  `prefers-reduced-motion`: el trazo aparece completo, sin animar.
- Se repite estática y pequeña en el cierre de la portada y en la imagen
  Open Graph.

## 6. Fotografía

- **Producto:** "platillo" uniforme — fondo `--platter` (un tono más oscuro
  que la porcelana, sin matiz beige para no acercarse al crema genérico
  que se descartó), relación **4:5**, `object-fit: contain`, 12% de margen
  interno. Fotos distintas de calidad distinta se leen como una colección.
- **Retrato:** relación 4:5, radio 0, filete de 1px en `--champagne`
  desplazado 12px del borde de la foto (efecto de marco, no de sombra). Sin
  foto: la portada se reorganiza a una columna tipográfica; nunca un cuadro
  vacío ni un ícono de persona genérico.
- **Quitar fondo (`@imgly/background-removal`) — decisión que marco, no
  que tomo sola:** ese paquete descarga un modelo de decenas de MB y corre
  inferencia en el navegador. Choca de frente con el objetivo de LCP<2s en
  4G y con todo lo que ya hicimos para que el panel sea liviano en un
  celular viejo. Lo construyo como **opcional y bajo demanda real**: nada
  se descarga hasta que ella toca "Quitar el fondo (opcional)"; si tarda
  más de 15s o falla, se guarda la foto tal cual sin mostrarle un error
  técnico. Aun con esa protección, es la pieza más pesada de todo el
  encargo. Si prefieres no incluirla en esta entrega y dejarla para después,
  dímelo y la quito del alcance sin que afecte al resto.
- **CLS = 0, sin inventar un LQIP falso:** las fotos de producto y el
  retrato reservan su caja exacta por `aspect-ratio` más el fondo
  `--platter`/`--midnight` como relleno — eso ya garantiza cero salto de
  layout. Un *blur* real (LQIP) necesitaría generarse en el momento de
  subir la foto (con `sharp`, que Supabase no ofrece gratis) y guardar ese
  dato en la base. Lo propongo como mejora aparte, no como parte de esta
  entrega, para no bloquear el resto por una librería de servidor nueva.

## 7. Movimiento

Igual a lo que pediste, formalizado como variables:

```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
```

- Botones: `:active { transform: scale(0.97) }`, 120ms.
- Enlaces con `@media (hover: hover)`: subrayado de 1px que crece desde la
  izquierda, 200ms.
- Acordeones ("Más opciones", FAQ): alto + opacidad, 220ms, `--ease-out`.
- Confirmaciones del panel: entran/salen 200ms desde abajo.
- Nunca `ease-in`, nunca `transition: all`, nunca fundido al hacer scroll,
  nunca carrusel automático, nunca cursor personalizado.
- Ninguna animación en lo que ella toca muchas veces al día (cambiar
  disponible/agotado, marcar estado de una persona interesada): eso ya lo
  cumple el panel actual y se mantiene igual.

## 8. Panel `/mi-tienda` — Operate, no Persuade

Se ve de la misma familia (misma paleta base) pero manda la claridad:

- Fondo porcelana, cabecera fina en `--midnight` con su nombre.
- Atkinson Hyperlegible Next, 18px mínimo, botones de 56px.
- **Sin firma animada, sin filete decorativo, sin movimiento salvo las
  confirmaciones.** Contraste AAA en todo el texto.
- Ningún flujo cambia. Los componentes ya construidos (`SectionShell`,
  `VisibilitySwitch`, `LeadCard`, etc.) se retocan de color y tipografía,
  no de estructura ni de pasos.

## 9. Rendimiento — objetivo y cómo se llega

- LCP < 2.0s: el retrato de portada con `priority`, tamaños responsivos,
  AVIF/WebP (Supabase Storage sirve el original; Next lo transforma vía
  `next/image` en el propio despliegue de Vercel).
  Consulta un teléfono en 4G, imagen de partida de oleaje..
- CLS = 0: cajas reservadas por `aspect-ratio` en cada imagen (§6).
- INP < 200ms: nada de librerías de animación pesadas en landing/catálogo;
  si el panel necesitara alguna transición más elaborada que CSS puro, ahí
  sí cabría `motion` (Framer Motion), pero de entrada no la vamos a
  necesitar — todo lo pedido en el panel se resuelve con CSS.
- Lighthouse en móvil, reportado al final con capturas del propio panel de
  Lighthouse, no solo el número que yo diga.

## 10. Wireframes

```
PORTADA — escritorio (12 columnas)              PORTADA — móvil
┌────────────────────────────────────────┐      ┌───────────────────────┐
│ midnight                    col 1    12 │      │ midnight              │
│ ¿Solo comprar? →           ┆1 2 3 4 5┆6┆7 8 9 10 11 12│  ┌─────────────────┐ │
│ ┌───────────┐               ·         ·  Te acompaño a  │  │                 │ │ ← sangra
│ │           │               ·         ·  empezar tu     │  │   RETRATO       │ │   al borde
│ │  RETRATO  │               ·         ·  propio negocio │  │   4:5, radio 0  │ │
│ │  4:5      │←filete 12px   ·         ·  con Yanbal.     │  └─────────────────┘ │
│ │  radio 0  │               ·         ·                  │  Te acompaño a       │
│ └───────────┘               ·         ·  Soy [NOMBRE]…   │  empezar tu propio   │
│                             ·         ·  ~firma trazada~  │  negocio con Yanbal. │
│                             ·         ·  (Quiero empezar) │  Soy [NOMBRE]…       │
│                                            (WhatsApp)     │  ~firma~             │
└────────────────────────────────────────┘      │  (Quiero empezar)     │
  62ch máx. de ancho para el bloque de texto      └───────────────────────┘
  (columnas 7–12, no toda la fila)

CATÁLOGO — móvil                                 PANEL /mi-tienda (Operate)
┌───────────────────────┐                        ┌───────────────────────┐
│ midnight, 15px, fino  │ ← banda de campaña      │ midnight, angosta     │
│ Campaña 11 — hasta…   │   (nunca "cartel")      │ Mi tienda · Ajustes   │
├───────────────────────┤                        ├───────────────────────┤
│ Tienda de Amada       │                        │ [＋ Agregar producto] │
│ porcelana             │                        │  56px, píldora dome   │
├───────────────────────┤                        ├───────────────────────┤
│ Novedades →scroll     │                        │ foto·nombre·$·Editar  │
│ [platillo][platillo]  │                        │        [Disponible]   │
├───────────────────────┤                        └───────────────────────┘
│ catálogo · filtros    │                          Atkinson, 18px, sin
│ [platillo][platillo]  │                          filetes ni firma
└───────────────────────┘
```

## 11. Qué NO cambia (lo repito porque es fácil olvidarlo al rediseñar)

Contenido, textos legales, aviso de ingresos no garantizados, formulario,
rutas, base de datos, el sello de consultora independiente, ningún recurso
gráfico de Yanbal.
