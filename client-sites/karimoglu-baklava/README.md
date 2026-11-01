# Baklava Karimoglu — Homepage (Next.js + TypeScript + Tailwind)

این پروژه پیاده‌سازی Homepage طبق سه سند قبلی است:
1. **Blueprint معماری** (Business/Product/Architecture)
2. **UX Architecture** (Sitemap، Navigation، User Flows)
3. **Design System** (رنگ، تایپوگرافی، Componentها)

Build با موفقیت تست شده (`npm run build` — بدون خطای TypeScript/Lint).

## اجرا

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # بیلد Production
```

## ساختار پروژه

```
app/
  layout.tsx        ← Metadata، SEO، Schema.org، Header/Footer مشترک
  page.tsx           ← ترکیب Sectionهای Homepage
  globals.css          ← فونت، Reduced Motion، Focus State سراسری

components/
  layout/
    Header.tsx          ← Navbar طبق UX Architecture بخش ۲
    Footer.tsx            ← Footer چهارستونه
  ui/                       ← Component Library پایه (Design System بخش ۱۰)
    Button.tsx, Badge.tsx, RatingStars.tsx, Container.tsx,
    SectionHeading.tsx, ImagePlaceholder.tsx
    ProductCard.tsx          ← طبق طراحی دقیق Design System بخش ۱۱
    BranchCard.tsx             ← طبق طراحی دقیق Design System بخش ۱۲ + Graceful Degradation
  home/                         ← Sectionهای اختصاصی Homepage
    Hero.tsx, CategoryShowcase.tsx, FeaturedProducts.tsx,
    BrandStory.tsx, ProductExperience.tsx, BranchFinder.tsx,
    DeliveryExperience.tsx, CafeExperience.tsx, SocialProof.tsx, FinalCta.tsx

lib/
  types.ts       ← تایپ‌های داده (مطابق مدل مفهومی Blueprint)
  mock-data.ts     ← داده نمونه — نگاه کنید به بخش «داده‌ها» پایین
  format.ts          ← فرمت قیمت/عدد فارسی

