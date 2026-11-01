import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/rbac";
import { createCoupon, listCoupons, type CouponInput } from "@/lib/server/couponsRepo";
import { assertSameOrigin, jsonError } from "@/lib/server/security";

export async function GET(request: Request) {
  const auth = await requirePermission(request, "coupons.manage");
  if ("error" in auth) return auth.error;
  return NextResponse.json({ coupons: await listCoupons() });
}

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const auth = await requirePermission(request, "coupons.manage");
  if ("error" in auth) return auth.error;

  let body: CouponInput;
  try {
    body = await request.json();
  } catch {
    return jsonError("بدنه درخواست نامعتبر است.", 400);
  }

  const result = await createCoupon(body, auth.actor);
  if (!result.success) return jsonError(result.error, 422);
  return NextResponse.json({ id: result.id });
}
