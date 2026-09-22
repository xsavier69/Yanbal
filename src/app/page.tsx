import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getSettings, getTeamTestimonials } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { DEMO_SETTINGS, DEMO_TEAM } from "@/lib/demoData";
import { isSectionVisible } from "@/lib/sections";
import { readSource } from "@/lib/join";
import { ph } from "@/lib/placeholder";
import JoinHero from "@/components/join/JoinHero";
import JoinStory from "@/components/join/JoinStory";
import JoinRequirements from "@/components/join/JoinRequirements";
import TeamStories from "@/components/join/TeamStories";
import JoinFaqList from "@/components/join/JoinFaqList";
import LeadForm from "@/components/join/LeadForm";
import JoinClosing from "@/components/join/JoinClosing";
import JoinFooter from "@/components/join/JoinFooter";

async function loadJoin() {
  if (!isSupabaseConfigured) {
    return { settings: DEMO_SETTINGS, team: DEMO_TEAM };
  }
  const supabase = await createClient();
  const [settings, team] = await Promise.all([
    getSettings(supabase),
    getTeamTestimonials(supabase),
  ]);
  return { settings, team };
}

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await loadJoin();
  const name = ph(settings?.consultant_name, "[TU NOMBRE]").text;
  const city = ph(settings?.city, "[CIUDAD]").text;
  const title = `Sé consultora Yanbal en ${city} con ${name}`;
  const description = `Te acompaño a empezar tu propio negocio con Yanbal en ${city}. Te explico todo por WhatsApp, sin compromiso.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website", locale: "es_EC" },
  };
}

export default async function InvitacionPage({
  searchParams,
}: PageProps<"/">) {
  const { settings, team } = await loadJoin();
  const params = await searchParams;
  const source = readSource(params.origen);

  const consultantName = ph(settings?.consultant_name, "[TU NOMBRE]").text;
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col">
      {!isSupabaseConfigured && (
        <p className="bg-ink text-white text-center text-sm px-4 py-2">
          Modo demostración: esta página usa datos de ejemplo.
        </p>
      )}

      <JoinHero settings={settings} consultantName={consultantName} />

      <main id="contenido">

      <JoinStory settings={settings} consultantName={consultantName} />

      <JoinRequirements settings={settings} />

      <div className="band-sky border-y border-line">
        {isSectionVisible(settings, "team") && (
          <TeamStories testimonials={team} />
        )}
        {isSectionVisible(settings, "joinFaq") && (
          <JoinFaqList settings={settings} consultantName={consultantName} />
        )}
      </div>

      <section
        id="quiero-saber-mas"
        aria-labelledby="quiero-saber-mas-titulo"
        className="page-section"
      >
        <h2 id="quiero-saber-mas-titulo" className="section-title">
          Quiero saber más
        </h2>
        <p className="prose-measure text-ink-soft mb-6">
          Déjame tus datos y te escribo. No necesitas cédula ni correo para
          esto: eso va después, en el registro oficial de Yanbal.
        </p>
        <LeadForm
          consultantName={consultantName}
          whatsappNumber={settings?.whatsapp_number ?? null}
          source={source}
        />
      </section>

        <JoinClosing settings={settings} consultantName={consultantName} />
      </main>

      <JoinFooter consultantName={consultantName} year={year} />
    </div>
  );
}
