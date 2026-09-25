import Image from "next/image";

/**
 * Respaldo para cuando la firma llega como foto o PNG, no como SVG. Se
 * revela con una máscara de izquierda a derecha en vez de animar un trazo:
 * una firma fotografiada no tiene un trazo continuo que animar (ver
 * README, sección "El elemento memorable").
 */
export default function SignatureRaster({
  url,
  name,
  animated = true,
  className = "",
}: {
  url: string;
  name: string;
  animated?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={url}
      alt={`Firma de ${name}`}
      width={230}
      height={90}
      className={`signature-raster ${animated ? "" : "signature-raster--static"} ${className}`.trim()}
      priority
    />
  );
}
