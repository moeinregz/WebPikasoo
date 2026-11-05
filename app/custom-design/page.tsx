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
const pageUrl = "/custom-design";

export const metadata = {
  title: "طراحی سایت اختصاصی حرفه‌ای | وب پیکاسو",
  description:
    "طراحی سایت اختصاصی با کدنویسی خالص، بدون محدودیت قالب — برای فروشگاه، سایت صنعتی و سازمانی. قیمت شفاف، در بوشهر و سراسر کشور.",
  alternates: { canonical: pageUrl },
  openGraph: {
    url: pageUrl,
    title: "طراحی سایت اختصاصی حرفه‌ای | وب پیکاسو",
    description:
      "طراحی سایت اختصاصی با کدنویسی خالص، بدون محدودیت قالب — برای فروشگاه، سایت صنعتی و سازمانی.",
  },
};

/* ---------------------------------------------------------------------- */
/* داده‌ها                                                                  */
/* ---------------------------------------------------------------------- */

type Benefit = { title: string; desc: ReactNode; icon: ReactNode };

const advantages: Benefit[] = [
  {
    title: "بدون محدودیت قالب",
    desc: "هیچ کدی از قالب یا افزونه‌ی آماده استفاده نمی‌شه؛ هر بخش دقیقاً مطابق فرایند کاری شما نوشته می‌شه.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M9 6 3 12l6 6M15 6l6 6-6 6" />
      </svg>
    ),
  },
  {
    title: "سرعت و عملکرد بالاتر",
    desc: "کدنویسی خالص و بدون وزن اضافه‌ی افزونه‌های غیرضروری، یعنی سایت سریع‌تر بالا میاد و زیر بار ترافیک هم کند نمی‌شه.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
      </svg>
    ),
  },
  {
    title: "امنیت بیشتر",
    desc: "برخلاف سایت‌های وردپرسی که هدف مشترک حمله‌های خودکارن، یه سایت اختصاصی سطح حمله‌ی خیلی محدودتری داره.",
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
    title: "قابلیت اتصال به هر سامانه‌ای",
    desc: "اتصال به نرم‌افزار حسابداری، انبارداری یا هر سامانه‌ی داخلی دیگه‌ی کسب‌وکارتون، در کدنویسی اختصاصی محدودیتی نداره.",
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
    title: "مقیاس‌پذیری واقعی",
    desc: "با رشد تعداد کاربر، محصول یا سفارش، معماری اختصاصی می‌تونه بدون بازنویسی از صفر، مقیاس پیدا کنه.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z" />
      </svg>
    ),
  },
  {
    title: "مالکیت کامل کد",
    desc: "سورس کامل پروژه بعد از تحویل مال خودتونه؛ وابسته به یه پلتفرم یا افزونه‌ی شخص ثالث نیستید.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M9 9h6v6H9z" />
      </svg>
    ),
  },
];

const services: Benefit[] = [
  {
    title: "طراحی و توسعه‌ی اختصاصی UI/UX",
    desc: "طراحی رابط کاربری از صفر و متناسب با برند شما، بدون هیچ شباهتی به قالب‌های عمومی.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9h18" />
      </svg>
    ),
  },
  {
    title: "پنل مدیریت سفارشی",
    desc: "پنلی دقیقاً مطابق نیاز شما، نه یه داشبورد عمومی با امکانات اضافه‌ی بی‌ربط.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    title: "طراحی سایت اختصاصی فروشگاه",
    desc: (
      <>
        برای فروشگاه‌های با حجم بالا یا نیازهای خاص که{" "}
        <Link href={landingHref("storeDesign")} className="text-accent underline underline-offset-2">
          طراحی سایت فروشگاهی
        </Link>{" "}
        استاندارد وردپرسی جوابگو نیست، فروشگاه رو کاملاً اختصاصی کدنویسی می‌کنیم.
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
    title: "وب‌اپلیکیشن و سامانه‌های داخلی",
    desc: "از سامانه‌ی مدیریت سفارش تا پنل داخلی برای تیم‌های فروش و پشتیبانی، هر منطق کاری قابل پیاده‌سازیه.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <rect x="2" y="4" width="20" height="13" rx="2" />
        <path d="M8 21h8M9 17v4M15 17v4" />
      </svg>
    ),
  },
  {
    title: "یکپارچه‌سازی با API و سرویس‌های بیرونی",
    desc: "اتصال به درگاه پرداخت، پیامک، نقشه یا هر API دیگه‌ای که کسب‌وکارتون بهش نیاز داره.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
  {
    title: "سئوی فنی اختصاصی",
    desc: (
      <>
        ساختار سایت از پایه برای سرعت و سئو بهینه می‌شه؛ برای رشد بلندمدت رتبه هم{" "}
        <Link href={landingHref("seoServices")} className="text-accent underline underline-offset-2">
          خدمات سئو
        </Link>{" "}
        اختصاصی داریم.
      </>
    ),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m20 20-4.35-4.35" />
      </svg>
    ),
  },
];

