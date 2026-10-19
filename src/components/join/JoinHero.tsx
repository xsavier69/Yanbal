import Image from "next/image";
import Signature from "@/components/join/Signature";
import WhatsAppIcon from "@/components/catalog/WhatsAppIcon";
import { Filled, PhotoPlaceholder } from "@/components/Pending";
import { buildJoinWhatsAppLink } from "@/lib/utils";
import { phNumber } from "@/lib/placeholder";
import { catalogHref, cityOf, nameOf, whatsappOf } from "@/lib/identity";
import type { Settings } from "@/lib/types";

export default function JoinHero({
  settings,
  consultantName,
}: {
  settings: Settings | null;
  consultantName: string;
}) {
  const city = cityOf(settings);
  const years = phNumber(settings?.years_selling, "[X]");
  const name = nameOf(settings);
  const whatsapp = whatsappOf(settings);

  return (
    <header className="page-section is-tight is-hero band-midnight on-midnight">
      {/* Quien solo viene a comprar va directo al catálogo de Yanbal */}
      <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="text-ink-soft">¿Solo quieres comprar?</span>
        <a
          href={catalogHref(settings)}
          target="_blank"
          rel="noopener noreferrer"
          className="pill-link"
        >
          Ver mis productos <span aria-hidden="true">→</span>
          <span className="sr-only">
            , se abre el catálogo de Yanbal en una pestaña nueva
          </span>
        </a>
      </div>

      {/* Retícula de 12 columnas: el retrato ocupa 5, el texto 6, y la
          columna 6 queda como respiro. En móvil se apila y el retrato
          sangra al borde de la pantalla. */}
      <div className="hero-grid">
        <div className="hero-portrait-col">
          <div className="hero-portrait">
            {settings?.hero_photo_url ? (
              <Image
                src={settings.hero_photo_url}
                alt={`${consultantName}, consultora Yanbal`}
                width={720}
                height={900}
                sizes="(max-width: 768px) 100vw, 440px"
                className="hero-portrait-photo"
                priority
              />
            ) : (
              <PhotoPlaceholder
                label="[FOTO]"
                className="hero-portrait-photo"
                rounded="rounded-none"
              />
            )}
          </div>
          <hr className="hero-portrait-rule" />
        </div>

        <div className="hero-copy-col flex flex-col gap-5">
          <h1 className="hero-title">
            Te acompaño a empezar tu propio negocio con Yanbal.
          </h1>

          <p className="text-ink-soft prose-measure">
            Soy <Filled value={name} />, consultora en <Filled value={city} />{" "}
            desde hace <Filled value={years} /> años. Si quieres un ingreso
            extra vendiendo a tu ritmo, te explico todo por WhatsApp, sin
            compromiso.
          </p>

          <Signature
            url={settings?.signature_url ?? null}
            name={consultantName}
          />

          <div className="flex flex-col gap-3 mt-2 max-w-sm">
            <a href="#quiero-saber-mas" className="btn-primary">
              Quiero saber cómo empezar
            </a>
            <a
              href={buildJoinWhatsAppLink(whatsapp, consultantName)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              <WhatsAppIcon size={20} />
              Escribirme por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
