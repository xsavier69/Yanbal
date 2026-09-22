import Image from "next/image";
import Link from "next/link";
import Signature from "@/components/join/Signature";
import WhatsAppIcon from "@/components/catalog/WhatsAppIcon";
import { Filled, PhotoPlaceholder } from "@/components/Pending";
import { buildJoinWhatsAppLink } from "@/lib/utils";
import { ph, phNumber } from "@/lib/placeholder";
import type { Settings } from "@/lib/types";

export default function JoinHero({
  settings,
  consultantName,
}: {
  settings: Settings | null;
  consultantName: string;
}) {
  const city = ph(settings?.city, "[CIUDAD]");
  const years = phNumber(settings?.years_selling, "[X]");
  const name = ph(settings?.consultant_name, "[TU NOMBRE]");
  const whatsapp = settings?.whatsapp_number;

  return (
    <header className="page-section is-tight is-hero">
      <div className="mb-5">
        <Link href="/productos" className="text-blue font-semibold">
          ¿Solo quieres comprar? Ver mis productos →
        </Link>
      </div>

      <div className="md:grid md:grid-cols-2 md:gap-10 md:items-center">
        <div className="relative w-full aspect-[4/3] md:aspect-[4/5] max-h-[52vh] md:max-h-[68vh] rounded-xl overflow-hidden mb-6 md:mb-0">
          {settings?.hero_photo_url ? (
            <Image
              src={settings.hero_photo_url}
              alt={`${consultantName}, consultora Yanbal`}
              fill
              sizes="(max-width: 768px) 100vw, 440px"
              className="object-cover"
              priority
            />
          ) : (
            <PhotoPlaceholder
              label="[FOTO DE ELLA — vertical, de frente, luz natural]"
              className="absolute inset-0"
              rounded="rounded-xl"
            />
          )}
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="hero-title text-balance">
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
            {whatsapp && (
              <a
                href={buildJoinWhatsAppLink(whatsapp, consultantName)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                <WhatsAppIcon size={20} />
                Escribirme por WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
