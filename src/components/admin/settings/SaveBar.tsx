/** Botón Guardar de una sección, con su confirmación. Nada se guarda solo. */
export default function SaveBar({
  saving,
  saved,
  error,
  dirty,
}: {
  saving: boolean;
  saved: boolean;
  error: string | null;
  dirty: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div aria-live="polite" className="flex flex-col gap-3">
        {error && (
          <p role="alert" className="toast-error">
            {error}
          </p>
        )}
        {saved && !dirty && !error && (
          <p className="toast-success">Cambios guardados ✓</p>
        )}
      </div>
      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? "Guardando..." : "Guardar esta sección"}
      </button>
    </div>
  );
}
