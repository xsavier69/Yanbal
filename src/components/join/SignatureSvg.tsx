"use client";

import { useEffect, useRef, useState } from "react";
import { sanitizeSvg } from "@/lib/sanitizeSvg";

/**
 * La firma real, trazada en dorado champán. Se anima con
 * stroke-dashoffset: cada trazo del SVG se dibuja de principio a fin en
 * 1400ms, con 300ms de espera antes de empezar, una sola vez por carga.
 *
 * Solo funciona con un SVG vectorizado por línea central. Si el archivo
 * no se puede leer como SVG (o falla la carga), no renderiza nada: quien
 * llama a este componente decide el respaldo.
 */
export default function SignatureSvg({
  url,
  name,
  animated = true,
  className = "",
  onError,
}: {
  url: string;
  name: string;
  animated?: boolean;
  className?: string;
  onError?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [markup, setMarkup] = useState<string | null>(null);
  const failedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error("no-ok");
        return response.text();
      })
      .then((raw) => {
        if (cancelled) return;
        const clean = sanitizeSvg(raw);
        if (!clean) throw new Error("svg-invalido");
        setMarkup(clean);
      })
      .catch(() => {
        if (cancelled || failedRef.current) return;
        failedRef.current = true;
        onError?.();
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  useEffect(() => {
    const svg = containerRef.current?.querySelector("svg");
    if (!markup || !svg) return;

    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", `Firma de ${name}`);
    svg.removeAttribute("width");
    svg.removeAttribute("height");

    const reduceMotion =
      !animated ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const strokes = svg.querySelectorAll<SVGGeometryElement>(
      "path, line, polyline, polygon, circle, ellipse, rect"
    );

    strokes.forEach((el, index) => {
      el.style.fill = "none";
      el.style.stroke = "var(--color-gold)";
      if (!el.style.strokeWidth) el.style.strokeWidth = "3";
      el.style.strokeLinecap = "round";
      el.style.strokeLinejoin = "round";

      if (reduceMotion) return;

      let length = 300;
      try {
        length = el.getTotalLength();
      } catch {
        // Un <rect> o <circle> viejo puede no soportar getTotalLength en
        // algún navegador; se anima con un largo aproximado en vez de fallar.
      }
      el.style.strokeDasharray = `${length}`;
      el.style.strokeDashoffset = `${length}`;
      el.style.transition = `stroke-dashoffset 1400ms var(--ease-in-out) ${
        300 + index * 70
      }ms`;
      // Fuerza el layout antes de animar, para que la transición arranque
      // desde el estado "sin dibujar" y no salte directo al final.
      void el.getBoundingClientRect();
      requestAnimationFrame(() => {
        el.style.strokeDashoffset = "0";
      });
    });
  }, [markup, name, animated]);

  if (!markup) return null;

  return (
    <div
      ref={containerRef}
      className={`signature-svg ${className}`.trim()}
      // El SVG ya pasó por sanitizeSvg(): sin <script>, sin atributos on*,
      // solo etiquetas de dibujo.
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
