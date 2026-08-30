import type { ReactNode } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import ContactForm from "@/components/ContactForm";
import TicketForm from "@/components/TicketForm";
import { getCurrentUser } from "@/lib/session";

export const metadata = {
  title: "تماس با ما — وب پیکاسو",
  description: "راه‌های ارتباط با تیم وب پیکاسو — واتساپ، تلگرام، تماس مستقیم یا فرم درخواست پروژه.",
};

type SocialLink = { href: string; label: string; value: string; icon: ReactNode };

// همه‌ی راه‌های ارتباطی یک‌جا — قبلاً تو صفحه‌ی «درباره ما» بود، الان
// اینجا (صفحه‌ی تماس با ما) هست تا با بقیه‌ی راه‌های ارتباط و فرم‌ها
// یک‌جا باشه. ایمیل، آدرس کوتاه و لینک نقشه فعلاً نمونه‌ان — با اطلاعات
// واقعی خودت جایگزین کن.
const EMAIL = "webpikaso@gmail.com";
const SHORT_ADDRESS = "استان البرز، کرج، اصفهانی ها، بلوار قدس، فاطمیه";
const MAP_LINK = "https://maps.google.com"; // لینک لوکیشن گوگل‌مپ رو اینجا بذار

const socials: SocialLink[] = [
  {
    href: "https://wa.me/989965745535",
    label: "واتساپ",
    value: "سریع‌ترین راه ارتباط — همین الان چت کن",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-full w-full">
        <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
      </svg>
    ),
  },
  {
    href: "tel:+989965745535",
    label: "تماس مستقیم",
    value: "5535 574 0996",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-full w-full">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.68 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.32 1.85.55 2.81.68A2 2 0 0 1 22 16.92Z" />
      </svg>
    ),
  },
  {
    href: "https://t.me/WebPikaso",
    label: "تلگرام",
    value: "@WebPikaso",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-full w-full">
        <path d="M22 2 11 13" />
        <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
      </svg>
    ),
  },
  {
    href: "https://instagram.com/regzly",
    label: "اینستاگرام",
    value: "@regzly",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-full w-full">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" />
      </svg>
    ),
  },
  {
    href: `mailto:${EMAIL}`,
    label: "ایمیل",
    value: EMAIL,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-full w-full">
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <path d="m4 6.5 8 6 8-6" />
      </svg>
    ),
  },
  {
    href: MAP_LINK,
    label: "موقعیت روی نقشه",
    value: SHORT_ADDRESS,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-full w-full">
        <path d="M12 21s-7-6.2-7-11.2a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
        <circle cx="12" cy="9.8" r="2.4" />
      </svg>
    ),
  },
];

