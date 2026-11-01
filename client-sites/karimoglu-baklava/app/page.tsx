import { Hero } from "@/components/home/Hero";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { BrandStory } from "@/components/home/BrandStory";
import { ProductExperience } from "@/components/home/ProductExperience";
import { BranchFinder } from "@/components/home/BranchFinder";
import { DeliveryExperience } from "@/components/home/DeliveryExperience";
import { CafeExperience } from "@/components/home/CafeExperience";
import { SocialProof } from "@/components/home/SocialProof";
import { FinalCta } from "@/components/home/FinalCta";
import { FlavorBand } from "@/components/home/FlavorBand";
import { HoneyDripDivider } from "@/components/fx/HoneyDripDivider";
import { Scallop } from "@/components/decor/Scallop";

// داده‌ها از PostgreSQL می‌آیند؛ صفحه نباید موقع Build (بدون دسترسی به دیتابیس) استاتیک ساخته و ثابت بماند.
export const dynamic = "force-dynamic";

/**
 * ترتیب Sectionها دقیقاً طبق تصمیم نهایی‌شده در سند UX Architecture (بخش ۳) است:
 * Hero → دسته‌بندی‌ها → محصولات پرفروش → اعتمادسازی/تجربه محصول → کافه →
 * شعب → ارسال → نظرات → CTA نهایی.
 * فقط یک H1 در کل صفحه وجود دارد (داخل Hero)؛ بقیه Sectionها از H2 استفاده می‌کنند.
 */
export default function HomePage() {
  return (
    <>
      {/* هر سکشن رنگ مات خودش را دارد؛ بین‌شان لبه «شهدچکان» یا «کاغذ شیرینی»
          رنگ سکشن قبلی را روی سکشن بعدی می‌ریزد. */}
      <Hero />
      <HoneyDripDivider color="#2E2018" />
      <FlavorBand />
      <CategoryShowcase />
      <FeaturedProducts />
      <ProductExperience />
      <HoneyDripDivider color="#B8273A" />
      <BrandStory />
      <CafeExperience />
      <HoneyDripDivider color="#DFA03F" />
      <BranchFinder />
      <DeliveryExperience />
      <Scallop color="#2E2018" />
      <SocialProof />
      <FinalCta />
    </>
  );
}
