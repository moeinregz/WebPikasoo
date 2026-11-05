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
const pageUrl = "/seo-services";

export const metadata = {
  title: "خدمات سئو حرفه‌ای | پکیج و قیمت | وب پیکاسو",
  description:
    "خدمات سئو سایت فروشگاهی، شرکتی و وردپرسی — تحقیق کلمات کلیدی، سئوی داخلی و تکنیکال، تولید محتوا و لینک‌سازی. پکیج و قیمت شفاف، در تهران، مشهد و سراسر کشور.",
  alternates: { canonical: pageUrl },
  openGraph: {
    url: pageUrl,
    title: "خدمات سئو حرفه‌ای | پکیج و قیمت | وب پیکاسو",
    description:
      "خدمات سئو سایت فروشگاهی، شرکتی و وردپرسی — تحقیق کلمات کلیدی، سئوی داخلی و تکنیکال، تولید محتوا و لینک‌سازی.",
  },
};

/* ---------------------------------------------------------------------- */
/* داده‌ی واقعی پکیج‌های سئو — از همان پلن‌های صفحه‌ی ثبت سفارش               */
/* ---------------------------------------------------------------------- */

type Plan = { name: string; price: string; features: string[]; highlight?: boolean };

const plans: Plan[] = [
  {
    name: "پایه",
    price: "از ۱۵ میلیون تومان / ماه",
    features: [
      "تحقیق و انتخاب کلمات کلیدی",
      "سئوی داخلی صفحات اصلی سایت",
      "بهینه‌سازی پایه‌ی سرعت و ساختار",
      "گزارش ماهانه‌ی وضعیت رتبه",
    ],
  },
  {
    name: "حرفه‌ای",
    price: "از ۳۲ میلیون تومان / ماه",
    features: [
      "سئوی داخلی کامل تمام صفحات",
      "تولید محتوای بهینه (۴ مقاله در ماه)",
      "لینک‌سازی داخلی و خارجی پایه",
      "بهینه‌سازی تکنیکال و سرعت",
      "گزارش تحلیلی ماهانه + مشاوره",
    ],
    highlight: true,
  },
  {
    name: "رقابتی / سازمانی",
    price: "قیمت توافقی",
    features: [
      "استراتژی سئوی رقابتی اختصاصی",
      "لینک‌سازی خارجی حرفه‌ای",
      "سئوی محلی و بین‌المللی",
      "بهینه‌سازی مستمر فنی سایت",
      "تیم اختصاصی و گزارش هفتگی",
    ],
  },
];

type Benefit = { title: string; desc: ReactNode; icon: ReactNode };

const services: Benefit[] = [
  {
    title: "تحقیق و انتخاب کلمات کلیدی",
    desc: "شناسایی کلماتی که مخاطب واقعی شما برای پیدا کردن محصول یا خدمتتون در گوگل جستجو می‌کنه.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m20 20-4.35-4.35" />
      </svg>
    ),
  },
  {
    title: "سئوی داخلی (On-Page)",
    desc: "بهینه‌سازی تیتر، توضیحات متا، ساختار تیترها و لینک‌سازی داخلی هر صفحه برای گوگل و کاربر.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M7 9h10M7 13h10M7 17h6" />
      </svg>
    ),
  },
  {
    title: "سئوی تکنیکال",
    desc: "بهبود سرعت بارگذاری، ساختار URL، نقشه‌ی سایت و رفع خطاهای فنی که مانع ایندکس شدن سایتن.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
      </svg>
    ),
  },
  {
    title: "تولید محتوای بهینه",
    desc: "نوشتن مقاله و محتوای صفحات بر اساس کلمات کلیدی هدف، برای جذب ترافیک ارگانیک مستمر.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M9 6 3 12l6 6M15 6l6 6-6 6" />
      </svg>
    ),
  },
  {
    title: "لینک‌سازی داخلی و خارجی",
    desc: "ساختار لینک‌های داخلی بین صفحات سایت و دریافت بک‌لینک از منابع معتبر، برای بالا بردن اعتبار دامنه.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
  {
    title: "گزارش‌گیری و تحلیل",
    desc: "گزارش دوره‌ای از رتبه، ترافیک و رفتار کاربر، تا پیشرفت واقعی رو با عدد و رقم ببینید، نه حدس و گمان.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M4 19V5M4 19h16" />
        <path d="M8 15l3.5-4 3 3L19 8" />
      </svg>
    ),
  },
];

