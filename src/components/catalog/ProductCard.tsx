import Image from "next/image";
import { formatPrice, buildProductWhatsAppLink } from "@/lib/utils";
import type { Product } from "@/lib/types";

export default function ProductCard({
  product,
  whatsappNumber,
  storeName,
}: {
  product: Product;
  whatsappNumber: string | null;
  storeName: string;
}) {
  const hasOffer =
    product.offer_price !== null && product.offer_price < product.price;

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden flex flex-col">
      <div className="relative w-full aspect-square bg-cream">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 240px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            🎁
          </div>
        )}
        {!product.available && (
          <span className="badge-agotado absolute top-2 left-2">Agotado</span>
        )}
        {product.available && hasOffer && (
          <span className="badge-oferta absolute top-2 left-2">Oferta</span>
        )}
      </div>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <p className="font-semibold text-charcoal leading-snug">
          {product.name}
        </p>

        <div className="flex items-baseline gap-2">
          {hasOffer ? (
            <>
              <span className="text-charcoal-soft line-through text-sm">
                {formatPrice(product.price)}
              </span>
              <span className="font-bold text-rose-dark">
                {formatPrice(product.offer_price!)}
              </span>
            </>
          ) : (
            <span className="font-bold text-charcoal">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {product.available && whatsappNumber && (
          <a
            href={buildProductWhatsAppLink(
              whatsappNumber,
              storeName,
              product.name,
              product.offer_price ?? product.price
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp mt-auto"
          >
            Pedir por WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
