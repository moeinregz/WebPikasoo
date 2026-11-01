import { NextResponse } from "next/server";
import { requirePermission, type Role } from "@/lib/auth/rbac";
import { assignRole } from "@/lib/auth/service";
import { removeRole } from "@/lib/server/usersAdminRepo";
import { recordAuditLog } from "@/lib/server/auditRepo";
import { assertSameOrigin, jsonError } from "@/lib/server/security";
import { branches } from "@/lib/mock-data";

const VALID_ROLES: Role[] = ["site_admin", "ceo", "branch_manager", "warehouse_staff", "cashier"];

/**
 * انتساب/حذف نقش ادمین برای یک کاربر — طبق بخش ۹/۱۰ Prompt 11. دسترسی:
 * `users.manage` (فقط ادمین سایت/مدیرعامل). این حساس‌ترین عملیات RBAC است،
 * چون می‌تواند سطح دسترسی هرکسی را تغییر دهد — به همین دلیل در `audit_logs`
 * ثبت می‌شود.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const auth = await requirePermission(request, "users.manage");
  if ("error" in auth) return auth.error;

  let body: { role?: Role | null; branchId?: string | null };
  try {
    body = await request.json();
  } catch {
    return jsonError("بدنه درخواست نامعتبر است.", 400);
  }

  if (body.role === null) {
    await removeRole(params.id);
    await recordAuditLog(auth.actor, "user.role_removed", "user", params.id, null, null);
    return NextResponse.json({ success: true });
  }

  if (!body.role || !VALID_ROLES.includes(body.role)) {
    return jsonError("نقش نامعتبر است.", 400);
  }
  if (body.role === "branch_manager") {
    if (!body.branchId || !branches.some((b) => b.id === body.branchId)) {
      return jsonError("برای مدیر شعبه، انتخاب شعبه الزامی است.", 400);
    }
  }

  await assignRole(params.id, body.role, body.role === "branch_manager" ? body.branchId : null);
  await recordAuditLog(auth.actor, "user.role_assigned", "user", params.id, null, { role: body.role, branchId: body.branchId ?? null });
  return NextResponse.json({ success: true });
}
