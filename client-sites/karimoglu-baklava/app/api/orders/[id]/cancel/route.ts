import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { canCancelOrder } from "@/lib/server/orderService";
import { releaseOrCompensateForCancelledOrder } from "@/lib/inventory/core";
import { SYSTEM_ACTOR } from "@/lib/inventory/rbac";
import { assertSameOrigin, jsonError } from "@/lib/server/security";
import { enforceRateLimit } from "@/lib/server/rateLimit";

/**
 * طبق تاکید صریح Prompt (بخش ۹): «صرفاً مخفی کردن دکمه لغو در فرانت‌اند کافی
 * نیست». این Route مستقل از هر UI، زمان `cancelDeadline` ذخیره‌شده سمت سرور
 * (نه ساعت مرورگر کاربر) را بررسی می‌کند. لغو موفق موجودی را طبق منطق سیستم
 * موجودی (Prompt 9) برمی‌گرداند: اگر رزرو هنوز فعال بود (پرداخت هنوز موفق
 * نشده) صرفاً آزاد می‌شود؛ اگر پرداخت قبلاً موفق و فروش قطعی شده بود (نادر،
 * چون فقط ۵ دقیقه فرصت لغو است)، فروش Reversal می‌شود و موجودی برمی‌گردد.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  // دفاع در عمق: این Route روی غیرقابل‌حدس‌بودن UUID سفارش تکیه دارد (طبق
  // توضیح مستند در Route کنار آن یعنی GET /api/orders/[id])، اما محدودیت نرخ
  // حدس‌زدن پیاپی id را عملاً غیرممکن‌تر می‌کند.
  const limited = enforceRateLimit(request, { key: "orders:cancel", limit: 20, windowMs: 15 * 60 * 1000 });
  if (limited) return limited;

  const order = await db.orders.get(params.id);
  if (!order) return jsonError("سفارش یافت نشد.", 404);

  if (!canCancelOrder(order)) {
    return jsonError("مهلت ۵ دقیقه‌ای لغو سفارش به پایان رسیده یا سفارش قابل لغو نیست.", 409);
  }

  await releaseOrCompensateForCancelledOrder(order.id, SYSTEM_ACTOR);

  const updatedOrder = { ...order, status: "cancelled" as const };
  await db.orders.set(order.id, updatedOrder);

  return NextResponse.json({ order: updatedOrder });
}