type Step = { n: string; title: string; desc: string };

const steps: Step[] = [
  { n: "۰۱", title: "مشاوره و تحلیل نیاز فنی", desc: "بررسی می‌کنیم دقیقاً چه منطق کاری، سامانه‌ای یا حجم داده‌ای نیاز به کدنویسی اختصاصی داره." },
  { n: "۰۲", title: "طراحی معماری فنی", desc: "انتخاب تکنولوژی، طراحی دیتابیس و ساختار سیستم متناسب با نیاز و مقیاس پروژه." },
  { n: "۰۳", title: "طراحی رابط کاربری", desc: "طراحی UI/UX اختصاصی، بدون هیچ شباهتی به قالب‌های آماده." },
  { n: "۰۴", title: "توسعه و کدنویسی", desc: "پیاده‌سازی فرانت‌اند و بک‌اند با گزارش پیشرفت منظم در طول پروژه." },
  { n: "۰۵", title: "تست فنی کامل", desc: "تست عملکرد، امنیت و سازگاری روی مرورگرها و دستگاه‌های مختلف قبل از تحویل." },
  { n: "۰۶", title: "تحویل، مستندسازی و پشتیبانی", desc: "تحویل سورس کامل به همراه مستندات فنی و پشتیبانی بعد از تحویل." },
];

const faqs: { q: string; a: string }[] = [
  {
    q: "طراحی سایت اختصاصی چیست و چه فرقی با قالب آماده دارد؟",
    a: "طراحی سایت اختصاصی یعنی کدنویسی سایت از صفر و بدون استفاده از قالب یا افزونه‌ی آماده؛ برخلاف قالب که محدود به امکانات از پیش تعریف‌شده‌ست، هر بخش دقیقاً مطابق نیاز شما نوشته می‌شه.",
  },
  {
    q: "قیمت طراحی سایت اختصاصی چقدر است؟",
    a: "هزینه به پیچیدگی سامانه، تعداد صفحات و امکانات موردنیاز بستگی داره؛ پلن‌های ما از حدود پنجاه و هشت میلیون تومان شروع می‌شه و برای پروژه‌های سازمانی بزرگ‌تر قیمت توافقیه.",
  },
  {
    q: "طراحی سایت اختصاصی چقدر طول می‌کشد؟",
    a: "بسته به پیچیدگی پروژه، معمولاً بین چهار تا ده هفته زمان می‌بره؛ زمان دقیق بعد از تحلیل فنی نیازتون در پیشنهاد مکتوب مشخص می‌شه.",
  },
  {
    q: "آیا طراحی سایت اختصاصی با وردپرس هم ممکن است؟",
    a: "به‌صورت کامل نه؛ اما می‌شه یه قالب اختصاصی روی هسته‌ی وردپرس کدنویسی کرد که ظاهر و بخشی از عملکرد کاملاً سفارشی باشه، در حالی که مدیریت محتوا همچنان از طریق وردپرس انجام می‌شه.",
  },
  {
    q: "آیا امکان استفاده از جنگو یا فریم‌ورک‌های پایتون هم وجود دارد؟",
    a: "بله، بسته به نوع پروژه و نیاز فنی، از فریم‌ورک‌هایی مثل جنگو در کنار سایر تکنولوژی‌های مدرن استفاده می‌کنیم؛ انتخاب تکنولوژی در جلسه‌ی مشاوره‌ی فنی بررسی می‌شه.",
  },
  {
    q: "آیا سورس کامل پروژه بعد از تحویل به من داده می‌شود؟",
    a: "بله، مالکیت کامل کد و سورس پروژه بعد از تحویل مال شماست؛ این یکی از تفاوت‌های اصلی طراحی سایت اختصاصی با پروژه‌های وابسته به پلتفرم‌های بسته‌ست.",
  },
  {
    q: "آیا برای شهرستان‌ها مثل بوشهر هم خدمات می‌دهید؟",
    a: "بله، چون فرایند مشاوره و توسعه به‌صورت کاملاً آنلاین انجام می‌شه، به کسب‌وکارها در بوشهر و سراسر کشور برای طراحی سایت اختصاصی خدمت می‌دیم.",
  },
  {
    q: "آیا بعد از تحویل هم پشتیبانی فنی داریم؟",
    a: "بله، هر پروژه شامل گارانتی رفع باگ و پشتیبانی فنی بعد از تحویله.",
  },
  {
    q: "چه اطلاعاتی قبل از سفارش طراحی سایت اختصاصی باید آماده کنم؟",
    a: "توضیح کامل فرایند کاری، سامانه‌های فعلی که باید بهشون متصل بشیم، و حجم تقریبی کاربر یا سفارش کافیه؛ بقیه رو در جلسه‌ی مشاوره‌ی فنی مشخص می‌کنیم.",
  },
  {
    q: "چطور سفارش طراحی سایت اختصاصی را ثبت کنم؟",
    a: "کافیه از صفحه‌ی ثبت سفارش پلن کدنویسی رو انتخاب کنید یا از طریق فرم تماس با تیم فنی ما هماهنگ کنید.",
  },
  {
    q: "آیا امکان شروع با یک نسخه‌ی ساده و توسعه‌ی تدریجی وجود دارد؟",
    a: "بله، برای استارتاپ‌ها و پروژه‌های جدید، شروع با یه نسخه‌ی اولیه (MVP) و توسعه‌ی تدریجی بر اساس بازخورد کاربران رو پیشنهاد می‌کنیم؛ این روش هزینه و ریسک اولیه رو کاهش می‌ده.",
  },
  {
    q: "اگر تیم فنی داخلی دارم، باز هم می‌توانم از این خدمات استفاده کنم؟",
    a: "بله، در پروژه‌های مشترک با تیم فنی داخلی مشتری هم همکاری می‌کنیم؛ نقش دقیق هر طرف در جلسه‌ی مشاوره‌ی اولیه مشخص می‌شه.",
  },
];

