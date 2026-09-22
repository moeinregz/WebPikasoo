import type { ReactNode } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import Contact from "@/components/Contact";
import { getCurrentUser } from "@/lib/session";
import { landingHref, landingPages } from "@/lib/landingPages";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://webpikaso.ir";
const pageUrl = "/design-company";

export const metadata = {
  title: "شرکت طراحی سایت وب پیکاسو | تهران و سراسر کشور",
  description:
    "وب پیکاسو، شرکت طراحی سایت با خدمات فروشگاهی، شرکتی، اختصاصی، وردپرس و سئو زیر یک سقف — قیمت شفاف، پشتیبانی بعد از تحویل، در تهران و سراسر ایران.",
  alternates: { canonical: pageUrl },
  openGraph: {
    url: pageUrl,
    title: "شرکت طراحی سایت وب پیکاسو | تهران و سراسر کشور",
    description:
      "وب پیکاسو، شرکت طراحی سایت با خدمات فروشگاهی، شرکتی، اختصاصی، وردپرس و سئو زیر یک سقف.",
  },
};

/* ---------------------------------------------------------------------- */

type ServiceCard = { key: keyof typeof landingPages; desc: string };

const serviceCards: ServiceCard[] = [
  { key: "storeDesign", desc: "فروشگاه آنلاین با درگاه پرداخت، مدیریت موجودی و سبد خرید حرفه‌ای." },
  { key: "corporateDesign", desc: "معرفی رسمی خدمات، تیم و نمونه‌کار برای شرکت‌ها و مجموعه‌های خدماتی." },
  { key: "customDesign", desc: "کدنویسی اختصاصی برای نیازهای خاص، بدون محدودیت قالب." },
  { key: "wordpressDesign", desc: "راه‌اندازی اقتصادی و سریع با پنل مدیریت آشنا و هزاران افزونه." },
  { key: "websitePrice", desc: "جدول کامل تعرفه‌ی هر پلن، شفاف و بدون هزینه‌ی پنهان." },
  { key: "seoServices", desc: "رشد ارگانیک رتبه و ترافیک، مکمل هر پروژه‌ی طراحی سایت." },
];

type Step = { n: string; title: string; desc: string };

const steps: Step[] = [
  { n: "۰۱", title: "مشاوره‌ی رایگان", desc: "نیاز، بودجه و هدف کسب‌وکار شما رو در یه جلسه‌ی کوتاه بررسی می‌کنیم." },
  { n: "۰۲", title: "پیشنهاد مکتوب", desc: "ساختار پروژه، تکنولوژی و بازه‌ی قیمت رو به‌صورت شفاف و مکتوب ارائه می‌دیم." },
  { n: "۰۳", title: "طراحی و تایید", desc: "قبل از شروع کدنویسی، طراحی رابط کاربری رو می‌بینید و تایید می‌کنید." },
  { n: "۰۴", title: "توسعه و ساخت", desc: "تیم فنی پروژه رو با گزارش پیشرفت منظم پیش می‌بره." },
  { n: "۰۵", title: "تست و تحویل", desc: "بعد از تست کامل، سایت به همراه آموزش مدیریت تحویل داده می‌شه." },
  { n: "۰۶", title: "پشتیبانی بعد از تحویل", desc: "طبق گارانتی، هر باگ فنی رو رفع می‌کنیم و برای سوالات در دسترسیم." },
];

