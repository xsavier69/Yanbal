/** Interruptor "Mostrar en mi página". Solo cambia lo que ve en pantalla; se guarda con el botón de la sección. */
export default function VisibilitySwitch({
  id,
  label = "Mostrar en mi página",
  checked,
  onChange,
}: {
  id: string;
  label?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-labelledby={`${id}-titulo`}
      aria-describedby={`${id}-estado`}
      className="visibility-switch"
      onClick={() => onChange(!checked)}
    >
      <span className="switch-track" aria-hidden="true">
        <span className="switch-thumb" />
      </span>
      <span className="flex flex-col text-left">
        <span id={`${id}-titulo`} className="font-semibold text-charcoal">
          {label}
        </span>
        <span id={`${id}-estado`} className="switch-state">
          {checked
            ? "Esta sección se ve en tu página"
            : "Esta sección está oculta"}
        </span>
      </span>
    </button>
  );
}
