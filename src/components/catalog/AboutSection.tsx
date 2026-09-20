import Image from "next/image";
import { buildGeneralWhatsAppLink } from "@/lib/utils";
import type { Settings } from "@/lib/types";

export default function AboutSection({ settings }: { settings: Settings | null }) {
  if (!settings?.about_text) return null;

  return (
    <section
      id="sobre-mi"
      className="max-w-lg mx-auto px-4 py-10 border-t border-border"
    >
      <div className="bg-white rounded-2xl border border-border p-6 flex flex-col items-center text-center gap-4">
        {settings.about_photo_url && (
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-peach">
            <Image
              src={settings.about_photo_url}
              alt="Foto de la consultora"
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
        )}

        <h2 className="font-heading text-2xl font-bold text-charcoal">
          Sobre mí
        </h2>

        <p className="text-charcoal text-lg leading-relaxed">
          {settings.about_text}
        </p>

        {(settings.delivery_area || settings.business_hours) && (
          <div className="flex flex-col gap-1 text-charcoal-soft">
            {settings.delivery_area && (
              <p>
                <strong className="text-charcoal">Entrego en:</strong>{" "}
                {settings.delivery_area}
              </p>
            )}
            {settings.business_hours && (
              <p>
                <strong className="text-charcoal">Horario:</strong>{" "}
                {settings.business_hours}
              </p>
            )}
          </div>
        )}

        {settings.whatsapp_number && (
          <a
            href={buildGeneralWhatsAppLink(
              settings.whatsapp_number,
              settings.welcome_message
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp max-w-xs"
          >
            Escríbeme por WhatsApp
          </a>
        )}
      </div>
    </section>
  );
}
