/** Límites que también se validan en la base de datos (supabase/schema.sql) */
export const LIMITS = {
  productName: 80,
  description: 500,
  maxPrice: 9999.99,
  storeName: 60,
  welcomeMessage: 200,
  aboutText: 300,
  deliveryArea: 80,
  businessHours: 80,
  whatsapp: 20,
  photoMaxMB: 25,
} as const;

/** Formatea un precio en dólares con estilo ecuatoriano: $12,50 */
export function formatPrice(value: number): string {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Convierte texto de precio escrito por la usuaria a número.
 * Acepta coma o punto decimal ("12,50" y "12.50" valen igual), un "$"
 * al inicio y separador de miles ("1.234,50").
 * Devuelve null si el texto no es un precio válido (por ejemplo "12abc").
 */
export function parsePriceInput(text: string): number | null {
  const cleaned = text.trim().replace(/[$\s]/g, "");
  if (!/^\d[\d.,]*$/.test(cleaned)) return null;

  const lastSep = Math.max(cleaned.lastIndexOf(","), cleaned.lastIndexOf("."));
  let normalized: string;
  if (lastSep === -1) {
    normalized = cleaned;
  } else {
    const decimals = cleaned.slice(lastSep + 1);
    const integerPart = cleaned.slice(0, lastSep).replace(/[.,]/g, "");
    if (decimals.length === 1 || decimals.length === 2) {
      normalized = `${integerPart}.${decimals}`;
    } else if (decimals.length === 3) {
      // "1.234" se entiende como mil doscientos treinta y cuatro
      normalized = `${integerPart}${decimals}`;
    } else {
      return null;
    }
  }

  const value = Number(normalized);
  if (!Number.isFinite(value)) return null;
  return Math.round(value * 100) / 100;
}

/**
 * Deja el número de WhatsApp en formato internacional sin "+" (lo que pide
 * wa.me). "0991234567" -> "593991234567". Devuelve null si no parece un
 * número de teléfono válido.
 */
export function normalizeWhatsappNumber(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (/^0[2-9]\d{7,8}$/.test(digits)) return `593${digits.slice(1)}`;
  if (/^9\d{8}$/.test(digits)) return `593${digits}`;
  if (/^593\d{9}$/.test(digits)) return digits;
  // Otros países: código de país + número, entre 11 y 15 dígitos
  if (/^[1-9]\d{10,14}$/.test(digits)) return digits;
  return null;
}

function whatsappDigits(whatsappNumber: string): string {
  const normalized = normalizeWhatsappNumber(whatsappNumber);
  return typeof normalized === "string"
    ? normalized
    : whatsappNumber.replace(/\D/g, "");
}

/** Arma el link de WhatsApp con mensaje prellenado para pedir un producto */
export function buildProductWhatsAppLink(
  whatsappNumber: string,
  storeName: string,
  productName: string,
  price: number
): string {
  const message = `Hola, vi tu tienda «${storeName}» y me interesa: ${productName} (${formatPrice(
    price
  )}). ¿Está disponible?`;
  return `https://wa.me/${whatsappDigits(whatsappNumber)}?text=${encodeURIComponent(
    message
  )}`;
}

/** Link de WhatsApp genérico (botón flotante / sobre mí) */
export function buildGeneralWhatsAppLink(
  whatsappNumber: string,
  welcomeMessage?: string | null
): string {
  const message = welcomeMessage?.trim() || "Hola, quiero más información.";
  return `https://wa.me/${whatsappDigits(whatsappNumber)}?text=${encodeURIComponent(
    message
  )}`;
}
