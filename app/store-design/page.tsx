import type { ReactNode } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import Contact from "@/components/Contact";
import { getCurrentUser } from "@/lib/session";
import { landingHref } from "@/lib/landingPages";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://webpikaso.ir";
const pageUrl = "/store-design";

export const metadata = {
  title: "طراحی سایت فروشگاهی حرفه‌ای | وب پیکاسو",
  description:
    "طراحی سایت فروشگاهی با وردپرس یا کدنویسی اختصاصی، درگاه پرداخت امن و سئوی فروشگاهی — قیمت شفاف و پشتیبانی بعد از تحویل، در تهران و سراسر کشور.",
  alternates: { canonical: pageUrl },
  openGraph: {
    url: pageUrl,
    title: "طراحی سایت فروشگاهی حرفه‌ای | وب پیکاسو",
    description:
      "طراحی سایت فروشگاهی با وردپرس یا کدنویسی اختصاصی، درگاه پرداخت امن و سئوی فروشگاهی — قیمت شفاف و پشتیبانی بعد از تحویل.",
  },
};

/* ---------------------------------------------------------------------- */
/* داده‌ها                                                                  */
/* ---------------------------------------------------------------------- */

type Benefit = { title: string; desc: ReactNode; icon: ReactNode };

const whyItMatters: Benefit[] = [
  {
    title: "استقلال از مارکت‌پلیس‌ها",
    desc: "تو فروشگاه خودتون قوانین بازی رو خودتون تعیین می‌کنید، نه یه پلتفرم واسط که هر لحظه ممکنه قوانینش رو عوض کنه یا کمیسیون بگیره.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
  {
    title: "دسترسی ۲۴ ساعته به فروشگاه",
    desc: "مشتری‌ها هر ساعت از شبانه‌روز می‌تونن محصولات رو ببینن، سفارش بدن و پرداخت کنن، بدون نیاز به حضور فیزیکی شما.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
      </svg>
    ),
  },
  {
    title: "کنترل کامل روی برند",
    desc: "از رنگ و لوگو گرفته تا نحوه‌ی نمایش محصولات، همه‌چیز مطابق هویت برند شما طراحی می‌شه، نه یه قالب عمومی مشترک با هزاران فروشنده‌ی دیگه.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M9 6 3 12l6 6M15 6l6 6-6 6" />
      </svg>
    ),
  },
  {
    title: "داده‌ی مشتری در اختیار شماست",
    desc: "با ابزارهای تحلیلی روی سایت خودتون، رفتار خرید مشتری‌ها رو می‌بینید و بر اساس داده‌ی واقعی تصمیم می‌گیرید، نه گزارش‌های محدود یه مارکت‌پلیس.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M4 19V5M4 19h16" />
        <path d="M8 15l3.5-4 3 3L19 8" />
      </svg>
    ),
  },
  {
    title: "مقیاس‌پذیری برای رشد",
    desc: "با افزایش تعداد محصولات و سفارش‌ها، سایت فروشگاهی اصولی می‌تونه بدون افت عملکرد رشد کنه.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z" />
      </svg>
    ),
  },
  {
    title: "هزینه‌ی بلندمدت پایین‌تر",
    desc: "برخلاف کمیسیون دائمی مارکت‌پلیس‌ها، بعد از تحویل فروشگاه، هزینه‌ی نگهداری معمولاً خیلی کمتر از درصدی از فروشه که به واسطه‌ها می‌دادید.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
      </svg>
    ),
  },
];

const storeFeatures: Benefit[] = [
  {
    title: "سبد خرید و تسویه‌ی ساده",
    desc: "مسیر از انتخاب محصول تا پرداخت باید کوتاه و بدون مرحله‌ی اضافی باشه تا مشتری وسط راه منصرف نشه.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <circle cx="9" cy="20" r="1.4" />
        <circle cx="17" cy="20" r="1.4" />
        <path d="M2.5 4h2.5l2.4 11.2a2 2 0 0 0 2 1.6h7.4a2 2 0 0 0 2-1.6L21 8H6" />
      </svg>
    ),
  },
  {
    title: "درگاه پرداخت امن",
    desc: "اتصال به درگاه‌های معتبر داخلی برای اینکه هم مشتری اطمینان کنه، هم تراکنش‌ها بدون مشکل ثبت بشن.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
  },
  {
    title: "مدیریت موجودی و سفارش‌ها",
    desc: "یه پنل که باهاش می‌تونید موجودی محصولات، وضعیت سفارش‌ها و ارسال رو دنبال کنید.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    title: "جست‌وجو و فیلتر پیشرفته",
    desc: "وقتی تعداد محصولات زیاد می‌شه، مشتری باید بتونه سریع محصول موردنظرش رو با فیلتر دسته‌بندی، قیمت و ویژگی پیدا کنه.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m20 20-4.35-4.35" />
      </svg>
    ),
  },
  {
    title: "بهینه‌سازی برای موبایل",
    desc: "بخش بزرگی از خریدهای آنلاین امروز از موبایل انجام می‌شه، پس فروشگاه باید روی گوشی هم تجربه‌ی خرید بی‌نقصی بده.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <rect x="7" y="2" width="10" height="20" rx="2" />
        <path d="M11 18h2" />
      </svg>
    ),
  },
  {
    title: "سئوی فروشگاهی",
    desc: (
      <>
        ساختار صفحات محصول و دسته‌بندی از همون ابتدا برای ایندکس شدن در گوگل و جستجوی خرید بهینه‌سازی
        می‌شه؛ در کنارش{" "}
        <Link href={landingHref("seoServices")} className="text-accent underline underline-offset-2">
          خدمات سئو
        </Link>{" "}
        اختصاصی هم برای رشد بلندمدت رتبه ارائه می‌دیم.
      </>
    ),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
      </svg>
    ),
  },
];

