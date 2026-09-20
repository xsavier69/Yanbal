import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

export default function ProductRow({
  product,
  pending,
  onToggle,
}: {
  product: Product;
  pending: boolean;
  onToggle: (product: Product) => void;
}) {
  return (
    <li className="bg-white rounded-2xl border border-border p-3 flex items-center gap-3">
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
        <p className="font-semibold text-charcoal text-lg leading-snug line-clamp-2">
          {product.name}
        </p>
        <p className="text-charcoal-soft">
          {formatPrice(product.offer_price ?? product.price)}
        </p>
      </div>

      <div className="flex flex-col items-stretch gap-2 shrink-0">
        <Link
          href={`/mi-tienda/producto/${product.id}`}
          className="flex items-center justify-center min-h-[48px] w-[128px] text-center text-base font-semibold px-3 rounded-xl border-2"
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-charcoal)",
          }}
        >
          Editar
        </Link>
        <button
          type="button"
          onClick={() => onToggle(product)}
          disabled={pending}
          aria-pressed={product.available}
          className="min-h-[48px] w-[128px] text-base font-semibold px-3 rounded-xl"
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
  );
}
