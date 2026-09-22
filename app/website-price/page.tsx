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
const pageUrl = "/website-price";

export const metadata = {
  title: "قیمت طراحی سایت در ۱۴۰۵ | جدول کامل تعرفه‌ها | وب پیکاسو",
  description:
    "جدول کامل قیمت طراحی سایت در سال ۱۴۰۵: فروشگاهی، شرکتی، اختصاصی و وردپرس. تعرفه‌ی دقیق هر پلن، عوامل موثر بر قیمت و پاسخ به رایج‌ترین سوالات هزینه.",
  alternates: { canonical: pageUrl },
  openGraph: {
    url: pageUrl,
    title: "قیمت طراحی سایت در ۱۴۰۵ | جدول کامل تعرفه‌ها | وب پیکاسو",
    description:
      "جدول کامل قیمت طراحی سایت: فروشگاهی، شرکتی، اختصاصی و وردپرس، به همراه عوامل موثر بر تعرفه.",
  },
};

/* ---------------------------------------------------------------------- */
/* داده‌ی واقعی قیمت‌ها — از همان پلن‌های صفحه‌ی ثبت سفارش                    */
/* ---------------------------------------------------------------------- */

type Row = { plan: string; price: string; note: string; href: string };
type Table = { title: string; rows: Row[] };

const tables: Table[] = [
  {
    title: "وردپرس (سایت شرکتی و فروشگاهی)",
    rows: [
      { plan: "استارتاپ", price: "۲۵ میلیون تومان", note: "سایت معرفی کوچک، صفحات اصلی", href: "/order?category=wordpress" },
      { plan: "کسب‌وکار", price: "۳۸ میلیون تومان", note: "UI اختصاصی، تا ۱۲ صفحه، سئوی داخلی", href: "/order?category=wordpress" },
      { plan: "فروشگاهی", price: "۴۷ میلیون تومان", note: "ووکامرس کامل، درگاه پرداخت، محصول نامحدود", href: "/order?category=wordpress" },
    ],
  },
  {
    title: "کدنویسی اختصاصی",
    rows: [
      { plan: "پایه", price: "۵۸ میلیون تومان", note: "پروژه‌های کوچک و متوسط با نیاز مشخص", href: "/order?category=coding" },
      { plan: "پیشرفته", price: "۸۴ میلیون تومان", note: "چند ماژول، یکپارچه‌سازی با سامانه‌های بیرونی", href: "/order?category=coding" },
      { plan: "اختصاصی / سازمانی", price: "توافقی", note: "سامانه‌ی سازمانی بزرگ با نیاز منحصربه‌فرد", href: "/order?category=coding" },
    ],
  },
  {
    title: "توسعه‌ی نرم‌افزار و پنل مدیریت",
    rows: [
      { plan: "پنل ساده", price: "۸۲ میلیون تومان", note: "پنل تک‌کاربره، مدیریت محتوا و محصول", href: "/order?category=software" },
      { plan: "پنل حرفه‌ای", price: "۱۷۸ میلیون تومان", note: "چند نقش کاربری، مدیریت سفارش و فاکتور", href: "/order?category=software" },
      { plan: "سیستم سازمانی", price: "توافقی", note: "معماری مقیاس‌پذیر، اتوماسیون و SLA اختصاصی", href: "/order?category=software" },
    ],
  },
  {
    title: "سئو و رشد ارگانیک (ماهانه)",
    rows: [
      { plan: "پایه", price: "۱۵ میلیون تومان / ماه", note: "سئوی داخلی صفحات اصلی، گزارش ماهانه", href: "/order?category=seo" },
      { plan: "حرفه‌ای", price: "۳۲ میلیون تومان / ماه", note: "تولید محتوا، لینک‌سازی، سئوی تکنیکال", href: "/order?category=seo" },
      { plan: "رقابتی / سازمانی", price: "توافقی", note: "استراتژی رقابتی، تیم اختصاصی", href: "/order?category=seo" },
    ],
  },
];

