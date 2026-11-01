import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getActorFromCookieValue, hasPermission, type Actor, type Permission } from "./rbac";
import { SESSION_COOKIE_NAME } from "./session";

/**
 * محافظ سطح صفحه (نه فقط API) — طبق الزام صریح Prompt 11: «کاربر نباید صرفاً
 * با مخفی‌شدن دکمه‌ها محدود شود». `app/admin/(protected)/layout.tsx` فقط
 * ورود (Login) را بررسی می‌کند و آیتم‌های ناوبری را فیلتر می‌کند — اما اگر
 * کاربری مستقیماً URL یک صفحه که به آن Permission ندارد را باز کند (مثلاً
 * صندوقدار به `/admin/products`)، باید همان‌جا هم رد شود، نه فقط از منو
 * مخفی باشد. این تابع دقیقاً همان کار را برای Server Component Pageها انجام
 * می‌دهد.
 */
export async function getPageActor(): Promise<Actor> {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  const actor = await getActorFromCookieValue(token);
  if (!actor) redirect("/admin/login");
  return actor;
}

export type PageAccess = { allowed: true; actor: Actor } | { allowed: false };

export async function requirePageAccess(permission: Permission): Promise<PageAccess> {
  const actor = await getPageActor();
  if (!hasPermission(actor.role, permission)) return { allowed: false };
  return { allowed: true, actor };
}
