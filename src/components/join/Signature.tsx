"use client";

import { useState } from "react";
import SignatureSvg from "@/components/join/SignatureSvg";
import SignatureRaster from "@/components/join/SignatureRaster";
import { PhotoPlaceholder } from "@/components/Pending";

/**
 * Su firma real. Es el único elemento con audacia de toda la página, y el
 * único sitio donde se usa el dorado.
 *
 * Si el archivo termina en .svg, se dibuja como trazo real (SignatureSvg).
 * Si es una foto o un PNG, se revela con máscara (SignatureRaster). Si el
 * SVG no se puede leer o falla al cargar, se degrada sola al tratamiento
 * de foto en vez de mostrar un hueco vacío.
 *
 * `animated=false` la muestra ya dibujada y más pequeña: así se repite en
 * el cierre de la página sin volver a llamar la atención.
 */
export default function Signature({
  url,
  name,
  animated = true,
  small = false,
}: {
  url: string | null;
  name: string;
  animated?: boolean;
  small?: boolean;
}) {
  const isSvg = Boolean(url) && /\.svg(\?|#|$)/i.test(url as string);
  const [svgFailed, setSvgFailed] = useState(false);
  const sizeClass = small ? "signature-small" : "";

  return (
    <div>
      {!url ? (
        <PhotoPlaceholder
          label="[FIRMA ESCANEADA]"
          className={small ? "h-14 max-w-[160px]" : "h-20 max-w-[230px]"}
        />
      ) : isSvg && !svgFailed ? (
        <SignatureSvg
          url={url}
          name={name}
          animated={animated}
          className={sizeClass}
          onError={() => setSvgFailed(true)}
        />
      ) : (
        <SignatureRaster
          url={url}
          name={name}
          animated={animated}
          className={sizeClass}
        />
      )}
      <hr className={`signature-rule ${sizeClass}`} />
    </div>
  );
}
