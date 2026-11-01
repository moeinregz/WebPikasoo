import { NextResponse } from "next/server";
import { getLowStockThresholds, setLowStockThreshold } from "@/lib/inventory/core";
import { requirePermission } from "@/lib/inventory/rbac";
import { assertSameOrigin, jsonError } from "@/lib/server/security";

/** مشاهده آستانه‌های موجودی کم — دسترسی: `inventory.view` (فقط خواندن) */
export async function GET(request: Request) {
  const auth = await requirePermission(request, "inventory.view");
  if ("error" in auth) return auth.error;

  return NextResponse.json({ thresholds: await getLowStockThresholds() });
}

interface ThresholdBody {
  threshold?: number;
  branchId?: string | null;
  productId?: string | null;
  variantId?: string | null;
}

/**
 * تنظیم آستانه موجودی کم — طبق الزام صریح «Hard-code نکن، قابل تنظیم باشد».
 * دسترسی: `inventory.thresholds.manage` (فقط ادمین سایت/مدیرعامل).
 */
export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const auth = await requirePermission(request, "inventory.thresholds.manage");
  if ("error" in auth) return auth.error;

  let body: ThresholdBody;
  try {
    body = await request.json();
  } catch {
    return jsonError("بدنه درخواست نامعتبر است.", 400);
  }

  if (typeof body.threshold !== "number" || body.threshold < 0) {
    return jsonError("آستانه باید عدد غیرمنفی باشد.", 400);
  }

  const entry = await setLowStockThreshold(body.threshold, {
    branchId: body.branchId ?? null,
    productId: body.productId ?? null,
    variantId: body.variantId ?? null,
  });

  return NextResponse.json({ threshold: entry });
}
