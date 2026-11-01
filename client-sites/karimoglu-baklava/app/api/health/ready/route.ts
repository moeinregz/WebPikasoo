import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";

/**
 * ===== Readiness Probe (بخش ۲۲ Prompt) =====
 *
 * تأیید می‌کند برنامه واقعاً آماده پذیرش ترافیک است — یعنی دیتابیس در
 * دسترس و قابل Query است. Orchestrator باید ترافیک را تا وقتی این
 * Endpoint 200 برنمی‌گرداند به این Instance نفرستد (مثلاً هنگام Cold Start
 * یا قطعی موقت فایل دیتابیس/Volume).
 *
 * جزئیات خطای واقعی (پیام Exception، مسیر فایل) هرگز در پاسخ برگردانده
 * نمی‌شود — فقط لاگ سرور می‌شود؛ فقط `ok: false` عمومی به بیرون می‌رود.
 */
export async function GET() {
  try {
    await db.prepare("SELECT 1").get();
    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (error) {
    console.error("[health/ready] دیتابیس در دسترس نیست:", error);
    return NextResponse.json({ status: "unavailable" }, { status: 503 });
  }
}
