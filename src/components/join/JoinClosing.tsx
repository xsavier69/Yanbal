import Signature from "@/components/join/Signature";
import WhatsAppIcon from "@/components/catalog/WhatsAppIcon";
import { Filled } from "@/components/Pending";
import { buildJoinWhatsAppLink } from "@/lib/utils";
import { ph } from "@/lib/placeholder";
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
    "[UNAS LÍNEAS DE DESPEDIDA, CON SUS PALABRAS]"
  );
  const whatsapp = settings?.whatsapp_number;

  return (
    <>
      <section
        aria-labelledby="cierre"
        className="band-sky border-t border-line"
      >
        <div className="page-section">
          <h2 id="cierre" className="sr-only">
            Un último mensaje
          </h2>
          <p className="prose-measure text-[22px] leading-relaxed">
            <Filled value={closing} />
          </p>

          <div className="mt-6">
            <Signature
              url={settings?.signature_url ?? null}
              name={consultantName}
            />
          </div>

          {whatsapp && (
            <a
              href={buildJoinWhatsAppLink(whatsapp, consultantName)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary max-w-sm mt-6"
            >
              <WhatsAppIcon size={20} />
              Escribirme por WhatsApp
            </a>
          )}
        </div>
      </section>

    </>
  );
}
