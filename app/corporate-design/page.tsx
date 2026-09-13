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
const pageUrl = "/corporate-design";

export const metadata = {
  title: "طراحی سایت شرکتی حرفه‌ای | وب پیکاسو",
  description:
    "طراحی سایت شرکتی با وردپرس یا کدنویسی اختصاصی برای معرفی رسمی خدمات، تیم و نمونه‌کار شرکت شما — قیمت شفاف، در تهران، ری و سراسر کشور.",
  alternates: { canonical: pageUrl },
  openGraph: {
    url: pageUrl,
    title: "طراحی سایت شرکتی حرفه‌ای | وب پیکاسو",
    description:
      "طراحی سایت شرکتی با وردپرس یا کدنویسی اختصاصی برای معرفی رسمی خدمات، تیم و نمونه‌کار شرکت شما.",
  },
};

/* ---------------------------------------------------------------------- */
/* داده‌ها                                                                  */
/* ---------------------------------------------------------------------- */

type Benefit = { title: string; desc: ReactNode; icon: ReactNode };

const whyItMatters: Benefit[] = [
  {
    title: "اعتبار در نگاه اول",
    desc: "یه سایت شرکتی مرتب و حرفه‌ای، در چند ثانیه‌ی اول به بازدیدکننده نشون می‌ده که با یه مجموعه‌ی جدی و قابل‌اعتماد طرفه.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M12 3 4.5 6.5v5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5v-5L12 3Z" />
        <path d="m8.5 12.3 2.4 2.4 4.6-4.9" />
      </svg>
    ),
  },
  {
    title: "معرفی کامل خدمات",
    desc: "برخلاف یه پست شبکه‌ی اجتماعی که سریع فراموش می‌شه، سایت شرکتی جایی دائمیه که همه‌ی خدمات و تخصص‌های شما به‌طور کامل توضیح داده می‌شه.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M7 9h10M7 13h10M7 17h6" />
      </svg>
    ),
  },
  {
    title: "جذب مشتری سازمانی",
    desc: "شرکت‌ها و سازمان‌های بزرگ قبل از هر همکاری، سایت طرف مقابل رو بررسی می‌کنن؛ نبود یه سایت شرکتی حرفه‌ای می‌تونه باعث از دست رفتن قراردادهای بزرگ بشه.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z" />
      </svg>
    ),
  },
  {
    title: "نمایش نمونه‌کار و اعتبار",
    desc: "صفحه‌ی نمونه‌کارها و مشتریان قبلی، بهترین ابزار برای اثبات تخصص شرکت شما بدون نیاز به توضیح مستقیمه.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M4 19V5M4 19h16" />
        <path d="M8 15l3.5-4 3 3L19 8" />
      </svg>
    ),
  },
  {
    title: "دسترسی همیشگی برای شرکا",
    desc: "سرمایه‌گذاران، شرکای تجاری و همکاران بالقوه هر زمان که بخوان می‌تونن اطلاعات کامل شرکت شما رو ببینن، بدون نیاز به تماس یا جلسه‌ی حضوری.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
      </svg>
    ),
  },
  {
    title: "پایه‌ای برای رشد سئو و تبلیغات",
    desc: (
      <>
        سایت شرکتی، مقصد نهایی همه‌ی کمپین‌های تبلیغاتی و فعالیت‌های سئوی شماست؛ برای رشد بلندمدت
        رتبه هم می‌تونید از{" "}
        <Link href={landingHref("seoServices")} className="text-accent underline underline-offset-2">
          خدمات سئو
        </Link>{" "}
        وب پیکاسو استفاده کنید.
      </>
    ),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
      </svg>
    ),
  },
];

