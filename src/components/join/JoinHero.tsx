import Image from "next/image";
import WhatsAppIcon from "@/components/catalog/WhatsAppIcon";
import YanbalLogo from "@/components/YanbalLogo";
import YanbalIcon from "@/components/YanbalIcon";
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
    <header>
      {/* Barra de arriba: el logo, pequeño, y la salida para quien solo
          viene a comprar, bien a la vista. */}
      <div className="top-bar">
        <div className="top-bar-inner">
          <span className="flex items-center gap-2.5">
            <YanbalIcon size={32} />
            <YanbalLogo height={15} />
          </span>
          <a
            href={catalogHref()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary btn-sm"
          >
            Ver mis productos <span aria-hidden="true">→</span>
            <span className="sr-only">
              , se abre el catálogo de Yanbal en una pestaña nueva
            </span>
          </a>
        </div>
      </div>

      <div className="hero-wrap">
        <div className="hero-grid">
          <div className="hero-photo">
            {settings?.hero_photo_url ? (
              <Image
                src={settings.hero_photo_url}
                alt={`${consultantName}, consultora Yanbal`}
                width={720}
                height={900}
                sizes="(max-width: 768px) 34vw, 400px"
                className="hero-photo-img"
                priority
              />
            ) : (
              <PhotoPlaceholder label="[FOTO]" rounded="rounded-none" />
            )}
          </div>

          <div className="hero-id">
            <span className="tag-coral">Consultora independiente Yanbal</span>
            <div>
              <p className="hero-name">
                <Filled value={name} />
              </p>
              <p className="hero-city">
                <Filled value={city} />
              </p>
            </div>
          </div>

          <h1 className="hero-title">
            Te acompaño a empezar tu propio negocio con Yanbal.
          </h1>

          <p className="hero-intro">
            Soy <Filled value={name} />, consultora en <Filled value={city} />{" "}
            desde hace <Filled value={years} /> años. Si quieres un ingreso
            extra vendiendo a tu ritmo, te explico todo por WhatsApp, sin
            compromiso.
          </p>

          <div className="hero-ctas">
            <a
              href={buildJoinWhatsAppLink(whatsapp, consultantName)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <WhatsAppIcon size={20} />
              Quiero más información
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
