import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/admin/ProductForm";
import type { Product } from "@/lib/types";

export default async function EditarProductoPage({
  params,
}: PageProps<"/mi-tienda/producto/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  return <ProductForm mode="editar" product={data as Product} />;
}
