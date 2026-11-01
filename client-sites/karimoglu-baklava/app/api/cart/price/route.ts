import { NextResponse } from "next/server";
import { calculateCartPricing } from "@/lib/pricing";
import { calculateDeliveryFee } from "@/lib/branch-selection/deliveryFeeFormula";
import { branches } from "@/lib/mock-data";
import { assertSameOrigin, jsonError } from "@/lib/server/security";
import { enforceRateLimit } from "@/lib/server/rateLimit";
import type { CartItem, DeliveryMethod } from "@/lib/types";

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const limited = enforceRateLimit(request, { key: "cart:price", limit: 120, windowMs: 60 * 1000 });
  if (limited) return limited;

  let body: {
    items?: CartItem[];
    branchId?: string | null;
    deliveryMethod?: DeliveryMethod | null;
    couponCode?: string;
  };
  try {
    body = await request.json();
  } catch {
    return jsonError("بدنه درخواست نامعتبر است.", 400);
  }

  if (!Array.isArray(body.items)) {
    return jsonError("لیست اقلام سبد الزامی است.", 400);
  }

  // امنیت: فقط productId/variantId/packagingId/quantity از ورودی کلاینت خوانده
  // می‌شوند (همه داخل CartItem)؛ هیچ فیلد قیمتی یا هزینه ارسال مستقیماً از
  // کلاینت پذیرفته نمی‌شود — هزینه ارسال همیشه از فرمول رسمی
  // (`lib/branch-selection/deliveryFeeFormula`) بازمحاسبه می‌شود.
  let deliveryFee: number | null = null;
  if (body.branchId && body.deliveryMethod) {
    const branch = branches.find((b) => b.id === body.branchId);
    // فاصله واقعی چون مختصات شعب هنوز TODO است، فعلاً همیشه null است —
    // نتیجه صادقانه «هزینه در انتظار تعیین فرمول» خواهد بود، نه عدد ساختگی.
    const distanceKm = null;
    const feeResult = calculateDeliveryFee(distanceKm, body.deliveryMethod, undefined);
    deliveryFee = feeResult.fee;
    void branch; // برای استفاده آینده (مختصات شعبه) نگه داشته شده
  }

  const result = await calculateCartPricing(body.items, {
    deliveryFee,
    couponCode: body.couponCode,
  });

  return NextResponse.json(result);
}
