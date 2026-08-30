import PageLoader from "@/components/PageLoader";

// فایل ویژه‌ی Next.js — تا وقتی صفحه (مثلاً app/page.tsx که منتظر دیتابیس
// و سشن کاربره) کامل آماده نشده، این به‌صورت خودکار به‌جاش نشون داده
// می‌شه؛ همون چیزی که باعث می‌شه هیروی خالی رو نبینی. با هر تغییر مسیر و
// هم توی اولین لود سایت به‌کار می‌ره.
export default function Loading() {
  return <PageLoader />;
}
