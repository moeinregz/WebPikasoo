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
const pageUrl = "/wordpress-design";

export const metadata = {
  title: "طراحی سایت وردپرس حرفه‌ای | قیمت و تعرفه | وب پیکاسو",
  description:
    "طراحی سایت وردپرس اقتصادی و سریع، از سایت شرکتی تا فروشگاهی با ووکامرس — قیمت شفاف، پشتیبانی بعد از تحویل و پنل مدیریت ساده برای خودتون.",
  alternates: { canonical: pageUrl },
  openGraph: {
    url: pageUrl,
    title: "طراحی سایت وردپرس حرفه‌ای | قیمت و تعرفه | وب پیکاسو",
    description:
      "طراحی سایت وردپرس اقتصادی و سریع، از سایت شرکتی تا فروشگاهی با ووکامرس — قیمت شفاف و پشتیبانی بعد از تحویل.",
  },
};

/* ---------------------------------------------------------------------- */
/* داده‌ها                                                                  */
/* ---------------------------------------------------------------------- */

type Benefit = { title: string; desc: ReactNode; icon: ReactNode };

const advantages: Benefit[] = [
  {
    title: "هزینه‌ی مناسب‌تر",
    desc: "چون از یه هسته‌ی آماده و امتحان‌شده استفاده می‌شه، هزینه‌ی طراحی سایت وردپرس معمولاً کمتر از کدنویسی کاملاً اختصاصیه.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
      </svg>
    ),
  },
  {
    title: "راه‌اندازی سریع‌تر",
    desc: "وردپرس هزاران قالب و افزونه‌ی آماده داره که خیلی از نیازهای رایج رو بدون نوشتن کد از صفر پوشش می‌ده.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
      </svg>
    ),
  },
  {
    title: "مدیریت محتوای آسون",
    desc: "پنل مدیریت وردپرس ساده و شناخته‌شده‌ست؛ خودتون بدون دانش فنی می‌تونید متن، تصویر و صفحات رو ویرایش کنید.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    title: "اکوسیستم بزرگ افزونه‌ها",
    desc: "از فرم تماس و باشگاه مشتریان تا فروشگاه کامل با ووکامرس، تقریباً هر قابلیتی افزونه‌ی امتحان‌پس‌داده‌ای داره.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <circle cx="6" cy="6" r="2.6" />
        <circle cx="18" cy="6" r="2.6" />
        <circle cx="12" cy="18" r="2.6" />
        <path d="M8.2 7.4 10.5 15.5M15.8 7.4 13.5 15.5M8.5 6h7" />
      </svg>
    ),
  },
  {
    title: "پایه‌ی خوب برای سئو",
    desc: (
      <>
        ساختار وردپرس از نظر سئوی فنی مشکلی نداره و با افزونه‌های سئو قابل تقویته؛ برای رشد بیشتر
        هم{" "}
        <Link href={landingHref("seoServices")} className="text-accent underline underline-offset-2">
          خدمات سئو
        </Link>{" "}
        اختصاصی ارائه می‌دیم.
      </>
    ),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m20 20-4.35-4.35" />
      </svg>
    ),
  },
  {
    title: "جامعه و پشتیبانی گسترده",
    desc: "وردپرس سال‌هاست پرکاربردترین سیستم مدیریت محتوای دنیاست؛ یعنی برای هر مشکلی معمولاً راه‌حل شناخته‌شده‌ای وجود داره.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <circle cx="8" cy="9" r="2.6" />
        <circle cx="16" cy="9" r="2.6" />
        <path d="M3 19c.8-2.8 2.7-4.3 5-4.3s4.2 1.5 5 4.3M13 19c.7-2.4 2.2-3.7 4-3.7s3.3 1.3 4 3.7" />
      </svg>
    ),
  },
];

