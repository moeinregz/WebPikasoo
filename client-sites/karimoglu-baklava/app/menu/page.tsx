import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getGeneralMenu } from "@/lib/server/menuRepo";
import { branches } from "@/lib/mock-data";

// داده‌ها از PostgreSQL می‌آیند؛ صفحه نباید موقع Build (بدون دسترسی به دیتابیس) استاتیک ساخته و ثابت بماند.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "منو",
  description: "منوی باقلوا، شیرینی و نوشیدنی کریم‌اوغلو.",
  alternates: { canonical: "/menu" },
};

/**
 * ===== صفحه منو (بخش ۶ Prompt) =====
 *
 * منو به‌صورت یک Image ثابت بدون ساختار رها نشده — رجوع به
 * lib/server/menuRepo.ts: هر منو در دیتابیس یک رکورد با تصاویر و وضعیت
 * فعال/غیرفعال مجزا دارد و به شعب مرتبط وصل است؛ این صفحه فقط همان داده
 * را نمایش می‌دهد.
 *
 * این صفحه منوی «عمومی» (مشترک بین همه شعب) را نشان می‌دهد. تجریش منوی
 * غذای اضافه و پیروزی منوی ویژه خودش را دارد — این دو با هم یکسان نیستند؛
 * هرکدام در صفحه همان شعبه (/branches/[slug]) نمایش داده می‌شود، چون به
 * شعبه خاص وابسته است.
 */
export default async function MenuPage() {
  const generalMenu = await getGeneralMenu();
  const tajrish = branches.find((b) => b.id === "tajrish" && b.status === "active");
  const piroozi = branches.find((b) => b.id === "piroozi" && b.status === "active");

  return (
    <div className="py-6 tablet:py-10">
      <Container className="flex flex-col gap-8">
        <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "منو" }]} />
        <h1 className="text-h2Mobile tablet:text-h2 text-text-primary">منو</h1>

        {generalMenu && generalMenu.images.length > 0 ? (
          <div className="flex max-w-xl flex-col gap-4">
            {generalMenu.images.map((img) => (
              <Image
                key={img.id}
                src={img.imagePath}
                alt={img.altText}
                width={900}
                height={1280}
                className="w-full rounded-lg border border-border"
              />
            ))}
          </div>
        ) : (
          <p className="text-bodySm text-text-muted">منو در حال حاضر در دسترس نیست.</p>
        )}

        {(tajrish || piroozi) && (
          <section className="rounded-lg bg-bg-secondary p-5">
            <h2 className="mb-2 text-h4 text-text-primary">منوهای ویژه شعب</h2>
            <p className="mb-3 text-bodySm text-text-secondary">
              علاوه بر منوی بالا، هر شعبه زیر منوی جداگانه خودش را هم دارد:
            </p>
            <div className="flex flex-col gap-1">
              {tajrish && (
                <Link href={`/branches/${tajrish.slug}`} className="text-bodySm text-brand-red hover:underline">
                  منوی غذا (ساندویچ، پیتزا، سوخاری و کباب) — شعبه تجریش ←
                </Link>
              )}
              {piroozi && (
                <Link href={`/branches/${piroozi.slug}`} className="text-bodySm text-brand-red hover:underline">
                  منوی ویژه (باقلوای کیلویی، کیک، نوشیدنی و صبحانه) — شعبه پیروزی ←
                </Link>
              )}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
}