const faqs: { q: string; a: string }[] = [
  {
    q: "قیمت طراحی سایت در سال ۱۴۰۵ چقدر است؟",
    a: "در سال ۱۴۰۵، قیمت طراحی سایت وردپرسی از حدود ۲۵ میلیون تومان و طراحی سایت اختصاصی با کدنویسی از حدود ۵۸ میلیون تومان شروع می‌شه؛ جدول کامل تعرفه‌ها در همین صفحه موجوده و به‌روزرسانی می‌شه.",
  },
  {
    q: "قیمت طراحی سایت با کدنویسی چقدر است؟",
    a: "طراحی سایت با کدنویسی اختصاصی از حدود پنجاه و هشت میلیون تومان برای پلن پایه شروع می‌شه و برای پروژه‌های پیشرفته‌تر تا هشتاد و چهار میلیون تومان یا بیشتر می‌رسه؛ پروژه‌های سازمانی بزرگ قیمت توافقی دارن.",
  },
  {
    q: "قیمت طراحی سایت با وردپرس چقدر است؟",
    a: "طراحی سایت با وردپرس از بیست و پنج میلیون تومان برای پلن استارتاپ شروع می‌شه، پلن کسب‌وکار سی و هشت میلیون تومانه و پلن فروشگاهی با ووکامرس از چهل و هفت میلیون تومان شروع می‌شه.",
  },
  {
    q: "قیمت طراحی سایت فروشگاهی چقدر است؟",
    a: "قیمت طراحی سایت فروشگاهی با وردپرس و ووکامرس از چهل و هفت میلیون تومان شروع می‌شه؛ برای فروشگاه‌های اختصاصی با کدنویسی و حجم بالای محصول، قیمت از پلن‌های کدنویسی محاسبه می‌شه.",
  },
  {
    q: "قیمت طراحی سایت فروشگاهی با وردپرس چقدر است؟",
    a: "پلن فروشگاهی وردپرس شامل ووکامرس کامل، درگاه پرداخت، مدیریت موجودی و محصولات نامحدود، از چهل و هفت میلیون تومان شروع می‌شه.",
  },
  {
    q: "قیمت طراحی سایت شرکتی چقدر است؟",
    a: "قیمت طراحی سایت شرکتی با وردپرس بین بیست و پنج تا سی و هشت میلیون تومان است، بسته به تعداد صفحات و امکانات؛ برای شرکت‌هایی با نیاز فنی خاص، پلن‌های کدنویسی اختصاصی هم موجوده.",
  },
  {
    q: "قیمت طراحی سایت اختصاصی چقدر است؟",
    a: "قیمت طراحی سایت اختصاصی با کدنویسی خالص از پنجاه و هشت میلیون تومان شروع می‌شه و بسته به پیچیدگی پروژه تا هشتاد و چهار میلیون تومان یا بیشتر (توافقی برای پروژه‌های سازمانی) می‌رسه.",
  },
  {
    q: "هزینه‌ی طراحی سایت آموزشی چقدر است؟",
    a: "سایت‌های آموزشی معمولاً بر اساس ساختار سایت شرکتی (معرفی دوره‌ها، اساتید، تماس) یا فروشگاهی (ثبت‌نام و پرداخت آنلاین دوره) قیمت‌گذاری می‌شن؛ بسته به نیاز، از پلن کسب‌وکار وردپرس تا پلن فروشگاهی متغیره.",
  },
  {
    q: "جدول قیمت طراحی سایت کجاست؟",
    a: "جدول کامل قیمت طراحی سایت شامل پلن‌های وردپرس، کدنویسی اختصاصی، نرم‌افزار و سئو، در همین صفحه و در بخش «جدول قیمت طراحی سایت» قابل مشاهده‌ست.",
  },
  {
    q: "چطور می‌توانم قیمت دقیق پروژه‌ی خودم را بدانم؟",
    a: "بعد از یه جلسه‌ی مشاوره‌ی رایگان که در اون تعداد صفحات، امکانات موردنیاز و نوع پروژه بررسی می‌شه، یه پیشنهاد قیمت دقیق و مکتوب دریافت می‌کنید.",
  },
  {
    q: "آیا هزینه‌ی پنهان یا اضافه بعد از شروع پروژه وجود دارد؟",
    a: "نه، تمام هزینه‌ها قبل از شروع پروژه به‌صورت مکتوب اعلام می‌شه؛ هر تغییر یا افزونه‌ی جدید در طول پروژه هم قبل از اعمال، با هزینه‌ی مشخص به تایید شما می‌رسه.",
  },
  {
    q: "آیا امکان پرداخت اقساطی هزینه‌ی طراحی سایت وجود دارد؟",
    a: "بسته به نوع پروژه، پرداخت معمولاً در چند مرحله (بیعانه، میانی و تحویل نهایی) انجام می‌شه؛ جزئیات دقیق در قرارداد مشخص می‌شه.",
  },
  {
    q: "آیا هزینه‌ی دامنه و هاست در قیمت طراحی سایت حساب شده است؟",
    a: "هزینه‌ی طراحی سایت معمولاً جدا از هزینه‌ی سالانه‌ی دامنه و هاسته؛ در صورت نیاز، در انتخاب و تهیه‌ی گزینه‌ی مناسب هم راهنماییتون می‌کنیم.",
  },
  {
    q: "چرا قیمت طراحی سایت شرکت‌های مختلف با هم فرق دارد؟",
    a: "تفاوت قیمت معمولاً از تفاوت در کیفیت کدنویسی، سطح طراحی گرافیکی، مدت پشتیبانی و اینکه سورس کامل تحویل داده می‌شه یا نه، میاد؛ برای همین مقایسه فقط بر اساس عدد کافی نیست.",
  },
];

