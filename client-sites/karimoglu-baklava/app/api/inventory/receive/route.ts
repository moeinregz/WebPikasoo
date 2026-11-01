import { NextResponse } from "next/server";
import { receiveIntoWarehouse } from "@/lib/inventory/core";
import { requirePermission } from "@/lib/inventory/rbac";
import { assertSameOrigin, jsonError } from "@/lib/server/security";

interface ReceiveBody {
  productId?: string;
  variantId?: string;
  quantity?: number;
  reason?: string;
}

/** ورود موجودی به انبار مرکزی (تأمین از تأمین‌کننده). دسترسی: `inventory.receive`. */
export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const auth = await requirePermission(request, "inventory.receive");
  if ("error" in auth) return auth.error;

  let body: ReceiveBody;
  try {
    body = await request.json();
  } catch {
    return jsonError("بدنه درخواست نامعتبر است.", 400);
  }

  if (!body.productId || !body.variantId || typeof body.quantity !== "number") {
    return jsonError("محصول، نوع محصول (Variant) و مقدار الزامی است.", 400);
  }

  const result = await receiveIntoWarehouse(
    body.productId,
    body.variantId,
    body.quantity,
    body.reason ?? "ورود موجودی از تأمین‌کننده",
    auth.actor,
  );
  if (!result.success) return jsonError(result.error, 422);

  return NextResponse.json({ record: result.record });
}
