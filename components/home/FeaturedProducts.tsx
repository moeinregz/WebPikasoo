import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductCard } from "@/components/ui/ProductCard";
import { Button } from "@/components/ui/Button";
import { featuredProducts } from "@/lib/mock-data";
import { attachProductImages } from "@/lib/server/productImages";

export function FeaturedProducts() {
  return (
    <section aria-labelledby="featured-heading" className="bg-bg-secondary py-12 tablet:py-16">
      <Container className="flex flex-col gap-8">
        <SectionHeading
          title="محبوب‌ترین‌های کریم‌اوغلو"
          description="طعم‌هایی که مشتریان ما بیشتر از همه انتخاب می‌کنند."
          action={
            <Link href="/shop">
              <Button variant="ghost">مشاهده همه محصولات</Button>
            </Link>
          }
        />
        <div className="grid grid-cols-2 gap-4 tablet:grid-cols-3 desktop:grid-cols-4">
          {attachProductImages(featuredProducts).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="flex justify-center tablet:hidden">
          <Link href="/shop">
            <Button variant="secondary">مشاهده همه محصولات</Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}
