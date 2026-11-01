import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getActorFromCookieValue, hasPermission, ROLE_LABELS, type Permission } from "@/lib/auth/rbac";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { getUserById } from "@/lib/auth/service";
import { AdminSidebar, type NavItem } from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

/**
 * ===== محافظ واقعی پنل مدیریت (Prompt 11، بخش ۱۰/۱۸) =====
 *
 * طبق الزام صریح: «کاربر نباید صرفاً با مخفی‌شدن دکمه‌ها محدود شود؛ Backend
 * نیز باید Permission را بررسی کند». این Layout همان اصل را یک لایه جلوتر
 * می‌برد: قبل از رندر *هر* صفحه‌ای زیر `/admin`، یک Session واقعی بررسی
 * می‌شود (نه فقط API‌های تغییردهنده که از Prompt 10 محافظت‌شده بودند).
 * بدون Session معتبر → ریدایرکت به `/admin/login`. این دقیقاً همان محدودیت
 * مستندشده در Prompt 9/10 («صفحات مدیریت هنوز پشت هیچ Authی نیستند») را
 * برطرف می‌کند.
 *
 * ناوبری کناری فقط آیتم‌هایی را نشان می‌دهد که نقش کاربر واقعاً به آن‌ها
 * Permission دارد — اما این صرفاً برای UX است؛ هر صفحه/API مقصد خودش هم
 * دوباره Permission را در Backend بررسی می‌کند (Defense in Depth).
 */

const NAV_ITEMS: (NavItem & { permission?: Permission })[] = [
  { href: "/admin", label: "داشبورد", exact: true },
  { href: "/admin/orders", label: "سفارش‌ها", permission: "orders.view" },
  { href: "/admin/products", label: "محصولات", permission: "products.manage" },
  { href: "/admin/inventory", label: "موجودی", permission: "inventory.view" },
  { href: "/admin/branches", label: "شعب", permission: "branches.manage" },
  { href: "/admin/users", label: "کاربران و دسترسی‌ها", permission: "users.manage" },
  { href: "/admin/reports", label: "گزارش‌ها", permission: "reports.view" },
  { href: "/admin/coupons", label: "تخفیف و کمپین", permission: "coupons.manage" },
  { href: "/admin/reviews", label: "نظرات", permission: "reviews.manage" },
  { href: "/admin/contact-messages", label: "پیام‌های تماس", permission: "contact.manage" },
  { href: "/admin/menu", label: "منو", permission: "menu.manage" },
  { href: "/admin/notifications", label: "اعلان‌ها و پیامک", permission: "notifications.view" },
  { href: "/admin/audit-logs", label: "گزارش تغییرات (Audit)", permission: "audit.view" },
  { href: "/admin/settings", label: "تنظیمات", permission: "settings.manage" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sessionToken = cookies().get(SESSION_COOKIE_NAME)?.value;
  const actor = await getActorFromCookieValue(sessionToken);

  if (!actor) {
    redirect("/admin/login");
  }

  const user = await getUserById(actor.id);
  const visibleItems = NAV_ITEMS.filter((item) => !item.permission || hasPermission(actor.role, item.permission));

  return (
    <div dir="rtl" className="flex min-h-screen bg-bg-secondary">
      <AdminSidebar
        items={visibleItems}
        actorName={user?.name ?? user?.mobile ?? actor.id}
        actorRoleLabel={actor.role === "system" ? "سیستم" : ROLE_LABELS[actor.role]}
      />
      <main className="min-w-0 flex-1 px-4 py-6 tablet:px-6 desktop:px-8">{children}</main>
    </div>
  );
}
