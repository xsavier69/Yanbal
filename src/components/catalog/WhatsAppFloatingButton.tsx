import WhatsAppIcon from "@/components/catalog/WhatsAppIcon";

/**
 * Botón verde de WhatsApp fijo en una esquina. `aboveStrip` lo sube para
 * no tapar la franja fija del catálogo (/productos).
 */
export default function WhatsAppFloatingButton({
  href,
  aboveStrip = false,
}: {
  href: string;
  aboveStrip?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`fab-whatsapp${aboveStrip ? " above-strip" : ""}`}
      aria-label="Escribir por WhatsApp"
    >
      <WhatsAppIcon size={30} />
    </a>
  );
}
