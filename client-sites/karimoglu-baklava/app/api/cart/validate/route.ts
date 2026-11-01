import { NextResponse } from "next/server";
import { validateCart } from "@/lib/cart/validateCart";
import { sanitizeCoordinates } from "@/lib/server/geo";
import { assertSameOrigin, jsonError } from "@/lib/server/security";
import { enforceRateLimit } from "@/lib/server/rateLimit";
import type { CartItem } from "@/lib/types";

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const limited = enforceRateLimit(request, { key: "cart:validate", limit: 120, windowMs: 60 * 1000 });
  if (limited) return limited;

  let body: {
    items?: CartItem[];
    city?: "تهران" | "همدان" | null;
    coordinates?: { lat?: unknown; lng?: unknown } | null;
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

  // شهر فقط از بین مقادیر مجاز؛ مختصات فقط اگر عدد معتبر باشد (ورودی کلاینت هرگز بی‌اعتبارسنجی پذیرفته نمی‌شود)
  const city = body.city === "تهران" || body.city === "همدان" ? body.city : null;
  const coordinates = sanitizeCoordinates(body.coordinates);

  const result = await validateCart(body.items, {
    city,
    coordinates,
    preferredBranchId: body.preferredBranchId,
  });

  return NextResponse.json(result);
}
