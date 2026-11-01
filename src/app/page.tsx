import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getSettings, getTeamTestimonials } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { DEMO_SETTINGS, DEMO_TEAM } from "@/lib/demoData";
import { isSectionVisible } from "@/lib/sections";
import { buildJoinWhatsAppLink } from "@/lib/utils";
import { catalogHref, cityOf, nameOf, whatsappOf } from "@/lib/identity";
import WhatsAppFloatingButton from "@/components/catalog/WhatsAppFloatingButton";
import JoinHero from "@/components/join/JoinHero";
import JoinStory from "@/components/join/JoinStory";
import JoinRequirements from "@/components/join/JoinRequirements";
import TeamStories from "@/components/join/TeamStories";
import JoinFaqList from "@/components/join/JoinFaqList";
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
  const name = nameOf(settings).text;
  const city = cityOf(settings).text;
  const title = `Sé consultora Yanbal en ${city} con ${name}`;
  const description = `Te acompaño a empezar tu propio negocio con Yanbal en ${city}. Te explico todo por WhatsApp, sin compromiso.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website", locale: "es_EC" },
  };
}

export default async function InvitacionPage() {
  const { settings, team } = await loadJoin();

  const consultantName = nameOf(settings).text;
  const whatsapp = whatsappOf(settings);
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

        <JoinClosing settings={settings} consultantName={consultantName} />
      </main>

      <JoinFooter
        consultantName={consultantName}
        year={year}
        catalogUrl={catalogHref()}
      />

      {/* Siempre a la vista: la acción que más importa es escribirle */}
      <WhatsAppFloatingButton
        href={buildJoinWhatsAppLink(whatsapp, consultantName)}
      />
    </div>
  );
}
