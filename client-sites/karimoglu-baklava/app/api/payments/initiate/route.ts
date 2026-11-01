import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { getPaymentProvider } from "@/lib/payment/registry";
import { assertSameOrigin, jsonError } from "@/lib/server/security";
import { enforceRateLimit } from "@/lib/server/rateLimit";

/**
 * این Route عمدتاً برای سناریوی «تلاش مجدد پرداخت» استفاده می‌شود (وقتی
 * تراکنش قبلی ناموفق بوده و کاربر می‌خواهد دوباره پرداخت کند) — چون ایجاد
 * اولیه تراکنش معمولاً همان لحظه ایجاد سفارش (`POST /api/orders`) انجام
 * می‌شود.
 */
export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const limited = enforceRateLimit(request, { key: "payments:initiate", limit: 20, windowMs: 15 * 60 * 1000 });
  if (limited) return limited;

  let body: { orderId?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError("بدنه درخواست نامعتبر است.", 400);
  }

  if (!body.orderId) return jsonError("شناسه سفارش الزامی است.", 400);

  const order = await db.orders.get(body.orderId);
  if (!order) return jsonError("سفارش یافت نشد.", 404);

  if (order.paymentMethod !== "online") {
    return jsonError("این سفارش نیازمند پرداخت آنلاین نیست.", 409);
  }
  if (order.paymentStatus === "succeeded") {
    return jsonError("این سفارش قبلاً پرداخت شده است.", 409);
  }
  if (order.status === "cancelled") {
    return jsonError("این سفارش لغو شده است.", 409);
  }

  const provider = getPaymentProvider();
  const payment = await provider.initiate({ orderId: order.id, amount: order.total });

  return NextResponse.json({ payment });
}
