import { NextResponse } from "next/server";

/**
 * ===== Liveness Probe (بخش ۲۲ Prompt) =====
 *
 * فقط تأیید می‌کند پروسه Node در حال اجراست و درخواست HTTP را پاسخ می‌دهد —
 * به‌عمد هیچ Dependency خارجی (دیتابیس و ...) را بررسی نمی‌کند؛ طبق تفاوت
 * استاندارد Liveness/Readiness: اگر این Endpoint به‌خاطر یک مشکل موقت
 * دیتابیس Fail شود، Orchestrator ممکن است Container سالم را بی‌دلیل
 * Restart کند (که مشکل را حل نمی‌کند). بررسی دیتابیس در `/api/health/ready`
 * است.
 *
 * ⚠️ عمداً هیچ اطلاعات حساس/داخلی (نسخه دقیق، مسیر فایل، متغیر محیطی) در
 * پاسخ نیست — طبق الزام صریح Prompt («Health Check نباید اطلاعات حساس
 * سیستم را برگرداند»).
 */
export async function GET() {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}
