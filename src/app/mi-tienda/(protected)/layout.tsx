import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminNav from "@/components/admin/AdminNav";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import SetupNotice from "@/components/admin/SetupNotice";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured) return <SetupNotice />;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/mi-tienda/login");
  }

  // Segunda barrera además de las reglas de la base de datos: si hay un
  // ADMIN_EMAIL configurado, solo esa cuenta ve el panel.
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const isAdmin = !adminEmail || user.email?.toLowerCase() === adminEmail;

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <AdminNav />
      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-6">
        {isAdmin ? (
          children
        ) : (
          <p role="alert" className="toast-error">
            Esta cuenta no tiene permiso para administrar la tienda. Toca
            «Salir» y entra con la cuenta correcta.
          </p>
        )}
      </main>
    </div>
  );
}
