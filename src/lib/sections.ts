import type { SectionKey, Settings } from "@/lib/types";

/**
 * Una sección se ve salvo que Amada la haya apagado con su interruptor.
 * (Además, cada sección se oculta sola cuando no tiene contenido.)
 */
export function isSectionVisible(
  settings: Settings | null | undefined,
  key: SectionKey
): boolean {
  return settings?.sections_visible?.[key] !== false;
}
