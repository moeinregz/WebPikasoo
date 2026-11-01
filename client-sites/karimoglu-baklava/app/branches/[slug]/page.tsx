import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { branches } from "@/lib/mock-data";
import { buildLocalBusinessSchema } from "@/lib/seo/localBusinessSchema";
import { getMenusForBranch } from "@/lib/server/menuRepo";

// داده‌ها از PostgreSQL می‌آیند؛ صفحه نباید موقع Build (بدون دسترسی به دیتابیس) استاتیک ساخته و ثابت بماند.
export const dynamic = "force-dynamic";

interface BranchPageProps {
  params: { slug: string };
}

function getBranch(slug: string) {
  return branches.find((b) => b.slug === slug);
}

export function generateStaticParams() {
  return branches.map((b) => ({ slug: b.slug }));
}

export function generateMetadata({ params }: BranchPageProps): Metadata {
  const branch = getBranch(params.slug);
  if (!branch) return {};

  const title = `شعبه ${branch.name} — باقلوا کریم‌اوغلو ${branch.city}`;
  const description = `آدرس، تلفن (${branch.phone ?? "به‌زودی"}) و ساعت کاری شعبه ${branch.name} باقلوا کریم‌اوغلو در ${branch.city}. ${
    branch.hasCafeService ? "دارای کافه." : ""
  } امکان ارسال فوری و همان‌روز.`;

  return {
    title,
    description,
    alternates: { canonical: `/branches/${branch.slug}` },
    openGraph: { title, description, type: "website" },
  };
}

const DELIVERY_METHOD_LABELS: Record<string, string> = {
  express: "ارسال فوری",
  "same-day": "ارسال همان‌روز",
};

export default async function BranchPage({ params }: BranchPageProps) {
  const branch = getBranch(params.slug);
  if (!branch) notFound();

  const schema = buildLocalBusinessSchema(branch);
  const menus = await getMenusForBranch(branch.id);

  return (
    <div className="py-6 tablet:py-10">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Container className="flex flex-col gap-8">
        <Breadcrumb
          items={[
            { label: "خانه", href: "/" },
            { label: "شعبه‌ها", href: "/branches" },
            { label: branch.name },
          ]}
        />

        <div className="flex flex-col gap-2">
          <h1 className="text-h1Mobile tablet:text-h1 text-text-primary">
            شعبه {branch.name} — باقلوا کریم‌اوغلو {branch.city}
          </h1>
          <p className="max-w-[70ch] text-body text-text-secondary">
            شعبه {branch.name} یکی از شعبه‌های فعال باقلوا کریم‌اوغلو در {branch.city} است که باقلوا، استانبولی، باقلوا
            عربی و شیرینی خشک را با امکان ارسال فوری و همان‌روز عرضه می‌کند.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2">
          <section className="rounded-lg bg-surface p-5 shadow-sm">
            <h2 className="mb-3 text-h4 text-text-primary">اطلاعات تماس و ساعت کاری</h2>
            <dl className="flex flex-col gap-2 text-bodySm">
              <Row label="شهر" value={branch.city} />
              {branch.phone && <Row label="تلفن" value={branch.phone} ltr />}
              <Row label="ساعت کاری" value={branch.openingHours} />
              <Row label="کافه" value={branch.hasCafeService ? "دارد" : "ندارد"} />
              {branch.shortArea ? (
                <Row label="آدرس" value={branch.shortArea} />
              ) : (
                <Row label="آدرس دقیق" value="به‌زودی تکمیل می‌شود" muted />
              )}
              {branch.supportsCashOnDelivery && <Row label="پرداخت درب منزل" value="فعال است" />}
            </dl>
          </section>

          <section className="rounded-lg bg-surface p-5 shadow-sm">
            <h2 className="mb-3 text-h4 text-text-primary">اطلاعات ارسال</h2>
            <ul className="flex flex-col gap-2 text-bodySm text-text-secondary">
              {branch.supportedDeliveryMethods.map((method) => (
                <li key={method}>✓ {DELIVERY_METHOD_LABELS[method] ?? method}</li>
              ))}
            </ul>
            <p className="mt-3 text-caption text-text-muted">
              شعبه تأمین‌کننده نهایی سفارش شما بر اساس آدرس و موجودی، در زمان ثبت سفارش به‌صورت خودکار انتخاب می‌شود.
            </p>
          </section>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/shop" className="rounded-md bg-brand-black px-5 py-2.5 text-bodySm text-white">
            مشاهده محصولات فروشگاه
          </Link>
          <Link href="/branches" className="rounded-md border border-border-strong px-5 py-2.5 text-bodySm text-text-secondary">
            سایر شعبه‌ها
          </Link>
        </div>

        {/* منوهای این شعبه — کاملاً داده‌محور (بخش ۸ Prompt)؛ همین کد برای
            همه شعب یکسان است، فقط داده branch_menus فرق می‌کند */}
        {menus.length > 0 && (
          <section className="flex flex-col gap-6">
            {menus.map((menu) => (
              <div key={menu.id}>
                <h2 className="mb-3 text-h4 text-text-primary">{menu.name}</h2>
                <div className="flex flex-wrap gap-4">
                  {menu.images.map((img) => (
                    <Image
                      key={img.id}
                      src={img.imagePath}
                      alt={img.altText}
                      width={420}
                      height={600}
                      className="h-auto w-full max-w-[280px] rounded-lg border border-border"
                    />
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}
      </Container>
    </div>
  );
}

function Row({ label, value, ltr, muted }: { label: string; value: string; ltr?: boolean; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-text-muted">{label}</dt>
      <dd className={muted ? "text-caption text-text-muted" : "text-text-primary"} dir={ltr ? "ltr" : undefined}>
        {value}
      </dd>
    </div>
  );
}
