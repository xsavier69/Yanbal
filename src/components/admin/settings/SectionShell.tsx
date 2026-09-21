import type { ReactNode } from "react";

/**
 * Una sección plegable de Ajustes. El contenido se queda montado aunque esté
 * cerrado, así lo que ella escribió no se pierde al abrir otra sección.
 */
export default function SectionShell({
  id,
  title,
  open,
  onToggle,
  dirty,
  children,
}: {
  id: string;
  title: string;
  open: boolean;
  onToggle: () => void;
  dirty: boolean;
  children: ReactNode;
}) {
  return (
    <section className="settings-section">
      <h2>
        <button
          type="button"
          id={`${id}-boton`}
          className="settings-section-btn"
          aria-expanded={open}
          aria-controls={`${id}-cuerpo`}
          onClick={onToggle}
        >
          <span>
            {title}
            {dirty && <span className="settings-dirty"> · sin guardar</span>}
          </span>
          <span aria-hidden="true">{open ? "▲" : "▼"}</span>
        </button>
      </h2>
      <div
        id={`${id}-cuerpo`}
        role="region"
        aria-labelledby={`${id}-boton`}
        className="settings-section-body"
        hidden={!open}
      >
        {children}
      </div>
    </section>
  );
}
