"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/components/catalog/ProductCard";
import { CATEGORIES } from "@/lib/types";
import { isNewProduct } from "@/lib/utils";
import type { Product } from "@/lib/types";

export default function CatalogClient({
  products,
  whatsappNumber,
  storeName,
  nowMs,
}: {
  products: Product[];
  whatsappNumber: string | null;
  storeName: string;
  nowMs: number;
}) {
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const usedCategories = useMemo(
    () => CATEGORIES.filter((c) => products.some((p) => p.category === c)),
    [products]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (category && p.category !== category) return false;
      if (q && !p.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [products, category, search]);

  const available = filtered.filter((p) => p.available);
  const soldOut = filtered.filter((p) => !p.available);

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-line p-8 text-center">
        <p className="text-lg text-ink-soft">
          Todavía no hay productos en el catálogo. ¡Vuelve pronto!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="sr-only">Todos los productos</h2>
      <div className="catalog-toolbar">
      <div>
        <label htmlFor="buscar-producto" className="sr-only">
          Buscar producto por nombre
        </label>
        <input
          id="buscar-producto"
          type="search"
          className="field-input"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {usedCategories.length > 1 && (
        <div
          className="chip-row"
          role="group"
          aria-label="Filtrar por categoría"
        >
          <button
            type="button"
            className="chip"
            aria-pressed={category === null}
            onClick={() => setCategory(null)}
          >
            Todos
          </button>
          {usedCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              className="chip"
              aria-pressed={category === cat}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-ink-soft text-lg text-center py-8">
          No encontramos productos con esa búsqueda.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3.5">
          {available.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              whatsappNumber={whatsappNumber}
              storeName={storeName}
              isNew={isNewProduct(product.created_at, nowMs)}
            />
          ))}
          {soldOut.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              whatsappNumber={whatsappNumber}
              storeName={storeName}
              isNew={isNewProduct(product.created_at, nowMs)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