/* ---------------------------------------------------------------------- */

function PriceTable({ table }: { table: Table }) {
  return (
    <div className="overflow-x-auto rounded-card border border-ink/10">
      <table className="w-full min-w-[560px] border-collapse text-right text-[13.5px]">
        <thead>
          <tr className="border-b border-ink/10 bg-surface">
            <th className="px-4 py-3 font-bold text-ink">پلن</th>
            <th className="px-4 py-3 font-bold text-ink">قیمت</th>
            <th className="px-4 py-3 font-bold text-ink">شامل</th>
            <th className="px-4 py-3 font-bold text-ink">&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {table.rows.map((r) => (
            <tr key={r.plan} className="border-b border-ink/10 last:border-0 odd:bg-surface/30">
              <td className="px-4 py-3 font-bold text-ink">{r.plan}</td>
              <td className="px-4 py-3 font-bold text-accent">{r.price}</td>
              <td className="px-4 py-3 text-dim">{r.note}</td>
              <td className="px-4 py-3">
                <Link href={r.href} className="font-bold text-accent underline underline-offset-2">
                  سفارش
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function WebsitePricePage() {
  const isLoggedIn = !!(await getCurrentUser());

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        serviceType: "قیمت طراحی سایت",
        name: "جدول قیمت طراحی سایت وب پیکاسو",
        description: "جدول کامل قیمت طراحی سایت: فروشگاهی، شرکتی، اختصاصی، وردپرس، نرم‌افزار و سئو.",
        provider: { "@type": "Organization", name: "وب پیکاسو", url: siteUrl },
        areaServed: "IR",
        url: `${siteUrl}${pageUrl}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "خانه", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "طراحی سایت", item: `${siteUrl}${landingHref("websiteDesign")}` },
          { "@type": "ListItem", position: 3, name: "قیمت طراحی سایت", item: `${siteUrl}${pageUrl}` },
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
        eyebrow="Website Design Pricing 1405"
        title="قیمت طراحی سایت در سال ۱۴۰۵"
        desc="بسته به نوع پروژه، تعداد صفحات و امکانات موردنیاز، قیمت طراحی سایت متفاوته. در این صفحه جدول کامل تعرفه‌ی هر پلن — از وردپرس و کدنویسی اختصاصی تا فروشگاهی و سئو — به‌همراه عوامل موثر بر قیمت رو شفاف می‌بینید."
      >
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/order"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-[14.5px] font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
          >
            مشاهده‌ی همه‌ی پلن‌ها و ثبت سفارش
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[15px] w-[15px]">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-canvas px-6 py-3 text-[14.5px] font-bold text-ink transition hover:border-accent hover:text-accent"
          >
            دریافت قیمت دقیق رایگان
          </Link>
        </div>
      </PageHero>

      {/* جدول کامل قیمت */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-10">
            <h2 className="font-display text-[26px] font-normal sm:text-[32px]">
              جدول قیمت طراحی سایت (۱۴۰۵)
            </h2>
            <p className="mt-2.5 max-w-[70ch] text-[15px] text-dim">
              اعداد زیر شروع قیمت هر پلن است، نه سقف قیمت؛ قیمت نهایی هر پروژه بعد از بررسی نیاز
              دقیق شما در یه مشاوره‌ی رایگان مشخص می‌شه.
            </p>
          </Reveal>
          <div className="space-y-8">
            {tables.map((t, i) => (
              <Reveal key={t.title} delay={i * 80}>
                <h3 className="mb-3 text-[15.5px] font-bold text-ink">{t.title}</h3>
                <PriceTable table={t} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* پاسخ‌های تخصصی به هر کلمه‌ی کلیدی */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] bg-dot-grid" />
        <div className="relative z-[1] mx-auto max-w-container space-y-6 px-6">
          <Reveal className="mb-4">
            <h2 className="font-display text-[28px] font-normal sm:text-[34px] lg:text-[40px]">
              قیمت طراحی سایت به تفکیک نوع پروژه
            </h2>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              پاسخ مستقیم به رایج‌ترین سوالات قیمتی، برای هر نوع طراحی سایت.
            </p>
          </Reveal>

          <Reveal className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h3 className="mb-2 text-[16.5px] font-bold text-ink">قیمت طراحی سایت فروشگاهی چقدر است؟</h3>
            <p className="text-[14px] leading-[2] text-dim">
              <strong className="text-ink">
                قیمت طراحی سایت فروشگاهی با وردپرس و ووکامرس از حدود چهل و هفت میلیون تومان شروع
                می‌شه.
              </strong>{" "}
              این پلن شامل درگاه پرداخت، مدیریت موجودی، سبد خرید و تعداد محصول نامحدوده. برای
              فروشگاه‌های با حجم خیلی بالا یا نیاز به کدنویسی اختصاصی، قیمت از پلن‌های کدنویسی
              محاسبه می‌شه که در جدول بالا مشخصه. جزئیات کامل این نوع پروژه رو در صفحه‌ی{" "}
              <Link href={landingHref("storeDesign")} className="text-accent underline underline-offset-2">
                طراحی سایت فروشگاهی
              </Link>{" "}
              ببینید.
            </p>
          </Reveal>

          <Reveal delay={60} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h3 className="mb-2 text-[16.5px] font-bold text-ink">قیمت طراحی سایت شرکتی چقدر است؟</h3>
            <p className="text-[14px] leading-[2] text-dim">
              <strong className="text-ink">
                قیمت طراحی سایت شرکتی با وردپرس بین بیست و پنج تا سی و هشت میلیون تومانه.
              </strong>{" "}
              پلن استارتاپ برای سایت‌های معرفی کوچیک مناسبه و پلن کسب‌وکار برای شرکت‌هایی که تا
              دوازده صفحه و امکانات بیشتر نیاز دارن. برای شرکت‌های بزرگ‌تر با نیاز فنی خاص، پلن‌های
              کدنویسی اختصاصی هم موجوده. توضیحات کامل رو در صفحه‌ی{" "}
              <Link href={landingHref("corporateDesign")} className="text-accent underline underline-offset-2">
                طراحی سایت شرکتی
              </Link>{" "}
              بخونید.
            </p>
          </Reveal>

          <Reveal delay={120} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h3 className="mb-2 text-[16.5px] font-bold text-ink">قیمت طراحی سایت اختصاصی و با کدنویسی چقدر است؟</h3>
            <p className="text-[14px] leading-[2] text-dim">
              <strong className="text-ink">
                قیمت طراحی سایت با کدنویسی اختصاصی از پنجاه و هشت میلیون تومان برای پلن پایه شروع
                می‌شه و پلن پیشرفته از هشتاد و چهار میلیون تومانه.
              </strong>{" "}
              پروژه‌های سازمانی بزرگ با معماری کاملاً منحصربه‌فرد، قیمت توافقی دارن. این هزینه‌ی
              بالاتر نسبت به وردپرس، در ازای کنترل کامل، سرعت و امنیت بیشتر و بدون محدودیت قالبه.
              جزئیات فنی رو در صفحه‌ی{" "}
              <Link href={landingHref("customDesign")} className="text-accent underline underline-offset-2">
                طراحی سایت اختصاصی
              </Link>{" "}
              ببینید.
            </p>
          </Reveal>

          <Reveal delay={180} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h3 className="mb-2 text-[16.5px] font-bold text-ink">قیمت طراحی سایت با وردپرس چقدر است؟</h3>
            <p className="text-[14px] leading-[2] text-dim">
              <strong className="text-ink">
                قیمت طراحی سایت با وردپرس از بیست و پنج میلیون تومان شروع می‌شه.
              </strong>{" "}
              این پایین‌ترین قیمت در بین همه‌ی مسیرهاست، چون از یه هسته‌ی آماده استفاده می‌شه.
              بسته به نیاز به فروشگاه یا امکانات بیشتر، قیمت تا چهل و هفت میلیون تومان یا بالاتر
              می‌ره. راهنمای کامل انتخاب پلن مناسب در صفحه‌ی{" "}
              <Link href={landingHref("wordpressDesign")} className="text-accent underline underline-offset-2">
                طراحی سایت وردپرس
              </Link>{" "}
              موجوده.
            </p>
          </Reveal>

          <Reveal delay={240} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h3 className="mb-2 text-[16.5px] font-bold text-ink">قیمت طراحی سایت فروشگاهی با وردپرس چقدر است؟</h3>
            <p className="text-[14px] leading-[2] text-dim">
              <strong className="text-ink">
                پلن فروشگاهی وردپرس با ووکامرس کامل، از چهل و هفت میلیون تومان شروع می‌شه.
              </strong>{" "}
              این قیمت شامل درگاه پرداخت، مدیریت موجودی، صفحات و محصولات نامحدود و آموزش کامل
              مدیریت سایته. این گزینه‌ی اقتصادی‌تر نسبت به فروشگاه کدنویسی‌شده‌ست و برای بیشتر
              فروشگاه‌های کوچک و متوسط کافیه.
            </p>
          </Reveal>

          <Reveal delay={300} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h3 className="mb-2 text-[16.5px] font-bold text-ink">هزینه‌ی طراحی سایت آموزشی چقدر است؟</h3>
            <p className="text-[14px] leading-[2] text-dim">
              <strong className="text-ink">
                هزینه‌ی طراحی سایت آموزشی معمولاً بین پلن کسب‌وکار وردپرس و پلن فروشگاهی قرار
                می‌گیره، یعنی حدود سی و هشت تا چهل و هفت میلیون تومان.
              </strong>{" "}
              سایت آموزشی ساده که فقط دوره‌ها و اساتید رو معرفی می‌کنه، شبیه یه سایت شرکتیه؛ اما اگه
              نیاز به ثبت‌نام آنلاین، پرداخت شهریه و مدیریت کلاس داشته باشه، ساختاری شبیه فروشگاهی
              پیدا می‌کنه و ممکنه به کدنویسی اختصاصی هم نیاز پیدا کنه.
            </p>
          </Reveal>
        </div>
      </section>

      {/* عوامل موثر بر قیمت */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-12">
            <h2 className="font-display text-[28px] font-normal sm:text-[34px] lg:text-[40px]">
              عوامل موثر بر قیمت طراحی سایت
            </h2>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              شش عاملی که تفاوت قیمت بین دو پروژه‌ی به‌ظاهر مشابه رو توضیح می‌ده.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "نوع پروژه", desc: "سایت معرفی، شرکتی، فروشگاهی یا سامانه‌ی اختصاصی، پایه‌ی اصلی قیمت‌گذاریه." },
              { title: "تعداد صفحات", desc: "هر چقدر تعداد صفحات و بخش‌های سایت بیشتر باشه، زمان طراحی و قیمت هم بالاتر می‌ره." },
              { title: "وردپرس یا کدنویسی", desc: "مسیر وردپرسی معمولاً ارزون‌تر و کدنویسی اختصاصی به‌خاطر انعطاف بیشتر، گران‌تره." },
              { title: "امکانات ویژه", desc: "درگاه پرداخت چندگانه، باشگاه مشتریان یا چندزبانه بودن، روی قیمت نهایی تاثیر می‌ذاره." },
              { title: "طراحی گرافیکی", desc: "طراحی کاملاً اختصاصی و سفارشی، نسبت به استفاده از یه قالب پایه، هزینه‌ی بیشتری داره." },
              { title: "زمان‌بندی پروژه", desc: "درخواست تحویل فوری‌تر از حالت استاندارد، معمولاً روی هزینه‌ی نهایی هم اثر می‌ذاره." },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 60} className="rounded-card border border-ink/10 bg-surface/50 p-6">
                <h3 className="mb-1.5 text-[15px] font-bold text-ink">{item.title}</h3>
                <p className="text-[13.5px] leading-relaxed text-dim">{item.desc}</p>
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
            <h2 className="mb-3 text-[18px] font-bold text-ink">چرا قیمت طراحی سایت یک عدد ثابت نیست</h2>
            <p className="text-[14px] leading-[2] text-dim">
              خیلی از افراد دنبال یه عدد قطعی برای «قیمت طراحی سایت» می‌گردن، اما همون‌طور که جدول
              بالا نشون می‌ده، این هزینه بسته به نوع پروژه از بیست و پنج میلیون تا صدها میلیون تومان
              متغیره. دلیلش اینه که یه سایت معرفی ساده و یه سامانه‌ی سازمانی با هزاران کاربر، از نظر
              حجم کار زمین تا آسمون فرق دارن. برای همین بهترین کار، پیدا کردن دسته‌ی نزدیک به نیاز
              خودتون در جدول بالا و بعد گرفتن یه پیشنهاد دقیق‌تره، نه تکیه به یه عدد کلی که جایی
              شنیدید.
            </p>
          </Reveal>
          <Reveal delay={60} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">مقایسه‌ی هزینه‌ی طراحی سایت با وردپرس و کدنویسی اختصاصی</h2>
            <p className="text-[14px] leading-[2] text-dim">
              فاصله‌ی قیمتی بین پلن فروشگاهی وردپرس (۴۷ میلیون تومان) و پلن پایه‌ی کدنویسی (۵۸
              میلیون تومان) شاید در نگاه اول کم به نظر برسه، اما تفاوت واقعی در چیزیه که پشت این عدد
              می‌گیرید: وردپرس یه هسته‌ی آماده با هزاران افزونه‌ست، در حالی که کدنویسی اختصاصی یعنی
              هر خط کد دقیقاً برای پروژه‌ی شما نوشته می‌شه. برای همین مقایسه‌ی قیمت به‌تنهایی کافی
              نیست؛ باید دید کدوم مسیر واقعاً نیاز پروژه‌ی شما رو برطرف می‌کنه.
            </p>
          </Reveal>
          <Reveal delay={120} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">هزینه‌ی نگهداری بعد از طراحی سایت</h2>
            <p className="text-[14px] leading-[2] text-dim">
              قیمت طراحی سایت فقط شامل هزینه‌ی ساخت اولیه‌ست؛ بعد از تحویل، هزینه‌های دیگه‌ای مثل
              تمدید سالانه‌ی دامنه، هاست و در صورت نیاز، قرارداد نگهداری یا سئوی مستمر هم وجود داره.
              این هزینه‌ها معمولاً در مقابل هزینه‌ی طراحی اولیه خیلی کوچیک‌ترن، اما دیدن تصویر کامل
              هزینه‌ی سالانه‌ی یه سایت، به برنامه‌ریزی بودجه‌ی درست‌تر کمک می‌کنه.
            </p>
          </Reveal>
          <Reveal delay={180} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">چطور بین چند پیشنهاد قیمت طراحی سایت انتخاب کنیم</h2>
            <p className="text-[14px] leading-[2] text-dim">
              وقتی چند پیشنهاد قیمت طراحی سایت از تیم‌های مختلف می‌گیرید، فقط به عدد پایین‌تر نگاه
              نکنید. ببینید هر پیشنهاد دقیقاً شامل چه صفحاتی، چند دور بازبینی، چه مدت پشتیبانی رایگان
              و آیا سورس کامل بعد از تحویل هست یا نه. گاهی یه پیشنهاد ارزون‌تر، خیلی از این موارد رو
              حذف کرده و در عمل هزینه‌ی نهایی بیشتری برای شما تموم می‌شه.
            </p>
          </Reveal>
          <Reveal delay={240} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">آیا قیمت طراحی سایت در شهرهای مختلف فرق دارد؟</h2>
            <p className="text-[14px] leading-[2] text-dim">
              چون فرایند مشاوره، طراحی و تحویل به‌صورت آنلاین انجام می‌شه، قیمتی که وب پیکاسو اعلام
              می‌کنه فرقی بین تهران، شهرستان‌ها یا حتی مشتری‌های خارج از کشور نداره. همون جدول
              بالا، همون کیفیت کدنویسی و همون سرعت پشتیبانی، برای همه‌ی مشتری‌ها یکسانه؛ تنها تفاوت
              احتمالی، امکان جلسه‌ی حضوریه که برای مشتری‌های تهرانی در صورت نیاز قابل هماهنگیه.
            </p>
          </Reveal>
          <Reveal delay={300} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">آیا ارزون‌ترین پیشنهاد همیشه بهترین انتخاب است؟</h2>
            <p className="text-[14px] leading-[2] text-dim">
              نه لزوماً. یه پیشنهاد خیلی پایین‌تر از میانگین بازار، معمولاً یعنی جایی از کیفیت زده
              شده: قالب رایگان به‌جای طراحی اختصاصی، نبود پشتیبانی بعد از تحویل، یا هزینه‌های
              پنهانی که بعداً اضافه می‌شن. بهترین معیار برای انتخاب، مقایسه‌ی نسبت قیمت به چیزیه که
              واقعاً دریافت می‌کنید — طراحی، سرعت، امنیت، آموزش و پشتیبانی — نه فقط عدد پایین‌تر روی
              کاغذ.
            </p>
          </Reveal>
          <Reveal delay={360} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">چرا وب پیکاسو قیمت‌ها را به‌صورت شفاف اعلام می‌کند</h2>
            <p className="text-[14px] leading-[2] text-dim">
              خیلی از تیم‌های طراحی سایت، قیمت رو فقط بعد از تماس مستقیم اعلام می‌کنن. وب پیکاسو
              ترجیح می‌ده همون ابتدا، بازه‌ی قیمت هر پلن رو در همین صفحه شفاف نشون بده تا مشتری با
              دید باز و بدون فشار تماس، تصمیم بگیره. این شفافیت باعث می‌شه هم زمان مشتری و هم زمان
              تیم مشاوره صرفه‌جویی بشه، چون از همون ابتدا انتظارات دو طرف روی یه بازه‌ی مشخص تنظیم
              می‌شه.
            </p>
          </Reveal>
          <Reveal delay={420} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">آیا قیمت طراحی سایت در سال‌های آینده تغییر می‌کند</h2>
            <p className="text-[14px] leading-[2] text-dim">
              مثل هر خدمت دیگه‌ای، تعرفه‌های طراحی سایت هم به‌مرور بر اساس هزینه‌ی نیروی متخصص و
              تورم بازبینی می‌شن. جدول بالا قیمت‌های سال ۱۴۰۵ رو نشون می‌ده و به‌صورت دوره‌ای
              به‌روزرسانی می‌شه. برای اطمینان از آخرین تعرفه، همیشه بهتره قبل از سفارش، همین صفحه رو
              دوباره چک کنید یا مستقیم از تیم مشاوره بپرسید.
            </p>
          </Reveal>
          <Reveal delay={480} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">رابطه‌ی نمونه‌کار و قیمت طراحی سایت</h2>
            <p className="text-[14px] leading-[2] text-dim">
              قبل از تصمیم‌گیری فقط بر اساس عدد، نمونه‌کارهای قبلی هر تیم رو هم ببینید. یه تیمی که
              نمونه‌کار واقعی و باکیفیت نشون می‌ده، معمولاً قیمتش با دلیل مشخصه؛ در حالی که نبود
              نمونه‌کار قابل ارائه، خودش یه هشدار جدیه، فارغ از اینکه قیمت پیشنهادی چقدر باشه. برای
              دیدن نمونه‌کارهای وب پیکاسو در دسته‌های مختلف طراحی سایت، می‌تونید بخش{" "}
              <Link href="/portfolio" className="text-accent underline underline-offset-2">
                پرتفولیو
              </Link>{" "}
              رو مرور کنید.
            </p>
          </Reveal>
          <Reveal delay={540} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">روش‌های پرداخت هزینه</h2>
            <p className="text-[14px] leading-[2] text-dim">
              معمولاً پرداخت در چند مرحله انجام می‌شه: یه بیعانه برای شروع کار، یه یا چند قسط میانی
              بر اساس پیشرفت پروژه، و مبلغ باقی‌مونده در زمان تحویل نهایی. این تقسیم‌بندی هم برای
              مشتری اطمینان می‌ده که پرداخت کامل رو یک‌جا انجام نداده تا کار تموم بشه، و هم برای تیم
              فنی تضمین می‌کنه که پروژه در حال پیشرفته. جزئیات دقیق مراحل پرداخت در قرارداد هر پروژه
              مشخص و مکتوب می‌شه.
            </p>
          </Reveal>
          <Reveal delay={600} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">تفاوت هزینه‌ی سایت شخصی و سایت کسب‌وکار</h2>
            <p className="text-[14px] leading-[2] text-dim">
              یه سایت شخصی یا پورتفولیوی ساده برای معرفی یه فرد، معمولاً کوچیک‌تر و ارزون‌تر از یه
              سایت کامل کسب‌وکاره، چون تعداد صفحات کمتر و نیاز فنی ساده‌تری داره. در مقابل، سایت
              کسب‌وکار معمولاً شامل صفحات خدمات متعدد، نمونه‌کار، فرم‌های تخصصی و گاهی فروشگاهه.
              برای افراد مستقل و فریلنسرها، وب پیکاسو نسخه‌ی کوچیک‌تر و اقتصادی‌تری از پلن‌های
              وردپرس ارائه می‌ده که دقیقاً متناسب با همین نیاز طراحی شده.
            </p>
          </Reveal>
          <Reveal delay={660} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">هزینه‌ی سئو در کنار هزینه‌ی طراحی سایت</h2>
            <p className="text-[14px] leading-[2] text-dim">
              یه نکته‌ی مهم که خیلی وقت‌ها در محاسبه‌ی بودجه فراموش می‌شه، هزینه‌ی سئوی بعد از
              تحویله. طراحی سایت، ظرف رو می‌سازه؛ سئو باعث می‌شه مشتری واقعی از طریق گوگل اون ظرف
              رو پیدا کنه. همون‌طور که در جدول بالا دیدید، خدمات سئوی وب پیکاسو از پانزده میلیون
              تومان در ماه شروع می‌شه و به‌صورت ماهانه، نه یک‌باره، محاسبه می‌شه؛ برای همین در
              بودجه‌بندی کلی پروژه، بهتره این هزینه‌ی مستمر رو هم در نظر بگیرید، نه فقط هزینه‌ی
              یک‌بار طراحی اولیه.
            </p>
          </Reveal>
          <Reveal delay={720} className="rounded-card border border-ink/10 bg-surface/50 p-6 sm:p-8">
            <h2 className="mb-3 text-[18px] font-bold text-ink">چه زمانی برای گرفتن مشاوره‌ی قیمت مناسب است</h2>
            <p className="text-[14px] leading-[2] text-dim">
              نیازی نیست همه‌چیز از قبل صددرصد مشخص باشه تا درخواست مشاوره بدید؛ حتی اگه فقط یه
              ایده‌ی کلی از کسب‌وکارتون دارید، همون کافیه تا جلسه‌ی مشاوره شروع بشه و کم‌کم جزئیات
              دقیق بشن. هر چه زودتر این گفت‌وگو رو شروع کنید، زمان بیشتری برای مقایسه‌ی گزینه‌ها،
              برنامه‌ریزی بودجه و هماهنگی زمان‌بندی پروژه با برنامه‌های دیگه‌ی کسب‌وکارتون خواهید
              داشت؛ به همین دلیل مشاوره‌ی اولیه در وب پیکاسو کاملاً رایگان و بدون تعهده.
            </p>
          </Reveal>
        </div>
      </section>

      {/* چک‌لیست دریافت پیشنهاد قیمت */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-8">
            <h2 className="font-display text-[26px] font-normal sm:text-[32px]">
              چطور یک پیشنهاد قیمت دقیق دریافت کنیم
            </h2>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              آماده کردن این اطلاعات، پاسخ قیمتی شما رو سریع‌تر و دقیق‌تر می‌کنه.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              "نوع پروژه: معرفی، شرکتی، فروشگاهی یا سامانه‌ی اختصاصی",
              "تعداد صفحات یا بخش‌های موردنیاز",
              "نیاز به فروشگاه، درگاه پرداخت یا باشگاه مشتریان",
              "ترجیح بین وردپرس یا کدنویسی اختصاصی (در صورت مشخص بودن)",
              "چند نمونه‌سایت که ظاهرشون رو می‌پسندید",
              "بازه‌ی زمانی موردنظر برای تحویل پروژه",
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
          <p className="mt-6 text-[13px] text-dim">
            با این اطلاعات، همکاران ما در جلسه‌ی مشاوره‌ی رایگان می‌تونن سریع‌تر مناسب‌ترین پلن رو
            از{" "}
            <Link href={landingHref("designCompany")} className="text-accent underline underline-offset-2">
              شرکت طراحی سایت
            </Link>{" "}
            وب پیکاسو پیشنهاد بدن.
          </p>
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
                سوالات متداول درباره‌ی قیمت طراحی سایت
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
              قیمت دقیق پروژه‌ی خودتان را همین حالا بگیرید
            </h2>
            <p className="max-w-[60ch] text-[14.5px] leading-[2] text-dim">
              جدول بالا شروع قیمت هر پلنه؛ برای دونستن عدد دقیق پروژه‌ی خودتون — چه{" "}
              <Link href={landingHref("storeDesign")} className="text-accent underline underline-offset-2">
                فروشگاهی
              </Link>
              ، چه{" "}
              <Link href={landingHref("corporateDesign")} className="text-accent underline underline-offset-2">
                شرکتی
              </Link>
              ، چه{" "}
              <Link href={landingHref("customDesign")} className="text-accent underline underline-offset-2">
                اختصاصی
              </Link>{" "}
              یا{" "}
              <Link href={landingHref("wordpressDesign")} className="text-accent underline underline-offset-2">
                وردپرسی
              </Link>{" "}
              — کافیه یه مشاوره‌ی رایگان کوتاه بگیرید. برای آشنایی با پایه‌های{" "}
              <Link href={landingHref("websiteDesign")} className="text-accent underline underline-offset-2">
                طراحی سایت
              </Link>{" "}
              هم می‌تونید صفحه‌ی اصلی این موضوع رو ببینید.
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/order"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-[14.5px] font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
              >
                مشاهده‌ی همه‌ی پلن‌ها
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[15px] w-[15px]">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-canvas px-6 py-3 text-[14.5px] font-bold text-ink transition hover:border-accent hover:text-accent"
              >
                دریافت قیمت دقیق رایگان
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* خدمات مرتبط */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-8">
            <h2 className="font-display text-[22px] font-normal sm:text-[26px]">خدمات مرتبط با قیمت طراحی سایت</h2>
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
