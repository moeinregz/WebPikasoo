import { NextResponse } from "next/server";

/**
 * محافظت پایه CSRF برای Route Handlerهای این پروژه: چون فعلاً هیچ Cookie
 * احراز هویتی وجود ندارد (سبد مهمان صرفاً با شناسه در Body ارسال می‌شود)،
 * ریسک CSRF کلاسیک محدود است؛ اما به‌عنوان لایه دفاعی اول، هدر سفارشی
 * `x-requested-with` الزامی شده — درخواست‌های Cross-site ساده (مثل ارسال
 * فرم HTML از سایت دیگر) این هدر را ندارند.
 *
 * ⚠️ این جایگزین یک استراتژی کامل CSRF (Double-submit Cookie / SameSite
 * strict cookies) نیست. با افزودن احراز هویت مبتنی بر Cookie/Session در فاز
 * بعد (Blueprint بخش ۱۴)، این تابع باید با یک راهکار استاندارد جایگزین شود.
 */
export function assertSameOrigin(request: Request): NextResponse | null {
  const marker = request.headers.get("x-requested-with");
  if (marker !== "karimoglu-web") {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 403 });
  }
  return null;
}

export function jsonError(message: string, status: number, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}
