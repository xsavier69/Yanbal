import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/queries";
import LeadsPanel from "@/components/admin/leads/LeadsPanel";
import ShareLinks from "@/components/admin/leads/ShareLinks";
import type { Lead } from "@/lib/types";

export const metadata = { title: "Personas interesadas" };

export default async function InteresadasPage() {
  const supabase = await createClient();
  const [settings, { data, error }] = await Promise.all([
    getSettings(supabase),
    supabase.from("leads").select("*").order("created_at", { ascending: false }),
  ]);

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="font-heading text-2xl text-ink">Personas interesadas</h1>
        <p role="alert" className="toast-error">
          No se pudo abrir la lista. Revisa tu internet y vuelve a entrar.
        </p>
        <Link href="/mi-tienda" className="btn-secondary">
          Volver a mis productos
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <LeadsPanel
        initialLeads={(data ?? []) as Lead[]}
        consultantName={settings?.consultant_name?.trim() || "tu consultora"}
      />
      <ShareLinks />

      <Link href="/mi-tienda" className="btn-secondary">
        Volver a mis productos
      </Link>
    </div>
  );
}
