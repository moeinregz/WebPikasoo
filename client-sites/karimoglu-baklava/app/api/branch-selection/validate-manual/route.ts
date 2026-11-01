import { NextResponse } from "next/server";
import { selectBranchForOrder } from "@/lib/branch-selection/branchSelectionService";
import { sanitizeCoordinates } from "@/lib/server/geo";
import { assertSameOrigin, jsonError } from "@/lib/server/security";
import { enforceRateLimit } from "@/lib/server/rateLimit";
import type { CartItem, DeliveryMethod } from "@/lib/types";

/**
 * طبق بخش «انتخاب دستی شعبه» Prompt 8: «انتخاب دستی نباید اعتبارسنجی سیستم
 * را دور بزند». این Route دقیقاً همان `selectBranchForOrder` را با
 * `preferredBranchId` فراخوانی می‌کند — یعنی هیچ مسیر میان‌بر/دور زدن اعتبارسنجی
 * برای انتخاب دستی وجود ندارد؛ فقط دامنه بررسی به همان یک شعبه محدود می‌شود.
 */
export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const limited = enforceRateLimit(request, { key: "branch-selection:validate-manual", limit: 60, windowMs: 60 * 1000 });
  if (limited) return limited;

  let body: {
    items?: CartItem[];
    city?: "تهران" | "همدان" | null;
    coordinates?: { lat: number; lng: number } | null;
    deliveryMethod?: DeliveryMethod;
    branchId?: string;
  };
  try {
    body = await request.json();
  } catch {
    return jsonError("بدنه درخواست نامعتبر است.", 400);
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return jsonError("لیست اقلام سبد الزامی است.", 400);
  }
  if (!body.branchId) {
    return jsonError("شناسه شعبه الزامی است.", 400);
  }

  const result = await selectBranchForOrder({
    cartItems: body.items,
    customerLocation: { coordinates: sanitizeCoordinates(body.coordinates), city: body.city ?? null },
    deliveryMethod: body.deliveryMethod ?? "express",
    preferredBranchId: body.branchId,
  });

  if (result.status !== "selected") {
    return NextResponse.json(
      { accepted: false, reason: result.userMessage ?? "این شعبه در حال حاضر قابل انتخاب نیست." },
      { status: 200 },
    );
  }

  return NextResponse.json({ accepted: true, selected: result.selected });
}
