import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/rbac";
import { setMenuActive } from "@/lib/server/menuRepo";
import { assertSameOrigin, jsonError } from "@/lib/server/security";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const auth = await requirePermission(request, "menu.manage");
  if ("error" in auth) return auth.error;

  let body: { isActive?: boolean };
  try {
    body = await request.json();
  } catch {
    return jsonError("بدنه درخواست نامعتبر است.", 400);
  }
  if (typeof body.isActive !== "boolean") {
    return jsonError("isActive باید true یا false باشد.", 400);
  }

  await setMenuActive(params.id, body.isActive, auth.actor);
  return NextResponse.json({ success: true });
}
