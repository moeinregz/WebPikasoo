import type { ReactNode } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import Contact from "@/components/Contact";
import { getCurrentUser } from "@/lib/session";
import { landingPages, landingHref } from "@/lib/landingPages";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://webpikaso.ir";
const pageUrl = "/website-design";

export const metadata = {
  title: "طراحی سایت حرفه‌ای | شرکت طراحی سایت وب پیکاسو",
  description:
    "طراحی سایت اختصاصی، فروشگاهی، شرکتی و وردپرس با قیمت شفاف، سئوی آماده از روز اول و پشتیبانی بعد از تحویل — مشاوره‌ی رایگان با تیم وب پیکاسو.",
  alternates: { canonical: pageUrl },
  openGraph: {
    url: pageUrl,
    title: "طراحی سایت حرفه‌ای | شرکت طراحی سایت وب پیکاسو",
    description:
      "طراحی سایت اختصاصی، فروشگاهی، شرکتی و وردپرس با قیمت شفاف، سئوی آماده از روز اول و پشتیبانی بعد از تحویل.",
  },
};

/* ---------------------------------------------------------------------- */
/* داده‌ها                                                                  */
/* ---------------------------------------------------------------------- */

type Benefit = { title: string; desc: ReactNode; icon: ReactNode };

const whyItMatters: Benefit[] = [
  {
    title: "اعتبار و اعتمادسازی",
    desc: "یه طراحی مرتب و حرفه‌ای در چند ثانیه‌ی اول به بازدیدکننده می‌گه این کسب‌وکار واقعیه و می‌شه بهش اعتماد کرد؛ همین چند ثانیه‌ی اول تصمیم می‌گیره که کاربر بمونه یا سراغ رقیب بره.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M12 3 4.5 6.5v5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5v-5L12 3Z" />
        <path d="m8.5 12.3 2.4 2.4 4.6-4.9" />
      </svg>
    ),
  },
  {
    title: "دسترسی ۲۴ ساعته",
    desc: "برخلاف دفتر یا مغازه‌ی فیزیکی، سایت شما شبانه‌روز و بدون تعطیلی در دسترس مشتری‌هاست؛ حتی نیمه‌شب هم کسی می‌تونه محصولات یا خدماتتون رو ببینه و سفارش بده.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
      </svg>
    ),
  },
  {
    title: "بازار بزرگ‌تر",
    desc: "با یه سایت خوب دیگه محدود به مشتری‌های محلی نیستید و می‌تونید به کل کشور یا حتی خارج از مرزها خدمت بدید و مخاطب جدید جذب کنید.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z" />
      </svg>
    ),
  },
  {
    title: "هزینه‌ی تبلیغات پایین‌تر",
    desc: "سایتی که سئوی درست داشته باشه، به مرور بدون نیاز به تبلیغ مداوم، ترافیک ارگانیک جذب می‌کنه و وابستگی به تبلیغات پولی رو کم می‌کنه.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
      </svg>
    ),
  },
  {
    title: "تحلیل رفتار مشتری",
    desc: "با ابزارهای تحلیلی روی سایت، دقیقاً می‌فهمید مشتری‌ها دنبال چی می‌گردن، از کدوم صفحه وارد می‌شن و کجای مسیر خرید رو رها می‌کنن.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M4 19V5M4 19h16" />
        <path d="M8 15l3.5-4 3 3L19 8" />
      </svg>
    ),
  },
  {
    title: "مقیاس‌پذیری",
    desc: "یه سایت اصولی طوری ساخته می‌شه که با رشد کسب‌وکار، بشه بهش امکانات جدید اضافه کرد، بدون اینکه لازم باشه همه‌چیز از صفر دوباره ساخته بشه.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
];

type TypeCard = { key: keyof typeof landingPages; title: string; desc: string };

