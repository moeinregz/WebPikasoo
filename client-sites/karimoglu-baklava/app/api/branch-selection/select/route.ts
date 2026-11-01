import { NextResponse } from "next/server";
import { selectBranchForOrder } from "@/lib/branch-selection/branchSelectionService";
import { sanitizeCoordinates } from "@/lib/server/geo";
import { assertSameOrigin, jsonError } from "@/lib/server/security";
import { enforceRateLimit } from "@/lib/server/rateLimit";
import type { CartItem, DeliveryMethod } from "@/lib/types";

/**
 * نقطه ورود رسمی ماژول مستقل «انتخاب هوشمند شعبه» (Prompt 8). برخلاف
 * `/api/cart/resolve-branch` (که برای سازگاری با Componentهای موجود سبد
 * نگه داشته شده)، این مسیر API عمومی این ماژول است و می‌تواند مستقل از سبد
 * خرید (مثلاً برای پیش‌نمایش «آیا این محصول به من می‌رسد؟» در صفحه محصول)
 * هم استفاده شود.
 */
export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const limited = enforceRateLimit(request, { key: "branch-selection:select", limit: 120, windowMs: 60 * 1000 });
  if (limited) return limited;

  let body: {
    items?: { productId: string; quantity: number }[];
    city?: "تهران" | "همدان" | null;
    coordinates?: { lat: number; lng: number } | null;
    deliveryMethod?: DeliveryMethod;
    preferredBranchId?: string;
  };
  try {
    body = await request.json();
  } catch {
    return jsonError("بدنه درخواست نامعتبر است.", 400);
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return jsonError("لیست اقلام سبد الزامی است.", 400);
  }

  // این Route فقط productId/quantity کمینه را می‌پذیرد (نه CartItem کامل)؛
  // فیلدهای نمایشی (نام محصول و ...) این‌جا لازم نیستند چون فقط برای تصمیم
  // شعبه استفاده می‌شوند، نه برای ایجاد سفارش.
  const pseudoItems = body.items.map((i) => ({
    lineId: i.productId,
    productId: i.productId,
    quantity: i.quantity,
  })) as unknown as CartItem[];

  const result = await selectBranchForOrder({
    cartItems: pseudoItems,
    customerLocation: { coordinates: sanitizeCoordinates(body.coordinates), city: body.city ?? null },
    deliveryMethod: body.deliveryMethod ?? "express",
    preferredBranchId: body.preferredBranchId,
  });

  return NextResponse.json({
    status: result.status,
    selected: result.selected,
    userMessage: result.userMessage,
  });
}