const faqs: { q: string; a: string }[] = [
  {
    q: "بهترین شرکت طراحی سایت در تهران کدام است؟",
    a: "«بهترین» یه عنوان قابل‌اثبات با معیار ثابت نیست؛ بهترین انتخاب، شرکتی‌ست که نمونه‌کار واقعی، قیمت شفاف، سورس کامل بعد از تحویل و پشتیبانی فنی داشته باشه. وب پیکاسو دقیقاً بر همین چهار معیار ساخته شده و در تهران و سراسر کشور فعاله.",
  },
  {
    q: "بهترین شرکت طراحی سایت در ایران چیست؟",
    a: "در سطح کشور هم همون معیارهای نمونه‌کار واقعی، شفافیت قیمت، مالکیت کامل سورس و پشتیبانی بعد از تحویل ملاک انتخابن؛ وب پیکاسو چون فرایندش کاملاً آنلاینه، این خدمات رو با کیفیت یکسان به مشتری‌ها در همه‌ی استان‌های ایران ارائه می‌ده.",
  },
  {
    q: "آیا وب پیکاسو در تهران دفتر دارد؟",
    a: "فرایند مشاوره، طراحی و تحویل پروژه‌ها به‌صورت کاملاً آنلاین انجام می‌شه، برای همین کیفیت خدمات برای مشتری‌های تهران و هر شهر دیگه‌ای یکسانه؛ در صورت نیاز مشتری‌های تهرانی، هماهنگی جلسه‌ی حضوری هم ممکنه.",
  },
  {
    q: "آیا شرکت طراحی سایت وب پیکاسو خدمات سئو هم ارائه می‌دهد؟",
    a: "بله، در کنار طراحی سایت، خدمات سئوی اختصاصی هم ارائه می‌دیم؛ چون طراحی سایت بدون سئو یعنی مشتری‌های بالقوه سایت شما رو در گوگل پیدا نمی‌کنن.",
  },
  {
    q: "شرکت طراحی سایت فروشگاهی خوب چه ویژگی‌هایی دارد؟",
    a: "تجربه‌ی واقعی در راه‌اندازی درگاه پرداخت، مدیریت موجودی و بهینه‌سازی سرعت صفحات محصول، مهم‌ترین ویژگی یه شرکت طراحی سایت فروشگاهی خوبه.",
  },
  {
    q: "شرکت طراحی سایت وردپرس چه تفاوتی با شرکت‌های کدنویسی اختصاصی دارد؟",
    a: "شرکتی که روی وردپرس تخصص داره، سریع‌تر و اقتصادی‌تر پروژه رو تحویل می‌ده؛ شرکتی که روی کدنویسی اختصاصی تمرکز داره، برای نیازهای پیچیده و خاص گزینه‌ی بهتریه. وب پیکاسو هر دو مسیر رو زیر یه سقف ارائه می‌ده تا مسیر مناسب رو خودتون انتخاب نکنید و ما پیشنهادش بدیم.",
  },
  {
    q: "چگونه سفارش طراحی سایت را نزد شما ثبت کنم؟",
    a: "از صفحه‌ی ثبت سفارش، پلن مناسب رو انتخاب کنید یا از طریق فرم تماس با تیم ما هماهنگ کنید تا مشاوره‌ی رایگان شروع بشه.",
  },
  {
    q: "آیا برای شهرهایی مثل اصفهان، مشهد یا شیراز هم خدمات می‌دهید؟",
    a: "بله، چون فرایند به‌صورت کاملاً آنلاین انجام می‌شه، به کسب‌وکارها در اصفهان، مشهد، شیراز و سراسر ایران، با همون کیفیت و سرعت پاسخ‌گویی خدمت می‌دیم.",
  },
  {
    q: "خدمات شرکت طراحی سایت وب پیکاسو شامل چه مواردی می‌شود؟",
    a: "طراحی سایت فروشگاهی، شرکتی، اختصاصی و وردپرس، به همراه خدمات سئو و توسعه‌ی نرم‌افزار و پنل مدیریت؛ همه زیر یه سقف و با یه تیم واحد.",
  },
  {
    q: "چقدر طول می‌کشد تا با شرکت طراحی سایت به نتیجه برسیم؟",
    a: "بسته به نوع پروژه، از دو هفته برای یه سایت ساده تا چند ماه برای یه سامانه‌ی پیچیده متغیره؛ زمان دقیق بعد از مشاوره‌ی اولیه در پیشنهاد مکتوب مشخص می‌شه.",
  },
  {
    q: "آیا شرکت طراحی سایت وب پیکاسو گواهی یا نمونه قرارداد ارائه می‌دهد؟",
    a: "بله، هر پروژه با یه پیشنهاد و قرارداد مکتوب شروع می‌شه که دامنه‌ی کار، قیمت، زمان‌بندی و شرایط پشتیبانی رو دقیق مشخص می‌کنه.",
  },
  {
    q: "آیا می‌توانم قبل از سفارش با تیم فنی صحبت کنم؟",
    a: "بله، جلسه‌ی مشاوره‌ی اولیه معمولاً مستقیم با همون افرادی برگزار می‌شه که روی پروژه کار خواهند کرد، نه فقط یه واحد فروش جدا از تیم اجرایی.",
  },
];

