import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { DEMO_SETTINGS } from "@/lib/demoData";
import { Filled } from "@/components/Pending";
import { ph } from "@/lib/placeholder";
import { buildGeneralWhatsAppLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Cómo trato tus datos",
  description:
    "Qué datos se guardan cuando dejas tu información, para qué se usan y cómo pedir que se borren.",
  robots: { index: false, follow: true },
};

async function loadSettings() {
  if (!isSupabaseConfigured) return DEMO_SETTINGS;
  const supabase = await createClient();
  return getSettings(supabase);
}

export default async function PrivacidadPage() {
  const settings = await loadSettings();
  const name = ph(settings?.consultant_name, "[TU NOMBRE]");
  const whatsapp = settings?.whatsapp_number;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="page-section prose-measure flex-1">
        <h1 className="section-title" style={{ fontSize: 36 }}>
          Cómo trato tus datos
        </h1>

        <p className="text-ink-soft mb-8">
          Esta página explica qué pasa con la información que dejas en el
          formulario &quot;Quiero saber más&quot;, según la Ley Orgánica de
          Protección de Datos Personales del Ecuador.
        </p>

        <h2 className="section-title">Quién guarda tus datos</h2>
        <p className="mb-8">
          <Filled value={name} />, consultora independiente de Yanbal. No es
          la empresa Yanbal: es una persona.
        </p>

        <h2 className="section-title">Qué se guarda</h2>
        <ul className="reason-list mb-8">
          <li>Tu nombre</li>
          <li>Tu número de WhatsApp</li>
          <li>Tu ciudad o barrio, si lo escribiste</li>
          <li>Cuánto tiempo dijiste que le dedicarías, si lo elegiste</li>
          <li>La fecha en que llenaste el formulario</li>
        </ul>
        <p className="mb-8">
          <strong>No se pide ni se guarda</strong> tu cédula, tu correo, ni
          ningún dato de pago o tarjeta. Tampoco se guarda tu dirección IP:
          para evitar mensajes automáticos se usa un código irreversible que
          no permite identificarte.
        </p>

        <h2 className="section-title">Para qué se usan</h2>
        <p className="mb-8">
          Solo para que <Filled value={name} /> te escriba por WhatsApp y te
          cuente cómo funciona ser consultora. Nada más. No se envían boletines
          ni publicidad automática.
        </p>

        <h2 className="section-title">Quién más los ve</h2>
        <p className="mb-8">
          Nadie. Tus datos no se venden, no se comparten con otras personas ni
          con Yanbal. Están guardados en Supabase, el servicio donde vive esta
          página, y solo se pueden abrir desde la cuenta privada de{" "}
          <Filled value={name} />.
        </p>

        <h2 className="section-title">Cuánto tiempo se guardan</h2>
        <p className="mb-8">
          Mientras sigas interesada. Si dices que no te interesa, o si pasa un
          año sin contacto, se borran.
        </p>

        <h2 className="section-title">Cómo pedir que se borren</h2>
        <p className="mb-4">
          Escríbele por WhatsApp y dile que quieres que borre tus datos. Se
          hace de inmediato, sin preguntas y sin costo. También puedes pedir
          ver o corregir lo que está guardado.
        </p>
        {whatsapp && (
          <a
            href={buildGeneralWhatsAppLink(
              whatsapp,
              "Hola, quiero que borres mis datos de tu página."
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary max-w-sm mb-8"
          >
            Pedir que borren mis datos
          </a>
        )}

        <p className="mt-10">
          <Link href="/" className="footer-link">
            ← Volver a la página
          </Link>
        </p>
      </main>
    </div>
  );
}
