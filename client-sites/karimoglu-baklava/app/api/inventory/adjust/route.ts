import { NextResponse } from "next/server";
import { manualSetStock } from "@/lib/inventory/core";
import { canActOnBranch, requirePermission } from "@/lib/inventory/rbac";
import { assertSameOrigin, jsonError } from "@/lib/server/security";

interface AdjustBody {
  branchId?: string;
  productId?: string;
  variantId?: string;
  newOnHand?: number;
  reason?: string;
}

/**
 * ورود/اصلاح دستی موجودی شعبه — طبق بخش «ورود دستی موجودی» Prompt 9.
 * دسترسی: `inventory.adjust` (ادمین سایت/مدیرعامل بدون محدودیت؛ مدیر شعبه
 * فقط برای شعبه خودش — `canActOnBranch`). هر تغییر Audit می‌شود (خودِ
 * `manualSetStock` این کار را انجام می‌دهد).
 */
export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const auth = await requirePermission(request, "inventory.adjust");
  if ("error" in auth) return auth.error;
  const { actor } = auth;

  let body: AdjustBody;
  try {
    body = await request.json();
  } catch {
    return jsonError("بدنه درخواست نامعتبر است.", 400);
  }

  if (!body.branchId || !body.productId || !body.variantId) {
    return jsonError("شعبه، محصول و نوع محصول (Variant) الزامی است.", 400);
  }
  if (typeof body.newOnHand !== "number") {
    return jsonError("مقدار موجودی جدید الزامی است.", 400);
  }
  if (!body.reason || !body.reason.trim()) {
    return jsonError("ثبت دلیل تغییر الزامی است — موجودی بدون دلیل اصلاح نمی‌شود.", 400);
  }

  if (!canActOnBranch(actor, body.branchId)) {
    return jsonError("شما فقط به موجودی شعبه خودتان دسترسی دارید.", 403);
  }

  const result = await manualSetStock(body.branchId, body.productId, body.variantId, body.newOnHand, body.reason, actor);
  if (!result.success) {
    return jsonError(result.error, 422);
  }

  return NextResponse.json({ record: result.result.record, transaction: result.result.transaction });
}
