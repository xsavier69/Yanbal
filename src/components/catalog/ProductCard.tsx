import Image from "next/image";
import { formatPrice, buildProductWhatsAppLink } from "@/lib/utils";
import WhatsAppIcon from "@/components/catalog/WhatsAppIcon";
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
  const discount = hasOffer
    ? Math.round((1 - product.offer_price! / product.price) * 100)
    : 0;
  const initial = product.name.trim().charAt(0).toUpperCase();

  return (
    <article
      className="product-card"
      data-soldout={!product.available || undefined}
    >
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
          <div className="photo-placeholder" aria-hidden="true">
            {initial}
          </div>
        )}
        {!product.available && (
          <span className="badge-agotado absolute top-2 left-2">Agotado</span>
        )}
        {product.available && hasOffer && (
          <span className="badge-oferta absolute top-2 left-2">
            {discount >= 5 ? `-${discount}%` : "Oferta"}
          </span>
        )}
      </div>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <h3 className="font-heading font-semibold text-charcoal leading-snug text-[17px] line-clamp-2">
          {product.name}
        </h3>

        <div className="flex items-baseline flex-wrap gap-x-2">
          {hasOffer ? (
            <>
              <span className="font-heading font-bold text-xl text-rose-dark">
                {formatPrice(product.offer_price!)}
              </span>
              <span className="text-charcoal-soft line-through text-sm">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="font-heading font-bold text-xl text-charcoal">
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
            <WhatsAppIcon size={20} />
            Pedir
          </a>
        )}
      </div>
    </article>
  );
}
