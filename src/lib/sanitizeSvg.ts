/**
 * Deja un SVG listo para insertarse en la página (dangerouslySetInnerHTML).
 *
 * Solo la cuenta admin puede subir una firma (RLS + `is_admin()`), pero un
 * SVG puede llevar `<script>` o atributos `on*` que se ejecutarían en su
 * propia sesión si lo insertamos tal cual. Esta función se queda solo con
 * las etiquetas de dibujo (nada de <script>, <image>, <foreignObject>) y
 * solo con los atributos de presentación, nunca con manejadores de evento.
 *
 * Devuelve null si el archivo no es un SVG válido.
 */
const ALLOWED_TAGS = new Set([
  "svg",
  "g",
  "path",
  "line",
  "polyline",
  "polygon",
  "circle",
  "ellipse",
  "rect",
]);

const ALLOWED_ATTRS = new Set([
  "id",
  "class",
  "d",
  "points",
  "x",
  "x1",
  "x2",
  "y",
  "y1",
  "y2",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "width",
  "height",
  "viewbox",
  "fill",
  "stroke",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-dasharray",
  "transform",
  "style",
]);

function stripElement(el: Element) {
  if (!ALLOWED_TAGS.has(el.tagName.toLowerCase())) {
    el.remove();
    return;
  }
  for (const attr of [...el.attributes]) {
    const name = attr.name.toLowerCase();
    if (name.startsWith("on") || !ALLOWED_ATTRS.has(name)) {
      el.removeAttribute(attr.name);
    }
  }
  for (const child of [...el.children]) {
    stripElement(child);
  }
}

export function sanitizeSvg(raw: string): string | null {
  if (typeof DOMParser === "undefined") return null; // solo corre en el navegador
  const doc = new DOMParser().parseFromString(raw, "image/svg+xml");
  if (doc.querySelector("parsererror")) return null;
  const svg = doc.documentElement;
  if (!svg || svg.tagName.toLowerCase() !== "svg") return null;
  stripElement(svg);
  return new XMLSerializer().serializeToString(svg);
}
