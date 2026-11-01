import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/rbac";
import { createCampaign, listCampaigns, type CampaignInput } from "@/lib/server/couponsRepo";
import { assertSameOrigin, jsonError } from "@/lib/server/security";

export async function GET(request: Request) {
  const auth = await requirePermission(request, "coupons.manage");
  if ("error" in auth) return auth.error;
  return NextResponse.json({ campaigns: await listCampaigns() });
}

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const auth = await requirePermission(request, "coupons.manage");
  if ("error" in auth) return auth.error;

  let body: CampaignInput;
  try {
    body = await request.json();
  } catch {
    return jsonError("بدنه درخواست نامعتبر است.", 400);
  }
  if (!body.name?.trim()) return jsonError("نام کمپین الزامی است.", 400);

  const id = await createCampaign(body, auth.actor);
  return NextResponse.json({ id });
}
