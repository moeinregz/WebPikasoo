import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/rbac";
import { getAllSettings, updateSettings } from "@/lib/server/settingsRepo";
import { assertSameOrigin, jsonError } from "@/lib/server/security";

/**
 * طبق الزام صریح «اطلاعات حساس نباید بدون Permission نمایش داده شوند»:
 * حتی GET این تنظیمات نیاز به `settings.manage` دارد (نه فقط نوشتن) —
 * چون شامل جزئیاتی مثل Provider پرداخت/پیامک است.
 */
export async function GET(request: Request) {
  const auth = await requirePermission(request, "settings.manage");
  if ("error" in auth) return auth.error;
  return NextResponse.json({ settings: await getAllSettings() });
}

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const auth = await requirePermission(request, "settings.manage");
  if ("error" in auth) return auth.error;

  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return jsonError("بدنه درخواست نامعتبر است.", 400);
  }

  await updateSettings(body, auth.actor);
  return NextResponse.json({ success: true });
}
