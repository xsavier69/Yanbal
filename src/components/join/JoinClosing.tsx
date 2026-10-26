import WhatsAppIcon from "@/components/catalog/WhatsAppIcon";
import { Filled } from "@/components/Pending";
import { buildJoinWhatsAppLink } from "@/lib/utils";
import { ph } from "@/lib/placeholder";
import { whatsappOf } from "@/lib/identity";
import type { Settings } from "@/lib/types";

/** Cierre en un bloque de color coral, como la franja final del catálogo. */
export default function JoinClosing({
  settings,
  consultantName,
}: {
  settings: Settings | null;
  consultantName: string;
}) {
  const closing = ph(settings?.closing_text, "[LÍNEAS DE DESPEDIDA]");
  const whatsapp = whatsappOf(settings);

  return (
    <section aria-labelledby="cierre" className="band-coral on-coral">
      <div className="page-section">
        <h2 id="cierre" className="sr-only section-title">
          Un último mensaje
        </h2>
        <p className="font-heading text-[clamp(28px,7vw,38px)] leading-[1.15] prose-measure">
          <Filled value={closing} />
        </p>

        <a
          href={buildJoinWhatsAppLink(whatsapp, consultantName)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary max-w-sm mt-8"
        >
          <WhatsAppIcon size={20} />
          Escribirme por WhatsApp
        </a>
      </div>
    </section>
  );
}
