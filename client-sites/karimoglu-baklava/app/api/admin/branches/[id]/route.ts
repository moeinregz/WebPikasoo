import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/rbac";
import { getBranchAdmin, updateBranchOperationalSettings, type BranchUpdateInput } from "@/lib/server/branchesAdminRepo";
import { assertSameOrigin, jsonError } from "@/lib/server/security";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const auth = await requirePermission(request, "branches.manage");
  if ("error" in auth) return auth.error;

  const existing = await getBranchAdmin(params.id);
  if (!existing) return jsonError("شعبه یافت نشد.", 404);

  let body: BranchUpdateInput;
  try {
    body = await request.json();
  } catch {
    return jsonError("بدنه درخواست نامعتبر است.", 400);
  }

  await updateBranchOperationalSettings(params.id, body, auth.actor);
  return NextResponse.json({ branch: await getBranchAdmin(params.id) });
}