/* ---------------------------------------------------------------------- */

export default async function CustomDesignPage() {
  const isLoggedIn = !!(await getCurrentUser());

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        serviceType: "طراحی سایت اختصاصی",
        name: "طراحی سایت اختصاصی حرفه‌ای",
        description: "طراحی سایت اختصاصی با کدنویسی خالص، بدون محدودیت قالب، برای فروشگاه، سایت صنعتی و سازمانی.",
        provider: { "@type": "Organization", name: "وب پیکاسو", url: siteUrl },
        areaServed: "IR",
        url: `${siteUrl}${pageUrl}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "خانه", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "طراحی سایت", item: `${siteUrl}${landingHref("websiteDesign")}` },
          { "@type": "ListItem", position: 3, name: "طراحی سایت اختصاصی", item: `${siteUrl}${pageUrl}` },
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
        eyebrow="Custom Website Development"
        title="طراحی سایت اختصاصی حرفه‌ای"
        desc="وقتی نیازتون خاص و منحصربه‌فرده و قالب‌های آماده جوابگو نیستن، طراحی سایت اختصاصی از صفر و دقیقاً مطابق فرایند کاری شما کدنویسی می‌شه — بدون محدودیت قالب، با سرعت، امنیت و انعطاف بیشتر."
      >
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/order?category=coding"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-[14.5px] font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
          >
            مشاهده پلن‌های کدنویسی و ثبت سفارش
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[15px] w-[15px]">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-canvas px-6 py-3 text-[14.5px] font-bold text-ink transition hover:border-accent hover:text-accent"
          >
            مشاوره‌ی فنی رایگان
          </Link>
        </div>
      </PageHero>

      {/* چیستی */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-10">
            <h2 className="font-display text-[26px] font-normal sm:text-[32px]">
              طراحی سایت اختصاصی چیست؟
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Reveal className="rounded-card border border-ink/10 bg-surface/50 p-6 text-[14.5px] leading-[2] text-dim lg:col-span-1">
              طراحی سایت اختصاصی یعنی ساخت یه وب‌سایت یا وب‌اپلیکیشن با کدنویسی خالص، بدون استفاده
              از قالب یا افزونه‌ی آماده‌ی وردپرس یا هر سایت‌سازی دیگه. برخلاف مسیرهای آماده که محدود
              به امکانات از پیش تعریف‌شده‌ی یه قالبن، در این مسیر هر بخش از رابط کاربری تا منطق
              پشت‌صحنه، دقیقاً مطابق فرایند کاری کسب‌وکار شما نوشته می‌شه.
            </Reveal>
            <Reveal delay={80} className="rounded-card border border-ink/10 bg-surface/50 p-6 text-[14.5px] leading-[2] text-dim lg:col-span-1">
              این مسیر معمولاً برای کسب‌وکارهایی مناسبه که نیاز خاصی دارن که هیچ قالب یا افزونه‌ی
              آماده‌ای جوابگوش نیست؛ مثل اتصال به سامانه‌های داخلی، مدیریت حجم بالای داده، یا
              منطق کاری پیچیده‌ای که در هیچ محصول آماده‌ای پیاده‌سازی نشده. برای همین طراحی سایت
              اختصاصی معمولاً هزینه و زمان بیشتری نسبت به مسیر وردپرسی می‌بره.
            </Reveal>
            <Reveal delay={160} className="rounded-card border border-ink/10 bg-surface/50 p-6 text-[14.5px] leading-[2] text-dim lg:col-span-1">
              در مقابل، نتیجه‌ی نهایی سایتی می‌شه که هیچ محدودیت فنی از سمت یه قالب یا افزونه‌ی
              شخص ثالث نداره، سرعت و امنیت بالاتری داره و کاملاً متعلق به خودتونه. برای کسب‌وکارهایی
              که قصد رشد جدی و بلندمدت دارن، این سرمایه‌گذاری اولیه معمولاً در طول زمان جواب می‌ده.
            </Reveal>
          </div>
        </div>
      </section>

      {/* مزایا */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] bg-dot-grid" />
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-12 flex items-baseline gap-4">
            <span className="flex h-8 items-center rounded-full border border-ink/10 bg-surface px-3.5 font-mono text-sm font-bold text-ink">
              Why
            </span>
            <div>
              <h2 className="font-display text-[28px] font-normal sm:text-[34px] lg:text-[40px]">
                مزایای طراحی سایت اختصاصی
              </h2>
              <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
                شش مزیتی که کدنویسی خالص رو نسبت به مسیرهای آماده متمایز می‌کنه.
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
              خدمات طراحی سایت اختصاصی
            </h2>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              از طراحی رابط کاربری تا وب‌اپلیکیشن و یکپارچه‌سازی با سامانه‌های بیرونی.
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

      {/* تکنولوژی و وردپرس مقایسه */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mx-auto max-w-[820px] rounded-card border border-ink/10 bg-surface/50 p-7 sm:p-10">
            <h2 className="mb-4 font-display text-[24px] font-normal sm:text-[28px]">
              طراحی سایت اختصاصی یا وردپرس؛ کدام مناسب شماست؟
            </h2>
            <p className="text-[14.5px] leading-[2] text-dim">
              اگه نیازتون یه سایت معرفی یا فروشگاه استانداردیه که خودتون بعداً محتواش رو مدیریت
              می‌کنید،{" "}
              <Link href={landingHref("wordpressDesign")} className="text-accent underline underline-offset-2">
                طراحی سایت وردپرس
              </Link>{" "}
              سریع‌تر و اقتصادی‌تره. اما اگه پروژه‌تون شامل منطق کاری خاص، حجم بالای داده یا اتصال
              به چند سامانه‌ی مختلفه، طراحی سایت اختصاصی با کدنویسی خالص گزینه‌ی درسته. بسته به نوع
              پروژه و نیاز فنی، ممکنه از فریم‌ورک‌های مختلفی مثل جنگو در پایتون یا فریم‌ورک‌های
              جاوااسکریپتی مدرن استفاده کنیم؛ انتخاب تکنولوژی دقیق در جلسه‌ی مشاوره‌ی فنی، بر اساس
              نیاز واقعی پروژه‌ی شما مشخص می‌شه.
            </p>
          </Reveal>
        </div>
      </section>

      {/* قیمت — داده‌ی واقعی */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-10">
            <h2 className="font-display text-[26px] font-normal sm:text-[32px]">
              قیمت طراحی سایت اختصاصی چقدر است؟
            </h2>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              هزینه به پیچیدگی سامانه، تعداد ماژول‌ها و حجم توسعه‌ی موردنیاز بستگی داره.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Reveal className="rounded-card border border-ink/10 bg-surface/50 p-6">
              <h3 className="mb-1.5 text-[16px] font-bold text-ink">پایه</h3>
              <p className="mb-4 text-[13.5px] leading-relaxed text-dim">
                برای پروژه‌های کوچک و متوسط با نیاز مشخص به کدنویسی اختصاصی.
              </p>
              <p className="mb-4 text-[15px] font-bold text-accent">شروع از ۵۸ میلیون تومان</p>
            </Reveal>
            <Reveal delay={80} className="rounded-card border border-accent/40 bg-surface/50 p-6">
              <h3 className="mb-1.5 text-[16px] font-bold text-ink">پیشرفته</h3>
              <p className="mb-4 text-[13.5px] leading-relaxed text-dim">
                برای پروژه‌های بزرگ‌تر با چند ماژول، پنل مدیریت پیچیده و یکپارچه‌سازی با سامانه‌های
                بیرونی.
              </p>
              <p className="mb-4 text-[15px] font-bold text-accent">شروع از ۸۴ میلیون تومان</p>
            </Reveal>
            <Reveal delay={160} className="rounded-card border border-ink/10 bg-surface/50 p-6">
              <h3 className="mb-1.5 text-[16px] font-bold text-ink">اختصاصی / سازمانی</h3>
              <p className="mb-4 text-[13.5px] leading-relaxed text-dim">
                برای سامانه‌های سازمانی بزرگ با نیازهای کاملاً منحصربه‌فرد و مقیاس بالا.
              </p>
              <p className="mb-4 text-[15px] font-bold text-accent">قیمت توافقی</p>
            </Reveal>
          </div>
          <p className="mt-6 text-[13px] text-dim">
            برای دیدن جزئیات کامل هر پلن،{" "}
            <Link href={landingHref("websitePrice")} className="text-accent underline underline-offset-2">
              بازه‌ی قیمت طراحی سایت
            </Link>{" "}
            رو ببینید یا از صفحه‌ی{" "}
            <Link href="/order?category=coding" className="text-accent underline underline-offset-2">
              ثبت سفارش
            </Link>{" "}
            پلن مناسب رو انتخاب کنید.
          </p>
        </div>
      </section>

      {/* مراحل */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-12">
            <h2 className="font-display text-[28px] font-normal sm:text-[34px] lg:text-[40px]">
              مراحل طراحی سایت اختصاصی در وب پیکاسو
            </h2>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              شش مرحله‌ی فنی، از تحلیل نیاز تا تحویل و مستندسازی کامل.
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
            <h2 className="mb-3 text-[18px] font-bold text-ink">طراحی سایت اختصاصی در بوشهر و سراسر کشور</h2>
            <p className="text-[14px] leading-[2] text-dim">
              تیم فنی وب پیکاسو به کسب‌وکارها در بوشهر و سراسر کشور برای طراحی سایت اختصاصی خدمت
              می‌ده. چون تمام مراحل مشاوره، توسعه و تحویل به‌صورت آنلاین انجام می‌شه، فرقی نمی‌کنه
              کسب‌وکارتون در بوشهر باشه یا هر استان دیگه‌ای؛ کیفیت کدنویسی و سرعت پاسخ‌گویی برای
              همه‌ی مشتری‌ها یکسانه.
            </p>
          </Reveal>
          <Reveal delay={60} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">طراحی سایت اختصاصی صنعتی</h2>
            <p className="text-[14px] leading-[2] text-dim">
              شرکت‌های صنعتی و تولیدی معمولاً نیازهای خاصی دارن که در قالب‌های آماده جایی ندارن: کاتالوگ
              فنی محصولات با مشخصات دقیق، فرم درخواست قیمت بر اساس مشخصات سفارشی، یا اتصال به سامانه‌ی
              انبار و تولید. طراحی سایت اختصاصی صنعتی دقیقاً برای همین نوع نیازها طراحی می‌شه؛ ساختاری
              که هم برای مشتری‌های B2B قابل‌فهم باشه و هم به سامانه‌های داخلی کارخانه یا شرکت متصل بشه.
            </p>
          </Reveal>
          <Reveal delay={120} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">آموزش طراحی سایت اختصاصی: چند نکته قبل از سفارش</h2>
            <p className="text-[14px] leading-[2] text-dim">
              قبل از سفارش طراحی سایت اختصاصی، خوبه فرایند کاری فعلی‌تون رو کامل مستند کنید: چه
              مراحلی دستی انجام می‌شه، چه سامانه‌هایی الان استفاده می‌کنید، و کجای این فرایند بیشترین
              اتلاف وقت رو داره. هر چقدر این اطلاعات دقیق‌تر باشه، تیم فنی راحت‌تر می‌تونه معماری
              درستی طراحی کنه و از بازطراحی‌های اضافه در وسط پروژه جلوگیری بشه.
            </p>
          </Reveal>
          <Reveal delay={180} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">اشتباهات رایج در سفارش طراحی سایت اختصاصی</h2>
            <p className="text-[14px] leading-[2] text-dim">
              رایج‌ترین اشتباه، شروع کدنویسی بدون یه تحلیل فنی مکتوب و دقیقه، که باعث تغییرات
              پرهزینه در وسط پروژه می‌شه. اشتباه دوم، انتخاب تکنولوژی بر اساس ترند روز به‌جای نیاز
              واقعی پروژه‌ست. اشتباه سوم، نداشتن مستندات فنی بعد از تحویل، که نگهداری بلندمدت سایت
              رو سخت می‌کنه. وب پیکاسو با تحلیل فنی مکتوب، انتخاب تکنولوژی مناسب و تحویل مستندات
              کامل، از همین ابتدا جلوی این مشکلات رو می‌گیره.
            </p>
          </Reveal>
          <Reveal delay={240} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">چرا شرکت‌ها وب پیکاسو را به‌عنوان شرکت طراحی سایت اختصاصی انتخاب می‌کنند</h2>
            <p className="text-[14px] leading-[2] text-dim">
              وب پیکاسو به‌عنوان یه{" "}
              <Link href={landingHref("designCompany")} className="text-accent underline underline-offset-2">
                شرکت طراحی سایت
              </Link>{" "}
              با تجربه در پروژه‌های کدنویسی، قبل از هر خطی کد، وقت می‌ذاره تا واقعاً منطق کاری شما
              رو بفهمه. این یعنی به‌جای پیاده‌سازی کورکورانه‌ی هر چیزی که خواسته می‌شه، راه‌حلی
              پیشنهاد می‌دیم که هم فنی درست باشه و هم به هدف تجاری پروژه‌تون برسه.
            </p>
          </Reveal>
          <Reveal delay={300} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">امنیت در پروژه‌های کدنویسی اختصاصی</h2>
            <p className="text-[14px] leading-[2] text-dim">
              نبود افزونه‌های شخص ثالث به‌خودی‌خود امنیت رو تضمین نمی‌کنه؛ امنیت باید از همون مرحله‌ی
              طراحی معماری در نظر گرفته بشه. اعتبارسنجی درست ورودی‌های کاربر، رمزنگاری داده‌های
              حساس، مدیریت صحیح نشست‌های کاربری و محدودسازی دسترسی‌ها بر اساس نقش، جزو استانداردهایی
              هستن که در هر پروژه‌ی اختصاصی رعایت می‌شن. همین‌طور تست امنیتی قبل از تحویل، کمک می‌کنه
              آسیب‌پذیری‌های احتمالی قبل از انتشار عمومی شناسایی و رفع بشن.
            </p>
          </Reveal>
          <Reveal delay={360} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">نمونه‌کارهای پروژه‌های کدنویسی اختصاصی وب پیکاسو</h2>
            <p className="text-[14px] leading-[2] text-dim">
              تیم فنی وب پیکاسو چندین سامانه و وب‌اپلیکیشن اختصاصی برای صنایع مختلف پیاده‌سازی
              کرده؛ از سامانه‌های داخلی مدیریت سفارش گرفته تا فروشگاه‌های بزرگ با حجم بالای محصول.
              می‌تونید نمونه‌کارها رو در بخش{" "}
              <Link href="/portfolio" className="text-accent underline underline-offset-2">
                پرتفولیو
              </Link>{" "}
              ببینید تا با نوع پروژه‌ها و پیچیدگی فنی کارهای قبلی آشنا بشید. دیدن یه پروژه‌ی واقعی،
              بهتر از هر توضیحی نشون می‌ده تیم فنی چقدر با نیازهای پیچیده راحته.
            </p>
          </Reveal>
          <Reveal delay={420} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">چطور نتیجه‌ی پروژه را بعد از تحویل ارزیابی کنیم</h2>
            <p className="text-[14px] leading-[2] text-dim">
              بعد از تحویل، چند معیار کمکتون می‌کنه بفهمید پروژه اصولی پیاده‌سازی شده یا نه: اول،
              سرعت و پایداری سامانه رو زیر بار واقعی کاربر تست کنید. دوم، مطمئن بشید مستندات فنی
              کامل و قابل‌فهم تحویل داده شده. سوم، ببینید آیا کد به شکلی نوشته شده که یه تیم دیگه
              هم در آینده بتونه ادامه‌ش بده، نه فقط همون تیم اولیه. و چهارم، بررسی کنید آیا پشتیبانی
              فنی بعد از تحویل واقعاً در دسترسه یا فقط یه وعده‌ی تبلیغاتی بوده.
            </p>
          </Reveal>
          <Reveal delay={480} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">چه زمانی طراحی سایت اختصاصی لازم نیست</h2>
            <p className="text-[14px] leading-[2] text-dim">
              با اینکه کدنویسی اختصاصی مزیت‌های زیادی داره، همیشه بهترین گزینه نیست. اگه فقط به یه
              سایت معرفی ساده یا یه فروشگاه با نیازهای استاندارد نیاز دارید، مسیر وردپرسی معمولاً
              سریع‌تر، ارزون‌تر و کافیه؛ صرف هزینه‌ی بیشتر برای کدنویسی خالص در این حالت توجیه فنی
              یا تجاری نداره. صادقانه‌ترین کار برای یه تیم فنی خوب، پیشنهاد مسیر مناسب بر اساس نیاز
              واقعیه، نه فروختن گران‌ترین گزینه به همه‌ی مشتری‌ها؛ برای همین وب پیکاسو همیشه اول
              نیاز واقعی رو بررسی می‌کنه و بعد مسیر فنی رو پیشنهاد می‌ده.
            </p>
          </Reveal>
          <Reveal delay={540} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">هزینه‌ی نگهداری بلندمدت طراحی سایت اختصاصی در مقابل وردپرس</h2>
            <p className="text-[14px] leading-[2] text-dim">
              یه نکته‌ی مهم که کمتر بهش توجه می‌شه، هزینه‌ی نگهداری بعد از تحویله. سایت وردپرسی
              معمولاً نیاز به به‌روزرسانی مداوم هسته و افزونه‌ها داره تا آسیب‌پذیری امنیتی پیدا
              نکنه، در حالی که یه سامانه‌ی اختصاصی معماری ثابت‌تری داره و کمتر دستخوش تغییرات
              اجباری بیرونی می‌شه. از طرف دیگه، هر تغییر یا قابلیت جدید در سایت اختصاصی نیاز به
              توسعه‌ی مجدد داره، در حالی که در وردپرس ممکنه با یه افزونه‌ی آماده حل بشه. برای همین
              مقایسه‌ی هزینه‌ی بلندمدت باید بر اساس نوع تغییراتی باشه که در طول زمان انتظار دارید.
            </p>
          </Reveal>
          <Reveal delay={600} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">شروع با یک MVP و توسعه‌ی تدریجی</h2>
            <p className="text-[14px] leading-[2] text-dim">
              خیلی از استارتاپ‌ها فکر می‌کنن باید از همون ابتدا کامل‌ترین نسخه‌ی ممکن رو بسازن، در
              حالی که یه رویکرد هوشمندانه‌تر، شروع با یه نسخه‌ی اولیه یا MVP با امکانات اصلیه که
              سریع‌تر و ارزون‌تر قابل تحویله. بعد از تست بازار و گرفتن بازخورد کاربران واقعی، توسعه
              به‌صورت تدریجی و بر اساس اولویت واقعی ادامه پیدا می‌کنه. این روش ریسک مالی و فنی رو
              کاهش می‌ده و باعث می‌شه بودجه‌ی توسعه صرف امکاناتی بشه که واقعاً کاربران بهش نیاز
              دارن، نه حدس و گمان تیم اولیه‌ی پروژه.
            </p>
          </Reveal>
          <Reveal delay={660} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">پشتیبانی و به‌روزرسانی بعد از تحویل</h2>
            <p className="text-[14px] leading-[2] text-dim">
              تحویل یه پروژه‌ی اختصاصی، پایان همکاری نیست. بعد از راه‌اندازی، معمولاً نیاز به رفع
              باگ‌های احتمالی، اضافه کردن قابلیت‌های جدید، و گاهی به‌روزرسانی زیرساخت برای سازگاری
              با نسخه‌های جدید تکنولوژی‌ها وجود داره. وب پیکاسو بعد از تحویل هر پروژه، یه دوره‌ی
              گارانتی رفع باگ رایگان ارائه می‌ده و برای توسعه‌های آینده هم می‌تونید با همون تیمی که
              پروژه رو می‌شناسه ادامه بدید، نه یه تیم جدید که باید از صفر با کد آشنا بشه.
            </p>
          </Reveal>
          <Reveal delay={720} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">زبان‌ها و فریم‌ورک‌های رایج در طراحی سایت اختصاصی</h2>
            <p className="text-[14px] leading-[2] text-dim">
              انتخاب زبان و فریم‌ورک مناسب، به نوع پروژه بستگی داره، نه به یه استاندارد ثابت. برای
              پروژه‌هایی با منطق کاری سنگین و نیاز به توسعه‌ی سریع، جنگو در پایتون گزینه‌ی قابل
              اعتمادیه، چون ابزارهای آماده‌ی زیادی برای مدیریت کاربر، پنل ادمین و امنیت داره. برای
              رابط‌های کاربری پویا و سریع، از فریم‌ورک‌های جاوااسکریپتی مدرن استفاده می‌کنیم. در
              پروژه‌هایی که نیاز به مقیاس بالا و پردازش همزمان زیاد دارن، تکنولوژی‌های دیگه‌ای هم
              بسته به شرایط بررسی می‌شن. در جلسه‌ی مشاوره‌ی فنی، بعد از شناخت دقیق نیاز پروژه‌ی
              شما، تکنولوژی مناسب رو با دلیل فنی پیشنهاد می‌دیم، نه بر اساس ترجیح شخصی یا ترند روز.
            </p>
          </Reveal>
          <Reveal delay={780} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">طراحی سایت اختصاصی و اپلیکیشن موبایل</h2>
            <p className="text-[14px] leading-[2] text-dim">
              خیلی از پروژه‌های اختصاصی، در کنار وب‌سایت به یه اپلیکیشن موبایل هم نیاز پیدا می‌کنن؛
              مثلاً یه فروشگاه بزرگ که هم نسخه‌ی وب می‌خواد و هم اپلیکیشن اندروید و آی‌اواس برای
              مشتری‌های وفادار. در طراحی معماری سایت اختصاصی، از همون ابتدا می‌شه API رو طوری طراحی
              کرد که هم توسط وب‌سایت استفاده بشه و هم بعداً پایه‌ی یه اپلیکیشن موبایل قرار بگیره؛
              این کار از دوباره‌کاری در آینده جلوگیری می‌کنه و باعث می‌شه وب و موبایل همیشه با یه
              منبع داده‌ی واحد و هماهنگ کار کنن.
            </p>
          </Reveal>
        </div>
      </section>

      {/* چک‌لیست */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-8">
            <h2 className="font-display text-[26px] font-normal sm:text-[32px]">
              چک‌لیست انتخاب شرکت طراحی سایت اختصاصی
            </h2>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              قبل از سفارش، این چند نکته‌ی فنی رو از هر تیمی که در نظر دارید بپرسید.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              "آیا قبل از کدنویسی، یه تحلیل فنی مکتوب ارائه می‌دن؟",
              "آیا نمونه‌کار واقعی از پروژه‌های اختصاصی قبلی‌شون دارن؟",
              "آیا سورس کامل و مستندات فنی بعد از تحویل داده می‌شه؟",
              "آیا انتخاب تکنولوژی رو بر اساس نیاز شما توجیه می‌کنن، نه صرفاً ترجیح خودشون؟",
              "آیا بعد از تحویل، پشتیبانی فنی و رفع باگ دارن؟",
              "آیا امکان مقیاس‌پذیری آینده رو در طراحی معماری در نظر می‌گیرن؟",
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
                سوالات متداول درباره‌ی طراحی سایت اختصاصی
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
              چرا الان زمان مناسبی برای طراحی سایت اختصاصی است
            </h2>
            <p className="max-w-[60ch] text-[14.5px] leading-[2] text-dim">
              هر چقدر کسب‌وکار شما به قالب‌های آماده وابسته‌تر بمونه، دیرتر یا دشوارتر می‌تونید
              نیازهای خاص و رشد بلندمدتتون رو پوشش بدید. طراحی سایت اختصاصی، چه برای{" "}
              <Link href={landingHref("storeDesign")} className="text-accent underline underline-offset-2">
                یه فروشگاه با حجم بالا
              </Link>
              ، چه برای{" "}
              <Link href={landingHref("corporateDesign")} className="text-accent underline underline-offset-2">
                یه سایت شرکتی
              </Link>{" "}
              با نیاز سازمانی خاص، کنترل و مالکیت کامل رو به شما برمی‌گردونه. برای آشنایی با
              پایه‌های{" "}
              <Link href={landingHref("websiteDesign")} className="text-accent underline underline-offset-2">
                طراحی سایت
              </Link>{" "}
              هم می‌تونید صفحه‌ی اصلی این موضوع رو ببینید.
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/order?category=coding"
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
            <h2 className="font-display text-[22px] font-normal sm:text-[26px]">خدمات مرتبط با طراحی سایت اختصاصی</h2>
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
            <Link href={landingHref("wordpressDesign")} className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-surface px-4 py-2 text-[13.5px] font-semibold text-dim transition hover:border-accent hover:text-accent">
              طراحی سایت وردپرس
            </Link>
            <Link href={landingHref("websitePrice")} className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-surface px-4 py-2 text-[13.5px] font-semibold text-dim transition hover:border-accent hover:text-accent">
              قیمت طراحی سایت
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