/* ---------------------------------------------------------------------- */

export default async function DesignCompanyPage() {
  const isLoggedIn = !!(await getCurrentUser());

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "وب پیکاسو",
        url: siteUrl,
        description: "شرکت طراحی سایت با خدمات فروشگاهی، شرکتی، اختصاصی، وردپرس و سئو.",
        areaServed: "IR",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "خانه", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "طراحی سایت", item: `${siteUrl}${landingHref("websiteDesign")}` },
          { "@type": "ListItem", position: 3, name: "شرکت طراحی سایت", item: `${siteUrl}${pageUrl}` },
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
        eyebrow="Web Design Company"
        title="شرکت طراحی سایت وب پیکاسو"
        desc="وب پیکاسو به عنوان یه شرکت طراحی سایت، خدمات فروشگاهی، شرکتی، اختصاصی، وردپرس و سئو رو زیر یه سقف و با یه تیم واحد از ابتدا تا پشتیبانی بعد از تحویل انجام می‌ده — در تهران و سراسر کشور، با قیمت شفاف و بدون واسطه."
      >
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/order"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-[14.5px] font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
          >
            مشاهده‌ی خدمات و ثبت سفارش
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

      {/* چرا یک شرکت به جای فریلنسر تنها */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-10">
            <h2 className="font-display text-[26px] font-normal sm:text-[32px]">
              چرا یک شرکت طراحی سایت به جای فریلنسر تنها؟
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Reveal className="rounded-card border border-ink/10 bg-surface/50 p-6 text-[14.5px] leading-[2] text-dim lg:col-span-1">
              یه فریلنسر تنها معمولاً فقط یه تخصص داره — یا طراحی گرافیک، یا کدنویسی، یا سئو. یه
              شرکت طراحی سایت، تیمی از طراح، توسعه‌دهنده و متخصص سئو رو کنار هم داره؛ یعنی پروژه‌ی
              شما از زوایای مختلف بررسی می‌شه، نه فقط از دید یه نفر.
            </Reveal>
            <Reveal delay={80} className="rounded-card border border-ink/10 bg-surface/50 p-6 text-[14.5px] leading-[2] text-dim lg:col-span-1">
              ریسک هم موضوع مهمیه: اگه یه فریلنسر تنها به هر دلیلی در دسترس نباشه، پروژه یا
              پشتیبانی بعدیتون معطل می‌مونه. یه شرکت طراحی سایت با تیم و فرایند مشخص، این ریسک رو
              تا حد زیادی کاهش می‌ده.
            </Reveal>
            <Reveal delay={160} className="rounded-card border border-ink/10 bg-surface/50 p-6 text-[14.5px] leading-[2] text-dim lg:col-span-1">
              از طرف دیگه، یه شرکت معمولاً قرارداد، فاکتور رسمی و مسیر پشتیبانی مشخص‌تری داره؛ برای
              کسب‌وکارهایی که به مستندات رسمی برای همکاری نیاز دارن، این تفاوت به‌تنهایی می‌تونه
              تعیین‌کننده باشه.
            </Reveal>
          </div>
        </div>
      </section>

      {/* بهترین شرکت چه ویژگی‌هایی دارد */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] bg-dot-grid" />
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-12 flex items-baseline gap-4">
            <span className="flex h-8 items-center rounded-full border border-ink/10 bg-surface px-3.5 font-mono text-sm font-bold text-ink">
              Criteria
            </span>
            <div>
              <h2 className="font-display text-[28px] font-normal sm:text-[34px] lg:text-[40px]">
                بهترین شرکت طراحی سایت چه ویژگی‌هایی دارد؟
              </h2>
              <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
                به‌جای یه ادعای کلی، شش معیار عینی که می‌تونید با هر شرکتی بسنجید.
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "نمونه‌کار واقعی و قابل بازدید", desc: "بهترین شرکت‌ها نمونه‌کارهاشون رو مخفی نمی‌کنن؛ می‌ذارن قبل از سفارش، کیفیت واقعی کار رو ببینید." },
              { title: "قیمت شفاف و مکتوب", desc: "بازه‌ی قیمت از قبل مشخصه، نه وابسته به چانه‌زنی تلفنی یا فشار برای تصمیم سریع." },
              { title: "مالکیت کامل سورس بعد از تحویل", desc: "سایت و کدش واقعاً مال شما می‌شه، نه گروگان یه پلتفرم یا حساب کاربری شرکت طراح." },
              { title: "پشتیبانی واقعی بعد از تحویل", desc: "گارانتی رفع باگ و دسترسی به تیم فنی، نه فقط تا لحظه‌ی دریافت مبلغ نهایی." },
              { title: "ارتباط مستقیم با تیم اجرایی", desc: "صحبت مستقیم با کسی که واقعاً روی پروژه کار می‌کنه، نه فقط یه واسطه‌ی فروش." },
              { title: "تخصص هم‌زمان در طراحی، فنی و سئو", desc: "سایتی که هم زیبا باشه، هم فنی درست کار کنه و هم بتونه در گوگل دیده بشه." },
            ].map((item, i) => (
              <Reveal
                key={item.title}
                delay={i * 60}
                className="flex flex-col gap-3 rounded-card border border-ink/10 bg-surface/50 p-6"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth={2.4}>
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                <div>
                  <h3 className="mb-1.5 text-[15px] font-bold text-ink">{item.title}</h3>
                  <p className="text-[13.5px] leading-relaxed text-dim">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* خدمات شرکت — لینک به همه‌ی لندینگ‌ها */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-12">
            <h2 className="font-display text-[28px] font-normal sm:text-[34px] lg:text-[40px]">
              خدمات شرکت طراحی سایت وب پیکاسو
            </h2>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              همه‌ی مسیرهای طراحی سایت، زیر یه سقف و با یه تیم واحد.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {serviceCards.map((s, i) => (
              <Reveal key={s.key} delay={i * 60}>
                <Link
                  href={landingHref(s.key)}
                  className="group flex h-full flex-col justify-between gap-4 rounded-card border border-ink/10 bg-surface/50 p-6 transition hover:-translate-y-1 hover:border-accent/40"
                >
                  <div>
                    <h3 className="mb-1.5 text-[15.5px] font-bold text-ink group-hover:text-accent">
                      {landingPages[s.key].title}
                    </h3>
                    <p className="text-[13.5px] leading-relaxed text-dim">{s.desc}</p>
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

      {/* شرکت طراحی سایت به تفکیک شهر */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] bg-dot-grid" />
        <div className="relative z-[1] mx-auto max-w-container space-y-6 px-6">
          <Reveal className="mb-4">
            <h2 className="font-display text-[28px] font-normal sm:text-[34px] lg:text-[40px]">
              شرکت طراحی سایت در تهران و سراسر کشور
            </h2>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              پاسخ مستقیم به سوالات رایج درباره‌ی محدوده‌ی جغرافیایی خدمات.
            </p>
          </Reveal>

          <Reveal className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h3 className="mb-2 text-[16.5px] font-bold text-ink">شرکت طراحی سایت تهران</h3>
            <p className="text-[14px] leading-[2] text-dim">
              <strong className="text-ink">
                وب پیکاسو به کسب‌وکارهای تهران، چه شرکت‌های بزرگ و چه کسب‌وکارهای کوچک، خدمات طراحی
                سایت ارائه می‌ده.
              </strong>{" "}
              چون مشاوره، طراحی و تحویل به‌صورت کاملاً آنلاین انجام می‌شه، کیفیت و سرعت پاسخ‌گویی
              برای مشتری‌های تهرانی دقیقاً مثل بقیه‌ی شهرهاست؛ در صورت نیاز، جلسه‌ی حضوری هم برای
              مشتری‌های تهران قابل هماهنگیه.
            </p>
          </Reveal>

          <Reveal delay={60} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h3 className="mb-2 text-[16.5px] font-bold text-ink">شرکت طراحی سایت اصفهان، مشهد و شیراز</h3>
            <p className="text-[14px] leading-[2] text-dim">
              <strong className="text-ink">
                بله، وب پیکاسو به کسب‌وکارهای اصفهان، مشهد، شیراز و هر شهر دیگه‌ای در ایران هم خدمت
                می‌ده.
              </strong>{" "}
              فاصله‌ی جغرافیایی هیچ تاثیری روی کیفیت طراحی سایت، سرعت پشتیبانی یا شفافیت قیمت نداره؛
              همه‌ی مراحل از طریق تماس آنلاین، ایمیل و پیام‌رسان‌ها هماهنگ می‌شه.
            </p>
          </Reveal>

          <Reveal delay={120} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h3 className="mb-2 text-[16.5px] font-bold text-ink">شرکت طراحی سایت در محله‌ها و مناطق کوچک‌تر (مثل تابان‌شهر)</h3>
            <p className="text-[14px] leading-[2] text-dim">
              <strong className="text-ink">
                خدمات طراحی سایت وب پیکاسو محدود به مرکز شهرهای بزرگ نیست.
              </strong>{" "}
              چه کسب‌وکارتون در یکی از محله‌های تهران باشه، چه در منطقه‌ای مثل تابان‌شهر یا هر شهرک
              و محله‌ی دیگه‌ای در حومه‌ی شهرهای بزرگ، فرایند دقیقاً یکسانه: یه جلسه‌ی مشاوره‌ی
              آنلاین کافیه تا کار شروع بشه، بدون نیاز به رفت‌وآمد فیزیکی.
            </p>
          </Reveal>
        </div>
      </section>

      {/* شرکت طراحی سایت و سئو */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mx-auto max-w-[820px] rounded-card border border-ink/10 bg-surface/50 p-7 sm:p-10">
            <h2 className="mb-4 font-display text-[24px] font-normal sm:text-[28px]">
              شرکت طراحی سایت و سئو؛ چرا باید کنار هم باشند
            </h2>
            <p className="text-[14.5px] leading-[2] text-dim">
              یه شرکت طراحی سایت که فقط ظاهر سایت رو می‌سازه، نیمی از کار رو انجام داده. بدون{" "}
              <Link href={landingHref("seoServices")} className="text-accent underline underline-offset-2">
                خدمات سئو
              </Link>
              ، سایت شما ممکنه زیبا باشه اما در نتایج جستجوی گوگل دیده نشه. به همین دلیل وب پیکاسو
              هم ساختار فنی هر سایت رو از روز اول برای سئو بهینه می‌کنه، و هم به‌صورت جداگانه خدمات
              سئوی مستمر (تولید محتوا، لینک‌سازی و بهینه‌سازی تکنیکال) رو برای رشد بلندمدت رتبه ارائه
              می‌ده. این ترکیب باعث می‌شه سرمایه‌گذاری روی طراحی سایت، واقعاً به ترافیک و مشتری
              تبدیل بشه، نه فقط یه ویترین دیجیتال بدون بازدیدکننده.
            </p>
          </Reveal>
        </div>
      </section>

      {/* مراحل همکاری */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-12">
            <h2 className="font-display text-[28px] font-normal sm:text-[34px] lg:text-[40px]">
              مراحل همکاری با شرکت طراحی سایت وب پیکاسو
            </h2>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              شش مرحله‌ی شفاف، از مشاوره‌ی اولیه تا پشتیبانی بعد از تحویل.
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

      {/* اشتباهات رایج + چرا ما + سفارش */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] bg-dot-grid" />
        <div className="relative z-[1] mx-auto max-w-container space-y-6 px-6">
          <Reveal className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">اشتباهات رایج در انتخاب شرکت طراحی سایت</h2>
            <p className="text-[14px] leading-[2] text-dim">
              رایج‌ترین اشتباه، انتخاب فقط بر اساس پایین‌ترین قیمته، بدون بررسی نمونه‌کار یا
              پشتیبانی بعد از تحویل. اشتباه دوم، امضای قرارداد بدون مشخص بودن دقیق تحویل سورس کامل
              پروژه. اشتباه سوم، اعتماد به وعده‌های شفاهی به‌جای پیشنهاد مکتوب. و اشتباه چهارم،
              نادیده گرفتن اینکه آیا سئو هم بخشی از خدمات شرکته یا نه، که در بلندمدت روی بازدهی
              سرمایه‌گذاری تاثیر زیادی می‌ذاره. وب پیکاسو دقیقاً برای رفع همین نگرانی‌ها، از همون
              ابتدا همه‌چیز رو مکتوب و شفاف اعلام می‌کنه.
            </p>
          </Reveal>
          <Reveal delay={60} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">چرا کسب‌وکارها وب پیکاسو را انتخاب می‌کنند</h2>
            <p className="text-[14px] leading-[2] text-dim">
              تفاوت اصلی وب پیکاسو، ارتباط مستقیم و بدون واسطه با مشتریه؛ شما با همون افرادی صحبت
              می‌کنید که واقعاً روی پروژه‌تون کار می‌کنن. هر پروژه با یه پیشنهاد مکتوب شروع می‌شه که
              دقیقاً مشخص می‌کنه چی ساخته می‌شه، چقدر طول می‌کشه و چقدر هزینه داره؛ بیشتر درباره‌ی
              تیم رو در{" "}
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
          <Reveal delay={120} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">سفارش طراحی سایت؛ چطور شروع کنیم</h2>
            <p className="text-[14px] leading-[2] text-dim">
              برای ثبت سفارش طراحی سایت، نیازی به تصمیم‌گیری کامل از قبل نیست؛ کافیه یه ایده‌ی کلی
              از کسب‌وکار و هدفتون داشته باشید. اول یه جلسه‌ی مشاوره‌ی رایگان برگزار می‌شه، بعد یه
              پیشنهاد مکتوب شامل قیمت و زمان‌بندی دریافت می‌کنید، و در صورت تایید، پروژه با پرداخت
              بیعانه شروع می‌شه. می‌تونید مستقیم از صفحه‌ی{" "}
              <Link href="/order" className="text-accent underline underline-offset-2">
                ثبت سفارش
              </Link>{" "}
              یه پلن انتخاب کنید یا از طریق فرم تماس هماهنگ کنید.
            </p>
          </Reveal>
          <Reveal delay={180} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">تفاوت شرکت طراحی سایت با آژانس دیجیتال مارکتینگ</h2>
            <p className="text-[14px] leading-[2] text-dim">
              خیلی‌ها این دو رو با هم اشتباه می‌گیرن. یه شرکت طراحی سایت تمرکزش روی ساخت خود
              سایته: طراحی، کدنویسی، امنیت و سئوی فنی. یه آژانس دیجیتال مارکتینگ بیشتر روی تبلیغات،
              مدیریت شبکه‌های اجتماعی و کمپین‌های تبلیغاتی کار می‌کنه، و معمولاً خود سایت رو از یه
              شرکت دیگه یا فریلنسر می‌گیره. بعضی مجموعه‌ها مثل وب پیکاسو، هم طراحی سایت و هم سئو رو
              زیر یه سقف انجام می‌دن، اما تبلیغات پولی و مدیریت شبکه‌ی اجتماعی جزو تخصص اصلیشون
              نیست؛ دونستن این تفاوت کمک می‌کنه انتظارات درستی از هر همکاری داشته باشید.
            </p>
          </Reveal>
          <Reveal delay={240} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">یک قرارداد خوب با شرکت طراحی سایت باید شامل چه مواردی باشد</h2>
            <p className="text-[14px] leading-[2] text-dim">
              قبل از پرداخت بیعانه، مطمئن بشید قرارداد یا پیشنهاد مکتوب شامل این موارد باشه: دامنه‌ی
              دقیق کار (چه صفحاتی، چه امکاناتی)، قیمت نهایی و مراحل پرداخت، زمان‌بندی تحویل، تعداد
              دورهای بازبینی رایگان، و مدت و شرایط پشتیبانی بعد از تحویل. نبود هر کدوم از این موارد
              در قرارداد، معمولاً بعداً به سوءتفاهم یا هزینه‌ی اضافه ختم می‌شه. یه شرکت طراحی سایت
              حرفه‌ای، خودش پیشنهاد می‌ده همه‌ی این نکات رو مکتوب کنید، نه اینکه شما مجبور باشید
              درخواستش کنید.
            </p>
          </Reveal>
          <Reveal delay={300} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">هزینه‌ی همکاری با شرکت طراحی سایت در مقابل فریلنسر</h2>
            <p className="text-[14px] leading-[2] text-dim">
              معمولاً قیمت یه فریلنسر تنها، پایین‌تر از یه شرکت طراحی سایته، چون هزینه‌ی سربار
              کمتری داره. اما این تفاوت قیمت باید در برابر ریسک‌های احتمالی سنجیده بشه: تاخیر در
              تحویل به‌خاطر مشغله‌ی شخصی فریلنسر، نبود پشتیبان در صورت غیرفعال شدن فریلنسر، و محدود
              بودن به یه تخصص. برای پروژه‌های کوچیک و ساده، فریلنسر می‌تونه انتخاب معقولی باشه؛ برای
              پروژه‌های مهم‌تر که به تداوم و پشتیبانی بلندمدت نیاز دارن، هزینه‌ی بیشتر یه شرکت،
              معمولاً در ازای امنیت و اطمینان بیشتر توجیه می‌شه.
            </p>
          </Reveal>
          <Reveal delay={360} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">نمونه‌کارهای شرکت طراحی سایت وب پیکاسو</h2>
            <p className="text-[14px] leading-[2] text-dim">
              تا امروز ده‌ها پروژه در صنف‌ها و حوزه‌های مختلف تحویل دادیم؛ از فروشگاه اینترنتی و
              سایت شرکتی گرفته تا سامانه‌های اختصاصی و پروژه‌های وردپرسی. می‌تونید نمونه‌کارهای
              قبلی رو تو بخش{" "}
              <Link href="/portfolio" className="text-accent underline underline-offset-2">
                پرتفولیو
              </Link>{" "}
              ببینید تا کیفیت کار و تنوع صنعت‌هایی که باهاشون کار کردیم رو از نزدیک بررسی کنید.
              دیدن نمونه‌کار واقعی، همیشه بهترین راه برای سنجیدن یه شرکت طراحی سایته، فارغ از هر
              ادعایی که در وب‌سایتش می‌خونید.
            </p>
          </Reveal>
          <Reveal delay={420} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">مقیاس تیم؛ آیا شرکت بزرگ‌تر همیشه بهتر است؟</h2>
            <p className="text-[14px] leading-[2] text-dim">
              خیلی‌ها فکر می‌کنن هرچی یه شرکت طراحی سایت بزرگ‌تر باشه، انتخاب بهتریه؛ اما بزرگ بودن
              همیشه به معنی کیفیت بالاتر یا توجه بیشتر به پروژه‌ی شما نیست. در شرکت‌های خیلی بزرگ،
              پروژه‌ی شما ممکنه بین چند لایه‌ی مدیریتی و واسطه رد و بدل بشه تا به تیم اجرایی برسه. در
              مقابل، یه تیم متوسط و متمرکز مثل وب پیکاسو، معمولاً ارتباط مستقیم‌تر و پاسخ‌گویی
              سریع‌تری داره. معیار درست انتخاب، اندازه‌ی تیم نیست؛ کیفیت نمونه‌کار، شفافیت فرایند و
              کیفیت ارتباطیه که در طول پروژه تجربه می‌کنید.
            </p>
          </Reveal>
          <Reveal delay={480} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">چطور نتیجه‌ی همکاری را ارزیابی کنیم</h2>
            <p className="text-[14px] leading-[2] text-dim">
              بعد از پایان پروژه، چند معیار کمک می‌کنه بفهمید همکاریتون با شرکت طراحی سایت موفق
              بوده یا نه: آیا زمان‌بندی وعده‌داده‌شده رعایت شد؛ آیا سورس کامل و مستندات لازم تحویل
              داده شد؛ آیا آموزش کافی برای مدیریت سایت گرفتید؛ و آیا بعد از تحویل هم پاسخ‌گویی تیم
              همون کیفیت اول رو حفظ کرده. اگه جواب همه‌ی این‌ها مثبته، احتمالاً با یه شرکت طراحی سایت
              قابل‌اعتماد کار کردید که ارزش معرفی به دیگران رو هم داره.
            </p>
          </Reveal>
          <Reveal delay={540} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">آیا همکاری با یک شرکت به معنی وابستگی همیشگی است؟</h2>
            <p className="text-[14px] leading-[2] text-dim">
              نه، اگه شرکت طراحی سایت سورس کامل پروژه رو بهتون بده، هیچ وابستگی اجباری بهش ندارید؛
              می‌تونید در آینده با همون تیم ادامه بدید، تیم دیگه‌ای رو انتخاب کنید، یا حتی بخشی از
              کارها رو داخلی مدیریت کنید. این استقلال دقیقاً یکی از تفاوت‌های مهم بین یه همکاری
              حرفه‌ای و یه وابستگی پنهان به یه پلتفرم یا شخص خاصه؛ برای همین مالکیت کامل کد، یکی از
              مهم‌ترین شرط‌هایی هست که باید قبل از شروع هر پروژه مطمئن بشید در قرارداد قید شده.
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
                سوالات متداول درباره‌ی شرکت طراحی سایت
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
              پروژه‌ی طراحی سایت خود را با ما شروع کنید
            </h2>
            <p className="max-w-[60ch] text-[14.5px] leading-[2] text-dim">
              چه دنبال{" "}
              <Link href={landingHref("storeDesign")} className="text-accent underline underline-offset-2">
                فروشگاه آنلاین
              </Link>{" "}
              باشید، چه{" "}
              <Link href={landingHref("corporateDesign")} className="text-accent underline underline-offset-2">
                سایت شرکتی
              </Link>
              ، چه یه{" "}
              <Link href={landingHref("customDesign")} className="text-accent underline underline-offset-2">
                سامانه‌ی اختصاصی
              </Link>
              ، تیم وب پیکاسو آماده‌ست همراهتون باشه. برای دیدن{" "}
              <Link href={landingHref("websitePrice")} className="text-accent underline underline-offset-2">
                جدول کامل قیمت‌ها
              </Link>{" "}
              یا آشنایی با پایه‌های{" "}
              <Link href={landingHref("websiteDesign")} className="text-accent underline underline-offset-2">
                طراحی سایت
              </Link>{" "}
              هم می‌تونید همین حالا صفحات مربوطه رو ببینید.
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/order"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-[14.5px] font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
              >
                مشاهده‌ی همه‌ی خدمات
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
            <h2 className="font-display text-[22px] font-normal sm:text-[26px]">خدمات مرتبط با شرکت طراحی سایت</h2>
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
