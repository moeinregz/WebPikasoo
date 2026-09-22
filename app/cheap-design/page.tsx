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
const pageUrl = "/cheap-design";

export const metadata = {
  title: "طراحی سایت ارزان و حرفه‌ای | قیمت شفاف | وب پیکاسو",
  description:
    "طراحی سایت ارزان با کیفیت حرفه‌ای، از ۲۵ میلیون تومان — بدون افت کیفیت، بدون هزینه‌ی پنهان. در تهران، مشهد، تبریز، اردبیل و سراسر کشور.",
  alternates: { canonical: pageUrl },
  openGraph: {
    url: pageUrl,
    title: "طراحی سایت ارزان و حرفه‌ای | قیمت شفاف | وب پیکاسو",
    description: "طراحی سایت ارزان با کیفیت حرفه‌ای، از ۲۵ میلیون تومان — بدون افت کیفیت، بدون هزینه‌ی پنهان.",
  },
};

/* ---------------------------------------------------------------------- */

type Row = { plan: string; price: string; note: string };
const wpPlans: Row[] = [
  { plan: "استارتاپ (اقتصادی)", price: "از ۲۵ میلیون تومان", note: "سایت معرفی کوچک، صفحات اصلی، طراحی حرفه‌ای" },
  { plan: "کسب‌وکار", price: "از ۳۸ میلیون تومان", note: "UI اختصاصی، تا ۱۲ صفحه، سئوی داخلی" },
  { plan: "فروشگاهی", price: "از ۴۷ میلیون تومان", note: "ووکامرس کامل، درگاه پرداخت، محصول نامحدود" },
];

type Benefit = { title: string; desc: ReactNode; icon: ReactNode };

const included: Benefit[] = [
  {
    title: "طراحی حرفه‌ای، نه قالب کپی‌شده",
    desc: "حتی در پلن اقتصادی، ظاهر سایت مطابق برند شما تنظیم می‌شه؛ ارزان بودن به معنی قالب یکسان با هزاران سایت دیگه نیست.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M9 6 3 12l6 6M15 6l6 6-6 6" />
      </svg>
    ),
  },
  {
    title: "سرعت و سئوی پایه رعایت‌شده",
    desc: "بهینه‌سازی تصاویر و ساختار سئوی فنی، حتی در پلن اقتصادی، جزو استاندارد کارمونه.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
      </svg>
    ),
  },
  {
    title: "بدون هزینه‌ی پنهان",
    desc: "قیمت از همون ابتدا شفاف و مکتوبه؛ چیزی به‌عنوان هزینه‌ی اضافه‌ی غیرمنتظره در وسط پروژه اضافه نمی‌شه.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M4 12a8 8 0 0 1 16 0" />
        <rect x="2.5" y="12" width="4" height="6" rx="1.5" />
        <rect x="17.5" y="12" width="4" height="6" rx="1.5" />
      </svg>
    ),
  },
  {
    title: "پنل مدیریت ساده",
    desc: "با وردپرس، خودتون بدون دانش فنی می‌تونید محتوا و تصاویر رو مدیریت کنید و در آینده هزینه‌ی کمتری بدید.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    title: "پشتیبانی بعد از تحویل",
    desc: "حتی پلن اقتصادی شامل گارانتی رفع باگه؛ ارزان‌تر بودن به معنی رها شدن بعد از تحویل نیست.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
      </svg>
    ),
  },
  {
    title: "قابلیت ارتقا در آینده",
    desc: "می‌تونید با پلن اقتصادی شروع کنید و بعداً با رشد کسب‌وکار، امکانات یا فروشگاه اضافه کنید.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z" />
      </svg>
    ),
  },
];

