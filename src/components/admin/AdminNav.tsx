"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/mi-tienda/login");
    router.refresh();
  }

  const isAjustes = pathname?.startsWith("/mi-tienda/ajustes");

  return (
    <header className="bg-white border-b border-border">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link href="/mi-tienda" className="font-heading text-xl font-bold text-charcoal">
          Mi tienda
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/mi-tienda/ajustes"
            className="text-base font-semibold px-3 py-2 rounded-lg"
            style={{
              color: isAjustes ? "var(--color-rose-dark)" : "var(--color-charcoal)",
              background: isAjustes ? "var(--color-peach-light)" : "transparent",
            }}
          >
            Ajustes
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="text-base font-semibold px-3 py-2 rounded-lg text-charcoal-soft"
          >
            Salir
          </button>
        </nav>
      </div>
    </header>
  );
}
