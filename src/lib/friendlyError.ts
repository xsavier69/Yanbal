/**
 * Convierte un error técnico de Supabase en un mensaje que diga qué hacer.
 * `action` va en infinitivo: "guardar el producto", "borrar el producto".
 */
export function friendlyError(err: unknown, action: string): string {
  const e = (err ?? {}) as {
    message?: string;
    status?: number;
    statusCode?: string | number;
    code?: string;
  };
  const message = (e.message ?? "").toLowerCase();
  const status = Number(e.status ?? e.statusCode ?? 0);

  const offline =
    (typeof navigator !== "undefined" && !navigator.onLine) ||
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("network request failed");
  if (offline) {
    return `No hay conexión. No se pudo ${action}; revisa tu internet e intenta de nuevo.`;
  }

  const sessionProblem =
    status === 401 ||
    status === 403 ||
    e.code === "PGRST301" ||
    message.includes("jwt") ||
    message.includes("row-level security") ||
    message.includes("not authenticated");
  if (sessionProblem) {
    return "Tu sesión venció. Toca «Salir», entra otra vez e inténtalo de nuevo.";
  }

  return `Algo salió mal y no se pudo ${action}. Inténtalo otra vez; si sigue igual, avísale a quien te ayuda con la tienda.`;
}
