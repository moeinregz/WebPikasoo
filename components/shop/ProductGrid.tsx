import type { ProductSummary } from "@/lib/types";
import { ProductCard } from "@/components/ui/ProductCard";
import { attachProductImages } from "@/lib/server/productImages";

export function ProductGrid({ products }: { products: ProductSummary[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 tablet:grid-cols-3 desktop:grid-cols-4">
      {attachProductImages(products).map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
