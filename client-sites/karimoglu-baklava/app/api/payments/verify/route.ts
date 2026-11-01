import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { getPaymentProvider } from "@/lib/payment/registry";
import { commitSale, releaseReservation } from "@/lib/inventory/core";
import { SYSTEM_ACTOR } from "@/lib/inventory/rbac";
import { assertSameOrigin, jsonError } from "@/lib/server/security";
import { enforceRateLimit } from "@/lib/server/rateLimit";

/**
 * طبق تاکید صریح Prompt 7 (بخش ۷): «هرگز فقط بر اساس اطلاعات فرانت‌اند سفارش
 * را پرداخت‌شده اعلام نکن». این Route وضعیت را از خود تراکنش (سمت سرور،
 * `db.payments`) می‌خواند، نه از چیزی که کلاینت ادعا می‌کند. `simulatedOutcome`
 * فقط برای MockProvider (که درگاه خارجی واقعی ندارد) معنا دارد — یک درگاه
 * واقعی این پارامتر را نادیده می‌گیرد و به‌جای آن با API خودش تماس می‌گیرد.
 *
 * Idempotent: فراخوانی چندباره این Route برای یک تراکنش، دوباره سفارش را
 * پردازش نمی‌کند (`provider.verify` خودش این را تضمین می‌کند).
 */
export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  // این Endpoint نتیجه پرداخت را نهایی می‌کند؛ محدودیت نرخ از حدس‌زدن پیاپی
  // `transactionId` (که یک شناسه غیرقابل‌حدس است، اما دفاع در عمق ارزان است)
  // و از فشار غیرضروری به Provider پرداخت جلوگیری می‌کند.
  const limited = enforceRateLimit(request, { key: "payments:verify", limit: 30, windowMs: 15 * 60 * 1000 });
  if (limited) return limited;

  let body: { transactionId?: string; simulatedOutcome?: "success" | "fail" };
  try {
    body = await request.json();
  } catch {
    return jsonError("بدنه درخواست نامعتبر است.", 400);
  }

  if (!body.transactionId) return jsonError("شناسه تراکنش الزامی است.", 400);

  const transaction = await db.payments.get(body.transactionId);
  if (!transaction) return jsonError("تراکنش یافت نشد.", 404);

  const order = await db.orders.get(transaction.orderId);
  if (!order) return jsonError("سفارش مرتبط با این تراکنش یافت نشد.", 404);

  const provider = getPaymentProvider(transaction.provider);
  const verifyResult = await provider.verify({
    transactionId: body.transactionId,
    simulatedOutcome: body.simulatedOutcome,
  });

  if (verifyResult.status === "succeeded") {
    if (order.paymentStatus !== "succeeded") {
      // پرداخت موفق: طبق فرآیند صریح Prompt 9 («اگر پرداخت موفق شد، رزرو به
      // فروش قطعی تبدیل شود»)، رزرو موجودی این سفارش Commit می‌شود — از
      // `reserved` کسر و به‌طور نهایی از `onHand` کسر می‌شود.
      await commitSale(order.id, SYSTEM_ACTOR);
      await db.orders.set(order.id, {
        ...order,
        paymentStatus: "succeeded",
        status: order.status === "payment_pending" ? "paid" : order.status,
      });
    }
  } else if (verifyResult.status === "failed" && order.paymentStatus !== "succeeded") {
    // پرداخت ناموفق: طبق فرآیند صریح Prompt 9 («اگر پرداخت ناموفق شد، رزرو
    // آزاد شود»)، موجودی رزروشده بلافاصله برمی‌گردد. سفارش خودش لغو نمی‌شود
    // (کاربر همچنان می‌تواند اطلاعات سفارش را ببیند)، اما موجودی دیگر برای
    // این سفارش نگه‌داشته نمی‌شود.
    // ⚠️ TODO (مستند در گزارش پایانی): پروژه فعلاً هیچ مسیر «تلاش مجدد
    // پرداخت» ندارد. اگر در آینده اضافه شود، آن مسیر باید پیش از ساخت
    // تراکنش پرداخت جدید، دوباره `reserveForOrder` را با همین `orderId`
    // فراخوانی کند (چون رزرو قبلی اینجا آزاد شده است).
    await releaseReservation(order.id, "payment_failed", SYSTEM_ACTOR);
    await db.orders.set(order.id, { ...order, paymentStatus: "failed" });
  }

  return NextResponse.json({
    payment: { ...transaction, status: verifyResult.status, referenceId: verifyResult.referenceId },
    order: await db.orders.get(order.id),
  });
}