type Step = { n: string; title: string; desc: string };

const steps: Step[] = [
  { n: "۰۱", title: "ممیزی اولیه‌ی سایت", desc: "بررسی وضعیت فعلی سئوی سایت، سرعت، ساختار و رقبا در نتایج گوگل." },
  { n: "۰۲", title: "تحقیق کلمات کلیدی", desc: "شناسایی کلماتی که بیشترین پتانسیل جذب مشتری واقعی رو دارن." },
  { n: "۰۳", title: "بهینه‌سازی داخلی و تکنیکال", desc: "اصلاح ساختار صفحات، سرعت و مسائل فنی موثر بر ایندکس شدن." },
  { n: "۰۴", title: "تولید محتوا", desc: "نوشتن مقالات و صفحات جدید بر اساس کلمات کلیدی هدف‌گذاری‌شده." },
  { n: "۰۵", title: "لینک‌سازی", desc: "ساخت لینک داخلی منسجم و دریافت بک‌لینک از منابع معتبر." },
  { n: "۰۶", title: "گزارش و بهینه‌سازی مستمر", desc: "پایش ماهانه‌ی نتایج و اصلاح استراتژی بر اساس داده‌ی واقعی." },
];

const faqs: { q: string; a: string }[] = [
  {
    q: "سئو چیست؟",
    a: "سئو (بهینه‌سازی برای موتورهای جستجو) مجموعه‌ای از تکنیک‌های فنی و محتوایی است که رتبه‌ی سایت شما را در نتایج جستجوی گوگل بالا می‌برد، تا بدون پرداخت مستقیم به گوگل برای هر کلیک، ترافیک ارگانیک و رایگان جذب کنید.",
  },
  {
    q: "خدمات سئو چیست و شامل چه کارهایی می‌شود؟",
    a: "خدمات سئو شامل تحقیق کلمات کلیدی، بهینه‌سازی داخلی و تکنیکال سایت، تولید محتوای هدفمند، لینک‌سازی و گزارش‌گیری مستمر است؛ همه‌ی این کارها با هدف بالا بردن رتبه‌ی سایت در گوگل انجام می‌شود.",
  },
  {
    q: "هزینه‌ی خدمات سئو چقدر است؟",
    a: "پکیج پایه‌ی خدمات سئو از پانزده میلیون تومان در ماه شروع می‌شود و پکیج حرفه‌ای از سی و دو میلیون تومان در ماه؛ برای کسب‌وکارهای بزرگ و رقابتی، قیمت توافقی و بر اساس حوزه‌ی رقابتی تعیین می‌شود.",
  },
  {
    q: "پکیج خدمات سئو شامل چه مواردی است؟",
    a: "پکیج پایه شامل تحقیق کلمات کلیدی، سئوی داخلی و گزارش ماهانه است؛ پکیج حرفه‌ای علاوه بر این‌ها، تولید محتوا و لینک‌سازی را هم پوشش می‌دهد؛ پکیج رقابتی برای استراتژی‌های پیچیده‌تر و سئوی محلی یا بین‌المللی طراحی شده.",
  },
  {
    q: "خدمات سئو سایت فروشگاهی چه تفاوتی با سایت‌های دیگر دارد؟",
    a: "سئوی سایت فروشگاهی روی صفحات محصول، دسته‌بندی‌ها و تجربه‌ی خرید تمرکز داره، چون هدف نهایی نه فقط بازدید، بلکه فروشه؛ بهینه‌سازی توضیحات محصول و ساختار دسته‌بندی، نقش کلیدی در این نوع سئو داره.",
  },
  {
    q: "خدمات سئو سایت وردپرسی چگونه انجام می‌شود؟",
    a: "روی وردپرس، از افزونه‌های سئوی معتبر برای مدیریت متا تگ‌ها و نقشه‌ی سایت استفاده می‌شود، در کنار بهینه‌سازی دستی سرعت، تصاویر و ساختار محتوا که افزونه‌ها به‌تنهایی نمی‌تونن انجام بدن.",
  },
  {
    q: "چقدر طول می‌کشد نتیجه‌ی خدمات سئو دیده شود؟",
    a: "معمولاً اولین نشانه‌های بهبود رتبه بین دو تا سه ماه دیده می‌شه، اما نتیجه‌ی پایدار و قابل‌اتکا معمولاً شش ماه تا یک سال زمان می‌بره؛ سئو یه فرایند بلندمدته، نه یه راه‌حل فوری.",
  },
  {
    q: "آیا خدمات سئو بدون طراحی سایت هم امکان‌پذیر است؟",
    a: "بله، اگه سایت شما از قبل وجود داره، می‌شه فقط خدمات سئو رو سفارش داد؛ اما اگه ساختار فنی سایت مشکل جدی داشته باشه، ممکنه قبل از سئو، اصلاحات فنی یا حتی بازطراحی جزئی لازم باشه.",
  },
  {
    q: "چطور سفارش سئو سایت را ثبت کنم؟",
    a: "کافیه از صفحه‌ی ثبت سفارش، پلن سئوی مناسب رو انتخاب کنید یا از طریق فرم تماس با تیم ما هماهنگ کنید تا یه ممیزی اولیه‌ی رایگان از سایتتون انجام بشه.",
  },
  {
    q: "آیا برای شهرهایی مثل مشهد هم خدمات سئو ارائه می‌دهید؟",
    a: "بله، چون خدمات سئو کاملاً از راه دور و آنلاین انجام می‌شه، به کسب‌وکارها در تهران، مشهد و سراسر ایران با همون کیفیت خدمت می‌دیم.",
  },
  {
    q: "آیا امکان لغو یا تغییر پکیج سئو در طول همکاری وجود دارد؟",
    a: "بله، بسته به نتیجه‌ی گزارش‌های ماهانه و تغییر نیاز کسب‌وکار، می‌شه پکیج رو ارتقا داد یا تنظیمات رو تغییر داد؛ جزئیات در قرارداد همکاری مشخص می‌شه.",
  },
  {
    q: "چه تفاوتی بین سئو و بازاریابی محتوایی وجود دارد؟",
    a: "بازاریابی محتوایی بخشی از سئوست، اما فقط یه بخشه؛ سئو شامل سئوی تکنیکال، لینک‌سازی و بهینه‌سازی داخلی هم می‌شه، در حالی که بازاریابی محتوایی بیشتر روی تولید و توزیع محتوا تمرکز داره.",
  },
];