export default async function ContactPage() {
  const user = await getCurrentUser();
  const isLoggedIn = !!user;

  return (
    <>
      <Nav isLoggedIn={isLoggedIn} />

      <PageHero
        eyebrow="Contact"
        title="بیا با هم صحبت کنیم"
        desc="هر سؤالی درباره‌ی پروژه‌ت داری، هر راهی که راحت‌تری بگو — از واتساپ تا فرم پایین همین صفحه، تیم وب پیکاسو سریع جوابت رو می‌ده."
      />

      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-12 flex items-baseline gap-4">
            <span className="flex h-8 items-center rounded-full border border-ink/10 bg-surface px-3.5 font-mono text-sm font-bold text-ink">
              Find
            </span>
            <div>
              <h2 className="font-display text-[28px] font-normal sm:text-[34px] lg:text-[40px]">
                از هر راهی راحت‌تری، پیدامون کن
              </h2>
              <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
                واتساپ، تماس مستقیم، ایمیل، شبکه‌های اجتماعی یا حتی سر بزن — هر جا راحت‌تری در دسترسیم.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {socials.map((s, i) => (
              <Reveal key={s.label} delay={i * 60}>
                <a
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="group flex h-full flex-col items-start gap-4 rounded-card border border-ink/10 bg-surface/50 p-6 transition hover:-translate-y-1 hover:border-accent/40"
                >
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px] bg-accent/10 p-2.5 text-accent transition-transform duration-300 group-hover:scale-110">
                    {s.icon}
                  </span>
                  <div className="min-w-0">
                    <h3 className="mb-1 text-[15.5px] font-bold text-ink">{s.label}</h3>
                    <p dir="ltr" className="truncate text-right text-[13px] text-dim">
                      {s.value}
                    </p>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="contact-form" className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <span
          className="pointer-events-none absolute -left-[200px] -bottom-[240px] z-0 h-[560px] w-[560px] rounded-full opacity-30 blur-[130px]"
          style={{ background: "rgba(0, 119, 182, .3)" }}
        />
        <div className="relative z-[1] mx-auto max-w-[760px] px-6">
          <Reveal className="rounded-card border border-ink/10 bg-surface/50 p-6 text-right sm:p-9">
            <h2 className="mb-2 font-display text-2xl font-normal sm:text-[28px]">
              یا فرم درخواست پروژه رو پر کن
            </h2>
            <p className="mb-7 text-sm text-dim">
              هرچی دقیق‌تر بنویسی، سریع‌تر می‌تونیم یه جواب درست بهت بدیم — نوع پروژه، بودجه‌ی
              تقریبی و توضیح کوتاه کافیه.
            </p>
            {user ? (
              <ContactForm defaultName={user.name} defaultPhone={user.phone} />
            ) : (
              <div className="flex flex-col items-start gap-4 rounded-[14px] border border-dashed border-ink/[0.2] bg-surface/40 p-6 text-right sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    برای ثبت درخواست پروژه اول باید وارد حساب کاربریت بشی.
                  </p>
                  <p className="mt-1 text-sm text-dim">
                    یه حساب بساز یا وارد شو — چند ثانیه‌ای تمومه، بعدش می‌تونی درخواستت رو بفرستی و
                    پیگیرش باشی.
                  </p>
                </div>
                <Link
                  href="/account"
                  className="inline-flex w-full flex-shrink-0 items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-[14.5px] font-bold text-canvas transition hover:-translate-y-0.5 sm:w-auto"
                >
                  ورود / ثبت‌نام
                </Link>
              </div>
            )}
          </Reveal>
        </div>
      </section>

      <section id="ticket-form" className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-[760px] px-6">
          <Reveal className="rounded-card border border-ink/10 bg-surface/50 p-6 text-right sm:p-9">
            <h2 className="mb-2 font-display text-2xl font-normal sm:text-[28px]">
              یا مستقیم یه تیکت پشتیبانی بزن
            </h2>
            <p className="mb-7 text-sm text-dim">
              برای سؤال‌های فنی، پیگیری پروژه‌ی در حال انجام یا هر مشکلی که داری، به‌جای فرم بالا
              (که مخصوص درخواست پروژه‌ی جدیده) از همین‌جا یه تیکت بزن — از داخل حساب کاربریت
              پیگیرش می‌مونی.
            </p>
            {user ? (
              <TicketForm withHeading={false} />
            ) : (
              <div className="flex flex-col items-start gap-4 rounded-[14px] border border-dashed border-ink/[0.2] bg-surface/40 p-6 text-right sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    برای ثبت تیکت اول باید وارد حساب کاربریت بشی.
                  </p>
                  <p className="mt-1 text-sm text-dim">
                    یه حساب بساز یا وارد شو — چند ثانیه‌ای تمومه، بعدش می‌تونی تیکتت رو بفرستی و
                    جواب رو همون‌جا ببینی.
                  </p>
                </div>
                <Link
                  href="/account"
                  className="inline-flex w-full flex-shrink-0 items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-[14.5px] font-bold text-canvas transition hover:-translate-y-0.5 sm:w-auto"
                >
                  ورود / ثبت‌نام
                </Link>
              </div>
            )}
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
