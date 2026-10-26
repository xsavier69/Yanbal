import { YANBAL_LOGO_PATH, YANBAL_LOGO_VIEWBOX } from "@/lib/yanbalLogo";

/** Logotipo de Yanbal en el color del texto que lo rodea (currentColor). */
export default function YanbalLogo({
  height = 16,
  className = "",
}: {
  height?: number;
  className?: string;
}) {
  const [, , w, h] = YANBAL_LOGO_VIEWBOX.split(" ").map(Number);
  return (
    <svg
      role="img"
      aria-label="Yanbal"
      viewBox={YANBAL_LOGO_VIEWBOX}
      height={height}
      width={(height * w) / h}
      className={className}
      fill="currentColor"
      fillRule="evenodd"
    >
      <path d={YANBAL_LOGO_PATH} />
    </svg>
  );
}
