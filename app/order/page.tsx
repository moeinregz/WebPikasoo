import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import ContactForm from "@/components/ContactForm";
import PricingPlans from "@/components/PricingPlans";
import { getCurrentUser } from "@/lib/session";

export const metadata = {
  title: "ثبت سفارش — وب پیکاسو",
  description:
    "پلن‌ها و قیمت‌های شروع وب پیکاسو برای سئو، طراحی سایت وردپرسی، سایت کدنویسی اختصاصی و توسعه نرم‌افزار / پنل مدیریت — و فرم ثبت سفارش.",
};

// نگاشت دسته‌بندی‌ها به گزینه‌های فرم، برای وقتی که کاربر از روی یه پلن
// خاص وارد فرم می‌شه — همون دسته و پلن به‌صورت پیش‌فرض تو فرم پر می‌شه.
const categoryToProjectType: Record<string, string> = {
  seo: "سئو",
  wordpress: "وب‌سایت وردپرسی",
  coding: "سایت کدنویسی اختصاصی",
  software: "پنل مدیریت / توسعه نرم‌افزار",
};

const categoryToLabel: Record<string, string> = {
  seo: "سئو و رشد ارگانیک",
  wordpress: "طراحی سایت وردپرسی",
  coding: "سایت کدنویسی اختصاصی",
  software: "توسعه نرم‌افزار و پنل مدیریت",
};

export default async function OrderPage({
  searchParams,
}: {
  searchParams?: { category?: string; plan?: string };
}) {
  const user = await getCurrentUser();
  const isLoggedIn = !!user;

  const category = searchParams?.category;
  const plan = searchParams?.plan;
  const defaultProjectType = category ? categoryToProjectType[category] : undefined;
  const defaultMessage =
    category && plan
      ? `پلن «${plan}» از دسته‌ی «${categoryToLabel[category] ?? category}» رو می‌خوام — `
      : undefined;

  return (
    <>
      <Nav isLoggedIn={isLoggedIn} />

      {/* پلن‌ها بر اساس نوع خدمت — سئو، وردپرس، کدنویسی اختصاصی، نرم‌افزار/پنل مدیریت */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] bg-dot-grid" />
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-12 text-center">
            <h2 className="font-display text-[26px] font-normal sm:text-[32px]">پلن‌ها و قیمت‌ها</h2>
            <p className="mx-auto mt-2.5 max-w-[54ch] text-[14.5px] text-dim">
              یه دسته رو انتخاب کن و از بین ۳ پلن، اونی که به کارت میاد رو بردار — قیمت‌ها تقریبی و
              برای شروع مذاکره‌ن، بعد از شنیدن نیاز دقیقت یه پیشنهاد مکتوب و قطعی بهت می‌دیم.
            </p>
          </Reveal>

          <PricingPlans />
        </div>
      </section>

      {/* فرم نهایی ثبت سفارش */}
      <section id="order-form" className="relative scroll-mt-[90px] overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <span
          className="pointer-events-none absolute -right-[180px] -bottom-[240px] z-0 h-[560px] w-[560px] rounded-full opacity-30 blur-[130px]"
          style={{ background: "rgba(0, 119, 182, .3)" }}
        />
        <div className="relative z-[1] mx-auto max-w-[760px] px-6">
          <Reveal className="rounded-card border border-ink/10 bg-surface/50 p-6 text-right sm:p-9">
            <h2 className="mb-2 font-display text-2xl font-normal sm:text-[28px]">
              فرم ثبت سفارش
            </h2>
            <p className="mb-7 text-sm text-dim">
              {plan
                ? `پلن «${plan}» رو انتخاب کردی — فرم زیر رو تکمیل کن تا سفارشت رو ثبت کنیم.`
                : "پلنی که مدنظرته رو تو قسمت توضیحات بنویس — نوع پروژه، بودجه‌ی تقریبی و توضیح کوتاه کافیه تا بررسی و باهات هماهنگ کنیم."}
            </p>
            {user ? (
              <ContactForm
                defaultName={user.name}
                defaultPhone={user.phone}
                defaultProjectType={defaultProjectType}
                defaultMessage={defaultMessage}
              />
            ) : (
              <div className="flex flex-col items-start gap-4 rounded-[14px] border border-dashed border-ink/[0.2] bg-surface/40 p-6 text-right sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    برای ثبت سفارش اول باید وارد حساب کاربریت بشی.
                  </p>
                  <p className="mt-1 text-sm text-dim">
                    یه حساب بساز یا وارد شو — چند ثانیه‌ای تمومه، بعدش می‌تونی سفارشت رو بفرستی و
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

      <Footer />
    </>
  );
}
