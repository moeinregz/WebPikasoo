import { db } from "@/lib/db/client";
import { jsonError } from "@/lib/server/security";
import { hashSessionToken, SESSION_COOKIE_NAME } from "./session";
import { type Actor, type Permission, type Role, hasPermission } from "./rolesData";

/**
 * ===== RBAC مرکزی پروژه (Prompt 10/11) =====
 *
 * داده خالص (نقش‌ها/مجوزها/برچسب‌ها) در `lib/auth/rolesData.ts` است (بدون
 * وابستگی به دیتابیس، برای امکان Import از Client Componentها). این فایل
 * فقط منطق سمت‌سرور (خواندن Session واقعی از دیتابیس) را اضافه می‌کند.
 *
 * `lib/inventory/rbac.ts` یک Re-export از همین‌جاست تا Route Handlerهای
 * قدیمی‌تر بدون تغییر Import کار کنند.
 */
export * from "./rolesData";

function parseCookies(header: string | null): Record<string, string> {
  if (!header) return {};
  const result: Record<string, string> = {};
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (!key) continue;
    result[key] = decodeURIComponent(rest.join("="));
  }
  return result;
}

interface SessionRow {
  user_id: string;
  expires_at: string;
}

interface UserRoleRow {
  role_id: Role;
  branch_id: string | null;
}

/**
 * منطق مشترک: از یک توکن خام Session (از هر منبعی — هدر Cookie در Route
 * Handler، یا `cookies()` در Server Component) بازیگر واقعی را برمی‌گرداند.
 */
async function resolveActorFromToken(token: string | undefined | null): Promise<Actor | null> {
  if (!token) return null;

  const tokenHash = hashSessionToken(token);
  const session = await db.prepare("SELECT user_id, expires_at FROM sessions WHERE token_hash = ?").get(tokenHash) as
    | SessionRow
    | undefined;
  if (!session) return null;
  if (new Date(session.expires_at).getTime() < Date.now()) return null;

  const userRole = await db.prepare("SELECT role_id, branch_id FROM user_roles WHERE user_id = ? LIMIT 1").get(
    session.user_id,
  ) as UserRoleRow | undefined;
  if (!userRole) return null; // کاربر واقعی است اما هیچ نقش ادمینی ندارد (مثلاً یک مشتری عادی)

  return { id: session.user_id, role: userRole.role_id, branchId: userRole.branch_id };
}

/**
 * برخلاف `resolveActorFromToken` (که فقط برای کاربرانی «Actor» می‌سازد که
 * نقش ادمینی دارند — چون فقط همان‌ها برای RBAC معنا دارند)، این تابع صرفاً
 * می‌گوید «آیا اصلاً یک Session معتبر است؟» — بدون در نظر گرفتن نقش. لازم
 * است چون یک مشتری عادی (بدون هیچ نقش ادمینی) هم باید بتواند بداند که
 * لاگین است (مثلاً در `/api/auth/me`)؛ اشتباه‌گرفتن این دو مفهوم باعث
 * می‌شد چنین کاربری اشتباهاً «Not Authenticated» گزارش شود.
 */
async function resolveSessionUserId(token: string | undefined | null): Promise<string | null> {
  if (!token) return null;
  const tokenHash = hashSessionToken(token);
  const session = await db.prepare("SELECT user_id, expires_at FROM sessions WHERE token_hash = ?").get(tokenHash) as
    | SessionRow
    | undefined;
  if (!session) return null;
  if (new Date(session.expires_at).getTime() < Date.now()) return null;
  return session.user_id;
}

export async function getSessionUserIdFromRequest(request: Request): Promise<string | null> {
  const cookies = parseCookies(request.headers.get("cookie"));
  return await resolveSessionUserId(cookies[SESSION_COOKIE_NAME]);
}

/**
 * استخراج بازیگر واقعی از Session Cookie یک Request (Route Handler). برخلاف
 * نسخه Prompt 9 (که به هدر `x-actor-role` اعتماد می‌کرد و کاملاً قابل جعل
 * بود توسط خود کلاینت)، اینجا توکن Cookie فقط یک شناسه غیرقابل‌حدس است؛ نقش
 * واقعی کاربر از جدول `user_roles` در دیتابیس خوانده می‌شود — کلاینت هیچ
 * کنترلی روی نقش خودش ندارد.
 */
export async function getActorFromRequest(request: Request): Promise<Actor | null> {
  const cookies = parseCookies(request.headers.get("cookie"));
  return await resolveActorFromToken(cookies[SESSION_COOKIE_NAME]);
}

/**
 * همان منطق، برای Server Component/Layout که به Request خام دسترسی ندارد،
 * فقط به `cookies()` از `next/headers`. طبق الزام صریح Prompt 11 («کاربر
 * نباید صرفاً با مخفی‌شدن دکمه‌ها محدود شود»)، این تابع اجازه می‌دهد خودِ
 * صفحات پنل مدیریت (نه فقط APIهای تغییردهنده) هم قبل از رندر، بازیگر واقعی
 * را بررسی کنند.
 */
export async function getActorFromCookieValue(sessionCookieValue: string | undefined): Promise<Actor | null> {
  return await resolveActorFromToken(sessionCookieValue);
}

export async function requirePermission(
  request: Request,
  permission: Permission,
): Promise<{ error: ReturnType<typeof jsonError> } | { actor: Actor }> {
  const actor = await getActorFromRequest(request);
  if (!actor) {
    return { error: jsonError("احراز هویت لازم است.", 401) };
  }
  if (!hasPermission(actor.role, permission)) {
    return { error: jsonError("شما دسترسی لازم برای این عملیات را ندارید.", 403) };
  }
  return { actor };
}
