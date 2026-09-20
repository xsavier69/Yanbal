/**
 * Indica si las llaves de Supabase están puestas en `.env.local`.
 * Si no lo están, la tienda se muestra en modo demostración con productos
 * de ejemplo, para poder verla en el navegador antes de conectar la base.
 */
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
