/**
 * Textos que todavía no están llenos.
 *
 * Mientras falte un dato, la página muestra el hueco entre corchetes
 * ([TU NOMBRE]) en vez de inventarlo. Así se ve de un vistazo qué queda
 * pendiente, y desaparece solo cuando se llena desde el panel.
 */
export function ph(
  value: string | null | undefined,
  fallback: string
): { text: string; pending: boolean } {
  const clean = (value ?? "").trim();
  return clean
    ? { text: clean, pending: false }
    : { text: fallback, pending: true };
}

export function phNumber(
  value: number | null | undefined,
  fallback: string
): { text: string; pending: boolean } {
  return typeof value === "number" && Number.isFinite(value)
    ? { text: String(value), pending: false }
    : { text: fallback, pending: true };
}
