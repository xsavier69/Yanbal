import type { Settings } from "@/lib/types";

export default function StoreHeader({ settings }: { settings: Settings | null }) {
  const storeName = settings?.store_name?.trim() || "Mi tienda Yanbal";

  return (
    <header className="bg-white border-b border-border">
      <div className="max-w-lg mx-auto px-4 py-6 flex flex-col items-center text-center gap-2">
        <h1 className="font-heading text-3xl font-bold text-charcoal">
          {storeName}
        </h1>
        <span className="badge-consultora">
          Página de consultora independiente Yanbal
        </span>
        {settings?.about_text && (
          <a href="#sobre-mi" className="text-rose-dark font-semibold mt-1">
            Sobre mí
          </a>
        )}
      </div>
    </header>
  );
}
