"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import ProductRow from "@/components/admin/ProductRow";
import type { Product } from "@/lib/types";

export default function AdminHomePage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [search, setSearch] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setErrorMsg("No se pudieron cargar tus productos. Revisa tu internet.");
          return;
        }
        setProducts((data ?? []) as Product[]);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!products) return [];
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, search]);

  async function toggleAvailable(product: Product) {
    setPendingId(product.id);
    const supabase = createClient();
    const nextValue = !product.available;
    const { error } = await supabase
      .from("products")
      .update({ available: nextValue })
      .eq("id", product.id);
    setPendingId(null);

    if (error) {
      setErrorMsg("No hay conexión. No se pudo cambiar el estado, intenta de nuevo.");
      return;
    }
    setProducts(
      (prev) =>
        prev?.map((p) =>
          p.id === product.id ? { ...p, available: nextValue } : p
        ) ?? null
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href="/mi-tienda/producto/nuevo" className="btn-primary">
        <span aria-hidden="true">＋</span> Agregar producto
      </Link>

      {errorMsg && (
        <p role="alert" className="toast-error">
          {errorMsg}
        </p>
      )}

      {products && products.length > 20 && (
        <div>
          <label htmlFor="buscar" className="field-label">
            Buscar producto
          </label>
          <input
            id="buscar"
            type="search"
            className="field-input"
            placeholder="Escribe el nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      <div>
        <h2 className="font-heading text-xl font-bold text-charcoal mb-3">
          Tus productos
        </h2>

        {products === null && (
          <p className="text-charcoal-soft text-lg">Cargando tus productos...</p>
        )}

        {products !== null && products.length === 0 && (
          <div className="bg-white rounded-2xl p-6 border border-border text-center">
            <p className="text-lg text-charcoal-soft">
              Todavía no tienes productos. Toca &quot;Agregar producto&quot; para
              subir el primero.
            </p>
          </div>
        )}

        {products !== null && products.length > 0 && filtered.length === 0 && (
          <p className="text-charcoal-soft text-lg">
            No encontramos productos con ese nombre.
          </p>
        )}

        <ul className="flex flex-col gap-3">
          {filtered.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              pending={pendingId === product.id}
              onToggle={toggleAvailable}
            />
          ))}
        </ul>
      </div>

      <div className="border-t border-border pt-6">
        <Link href="/mi-tienda/ajustes" className="btn-secondary">
          Ajustes de mi página
        </Link>
      </div>
    </div>
  );
}
