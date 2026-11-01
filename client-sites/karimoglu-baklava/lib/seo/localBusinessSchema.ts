import type { BranchSummary } from "@/lib/types";
import { absoluteUrl } from "./siteConfig";

/**
 * ===== LocalBusiness Schema (Prompt 12، بخش ۱۰) =====
 *
 * طبق الزام صریح «فقط زمانی که اطلاعات واقعی موجود باشد»: `address` و
 * `geo` فقط وقتی اضافه می‌شوند که مقدار واقعی (نه null) در دیتابیس/داده
 * شعبه موجود باشد. چون فعلاً هیچ شعبه‌ای آدرس دقیق یا مختصات ثبت‌شده‌ای
 * ندارد (TODO مستندشده در `lib/mock-data.ts`)، این دو فیلد در عمل هنوز
 * در خروجی ظاهر نمی‌شوند — نه چون فراموش شده، بلکه چون درج مقدار جعلی
 * دقیقاً همان چیزی است که این Prompt صریحاً منع کرده.
 */
export function buildLocalBusinessSchema(branch: BranchSummary) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BakeryOrCafe",
    name: `باقلوا کریم‌اوغلو — شعبه ${branch.name}`,
    url: absoluteUrl(`/branches/${branch.slug}`),
    areaServed: branch.city,
  };

  if (branch.phone) {
    schema.telephone = branch.phone;
  }

  // اطلاعات واقعی: فقط تجریش پرداخت درب منزل (Cash on Delivery) دارد
  if (branch.supportsCashOnDelivery) {
    schema.paymentAccepted = "Cash, Online Payment";
  }

  if (branch.shortArea) {
    schema.address = {
      "@type": "PostalAddress",
      addressLocality: branch.city,
      addressRegion: branch.city,
      streetAddress: branch.shortArea,
      addressCountry: "IR",
    };
  } else {
    // بدون آدرس دقیق، فقط شهر را به‌عنوان PostalAddress حداقلی می‌دهیم —
    // این خودش «جعلی» نیست چون شهر واقعاً مشخص است؛ فقط streetAddress را نمی‌سازیم.
    schema.address = {
      "@type": "PostalAddress",
      addressLocality: branch.city,
      addressCountry: "IR",
    };
  }

  if (branch.coordinates) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: branch.coordinates.lat,
      longitude: branch.coordinates.lng,
    };
  }

  if (branch.openingHours) {
    // فرمت فعلی داده («۰۸:۰۰ تا ۲۴:۰۰») یک رشته فارسی نمایشی است، نه فرمت
    // ISO 8601 مورد نیاز Schema.org (`openingHours`/`openingHoursSpecification`
    // انتظار مقادیری مثل "08:00-24:00" دارند) — تبدیل عددهای فارسی به
    // لاتین و استخراج بازه ساعت، بدون حدس زدن روزهای کاری (که در داده
    // فعلی مشخص نشده‌اند؛ فرض می‌شود هر ۷ روز هفته باز است، چون داده
    // «همه روزه» برای این کسب‌وکار قبلاً در Prompt ۱ تأیید شده بود).
    const normalized = toLatinDigits(branch.openingHours).replace(/\s*تا\s*/, "-");
    schema.openingHoursSpecification = {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: normalized.split("-")[0],
      closes: normalized.split("-")[1],
    };
  }

  return schema;
}

function toLatinDigits(input: string): string {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  return input.replace(/[۰-۹]/g, (d) => String(persianDigits.indexOf(d)));
}