const services: Benefit[] = [
  {
    title: "طراحی قالب اختصاصی",
    desc: "به‌جای یه قالب عمومی و تکراری، ظاهر سایت شما بر اساس هویت برندتون طراحی و پیاده‌سازی می‌شه.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M9 6 3 12l6 6M15 6l6 6-6 6" />
      </svg>
    ),
  },
  {
    title: "راه‌اندازی فروشگاه با ووکامرس",
    desc: (
      <>
        برای{" "}
        <Link href={landingHref("storeDesign")} className="text-accent underline underline-offset-2">
          طراحی سایت فروشگاهی
        </Link>{" "}
        روی وردپرس، ووکامرس رو با درگاه پرداخت، مدیریت موجودی و سبد خرید کامل پیاده‌سازی می‌کنیم.
      </>
    ),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <circle cx="9" cy="20" r="1.4" />
        <circle cx="17" cy="20" r="1.4" />
        <path d="M2.5 4h2.5l2.4 11.2a2 2 0 0 0 2 1.6h7.4a2 2 0 0 0 2-1.6L21 8H6" />
      </svg>
    ),
  },
  {
    title: "امنیت و تقویت هسته",
    desc: "نصب افزونه‌های امنیتی معتبر، محدودسازی ورود مشکوک و به‌روزرسانی منظم هسته و افزونه‌ها.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M4 12a8 8 0 0 1 16 0" />
        <rect x="2.5" y="12" width="4" height="6" rx="1.5" />
        <rect x="17.5" y="12" width="4" height="6" rx="1.5" />
        <path d="M20 18v1a3 3 0 0 1-3 3h-3" />
      </svg>
    ),
  },
  {
    title: "بهینه‌سازی سرعت",
    desc: "کش کردن صفحات، فشرده‌سازی تصاویر و پاکسازی کدهای اضافه‌ی قالب و افزونه‌ها برای بارگذاری سریع‌تر.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
      </svg>
    ),
  },
  {
    title: "چندزبانه و چندمنطقه‌ای",
    desc: "در صورت نیاز، سایت وردپرسی شما می‌تونه به چند زبان و برای چند بازار مختلف پیکربندی بشه.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z" />
      </svg>
    ),
  },
  {
    title: "انتقال و مهاجرت سایت",
    desc: "اگه از قبل یه سایت وردپرسی دارید، می‌تونیم بدون از دست رفتن محتوا، شما رو به هاست یا قالب جدید منتقل کنیم.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
];

type Step = { n: string; title: string; desc: string };

const steps: Step[] = [
  { n: "۰۱", title: "مشاوره و بررسی نیاز", desc: "بررسی می‌کنیم سایت شما شرکتی، فروشگاهی یا ترکیبیه و چه امکاناتی نیاز داره." },
  { n: "۰۲", title: "انتخاب ساختار و افزونه‌ها", desc: "ساختار صفحات و افزونه‌های موردنیاز (فروشگاه، فرم، سئو) رو مشخص می‌کنیم." },
  { n: "۰۳", title: "طراحی قالب اختصاصی", desc: "ظاهر سایت متناسب با برند شما طراحی می‌شه، نه یه قالب عمومی و تکراری." },
  { n: "۰۴", title: "پیاده‌سازی و پیکربندی", desc: "نصب وردپرس، پیاده‌سازی قالب، افزونه‌ها و تنظیمات امنیتی و سرعت." },
  { n: "۰۵", title: "بارگذاری محتوا", desc: "متن‌ها، تصاویر و محصولات (در صورت وجود فروشگاه) در سایت قرار می‌گیره." },
  { n: "۰۶", title: "تحویل و آموزش پنل مدیریت", desc: "آموزش کامل کار با پنل وردپرس رو می‌دیم و برای پشتیبانی فنی در دسترسیم." },
];

