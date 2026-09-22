import type { ReactNode } from "react";

/** Marca visualmente un dato que todavía falta por llenar. */
export function Pending({ children }: { children: ReactNode }) {
  return (
    <mark className="pending" title="Falta llenar este dato desde el panel">
      {children}
    </mark>
  );
}

/** Muestra el texto, resaltado si todavía es un hueco por llenar. */
export function Filled({
  value,
}: {
  value: { text: string; pending: boolean };
}) {
  return value.pending ? <Pending>{value.text}</Pending> : <>{value.text}</>;
}

/** Recuadro para una foto que todavía no se ha subido. */
export function PhotoPlaceholder({
  label,
  className = "",
  rounded = "rounded-lg",
}: {
  label: string;
  className?: string;
  rounded?: string;
}) {
  return (
    <div
      className={`photo-pending ${rounded} ${className}`}
      role="img"
      aria-label={`Falta subir: ${label}`}
    >
      <span>{label}</span>
    </div>
  );
}
