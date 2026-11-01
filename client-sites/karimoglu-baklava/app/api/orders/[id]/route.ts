import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { jsonError } from "@/lib/server/security";
import { enforceRateLimit } from "@/lib/server/rateLimit";

/**
 * ⚠️ به‌روزرسانی صادقانه این یادداشت (گزارش Performance/Security نهایی):
 * سیستم Session/Auth مشتری (`lib/auth/session.ts`) اکنون در پروژه وجود دارد،
 * اما ایجاد سفارش (`POST /api/orders`) هنوز آن را نمی‌خواند — یعنی
 * `order.userId` همیشه `null` است (هر سفارش هنوز فنی «مهمان» محسوب می‌شود)،
 * حتی اگر مشتری وارد حساب کاربری خود شده باشد. بنابراین این Route فعلاً
 * فقط بر پایه غیرقابل‌حدس‌بودن UUID سفارش محافظت می‌شود؛ قابل قبول برای
 * وضعیت فعلی MVP، اما وقتی ایجاد سفارش به Session کاربر متصل شود (یک تغییر
 * Business Logic جدا که این مرحله عمداً اختراع نکرده)، این Route هم باید
 * همزمان به بررسی مالکیت (`order.userId === session.userId`) ارتقا یابد —
 * در غیر این صورت یک IDOR واقعی خواهد بود. این TODO در گزارش پایانی ثبت شده.
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  // دفاع در عمق: چون این Route صرفاً روی غیرقابل‌حدس‌بودن UUID سفارش تکیه
  // دارد (یادداشت بالا)، محدودیت نرخ حدس‌زدن پیاپی شناسه سفارش را کند می‌کند.
  const limited = enforceRateLimit(request, { key: "orders:read", limit: 60, windowMs: 15 * 60 * 1000 });
  if (limited) return limited;

  const order = await db.orders.get(params.id);
  if (!order) return jsonError("سفارش یافت نشد.", 404);
  return NextResponse.json({ order });
}