const typeCards: TypeCard[] = [
  {
    key: "storeDesign",
    title: "طراحی سایت فروشگاهی",
    desc: "اگه محصول فیزیکی یا دیجیتال می‌فروشید، این مسیر با درگاه پرداخت امن، مدیریت موجودی، سبد خرید حرفه‌ای و پنل گزارش فروش، بستر فروش آنلاینتون رو می‌سازه؛ مناسب برندهایی که می‌خوان مستقل از مارکت‌پلیس‌ها فروشگاه خودشون رو داشته باشن.",
  },
  {
    key: "corporateDesign",
    title: "طراحی سایت شرکتی",
    desc: "برای شرکت‌ها و مجموعه‌هایی که می‌خوان خدمات، تیم و نمونه‌کارهاشون رو به شکل رسمی و قابل‌اعتماد معرفی کنن؛ معمولاً شامل صفحه‌ی درباره‌ی ما، خدمات، نمونه‌کار و فرم تماسه.",
  },
  {
    key: "customDesign",
    title: "طراحی سایت اختصاصی",
    desc: "وقتی نیازتون خاص و منحصربه‌فرده و قالب‌های آماده جوابگو نیستن، این مسیر از صفر و دقیقاً مطابق فرایند کاری خودتون کدنویسی می‌شه؛ از پنل مدیریت سفارشی تا اتصال به سامانه‌های داخلی کسب‌وکارتون.",
  },
  {
    key: "wordpressDesign",
    title: "طراحی سایت وردپرس",
    desc: "اگه می‌خواید بعداً خودتون محتوا و صفحات رو راحت مدیریت کنید، این گزینه یه پنل مدیریت آشنا و هزاران افزونه‌ی کاربردی در اختیارتون می‌ذاره؛ گزینه‌ای اقتصادی و سریع برای راه‌اندازی.",
  },
  {
    key: "websitePrice",
    title: "قیمت طراحی سایت",
    desc: "بسته به نوع پروژه، تعداد صفحات و امکانات موردنیاز، هزینه‌ی این کار متفاوته؛ می‌تونید پلن‌ها و بازه‌ی قیمت رو از قبل ببینید و بر اساس بودجه‌تون تصمیم بگیرید.",
  },
  {
    key: "designCompany",
    title: "شرکت طراحی سایت",
    desc: "وب پیکاسو همه‌ی این مسیرها رو زیر یه سقف و با یه تیم واحد از ابتدا تا پشتیبانی بعد از تحویل انجام می‌ده؛ یعنی لازم نیست بین چند تیم مختلف هماهنگ کنید.",
  },
];

type Step = { n: string; title: string; desc: string };

const steps: Step[] = [
  { n: "۰۱", title: "مشاوره و بررسی نیاز", desc: "اول از همه یه جلسه‌ی کوتاه و رایگان داریم تا دقیقاً بفهمیم کسب‌وکارتون به چه نوع سایتی نیاز داره و چه هدفی رو دنبال می‌کنه." },
  { n: "۰۲", title: "تحلیل و پیشنهاد فنی", desc: "بعد از شناخت نیاز، یه پیشنهاد مکتوب شامل ساختار صفحات، تکنولوژی موردنیاز و بازه‌ی قیمت آماده می‌کنیم تا از همون ابتدا همه‌چیز شفاف باشه." },
  { n: "۰۳", title: "طراحی رابط کاربری", desc: "تیم طراحی، ظاهر و چیدمان صفحات رو متناسب با برند شما آماده می‌کنه و قبل از شروع کدنویسی، تاییدتون رو می‌گیره." },
  { n: "۰۴", title: "توسعه و پیاده‌سازی", desc: "بعد از تایید طراحی، مرحله‌ی فنی ساخت سایت شروع می‌شه؛ کدنویسی تمیز، بهینه برای سرعت و آماده برای سئو، همراه با گزارش پیشرفت هفتگی." },
  { n: "۰۵", title: "تست کامل و بهینه‌سازی", desc: "قبل از تحویل، سایت روی مرورگرها و دستگاه‌های مختلف تست می‌شه تا هیچ باگی باقی نمونه و تجربه‌ی کاربر یکسان باشه." },
  { n: "۰۶", title: "تحویل و پشتیبانی", desc: "بعد از تحویل نهایی هم کنارتون هستیم و طبق گارانتی هر باگ فنی رو رفع می‌کنیم؛ همکاری با تحویل پروژه تموم نمی‌شه." },
];

