import Link from "next/link";
import type { ProductSummary } from "@/lib/types";
import { ProductCard } from "@/components/ui/ProductCard";
import { attachProductImages } from "@/lib/server/productImages";

export function RelatedProducts({ products }: { products: ProductSummary[] }) {
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="related-products-heading" className="flex flex-col gap-4">
      <h2 id="related-products-heading" className="text-h3 text-text-primary">
        محصولات مرتبط
      </h2>
      <div className="grid grid-cols-2 gap-4 tablet:grid-cols-4">
        {attachProductImages(products).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