type Step = { n: string; title: string; desc: string };

const steps: Step[] = [
  { n: "۰۱", title: "مشاوره و بررسی محصولات", desc: "بررسی می‌کنیم چند محصول دارید، چطور دسته‌بندی می‌شن و چه حجمی از سفارش پیش‌بینی می‌شه." },
  { n: "۰۲", title: "طراحی رابط فروشگاه", desc: "صفحات محصول، دسته‌بندی و سبد خرید متناسب با برند و نوع محصولاتتون طراحی می‌شه." },
  { n: "۰۳", title: "اتصال درگاه پرداخت", desc: "درگاه پرداخت امن و روش‌های ارسال موردنیازتون به فروشگاه متصل می‌شه." },
  { n: "۰۴", title: "بارگذاری محصولات", desc: "محصولات اولیه رو در سایت بارگذاری می‌کنیم و آموزش می‌دیم چطور خودتون ادامه بدید." },
  { n: "۰۵", title: "تست کامل مسیر خرید", desc: "از انتخاب محصول تا پرداخت نهایی، کل مسیر خرید چند بار تست می‌شه تا هیچ مشکلی نمونه." },
  { n: "۰۶", title: "تحویل و آموزش مدیریت", desc: "بعد از تحویل، آموزش کامل مدیریت فروشگاه رو می‌دیم و برای هر سوال فنی در دسترسیم." },
];

const faqs: { q: string; a: string }[] = [
  {
    q: "طراحی سایت فروشگاهی چقدر طول می‌کشد؟",
    a: "بسته به تعداد محصولات و پیچیدگی نیازها، معمولاً بین سه تا شش هفته زمان می‌بره؛ فروشگاه‌های بزرگ‌تر با کدنویسی اختصاصی ممکنه بیشتر طول بکشه. زمان دقیق بعد از بررسی تعداد محصولات و امکانات موردنیازتون در پیشنهاد فنی مشخص می‌شه.",
  },
  {
    q: "آیا امکان اتصال به درگاه پرداخت داخلی وجود دارد؟",
    a: "بله، فروشگاه شما به درگاه‌های پرداخت معتبر داخلی متصل می‌شه تا مشتری‌ها بدون مشکل بتونن خرید کنن.",
  },
  {
    q: "آیا می‌توانم بعداً محصولات بیشتری اضافه کنم؟",
    a: "بله، هم در مسیر وردپرسی و هم در مسیر اختصاصی، امکان اضافه کردن محصولات و دسته‌بندی‌های جدید بدون محدودیت خاصی وجود داره.",
  },
  {
    q: "تفاوت فروشگاه وردپرسی با فروشگاه اختصاصی چیست؟",
    a: "فروشگاه وردپرسی با ووکامرس سریع‌تر و اقتصادی‌تر راه‌اندازی می‌شه؛ فروشگاه اختصاصی با کدنویسی برای حجم بالا و نیازهای خاص، سرعت و انعطاف بیشتری می‌ده.",
  },
  {
    q: "آیا امکان باشگاه مشتریان و کد تخفیف هم وجود دارد؟",
    a: "بله، هم در مسیر وردپرسی از طریق افزونه‌های امن و هم در مسیر اختصاصی، می‌شه باشگاه مشتریان، کد تخفیف و یادآوری سبد خرید رهاشده رو اضافه کرد.",
  },
  {
    q: "آیا بعد از تحویل هم پشتیبانی داریم؟",
    a: "بله، هر پروژه‌ی فروشگاهی شامل آموزش کامل مدیریت و پشتیبانی فنی بعد از تحویله.",
  },
  {
    q: "آیا سئوی فروشگاه هم انجام می‌شود؟",
    a: "بله، ساختار صفحات محصول و دسته‌بندی از ابتدا برای سئو بهینه می‌شه؛ در کنارش خدمات سئو اختصاصی هم ارائه می‌دیم.",
  },
  {
    q: "آیا فقط در تهران خدمات می‌دهید؟",
    a: "نه، تیم ما در تهران و سراسر کشور فعاله؛ چون کل فرایند به‌صورت آنلاین انجام می‌شه، فرقی نمی‌کنه کسب‌وکارتون کجای ایران باشه.",
  },
  {
    q: "آیا سایت فروشگاهی برای فروش بین‌المللی هم مناسب است؟",
    a: "بله، در صورت نیاز می‌شه فروشگاه رو برای ارز و زبان‌های مختلف هم آماده کرد؛ این نیاز رو در جلسه‌ی مشاوره بررسی می‌کنیم.",
  },
  {
    q: "چطور سفارش طراحی سایت فروشگاهی را ثبت کنم؟",
    a: "کافیه پلن فروشگاهی رو از صفحه‌ی ثبت سفارش انتخاب کنید یا از طریق فرم تماس با تیم ما هماهنگ کنید.",
  },
  {
    q: "آیا فروشگاه می‌تواند به اینستاگرام یا شبکه‌های اجتماعی هم متصل شود؟",
    a: "بله، می‌شه لینک فروشگاه رو در بیوی اینستاگرام و سایر شبکه‌های اجتماعی گذاشت و حتی کاتالوگ محصولات رو باهاشون هماهنگ کرد.",
  },
  {
    q: "آیا امکان مدیریت چند انبار یا شعبه وجود دارد؟",
    a: "بله، در صورت نیاز می‌شه مدیریت موجودی چند انبار یا شعبه رو هم به پنل فروشگاه اضافه کرد؛ این نیاز رو در جلسه‌ی مشاوره بررسی می‌کنیم.",
  },
  {
    q: "آیا می‌توانم فروشگاه را بعداً از وردپرس به اختصاصی تغییر دهم؟",
    a: "بله، خیلی از فروشگاه‌ها همین مسیر رو طی می‌کنن؛ با وردپرس شروع می‌کنن و بعد از رشد، محتوا و داده‌های محصولاتشون به یه فروشگاه اختصاصی منتقل می‌شه.",
  },
];

