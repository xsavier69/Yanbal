import { YANBAL_ICON_BG, YANBAL_ICON_PATH } from "@/lib/yanbalIcon";

/** El ícono cuadrado de Yanbal (la "Y" blanca con su hoja, sobre naranja). */
export default function YanbalIcon({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      role="img"
      aria-label="Yanbal"
      viewBox="0 0 640 640"
      width={size}
      height={size}
      className={className}
    >
      <rect width="640" height="640" fill={YANBAL_ICON_BG} />
      <path d={YANBAL_ICON_PATH} fill="#fff" fillRule="evenodd" />
    </svg>
  );
}