const corpFeatures: Benefit[] = [
  {
    title: "صفحه‌ی درباره‌ی ما",
    desc: "تاریخچه، ماموریت و ارزش‌های شرکت رو به شکلی معرفی می‌کنه که اعتماد بازدیدکننده رو جلب کنه.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <circle cx="12" cy="8" r="3.2" />
        <path d="M5.5 20c1-3.6 4-5.5 6.5-5.5s5.5 1.9 6.5 5.5" />
      </svg>
    ),
  },
  {
    title: "صفحه‌ی خدمات دقیق",
    desc: "هر خدمت با توضیح کامل، مزایا و در صورت نیاز قیمت یا بازه‌ی قیمت ارائه می‌شه تا مشتری بالقوه دقیقاً بفهمه چی می‌گیره.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M9 6 3 12l6 6M15 6l6 6-6 6" />
      </svg>
    ),
  },
  {
    title: "گالری نمونه‌کار و پروژه‌ها",
    desc: "نمایش پروژه‌های قبلی شرکت با جزئیات و در صورت امکان نتیجه‌ی قابل‌اندازه‌گیری.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    title: "معرفی تیم",
    desc: "نمایش اعضای اصلی تیم با تخصص و سابقه‌شون، باعث می‌شه سایت شرکتی انسانی‌تر و قابل‌اعتمادتر به نظر برسه.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <circle cx="8" cy="9" r="2.6" />
        <circle cx="16" cy="9" r="2.6" />
        <path d="M3 19c.8-2.8 2.7-4.3 5-4.3s4.2 1.5 5 4.3M13 19c.7-2.4 2.2-3.7 4-3.7s3.3 1.3 4 3.7" />
      </svg>
    ),
  },
  {
    title: "فرم تماس و مسیر همکاری",
    desc: "راه‌های ارتباطی واضح شامل فرم تماس، شماره تماس و آدرس، برای شروع سریع مکالمه با مشتری بالقوه.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <rect x="2.5" y="5" width="19" height="14" rx="2" />
        <path d="m3.5 6.5 8.5 6 8.5-6" />
      </svg>
    ),
  },
  {
    title: "نشان‌های اعتماد",
    desc: "گواهی‌نامه‌ها، مجوزها، نظرات مشتریان قبلی و آمار پروژه‌های انجام‌شده، اعتبار شرکت رو تقویت می‌کنن.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M4 12a8 8 0 0 1 16 0" />
        <rect x="2.5" y="12" width="4" height="6" rx="1.5" />
        <rect x="17.5" y="12" width="4" height="6" rx="1.5" />
        <path d="M20 18v1a3 3 0 0 1-3 3h-3" />
      </svg>
    ),
  },
];

type Step = { n: string; title: string; desc: string };

const steps: Step[] = [
  { n: "۰۱", title: "مشاوره و شناخت برند", desc: "بررسی می‌کنیم شرکت شما چیکار می‌کنه، مخاطب هدفتون کیه و چه پیامی باید منتقل بشه." },
  { n: "۰۲", title: "طراحی ساختار صفحات", desc: "صفحات اصلی، درباره‌ی ما، خدمات، نمونه‌کار و تماس رو متناسب با نیاز شرکت شما می‌چینیم." },
  { n: "۰۳", title: "طراحی رابط بصری", desc: "هویت بصری شرکت شما، از رنگ و تایپوگرافی تا چیدمان، در طراحی نهایی پیاده می‌شه." },
  { n: "۰۴", title: "توسعه و پیاده‌سازی", desc: "کدنویسی یا پیاده‌سازی روی وردپرس، همراه با بهینه‌سازی سرعت و سئو." },
  { n: "۰۵", title: "بارگذاری محتوا", desc: "متن‌ها، تصاویر و نمونه‌کارهای شرکت شما در سایت قرار می‌گیره." },
  { n: "۰۶", title: "تحویل و آموزش", desc: "بعد از تحویل، آموزش مدیریت محتوا رو می‌دیم و برای پشتیبانی فنی در دسترسیم." },
];

