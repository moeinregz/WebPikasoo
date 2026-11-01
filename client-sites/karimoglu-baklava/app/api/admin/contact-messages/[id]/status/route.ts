import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/rbac";
import { setContactMessageStatus } from "@/lib/server/contactRepo";
import { assertSameOrigin, jsonError } from "@/lib/server/security";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const auth = await requirePermission(request, "contact.manage");
  if ("error" in auth) return auth.error;

  let body: { status?: "read" | "resolved" };
  try {
    body = await request.json();
  } catch {
    return jsonError("بدنه درخواست نامعتبر است.", 400);
  }
  if (body.status !== "read" && body.status !== "resolved") {
    return jsonError("status باید read یا resolved باشد.", 400);
  }

  await setContactMessageStatus(params.id, body.status, auth.actor);
  return NextResponse.json({ success: true });
}
