import { NextResponse } from "next/server";
import { selectBranchForOrder } from "@/lib/branch-selection/branchSelectionService";
import { sanitizeCoordinates } from "@/lib/server/geo";
import { assertSameOrigin, jsonError } from "@/lib/server/security";
import { enforceRateLimit } from "@/lib/server/rateLimit";
import type { CartItem, DeliveryMethod } from "@/lib/types";

/**
 * این Route اکنون یک لایه نازک روی ماژول کامل انتخاب شعبه (Prompt 8) است —
 * برای حفظ سازگاری با Componentهای فعلی که این آدرس را صدا می‌زنند
 * (`BranchAvailability`, `BranchFinder`). منطق واقعی در
 * `lib/branch-selection/branchSelectionService.ts` است.
 */
export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const limited = enforceRateLimit(request, { key: "cart:resolve-branch", limit: 120, windowMs: 60 * 1000 });
  if (limited) return limited;

  let body: {
    items?: CartItem[];
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

  if (!Array.isArray(body.items)) {
    return jsonError("لیست اقلام سبد الزامی است.", 400);
  }

  const result = await selectBranchForOrder({
    cartItems: body.items,
    customerLocation: { coordinates: sanitizeCoordinates(body.coordinates), city: body.city ?? null },
    deliveryMethod: body.deliveryMethod ?? "express",
    preferredBranchId: body.preferredBranchId,
  });

  // فقط فیلدهای امن/غیرداخلی به کلاینت برگردانده می‌شود — evaluations خام
  // (شامل دلیل رد هر شعبه) داده داخلی/دیباگ است، نه برای نمایش مستقیم به کاربر
  return NextResponse.json({
    status: result.status,
    selected: result.selected,
    userMessage: result.userMessage,
  });
}
