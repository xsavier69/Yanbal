import Signature from "@/components/join/Signature";
import WhatsAppIcon from "@/components/catalog/WhatsAppIcon";
import { Filled } from "@/components/Pending";
import { buildJoinWhatsAppLink } from "@/lib/utils";
import { ph } from "@/lib/placeholder";
import { whatsappOf } from "@/lib/identity";
import type { Settings } from "@/lib/types";

export default function JoinClosing({
  settings,
  consultantName,
}: {
  settings: Settings | null;
  consultantName: string;
}) {
  const closing = ph(
    settings?.closing_text,
    "[LÍNEAS DE DESPEDIDA]"
  );
  const whatsapp = whatsappOf(settings);

  return (
    <section
      aria-labelledby="cierre"
      className="band-midnight on-midnight"
    >
      <div className="page-section">
        <h2 id="cierre" className="sr-only">
          Un último mensaje
        </h2>
        <p className="prose-measure text-[22px] leading-relaxed">
          <Filled value={closing} />
        </p>

        <div className="mt-6">
          {/* La firma se repite aquí ya dibujada y más pequeña: no vuelve
              a llamar la atención, solo cierra el gesto de la portada. */}
          <Signature
            url={settings?.signature_url ?? null}
            name={consultantName}
            animated={false}
            small
          />
        </div>

        <a
          href={buildJoinWhatsAppLink(whatsapp, consultantName)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary max-w-sm mt-6"
        >
          <WhatsAppIcon size={20} />
          Escribirme por WhatsApp
        </a>
      </div>
    </section>
  );
}