type Step = { n: string; title: string; desc: string };
const steps: Step[] = [
  { n: "۰۱", title: "مشاوره و تعیین محدوده", desc: "بررسی می‌کنیم دقیقاً چه صفحات و امکاناتی نیاز دارید تا هزینه فقط صرف همون بشه." },
  { n: "۰۲", title: "انتخاب پلن اقتصادی", desc: "بر اساس نیاز واقعی، مناسب‌ترین پلن (معمولاً استارتاپ وردپرس) پیشنهاد می‌شه." },
  { n: "۰۳", title: "طراحی سریع و هدفمند", desc: "طراحی روی صفحات ضروری تمرکز می‌کنه، بدون صرف وقت روی جزئیات غیرضروری." },
  { n: "۰۴", title: "پیاده‌سازی روی وردپرس", desc: "استفاده از یه هسته‌ی آماده، زمان و هزینه‌ی توسعه رو پایین نگه می‌داره." },
  { n: "۰۵", title: "تست و بهینه‌سازی پایه", desc: "سرعت و سئوی فنی، حتی در پلن اقتصادی، قبل از تحویل بررسی می‌شه." },
  { n: "۰۶", title: "تحویل و آموزش کوتاه", desc: "آموزش سریع مدیریت سایت رو می‌دیم تا خودتون بتونید بدون هزینه‌ی اضافه ادامه بدید." },
];

const faqs: { q: string; a: string }[] = [
  {
    q: "طراحی سایت ارزان یعنی چه؟",
    a: "طراحی سایت ارزان یعنی دریافت یه سایت حرفه‌ای با کمترین هزینه‌ی ممکن، از طریق حذف امکانات غیرضروری و استفاده از یه هسته‌ی آماده مثل وردپرس؛ نه حذف کیفیت طراحی، امنیت یا پشتیبانی.",
  },
  {
    q: "هزینه‌ی طراحی سایت ارزان چقدر است؟",
    a: "اقتصادی‌ترین پلن واقعی طراحی سایت در وب پیکاسو، پلن استارتاپ وردپرس با شروع از بیست و پنج میلیون تومانه؛ شامل صفحات اصلی، طراحی حرفه‌ای و پشتیبانی بعد از تحویل.",
  },
  {
    q: "آیا طراحی سایت ارزان و فوری با هم ممکن است؟",
    a: "تا حدی بله؛ محدود کردن تعداد صفحات و استفاده از وردپرس، هم هزینه و هم زمان تحویل رو پایین میاره. اما تحویل خیلی فشرده‌تر از حد معقول، معمولاً به قیمت افت کیفیت طراحی یا تست ناقص تموم می‌شه؛ برای همین همیشه یه حداقل زمان منطقی برای کار درست لازمه.",
  },
  {
    q: "تفاوت طراحی سایت ارزان با طراحی سایت حرفه‌ای چیست؟",
    a: "تفاوت اصلی در دامنه‌ی کار و امکاناته، نه لزوماً در کیفیت پایه: پلن ارزان صفحات و امکانات محدودتری داره و از قالب پایه‌ی سفارشی‌شده استفاده می‌کنه، در حالی که پلن‌های بالاتر شامل طراحی کاملاً اختصاصی، صفحات بیشتر و امکانات پیشرفته‌تری هستن. اما اصول پایه مثل امنیت، سرعت و پشتیبانی، در همه‌ی پلن‌ها رعایت می‌شه.",
  },
  {
    q: "آیا خرید سایت ارزان قیمت آماده به‌جای طراحی اختصاصی بهتر است؟",
    a: "سایت‌های آماده یا اسکریپت‌های ارزان معمولاً در نگاه اول جذاب‌ترن، اما اغلب ظاهر تکراری، کدنویسی ضعیف و امنیت پایینی دارن و پشتیبانی مشخصی هم پشتشون نیست. یه طراحی سایت ارزان اما اصولی، حتی با هزینه‌ی مشابه، معمولاً کیفیت و پشتیبانی به‌مراتب بهتری می‌ده.",
  },
  {
    q: "آیا طراحی سایت ارزان با وردپرس ممکن است؟",
    a: "بله، وردپرس دقیقاً همون مسیریه که هزینه‌ی طراحی سایت رو پایین میاره، چون به‌جای کدنویسی از صفر، از یه هسته‌ی آماده و امتحان‌پس‌داده استفاده می‌شه.",
  },
  {
    q: "قیمت سایت آماده در مقابل طراحی سایت ارزان اختصاصی چقدر فرق دارد؟",
    a: "قیمت یه سایت کاملاً آماده ممکنه در نگاه اول پایین‌تر به نظر برسه، اما معمولاً هزینه‌های پنهان مثل خرید مجدد قالب، رفع مشکلات امنیتی یا نبود پشتیبانی، در بلندمدت این تفاوت قیمت رو جبران می‌کنه یا حتی بیشتر می‌کنه.",
  },
  {
    q: "آیا برای شهرهایی مثل مشهد، تبریز و اردبیل هم طراحی سایت ارزان ارائه می‌دهید؟",
    a: "بله، چون فرایند به‌صورت کاملاً آنلاین انجام می‌شه، همون پلن اقتصادی و همون کیفیت برای مشتری‌ها در مشهد، تبریز، اردبیل، تهران و هر شهر دیگه‌ای در ایران یکسانه.",
  },
  {
    q: "آیا بعد از تحویل طراحی سایت ارزان هم پشتیبانی داریم؟",
    a: "بله، حتی پلن اقتصادی شامل گارانتی رفع باگ و پشتیبانی فنی بعد از تحویله؛ ارزان بودن قیمت به معنی حذف پشتیبانی نیست.",
  },
  {
    q: "چطور سفارش طراحی سایت ارزان را ثبت کنم؟",
    a: "کافیه از صفحه‌ی ثبت سفارش، پلن استارتاپ وردپرس رو انتخاب کنید یا از طریق فرم تماس با تیم ما هماهنگ کنید تا دقیق‌ترین پیشنهاد رو بر اساس نیازتون دریافت کنید.",
  },
  {
    q: "آیا می‌توان بعداً از پلن ارزان به پلن بزرگ‌تر ارتقا داد؟",
    a: "بله، خیلی از مشتری‌ها همین مسیر رو طی می‌کنن؛ با پلن استارتاپ شروع می‌کنن و بعد از رشد کسب‌وکار، امکانات یا فروشگاه به سایتشون اضافه می‌شه.",
  },
  {
    q: "آیا طراحی سایت ارزان شامل دامنه و هاست هم می‌شود؟",
    a: "هزینه‌ی طراحی معمولاً جدا از هزینه‌ی سالانه‌ی دامنه و هاسته؛ در صورت نیاز، در انتخاب گزینه‌ی مناسب و اقتصادی هم راهنماییتون می‌کنیم.",
  },
];

