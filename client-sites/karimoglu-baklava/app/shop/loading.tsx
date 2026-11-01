import { Container } from "@/components/ui/Container";
import { ProductGridSkeleton } from "@/components/shop/ProductGridSkeleton";

export default function ShopLoading() {
  return (
    <div className="py-6 tablet:py-10">
      <Container className="flex flex-col gap-6">
        <div className="h-4 w-40 animate-pulse rounded bg-bg-secondary" />
        <div className="h-9 w-56 animate-pulse rounded bg-bg-secondary" />
        <ProductGridSkeleton />
      </Container>
    </div>
  );
}
