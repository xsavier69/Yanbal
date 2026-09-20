import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

// Solo el panel necesita refrescar la sesión. El catálogo público no llama
// a Supabase Auth, así que carga más rápido.
export const config = {
  matcher: ["/mi-tienda/:path*"],
};
