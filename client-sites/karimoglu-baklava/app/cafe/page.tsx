import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { branches } from "@/lib/mock-data";

/**
 * ===== صفحه کافه (اصلاح بخش ۶ Prompt) =====
 *
 * Root Cause قبلی: در Navigation یک ورودی «کافه» بدون مقصد واقعی وجود
 * داشت (یا اصلاً وجود نداشت که یعنی یک قول ضمنی برند — «همه شعب کافه
 * دارند» — هیچ صفحه‌ای نداشت). این صفحه واقعی است و فقط از داده واقعی
 * شعب (`lib/mock-data.ts` → `hasCafeService`) استفاده می‌کند — هیچ آدرس،
 * تلفن، یا ویژگی ساختگی برای کافه هر شعبه اضافه نشده.
 *
 * محتوای توصیفی (معرفی تجربه کافه) طبق قانون صریح Prompt («محتوای موقت اما
 * حرفه‌ای») نوشته شده و باید بعداً با محتوای نهایی مدیریت جایگزین شود —
 * این‌جا صریحاً TODO علامت‌گذاری شده.
 */
export const metadata: Metadata = {
  title: "کافه کریم‌اوغلو",
  description:
    "تجربه کافه در شعب باقلوا کریم‌اوغلو — فضای پذیرایی و سرویس کافه در تمام شعب فعال تهران و همدان.",
  alternates: { canonical: "/cafe" },
};

export default function CafePage() {
  const cafeBranches = branches.filter((b) => b.hasCafeService);

  return (
    <div className="py-6 tablet:py-10">
      <Container className="flex flex-col gap-10">
        <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "کافه" }]} />

        <section className="grid grid-cols-1 items-center gap-8 desktop:grid-cols-2">
          <div className="flex flex-col gap-4 text-right">
            <span className="text-label text-brand-red">کافه کریم‌اوغلو</span>
            <h1 className="text-h2Mobile tablet:text-h2 text-text-primary">
              کنار یک فنجان چای، طعم اصیل را تجربه کنید
            </h1>
            {/* TODO: این پاراگراف محتوای موقت است — با متن نهایی برند از مدیریت جایگزین شود */}
            <p className="max-w-[52ch] text-body text-text-secondary">
              همه شعب فعال کریم‌اوغلو به یک فضای پذیرایی و کافه مجهزند تا در کنار خرید، بتوانید در
              محیطی آرام از باقلوا و شیرینی تازه همراه با چای و نوشیدنی گرم لذت ببرید.
            </p>
            <Link href="/branches">
              <Button variant="accent" size="lg">
                مشاهده آدرس و ساعات شعب
              </Button>
            </Link>
          </div>
          <ImagePlaceholder label="تصویر فضای کافه — به‌زودی ارسال می‌شود" aspectClassName="aspect-[4/3]" />
        </section>

        <section aria-labelledby="cafe-branches-heading" className="flex flex-col gap-5">
          <h2 id="cafe-branches-heading" className="text-h3 text-text-primary">
            شعب دارای کافه
          </h2>
          <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
            {cafeBranches.map((branch) => (
              <div key={branch.id} className="flex flex-col gap-2 rounded-lg border border-border p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-h4 text-text-primary">{branch.name}</h3>
                  <span className="text-caption text-text-muted">{branch.city}</span>
                </div>
                <p className="text-bodySm text-text-secondary">ساعت کاری: {branch.openingHours}</p>
                {branch.shortArea && <p className="text-bodySm text-text-secondary">{branch.shortArea}</p>}
                {branch.phone ? (
                  <a href={`tel:${branch.phone}`} dir="ltr" className="text-bodySm text-brand-red hover:underline">
                    {branch.phone}
                  </a>
                ) : (
                  <span className="text-bodySm text-text-muted">تلفن: به‌زودی</span>
                )}
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="cafe-experience-heading" className="grid grid-cols-1 gap-6 tablet:grid-cols-3">
          <h2 id="cafe-experience-heading" className="sr-only">
            تجربه کافه
          </h2>
          {/* TODO: خدمات دقیق کافه (منو، قیمت نوشیدنی) هنوز از مدیریت دریافت نشده — این‌ها عناوین کلی‌اند */}
          {[
            { title: "فضای نشیمن", desc: "فضایی آرام برای صرف شیرینی و نوشیدنی گرم در کنار خرید." },
            { title: "نوشیدنی گرم و سرد", desc: "چای، قهوه و نوشیدنی‌های فصلی — منو کامل به‌زودی اضافه می‌شود." },
            { title: "مناسب مهمانی و پذیرایی", desc: "امکان سفارش برای جمع‌های دوستانه و خانوادگی." },
          ].map((item) => (
            <div key={item.title} className="rounded-lg bg-bg-secondary p-5">
              <h3 className="mb-2 text-h4 text-text-primary">{item.title}</h3>
              <p className="text-bodySm text-text-secondary">{item.desc}</p>
            </div>
          ))}
        </section>

        <section className="flex flex-col items-center gap-3 rounded-lg bg-brand-black py-10 text-center">
          <h2 className="text-h3 text-text-inverse">برای رزرو یا اطلاعات بیشتر با شعبه مدنظرتان تماس بگیرید</h2>
          <Link href="/contact">
            <Button variant="outlineInverse" size="lg">
              راه‌های ارتباطی
            </Button>
          </Link>
        </section>
      </Container>
    </div>
  );
}