const faqs: { q: string; a: string }[] = [
  {
    q: "طراحی سایت شرکتی چقدر طول می‌کشد؟",
    a: "بسته به تعداد صفحات و پیچیدگی طراحی، معمولاً بین دو تا چهار هفته زمان می‌بره؛ زمان دقیق بعد از بررسی نیازتون در پیشنهاد فنی مشخص می‌شه.",
  },
  {
    q: "آیا امکان طراحی سایت شرکتی چندزبانه وجود دارد؟",
    a: "بله، در صورت نیاز به معرفی شرکت به زبان‌های دیگه هم، می‌شه نسخه‌ی چندزبانه طراحی کرد؛ این نیاز رو در همون جلسه‌ی مشاوره‌ی اولیه مشخص می‌کنیم.",
  },
  {
    q: "آیا بعد از تحویل هم پشتیبانی داریم؟",
    a: "بله، هر پروژه شامل آموزش مدیریت محتوا و پشتیبانی فنی بعد از تحویله؛ برای هر سوال یا مشکل فنی مستقیم با تیم در ارتباط هستید.",
  },
  {
    q: "تفاوت طراحی سایت شرکتی با ساخت سایت شخصی چیست؟",
    a: "سایت شرکتی معمولاً چند نفر تیم، خدمات متنوع و ساختار سازمانی رو نشون می‌ده؛ سایت شخصی روی معرفی یه فرد و تخصص اون متمرکزه و معمولاً ساده‌تره.",
  },
  {
    q: "آیا سئو هم همراه طراحی سایت شرکتی انجام می‌شود؟",
    a: "بله، ساختار فنی از ابتدا برای سئو بهینه‌ست؛ خدمات سئو اختصاصی هم برای رشد بلندمدت رتبه ارائه می‌دیم.",
  },
  {
    q: "آیا می‌توانم بعداً بخش فروشگاهی هم به سایت اضافه کنم؟",
    a: "بله، در صورت نیاز می‌شه یه بخش فروشگاهی جداگانه به سایت شرکتی اضافه کرد یا یه فروشگاه مستقل طراحی کرد.",
  },
  {
    q: "آیا برای شرکت‌های خارج از تهران هم خدمات می‌دهید؟",
    a: "بله، تیم ما در تهران، ری و سراسر کشور فعاله؛ چون فرایند به‌صورت آنلاین انجام می‌شه، فرقی نمی‌کنه دفتر شرکت کجای ایران باشه.",
  },
  {
    q: "آیا برای افراد مستقل و فریلنسرها هم طراحی سایت انجام می‌دهید؟",
    a: "بله، برای ساخت سایت شخصی افراد مستقل مثل مشاوران و طراحان، نسخه‌ی کوچیک‌تر و اقتصادی‌تری از همین خدمات ارائه می‌دیم.",
  },
  {
    q: "هزینه‌ی طراحی سایت شرکتی چگونه محاسبه می‌شود؟",
    a: "قیمت بر اساس تعداد صفحات، نیاز به چندزبانه بودن و پیچیدگی طراحی محاسبه می‌شه؛ بعد از مشاوره‌ی رایگان یه پیشنهاد قیمت دقیق دریافت می‌کنید.",
  },
  {
    q: "آیا محتوای متنی صفحات را هم برای ما می‌نویسید؟",
    a: "در فرایند طراحی سایت شرکتی راهنمایی لازم برای ساختار و نوشتن محتوای هر صفحه رو ارائه می‌دیم؛ در صورت نیاز به خدمات تولید محتوای کامل هم می‌تونیم هماهنگ کنیم.",
  },
  {
    q: "چطور سفارش طراحی سایت شرکتی را ثبت کنم؟",
    a: "کافیه پلن مناسب رو از صفحه‌ی ثبت سفارش انتخاب کنید یا از طریق فرم تماس با تیم ما هماهنگ کنید.",
  },
];

/* ---------------------------------------------------------------------- */

