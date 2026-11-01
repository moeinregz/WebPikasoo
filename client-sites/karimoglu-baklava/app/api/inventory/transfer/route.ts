import { NextResponse } from "next/server";
import { transferWarehouseToBranch } from "@/lib/inventory/core";
import { requirePermission } from "@/lib/inventory/rbac";
import { assertSameOrigin, jsonError } from "@/lib/server/security";

interface TransferBody {
  branchId?: string;
  productId?: string;
  variantId?: string;
  quantity?: number;
}

/**
 * انتقال از انبار مرکزی به یک شعبه. دسترسی: `inventory.transfer`.
 * ⚠️ طبق Prompt 9، فرآیند دقیق «چه زمانی/چگونه» این انتقال باید انجام شود هنوز
 * از سوی کسب‌وکار مشخص نشده؛ این Endpoint فقط عملیات پایه (دستی) را فراهم
 * می‌کند، بدون هیچ قانون خودکار تصمیم‌گیری درباره‌ی چه‌زمانی/چه‌مقدار.
 */
export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const auth = await requirePermission(request, "inventory.transfer");
  if ("error" in auth) return auth.error;

  let body: TransferBody;
  try {
    body = await request.json();
  } catch {
    return jsonError("بدنه درخواست نامعتبر است.", 400);
  }

  if (!body.branchId || !body.productId || !body.variantId || typeof body.quantity !== "number") {
    return jsonError("شعبه، محصول، نوع محصول (Variant) و مقدار الزامی است.", 400);
  }

  const result = await transferWarehouseToBranch(body.branchId, body.productId, body.variantId, body.quantity, auth.actor);
  if (!result.success) return jsonError(result.error, 422);

  return NextResponse.json({ success: true });
}
