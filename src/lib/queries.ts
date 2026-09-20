import type { SupabaseClient } from "@supabase/supabase-js";
import type { Product, Settings } from "@/lib/types";

export async function getSettings(
  supabase: SupabaseClient
): Promise<Settings | null> {
  const { data } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  return data as Settings | null;
}

export async function getAllProducts(
  supabase: SupabaseClient
): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("No se pudieron cargar los productos:", error.message);
    return [];
  }
  return (data ?? []) as Product[];
}
