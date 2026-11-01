import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * ===== Security Headers (Prompt 11، بخش ۱۸) =====
 *
 * هدرهای امنیتی پایه برای کل سایت (شامل پنل مدیریت).
 *
 * ⚠️ نکته درباره CSP: یک Content-Security-Policy سخت‌گیرانه (بدون
 * 'unsafe-inline') نیازمند Nonce برای اسکریپت‌های خود Next.js است و اگر
 * بدون دقت اضافه شود، کل برنامه را در Production می‌شکند. به‌جای اضافه‌کردن
 * یک CSP ناقص/شکننده که حس امنیت کاذب بدهد، اینجا فقط هدرهایی گذاشته شده
 * که قطعاً امن و بدون ریسک شکستن هستند؛ CSP کامل به‌عنوان یک TODO صریح در
 * گزارش پایانی ثبت شده تا با تست کافی در فاز استقرار اضافه شود.
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY"); // پنل مدیریت هرگز نباید داخل iframe لود شود (Clickjacking)
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self), payment=()");

  // HSTS فقط در Production معنا دارد (در HTTP محلی توسعه باعث دردسر می‌شود)
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  // صفحات پنل مدیریت هرگز نباید توسط موتورهای جستجو Index شوند
  if (request.nextUrl.pathname.startsWith("/admin")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    response.headers.set("Cache-Control", "no-store, must-revalidate");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
