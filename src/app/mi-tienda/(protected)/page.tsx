"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
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
            <li
              key={product.id}
              className="bg-white rounded-2xl border border-border p-3 flex items-center gap-3"
            >
              <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-cream border border-border">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    📦
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-charcoal text-lg truncate">
                  {product.name}
                </p>
                <p className="text-charcoal-soft">
                  {formatPrice(product.offer_price ?? product.price)}
                </p>
              </div>

              <div className="flex flex-col items-stretch gap-2 shrink-0">
                <Link
                  href={`/mi-tienda/producto/${product.id}`}
                  className="flex items-center justify-center min-h-[48px] min-w-[104px] text-center text-base font-semibold px-3 rounded-xl border-2"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-charcoal)",
                  }}
                >
                  Editar
                </Link>
                <button
                  type="button"
                  onClick={() => toggleAvailable(product)}
                  disabled={pendingId === product.id}
                  aria-pressed={product.available}
                  className="min-h-[48px] min-w-[104px] text-base font-semibold px-3 rounded-xl"
                  style={{
                    background: product.available
                      ? "var(--color-success-bg)"
                      : "var(--color-danger-bg)",
                    color: product.available
                      ? "var(--color-success)"
                      : "var(--color-danger)",
                  }}
                >
                  {product.available ? "✓ Disponible" : "Agotado"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
