import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import Services from "@/components/Services";
import { getCurrentUser } from "@/lib/session";

export const metadata = {
  title: "خدمات ما — وب پیکاسو",
  description:
    "توسعه نرم‌افزار، طراحی سایت فروشگاهی و شرکتی، هوش مصنوعی و سئو — خدمات تیم وب پیکاسو.",
};

export default async function ServicesPage() {
  const isLoggedIn = !!(await getCurrentUser());

  return (
    <>
      <Nav isLoggedIn={isLoggedIn} />

      <PageHero
        eyebrow="Services"
        title="خدماتی که وب پیکاسو ارائه می‌ده"
        desc="از پنل مدیریت و فروشگاه آنلاین گرفته تا سایت شرکتی، هوش مصنوعی و سئو — همه‌چیز زیر یه سقف، با یه تیم کوچیک و متخصص."
      />

      <Services />

      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="flex flex-col items-center gap-5 rounded-card border border-ink/10 bg-surface/50 p-8 text-center sm:p-12">
            <h2 className="max-w-[24ch] font-display text-2xl font-normal sm:text-[32px]">
              خدمتی که نیاز داری رو پیدا کردی؟
            </h2>
            <p className="max-w-[52ch] text-[14.5px] text-dim">
              پلن‌ها و قیمت‌های شروع رو تو صفحه‌ی «ثبت سفارش» ببین، یا مستقیم درخواستت رو بفرست تا
              باهات هماهنگ کنیم.
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

      <Footer />
    </>
  );
}
