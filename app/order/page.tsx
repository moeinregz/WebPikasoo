import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import PricingPlans from "@/components/PricingPlans";
import { getCurrentUser } from "@/lib/session";

export const metadata = {
  title: "ثبت سفارش — وب پیکاسو",
  description:
    "پلن‌ها و قیمت‌های شروع وب پیکاسو برای سئو، طراحی سایت وردپرسی، سایت کدنویسی اختصاصی و توسعه نرم‌افزار / پنل مدیریت — سفارش با یه کلیک.",
};

export default async function OrderPage({
  searchParams,
}: {
  searchParams?: { category?: string; plan?: string };
}) {
  const user = await getCurrentUser();
  const isLoggedIn = !!user;

  // وقتی از /account (بعد از ورود/ثبت‌نام) با همین دو پارامتر برگرده اینجا،
  // PricingPlans خودش تشخیص می‌ده و همون پلن رو خودکار سفارش می‌ده — دیگه
  // لازم نیست کاربر دوباره روی «سفارش این پلن» کلیک کنه.
  const category = searchParams?.category;
  const plan = searchParams?.plan;

  return (
    <>
      <Nav isLoggedIn={isLoggedIn} />

      {/* پلن‌ها بر اساس نوع خدمت — سئو، وردپرس، کدنویسی اختصاصی، نرم‌افزار/پنل مدیریت.
          روی «سفارش این پلن» که بزنی، اگه وارد حساب باشی، سفارش با اسم و شماره‌ی
          حساب خودت مستقیم برای ما ثبت می‌شه — دیگه فرم جداگونه‌ای لازم نیست. */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] bg-dot-grid" />
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-12 text-center">
            <h2 className="font-display text-[26px] font-normal sm:text-[32px]">پلن‌ها و قیمت‌ها</h2>
            <p className="mx-auto mt-2.5 max-w-[54ch] text-[14.5px] text-dim">
              یه دسته رو انتخاب کن و از بین ۳ پلن، اونی که به کارت میاد رو بردار — قیمت‌ها تقریبی و
              برای شروع مذاکره‌ن، بعد از شنیدن نیاز دقیقت یه پیشنهاد مکتوب و قطعی بهت می‌دیم. روی
              «سفارش این پلن» بزن تا مستقیم برامون ثبت بشه.
            </p>
          </Reveal>

          <PricingPlans isLoggedIn={isLoggedIn} autoOrderCategory={category} autoOrderPlan={plan} />
        </div>
      </section>

      <Footer />
    </>
  );
}