export default async function CorporateDesignPage() {
  const isLoggedIn = !!(await getCurrentUser());

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        serviceType: "طراحی سایت شرکتی",
        name: "طراحی سایت شرکتی حرفه‌ای",
        description:
          "طراحی سایت شرکتی با وردپرس یا کدنویسی اختصاصی برای معرفی رسمی خدمات، تیم و نمونه‌کار شرکت.",
        provider: { "@type": "Organization", name: "وب پیکاسو", url: siteUrl },
        areaServed: "IR",
        url: `${siteUrl}${pageUrl}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "خانه", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "طراحی سایت", item: `${siteUrl}${landingHref("websiteDesign")}` },
          { "@type": "ListItem", position: 3, name: "طراحی سایت شرکتی", item: `${siteUrl}${pageUrl}` },
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
        eyebrow="Corporate Website Design"
        title="طراحی سایت شرکتی حرفه‌ای"
        desc="برای شرکت‌ها و مجموعه‌هایی که می‌خوان خدمات، تیم و اعتبار خودشون رو به شکل رسمی و قابل‌اعتماد معرفی کنن، طراحی سایت شرکتی اولین قدم جدیه — با ساختار سازمان‌یافته و سئوی درست، چه با وردپرس، چه با کدنویسی کاملاً اختصاصی."
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
              طراحی سایت شرکتی چیست و چرا شرکت شما به آن نیاز دارد؟
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Reveal className="rounded-card border border-ink/10 bg-surface/50 p-6 text-[14.5px] leading-[2] text-dim lg:col-span-1">
              طراحی سایت شرکتی فرایند ساخت یه وب‌سایت رسمیه که خدمات، تیم، نمونه‌کارها و راه‌های
              ارتباطی یه شرکت رو معرفی می‌کنه. برخلاف{" "}
              <Link href={landingHref("storeDesign")} className="text-accent underline underline-offset-2">
                طراحی سایت فروشگاهی
              </Link>{" "}
              که هدفش فروش مستقیم محصوله، هدف اصلی سایت شرکتی، ساختن اعتبار، معرفی تخصص و تبدیل
              بازدیدکننده به مشتری بالقوه یا شریک تجاریه؛ یعنی موفقیتش با تعداد سرنخ و تماس ورودی
              سنجیده می‌شه، نه صرفاً فروش مستقیم.
            </Reveal>
            <Reveal delay={80} className="rounded-card border border-ink/10 bg-surface/50 p-6 text-[14.5px] leading-[2] text-dim lg:col-span-1">
              وقتی یه شریک تجاری یا مشتری احتمالی اسم شرکت شما رو می‌شنوه، اولین کاری که می‌کنه سرچ
              کردن اسمتونه؛ اگه سایت شرکتی‌تون قدیمی، نامرتب یا اصلاً وجود نداشته باشه، این اولین
              برخورد به ضرر اعتبار شرکت تموم می‌شه. خیلی از شرکت‌ها فکر می‌کنن یه صفحه در شبکه‌های
              اجتماعی یا یه کاتالوگ پی‌دی‌اف کافیه، اما این‌ها جایگزین یه سایت رسمی و همیشه در
              دسترس نمی‌شن.
            </Reveal>
            <Reveal delay={160} className="rounded-card border border-ink/10 bg-surface/50 p-6 text-[14.5px] leading-[2] text-dim lg:col-span-1">
              یه طراحی سایت شرکتی اصولی، ساختار مشخصی داره: صفحه‌ی اصلی که پیام برند رو منتقل می‌کنه،
              درباره‌ی ما که تاریخچه و ارزش‌ها رو نشون می‌ده، خدمات که دقیقاً توضیح می‌ده چیکار
              می‌کنید، نمونه‌کارها که اعتبارتون رو ثابت می‌کنن، و فرم تماس که مسیر همکاری رو باز
              می‌کنه. همین ساختار منظم باعث می‌شه بازدیدکننده سریع بفهمه شرکت شما دقیقاً چیکار
              می‌کنه.
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
                چرا طراحی سایت شرکتی حرفه‌ای برای رشد کسب‌وکار ضروری است
              </h2>
              <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
                شش دلیلی که نشون می‌ده یه سایت شرکتی حرفه‌ای، پایه‌ی اعتبار و رشد شرکت شماست.
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
              امکانات یک سایت شرکتی حرفه‌ای
            </h2>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              شش بخش پایه‌ای که هر طراحی سایت شرکتی حرفه‌ای باید داشته باشه.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {corpFeatures.map((f, i) => (
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
              طراحی سایت شرکتی با وردپرس یا اختصاصی؛ کدام مناسب شماست؟
            </h2>
            <p className="text-[14.5px] leading-[2] text-dim">
              برای بیشتر شرکت‌های کوچک و متوسط، طراحی سایت شرکتی با{" "}
              <Link href={landingHref("wordpressDesign")} className="text-accent underline underline-offset-2">
                وردپرس
              </Link>{" "}
              گزینه‌ی مناسبیه؛ راه‌اندازی سریع‌تره، هزینه‌ی مناسب‌تری داره و مدیریت محتوا بعد از
              تحویل هم راحته. اما وقتی شرکت شما نیاز به پنل مدیریت پیچیده، اتصال به سامانه‌های داخلی
              یا عملکردهای خیلی خاص داشته باشه،{" "}
              <Link href={landingHref("customDesign")} className="text-accent underline underline-offset-2">
                طراحی سایت اختصاصی
              </Link>{" "}
              با کدنویسی، انعطاف و کنترل بیشتری می‌ده. وب پیکاسو تو جلسه‌ی مشاوره‌ی رایگان، با توجه
              به اندازه‌ی شرکت و نیازهای فنی‌تون، صادقانه می‌گه کدوم مسیر منطقی‌تره.
            </p>
          </Reveal>
        </div>
      </section>

      {/* قیمت — داده‌ی واقعی */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-10">
            <h2 className="font-display text-[26px] font-normal sm:text-[32px]">
              قیمت طراحی سایت شرکتی چقدر است؟
            </h2>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              هزینه به تعداد صفحات، نیاز به چندزبانه بودن، پیچیدگی طراحی و مسیر انتخابی بستگی داره.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Reveal className="rounded-card border border-ink/10 bg-surface/50 p-6">
              <h3 className="mb-1.5 text-[16px] font-bold text-ink">پلن استارتاپ (وردپرس)</h3>
              <p className="mb-4 text-[13.5px] leading-relaxed text-dim">
                مناسب شرکت‌های کوچک و تازه‌کار؛ صفحات اصلی، درباره‌ی ما، خدمات و تماس با طراحی
                حرفه‌ای.
              </p>
              <p className="mb-4 text-[15px] font-bold text-accent">شروع از ۲۵ میلیون تومان</p>
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
            <Reveal delay={80} className="rounded-card border border-accent/40 bg-surface/50 p-6">
              <h3 className="mb-1.5 text-[16px] font-bold text-ink">پلن کسب‌وکار (وردپرس)</h3>
              <p className="mb-4 text-[13.5px] leading-relaxed text-dim">
                طراحی UI اختصاصی، تا دوازده صفحه، امکان افزودن فروشگاه و سئوی داخلی — مناسب شرکت‌های
                در حال رشد.
              </p>
              <p className="mb-4 text-[15px] font-bold text-accent">شروع از ۳۸ میلیون تومان</p>
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
          </div>
          <p className="mt-6 text-[13px] text-dim">
            برای شرکت‌هایی که نیاز به کدنویسی اختصاصی دارن هم پلن‌های پیشرفته‌تری موجوده. برای دیدن
            جزئیات کامل هر پلن،{" "}
            <Link href={landingHref("websitePrice")} className="text-accent underline underline-offset-2">
              بازه‌ی قیمت طراحی سایت
            </Link>{" "}
            رو ببینید.
          </p>
        </div>
      </section>

      {/* مراحل */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-12">
            <h2 className="font-display text-[28px] font-normal sm:text-[34px] lg:text-[40px]">
              مراحل طراحی سایت شرکتی در وب پیکاسو
            </h2>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              شش مرحله‌ی شفاف، از شناخت برند شما تا تحویل و آموزش مدیریت محتوا.
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
            <h2 className="mb-3 text-[18px] font-bold text-ink">طراحی سایت شرکتی در تهران، ری و سراسر کشور</h2>
            <p className="text-[14px] leading-[2] text-dim">
              تیم وب پیکاسو به شرکت‌ها در تهران، ری، سایر شهرهای استان تهران و سراسر کشور برای
              طراحی سایت شرکتی خدمت می‌ده. چون فرایند مشاوره و طراحی به‌صورت آنلاین انجام می‌شه،
              فرقی نمی‌کنه دفتر مرکزی شرکت شما در تهران باشه، در ری یا هر شهر دیگه‌ای؛ کیفیت و
              سرعت پاسخ‌گویی یکسانه. برای شرکت‌های تهرانی، در صورت نیاز جلسه‌ی حضوری هم قابل
              هماهنگیه.
            </p>
          </Reveal>
          <Reveal delay={60} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">پروژه‌های طراحی سایت شرکتی وب پیکاسو</h2>
            <p className="text-[14px] leading-[2] text-dim">
              هر پروژه‌ی طراحی سایت شرکتی که تحویل می‌دیم، مخصوص همون شرکت طراحی می‌شه؛ از
              شرکت‌های خدماتی و مشاوره‌ای گرفته تا مجموعه‌های فنی و تولیدی. می‌تونید نمونه‌کارهای
              قبلی رو تو بخش{" "}
              <Link href="/portfolio" className="text-accent underline underline-offset-2">
                پرتفولیو
              </Link>{" "}
              ببینید تا با کیفیت طراحی و تنوع صنعت‌هایی که باهاشون کار کردیم آشنا بشید. دیدن یه
              پروژه‌ی طراحی سایت شرکتی واقعی، بهترین راه برای سنجیدن کیفیت کار قبل از سفارشه.
            </p>
          </Reveal>
          <Reveal delay={120} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">تفاوت طراحی سایت شرکتی با طراحی سایت فروشگاهی</h2>
            <p className="text-[14px] leading-[2] text-dim">
              خیلی از کسب‌وکارها هم محصول می‌فروشن هم خدمات ارائه می‌دن، برای همین گاهی نیاز به هر
              دو نوع سایت دارن. طراحی سایت شرکتی روی معرفی، اعتبار و تولید سرنخ فروش تمرکز داره، در
              حالی که{" "}
              <Link href={landingHref("storeDesign")} className="text-accent underline underline-offset-2">
                طراحی سایت فروشگاهی
              </Link>{" "}
              روی فروش مستقیم محصول با سبد خرید و درگاه پرداخت متمرکزه. بعضی مجموعه‌ها یه سایت
              شرکتی برای معرفی برند دارن و یه فروشگاه جداگانه برای فروش محصولات؛ بعضی دیگه هر دو
              بخش رو در یه سایت واحد ترکیب می‌کنن. وب پیکاسو بر اساس مدل کسب‌وکار شما، بهترین
              ساختار رو پیشنهاد می‌ده.
            </p>
          </Reveal>
          <Reveal delay={180} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">ساخت سایت شخصی و پورتفولیوی حرفه‌ای</h2>
            <p className="text-[14px] leading-[2] text-dim">
              علاوه بر شرکت‌ها، خیلی از افراد مستقل مثل مشاوران، طراحان، وکلا و پزشکان هم به یه
              سایت رسمی برای معرفی خودشون نیاز دارن. ساخت سایت شخصی معمولاً ساده‌تر و کوچیک‌تر از
              سایت شرکتیه، اما اصول مشابهی داره: معرفی واضح تخصص، نمایش نمونه‌کار یا سوابق کاری، و
              راه ارتباطی ساده برای مشتری‌های بالقوه. وب پیکاسو برای افراد مستقل و فریلنسرها هم
              نسخه‌ی کوچیک‌تر و اقتصادی‌تری از طراحی سایت شرکتی ارائه می‌ده که دقیقاً همون هدف رو
              با هزینه‌ی کمتر برآورده می‌کنه.
            </p>
          </Reveal>
          <Reveal delay={240} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">اشتباهات رایج در طراحی سایت شرکتی</h2>
            <p className="text-[14px] leading-[2] text-dim">
              رایج‌ترین اشتباه، نداشتن پیام واضح در صفحه‌ی اصلیه؛ بازدیدکننده باید در چند ثانیه
              بفهمه شرکت شما چیکار می‌کنه. اشتباه دوم، صفحه‌ی خدمات مبهم و کلی‌گوست که به مشتری
              کمکی نمی‌کنه تصمیم بگیره. اشتباه سوم، نداشتن نمونه‌کار یا مدرک قابل‌اندازه‌گیری از
              موفقیت‌های قبلیه. و اشتباه چهارم، فرم تماس پیچیده یا پنهون که مشتری بالقوه رو از
              ارتباط منصرف می‌کنه. وب پیکاسو در طراحی سایت شرکتی، دقیقاً روی رفع همین نقاط ضعف
              تمرکز می‌کنه.
            </p>
          </Reveal>
          <Reveal delay={300} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">تکنولوژی‌هایی که در طراحی سایت‌های شرکتی استفاده می‌کنیم</h2>
            <p className="text-[14px] leading-[2] text-dim">
              برای شرکت‌های کوچک و متوسط، معمولاً از وردپرس با قالب اختصاصی و افزونه‌های امن استفاده
              می‌کنیم که هم سریع راه‌اندازی می‌شه و هم مدیریت محتوا رو ساده می‌کنه. برای شرکت‌های
              بزرگ‌تر یا نیازهای خاص، از فریم‌ورک‌های مدرن فرانت‌اند و بک‌اند برای عملکرد بهتر و
              امنیت بالاتر استفاده می‌کنیم. در هر دو مسیر، بهینه‌سازی سرعت و ساختار سئو از همون
              ابتدا در نظر گرفته می‌شه.
            </p>
          </Reveal>
          <Reveal delay={360} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">چرا شرکت‌ها وب پیکاسو را برای طراحی سایت شرکتی انتخاب می‌کنند</h2>
            <p className="text-[14px] leading-[2] text-dim">
              تفاوت اصلی وب پیکاسو، درک واقعی از نیاز یه شرکت برای معرفی حرفه‌ایه، نه فقط
              پیاده‌سازی یه قالب عمومی. قبل از شروع، پیام برند، مخاطب هدف و اهداف تجاری شرکت شما رو
              کامل بررسی می‌کنیم تا سایتی طراحی کنیم که واقعاً به رشد کسب‌وکارتون کمک کنه؛ بیشتر
              درباره‌ی تیم رو در{" "}
              <Link href="/about" className="text-accent underline underline-offset-2">
                صفحه‌ی درباره ما
              </Link>{" "}
              بخونید.
            </p>
          </Reveal>
          <Reveal delay={420} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">چطور نتیجه‌ی سایت شرکتی را بعد از تحویل ارزیابی کنیم</h2>
            <p className="text-[14px] leading-[2] text-dim">
              بعد از تحویل، ببینید آیا یه بازدیدکننده‌ی تازه در چند ثانیه‌ی اول می‌فهمه شرکت شما
              چیکار می‌کنه یا نه؛ آیا مسیر رسیدن به فرم تماس ساده‌ست؛ آیا سایت روی موبایل هم درست
              نمایش داده می‌شه؛ و آیا صفحات محصول و خدمات به‌اندازه‌ی کافی برای سئو بهینه شدن. اگه
              جواب همه‌ی این‌ها مثبته، یعنی طراحی سایت شرکتی‌تون اصولی انجام شده.
            </p>
          </Reveal>
          <Reveal delay={480} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">طراحی سایت شرکتی برای صنایع مختلف</h2>
            <p className="text-[14px] leading-[2] text-dim">
              نیاز هر صنعت با صنعت دیگه فرق داره. یه شرکت مشاوره‌ای بیشتر به معرفی تخصص و سوابق
              پروژه‌ها نیاز داره؛ یه شرکت ساختمانی به گالری تصاویر پروژه‌های اجراشده و نقشه‌ها؛ یه
              شرکت فناوری به معرفی محصول یا نرم‌افزار و مستندات فنی؛ و یه مجموعه‌ی پزشکی یا درمانی
              به معرفی پزشکان، خدمات و امکان رزرو نوبت. وب پیکاسو قبل از شروع هر پروژه‌ی طراحی سایت
              شرکتی، ساختار صفحات رو مطابق همین تفاوت‌های صنعتی می‌چینه، نه یه الگوی یکسان برای
              همه‌ی شرکت‌ها.
            </p>
          </Reveal>
          <Reveal delay={540} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">چگونه محتوای صفحه‌ی خدمات را برای طراحی سایت شرکتی بنویسیم</h2>
            <p className="text-[14px] leading-[2] text-dim">
              محتوای صفحه‌ی خدمات، مهم‌ترین بخش هر طراحی سایت شرکتیه، چون مستقیم روی تصمیم مشتری
              بالقوه تاثیر می‌ذاره. به‌جای توضیحات کلی و تبلیغاتی، بهتره هر خدمت رو با یه مشکل مشخص
              مشتری شروع کنید، بعد راه‌حل شرکتتون رو توضیح بدید و در پایان نتیجه یا مزیت ملموسی که
              مشتری می‌گیره رو بیان کنید. اضافه کردن نمونه‌کار یا آمار واقعی کنار هر خدمت، اعتبار
              متن رو خیلی بیشتر می‌کنه. وب پیکاسو در فرایند طراحی سایت شرکتی، کنار طراحی گرافیکی،
              راهنمایی لازم برای نوشتن این نوع محتوا رو هم به مشتری‌ها می‌ده.
            </p>
          </Reveal>
          <Reveal delay={600} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">دامنه و ایمیل اختصاصی شرکتی</h2>
            <p className="text-[14px] leading-[2] text-dim">
              یه بخش کوچیک اما مهم که خیلی وقت‌ها فراموش می‌شه، داشتن یه دامنه‌ی رسمی و ایمیل
              اختصاصی با همون دامنه‌ست، مثلاً به‌جای یه ایمیل عمومی. یه آدرس ایمیل شرکتی با دامنه‌ی
              خود شرکت، در مکاتبات رسمی و همکاری با شرکای تجاری خیلی حرفه‌ای‌تر به نظر می‌رسه. در
              کنار طراحی سایت شرکتی، وب پیکاسو در انتخاب و پیکربندی دامنه و ایمیل سازمانی هم
              راهنماییتون می‌کنه تا هویت دیجیتال کاملی برای شرکتتون داشته باشید.
            </p>
          </Reveal>
          <Reveal delay={660} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">امنیت و اعتبار فنی سایت شرکتی</h2>
            <p className="text-[14px] leading-[2] text-dim">
              گواهی SSL، هاست پایدار و به‌روزرسانی منظم، هم برای امنیت داده‌های سایت لازمه و هم روی
              اعتبار شرکت شما در نگاه بازدیدکننده و در رتبه‌بندی گوگل تاثیر می‌ذاره؛ مرورگرها سایت
              بدون SSL رو به کاربر به‌عنوان غیرامن نشون می‌دن، که برای یه شرکت رسمی اصلاً تصویر
              خوبی نیست. این موارد جزو استانداردهایی هستن که در هر پروژه رعایت می‌شن.
            </p>
          </Reveal>
          <Reveal delay={720} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">چطور طراحی سایت شرکتی به تیم فروش شما کمک می‌کند</h2>
            <p className="text-[14px] leading-[2] text-dim">
              خیلی وقت‌ها سایت شرکتی رو فقط یه کارت ویزیت دیجیتال می‌بینن، اما اگه درست طراحی بشه،
              می‌تونه مستقیم به کار تیم فروش بیاد. یه لینک به صفحه‌ی خدمات یا نمونه‌کار، به‌جای
              فرستادن یه فایل پی‌دی‌اف، تجربه‌ی خیلی حرفه‌ای‌تری برای مشتری بالقوه می‌سازه. همچنین
              فرم‌های تماس هدفمند برای هر خدمت، باعث می‌شه سرنخ‌های ورودی از همون ابتدا دسته‌بندی
              بشن و تیم فروش سریع‌تر بتونه پیگیری کنه. برای همین طراحی سایت شرکتی رو باید بخشی از
              ابزارهای فروش شرکت دید، نه فقط یه پروژه‌ی معرفی صرف.
            </p>
          </Reveal>
          <Reveal delay={780} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">نقش سایت شرکتی در جذب نیروی متخصص</h2>
            <p className="text-[14px] leading-[2] text-dim">
              خیلی از شرکت‌ها فقط به مشتری‌ها فکر می‌کنن، اما یه سایت خوب برای جذب همکار و نیروی
              متخصص هم مهمه. متخصص‌ها قبل از ارسال رزومه یا شرکت در مصاحبه، معمولاً سایت شرکت رو
              می‌بینن تا فرهنگ سازمانی، تیم و پروژه‌ها رو بشناسن. یه صفحه‌ی ساده‌ی معرفی فرصت‌های
              شغلی یا حتی همون صفحه‌ی درباره‌ی ما و تیم، می‌تونه تصمیم یه متخصص خوب برای پیوستن به
              شرکت شما رو تحت تاثیر قرار بده؛ این یکی از فایده‌های کمتر دیده‌شده‌ی داشتن یه سایت
              شرکتی حرفه‌ایه.
            </p>
          </Reveal>
        </div>
      </section>

      {/* چک‌لیست انتخاب */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-8">
            <h2 className="font-display text-[26px] font-normal sm:text-[32px]">
              چک‌لیست انتخاب تیم طراحی سایت شرکتی
            </h2>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              قبل از سفارش، این چند نکته رو از هر تیمی که در نظر دارید بپرسید.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              "آیا نمونه‌کار واقعی از پروژه‌های شرکتی قبلی‌شون دارن؟",
              "آیا ساختار پیشنهادی صفحات با نیاز واقعی شرکت شما هماهنگه؟",
              "آیا سورس کامل سایت بعد از تحویل به شما داده می‌شه؟",
              "آیا آموزش مدیریت محتوا رو ارائه می‌دن؟",
              "آیا بعد از تحویل، پشتیبانی فنی و رفع باگ دارن؟",
              "آیا سئوی فنی سایت هم بخشی از پروژه‌ست؟",
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
                سوالات متداول درباره‌ی طراحی سایت شرکتی
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
              چرا الان زمان مناسبی برای طراحی سایت شرکتی است
            </h2>
            <p className="max-w-[60ch] text-[14.5px] leading-[2] text-dim">
              هر روزی که شرکت شما بدون یه سایت رسمی و حرفه‌ای فعالیت کنه، فرصت‌های همکاری و اعتماد
              مشتری‌های بالقوه رو از دست می‌ده. طراحی سایت شرکتی حرفه‌ای، چه با{" "}
              <Link href={landingHref("wordpressDesign")} className="text-accent underline underline-offset-2">
                وردپرس
              </Link>{" "}
              چه با{" "}
              <Link href={landingHref("customDesign")} className="text-accent underline underline-offset-2">
                کدنویسی اختصاصی
              </Link>
              ، اعتبار برند شما رو در نگاه اول تثبیت می‌کنه. تیم وب پیکاسو به‌عنوان یه{" "}
              <Link href={landingHref("designCompany")} className="text-accent underline underline-offset-2">
                شرکت طراحی سایت
              </Link>{" "}
              با تجربه، آماده‌ست پروژه‌ی شما رو از مشاوره تا تحویل همراهی کنه. برای آشنایی با
              پایه‌های{" "}
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
            <h2 className="font-display text-[22px] font-normal sm:text-[26px]">خدمات مرتبط با طراحی سایت شرکتی</h2>
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
            <Link href={landingHref("designCompany")} className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-surface px-4 py-2 text-[13.5px] font-semibold text-dim transition hover:border-accent hover:text-accent">
              شرکت طراحی سایت
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
