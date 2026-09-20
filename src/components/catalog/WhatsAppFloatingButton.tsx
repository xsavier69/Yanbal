import { buildGeneralWhatsAppLink } from "@/lib/utils";
import WhatsAppIcon from "@/components/catalog/WhatsAppIcon";

export default function WhatsAppFloatingButton({
  whatsappNumber,
  welcomeMessage,
}: {
  whatsappNumber: string;
  welcomeMessage?: string | null;
}) {
  return (
    <a
      href={buildGeneralWhatsAppLink(whatsappNumber, welcomeMessage)}
      target="_blank"
      rel="noopener noreferrer"
      className="fab-whatsapp"
      aria-label="Escribir por WhatsApp"
    >
      <WhatsAppIcon size={30} />
    </a>
  );
}
