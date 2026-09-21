export type CampaignState =
  | { kind: "active"; text: string }
  | { kind: "expired"; text: string }
  | { kind: "hidden" };

const TIME_ZONE = "America/Guayaquil";

/** Fecha de hoy en Ecuador como "YYYY-MM-DD" */
export function todayInEcuador(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** "2026-09-25" -> "25 de septiembre" */
export function formatCampaignDate(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat("es-EC", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(date);
}

export const EXPIRED_CAMPAIGN_TEXT = "Pregúntame por la campaña de este mes";

/**
 * Qué mostrar en la banda de campaña. Regla de oro: una fecha vencida
 * NUNCA se muestra; en ese caso sale un aviso suave sin fecha.
 * La fecha de cierre vale hasta el final de ese día.
 */
export function getCampaignState(
  number: number | null | undefined,
  endDate: string | null | undefined,
  today: string
): CampaignState {
  const hasNumber = typeof number === "number" && number > 0;
  const hasDate = Boolean(endDate);
  if (!hasNumber && !hasDate) return { kind: "hidden" };

  if (endDate && endDate < today) {
    return { kind: "expired", text: EXPIRED_CAMPAIGN_TEXT };
  }

  const name = hasNumber ? `Campaña ${number}` : "Campaña vigente";
  const text = endDate
    ? `${name} — válida hasta el ${formatCampaignDate(endDate)}`
    : name;
  return { kind: "active", text };
}

/**
 * Deja un enlace listo para usar. Acepta "www.yanbal.com/..." (agrega
 * https://) y solo permite http/https. Devuelve null si no sirve.
 */
export function safeHttpUrl(input: string | null | undefined): string | null {
  const text = (input ?? "").trim();
  if (!text) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(text) ? text : `https://${text}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (!url.hostname.includes(".")) return null;
    return url.href;
  } catch {
    return null;
  }
}
