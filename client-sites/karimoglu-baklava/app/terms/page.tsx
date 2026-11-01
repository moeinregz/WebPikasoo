import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

/**
 * محتوای زیر Placeholder حرفه‌ای است (طبق الزام صریح بخش ۹ Prompt) — نه یک
 * متن حقوقی نهایی. هیچ ادعای حقوقی قطعی (مثلاً درباره مسئولیت قانونی دقیق)
 * مطرح نشده؛ این صفحه باید پیش از انتشار نهایی توسط مشاور حقوقی/مدیریت
 * بازبینی و جایگزین شود.
 */
export const metadata: Metadata = {
  title: "قوانین و مقررات",
  robots: { index: true, follow: true },
  alternates: { canonical: "/terms" },
};

const sections = [
  {
    title: "شرایط استفاده از سایت",
    body: "استفاده از این سایت به‌معنای پذیرش قوانین و مقررات این صفحه است. این محتوا به‌مرور و با نهایی‌شدن رویه‌های رسمی کسب‌وکار به‌روزرسانی می‌شود.",
  },
  {
    title: "شرایط ثبت سفارش",
    body: "سفارش پس از تأیید نهایی و پرداخت (یا انتخاب روش پرداخت معتبر) ثبت‌شده تلقی می‌شود. اطلاعات تماس صحیح برای هماهنگی ارسال ضروری است.",
  },
  {
    title: "قیمت و موجودی",
    body: "قیمت‌ها و موجودی محصولات ممکن است بدون اطلاع قبلی تغییر کند. قیمت نهایی همان چیزی است که در لحظه ثبت سفارش نمایش داده می‌شود.",
  },
  {
    title: "پرداخت",
    body: "پرداخت از طریق درگاه آنلاین معتبر انجام می‌شود. جزئیات کامل درگاه پرداخت به‌زودی تکمیل خواهد شد.",
  },
  {
    title: "ارسال",
    body: "زمان و هزینه ارسال بر اساس آدرس و شعبه انتخاب‌شده محاسبه و پیش از پرداخت نهایی نمایش داده می‌شود.",
  },
  {
    title: "لغو سفارش",
    body: "امکان لغو سفارش تنها تا مدت محدودی پس از ثبت (طبق آنچه در مراحل سفارش نمایش داده می‌شود) وجود دارد. پس از آن، لغو نیازمند هماهنگی مستقیم با شعبه است.",
  },
  {
    title: "مسئولیت کاربر",
    body: "کاربر مسئول صحت اطلاعات ثبت‌شده (آدرس، شماره تماس) هنگام سفارش است.",
  },
  {
    title: "تغییر قوانین",
    body: "این قوانین ممکن است در آینده به‌روزرسانی شود. نسخه فعلی همیشه در همین صفحه در دسترس است.",
  },
  {
    title: "ارتباط با مجموعه",
    body: "برای هر سوال درباره این قوانین، از صفحه تماس با ما استفاده کنید.",
  },
];

export default function TermsPage() {
  return (
    <div className="py-6 tablet:py-10">
      <Container className="flex max-w-3xl flex-col gap-8">
        <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "قوانین و مقررات" }]} />
        <h1 className="text-h2Mobile tablet:text-h2 text-text-primary">قوانین و مقررات</h1>
        <p className="text-bodySm text-text-muted">
          این صفحه یک نسخه اولیه و قابل ویرایش است و باید پیش از انتشار نهایی با محتوای رسمی مدیریت
          جایگزین شود.
        </p>
        <div className="flex flex-col gap-6">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="mb-2 text-h4 text-text-primary">{s.title}</h2>
              <p className="text-body text-text-secondary">{s.body}</p>
            </section>
          ))}
        </div>
      </Container>
    </div>
  );
}
