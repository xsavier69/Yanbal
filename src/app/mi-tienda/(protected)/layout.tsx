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

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <AdminNav />
      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