const buildFeatures: Benefit[] = [
  {
    title: "طراحی کاملاً اختصاصی",
    desc: "هیچ پروژه‌ای رو کپی از قالب آماده نمی‌سازیم؛ هر سایتی که تحویل می‌دیم متناسب با هویت بصری برند شما شکل می‌گیره و شبیه هیچ رقیبی نیست.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M9 6 3 12l6 6M15 6l6 6-6 6" />
      </svg>
    ),
  },
  {
    title: "سرعت بارگذاری بالا",
    desc: "کدنویسی بهینه و تصاویر فشرده‌شده باعث می‌شه سایت شما سریع باز بشه و کاربر رو از دست ندید؛ چون چند ثانیه تاخیر می‌تونه یعنی از دست دادن یه مشتری.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
      </svg>
    ),
  },
  {
    title: "سئوی آماده از روز اول",
    desc: (
      <>
        ساختار هر سایتی که می‌سازیم از نظر فنی برای گوگل بهینه‌ست، نه یه فکر بعدی که آخر کار بهش
        رسیدگی بشه؛ در کنارش{" "}
        <Link href={landingHref("seoServices")} className="text-accent underline underline-offset-2">
          خدمات سئو
        </Link>{" "}
        اختصاصی هم برای رشد بلندمدت رتبه‌تون در گوگل ارائه می‌دیم.
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
    title: "ریسپانسیو کامل",
    desc: "از موبایل و تبلت تا مانیتورهای بزرگ، سایت شما در همه‌ی دستگاه‌ها درست و کامل نمایش داده می‌شه، چون بخش زیادی از بازدیدکننده‌ها از موبایل وارد می‌شن.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <rect x="2" y="4" width="20" height="13" rx="2" />
        <path d="M8 21h8M9 17v4M15 17v4" />
      </svg>
    ),
  },
  {
    title: "پنل مدیریت ساده",
    desc: "محتوا، تصاویر و بخش‌های سایت رو خودتون بدون نیاز به دانش فنی مدیریت می‌کنید و برای هر تغییر کوچیک لازم نیست به ما مراجعه کنید.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    title: "امنیت و پشتیبانی",
    desc: "هاست امن، گواهی SSL و پشتیبانی فنی بعد از تحویل، جزو استاندارد هر پروژه‌ای هست که وب پیکاسو تحویل می‌ده؛ یعنی بعد از تحویل تنها نمی‌مونید.",
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

const faqs: { q: string; a: string }[] = [
  {
    q: "طراحی سایت معمولاً چقدر طول می‌کشد؟",
    a: "بسته به پیچیدگی پروژه، یه سایت شرکتی ساده حدود دو تا سه هفته و یه پروژه‌ی فروشگاهی یا اختصاصی پیچیده‌تر ممکنه چند هفته تا چند ماه زمان ببره. زمان دقیق بعد از بررسی نیازتون در پیشنهاد فنی مشخص می‌شه و از همون ابتدا به‌صورت مکتوب بهتون اعلام می‌شه.",
  },
  {
    q: "آیا بعد از تحویل هم پشتیبانی داریم؟",
    a: "بله، هر پروژه‌ی وب پیکاسو شامل گارانتی رفع باگ و پشتیبانی فنی بعد از تحویله؛ برای هر مشکل فنی مستقیم با تیم در ارتباط هستید و لازم نیست منتظر یه واسطه بمونید.",
  },
  {
    q: "آیا می‌توانم خودم محتوای سایت را مدیریت کنم؟",
    a: "بله، در پروژه‌های وردپرس و همچنین بیشتر پروژه‌های اختصاصی، یه پنل مدیریت ساده در اختیارتون می‌ذاریم تا بدون دانش فنی محتوا و تصاویر رو خودتون به‌روزرسانی کنید.",
  },
  {
    q: "تفاوت طراحی سایت با سایت ساز چیست؟",
    a: "سایت‌سازها قالب‌های محدود و از پیش آماده دارن که سفارشی‌سازی عمیق توشون سخته؛ طراحی سایت اصولی ساختاری کاملاً متناسب با برند شما می‌سازه و از نظر سئو و سرعت هم معمولاً عملکرد بهتری داره.",
  },
  {
    q: "آیا سایت طراحی‌شده برای گوشی موبایل هم مناسب است؟",
    a: "بله، تمام پروژه‌های وب پیکاسو کاملاً ریسپانسیو هستن و روی موبایل، تبلت و دسکتاپ به یه اندازه درست نمایش داده می‌شن، بدون نیاز به یه نسخه‌ی جداگانه‌ی موبایل.",
  },
  {
    q: "آیا سئو هم همراه طراحی سایت انجام می‌شود؟",
    a: "بله، ساختار فنی هر سایتی که می‌سازیم از روز اول برای سئو بهینه‌ست؛ در کنارش خدمات سئو اختصاصی هم برای رشد بلندمدت رتبه‌ی سایت در گوگل ارائه می‌دیم.",
  },
  {
    q: "هزینه‌ی طراحی سایت چگونه محاسبه می‌شود؟",
    a: "قیمت طراحی سایت بر اساس تعداد صفحات، نوع پروژه و امکانات فنی موردنیاز محاسبه می‌شه؛ بعد از مشاوره‌ی رایگان یه پیشنهاد قیمت دقیق و شفاف دریافت می‌کنید، بدون هیچ هزینه‌ی پنهانی.",
  },
  {
    q: "آیا می‌توانم دامنه و هاست را از قبل داشته باشم؟",
    a: "بله، اگه از قبل دامنه یا هاست دارید، پروژه روی همون‌ها راه‌اندازی می‌شه؛ اگه هم ندارید، در انتخاب و تهیه‌ی گزینه‌ی مناسب راهنماییتون می‌کنیم تا هزینه‌ی اضافه‌ای پرداخت نکنید.",
  },
  {
    q: "چطور سفارش طراحی سایت را ثبت کنم؟",
    a: "کافیه از صفحه‌ی ثبت سفارش یه پلن مناسب رو انتخاب کنید یا از طریق فرم تماس با تیم ما هماهنگ کنید تا جلسه‌ی مشاوره‌ی رایگان و مراحل کار شروع بشه.",
  },
  {
    q: "چه اطلاعاتی قبل از شروع پروژه باید آماده کنم؟",
    a: "داشتن لوگو، رنگ برند، چند نمونه‌سایت مورد پسند و فهرستی از خدمات یا محصولاتتون کافیه؛ اگه چیزی آماده نیست هم نگران نباشید، در جلسه‌ی مشاوره کمکتون می‌کنیم همه‌ی این‌ها رو مشخص کنیم.",
  },
];

/* ---------------------------------------------------------------------- */

export default async function WebsiteDesignPage() {
  const isLoggedIn = !!(await getCurrentUser());

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        serviceType: "طراحی سایت",
        name: "طراحی سایت حرفه‌ای",
        description:
          "طراحی سایت اختصاصی، فروشگاهی، شرکتی و وردپرس با قیمت شفاف، سئوی آماده از روز اول و پشتیبانی بعد از تحویل.",
        provider: { "@type": "Organization", name: "وب پیکاسو", url: siteUrl },
        areaServed: "IR",
        url: `${siteUrl}${pageUrl}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "خانه", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "طراحی سایت", item: `${siteUrl}${pageUrl}` },
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
        eyebrow="Website Design"
        title="طراحی سایت حرفه‌ای برای کسب‌وکار شما"
        desc="وب پیکاسو با ترکیب طراحی اختصاصی، توسعه‌ی فنی تمیز و سئوی حرفه‌ای، سایتی می‌سازه که هم زیبا به نظر برسه و هم واقعاً برات مشتری و فروش بیاره — از فروشگاه اینترنتی گرفته تا سایت شرکتی و پروژه‌ی اختصاصی."
      >
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/order"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-[14.5px] font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
          >
            مشاهده پلن‌ها و ثبت سفارش طراحی سایت
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

      {/* طراحی سایت چیست */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-10">
            <h2 className="font-display text-[26px] font-normal sm:text-[32px]">
              طراحی سایت چیست و چرا برای کسب‌وکار شما ضروری است؟
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Reveal className="rounded-card border border-ink/10 bg-surface/50 p-6 text-[14.5px] leading-[2] text-dim lg:col-span-1">
              طراحی سایت فرایندیه که در اون یه مجموعه صفحه‌ی وب، شامل ظاهر گرافیکی، ساختار فنی، محتوا و
              تجربه‌ی کاربری، برای معرفی یه کسب‌وکار یا خدمت ساخته می‌شه. یه سایت خوب فقط زیبایی
              نیست؛ ترکیبیه از طراحی بصری جذاب، سرعت بارگذاری بالا، ساختار سئو-فرندلی و مسیر واضح
              برای اینکه بازدیدکننده به مشتری تبدیل بشه. وقتی این کار درست انجام بشه، اولین
              برخورد مخاطب با برند شما حرفه‌ای و قابل‌اعتماد به نظر می‌رسه — و همین اولین تاثیر تصمیم
              می‌گیره که کاربر بمونه یا از سایت خارج بشه و سراغ رقیب بره.
            </Reveal>
            <Reveal delay={80} className="rounded-card border border-ink/10 bg-surface/50 p-6 text-[14.5px] leading-[2] text-dim lg:col-span-1">
              امروزه بدون یه وب‌سایت درست‌وحسابی، خیلی از کسب‌وکارها اصلاً دیده نمی‌شن. مشتری‌های
              بالقوه قبل از خرید یا تماس، معمولاً اول جستجو می‌کنن و چند سایت رو با هم مقایسه می‌کنن.
              اگه کسب‌وکار شما در این مقایسه حرفه‌ای به نظر نرسه، این مشتری‌ها به سراغ رقیبی می‌رن که
              سایتش سریع‌تر، مرتب‌تر و قابل‌اعتمادتره. سرمایه‌گذاری روی طراحی سایت اصولی، هم اعتبار
              برند رو بالا می‌بره، هم مسیر فروش رو کوتاه‌تر می‌کنه و هم یه دارایی دیجیتال بلندمدت
              برای کسب‌وکار می‌سازه.
            </Reveal>
            <Reveal delay={160} className="rounded-card border border-ink/10 bg-surface/50 p-6 text-[14.5px] leading-[2] text-dim lg:col-span-1">
              خیلی از صاحبان کسب‌وکار فکر می‌کنن یه صفحه در شبکه‌های اجتماعی کافیه، اما شبکه‌های
              اجتماعی محدودیت‌های زیادی دارن: الگوریتم تغییر می‌کنه، دسترسی به داده‌ی کاربر محدوده و
              کنترل کامل روی ظاهر دست شما نیست. یه وب‌سایت اختصاصی برخلاف اون کاملاً مال خودتونه؛ نه
              وابسته به الگوریتم پلتفرم دیگه‌ایه و نه در معرض تعلیق یا محدودیت ناگهانی. بیشتر
              کسب‌وکارهای جدی، شبکه‌ی اجتماعی رو مکمل سایت اصلی خودشون می‌دونن، نه جایگزین اون.
            </Reveal>
          </div>
        </div>
      </section>

      {/* چرا طراحی سایت اصولی حیاتیه */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] bg-dot-grid" />
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-12 flex items-baseline gap-4">
            <span className="flex h-8 items-center rounded-full border border-ink/10 bg-surface px-3.5 font-mono text-sm font-bold text-ink">
              Why
            </span>
            <div>
              <h2 className="font-display text-[28px] font-normal sm:text-[34px] lg:text-[40px]">
                چرا طراحی سایت اصولی برای رشد کسب‌وکار حیاتی است
              </h2>
              <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
                شش دلیلی که نشون می‌ده طراحی سایت حرفه‌ای یه هزینه نیست، بلکه یه سرمایه‌گذاری
                بلندمدت برای رشد کسب‌وکار شماست.
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

      {/* انواع طراحی سایت — لینک‌سازی داخلی اصلی */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-12 flex items-baseline gap-4">
            <span className="flex h-8 items-center rounded-full border border-ink/10 bg-surface px-3.5 font-mono text-sm font-bold text-ink">
              Types
            </span>
            <div>
              <h2 className="font-display text-[28px] font-normal sm:text-[34px] lg:text-[40px]">
                چه نوع طراحی سایتی برای کسب‌وکار شما مناسب است؟
              </h2>
              <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
                هر کسب‌وکاری نیاز متفاوتی داره — دقیقاً همونی رو انتخاب کنید که به کارتون میاد و
                برای همه‌ی مسیرها می‌تونید مشاوره‌ی رایگان بگیرید.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {typeCards.map((c, i) => (
              <Reveal key={c.key} delay={i * 60}>
                <Link
                  href={landingHref(c.key)}
                  className="group flex h-full flex-col justify-between gap-4 rounded-card border border-ink/10 bg-surface/50 p-6 transition hover:-translate-y-1 hover:border-accent/40"
                >
                  <div>
                    <h3 className="mb-1.5 text-[15.5px] font-bold text-ink group-hover:text-accent">
                      {c.title}
                    </h3>
                    <p className="text-[13.5px] leading-relaxed text-dim">{c.desc}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-accent">
                    بیشتر بدانید
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M17 12H7M11 8l-4 4 4 4" />
                    </svg>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* مراحل طراحی سایت */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-12">
            <h2 className="font-display text-[28px] font-normal sm:text-[34px] lg:text-[40px]">
              مراحل طراحی سایت در وب پیکاسو
            </h2>
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

      {/* ویژگی‌های سایت‌ها */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] bg-dot-grid" />
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-12">
            <h2 className="font-display text-[28px] font-normal sm:text-[34px] lg:text-[40px]">
              ویژگی‌های سایت‌هایی که برای شما می‌سازیم
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {buildFeatures.map((f, i) => (
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

      {/* اختصاصی یا وردپرس */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mx-auto max-w-[820px] rounded-card border border-ink/10 bg-surface/50 p-7 sm:p-10">
            <h2 className="mb-4 font-display text-[24px] font-normal sm:text-[28px]">
              سایت اختصاصی یا وردپرس؛ کدام مناسب شماست؟
            </h2>
            <p className="text-[14.5px] leading-[2] text-dim">
              یکی از سوال‌های رایج قبل از سفارش اینه که باید از قالب وردپرس استفاده کرد یا مسیر
              اختصاصی گزینه‌ی بهتریه.{" "}
              <Link href={landingHref("wordpressDesign")} className="text-accent underline underline-offset-2">
                طراحی سایت وردپرس
              </Link>{" "}
              برای کسانی مناسبه که می‌خوان با هزینه‌ی مناسب‌تر و سرعت راه‌اندازی بالاتر، خودشون بعداً
              محتوا رو مدیریت کنن. اما اگه نیاز شما شامل عملکردهای خاص یا مقیاس بزرگه،{" "}
              <Link href={landingHref("customDesign")} className="text-accent underline underline-offset-2">
                طراحی سایت اختصاصی
              </Link>{" "}
              انعطاف و کنترل بیشتری می‌ده، چون هر بخش دقیقاً مطابق فرایند کاری شما نوشته می‌شه. تیم
              وب پیکاسو تو جلسه‌ی مشاوره‌ی اولیه، صادقانه می‌گه کدوم مسیر براتون منطقی‌تره.
            </p>
          </Reveal>
        </div>
      </section>

      {/* قیمت */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mx-auto max-w-[820px] rounded-card border border-ink/10 bg-surface/50 p-7 sm:p-10">
            <h2 className="mb-4 font-display text-[24px] font-normal sm:text-[28px]">
              قیمت طراحی سایت چقدر است؟
            </h2>
            <p className="text-[14.5px] leading-[2] text-dim">
              هزینه‌ی طراحی سایت به عوامل مختلفی بستگی داره: تعداد صفحات، نوع پروژه، امکانات موردنیاز
              مثل درگاه پرداخت یا پنل مدیریت پیشرفته، و اینکه از وردپرس استفاده می‌شه یا کدنویسی
              اختصاصی. برای همین یه عدد ثابت برای همه‌ی پروژه‌ها وجود نداره و هر پیشنهاد قیمت باید
              مخصوص همون پروژه باشه. وب پیکاسو چند پلن مشخص داره که می‌تونید{" "}
              <Link href={landingHref("websitePrice")} className="text-accent underline underline-offset-2">
                بازه‌ی قیمت طراحی سایت
              </Link>{" "}
              رو از قبل ببینید و بعد از مشاوره‌ی رایگان، یه پیشنهاد دقیق و مکتوب دریافت کنید — بدون
              هزینه‌ی پنهان و بدون سورپرایز در وسط پروژه. توصیه می‌کنیم قبل از تصمیم‌گیری، چند
              پیشنهاد مختلف رو با هم مقایسه کنید و فقط به عدد پایین‌تر نگاه نکنید؛ کیفیت کدنویسی،
              پشتیبانی بعد از تحویل و تجربه‌ی تیم هم به همون اندازه مهمه.
            </p>
          </Reveal>
        </div>
      </section>

      {/* بازه‌ی قیمت به‌طور خلاصه — داده‌ی واقعی از پلن‌های فعلی */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-10">
            <h2 className="font-display text-[26px] font-normal sm:text-[32px]">
              بازه‌ی قیمت طراحی سایت به‌طور خلاصه
            </h2>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              دو مسیر اصلی برای شروع دارید — وردپرس برای راه‌اندازی سریع و اقتصادی، یا کدنویسی
              اختصاصی برای انعطاف و مقیاس بیشتر. اعداد زیر شروع قیمت هر پلنه؛ قیمت دقیق پروژه‌ی شما
              بعد از مشاوره‌ی رایگان مشخص می‌شه.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Reveal className="rounded-card border border-ink/10 bg-surface/50 p-6">
              <h3 className="mb-1.5 text-[16px] font-bold text-ink">طراحی سایت وردپرسی</h3>
              <p className="mb-4 text-[13.5px] leading-relaxed text-dim">
                از سایت معرفی شرکتی تا فروشگاه کامل ووکامرس — گزینه‌ی اقتصادی برای شروع سریع.
              </p>
              <ul className="space-y-1.5 text-[13px] text-dim">
                <li>استارتاپ: شروع از ۲۵ میلیون تومان</li>
                <li>کسب‌وکار: شروع از ۳۸ میلیون تومان</li>
                <li>فروشگاهی: شروع از ۴۷ میلیون تومان</li>
              </ul>
              <Link
                href="/order?category=wordpress"
                className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-accent"
              >
                جزئیات پلن وردپرس
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M17 12H7M11 8l-4 4 4 4" />
                </svg>
              </Link>
            </Reveal>
            <Reveal delay={80} className="rounded-card border border-ink/10 bg-surface/50 p-6">
              <h3 className="mb-1.5 text-[16px] font-bold text-ink">طراحی سایت اختصاصی (کدنویسی)</h3>
              <p className="mb-4 text-[13.5px] leading-relaxed text-dim">
                بدون قالب آماده، برای سرعت، امنیت و انعطاف بیشتر در پروژه‌های بزرگ‌تر.
              </p>
              <ul className="space-y-1.5 text-[13px] text-dim">
                <li>پایه: شروع از ۵۸ میلیون تومان</li>
                <li>پیشرفته: شروع از ۸۴ میلیون تومان</li>
                <li>اختصاصی / سازمانی: قیمت توافقی</li>
              </ul>
              <Link
                href="/order?category=coding"
                className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-accent"
              >
                جزئیات پلن کدنویسی
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M17 12H7M11 8l-4 4 4 4" />
                </svg>
              </Link>
            </Reveal>
          </div>
          <p className="mt-6 text-[13px] text-dim">
            برای مقایسه‌ی کامل پلن‌ها و امکانات هر کدوم، صفحه‌ی{" "}
            <Link href={landingHref("websitePrice")} className="text-accent underline underline-offset-2">
              قیمت طراحی سایت
            </Link>{" "}
            رو ببینید.
          </p>
        </div>
      </section>

      {/* چک‌لیست انتخاب */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-8">
            <h2 className="font-display text-[26px] font-normal sm:text-[32px]">
              چک‌لیست انتخاب شرکت طراحی سایت مناسب
            </h2>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              قبل از سفارش، این چند نکته رو از هر تیمی که در نظر دارید بپرسید.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              "آیا نمونه‌کار واقعی و قابل بازدید دارن؟",
              "آیا سورس کامل پروژه بعد از تحویل داده می‌شه؟",
              "آیا قیمت و زمان تحویل از قبل مکتوب و شفافه؟",
              "آیا بعد از تحویل، گارانتی رفع باگ ارائه می‌دن؟",
              "آیا مستقیم با تیم سازنده در ارتباط هستید یا از پشت چند واسطه؟",
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
          <p className="mt-6 text-[13.5px] text-dim">
            جواب شفاف به این سوال‌ها معمولاً نشون می‌ده با یه{" "}
            <Link href={landingHref("designCompany")} className="text-accent underline underline-offset-2">
              شرکت طراحی سایت
            </Link>{" "}
            حرفه‌ای طرفید یا نه.
          </p>
        </div>
      </section>

      {/* صنف‌های مختلف + اشتباهات رایج + تکنولوژی + چرا ما */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container space-y-6 px-6">
          <Reveal className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">طراحی سایت برای صنف‌ها و کسب‌وکارهای مختلف</h2>
            <p className="text-[14px] leading-[2] text-dim">
              نیاز هر صنف به طراحی سایت با صنف دیگه فرق داره. یه بوتیک لباس بیشتر به گالری تصویر و
              فروشگاه آنلاین نیاز داره؛ یه مطب یا کلینیک به سیستم نوبت‌دهی آنلاین و صفحه‌ی معرفی
              پزشکان؛ یه رستوران به منوی دیجیتال و امکان سفارش آنلاین؛ و یه شرکت خدماتی یا فنی به
              معرفی دقیق خدمات، نمونه‌کار و فرم درخواست مشاوره. وب پیکاسو قبل از شروع هر پروژه،
              ساختار صفحات رو مطابق همین تفاوت‌ها می‌چینه، نه یه الگوی یکسان برای همه. همین دقت باعث
              می‌شه سایت نهایی دقیقاً همون چیزی باشه که مخاطب اون صنف خاص انتظارش رو داره، نه یه
              قالب عمومی که فقط رنگ و لوگوش عوض شده.
            </p>
          </Reveal>
          <Reveal delay={60} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">اشتباهات رایجی که باید در طراحی سایت از آن‌ها دوری کرد</h2>
            <p className="text-[14px] leading-[2] text-dim">
              خیلی از کسب‌وکارها قبل از آشنایی با وب پیکاسو تجربه‌ی ناموفقی با یه پروژه‌ی قبلی
              داشتن. رایج‌ترین اشتباه، انتخاب تیم فقط بر اساس پایین‌ترین قیمته؛ قیمت خیلی پایین
              معمولاً یعنی کدنویسی سطحی، عدم پشتیبانی بعد از تحویل، یا استفاده از قالب‌های عمومی که
              رقبا هم دارن. اشتباه دوم، نادیده گرفتن سرعت و سئو در مرحله‌ی طراحیه؛ سایتی که فقط از
              نظر ظاهری قشنگه ولی کند بالا میاد، در عمل بازدهی کمی برای کسب‌وکار داره. اشتباه سوم،
              عدم دریافت سورس کامل پروژه بعد از تحویله؛ بعضی تیم‌ها سایت رو روی زیرساخت خودشون نگه
              می‌دارن و مشتری عملاً وابسته به همون تیم می‌مونه. و اشتباه چهارم، نداشتن یه پیشنهاد
              قیمت و زمان‌بندی شفاف از ابتدا، که باعث اختلاف و سردرگمی در وسط پروژه می‌شه. وب پیکاسو
              دقیقاً برای جلوگیری از همین اشتباهات، از روز اول قیمت، زمان‌بندی و تحویل سورس کامل رو
              مکتوب و شفاف اعلام می‌کنه.
            </p>
          </Reveal>
          <Reveal delay={120} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">تکنولوژی‌هایی که در پروژه‌های ما استفاده می‌شود</h2>
            <p className="text-[14px] leading-[2] text-dim">
              بسته به نوع پروژه، از تکنولوژی‌های به‌روز و پایدار استفاده می‌کنیم؛ برای پروژه‌های
              اختصاصی از فریم‌ورک‌های مدرن فرانت‌اند و بک‌اند برای سرعت و امنیت بالاتر بهره می‌بریم،
              و برای پروژه‌هایی که مدیریت آسون محتوا اولویت داره، وردپرس رو با افزونه‌های امن و
              بهینه پیاده‌سازی می‌کنیم. در هر دو مسیر، بهینه‌سازی تصاویر، فشرده‌سازی کد و پیکربندی
              درست هاست جزو استاندارد کارمونه، چون سرعت بارگذاری مستقیم روی تجربه‌ی کاربر و رتبه‌ی
              سئو تاثیر می‌ذاره. همین‌طور از ابزارهای تحلیلی استاندارد استفاده می‌کنیم تا بعد از
              تحویل بتونید رفتار بازدیدکننده‌ها رو دنبال کنید. فهرست کامل مهارت‌های فنی تیم رو
              می‌تونید در{" "}
              <Link href="/skills" className="text-accent underline underline-offset-2">
                صفحه‌ی مهارت‌ها
              </Link>{" "}
              ببینید.
            </p>
          </Reveal>
          <Reveal delay={180} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">چرا کسب‌وکارها وب پیکاسو را برای این کار انتخاب می‌کنند</h2>
            <p className="text-[14px] leading-[2] text-dim">
              تفاوت اصلی وب پیکاسو با خیلی از تیم‌های دیگه، ارتباط مستقیم و بدون واسطه با مشتریه.
              شما در طول پروژه با همون افرادی صحبت می‌کنید که واقعاً روی سایتتون کار می‌کنن، نه یه
              هماهنگ‌کننده که پیام‌ها رو دست به دست بین چند تیم زیرمجموعه رد و بدل می‌کنه. همین
              موضوع باعث می‌شه هم سرعت پاسخ‌گویی بالاتر بره، هم درک نیاز واقعی کسب‌وکار دقیق‌تر
              باشه. علاوه بر این، هر پروژه از همون ابتدا با یه پیشنهاد مکتوب شروع می‌شه که دقیقاً
              مشخص می‌کنه چی ساخته می‌شه، چقدر طول می‌کشه و چقدر هزینه داره؛ بیشتر درباره‌ی تیم رو
              در{" "}
              <Link href="/about" className="text-accent underline underline-offset-2">
                صفحه‌ی درباره ما
              </Link>{" "}
              بخونید.
            </p>
          </Reveal>
          <Reveal delay={240} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">نمونه‌کارهای وب پیکاسو</h2>
            <p className="text-[14px] leading-[2] text-dim">
              تا امروز ده‌ها پروژه در صنف‌ها و حوزه‌های مختلف تحویل دادیم؛ از فروشگاه اینترنتی و
              سایت شرکتی گرفته تا وب‌اپلیکیشن‌های اختصاصی. می‌تونید نمونه‌کارهای قبلی رو تو بخش{" "}
              <Link href="/portfolio" className="text-accent underline underline-offset-2">
                پرتفولیو
              </Link>{" "}
              ببینید تا کیفیت کار و تنوع صنعت‌هایی که باهاشون کار کردیم رو از نزدیک بررسی کنید؛ از
              رستوران و بوتیک گرفته تا شرکت‌های خدماتی و فنی. دیدن نمونه‌کار واقعی قبل از سفارش،
              بهترین راه برای سنجیدن کیفیت واقعی یه تیمه، نه فقط شنیدن حرف‌های تبلیغاتی.
            </p>
          </Reveal>
          <Reveal delay={300} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">چطور نتیجه‌ی کار را بعد از تحویل ارزیابی کنیم</h2>
            <p className="text-[14px] leading-[2] text-dim">
              بعد از تحویل، چند معیار ساده کمکتون می‌کنه بفهمید طراحی سایت‌تون واقعاً اصولی انجام
              شده یا نه. اول، سرعت بارگذاری صفحات رو با یه ابزار رایگان تست کنید؛ اگه صفحه‌ی اصلی
              بیشتر از چند ثانیه طول بکشه، جای نگرانی هست. دوم، نمایش درست سایت روی گوشی موبایل رو
              چک کنید، چون بیشتر بازدیدکننده‌ها امروز از موبایل وارد می‌شن. سوم، ببینید آیا سورس
              کامل پروژه در اختیارتون قرار گرفته یا نه، و چهارم، مطمئن بشید تیم سازنده بعد از تحویل
              هم برای رفع باگ در دسترسه. اگه سایتی که تحویل گرفتید همه‌ی این معیارها رو داشته باشه،
              یعنی سرمایه‌گذاری‌تون روی طراحی سایت درست انجام شده.
            </p>
          </Reveal>
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
                سوالات متداول درباره‌ی طراحی سایت
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
              چرا الان زمان مناسبی برای طراحی سایت است
            </h2>
            <p className="max-w-[60ch] text-[14.5px] leading-[2] text-dim">
              هر روزی که کسب‌وکار شما بدون یه طراحی سایت حرفه‌ای می‌گذره، یعنی مشتری‌هایی که
              می‌تونستن پیدای‌تون کنن، دارن سراغ رقیب می‌رن. چه به دنبال{" "}
              <Link href={landingHref("storeDesign")} className="text-accent underline underline-offset-2">
                طراحی سایت فروشگاهی
              </Link>{" "}
              باشید، چه{" "}
              <Link href={landingHref("corporateDesign")} className="text-accent underline underline-offset-2">
                طراحی سایت شرکتی
              </Link>
              ، چه یه{" "}
              <Link href={landingHref("customDesign")} className="text-accent underline underline-offset-2">
                طراحی سایت اختصاصی
              </Link>{" "}
              با امکانات خاص، یا حتی یه{" "}
              <Link href={landingHref("wordpressDesign")} className="text-accent underline underline-offset-2">
                طراحی سایت وردپرس
              </Link>{" "}
              اقتصادی برای شروع سریع، تیم وب پیکاسو به عنوان یه{" "}
              <Link href={landingHref("designCompany")} className="text-accent underline underline-offset-2">
                شرکت طراحی سایت
              </Link>{" "}
              با تجربه، آماده‌ست همراهتون باشه.
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/order"
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

      {/* خدمات مرتبط — لینک‌سازی داخلی طبق نقشه‌ی کلاستر */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-8">
            <h2 className="font-display text-[22px] font-normal sm:text-[26px]">خدمات مرتبط با طراحی سایت</h2>
          </Reveal>
          <div className="flex flex-wrap gap-3">
            {(["storeDesign", "corporateDesign", "customDesign", "wordpressDesign", "websitePrice", "designCompany"] as const).map(
              (key) => (
                <Link
                  key={key}
                  href={landingHref(key)}
                  className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-surface px-4 py-2 text-[13.5px] font-semibold text-dim transition hover:border-accent hover:text-accent"
                >
                  {landingPages[key].title}
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      <Contact />
      <Footer />
    </>
  );
}
