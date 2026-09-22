"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import qrcode from "qrcode-generator";

const ORIGINS = [
  {
    value: "whatsapp",
    label: "Para WhatsApp",
    hint: "Pégalo en un chat o en tu estado.",
  },
  {
    value: "facebook",
    label: "Para Facebook",
    hint: "Pégalo en una publicación o en tu perfil.",
  },
  {
    value: "volante",
    label: "Para un volante impreso",
    hint: "Se usa con el código de abajo.",
  },
] as const;

/** Dibuja el QR en un canvas para poder descargarlo en buena calidad */
function drawQr(canvas: HTMLCanvasElement, text: string, pixels: number) {
  const qr = qrcode(0, "M");
  qr.addData(text);
  qr.make();

  const count = qr.getModuleCount();
  const margin = 4;
  const cell = Math.floor(pixels / (count + margin * 2));
  const size = cell * (count + margin * 2);

  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = "#1B2433";
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (qr.isDark(row, col)) {
        ctx.fillRect(
          (col + margin) * cell,
          (row + margin) * cell,
          cell,
          cell
        );
      }
    }
  }
}

export default function ShareLinks() {
  const [copied, setCopied] = useState<string | null>(null);
  const [copyFailed, setCopyFailed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // La dirección real solo se conoce en el navegador, nunca en el servidor
  const base = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => ""
  );

  const linkFor = (origin: string) => `${base}/?origen=${origin}`;

  useEffect(() => {
    if (!base || !canvasRef.current) return;
    drawQr(canvasRef.current, `${base}/?origen=volante`, 1000);
  }, [base]);

  async function copy(origin: string) {
    setCopyFailed(false);
    try {
      await navigator.clipboard.writeText(linkFor(origin));
      setCopied(origin);
      setTimeout(() => setCopied(null), 2500);
    } catch {
      setCopyFailed(true);
    }
  }

  function downloadQr() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "mi-codigo-qr.png";
    link.click();
  }

  return (
    <section
      aria-labelledby="compartir"
      className="rounded-xl border-2 border-line p-4 flex flex-col gap-5"
    >
      <div>
        <h2 id="compartir" className="font-heading text-xl text-ink">
          Compartir mi página para invitar
        </h2>
        <p className="text-ink-soft mt-1">
          Cada enlace es el mismo, pero te deja ver por dónde te encontraron.
        </p>
      </div>

      <div aria-live="polite">
        {copyFailed && (
          <p role="alert" className="toast-error">
            No se pudo copiar. Mantén presionado el enlace de abajo y elige
            &quot;Copiar&quot;.
          </p>
        )}
      </div>

      <ul className="flex flex-col gap-4">
        {ORIGINS.map((origin) => (
          <li key={origin.value} className="flex flex-col gap-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => copy(origin.value)}
            >
              {copied === origin.value
                ? "¡Copiado! ✓"
                : `Copiar enlace · ${origin.label}`}
            </button>
            <p className="text-ink-soft text-[16px]">{origin.hint}</p>
            <p className="text-ink-soft text-[15px] break-all">
              {base ? linkFor(origin.value) : ""}
            </p>
          </li>
        ))}
      </ul>

      <div className="border-t border-line pt-5 flex flex-col gap-3">
        <h3 className="font-semibold text-ink">Código para imprimir</h3>
        <p className="text-ink-soft text-[16px]">
          Quien lo apunte con la cámara del celular llega a tu página.
        </p>
        <canvas
          ref={canvasRef}
          className="w-40 h-40 border border-line rounded-lg"
          aria-label="Código QR de tu página"
          role="img"
        />
        <button type="button" className="btn-secondary" onClick={downloadQr}>
          Descargar el código
        </button>
      </div>
    </section>
  );
}
