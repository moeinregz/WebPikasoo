import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

/**
 * طبق الزام صریح بخش ۱۰ Prompt: از ادعا درباره سرویس‌های Third-party که
 * هنوز متصل نیستند (مثلاً Google Analytics واقعی، Payment Provider خاص)
 * خودداری شده — فقط چیزهایی که واقعاً در کد وجود دارند (Cookie نشست ورود،
 * دیتابیس سفارش/کاربر) ذکر شده‌اند.
 */
export const metadata: Metadata = {
  title: "حریم خصوصی",
  robots: { index: true, follow: true },
  alternates: { canonical: "/privacy" },
};

const sections = [
  {
    title: "اطلاعاتی که جمع‌آوری می‌شود",
    body: "هنگام ثبت سفارش یا ساخت حساب کاربری، اطلاعاتی مانند نام، شماره موبایل و آدرس تحویل دریافت می‌شود. اطلاعات فرم تماس (نام، موبایل، متن پیام) نیز ذخیره می‌شود.",
  },
  {
    title: "نحوه استفاده",
    body: "این اطلاعات صرفاً برای پردازش سفارش، هماهنگی ارسال و پاسخ به پیام‌های تماس استفاده می‌شود.",
  },
  {
    title: "سفارش‌ها",
    body: "جزئیات سفارش (اقلام، قیمت، شعبه، آدرس) در دیتابیس نگهداری می‌شود تا امکان پیگیری سفارش وجود داشته باشد.",
  },
  {
    title: "حساب کاربری",
    body: "در صورت ساخت حساب کاربری، رمز عبور شما به‌صورت هش‌شده (نه متن ساده) ذخیره می‌شود و هرگز در دسترس مستقیم کارکنان نیست.",
  },
  {
    title: "Cookies",
    body: "برای نگه‌داشتن نشست ورود (Session) از یک Cookie امن (HttpOnly) استفاده می‌شود. این Cookie صرفاً برای ورود شما به سیستم است.",
  },
  {
    title: "Analytics",
    body: "در حال حاضر سرویس Analytics شخص‌ثالث متصل نیست. در صورت اتصال هر سرویس در آینده، این بخش به‌روزرسانی خواهد شد.",
  },
  {
    title: "امنیت",
    body: "اطلاعات حساب و سفارش با رویه‌های امنیتی استاندارد (رمزنگاری رمز عبور، دسترسی محدود بر اساس نقش) محافظت می‌شود.",
  },
  {
    title: "اشتراک‌گذاری اطلاعات",
    body: "اطلاعات شما با شخص ثالثی به‌جز آنچه برای انجام سفارش (مانند سرویس ارسال) ضروری است، به اشتراک گذاشته نمی‌شود.",
  },
  {
    title: "حقوق کاربر",
    body: "می‌توانید برای مشاهده، اصلاح یا حذف اطلاعات حساب کاربری خود از طریق صفحه تماس با ما درخواست دهید.",
  },
  {
    title: "ارتباط با مجموعه",
    body: "برای هر سوال درباره حریم خصوصی، از صفحه تماس با ما استفاده کنید.",
  },
  {
    title: "تغییرات Privacy Policy",
    body: "این سیاست ممکن است در آینده به‌روزرسانی شود. نسخه فعلی همیشه در همین صفحه در دسترس است.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="py-6 tablet:py-10">
      <Container className="flex max-w-3xl flex-col gap-8">
        <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "حریم خصوصی" }]} />
        <h1 className="text-h2Mobile tablet:text-h2 text-text-primary">حریم خصوصی</h1>
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
