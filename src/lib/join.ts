import type { LeadSource } from "@/lib/types";

/**
 * Deja un celular ecuatoriano en el formato que pide la base: 593 + 9 dígitos.
 * Acepta 0987654321, 098 765 4321, +593 98 765 4321 y 593987654321.
 * Devuelve null si no es un celular de Ecuador.
 */
export function normalizeEcuadorMobile(input: string): string | null {
  const digits = (input ?? "").replace(/\D/g, "");
  if (/^09\d{8}$/.test(digits)) return `593${digits.slice(1)}`;
  if (/^9\d{8}$/.test(digits)) return `593${digits}`;
  if (/^5939\d{8}$/.test(digits)) return digits;
  return null;
}

/** 593987654321 -> 098 765 4321, para leerlo en el panel */
export function formatEcuadorMobile(stored: string): string {
  const m = /^593(\d{2})(\d{3})(\d{4})$/.exec(stored ?? "");
  return m ? `0${m[1]} ${m[2]} ${m[3]}` : stored;
}

const SOURCES = new Set<LeadSource>([
  "whatsapp",
  "facebook",
  "volante",
  "directo",
]);

/** Lee ?origen= de la URL. Cualquier cosa rara cuenta como "directo". */
export function readSource(value: string | string[] | undefined): LeadSource {
  const raw = Array.isArray(value) ? value[0] : value;
  return SOURCES.has(raw as LeadSource) ? (raw as LeadSource) : "directo";
}

/** "hace 2 días", para la lista de personas interesadas */
export function timeAgo(iso: string, nowMs: number = Date.now()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const minutes = Math.floor((nowMs - then) / 60000);
  if (minutes < 1) return "recién";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? "hace 1 hora" : `hace ${hours} horas`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "ayer";
  if (days < 30) return `hace ${days} días`;
  const months = Math.floor(days / 30);
  return months === 1 ? "hace 1 mes" : `hace ${months} meses`;
}
