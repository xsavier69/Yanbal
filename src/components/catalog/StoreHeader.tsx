import type { Settings } from "@/lib/types";

export default function StoreHeader({
  settings,
  catalogUrl = null,
}: {
  settings: Settings | null;
  catalogUrl?: string | null;
}) {
  const storeName = settings?.store_name?.trim() || "Mi tienda Yanbal";

  return (
    <header className="hero-bg border-b border-border">
      <div className="max-w-lg mx-auto px-5 pt-10 pb-8 flex flex-col items-center text-center gap-3">
        <span className="badge-consultora">
          Página de consultora independiente Yanbal
        </span>
        <h1 className="font-heading text-4xl font-bold leading-tight text-charcoal text-balance">
          {storeName}
        </h1>
        <p className="text-charcoal-soft text-lg max-w-xs text-balance">
          Elige lo que te guste y pídelo por WhatsApp.
        </p>
        {(catalogUrl || settings?.about_text) && (
          <div className="flex flex-wrap justify-center gap-2 mt-1">
            {catalogUrl && (
              <a
                href={catalogUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pill-link"
              >
                Ver catálogo completo
              </a>
            )}
            {settings?.about_text && (
              <a href="#sobre-mi" className="pill-link">
                Sobre mí
              </a>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
