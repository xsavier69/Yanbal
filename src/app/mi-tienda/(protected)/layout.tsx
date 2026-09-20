import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminNav from "@/components/admin/AdminNav";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