/* ---------------------------------------------------------------------- */

export default async function StoreDesignPage() {
  const isLoggedIn = !!(await getCurrentUser());

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        serviceType: "طراحی سایت فروشگاهی",
        name: "طراحی سایت فروشگاهی حرفه‌ای",
        description:
          "طراحی سایت فروشگاهی با وردپرس یا کدنویسی اختصاصی، درگاه پرداخت امن و سئوی فروشگاهی.",
        provider: { "@type": "Organization", name: "وب پیکاسو", url: siteUrl },
        areaServed: "IR",
        url: `${siteUrl}${pageUrl}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "خانه", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "طراحی سایت", item: `${siteUrl}${landingHref("websiteDesign")}` },
          { "@type": "ListItem", position: 3, name: "طراحی سایت فروشگاهی", item: `${siteUrl}${pageUrl}` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Nav isLoggedIn={isLoggedIn} />

      <PageHero
        eyebrow="Store Website Design"
        title="طراحی سایت فروشگاهی حرفه‌ای"
        desc="اگه محصول فیزیکی یا دیجیتال می‌فروشید، طراحی سایت فروشگاهی یعنی داشتن یه فروشگاه آنلاین اختصاصی که کاملاً مال خودتونه — با درگاه پرداخت امن، مدیریت موجودی و ساختار سئوی قوی، چه با وردپرس چه با کدنویسی کاملاً اختصاصی."
      >
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/order?category=wordpress"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-[14.5px] font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
          >
            مشاهده پلن فروشگاهی و ثبت سفارش
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[15px] w-[15px]">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-canvas px-6 py-3 text-[14.5px] font-bold text-ink transition hover:border-accent hover:text-accent"
          >
            مشاوره‌ی رایگان
          </Link>
        </div>
      </PageHero>

      {/* چیستی */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-10">
            <h2 className="font-display text-[26px] font-normal sm:text-[32px]">
              طراحی سایت فروشگاهی چیست و چرا کسب‌وکار شما بهش نیاز دارد؟
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Reveal className="rounded-card border border-ink/10 bg-surface/50 p-6 text-[14.5px] leading-[2] text-dim lg:col-span-1">
              طراحی سایت فروشگاهی فرایند ساخت یه وب‌سایته که در اون کاربر می‌تونه محصولات رو ببینه،
              به سبد خرید اضافه کنه، پرداخت انجام بده و سفارشش رو پیگیری کنه. برخلاف صفحه‌ی فروش در
              شبکه‌های اجتماعی یا مارکت‌پلیس‌ها، یه سایت فروشگاهی اختصاصی کاملاً تحت کنترل خودتونه:
              هم ظاهر و برندینگ رو خودتون تعیین می‌کنید، هم داده‌ی مشتری‌ها دست خودتونه، و هم درصدی
              از فروش رو به‌عنوان کمیسیون به کسی نمی‌دید.
            </Reveal>
            <Reveal delay={80} className="rounded-card border border-ink/10 bg-surface/50 p-6 text-[14.5px] leading-[2] text-dim lg:col-span-1">
              امروز خیلی از کسب‌وکارهایی که از مارکت‌پلیس‌ها شروع کردن، بعد از مدتی سراغ طراحی سایت
              فروشگاهی اختصاصی می‌رن تا کنترل کامل کسب‌وکارشون رو در دست بگیرن. یه فروشگاه اینترنتی
              خوب فقط زیبایی نیست؛ ترکیبیه از سرعت بارگذاری بالا، تجربه‌ی خرید ساده و بدون سردرگمی،
              درگاه پرداخت قابل‌اعتماد و مدیریت موجودی دقیق.
            </Reveal>
            <Reveal delay={160} className="rounded-card border border-ink/10 bg-surface/50 p-6 text-[14.5px] leading-[2] text-dim lg:col-span-1">
              اگه هر کدوم از این‌ها ضعیف باشه، حتی با تبلیغات زیاد هم نرخ تبدیل بازدیدکننده به خریدار
              پایین می‌مونه. به همین دلیل طراحی سایت فروشگاهی رو نباید فقط یه پروژه‌ی گرافیکی دید؛
              بلکه باید بهش به چشم یه ابزار فروش نگاه کرد که هر بخشش باید برای افزایش نرخ تبدیل بهینه
              بشه.
            </Reveal>
          </div>
        </div>
      </section>

      {/* چرا حیاتیه */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] bg-dot-grid" />
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-12 flex items-baseline gap-4">
            <span className="flex h-8 items-center rounded-full border border-ink/10 bg-surface px-3.5 font-mono text-sm font-bold text-ink">
              Why
            </span>
            <div>
              <h2 className="font-display text-[28px] font-normal sm:text-[34px] lg:text-[40px]">
                چرا طراحی سایت فروشگاهی حرفه‌ای برای فروش آنلاین ضروری است
              </h2>
              <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
                شش دلیلی که نشون می‌ده فروشگاه آنلاین اختصاصی، در بلندمدت بهتر از فروش صرف در
                مارکت‌پلیس‌ها یا فقط شبکه‌های اجتماعیه.
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {whyItMatters.map((f, i) => (
              <Reveal
                key={f.title}
                delay={i * 60}
                className="group flex flex-col gap-4 rounded-card border border-ink/10 bg-surface/50 p-6 transition hover:-translate-y-1 hover:border-accent/40"
              >
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px] bg-accent/10 p-2.5 text-accent transition-transform duration-300 group-hover:scale-110">
                  {f.icon}
                </span>
                <div>
                  <h3 className="mb-1.5 text-[15.5px] font-bold text-ink">{f.title}</h3>
                  <p className="text-[13.5px] leading-relaxed text-dim">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* امکانات */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-12">
            <h2 className="font-display text-[28px] font-normal sm:text-[34px] lg:text-[40px]">
              امکانات یک سایت فروشگاهی حرفه‌ای
            </h2>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              شش امکان پایه‌ای که هر طراحی سایت فروشگاهی حرفه‌ای باید از روز اول داشته باشه.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {storeFeatures.map((f, i) => (
              <Reveal
                key={f.title}
                delay={i * 60}
                className="group flex flex-col gap-4 rounded-card border border-ink/10 bg-surface/50 p-6 transition hover:-translate-y-1 hover:border-accent/40"
              >
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px] bg-accent/10 p-2.5 text-accent transition-transform duration-300 group-hover:scale-110">
                  {f.icon}
                </span>
                <div>
                  <h3 className="mb-1.5 text-[15.5px] font-bold text-ink">{f.title}</h3>
                  <p className="text-[13.5px] leading-relaxed text-dim">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* وردپرس یا اختصاصی */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mx-auto max-w-[820px] rounded-card border border-ink/10 bg-surface/50 p-7 sm:p-10">
            <h2 className="mb-4 font-display text-[24px] font-normal sm:text-[28px]">
              طراحی سایت فروشگاهی با وردپرس یا اختصاصی؛ کدام مناسب شماست؟
            </h2>
            <p className="text-[14.5px] leading-[2] text-dim">
              یکی از تصمیم‌های مهم قبل از شروع، انتخاب بین طراحی سایت فروشگاهی با{" "}
              <Link href={landingHref("wordpressDesign")} className="text-accent underline underline-offset-2">
                وردپرس
              </Link>{" "}
              و ووکامرس یا کدنویسی کاملاً اختصاصیه. مسیر وردپرسی برای فروشگاه‌هایی مناسبه که می‌خوان
              با هزینه‌ی معقول‌تر و سرعت راه‌اندازی بالاتر شروع کنن؛ ووکامرس هزاران افزونه‌ی آماده
              برای درگاه پرداخت، باشگاه مشتریان و بازاریابی داره. اما وقتی حجم سفارش‌ها خیلی بالا بره
              یا نیاز به عملکردهای خیلی خاص داشته باشید،{" "}
              <Link href={landingHref("customDesign")} className="text-accent underline underline-offset-2">
                طراحی سایت اختصاصی
              </Link>{" "}
              با کدنویسی، سرعت، امنیت و انعطاف بیشتری می‌ده. وب پیکاسو تو جلسه‌ی مشاوره‌ی رایگان، بعد
              از بررسی حجم محصولات و پیش‌بینی رشدتون، صادقانه می‌گه کدوم مسیر برای فروشگاه شما
              منطقی‌تره.
            </p>
          </Reveal>
        </div>
      </section>

      {/* قیمت — داده‌ی واقعی */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-10">
            <h2 className="font-display text-[26px] font-normal sm:text-[32px]">
              قیمت طراحی سایت فروشگاهی چقدر است؟
            </h2>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              هزینه به تعداد محصولات، نیاز به درگاه پرداخت چندگانه، باشگاه مشتریان و مسیر انتخابی
              (وردپرس یا کدنویسی اختصاصی) بستگی داره.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Reveal className="rounded-card border border-accent/40 bg-surface/50 p-6">
              <h3 className="mb-1.5 text-[16px] font-bold text-ink">پلن فروشگاهی (وردپرس / ووکامرس)</h3>
              <p className="mb-4 text-[13.5px] leading-relaxed text-dim">
                فروشگاه کامل با ووکامرس، درگاه پرداخت و مدیریت موجودی، صفحات و محصولات نامحدود، آموزش
                کامل مدیریت سایت و ۶ ماه پشتیبانی رایگان.
              </p>
              <p className="mb-4 text-[15px] font-bold text-accent">شروع از ۴۷ میلیون تومان</p>
              <Link
                href="/order?category=wordpress"
                className="inline-flex items-center gap-1.5 text-[13px] font-bold text-accent"
              >
                جزئیات و ثبت سفارش
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M17 12H7M11 8l-4 4 4 4" />
                </svg>
              </Link>
            </Reveal>
            <Reveal delay={80} className="rounded-card border border-ink/10 bg-surface/50 p-6">
              <h3 className="mb-1.5 text-[16px] font-bold text-ink">فروشگاه اختصاصی (کدنویسی)</h3>
              <p className="mb-4 text-[13.5px] leading-relaxed text-dim">
                برای حجم بالای محصول و سفارش، فرانت‌اند و بک‌اند اختصاصی، دیتابیس مقیاس‌پذیر و
                یکپارچه‌سازی با سرویس‌های بیرونی.
              </p>
              <p className="mb-4 text-[15px] font-bold text-accent">شروع از ۸۴ میلیون تومان</p>
              <Link
                href="/order?category=coding"
                className="inline-flex items-center gap-1.5 text-[13px] font-bold text-accent"
              >
                جزئیات و ثبت سفارش
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M17 12H7M11 8l-4 4 4 4" />
                </svg>
              </Link>
            </Reveal>
          </div>
          <p className="mt-6 text-[13px] text-dim">
            برای دیدن جزئیات کامل هر پلن،{" "}
            <Link href={landingHref("websitePrice")} className="text-accent underline underline-offset-2">
              بازه‌ی قیمت طراحی سایت
            </Link>{" "}
            رو ببینید و بعد از مشاوره‌ی رایگان، پیشنهاد قیمت دقیق و مکتوب دریافت کنید.
          </p>
        </div>
      </section>

      {/* مراحل */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-12">
            <h2 className="font-display text-[28px] font-normal sm:text-[34px] lg:text-[40px]">
              مراحل ساخت سایت فروشگاهی در وب پیکاسو
            </h2>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              شش مرحله‌ی ساده و شفاف، از مشاوره‌ی اولیه تا تحویل و آموزش مدیریت فروشگاه.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 70} className="rounded-card border border-ink/10 bg-surface/50 p-5">
                <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-accent font-mono text-[13px] font-black text-white">
                  {s.n}
                </span>
                <h3 className="mb-1.5 text-[14.5px] font-bold">{s.title}</h3>
                <p className="text-[13px] leading-relaxed text-dim">{s.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* تهران و سراسر کشور + آموزش + خرید آماده */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] bg-dot-grid" />
        <div className="relative z-[1] mx-auto max-w-container space-y-6 px-6">
          <Reveal className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">طراحی سایت فروشگاهی در تهران و سراسر کشور</h2>
            <p className="text-[14px] leading-[2] text-dim">
              تیم وب پیکاسو در تهران، استان تهران و سراسر کشور به کسب‌وکارها برای طراحی سایت
              فروشگاهی خدمت می‌ده. چون کل فرایند مشاوره، طراحی و تحویل به‌صورت آنلاین انجام می‌شه،
              فرقی نمی‌کنه کسب‌وکارتون در تهران باشه یا هر شهر دیگه‌ای؛ کیفیت کار و سرعت پاسخ‌گویی
              یکسانه. البته برای مشتری‌های تهران، امکان جلسه‌ی حضوری هم در صورت نیاز فراهمه.
            </p>
          </Reveal>
          <Reveal delay={60} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">آموزش طراحی سایت فروشگاهی: چند نکته قبل از شروع</h2>
            <p className="text-[14px] leading-[2] text-dim">
              قبل از سفارش، خوبه چند تا سوال رو از خودتون بپرسید: چند محصول قراره در فروشگاه عرضه
              بشه و آیا تعدادشون سریع رشد می‌کنه؟ چه روش‌های پرداخت و ارسالی نیاز دارید؟ آیا باشگاه
              مشتریان یا سیستم تخفیف و کد تخفیف لازم دارید؟ و آیا قصد فروش بین‌المللی هم دارید یا
              فعلاً محدود به بازار داخلیه. جواب این سوال‌ها مشخص می‌کنه که مسیر وردپرسی کافیه یا نیاز
              به کدنویسی اختصاصی دارید.
            </p>
          </Reveal>
          <Reveal delay={120} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">خرید سایت فروشگاهی آماده یا طراحی اختصاصی؛ کدام بهتر است</h2>
            <p className="text-[14px] leading-[2] text-dim">
              بعضی‌ها به‌جای طراحی سایت فروشگاهی، دنبال خرید سایت فروشگاهی آماده یا اسکریپت از پیش
              نوشته‌شده هستن. این گزینه ممکنه در نگاه اول ارزان‌تر به نظر برسه، اما معمولاً
              مشکلاتی مثل کدنویسی ضعیف، آسیب‌پذیری امنیتی، عدم پشتیبانی و شباهت کامل ظاهری به
              هزاران سایت دیگه رو به همراه داره. یه طراحی سایت فروشگاهی اصولی که مخصوص کسب‌وکار شما
              ساخته می‌شه، هم از نظر امنیت و هم از نظر تجربه‌ی کاربری و سئو، در بلندمدت عملکرد بهتری
              نسبت به سایت‌های آماده داره.
            </p>
          </Reveal>
          <Reveal delay={180} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">طراحی سایت فروشگاهی برای انواع کسب‌وکارها</h2>
            <p className="text-[14px] leading-[2] text-dim">
              نیاز هر فروشگاه فرق داره. یه فروشگاه پوشاک بیشتر به گالری تصویر باکیفیت و فیلتر سایز و
              رنگ نیاز داره؛ یه فروشگاه دیجیتال‌کالا به مقایسه‌ی مشخصات فنی و گارانتی؛ یه فروشگاه
              خوراکی به تاریخ انقضا و زمان‌بندی تحویل؛ و یه فروشگاه آرایشی و بهداشتی به دسته‌بندی
              دقیق بر اساس نوع پوست یا مو. وب پیکاسو قبل از شروع هر پروژه، ساختار صفحات محصول رو
              مطابق همین تفاوت‌ها می‌چینه.
            </p>
          </Reveal>
          <Reveal delay={240} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">اشتباهات رایج در طراحی سایت فروشگاهی که باید از آن‌ها دوری کرد</h2>
            <p className="text-[14px] leading-[2] text-dim">
              رایج‌ترین اشتباه، مسیر پیچیده‌ی خرید با مراحل زیاد و فرم‌های طولانیه که باعث می‌شه
              مشتری وسط راه منصرف بشه. اشتباه دوم، نداشتن عکس و توضیحات کافی برای محصولات، که اعتماد
              خریدار رو کم می‌کنه. اشتباه سوم، نادیده گرفتن سرعت بارگذاری صفحات محصول. اشتباه چهارم،
              نداشتن نسخه‌ی موبایل‌فرندلی درست‌وحسابی. و اشتباه پنجم، عدم توجه به سئوی صفحات محصول،
              که باعث می‌شه فروشگاه فقط با تبلیغات پولی دیده بشه، نه به‌صورت ارگانیک.
            </p>
          </Reveal>
          <Reveal delay={300} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">باشگاه مشتریان و بازاریابی در طراحی سایت فروشگاهی</h2>
            <p className="text-[14px] leading-[2] text-dim">
              یه طراحی سایت فروشگاهی حرفه‌ای فقط برای فروش اولیه نیست؛ باید مشتری رو برای خریدهای
              بعدی هم برگردونه. امکاناتی مثل کد تخفیف، باشگاه مشتریان و امتیازدهی، یادآوری سبد خرید
              رهاشده، و پیشنهاد محصولات مرتبط رو می‌شه به فروشگاه اضافه کرد؛ این امکانات هم در مسیر
              وردپرسی با افزونه‌های آماده، و هم در مسیر اختصاصی قابل پیاده‌سازی هستن.
            </p>
          </Reveal>
          <Reveal delay={360} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">امنیت در طراحی سایت فروشگاهی</h2>
            <p className="text-[14px] leading-[2] text-dim">
              چون یه فروشگاه آنلاین با اطلاعات پرداخت و داده‌ی شخصی مشتری‌ها سروکار داره، امنیت باید
              از همون مرحله‌ی طراحی جدی گرفته بشه. گواهی SSL، اتصال به درگاه‌های پرداخت معتبر،
              به‌روزرسانی منظم افزونه‌ها و پشتیبان‌گیری دوره‌ای از دیتابیس، جزو استانداردهایی هستن
              که در هر پروژه‌ی فروشگاهی وب پیکاسو رعایت می‌شن. همین توجه به امنیت، هم اعتماد مشتری
              رو جلب می‌کنه و هم از افت رتبه‌ی سایت در گوگل به‌خاطر مشکلات امنیتی جلوگیری می‌کنه.
            </p>
          </Reveal>
          <Reveal delay={420} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">تکنولوژی‌هایی که در فروشگاه‌های آنلاین استفاده می‌کنیم</h2>
            <p className="text-[14px] leading-[2] text-dim">
              برای طراحی سایت فروشگاهی با وردپرس، از ووکامرس به همراه افزونه‌های امن برای درگاه
              پرداخت، مدیریت انبار و بازاریابی استفاده می‌کنیم. برای فروشگاه‌های اختصاصی، از
              فریم‌ورک‌های مدرن فرانت‌اند و بک‌اند برای مدیریت حجم بالای محصول و سفارش بهره
              می‌بریم، همراه با دیتابیس مقیاس‌پذیر برای رشد بلندمدت. در هر دو مسیر، بهینه‌سازی
              تصاویر محصول، کش کردن صفحات پرتردد و پیکربندی درست هاست، جزو استاندارد کار ماست تا
              فروشگاه شما حتی زیر بار ترافیک بالا هم کند نشه.
            </p>
          </Reveal>
          <Reveal delay={480} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">چرا کسب‌وکارها وب پیکاسو را برای طراحی سایت فروشگاهی انتخاب می‌کنند</h2>
            <p className="text-[14px] leading-[2] text-dim">
              خیلی از فروشگاه‌های آنلاینی که با وب پیکاسو کار کردن، قبلش تجربه‌ی ناموفقی با یه تیم
              دیگه یا یه اسکریپت آماده داشتن. تفاوت اصلی ما، درک واقعی از فرایند فروش آنلاینه، نه فقط
              پیاده‌سازی یه قالب. قبل از شروع هر پروژه، محصولات، مدل قیمت‌گذاری و روش ارسال شما رو
              کامل بررسی می‌کنیم تا فروشگاهی طراحی کنیم که واقعاً با کسب‌وکارتون هماهنگ باشه، نه یه
              فروشگاه عمومی که فقط رنگ و لوگوش فرق داره. بیشتر درباره‌ی تیم رو در{" "}
              <Link href="/about" className="text-accent underline underline-offset-2">
                صفحه‌ی درباره ما
              </Link>{" "}
              بخونید یا{" "}
              <Link href="/portfolio" className="text-accent underline underline-offset-2">
                نمونه‌کارها
              </Link>{" "}
              رو ببینید.
            </p>
          </Reveal>
          <Reveal delay={540} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">چطور نتیجه‌ی فروشگاه را بعد از تحویل ارزیابی کنیم</h2>
            <p className="text-[14px] leading-[2] text-dim">
              بعد از تحویل فروشگاه، چند معیار ساده کمکتون می‌کنه بفهمید طراحی سایت فروشگاهی‌تون
              اصولی انجام شده یا نه. اول، مسیر خرید رو خودتون از ابتدا تا پرداخت نهایی تست کنید و
              ببینید چند مرحله طول می‌کشه. دوم، سرعت بارگذاری صفحات محصول رو روی موبایل چک کنید.
              سوم، مطمئن بشید درگاه پرداخت بدون خطا کار می‌کنه و پیامک یا ایمیل تایید سفارش درست
              ارسال می‌شه. و چهارم، ببینید آیا آموزش کافی برای مدیریت روزانه‌ی فروشگاه بهتون داده
              شده یا نه.
            </p>
          </Reveal>
          <Reveal delay={600} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">فروش در اینستاگرام یا طراحی سایت فروشگاهی؛ چرا هر دو لازمند</h2>
            <p className="text-[14px] leading-[2] text-dim">
              خیلی از کسب‌وکارهای ایرانی فروش خودشون رو با یه پیج اینستاگرام شروع می‌کنن، و این
              شروع خوبیه؛ اما با رشد کسب‌وکار، محدودیت‌های فروش فقط از طریق شبکه‌ی اجتماعی بیشتر
              حس می‌شه: مدیریت سفارش‌ها دستیه، جست‌وجوی محصول سخته و امکان پرداخت آنلاین مستقیم
              معمولاً وجود نداره. طراحی سایت فروشگاهی جایگزین اینستاگرام نیست، بلکه مکملشه؛ می‌تونید
              همچنان از اینستاگرام برای معرفی و تبلیغات استفاده کنید، ولی فرایند خرید نهایی رو به
              یه فروشگاه اینترنتی حرفه‌ای با سبد خرید، درگاه پرداخت و مدیریت موجودی منتقل کنید. این
              ترکیب باعث می‌شه هم دیده شدن در شبکه‌ی اجتماعی رو داشته باشید، هم یه فروشگاه مستقل و
              قابل‌اعتماد که کاملاً مال خودتونه.
            </p>
          </Reveal>
          <Reveal delay={660} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">نمونه‌کارهای طراحی سایت فروشگاهی وب پیکاسو</h2>
            <p className="text-[14px] leading-[2] text-dim">
              تا امروز چندین پروژه‌ی طراحی سایت فروشگاهی در صنف‌های مختلف تحویل دادیم؛ از پوشاک و
              دیجیتال‌کالا گرفته تا خوراکی و لوازم آرایشی. می‌تونید نمونه‌کارهای قبلی رو تو بخش{" "}
              <Link href="/portfolio" className="text-accent underline underline-offset-2">
                پرتفولیو
              </Link>{" "}
              ببینید تا کیفیت طراحی، سرعت فروشگاه و تجربه‌ی کاربری پروژه‌های قبلی رو از نزدیک بررسی
              کنید. دیدن نمونه‌کار واقعی قبل از سفارش، بهترین راه برای سنجیدن کیفیت واقعی یه تیم
              طراحی سایت فروشگاهیه، نه فقط شنیدن حرف‌های تبلیغاتی.
            </p>
          </Reveal>
          <Reveal delay={720} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">هزینه‌ی طراحی سایت فروشگاهی در مقابل کمیسیون مارکت‌پلیس‌ها</h2>
            <p className="text-[14px] leading-[2] text-dim">
              خیلی از فروشنده‌ها هزینه‌ی طراحی سایت فروشگاهی رو با هزینه‌ی فروش در مارکت‌پلیس‌ها
              مقایسه نمی‌کنن، در حالی که این مقایسه خیلی مهمه. مارکت‌پلیس‌ها معمولاً درصدی از هر
              فروش رو به‌عنوان کمیسیون کم می‌کنن، و این هزینه هر ماه و هر سال ادامه داره و با رشد
              فروش شما هم بیشتر می‌شه. در مقابل، هزینه‌ی طراحی سایت فروشگاهی یه سرمایه‌گذاری
              یک‌باره‌ست؛ بعد از تحویل، فقط هزینه‌ی نگهداری و هاست می‌مونه که معمولاً خیلی کمتر از
              کمیسیون بلندمدت مارکت‌پلیس‌هاست. برای فروشگاه‌هایی که حجم فروش بالایی دارن یا قصد
              رشد جدی دارن، این تفاوت هزینه در طول زمان کاملاً محسوسه.
            </p>
          </Reveal>
        </div>
      </section>

      {/* چک‌لیست انتخاب */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-8">
            <h2 className="font-display text-[26px] font-normal sm:text-[32px]">
              چک‌لیست انتخاب تیم طراحی سایت فروشگاهی
            </h2>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              قبل از سفارش طراحی سایت فروشگاهی، این چند نکته رو از هر تیمی که در نظر دارید بپرسید.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              "آیا نمونه‌کار واقعی از فروشگاه‌های قبلی‌شون دارن؟",
              "آیا درگاه پرداخت داخلی رو قبلاً پیاده‌سازی کردن؟",
              "آیا سورس کامل فروشگاه بعد از تحویل به شما داده می‌شه؟",
              "آیا آموزش مدیریت روزانه‌ی فروشگاه رو ارائه می‌دن؟",
              "آیا بعد از تحویل، پشتیبانی فنی و رفع باگ دارن؟",
              "آیا سئوی صفحات محصول هم بخشی از پروژه‌ست؟",
            ].map((item) => (
              <Reveal key={item} className="flex items-start gap-3 rounded-card border border-ink/10 bg-surface/50 p-4">
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2.4}>
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                <p className="text-[13.5px] leading-relaxed text-dim">{item}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-10 flex items-baseline gap-4">
            <span className="flex h-8 items-center rounded-full border border-ink/10 bg-surface px-3.5 font-mono text-sm font-bold text-ink">
              FAQ
            </span>
            <div>
              <h2 className="font-display text-[28px] font-normal sm:text-[34px] lg:text-[40px]">
                سوالات متداول درباره‌ی طراحی سایت فروشگاهی
              </h2>
            </div>
          </Reveal>

          <div className="mx-auto max-w-[820px] space-y-3">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delay={i * 40}>
                <details className="group rounded-card border border-ink/10 bg-surface/50 p-5 open:border-accent/40">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[14.5px] font-bold text-ink">
                    {f.q}
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="flex-shrink-0 text-dim transition-transform group-open:rotate-45"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </summary>
                  <p className="mt-3 text-[13.5px] leading-[1.9] text-dim">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* جمع‌بندی + CTA */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="flex flex-col items-center gap-5 rounded-card border border-ink/10 bg-surface/50 p-8 text-center sm:p-12">
            <h2 className="max-w-[26ch] font-display text-2xl font-normal sm:text-[32px]">
              چرا الان زمان مناسبی برای طراحی سایت فروشگاهی است
            </h2>
            <p className="max-w-[60ch] text-[14.5px] leading-[2] text-dim">
              هر روزی که فروشتون فقط از طریق مارکت‌پلیس یا شبکه‌ی اجتماعی انجام بشه، بخشی از سود شما
              به‌عنوان کمیسیون از دستتون می‌ره و کنترل کامل برند دست خودتون نیست. طراحی سایت
              فروشگاهی اختصاصی، چه با{" "}
              <Link href={landingHref("wordpressDesign")} className="text-accent underline underline-offset-2">
                وردپرس
              </Link>{" "}
              چه با{" "}
              <Link href={landingHref("customDesign")} className="text-accent underline underline-offset-2">
                کدنویسی اختصاصی
              </Link>
              ، این کنترل رو به شما برمی‌گردونه و یه دارایی دیجیتال بلندمدت برای کسب‌وکارتون
              می‌سازه. برای آشنایی با پایه‌های{" "}
              <Link href={landingHref("websiteDesign")} className="text-accent underline underline-offset-2">
                طراحی سایت
              </Link>{" "}
              هم می‌تونید صفحه‌ی اصلی این موضوع رو ببینید.
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/order?category=wordpress"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-[14.5px] font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
              >
                مشاهده‌ی پلن‌ها و ثبت سفارش
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[15px] w-[15px]">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-canvas px-6 py-3 text-[14.5px] font-bold text-ink transition hover:border-accent hover:text-accent"
              >
                تماس با ما
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* خدمات مرتبط */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-8">
            <h2 className="font-display text-[22px] font-normal sm:text-[26px]">خدمات مرتبط با طراحی سایت فروشگاهی</h2>
          </Reveal>
          <div className="flex flex-wrap gap-3">
            <Link href={landingHref("websiteDesign")} className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-surface px-4 py-2 text-[13.5px] font-semibold text-dim transition hover:border-accent hover:text-accent">
              طراحی سایت
            </Link>
            <Link href={landingHref("customDesign")} className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-surface px-4 py-2 text-[13.5px] font-semibold text-dim transition hover:border-accent hover:text-accent">
              طراحی سایت اختصاصی
            </Link>
            <Link href={landingHref("wordpressDesign")} className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-surface px-4 py-2 text-[13.5px] font-semibold text-dim transition hover:border-accent hover:text-accent">
              طراحی سایت وردپرس
            </Link>
            <Link href={landingHref("websitePrice")} className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-surface px-4 py-2 text-[13.5px] font-semibold text-dim transition hover:border-accent hover:text-accent">
              قیمت طراحی سایت
            </Link>
            <Link href={landingHref("seoServices")} className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-surface px-4 py-2 text-[13.5px] font-semibold text-dim transition hover:border-accent hover:text-accent">
              خدمات سئو
            </Link>
          </div>
        </div>
      </section>

      <Contact />
      <Footer />
    </>
  );
}
