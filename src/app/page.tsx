import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getSettings, getAllProducts } from "@/lib/queries";
import StoreHeader from "@/components/catalog/StoreHeader";
import CatalogClient from "@/components/catalog/CatalogClient";
import AboutSection from "@/components/catalog/AboutSection";
import WhatsAppFloatingButton from "@/components/catalog/WhatsAppFloatingButton";

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const settings = await getSettings(supabase);
  const storeName = settings?.store_name?.trim() || "Mi tienda Yanbal";
  const description =
    "Catálogo de productos Yanbal. Pide tus productos favoritos por WhatsApp.";

  return {
    title: storeName,
    description,
    openGraph: {
      title: storeName,
      description,
      type: "website",
      locale: "es_EC",
    },
  };
}

export default async function HomePage() {
  const supabase = await createClient();
  const [settings, products] = await Promise.all([
    getSettings(supabase),
    getAllProducts(supabase),
  ]);

  const storeName = settings?.store_name?.trim() || "Mi tienda Yanbal";
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <StoreHeader settings={settings} />

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        <CatalogClient
          products={products}
          whatsappNumber={settings?.whatsapp_number ?? null}
          storeName={storeName}
        />
      </main>

      <AboutSection settings={settings} />

      <footer className="border-t border-border py-6 text-center text-charcoal-soft">
        <p className="badge-consultora mb-2">
          Página de consultora independiente Yanbal
        </p>
        <p className="text-sm">
          © {year} {storeName}
        </p>
      </footer>

      {settings?.whatsapp_number && (
        <WhatsAppFloatingButton
          whatsappNumber={settings.whatsapp_number}
          welcomeMessage={settings.welcome_message}
        />
      )}
    </div>
  );
}