tailwind.config.ts  ← تمام Design Token ها (رنگ، فونت، Spacing، Radius، Shadow، Motion)
```

## داده‌ها (بسیار مهم پیش از انتشار)

`lib/mock-data.ts` دو نوع داده متفاوت دارد که باید متفاوت برخورد شوند:

- **`branches`** → نام، تلفن و ساعت کاری **واقعی** است (از اطلاعات کسب‌وکار). فیلدهای
  `shortArea` و `coordinates` عمداً `null` هستند چون آدرس/مختصات دقیق شعب هنوز TODO
  است (Blueprint، بخش ۳۰). **این‌ها را با داده جعلی پر نکنید** — فقط با API واقعی
  (`GET /api/v1/branches`) جایگزین کنید.
- **`featuredProducts`** و **`categoryShowcase`** (دسته‌ها واقعی‌اند، محصولات نمونه‌اند)
  → محصولات کاملاً **Placeholder** برای نمایش چیدمان هستند؛ نام/قیمت/امتیاز واقعی
  نیست چون کاتالوگ واقعی هنوز در سیستم ثبت نشده. پیش از انتشار باید با
  `GET /api/v1/products?featured=true` جایگزین شوند.

## TODOهای باز (طبق اسناد قبلی، بدون فرض جدید)

| مورد | وضعیت در کد |
|---|---|
| لوگوی برند | Header فعلاً فقط از متن استفاده می‌کند |
| فونت رسمی | `--font-primary`/`--font-display` روی Vazirmatn موقت تنظیم شده؛ در `globals.css` قابل تعویض است. فونت باید با `next/font/local` بارگذاری شود (این پروژه فعلاً فونت را لود نمی‌کند تا وابسته به فایل واقعی فونت نباشد) |
| تصاویر محصول/شعبه/کافه/Hero/Gallery | همه جا از `ImagePlaceholder` استفاده شده؛ با اتصال تصاویر واقعی باید با `next/image` جایگزین شوند |
| آدرس/مختصات شعب | `BranchCard`، `BranchFinder` و `BranchAvailability` در حالت Graceful Degradation کار می‌کنند |
| داستان برند | `BrandStory.tsx` فقط از حقایق تأییدشده استفاده می‌کند |
| نظرات مشتری | `reviews: []` در تمام محصولات Placeholder؛ `ReviewsSection` حالت خالی را به‌درستی نمایش می‌دهد |
| کاتالوگ واقعی محصولات/قیمت/Variant | `lib/mock-data.ts` → `buildPlaceholderCatalog` و `getProductDetailBySlug` باید کاملاً حذف و با API واقعی جایگزین شوند |
| مواد اولیه / روش نگهداری محصول | در `ProductDescription.tsx` به‌صراحت به‌عنوان بخش در انتظار محتوا علامت‌گذاری شده (نه محتوای جعلی) |
| دامنه نهایی سایت | در `app/layout.tsx`، مقدار `siteUrl` باید جایگزین شود |

## صفحات پیاده‌سازی‌شده تا این مرحله

- `/` — Homepage
- `/shop` — فروشگاه با فیلتر/جستجو/مرتب‌سازی/صفحه‌بندی
- `/shop/[category]` — ۶ صفحه Landing دسته‌بندی (SSG) با FAQ و محصولات مرتبط
- `/product/[slug]` — صفحه محصول کامل (Gallery، Variant، بسته‌بندی، تعداد، Branch Availability، توضیحات، نظرات، محصولات مرتبط)
- `/cart` — سبد خرید با اعتبارسنجی زنده
- `/checkout` — Checkout چندمرحله‌ای (مشتری، آدرس، ارسال/شعبه، پرداخت، بازبینی)
- `/order/[id]/confirmation` — صفحه موفقیت سفارش با لغو ۵ دقیقه‌ای
- `/payment/mock/[transactionId]` — شبیه‌ساز درگاه پرداخت (تا انتخاب درگاه واقعی)
- `/admin/branch-selection` — پنل مشاهده‌پذیری داخلی تصمیمات انتخاب شعبه (بدون احراز هویت — TODO)

## API Routes

`cart/validate`, `cart/price`, `cart/resolve-branch`, `branch-selection/select`, `branch-selection/validate-manual`,
`orders` (POST/GET/[id]/cancel)، `payments/initiate`، `payments/verify`

## ماژول‌های Backend کلیدی (`lib/`)

- `lib/pricing.ts` — تنها منبع حقیقت قیمت
- `lib/cart/validateCart.ts` — اعتبارسنجی کامل سبد
- `lib/branch-selection/*` — ماژول مستقل انتخاب هوشمند شعبه (مدل دامنه، سرویس‌های ساعت کاری/فاصله/موجودی/امکان ارسال/فرمول هزینه/رتبه‌بندی/لاگ)
- `lib/payment/*` — Abstraction پرداخت (Interface + Mock Provider + Registry)
- `lib/server/*` — لایه سرور (In-memory DB، سرویس سفارش، امنیت پایه)

## تست

```bash
npm run test   # vitest run — ۳۲ تست
```

## TODOهای باز (طبق اسناد قبلی، بدون فرض جدید)

| مورد | وضعیت در کد |
|---|---|
| لوگوی برند | Header فعلاً فقط از متن استفاده می‌کند |
| فونت رسمی | `--font-primary`/`--font-display` روی Vazirmatn موقت تنظیم شده |
| تصاویر محصول/شعبه/کافه/Hero/Gallery | همه‌جا از `ImagePlaceholder` استفاده شده |
| آدرس/مختصات شعب | حالت Graceful Degradation در همه‌جا (`BranchCard`, `feasibilityService`, `distanceService`) |
| فرمول هزینه ارسال | `deliveryFeeFormulaConfig` عمداً `null` — هیچ عدد ساختگی وارد نشده (Prompt 8) |
| داستان برند | فقط حقایق تأییدشده استفاده شده |
| نظرات مشتری | `reviews: []` در همه محصولات |
| کاتالوگ واقعی محصولات/قیمت/Variant | باید با API واقعی جایگزین شود |
| دامنه نهایی سایت | در `app/layout.tsx` |
| پایگاه‌داده واقعی | `lib/server/db.ts` و `lib/branch-selection/inventoryService.ts` باید با PostgreSQL واقعی جایگزین شوند |
| احراز هویت | صفحه `/admin/branch-selection` و `GET /api/orders/[id]` هنوز محافظت‌نشده‌اند |

## نکات فنی کلیدی

- **RTL:** `<html lang="fa" dir="rtl">` در سطح Layout؛ تمام Spacing با کلاس‌های منطقی Tailwind (`gap`, `space-x-reverse` در صورت نیاز آینده) نوشته شده.
- **SEO:** یک `<h1>` واحد (در Hero)، بقیه Sectionها `<h2>`؛ Metadata + OpenGraph + Schema.org Organization در `layout.tsx`.
- **Performance:** بدون هیچ کتابخانه اضافی؛ `ImagePlaceholder` از Layout Shift جلوگیری می‌کند؛ `next/image` باید در اتصال تصاویر واقعی با `sizes` و `priority` مناسب (فقط تصویر Hero) استفاده شود.
- **Accessibility:** Focus Ring سراسری، `aria-label` روی دکمه‌های آیکونی، `prefers-reduced-motion` در `globals.css`.
- **Reusability:** این Componentها (`ProductCard`, `BranchCard`, `Button`, ...) پایه صفحات بعدی (Shop، Product، Branches) نیز خواهند بود — طبق الزام «Homepage باید پایه طراحی سایر صفحات باشد».
