import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/rbac";
import { setReviewStatus, softDeleteReview } from "@/lib/server/reviewsRepo";
import { assertSameOrigin, jsonError } from "@/lib/server/security";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const auth = await requirePermission(request, "reviews.manage");
  if ("error" in auth) return auth.error;

  let body: { approve?: boolean };
  try {
    body = await request.json();
  } catch {
    return jsonError("بدنه درخواست نامعتبر است.", 400);
  }
  if (typeof body.approve !== "boolean") return jsonError("approve الزامی است.", 400);

  await setReviewStatus(params.id, body.approve, auth.actor);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const auth = await requirePermission(request, "reviews.manage");
  if ("error" in auth) return auth.error;

  await softDeleteReview(params.id, auth.actor);
  return NextResponse.json({ success: true });
}