/* ---------------------------------------------------------------------- */

export default async function SeoServicesPage() {
  const isLoggedIn = !!(await getCurrentUser());

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        serviceType: "خدمات سئو",
        name: "خدمات سئو حرفه‌ای",
        description: "خدمات سئو سایت فروشگاهی، شرکتی و وردپرسی؛ تحقیق کلمات کلیدی، سئوی داخلی و تکنیکال، تولید محتوا و لینک‌سازی.",
        provider: { "@type": "Organization", name: "وب پیکاسو", url: siteUrl },
        areaServed: "IR",
        url: `${siteUrl}${pageUrl}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "خانه", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "طراحی سایت", item: `${siteUrl}${landingHref("websiteDesign")}` },
          { "@type": "ListItem", position: 3, name: "خدمات سئو", item: `${siteUrl}${pageUrl}` },
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
        eyebrow="SEO Services"
        title="خدمات سئو حرفه‌ای"
        desc="طراحی سایت بدون سئو یعنی مشتری‌های بالقوه شما رو در گوگل پیدا نمی‌کنن. خدمات سئو وب پیکاسو با تحقیق کلمات کلیدی، سئوی داخلی و تکنیکال، تولید محتوا و لینک‌سازی، ترافیک ارگانیک و رتبه‌ی سایت شما رو به‌صورت پایدار رشد می‌ده."
      >
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/order?category=seo"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-[14.5px] font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
          >
            مشاهده پکیج‌ها و ثبت سفارش
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[15px] w-[15px]">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-canvas px-6 py-3 text-[14.5px] font-bold text-ink transition hover:border-accent hover:text-accent"
          >
            ممیزی رایگان سایت
          </Link>
        </div>
      </PageHero>

      {/* چیستی */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-10">
            <h2 className="font-display text-[26px] font-normal sm:text-[32px]">
              سئو چیست و خدمات سئو شامل چه می‌شود؟
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Reveal className="rounded-card border border-ink/10 bg-surface/50 p-6 text-[14.5px] leading-[2] text-dim lg:col-span-1">
              <strong className="text-ink">
                سئو یعنی بهینه‌سازی سایت برای اینکه گوگل اون رو بشناسه، بفهمه و در نتایج جستجوی
                مرتبط بالاتر نشون بده.
              </strong>{" "}
              برخلاف تبلیغات کلیکی که تا وقتی پول پرداخت می‌کنید نتیجه می‌ده، نتیجه‌ی سئو ماندگارتره
              و بعد از رسیدن به رتبه‌ی خوب، ترافیک ارگانیک به‌صورت رایگان ادامه پیدا می‌کنه.
            </Reveal>
            <Reveal delay={80} className="rounded-card border border-ink/10 bg-surface/50 p-6 text-[14.5px] leading-[2] text-dim lg:col-span-1">
              خدمات سئو مجموعه‌ای از اقدامات فنی و محتواییه که این هدف رو دنبال می‌کنه: از تحقیق
              کلمات کلیدی که مخاطب واقعی جستجو می‌کنه، تا اصلاح ساختار فنی سایت، نوشتن محتوای
              مرتبط، و ساخت لینک‌هایی که اعتبار دامنه‌ی شما رو در چشم گوگل بالا می‌برن.
            </Reveal>
            <Reveal delay={160} className="rounded-card border border-ink/10 bg-surface/50 p-6 text-[14.5px] leading-[2] text-dim lg:col-span-1">
              نکته‌ی مهم اینه که سئو یه اقدام یک‌باره نیست؛ گوگل الگوریتمش رو مدام تغییر می‌ده و
              رقبا هم مدام محتوای جدید تولید می‌کنن. برای همین خدمات سئو معمولاً به‌صورت ماهانه و
              مستمر ارائه می‌شه، نه یه پروژه‌ی یک‌بار انجام‌شده.
            </Reveal>
          </div>
        </div>
      </section>

      {/* خدمات ما شامل چه می‌شود */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] bg-dot-grid" />
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-12 flex items-baseline gap-4">
            <span className="flex h-8 items-center rounded-full border border-ink/10 bg-surface px-3.5 font-mono text-sm font-bold text-ink">
              Services
            </span>
            <div>
              <h2 className="font-display text-[28px] font-normal sm:text-[34px] lg:text-[40px]">
                خدمات سئو ما شامل چه مواردی می‌شود
              </h2>
              <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
                شش رکن اصلی هر پروژه‌ی سئوی حرفه‌ای در وب پیکاسو.
              </p>
            </div>
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

      {/* پکیج و قیمت — داده‌ی واقعی */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-10">
            <h2 className="font-display text-[26px] font-normal sm:text-[32px]">
              پکیج و قیمت خدمات سئو
            </h2>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              <strong className="text-ink">هزینه‌ی خدمات سئو ماهانه محاسبه می‌شه، نه یک‌باره،</strong>{" "}
              چون سئو یه فرایند مستمره. سه پکیج زیر برای نیازهای مختلف طراحی شده.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((p, i) => (
              <Reveal
                key={p.name}
                delay={i * 80}
                className={`rounded-card border p-6 ${p.highlight ? "border-accent/40 bg-surface/50" : "border-ink/10 bg-surface/50"}`}
              >
                <h3 className="mb-1.5 text-[16px] font-bold text-ink">{p.name}</h3>
                <p className="mb-4 text-[15px] font-bold text-accent">{p.price}</p>
                <ul className="space-y-1.5 text-[13px] text-dim">
                  {p.features.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
          <p className="mt-6 text-[13px] text-dim">
            برای دیدن جدول کامل تعرفه‌های وب پیکاسو، صفحه‌ی{" "}
            <Link href={landingHref("websitePrice")} className="text-accent underline underline-offset-2">
              قیمت طراحی سایت
            </Link>{" "}
            رو هم ببینید.
          </p>
        </div>
      </section>

      {/* پاسخ‌های تخصصی به هر نوع سایت */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] bg-dot-grid" />
        <div className="relative z-[1] mx-auto max-w-container space-y-6 px-6">
          <Reveal className="mb-4">
            <h2 className="font-display text-[28px] font-normal sm:text-[34px] lg:text-[40px]">
              خدمات سئو به تفکیک نوع سایت
            </h2>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              سئوی هر نوع سایت اولویت‌های متفاوتی داره؛ پاسخ مستقیم برای هر کدوم.
            </p>
          </Reveal>

          <Reveal className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h3 className="mb-2 text-[16.5px] font-bold text-ink">خدمات سئو سایت فروشگاهی</h3>
            <p className="text-[14px] leading-[2] text-dim">
              <strong className="text-ink">
                سئوی سایت فروشگاهی روی بهینه‌سازی صفحات محصول، دسته‌بندی و مسیر خرید تمرکز داره.
              </strong>{" "}
              عنوان و توضیحات هر محصول باید هم برای گوگل و هم برای خریدار واقعی قانع‌کننده باشه؛
              ساختار دسته‌بندی هم باید هم منطقی برای کاربر باشه و هم سئو-فرندلی. برای فروشگاه‌هایی
              که از{" "}
              <Link href={landingHref("storeDesign")} className="text-accent underline underline-offset-2">
                طراحی سایت فروشگاهی
              </Link>{" "}
              وب پیکاسو استفاده می‌کنن، این پایه‌ی سئوی فنی از روز اول رعایت شده.
            </p>
          </Reveal>

          <Reveal delay={60} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h3 className="mb-2 text-[16.5px] font-bold text-ink">خدمات سئو سایت وردپرسی</h3>
            <p className="text-[14px] leading-[2] text-dim">
              <strong className="text-ink">
                سئوی سایت وردپرسی معمولاً با افزونه‌های معتبر سئو شروع می‌شه، اما به همون محدود
                نمی‌مونه.
              </strong>{" "}
              افزونه‌ها متا تگ و نقشه‌ی سایت رو مدیریت می‌کنن، اما بهینه‌سازی سرعت واقعی، فشرده‌سازی
              تصاویر و ساختار محتوا نیاز به بررسی دستی داره. اگه سایتتون رو با{" "}
              <Link href={landingHref("wordpressDesign")} className="text-accent underline underline-offset-2">
                طراحی سایت وردپرس
              </Link>{" "}
              ساختید، خدمات سئو دقیقاً از همون ساختار موجود شروع می‌شه.
            </p>
          </Reveal>

          <Reveal delay={120} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h3 className="mb-2 text-[16.5px] font-bold text-ink">سئو سایت خدماتی و شرکتی</h3>
            <p className="text-[14px] leading-[2] text-dim">
              <strong className="text-ink">
                سئوی سایت‌های خدماتی و شرکتی روی صفحات خدمات، سوالات متداول و محتوای تخصصی تمرکز
                داره.
              </strong>{" "}
              چون هدف نهایی، تولید سرنخ فروش (لید) و تماسه، نه فروش مستقیم، محتوا باید به سوالات
              واقعی مشتری بالقوه قبل از تماس پاسخ بده. این نوع سئو معمولاً برای{" "}
              <Link href={landingHref("corporateDesign")} className="text-accent underline underline-offset-2">
                سایت‌های شرکتی
              </Link>{" "}
              و خدماتی، رشد تدریجی و پایدارتری داره.
            </p>
          </Reveal>

          <Reveal delay={180} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h3 className="mb-2 text-[16.5px] font-bold text-ink">خدمات سئو و طراحی سایت با هم</h3>
            <p className="text-[14px] leading-[2] text-dim">
              <strong className="text-ink">
                بهترین نتیجه وقتی به دست میاد که سئو از همون مرحله‌ی طراحی سایت در نظر گرفته بشه، نه
                بعد از تحویل.
              </strong>{" "}
              ساختار URL، سرعت بارگذاری و چیدمان محتوا، همه روی سئو تاثیر می‌ذارن و تغییرشون بعد از
              راه‌اندازی سخت‌تره. برای همین در هر پروژه‌ی{" "}
              <Link href={landingHref("websiteDesign")} className="text-accent underline underline-offset-2">
                طراحی سایت
              </Link>{" "}
              وب پیکاسو، پایه‌ی سئوی فنی از روز اول رعایت می‌شه و خدمات سئوی مستمر هم می‌تونه در
              کنارش شروع بشه.
            </p>
          </Reveal>
        </div>
      </section>

      {/* خدمات سئو در شهرها */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container space-y-6 px-6">
          <Reveal className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">خدمات سئو در تهران، مشهد و سراسر کشور</h2>
            <p className="text-[14px] leading-[2] text-dim">
              <strong className="text-ink">
                خدمات سئوی وب پیکاسو محدود به یه شهر خاص نیست.
              </strong>{" "}
              چون تحقیق کلمات کلیدی، بهینه‌سازی سایت، تولید محتوا و گزارش‌گیری همه به‌صورت آنلاین
              انجام می‌شه، به کسب‌وکارها در تهران، مشهد و هر شهر دیگه‌ای در ایران، با کیفیت یکسان
              خدمت می‌دیم. برای کسب‌وکارهای محلی، سئوی محلی (Local SEO) هم بخشی از پکیج‌های حرفه‌ای
              و رقابتیه، تا در جستجوهای مرتبط با شهر یا منطقه‌ی خودتون هم بهتر دیده بشید.
            </p>
          </Reveal>
          <Reveal delay={60} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">سئو حرفه‌ای سایت یعنی چه</h2>
            <p className="text-[14px] leading-[2] text-dim">
              <strong className="text-ink">
                سئوی حرفه‌ای یعنی ترکیبی هماهنگ از سئوی فنی، محتوایی و لینک‌سازی، بر پایه‌ی داده‌ی
                واقعی، نه حدس و گمان.
              </strong>{" "}
              خیلی از اقدامات سئوی آماتور فقط به نصب یه افزونه یا نوشتن چند کلمه‌ی کلیدی در متن
              ختم می‌شه؛ سئوی حرفه‌ای شامل تحلیل رقبا، ممیزی فنی دقیق، استراتژی محتوایی بلندمدت و
              پایش مستمر نتایجه. تفاوت این دو رویکرد، معمولاً در عرض چند ماه در رتبه و ترافیک واقعی
              سایت خودش رو نشون می‌ده.
            </p>
          </Reveal>
        </div>
      </section>

      {/* مراحل */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] bg-dot-grid" />
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-12">
            <h2 className="font-display text-[28px] font-normal sm:text-[34px] lg:text-[40px]">
              مراحل خدمات سئو در وب پیکاسو
            </h2>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              شش مرحله‌ی شفاف، از ممیزی اولیه تا بهینه‌سازی مستمر.
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

      {/* شرکت خدمات سئو خوب چه ویژگی‌هایی دارد */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-8">
            <h2 className="font-display text-[26px] font-normal sm:text-[32px]">
              یک شرکت خدمات سئو خوب چه ویژگی‌هایی دارد؟
            </h2>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              قبل از سفارش، این چند نکته رو از هر تیمی که در نظر دارید بپرسید.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              "آیا گزارش شفاف و قابل‌فهم از اقدامات ماهانه ارائه می‌دن؟",
              "آیا وعده‌ی رتبه‌ی یک گوگل در زمان مشخص می‌دن؟ (این خودش هشدار جدیه)",
              "آیا نمونه‌کار واقعی از رشد رتبه یا ترافیک سایت‌های قبلی دارن؟",
              "آیا از روش‌های لینک‌سازی مشکوک یا خرید بک‌لینک انبوه استفاده می‌کنن؟",
              "آیا سئوی تکنیکال و سرعت سایت هم بخشی از کارشونه، نه فقط تولید محتوا؟",
              "آیا استراتژی رو بر اساس کسب‌وکار شما تنظیم می‌کنن یا یه بسته‌ی یکسان برای همه دارن؟",
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

      {/* بلوک‌های محتوایی */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] bg-dot-grid" />
        <div className="relative z-[1] mx-auto max-w-container space-y-6 px-6">
          <Reveal className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">اشتباهات رایج در خدمات سئو که باید از آن‌ها دوری کرد</h2>
            <p className="text-[14px] leading-[2] text-dim">
              رایج‌ترین اشتباه، وعده‌ی رتبه‌ی یک گوگل در یه بازه‌ی زمانی مشخصه؛ هیچ تیم صادقی نمی‌تونه
              رتبه‌ی دقیق در گوگل رو تضمین کنه، چون الگوریتم گوگل کاملاً در اختیار هیچ‌کس نیست.
              اشتباه دوم، خرید بک‌لینک انبوه و کم‌کیفیت که در کوتاه‌مدت شاید اثر داشته باشه اما در
              بلندمدت ممکنه باعث جریمه‌ی گوگل بشه. اشتباه سوم، تمرکز فقط روی تولید محتوا بدون توجه
              به سئوی تکنیکال، که باعث می‌شه محتوای خوب هم به‌درستی ایندکس نشه. و اشتباه چهارم،
              توقف سئو بعد از چند ماه اول به‌خاطر ندیدن نتیجه‌ی فوری، در حالی که سئو ذاتاً یه فرایند
              میان‌مدت تا بلندمدته.
            </p>
          </Reveal>
          <Reveal delay={60} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">سئو در مقابل تبلیغات کلیکی؛ کدام برای کسب‌وکار شما بهتر است</h2>
            <p className="text-[14px] leading-[2] text-dim">
              تبلیغات کلیکی (مثل گوگل ادز) نتیجه‌ی فوری می‌ده، اما تا وقتی پول پرداخت می‌کنید ادامه
              داره؛ به محض قطع بودجه، ترافیک هم قطع می‌شه. سئو برعکس، نتیجه‌ش کندتر میاد اما بعد از
              رسیدن به رتبه‌ی خوب، ترافیک بدون هزینه‌ی مستمر ادامه پیدا می‌کنه. بهترین استراتژی برای
              خیلی از کسب‌وکارها، ترکیب هر دوئه: تبلیغات کلیکی برای نتیجه‌ی کوتاه‌مدت، و خدمات سئو
              برای رشد پایدار و کاهش وابستگی به بودجه‌ی تبلیغاتی در بلندمدت.
            </p>
          </Reveal>
          <Reveal delay={120} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">چطور نتیجه‌ی خدمات سئو را ارزیابی کنیم</h2>
            <p className="text-[14px] leading-[2] text-dim">
              به‌جای نگاه کردن فقط به یه کلمه‌ی کلیدی خاص، چند معیار رو با هم بررسی کنید: روند کلی
              ترافیک ارگانیک در طول زمان، تعداد کلمات کلیدی‌ای که سایتتون براشون رتبه گرفته، نرخ
              تبدیل بازدیدکننده‌های ارگانیک به مشتری، و کیفیت گزارش‌هایی که ماهانه دریافت می‌کنید. اگه
              این روند رو به رشد باشه، حتی اگه یه کلمه‌ی خاص هنوز رتبه‌ی یک نگرفته، یعنی استراتژی
              درست پیش می‌ره.
            </p>
          </Reveal>
          <Reveal delay={180} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">سفارش سئو سایت؛ چطور شروع کنیم</h2>
            <p className="text-[14px] leading-[2] text-dim">
              اولین قدم برای سفارش سئو سایت، یه ممیزی رایگان از وضعیت فعلی سایتتونه؛ در این ممیزی،
              نقاط ضعف فنی، وضعیت کلمات کلیدی فعلی و فرصت‌های رشد بررسی می‌شه. بعد از اون، بر اساس
              نتیجه‌ی ممیزی و بودجه‌تون، پکیج مناسب (پایه، حرفه‌ای یا رقابتی) پیشنهاد داده می‌شه. برای
              شروع، می‌تونید از صفحه‌ی{" "}
              <Link href="/order?category=seo" className="text-accent underline underline-offset-2">
                ثبت سفارش
              </Link>{" "}
              یه پکیج انتخاب کنید یا از طریق فرم تماس هماهنگ کنید.
            </p>
          </Reveal>
          <Reveal delay={240} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">چطور محتوای سئو باید نوشته شود</h2>
            <p className="text-[14px] leading-[2] text-dim">
              محتوای خوب برای سئو، فقط تکرار یه کلمه‌ی کلیدی نیست؛ باید واقعاً به سوال یا نیاز
              خواننده جواب بده. هر مقاله یا صفحه‌ی محصول باید با یه عنوان روشن شروع بشه، ساختار
              منظمی از تیترها داشته باشه، و اطلاعات مفید و دقیقی ارائه بده که خواننده رو راضی نگه
              داره. گوگل هم به‌مرور یاد گرفته محتوای مصنوعی و بی‌کیفیت رو تشخیص بده، برای همین تیم
              محتوای وب پیکاسو محتوا رو برای انسان می‌نویسه و بعد برای سئو بهینه می‌کنه، نه برعکس.
            </p>
          </Reveal>
          <Reveal delay={300} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">سئوی محلی و بین‌المللی چه تفاوتی دارند</h2>
            <p className="text-[14px] leading-[2] text-dim">
              سئوی محلی برای کسب‌وکارهایی مناسبه که مشتریشون در یه شهر یا منطقه‌ی مشخصه؛ مثل یه
              مطب یا رستوران که می‌خواد در جستجوهای «نزدیک من» دیده بشه. سئوی بین‌المللی برای
              کسب‌وکارهایی طراحی می‌شه که مخاطب چند کشور یا چند زبان دارن و نیاز به ساختار چندزبانه
              و استراتژی متفاوت برای هر بازار دارن. هر دو نوع سئو در پکیج‌های حرفه‌ای و رقابتی وب
              پیکاسو قابل ارائه‌ست، بسته به اینکه هدف کسب‌وکار شما کدومه.
            </p>
          </Reveal>
          <Reveal delay={360} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">نمونه‌کارهای خدمات سئو وب پیکاسو</h2>
            <p className="text-[14px] leading-[2] text-dim">
              تیم سئوی وب پیکاسو برای کسب‌وکارهای مختلف، از فروشگاه‌های اینترنتی گرفته تا شرکت‌های
              خدماتی، پروژه‌های سئو انجام داده. برای دیدن نمونه‌ی پروژه‌های طراحی سایت که سئوی
              فنیشون همراه با طراحی انجام شده، می‌تونید بخش{" "}
              <Link href="/portfolio" className="text-accent underline underline-offset-2">
                پرتفولیو
              </Link>{" "}
              رو ببینید؛ برای گزارش دقیق رشد رتبه و ترافیک پروژه‌های سئوی مستمر هم می‌تونید در
              جلسه‌ی مشاوره‌ی رایگان درخواست نمونه بدید.
            </p>
          </Reveal>
          <Reveal delay={420} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">چرا کسب‌وکارها وب پیکاسو را برای خدمات سئو انتخاب می‌کنند</h2>
            <p className="text-[14px] leading-[2] text-dim">
              تفاوت اصلی وب پیکاسو در خدمات سئو، ترکیب هم‌زمان دانش فنی طراحی سایت و تخصص سئوی
              محتواییه. خیلی از تیم‌های سئو فقط محتوا می‌نویسن و از مشکلات فنی سایت بی‌خبرن؛ خیلی از
              تیم‌های فنی هم فقط کدنویسی بلدن و از استراتژی محتوایی سر در نمیارن. وب پیکاسو چون
              همزمان طراحی سایت و سئو رو انجام می‌ده، می‌تونه مشکلات فنی رو مستقیماً در کد سایت رفع
              کنه، نه فقط توصیه‌ش کنه به یه تیم فنی جدا که ممکنه اصلاً اجرا نکنه.
            </p>
          </Reveal>
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
                سوالات متداول درباره‌ی خدمات سئو
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
              رشد ارگانیک سایت خود را همین امروز شروع کنید
            </h2>
            <p className="max-w-[60ch] text-[14.5px] leading-[2] text-dim">
              چه سایتتون{" "}
              <Link href={landingHref("storeDesign")} className="text-accent underline underline-offset-2">
                فروشگاهی
              </Link>{" "}
              باشه، چه{" "}
              <Link href={landingHref("corporateDesign")} className="text-accent underline underline-offset-2">
                شرکتی
              </Link>
              ، چه با{" "}
              <Link href={landingHref("wordpressDesign")} className="text-accent underline underline-offset-2">
                وردپرس
              </Link>{" "}
              ساخته شده یا{" "}
              <Link href={landingHref("customDesign")} className="text-accent underline underline-offset-2">
                کدنویسی اختصاصی
              </Link>
              ، خدمات سئو وب پیکاسو رو می‌تونید بر اساس نیاز واقعی کسب‌وکارتون شروع کنید. برای دیدن
              خدمات کامل، صفحه‌ی{" "}
              <Link href={landingHref("designCompany")} className="text-accent underline underline-offset-2">
                شرکت طراحی سایت
              </Link>{" "}
              وب پیکاسو رو هم ببینید.
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/order?category=seo"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-[14.5px] font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
              >
                مشاهده‌ی پکیج‌ها و ثبت سفارش
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[15px] w-[15px]">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-canvas px-6 py-3 text-[14.5px] font-bold text-ink transition hover:border-accent hover:text-accent"
              >
                ممیزی رایگان سایت
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* خدمات مرتبط */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-8">
            <h2 className="font-display text-[22px] font-normal sm:text-[26px]">خدمات مرتبط با سئو</h2>
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
            <Link href={landingHref("wordpressDesign")} className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-surface px-4 py-2 text-[13.5px] font-semibold text-dim transition hover:border-accent hover:text-accent">
              طراحی سایت وردپرس
            </Link>
            <Link href={landingHref("designCompany")} className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-surface px-4 py-2 text-[13.5px] font-semibold text-dim transition hover:border-accent hover:text-accent">
              شرکت طراحی سایت
            </Link>
          </div>
        </div>
      </section>

      <Contact />
      <Footer />
    </>
  );
}