const faqs: { q: string; a: string }[] = [
  {
    q: "قیمت طراحی سایت با وردپرس چقدر است؟",
    a: "تعرفه‌ی طراحی سایت وردپرس بسته به نوع سایت و امکانات از حدود بیست و پنج میلیون تومان برای پلن استارتاپ شروع می‌شه؛ برای فروشگاه با ووکامرس قیمت بالاتره.",
  },
  {
    q: "چطور سفارش طراحی سایت وردپرس را ثبت کنم؟",
    a: "کافیه از صفحه‌ی ثبت سفارش، پلن وردپرس مناسب رو انتخاب کنید یا از طریق فرم تماس با تیم ما هماهنگ کنید تا مشاوره‌ی رایگان انجام بشه.",
  },
  {
    q: "خدمات طراحی سایت وردپرس شامل چه مواردی می‌شود؟",
    a: "طراحی قالب اختصاصی، پیکربندی افزونه‌های موردنیاز، بهینه‌سازی سرعت و امنیت، و آموزش کامل مدیریت سایت بعد از تحویل.",
  },
  {
    q: "آیا می‌توانم هزینه‌ی طراحی سایت وردپرس را از قبل تخمین بزنم؟",
    a: "بله، عوامل اصلی قیمت (نوع سایت، تعداد صفحات، نیاز به فروشگاه) در همین صفحه توضیح داده شده؛ برای برآورد دقیق‌تر هم می‌تونید فرم مشاوره رو پر کنید.",
  },
  {
    q: "طراحی سایت وردپرس فروشگاهی چه تفاوتی با نسخه‌ی معرفی دارد؟",
    a: "نسخه‌ی فروشگاهی شامل ووکامرس، درگاه پرداخت، مدیریت موجودی و سبد خریده؛ نسخه‌ی معرفی فقط شامل صفحات اطلاعاتیه، بدون قابلیت فروش مستقیم.",
  },
  {
    q: "آیا ساخت سایت وردپرس رایگان ممکن است؟",
    a: "خود وردپرس رایگانه، اما هاست، دامنه، قالب حرفه‌ای و افزونه‌های باکیفیت معمولاً هزینه دارن؛ ساخت کاملاً رایگان معمولاً محدودیت‌های جدی در ظاهر، سرعت و پشتیبانی داره.",
  },
  {
    q: "چقدر طول می‌کشد تا سایت وردپرسی من آماده شود؟",
    a: "بسته به پیچیدگی، معمولاً بین دو تا پنج هفته زمان می‌بره؛ فروشگاه‌های بزرگ‌تر ممکنه بیشتر طول بکشه.",
  },
  {
    q: "آیا بعد از تحویل هم پشتیبانی داریم؟",
    a: "بله، هر پروژه شامل آموزش مدیریت و پشتیبانی فنی بعد از تحویله.",
  },
  {
    q: "آیا امکان تبدیل سایت وردپرسی به سایت اختصاصی در آینده وجود دارد؟",
    a: "بله، خیلی از پروژه‌ها همین مسیر رو طی می‌کنن؛ با وردپرس شروع می‌کنن و بعد از رشد کسب‌وکار، به یه پروژه‌ی کدنویسی اختصاصی منتقل می‌شن.",
  },
  {
    q: "آیا سئوی سایت وردپرسی هم انجام می‌شود؟",
    a: "بله، ساختار فنی سایت از ابتدا برای سئو بهینه می‌شه؛ خدمات سئو اختصاصی هم برای رشد بلندمدت رتبه ارائه می‌دیم.",
  },
  {
    q: "آیا امکان طراحی سایت وردپرس چندزبانه وجود دارد؟",
    a: "بله، با افزونه‌های چندزبانه‌ی معتبر می‌شه سایت وردپرسی رو برای چند زبان و بازار مختلف پیکربندی کرد.",
  },
  {
    q: "اگر از قبل یک سایت وردپرسی قدیمی دارم چه کار کنم؟",
    a: "می‌شه سایت فعلی رو بازطراحی کرد یا محتوای اون رو به یه قالب و ساختار جدید منتقل کرد؛ این نیاز رو در جلسه‌ی مشاوره بررسی می‌کنیم.",
  },
];

/* ---------------------------------------------------------------------- */

