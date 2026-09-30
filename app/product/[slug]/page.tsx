import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ProductGallery } from "@/components/product/ProductGallery";
import { PurchasePanel } from "@/components/product/PurchasePanel";
import { ProductDescription } from "@/components/product/ProductDescription";
import { ReviewsSection } from "@/components/product/ReviewsSection";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { ProductViewTracker } from "@/components/product/ProductViewTracker";
import { getProductImageUrls } from "@/lib/server/productImages";
import { allProducts, getProductDetailBySlug, getRelatedProducts, LEGACY_PRODUCT_SLUG_REDIRECTS } from "@/lib/mock-data";
import { getApprovedReviewStats, getApprovedReviews } from "@/lib/server/reviewsRepo";

interface ProductPageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return allProducts.map((p) => ({ slug: p.slug }));
}

// صفحه محصول شامل داده‌های زنده (موجودی نمایشی، نظرات تأییدشده) است؛
// طبق تعادل Cache/Freshness بخش ۱۹ Prompt 12، هر ساعت دوباره Revalidate
// می‌شود — نه در هر Request (که TTFB را بی‌دلیل کند می‌کرد) و نه فقط در
// زمان Build (که نظر تأییدشده جدید تا Deploy بعدی دیده نمی‌شد).
export const revalidate = 3600;

export function generateMetadata({ params }: ProductPageProps): Metadata {
  const product = getProductDetailBySlug(params.slug);
  if (!product) return {};

  const title = `خرید ${product.name}`;
  const description = `خرید آنلاین ${product.name} از دسته ${product.categoryLabel} — باقلوا کریم‌اوغلو. ${
    product.isAvailable ? "موجود برای ارسال فوری و همان‌روز." : "در حال حاضر ناموجود."
  }`;

  return {
    title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: { title, description, type: "website" },
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  // ===== Redirect ۳۰۱ برای Slugهای قدیمی (بخش «Redirectهای URL قبلی» Prompt) =====
  // permanentRedirect از Next.js با کد وضعیت 308 (معادل عملکردی 301 برای
  // موتورهای جستجو — هر دو یعنی «انتقال دائمی») ریدایرکت می‌کند؛ بررسی این
  // Map قبل از notFound انجام می‌شود تا هیچ Slug قدیمی به‌اشتباه ۴۰۴ نگیرد.
  const legacyTarget = LEGACY_PRODUCT_SLUG_REDIRECTS[params.slug];
  if (legacyTarget) {
    permanentRedirect(`/product/${legacyTarget}`);
  }

  const product = getProductDetailBySlug(params.slug);
  if (!product) notFound();

  const related = getRelatedProducts(product);

  // طبق دستور صریح («فقط داده‌های واقعی را وارد Schema کن»): چون product.rating/
  // reviewCount در این فاز داده Placeholder هستند و هیچ Review واقعی پشت آن‌ها
  // نیست، عمداً از aggregateRating در Structured Data صرف‌نظر شده — درج امتیاز
  // ساختگی در Schema.org می‌تواند به‌عنوان Structured Data گمراه‌کننده شناسایی شود.
  //
  // ✅ به‌روزرسانی Prompt 12: حالا که جدول واقعی `reviews` (Prompt 11) در
  // دسترس است، اگر واقعاً نظر تأییدشده‌ای برای این محصول ثبت شده باشد،
  // AggregateRating/Review واقعی اضافه می‌شود — وگرنه (که در حال حاضر برای
  // اکثر محصولات همین‌طور است) این فیلدها کاملاً حذف می‌مانند.
  const minVariantPrice = Math.min(
    ...product.saleTypes.flatMap((g) => g.variants.filter((v) => v.isAvailable).map((v) => v.price)),
  );

  const reviewStats = getApprovedReviewStats(product.id);
  const hasRealReviews = reviewStats.count > 0 && reviewStats.average !== null;
  const realReviews = hasRealReviews ? getApprovedReviews(product.id, 5) : [];

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    category: product.categoryLabel,
    offers: {
      "@type": "Offer",
      priceCurrency: "IRR",
      price: Number.isFinite(minVariantPrice) ? minVariantPrice : undefined,
      availability: product.isAvailable
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    ...(hasRealReviews
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(reviewStats.average!.toFixed(1)),
            reviewCount: reviewStats.count,
          },
          review: realReviews.map((r) => ({
            "@type": "Review",
            reviewRating: { "@type": "Rating", ratingValue: r.rating },
            ...(r.comment ? { reviewBody: r.comment } : {}),
          })),
        }
      : {}),
  };

  return (
    <div className="pb-28 pt-6 tablet:pb-10 tablet:pt-10">
      <ProductViewTracker productId={product.id} category={product.category} />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <Container className="flex flex-col gap-10">
        <Breadcrumb
          items={[
            { label: "خانه", href: "/" },
            { label: "فروشگاه", href: "/shop" },
            { label: product.categoryLabel, href: `/shop/${product.category}` },
            { label: product.name },
          ]}
        />

        <div className="grid grid-cols-1 gap-10 desktop:grid-cols-2">
          <ProductGallery productId={product.id} productName={product.name} imageUrls={getProductImageUrls(product.id)} />
          <PurchasePanel product={product} />
        </div>

        <ProductDescription product={product} />

        <ReviewsSection product={product} />

        <RelatedProducts products={related} />
      </Container>
    </div>
  );
}
