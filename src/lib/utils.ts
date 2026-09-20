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
 * Acepta tanto coma como punto decimal: "12,50" y "12.50" valen igual.
 * Devuelve null si el texto no es un número válido.
 */
export function parsePriceInput(text: string): number | null {
  const cleaned = text.trim().replace(/[^0-9.,]/g, "").replace(",", ".");
  if (cleaned === "") return null;
  const value = Number(cleaned);
  if (Number.isNaN(value) || value < 0) return null;
  return Math.round(value * 100) / 100;
}

/** Arma el link de WhatsApp con mensaje prellenado para pedir un producto */
export function buildProductWhatsAppLink(
  whatsappNumber: string,
  storeName: string,
  productName: string,
  price: number
): string {
  const message = `Hola ${storeName}, me interesa: ${productName} (${formatPrice(
    price
  )}). ¿Está disponible?`;
  const digits = whatsappNumber.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/** Link de WhatsApp genérico (botón flotante / sobre mí) */
export function buildGeneralWhatsAppLink(
  whatsappNumber: string,
  welcomeMessage?: string | null
): string {
  const digits = whatsappNumber.replace(/\D/g, "");
  const message = welcomeMessage?.trim() || "Hola, quiero más información.";
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
