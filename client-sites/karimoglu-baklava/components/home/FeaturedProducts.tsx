import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductCard } from "@/components/ui/ProductCard";
import { Button } from "@/components/ui/Button";
import { Stagger, StaggerItem } from "@/components/fx/Reveal";
import { Parallax } from "@/components/fx/Parallax";
import { Pistachio } from "@/components/decor/Baklava";
import { getFeaturedProducts } from "@/lib/server/catalog";
import { attachProductImages } from "@/lib/server/productImages";

export async function FeaturedProducts() {
  const products = await attachProductImages(await getFeaturedProducts());
  return (
    <section
      aria-labelledby="featured-heading"
      className="matte relative overflow-hidden border-y-2 border-brand-black bg-pistachio-light bg-lattice-pistachio py-16 tablet:py-24"
    >
      <Parallax speed={0.5} rotate={40} className="pointer-events-none absolute -left-6 top-10 w-24 opacity-90 tablet:w-32">
        <Pistachio className="w-full" />
      </Parallax>
      <Parallax speed={-0.4} rotate={-30} className="pointer-events-none absolute -right-4 bottom-16 w-20 tablet:w-28">
        <Pistachio className="w-full" />
      </Parallax>

      <Container className="relative flex flex-col gap-10">
        <SectionHeading
          id="featured-heading"
          eyebrow="پرفروش‌ها"
          title="محبوب‌ترین‌های کریم‌اوغلو"
          description="طعم‌هایی که مشتریان ما بیشتر از همه انتخاب می‌کنند."
          action={
            <Link href="/shop">
              <Button variant="secondary">مشاهده همه محصولات ←</Button>
            </Link>
          }
        />
        <Stagger className="grid grid-cols-2 gap-4 tablet:grid-cols-3 tablet:gap-6 desktop:grid-cols-4">
          {products.map((product) => (
            <StaggerItem key={product.id} className="h-full">
              <ProductCard product={product} />
            </StaggerItem>
          ))}
        </Stagger>
        <div className="flex justify-center tablet:hidden">
          <Link href="/shop">
            <Button variant="secondary">مشاهده همه محصولات</Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}
