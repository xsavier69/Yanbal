import type { Settings } from "@/lib/types";

/**
 * Datos de Amada que la página usa mientras el panel
 * (Ajustes → Mi invitación / Mi información) no los tenga llenos.
 * Lo que se escriba en el panel siempre gana sobre estos valores.
 */
export const DEFAULT_CONSULTANT_NAME = "Amada Ocaña";
export const DEFAULT_CITY = "Cuenca";
/** +593 93 994 7562, en el formato en que ella lo escribiría */
export const DEFAULT_WHATSAPP = "0939947562";
/** Catálogo oficial de Yanbal de la campaña vigente (ver README: cómo cambiarlo) */
export const CATALOG_PDF_PATH = "/catalogo-yanbal.pdf";

type Resolved = { text: string; pending: boolean };

function withDefault(value: string | null | undefined, fallback: string): Resolved {
  return { text: value?.trim() || fallback, pending: false };
}

export const nameOf = (settings: Settings | null | undefined) =>
  withDefault(settings?.consultant_name, DEFAULT_CONSULTANT_NAME);

export const cityOf = (settings: Settings | null | undefined) =>
  withDefault(settings?.city, DEFAULT_CITY);

/** El mismo número en todos los botones de WhatsApp de la invitación */
export const whatsappOf = (settings: Settings | null | undefined) =>
  settings?.whatsapp_number?.trim() || DEFAULT_WHATSAPP;

/**
 * A dónde lleva todo lo de "productos": únicamente al catálogo oficial de
 * Yanbal (el PDF). La tienda propia (/productos) está en pausa y redirige
 * aquí, ver next.config.ts.
 */
export const catalogHref = () => CATALOG_PDF_PATH;