/* ---------------------------------------------------------------------- */

export default async function CheapDesignPage() {
  const isLoggedIn = !!(await getCurrentUser());

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        serviceType: "طراحی سایت ارزان",
        name: "طراحی سایت ارزان و حرفه‌ای",
        description: "طراحی سایت ارزان با کیفیت حرفه‌ای، از بیست و پنج میلیون تومان، بدون افت کیفیت.",
        provider: { "@type": "Organization", name: "وب پیکاسو", url: siteUrl },
        areaServed: "IR",
        url: `${siteUrl}${pageUrl}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "خانه", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "طراحی سایت", item: `${siteUrl}${landingHref("websiteDesign")}` },
          { "@type": "ListItem", position: 3, name: "طراحی سایت ارزان", item: `${siteUrl}${pageUrl}` },
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
        eyebrow="Affordable Website Design"
        title="طراحی سایت ارزان و حرفه‌ای"
        desc="طراحی سایت ارزان یعنی رسیدن به یه سایت حرفه‌ای با کمترین هزینه‌ی منطقی، نه حذف کیفیت. با پلن اقتصادی وردپرس از بیست و پنج میلیون تومان، بدون هزینه‌ی پنهان و با پشتیبانی کامل بعد از تحویل."
      >
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/order?category=wordpress"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-[14.5px] font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
          >
            مشاهده‌ی پلن اقتصادی و ثبت سفارش
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
              طراحی سایت ارزان دقیقاً یعنی چه؟
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Reveal className="rounded-card border border-ink/10 bg-surface/50 p-6 text-[14.5px] leading-[2] text-dim lg:col-span-1">
              <strong className="text-ink">
                طراحی سایت ارزان یعنی رسیدن به یه سایت حرفه‌ای با کمترین هزینه‌ی منطقی، از طریق
                محدود کردن دامنه‌ی کار و استفاده از یه هسته‌ی آماده مثل وردپرس، نه حذف کیفیت.
              </strong>{" "}
              فرق مهمیه بین «ارزان اصولی» و «ارزان بی‌کیفیت»؛ اولی یعنی حذف هزینه‌های اضافی
              غیرضروری، دومی یعنی حذف چیزهایی که واقعاً بهشون نیاز دارید.
            </Reveal>
            <Reveal delay={80} className="rounded-card border border-ink/10 bg-surface/50 p-6 text-[14.5px] leading-[2] text-dim lg:col-span-1">
              یه سایت واقعاً ارزان و اصولی، از کدنویسی اختصاصی صرف‌نظر می‌کنه و به‌جاش از وردپرس
              استفاده می‌کنه، تعداد صفحات رو به موارد ضروری محدود می‌کنه، و روی طراحی گرافیکی خیلی
              پیچیده وقت نمی‌ذاره. اما امنیت، سرعت پایه و پشتیبانی بعد از تحویل، همچنان باید رعایت
              بشن؛ این‌ها چیزهایی نیستن که بشه حذفشون کرد بدون ریسک جدی.
            </Reveal>
            <Reveal delay={160} className="rounded-card border border-ink/10 bg-surface/50 p-6 text-[14.5px] leading-[2] text-dim lg:col-span-1">
              وب پیکاسو این نوع خدمات رو فقط وقتی ارائه می‌ده که واقعاً بتونه یه پیشنهاد اقتصادی و
              درست همزمان بده؛ پلن استارتاپ وردپرس دقیقاً همین تعادله. اگه نیاز پروژه‌ی شما با این
              پلن جور در نیاد، صادقانه بهتون می‌گیم و پلن مناسب‌تری پیشنهاد می‌دیم، نه اینکه یه
              خدمت ناقص رو زیر عنوان «ارزان» بفروشیم.
            </Reveal>
          </div>
        </div>
      </section>

      {/* تفاوت ارزان با حرفه‌ای */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] bg-dot-grid" />
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mx-auto max-w-[820px] rounded-card border border-ink/10 bg-surface/50 p-7 sm:p-10">
            <h2 className="mb-4 font-display text-[24px] font-normal sm:text-[28px]">
              تفاوت طراحی سایت ارزان با طراحی سایت حرفه‌ای
            </h2>
            <p className="text-[14.5px] leading-[2] text-dim">
              <strong className="text-ink">
                تفاوت اصلی در دامنه‌ی کار و سطح سفارشی‌سازیه، نه در رعایت یا عدم رعایت اصول پایه.
              </strong>{" "}
              طراحی سایت ارزان معمولاً شامل تعداد صفحات محدودتر، استفاده از قالب پایه‌ی
              سفارشی‌شده به‌جای طراحی کاملاً از صفر، و امکانات استاندارد به‌جای ویژگی‌های خیلی
              خاصه. طراحی سایت حرفه‌ای و گران‌تر، شامل طراحی گرافیکی کاملاً اختصاصی، صفحات و
              بخش‌های بیشتر، و گاهی کدنویسی اختصاصی به‌جای وردپرسه. اما چیزهایی مثل گواهی امنیتی،
              سرعت پایه‌ی قابل‌قبول و پشتیبانی بعد از تحویل، باید در هر دو سطح قیمتی رعایت بشه؛ اگه
              یه پیشنهاد «ارزان» این موارد پایه رو هم نداشته باشه، اون دیگه ارزان نیست، ناقصه.
            </p>
          </Reveal>
        </div>
      </section>

      {/* پلن اقتصادی — جدول واقعی */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-10">
            <h2 className="font-display text-[26px] font-normal sm:text-[32px]">
              هزینه‌ی طراحی سایت ارزان چقدر است؟
            </h2>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              <strong className="text-ink">
                اقتصادی‌ترین پلن واقعی، پلن استارتاپ وردپرس با شروع از بیست و پنج میلیون تومانه.
              </strong>{" "}
              برای مقایسه، دو پلن بالاتر وردپرس رو هم می‌بینید.
            </p>
          </Reveal>
          <div className="overflow-x-auto rounded-card border border-ink/10">
            <table className="w-full min-w-[520px] border-collapse text-right text-[13.5px]">
              <thead>
                <tr className="border-b border-ink/10 bg-surface">
                  <th className="px-4 py-3 font-bold text-ink">پلن</th>
                  <th className="px-4 py-3 font-bold text-ink">قیمت</th>
                  <th className="px-4 py-3 font-bold text-ink">شامل</th>
                </tr>
              </thead>
              <tbody>
                {wpPlans.map((r, i) => (
                  <tr key={r.plan} className={`border-b border-ink/10 last:border-0 ${i === 0 ? "bg-accent/5" : "odd:bg-surface/30"}`}>
                    <td className="px-4 py-3 font-bold text-ink">
                      {r.plan}
                      {i === 0 && (
                        <span className="mr-2 rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-bold text-accent">
                          اقتصادی‌ترین
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold text-accent">{r.price}</td>
                    <td className="px-4 py-3 text-dim">{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-[13px] text-dim">
            برای دیدن جدول کامل تعرفه‌ها، صفحه‌ی{" "}
            <Link href={landingHref("websitePrice")} className="text-accent underline underline-offset-2">
              قیمت طراحی سایت
            </Link>{" "}
            را ببینید یا مستقیم{" "}
            <Link href="/order?category=wordpress" className="text-accent underline underline-offset-2">
              پلن استارتاپ را سفارش دهید
            </Link>
            .
          </p>
        </div>
      </section>

      {/* چی شامل پلن اقتصادی می‌شود */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] bg-dot-grid" />
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-12">
            <h2 className="font-display text-[28px] font-normal sm:text-[34px] lg:text-[40px]">
              چرا طراحی سایت ارزان لزوماً بی‌کیفیت نیست
            </h2>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              شش چیزی که حتی در پلن اقتصادی وب پیکاسو حذف نمی‌شه.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {included.map((f, i) => (
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

      {/* پاسخ‌های تخصصی */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container space-y-6 px-6">
          <Reveal className="mb-4">
            <h2 className="font-display text-[28px] font-normal sm:text-[34px] lg:text-[40px]">
              پاسخ به رایج‌ترین سوالات طراحی سایت ارزان
            </h2>
          </Reveal>

          <Reveal className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h3 className="mb-2 text-[16.5px] font-bold text-ink">خرید سایت ارزان قیمت یا سایت آماده؛ کدام بهتر است؟</h3>
            <p className="text-[14px] leading-[2] text-dim">
              <strong className="text-ink">
                خرید یه سایت آماده یا اسکریپت ارزان، معمولاً از طراحی سایت ارزان اصولی ارزون‌تر به
                نظر می‌رسه، اما ریسک بیشتری هم داره.
              </strong>{" "}
              قیمت سایت آماده اغلب شامل کدنویسی سطحی، ظاهر تکراری بین هزاران خریدار دیگه، و نبود
              پشتیبانی مشخصه. یه طراحی سایت ارزان اصولی، حتی با هزینه‌ی مشابه یا کمی بیشتر، ظاهر
              اختصاصی، امنیت پایه و پشتیبانی واقعی رو تضمین می‌کنه؛ در بلندمدت این تفاوت به نفع
              گزینه‌ی دوم تموم می‌شه.
            </p>
          </Reveal>

          <Reveal delay={60} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h3 className="mb-2 text-[16.5px] font-bold text-ink">طراحی سایت ارزان با وردپرس چگونه هزینه را پایین می‌آورد؟</h3>
            <p className="text-[14px] leading-[2] text-dim">
              <strong className="text-ink">
                وردپرس هزینه رو پایین میاره چون به‌جای کدنویسی هر بخش از صفر، از یه هسته‌ی آماده و
                امتحان‌پس‌داده استفاده می‌شه.
              </strong>{" "}
              زمان توسعه کمتر می‌شه، و همین کاهش زمان مستقیماً روی قیمت نهایی اثر می‌ذاره. برای
              آشنایی کامل‌تر با این مسیر، صفحه‌ی{" "}
              <Link href={landingHref("wordpressDesign")} className="text-accent underline underline-offset-2">
                طراحی سایت وردپرس
              </Link>{" "}
              رو ببینید.
            </p>
          </Reveal>

          <Reveal delay={120} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h3 className="mb-2 text-[16.5px] font-bold text-ink">آیا طراحی سایت ارزان فروشگاهی هم امکان‌پذیر است؟</h3>
            <p className="text-[14px] leading-[2] text-dim">
              <strong className="text-ink">
                پلن اقتصادی وردپرس بیشتر برای سایت‌های معرفی طراحی شده، نه فروشگاه کامل.
              </strong>{" "}
              اگه نیاز شما خرید سایت فروشگاهی با درگاه پرداخت و مدیریت موجودیه، پلن فروشگاهی (از
              چهل و هفت میلیون تومان) گزینه‌ی واقع‌بینانه‌تریه؛ برای جزئیات کامل صفحه‌ی{" "}
              <Link href={landingHref("storeDesign")} className="text-accent underline underline-offset-2">
                طراحی سایت فروشگاهی
              </Link>{" "}
              رو ببینید. فروشگاهی که با کمترین هزینه‌ی ممکن و بدون درگاه پرداخت امن ساخته بشه،
              معمولاً به ضرر خود کسب‌وکار تموم می‌شه.
            </p>
          </Reveal>
        </div>
      </section>

      {/* شهرها */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] bg-dot-grid" />
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">طراحی سایت ارزان در تهران، مشهد، تبریز و اردبیل</h2>
            <p className="text-[14px] leading-[2] text-dim">
              <strong className="text-ink">
                پلن اقتصادی وب پیکاسو برای همه‌ی شهرهای ایران، از جمله تهران، مشهد، تبریز و اردبیل،
                با قیمت و کیفیت یکسان قابل سفارشه.
              </strong>{" "}
              چون کل فرایند از مشاوره تا تحویل به‌صورت آنلاین انجام می‌شه، فاصله‌ی جغرافیایی هیچ
              تاثیری روی قیمت نهایی یا سرعت پاسخ‌گویی نداره. کسب‌وکارهای کوچک در شهرستان‌ها، که
              معمولاً بودجه‌ی محدودتری دارن، از همین پلن استارتاپ بیشترین استفاده رو می‌برن.
            </p>
          </Reveal>
        </div>
      </section>

      {/* مراحل */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-12">
            <h2 className="font-display text-[28px] font-normal sm:text-[34px] lg:text-[40px]">
              مراحل دریافت طراحی سایت اقتصادی
            </h2>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              شش مرحله‌ی ساده که هزینه رو پایین نگه می‌داره، بدون افت کیفیت پایه.
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

      {/* نکات کاهش هزینه بدون افت کیفیت */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-8">
            <h2 className="font-display text-[26px] font-normal sm:text-[32px]">
              چطور بدون افت کیفیت، هزینه را پایین نگه داریم
            </h2>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              شش نکته‌ی عملی برای گرفتن یه طراحی سایت ارزان اما اصولی.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              "تعداد صفحات رو به موارد واقعاً ضروری محدود کنید، نه هر چیزی که «شاید لازم بشه»",
              "به‌جای کدنویسی اختصاصی، مسیر وردپرس رو برای شروع انتخاب کنید",
              "محتوای اولیه (متن و تصاویر) رو خودتون آماده کنید تا هزینه‌ی تولید محتوا کم بشه",
              "طراحی گرافیکی کاملاً سفارشی رو برای مرحله‌ی بعد از رشد کسب‌وکار نگه دارید",
              "قبل از سفارش، مطمئن بشید امنیت پایه و پشتیبانی جزو پیشنهاده، نه یه گزینه‌ی اضافه",
              "پیشنهاد قیمت رو مکتوب بگیرید تا بعداً هزینه‌ی غیرمنتظره اضافه نشه",
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

      {/* اشتباهات رایج + سفارش */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] bg-dot-grid" />
        <div className="relative z-[1] mx-auto max-w-container space-y-6 px-6">
          <Reveal className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">اشتباهات رایج در انتخاب طراحی سایت ارزان</h2>
            <p className="text-[14px] leading-[2] text-dim">
              رایج‌ترین اشتباه، توقف انتخاب صرفاً روی پایین‌ترین عدد، بدون پرسیدن دقیقاً چی شامل اون
              قیمته. اشتباه دوم، اعتماد به قیمت‌های غیرواقعی و خیلی پایین‌تر از میانگین بازار، که
              معمولاً یا کیفیت پایینی داره یا بعداً هزینه‌ی پنهان اضافه می‌کنه. اشتباه سوم، نادیده
              گرفتن امنیت و پشتیبانی به بهانه‌ی صرفه‌جویی، در حالی که رفع مشکلات بعدی معمولاً از
              همون ابتدا گرون‌تر تموم می‌شه. و اشتباه چهارم، عدم دریافت پیشنهاد مکتوب، که مسیر باز
              برای اختلاف قیمت در وسط پروژه‌ست. وب پیکاسو پلن اقتصادی رو دقیقاً با در نظر گرفتن این
              ریسک‌ها طراحی کرده تا هیچ‌کدومشون پیش نیاد.
            </p>
          </Reveal>
          <Reveal delay={60} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">سفارش طراحی سایت ارزان؛ چطور شروع کنیم</h2>
            <p className="text-[14px] leading-[2] text-dim">
              برای سفارش، کافیه یه توضیح کوتاه از کسب‌وکار و صفحاتی که نیاز دارید بدید. تیم ما بر
              اساس همین اطلاعات، بررسی می‌کنه پلن استارتاپ جوابگوی نیازتونه یا نه، و در صورت نیاز
              به امکانات بیشتر، صادقانه پلن مناسب‌تری پیشنهاد می‌ده. می‌تونید از صفحه‌ی{" "}
              <Link href="/order?category=wordpress" className="text-accent underline underline-offset-2">
                ثبت سفارش
              </Link>{" "}
              شروع کنید یا از طریق فرم تماس هماهنگ کنید.
            </p>
          </Reveal>
          <Reveal delay={120} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">نمونه‌کار طراحی سایت ارزان وب پیکاسو</h2>
            <p className="text-[14px] leading-[2] text-dim">
              پلن استارتاپ برای کسب‌وکارهای کوچیک، فروشگاه‌های محلی و افراد مستقلی طراحی شده که
              می‌خوان با کمترین هزینه، یه حضور آنلاین رسمی و حرفه‌ای داشته باشن. برای دیدن نمونه‌ی
              پروژه‌های ساده و اقتصادی قبلی، می‌تونید بخش{" "}
              <Link href="/portfolio" className="text-accent underline underline-offset-2">
                پرتفولیو
              </Link>{" "}
              رو ببینید. دیدن نمونه‌کار واقعی، بهترین راه برای اطمینان از اینه که پلن اقتصادی هم
              کیفیت قابل‌قبولی داره، نه فقط یه وعده‌ی تبلیغاتی.
            </p>
          </Reveal>
          <Reveal delay={180} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">چرا وب پیکاسو این پلن اقتصادی را ارائه می‌دهد</h2>
            <p className="text-[14px] leading-[2] text-dim">
              خیلی از کسب‌وکارهای کوچیک و تازه‌کار، در همون ابتدا بودجه‌ی کافی برای یه پروژه‌ی بزرگ
              ندارن، اما همچنان به یه سایت حرفه‌ای برای شروع نیاز دارن. وب پیکاسو پلن استارتاپ رو
              دقیقاً برای پر کردن همین شکاف طراحی کرده: بدون سود صفر یا کیفیت پایین، بلکه با حذف
              هوشمندانه‌ی هزینه‌های غیرضروری. هدف اینه که کسب‌وکار شما بتونه شروع کنه، رشد کنه، و در
              آینده در صورت نیاز، به پلن‌های بزرگ‌تر ارتقا پیدا کنه؛ نه اینکه از همون اول با یه سایت
              ضعیف گیر بیفته.
            </p>
          </Reveal>
          <Reveal delay={240} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">چطور نتیجه‌ی طراحی سایت ارزان را ارزیابی کنیم</h2>
            <p className="text-[14px] leading-[2] text-dim">
              بعد از تحویل، چند معیار کمکتون می‌کنه بفهمید پلن اقتصادی‌تون واقعاً اصولی انجام شده یا
              نه: اول، آیا سایت روی موبایل هم درست نمایش داده می‌شه؛ دوم، آیا سرعت بارگذاری در حد
              قابل‌قبولیه؛ سوم، آیا گواهی SSL و امنیت پایه فعاله؛ و چهارم، آیا خودتون می‌تونید بدون
              دانش فنی، محتوا رو مدیریت کنید. اگه جواب همه‌ی این‌ها مثبته، یعنی طراحی سایت ارزانی که
              گرفتید، واقعاً اصولی بوده، نه فقط ارزان.
            </p>
          </Reveal>
          <Reveal delay={300} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">بودجه‌بندی طراحی سایت برای استارتاپ‌ها و کسب‌وکارهای نوپا</h2>
            <p className="text-[14px] leading-[2] text-dim">
              برای یه کسب‌وکار تازه‌تاسیس، معمولاً منطقی‌تره که بودجه‌ی محدود اولیه رو بین چند بخش
              مختلف تقسیم کنید، نه اینکه همه‌ش رو صرف یه سایت خیلی پیچیده کنید. یه سایت اقتصادی و
              حرفه‌ای، همراه با کمی بودجه‌ی باقی‌مونده برای تبلیغات اولیه یا سئوی پایه، معمولاً
              نتیجه‌ی بهتری نسبت به خرج کردن همه‌ی بودجه فقط روی طراحی سایت می‌ده. با رشد فروش و
              درآمد، همیشه وقت کافی برای سرمایه‌گذاری بیشتر روی سایت و امکانات پیشرفته‌تر هست.
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
                سوالات متداول درباره‌ی طراحی سایت ارزان
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
              یک سایت ارزان و حرفه‌ای همین حالا شروع کنید
            </h2>
            <p className="max-w-[60ch] text-[14.5px] leading-[2] text-dim">
              اگه بودجه‌تون محدوده اما نمی‌خواید از کیفیت بگذرید، پلن استارتاپ{" "}
              <Link href={landingHref("wordpressDesign")} className="text-accent underline underline-offset-2">
                طراحی سایت وردپرس
              </Link>{" "}
              دقیقاً برای همین ساخته شده. برای دیدن بازه‌ی کامل قیمت‌ها، صفحه‌ی{" "}
              <Link href={landingHref("websitePrice")} className="text-accent underline underline-offset-2">
                قیمت طراحی سایت
              </Link>{" "}
              رو ببینید یا برای آشنایی با پایه‌های{" "}
              <Link href={landingHref("websiteDesign")} className="text-accent underline underline-offset-2">
                طراحی سایت
              </Link>{" "}
              صفحه‌ی اصلی این موضوع رو مرور کنید.
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/order?category=wordpress"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-[14.5px] font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
              >
                مشاهده‌ی پلن اقتصادی
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
          </Reveal>
        </div>
      </section>

      {/* خدمات مرتبط — فقط ۳ لینک طبق نقشه‌ی کلاستر */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-8">
            <h2 className="font-display text-[22px] font-normal sm:text-[26px]">خدمات مرتبط با طراحی سایت ارزان</h2>
          </Reveal>
          <div className="flex flex-wrap gap-3">
            <Link href={landingHref("websiteDesign")} className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-surface px-4 py-2 text-[13.5px] font-semibold text-dim transition hover:border-accent hover:text-accent">
              طراحی سایت
            </Link>
            <Link href={landingHref("wordpressDesign")} className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-surface px-4 py-2 text-[13.5px] font-semibold text-dim transition hover:border-accent hover:text-accent">
              طراحی سایت وردپرس
            </Link>
            <Link href={landingHref("websitePrice")} className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-surface px-4 py-2 text-[13.5px] font-semibold text-dim transition hover:border-accent hover:text-accent">
              قیمت طراحی سایت
            </Link>
          </div>
        </div>
      </section>

      <Contact />
      <Footer />
    </>
  );
}
