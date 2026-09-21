import ProductCard from "@/components/catalog/ProductCard";
import { isNewProduct } from "@/lib/utils";
import type { Product } from "@/lib/types";

export default function ProductCarousel({
  id,
  title,
  products,
  whatsappNumber,
  storeName,
  nowMs,
}: {
  id: string;
  title: string;
  products: Product[];
  whatsappNumber: string | null;
  storeName: string;
  nowMs: number;
}) {
  return (
    <section aria-labelledby={`${id}-titulo`}>
      <h2 id={`${id}-titulo`} className="section-title">
        {title}
      </h2>
      <div
        className="carousel"
        role="region"
        aria-label={title}
        tabIndex={0}
      >
        {products.map((product) => (
          <div key={product.id} className="carousel-item">
            <ProductCard
              product={product}
              whatsappNumber={whatsappNumber}
              storeName={storeName}
              isNew={isNewProduct(product.created_at, nowMs)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