export default async function WordpressDesignPage() {
  const isLoggedIn = !!(await getCurrentUser());

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        serviceType: "طراحی سایت وردپرس",
        name: "طراحی سایت وردپرس حرفه‌ای",
        description: "طراحی سایت وردپرس اقتصادی و سریع، از سایت شرکتی تا فروشگاهی با ووکامرس.",
        provider: { "@type": "Organization", name: "وب پیکاسو", url: siteUrl },
        areaServed: "IR",
        url: `${siteUrl}${pageUrl}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "خانه", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "طراحی سایت", item: `${siteUrl}${landingHref("websiteDesign")}` },
          { "@type": "ListItem", position: 3, name: "طراحی سایت وردپرس", item: `${siteUrl}${pageUrl}` },
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
        eyebrow="WordPress Website Design"
        title="طراحی سایت وردپرس حرفه‌ای"
        desc="اگه می‌خواید بعداً خودتون محتوا و صفحات رو راحت مدیریت کنید، طراحی سایت وردپرس یه پنل مدیریت آشنا و هزاران افزونه‌ی کاربردی در اختیارتون می‌ذاره — گزینه‌ای اقتصادی و سریع برای شروع، چه سایت معرفی، چه فروشگاه کامل."
      >
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/order?category=wordpress"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-[14.5px] font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
          >
            مشاهده پلن‌ها و ثبت سفارش
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
              طراحی سایت وردپرس چیست؟
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Reveal className="rounded-card border border-ink/10 bg-surface/50 p-6 text-[14.5px] leading-[2] text-dim lg:col-span-1">
              وردپرس یه سیستم مدیریت محتوا (CMS) رایگان و متن‌بازه که پرکاربردترین ابزار ساخت سایت
              در دنیاست. طراحی سایت وردپرس یعنی استفاده از این هسته به‌عنوان پایه، و ساختن یه قالب و
              مجموعه افزونه‌ی اختصاصی روش، به‌جای کدنویسی هر بخش از صفر.
            </Reveal>
            <Reveal delay={80} className="rounded-card border border-ink/10 bg-surface/50 p-6 text-[14.5px] leading-[2] text-dim lg:col-span-1">
              وردپرس هم برای یه وبلاگ ساده، هم یه سایت شرکتی، و هم یه فروشگاه کامل با ووکامرس قابل
              استفاده‌ست. همین انعطاف باعث شده خیلی از کسب‌وکارهای کوچک و متوسط، طراحی سایت وردپرس
              رو نسبت به کدنویسی کاملاً اختصاصی ترجیح بدن.
            </Reveal>
            <Reveal delay={160} className="rounded-card border border-ink/10 bg-surface/50 p-6 text-[14.5px] leading-[2] text-dim lg:col-span-1">
              نکته‌ی مهم اینه که وردپرس رایگانه، اما یه سایت وردپرسی حرفه‌ای نیاز به طراحی اختصاصی
              قالب، پیکربندی درست افزونه‌ها و بهینه‌سازی سرعت و امنیت داره؛ همین جاست که یه تیم
              باتجربه فرق قابل‌توجهی در نتیجه‌ی نهایی ایجاد می‌کنه.
            </Reveal>
          </div>
        </div>
      </section>

      {/* چرا وردپرس */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] bg-dot-grid" />
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-12 flex items-baseline gap-4">
            <span className="flex h-8 items-center rounded-full border border-ink/10 bg-surface px-3.5 font-mono text-sm font-bold text-ink">
              Why
            </span>
            <div>
              <h2 className="font-display text-[28px] font-normal sm:text-[34px] lg:text-[40px]">
                چرا طراحی سایت وردپرس انتخاب خوبی است
              </h2>
              <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
                شش دلیلی که وردپرس رو گزینه‌ی محبوب کسب‌وکارهای کوچک و متوسط کرده.
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {advantages.map((f, i) => (
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

      {/* خدمات */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-12">
            <h2 className="font-display text-[28px] font-normal sm:text-[34px] lg:text-[40px]">
              خدمات طراحی سایت وردپرس
            </h2>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              از طراحی قالب اختصاصی تا راه‌اندازی فروشگاه و مهاجرت سایت‌های قدیمی.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((f, i) => (
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

      {/* قیمت و تعرفه — داده‌ی واقعی */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-10">
            <h2 className="font-display text-[26px] font-normal sm:text-[32px]">
              تعرفه و قیمت طراحی سایت وردپرس
            </h2>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              سه پلن اصلی برای نیازهای مختلف؛ از سایت معرفی ساده تا فروشگاه کامل.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Reveal className="rounded-card border border-ink/10 bg-surface/50 p-6">
              <h3 className="mb-1.5 text-[16px] font-bold text-ink">استارتاپ</h3>
              <p className="mb-4 text-[13.5px] leading-relaxed text-dim">
                مناسب سایت‌های معرفی کوچک و تازه‌کار، با صفحات اصلی و طراحی حرفه‌ای.
              </p>
              <p className="mb-4 text-[15px] font-bold text-accent">شروع از ۲۵ میلیون تومان</p>
            </Reveal>
            <Reveal delay={80} className="rounded-card border border-accent/40 bg-surface/50 p-6">
              <h3 className="mb-1.5 text-[16px] font-bold text-ink">کسب‌وکار</h3>
              <p className="mb-4 text-[13.5px] leading-relaxed text-dim">
                طراحی UI اختصاصی، تا دوازده صفحه، امکان افزودن فروشگاه و سئوی داخلی.
              </p>
              <p className="mb-4 text-[15px] font-bold text-accent">شروع از ۳۸ میلیون تومان</p>
            </Reveal>
            <Reveal delay={160} className="rounded-card border border-ink/10 bg-surface/50 p-6">
              <h3 className="mb-1.5 text-[16px] font-bold text-ink">فروشگاهی</h3>
              <p className="mb-4 text-[13.5px] leading-relaxed text-dim">
                فروشگاه کامل با ووکامرس، درگاه پرداخت، مدیریت موجودی و محصولات نامحدود.
              </p>
              <p className="mb-4 text-[15px] font-bold text-accent">شروع از ۴۷ میلیون تومان</p>
            </Reveal>
          </div>
          <p className="mt-6 text-[13px] text-dim">
            برای دیدن جزئیات کامل هر پلن،{" "}
            <Link href={landingHref("websitePrice")} className="text-accent underline underline-offset-2">
              بازه‌ی قیمت طراحی سایت
            </Link>{" "}
            رو ببینید یا از صفحه‌ی{" "}
            <Link href="/order?category=wordpress" className="text-accent underline underline-offset-2">
              ثبت سفارش
            </Link>{" "}
            پلن مناسب رو انتخاب کنید.
          </p>
        </div>
      </section>

      {/* برآورد آنلاین هزینه */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mx-auto max-w-[820px] rounded-card border border-ink/10 bg-surface/50 p-7 sm:p-10">
            <h2 className="mb-4 font-display text-[24px] font-normal sm:text-[28px]">
              چطور هزینه‌ی طراحی سایت وردپرس را از قبل تخمین بزنیم
            </h2>
            <p className="text-[14.5px] leading-[2] text-dim">
              به‌جای یه محاسبه‌ی آنلاین خودکار که نمی‌تونه همه‌ی جزئیات پروژه‌ی شما رو در نظر بگیره،
              بهتره عوامل اصلی قیمت رو بشناسید: اول، نوع سایت — معرفی ساده، سایت شرکتی چندصفحه‌ای یا
              فروشگاه با ووکامرس. دوم، تعداد صفحات و بخش‌های موردنیاز. سوم، افزونه‌های تخصصی مثل
              باشگاه مشتریان یا رزرو آنلاین. و چهارم، نیاز به طراحی گرافیکی کاملاً اختصاصی در مقابل
              استفاده از یه قالب پایه‌ی سفارشی‌شده. با جواب این چهار سوال، معمولاً می‌شه پلن مناسب
              رو از جدول بالا حدس زد؛ برای عدد دقیق هم بعد از یه مشاوره‌ی رایگان کوتاه، پیشنهاد
              قیمت مکتوب دریافت می‌کنید.
            </p>
          </Reveal>
        </div>
      </section>

      {/* مراحل */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-12">
            <h2 className="font-display text-[28px] font-normal sm:text-[34px] lg:text-[40px]">
              مراحل ساخت سایت وردپرس در وب پیکاسو
            </h2>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              شش مرحله‌ی شفاف، از مشاوره‌ی اولیه تا آموزش کامل پنل مدیریت.
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

      {/* بلوک‌های محتوایی */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] bg-dot-grid" />
        <div className="relative z-[1] mx-auto max-w-container space-y-6 px-6">
          <Reveal className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">ساخت سایت وردپرس رایگان یا سفارش حرفه‌ای؛ کدام بهتر است</h2>
            <p className="text-[14px] leading-[2] text-dim">
              خود نرم‌افزار وردپرس کاملاً رایگان و متن‌بازه، برای همین خیلی‌ها فکر می‌کنن ساخت سایت
              وردپرس رایگان یعنی هزینه‌ی صفر. اما در عمل، هاست، دامنه، قالب باکیفیت و افزونه‌های
              حرفه‌ای معمولاً هزینه دارن؛ و نصب و پیکربندی درست هم به دانش فنی نیاز داره. مسیر
              کاملاً رایگان با قالب‌های عمومی و رایگان، معمولاً منجر به سایتی می‌شه که ظاهر تکراری،
              سرعت پایین یا مشکلات امنیتی داره. سفارش طراحی سایت وردپرس حرفه‌ای، در ازای هزینه‌ای
              معقول، ظاهر اختصاصی، پیکربندی درست امنیت و سرعت، و پشتیبانی بعد از تحویل رو تضمین
              می‌کنه.
            </p>
          </Reveal>
          <Reveal delay={60} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">طراحی سایت وردپرس یا اختصاصی؛ کدام مناسب شماست؟</h2>
            <p className="text-[14px] leading-[2] text-dim">
              برای بیشتر سایت‌های معرفی و فروشگاه‌های استاندارد، طراحی سایت وردپرس هم سریع‌تره و هم
              اقتصادی‌تر. اما اگه پروژه‌ی شما نیاز به منطق کاری خیلی خاص، حجم داده‌ی بالا یا اتصال به
              سامانه‌های داخلی پیچیده داره،{" "}
              <Link href={landingHref("customDesign")} className="text-accent underline underline-offset-2">
                طراحی سایت اختصاصی
              </Link>{" "}
              با کدنویسی خالص، کنترل و انعطاف بیشتری می‌ده. خیلی از پروژه‌ها هم با وردپرس شروع
              می‌کنن و بعد از رشد کسب‌وکار، به کدنویسی اختصاصی مهاجرت می‌کنن؛ وب پیکاسو تو جلسه‌ی
              مشاوره‌ی رایگان، بر اساس نیاز واقعی پروژه‌تون، مسیر مناسب رو پیشنهاد می‌ده.
            </p>
          </Reveal>
          <Reveal delay={120} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">امنیت در طراحی سایت وردپرس</h2>
            <p className="text-[14px] leading-[2] text-dim">
              چون وردپرس پرکاربردترین سیستم مدیریت محتواست، هدف مشترک حمله‌های خودکار هم هست. برای
              همین امنیت باید از همون ابتدا جدی گرفته بشه: انتخاب افزونه‌ها فقط از منابع معتبر،
              محدودسازی تلاش‌های ورود ناموفق، غیرفعال کردن ویرایشگر فایل از داخل پنل، و به‌روزرسانی
              منظم هسته و افزونه‌ها. در کنارش، پشتیبان‌گیری دوره‌ای از سایت باعث می‌شه حتی در بدترین
              حالت، بازگردانی سریع ممکن باشه. این موارد جزو استانداردهایی هستن که در هر پروژه‌ی
              وردپرسی وب پیکاسو رعایت می‌شن.
            </p>
          </Reveal>
          <Reveal delay={180} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">اشتباهات رایج در طراحی سایت وردپرس</h2>
            <p className="text-[14px] leading-[2] text-dim">
              رایج‌ترین اشتباه، نصب افزونه‌های زیاد و غیرضروری که سرعت سایت رو پایین میاره. اشتباه
              دوم، استفاده از یه قالب رایگان عمومی بدون سفارشی‌سازی، که ظاهر سایت رو شبیه هزاران
              سایت دیگه می‌کنه. اشتباه سوم، غفلت از به‌روزرسانی منظم هسته و افزونه‌ها، که ریسک امنیتی
              رو بالا می‌بره. و اشتباه چهارم، انتخاب هاست ضعیف که با وجود قالب و افزونه‌ی خوب، باز
              هم سایت رو کند می‌کنه. وب پیکاسو در طراحی سایت وردپرس، دقیقاً روی رفع همین نقاط ضعف
              رایج تمرکز می‌کنه.
            </p>
          </Reveal>
          <Reveal delay={240} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">نمونه پروژه‌های طراحی سایت وردپرس وب پیکاسو</h2>
            <p className="text-[14px] leading-[2] text-dim">
              تا امروز پروژه‌ی طراحی سایت وردپرس متنوعی رو برای شرکت‌ها و فروشگاه‌های مختلف تحویل
              دادیم؛ از سایت‌های معرفی ساده تا فروشگاه‌های کامل با ووکامرس. می‌تونید نمونه‌کارهای
              قبلی رو تو بخش{" "}
              <Link href="/portfolio" className="text-accent underline underline-offset-2">
                پرتفولیو
              </Link>{" "}
              ببینید تا با کیفیت طراحی و تنوع پروژه‌های وردپرسی قبلی آشنا بشید.
            </p>
          </Reveal>
          <Reveal delay={300} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">چرا کسب‌وکارها وب پیکاسو را برای طراحی سایت وردپرس انتخاب می‌کنند</h2>
            <p className="text-[14px] leading-[2] text-dim">
              خیلی از مشتری‌های ما قبل از سفارش، تجربه‌ی یه سایت وردپرسی کند، ناامن یا با ظاهر
              تکراری داشتن. تفاوت وب پیکاسو، توجه هم‌زمان به طراحی اختصاصی، سرعت و امنیته، نه فقط
              نصب سریع یه قالب. قبل از شروع، نیاز واقعی کسب‌وکارتون رو بررسی می‌کنیم تا سایتی
              بسازیم که هم زیبا باشه و هم واقعاً براتون کار کنه؛ بیشتر درباره‌ی تیم رو در{" "}
              <Link href="/about" className="text-accent underline underline-offset-2">
                صفحه‌ی درباره ما
              </Link>{" "}
              بخونید.
            </p>
          </Reveal>
          <Reveal delay={360} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">طراحی سایت وردپرس برای صنایع و کسب‌وکارهای مختلف</h2>
            <p className="text-[14px] leading-[2] text-dim">
              وردپرس به‌قدری منعطفه که تقریباً برای هر صنفی قابل تنظیمه. یه رستوران می‌تونه با
              افزونه‌ی رزرو میز و منوی دیجیتال شروع کنه؛ یه مطب با افزونه‌ی نوبت‌دهی آنلاین؛ یه
              آموزشگاه با افزونه‌ی ثبت‌نام دوره و پرداخت شهریه؛ و یه دفتر مشاوره با فرم‌های تماس
              هدفمند برای هر خدمت. وب پیکاسو قبل از شروع هر پروژه‌ی طراحی سایت وردپرس، افزونه‌ها و
              ساختار صفحات رو دقیقاً مطابق نیاز همون صنف انتخاب می‌کنه، نه یه بسته‌ی یکسان برای
              همه‌ی مشتری‌ها.
            </p>
          </Reveal>
          <Reveal delay={420} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">چطور نتیجه‌ی سایت وردپرسی را بعد از تحویل ارزیابی کنیم</h2>
            <p className="text-[14px] leading-[2] text-dim">
              بعد از تحویل، چند معیار ساده کمکتون می‌کنه بفهمید طراحی سایت وردپرس‌تون اصولی انجام
              شده یا نه. اول، سرعت بارگذاری صفحات رو با یه ابزار رایگان تست کنید. دوم، مطمئن بشید
              پنل مدیریت رو خودتون به‌راحتی یاد گرفتید و می‌تونید محتوا اضافه کنید. سوم، ببینید آیا
              افزونه‌های نصب‌شده واقعاً موردنیازتون هستن یا فقط اضافه‌بار غیرضروری‌ان. و چهارم،
              بررسی کنید آیا گواهی SSL و پشتیبان‌گیری خودکار به‌درستی فعاله.
            </p>
          </Reveal>
          <Reveal delay={480} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">پشتیبانی و به‌روزرسانی سایت وردپرسی بعد از تحویل</h2>
            <p className="text-[14px] leading-[2] text-dim">
              تحویل سایت پایان کار نیست؛ وردپرس، قالب و افزونه‌ها به‌مرور نسخه‌های جدید منتشر
              می‌کنن که برای امنیت و سازگاری باید نصب بشن. بدون به‌روزرسانی منظم، سایت به‌مرور در
              معرض خطر آسیب‌پذیری‌های شناخته‌شده قرار می‌گیره. وب پیکاسو بعد از تحویل هر پروژه، یه
              دوره‌ی پشتیبانی رایگان ارائه می‌ده و در صورت نیاز، می‌شه قرارداد نگهداری بلندمدت هم
              برای به‌روزرسانی منظم و پشتیبان‌گیری دوره‌ای بست.
            </p>
          </Reveal>
          <Reveal delay={540} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">تفاوت یک فروشگاه ووکامرس حرفه‌ای با یک نصب ساده</h2>
            <p className="text-[14px] leading-[2] text-dim">
              نصب افزونه‌ی ووکامرس به‌تنهایی چند دقیقه طول می‌کشه، اما فاصله‌ی زیادی با یه فروشگاه
              حرفه‌ای داره. یه راه‌اندازی حرفه‌ای شامل انتخاب و پیکربندی درست درگاه پرداخت، طراحی
              صفحات محصول و دسته‌بندی متناسب با برند، بهینه‌سازی سرعت باوجود حجم بالای تصویر
              محصولات، و تنظیم درست مالیات و روش‌های ارساله. یه نصب ساده و پیش‌فرض معمولاً در همین
              نکات کوچیک اما تاثیرگذار، ضعف نشون می‌ده و در نهایت روی نرخ تبدیل و تجربه‌ی خرید
              مشتری اثر می‌ذاره.
            </p>
          </Reveal>
          <Reveal delay={600} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">انتخاب هاست مناسب برای سایت وردپرسی</h2>
            <p className="text-[14px] leading-[2] text-dim">
              هرچقدر قالب و افزونه‌ها بهینه باشن، روی یه هاست ضعیف باز هم سایت کند بالا میاد. برای
              یه سایت وردپرسی حرفه‌ای، هاست باید منابع کافی، پشتیبانی از نسخه‌ی به‌روز PHP، و
              پشتیبان‌گیری خودکار دوره‌ای داشته باشه. برای فروشگاه‌های با ترافیک بالا، هاست‌های
              مخصوص وردپرس یا سرورهای اختصاصی‌تر نتیجه‌ی بهتری می‌دن. وب پیکاسو در انتخاب یا
              ارتقای هاست مناسب هم راهنماییتون می‌کنه تا سرمایه‌گذاری روی طراحی و محتوا، به‌خاطر
              یه هاست ضعیف هدر نره.
            </p>
          </Reveal>
        </div>
      </section>

      {/* چک‌لیست سفارش */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-8">
            <h2 className="font-display text-[26px] font-normal sm:text-[32px]">
              قبل از سفارش طراحی سایت وردپرس چه چیزهایی آماده کنیم؟
            </h2>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              آماده کردن این موارد، فرایند شروع پروژه رو سریع‌تر و دقیق‌تر می‌کنه.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              "لوگو و رنگ‌های اصلی برند (در صورت وجود)",
              "فهرست صفحات و بخش‌های موردنیاز سایت",
              "چند نمونه‌سایت که ظاهرشون رو می‌پسندید",
              "تصمیم درباره‌ی نیاز به فروشگاه و ووکامرس یا نه",
              "متن یا محتوای اولیه‌ی صفحات (حتی پیش‌نویس)",
              "دامنه و هاست فعلی، در صورت داشتن سایت قبلی",
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
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] bg-dot-grid" />
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-10 flex items-baseline gap-4">
            <span className="flex h-8 items-center rounded-full border border-ink/10 bg-surface px-3.5 font-mono text-sm font-bold text-ink">
              FAQ
            </span>
            <div>
              <h2 className="font-display text-[28px] font-normal sm:text-[34px] lg:text-[40px]">
                سوالات متداول درباره‌ی طراحی سایت وردپرس
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
              چرا الان زمان مناسبی برای طراحی سایت وردپرس است
            </h2>
            <p className="max-w-[60ch] text-[14.5px] leading-[2] text-dim">
              وردپرس هنوز هم سریع‌ترین و اقتصادی‌ترین راه برای داشتن یه سایت حرفه‌ای و قابل‌مدیریته،
              چه به دنبال یه{" "}
              <Link href={landingHref("corporateDesign")} className="text-accent underline underline-offset-2">
                سایت شرکتی
              </Link>{" "}
              باشید، چه یه{" "}
              <Link href={landingHref("storeDesign")} className="text-accent underline underline-offset-2">
                فروشگاه آنلاین
              </Link>
              . تیم وب پیکاسو آماده‌ست پروژه‌ی طراحی سایت وردپرس شما رو با ظاهر اختصاصی، سرعت بالا
              و امنیت کامل، از مشاوره تا تحویل همراهی کنه. برای آشنایی با پایه‌های{" "}
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
            <h2 className="font-display text-[22px] font-normal sm:text-[26px]">خدمات مرتبط با طراحی سایت وردپرس</h2>
          </Reveal>
          <div className="flex flex-wrap gap-3">
            <Link href={landingHref("websiteDesign")} className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-surface px-4 py-2 text-[13.5px] font-semibold text-dim transition hover:border-accent hover:text-accent">
              طراحی سایت
            </Link>
            <Link href={landingHref("storeDesign")} className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-surface px-4 py-2 text-[13.5px] font-semibold text-dim transition hover:border-accent hover:text-accent">
              طراحی سایت فروشگاهی
            </Link>
            <Link href={landingHref("corporateDesign")} className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-surface px-4 py-2 text-[13.5px] font-semibold text-dim transition hover:border-accent hover:text-accent">
              طراحی سایت شرکتی
            </Link>
            <Link href={landingHref("customDesign")} className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-surface px-4 py-2 text-[13.5px] font-semibold text-dim transition hover:border-accent hover:text-accent">
              طراحی سایت اختصاصی
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
