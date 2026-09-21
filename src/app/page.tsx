import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getSettings, getAllProducts } from "@/lib/queries";
import StoreHeader from "@/components/catalog/StoreHeader";
import CampaignBanner from "@/components/catalog/CampaignBanner";
import ProductCarousel from "@/components/catalog/ProductCarousel";
import CatalogClient from "@/components/catalog/CatalogClient";
import HowToBuy from "@/components/catalog/HowToBuy";
import AboutSection from "@/components/catalog/AboutSection";
import WhatsAppFloatingButton from "@/components/catalog/WhatsAppFloatingButton";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { DEMO_SETTINGS, DEMO_PRODUCTS } from "@/lib/demoData";
import { isSectionVisible } from "@/lib/sections";
import { safeHttpUrl, todayInEcuador } from "@/lib/campaign";
import { hasValidOffer, isNewProduct } from "@/lib/utils";

async function loadCatalog() {
  const nowMs = Date.now();
  const today = todayInEcuador(new Date(nowMs));

  if (!isSupabaseConfigured) {
    return { settings: DEMO_SETTINGS, products: DEMO_PRODUCTS, nowMs, today };
  }
  const supabase = await createClient();
  const [settings, products] = await Promise.all([
    getSettings(supabase),
    getAllProducts(supabase),
  ]);
  return { settings, products, nowMs, today };
}

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await loadCatalog();
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

// Una sección con carrusel solo se muestra si tiene al menos 2 productos
const MIN_CAROUSEL_ITEMS = 2;

export default async function HomePage() {
  const { settings, products, nowMs, today } = await loadCatalog();

  const storeName = settings?.store_name?.trim() || "Mi tienda Yanbal";
  const year = new Date(nowMs).getFullYear();
  const whatsappNumber = settings?.whatsapp_number ?? null;

  const showCampaign = isSectionVisible(settings, "campaign");
  const catalogUrl = showCampaign
    ? safeHttpUrl(settings?.official_catalog_url)
    : null;

  const inStock = products.filter((p) => p.available);
  const newProducts = isSectionVisible(settings, "news")
    ? inStock.filter((p) => isNewProduct(p.created_at, nowMs))
    : [];
  const offerProducts = isSectionVisible(settings, "offers")
    ? inStock.filter(hasValidOffer)
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      {!isSupabaseConfigured && (
        <p className="bg-charcoal text-white text-center text-sm px-4 py-2">
          Modo demostración: estos productos son de ejemplo. Conecta Supabase
          para usar tus productos reales.
        </p>
      )}

      {showCampaign && (
        <CampaignBanner
          number={settings?.campaign_number ?? null}
          endDate={settings?.campaign_end_date ?? null}
          todayFromServer={today}
        />
      )}

      <StoreHeader settings={settings} catalogUrl={catalogUrl} />

      <main className="flex-1 max-w-lg mx-auto w-full px-4 pt-6 pb-10 flex flex-col gap-8">
        {newProducts.length >= MIN_CAROUSEL_ITEMS && (
          <ProductCarousel
            id="novedades"
            title="Novedades"
            products={newProducts}
            whatsappNumber={whatsappNumber}
            storeName={storeName}
            nowMs={nowMs}
          />
        )}
        {offerProducts.length >= MIN_CAROUSEL_ITEMS && (
          <ProductCarousel
            id="ofertas"
            title="En oferta"
            products={offerProducts}
            whatsappNumber={whatsappNumber}
            storeName={storeName}
            nowMs={nowMs}
          />
        )}

        <CatalogClient
          products={products}
          whatsappNumber={whatsappNumber}
          storeName={storeName}
          nowMs={nowMs}
        />
      </main>

      {isSectionVisible(settings, "howto") && (
        <HowToBuy
          paymentMethods={settings?.payment_methods ?? null}
          deliveryInfo={settings?.delivery_info ?? null}
        />
      )}

      <AboutSection settings={settings} />

      <footer className="border-t border-border py-6 pb-24 text-center text-charcoal-soft">
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
