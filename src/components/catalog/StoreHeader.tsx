import type { Settings } from "@/lib/types";

export default function StoreHeader({ settings }: { settings: Settings | null }) {
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
        {settings?.about_text && (
          <a href="#sobre-mi" className="pill-link mt-1">
            Sobre mí
          </a>
        )}
      </div>
    </header>
  );
}
