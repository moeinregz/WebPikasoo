import { Container } from "@/components/ui/Container";
import { requirePageAccess } from "@/lib/auth/adminGuard";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { listUsers } from "@/lib/server/usersAdminRepo";
import { ALL_PERMISSIONS, ROLE_LABELS, ROLE_PERMISSIONS, type Role } from "@/lib/auth/rbac";
import { RoleAssignForm } from "@/components/admin/RoleAssignForm";

export const dynamic = "force-dynamic";

const PERMISSION_LABELS: Record<string, string> = {
  "inventory.view": "مشاهده موجودی",
  "inventory.adjust": "اصلاح موجودی",
  "inventory.receive": "ورود انبار",
  "inventory.transfer": "انتقال انبار→شعبه",
  "inventory.history.view": "تاریخچه موجودی",
  "inventory.thresholds.manage": "آستانه موجودی کم",
  "inventory.reservation.override": "آزادسازی دستی رزرو",
  "orders.view": "مشاهده سفارش‌ها",
  "orders.update_status": "تغییر وضعیت سفارش",
  "products.manage": "مدیریت محصولات",
  "branches.manage": "مدیریت شعب",
  "users.manage": "مدیریت کاربران/نقش‌ها",
  "coupons.manage": "مدیریت تخفیف/کمپین",
  "reviews.manage": "مدیریت نظرات",
  "notifications.view": "مشاهده اعلان‌ها",
  "reports.view": "مشاهده گزارش‌ها",
  "settings.manage": "مدیریت تنظیمات",
  "audit.view": "مشاهده Audit Log",
};

export default async function AdminUsersPage({ searchParams }: { searchParams: { q?: string } }) {
  const access = await requirePageAccess("users.manage");
  if (!access.allowed) return <AccessDenied />;

  const users = await listUsers(searchParams.q);
  const roles = Object.keys(ROLE_LABELS) as Exclude<Role, "system">[];

  return (
    <Container className="flex flex-col gap-8 py-2">
      <div>
        <h1 className="text-h2 text-text-primary">کاربران و دسترسی‌ها</h1>
        <p className="text-bodySm text-text-secondary">{users.length.toLocaleString("fa-IR")} کاربر ثبت‌نام‌شده</p>
      </div>

      <form method="get" className="flex items-end gap-3 rounded-lg bg-surface p-4 shadow-sm">
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-caption text-text-muted">جستجو (موبایل یا نام)</label>
          <input name="q" defaultValue={searchParams.q} className="rounded-md border border-border-strong px-3 py-1.5 text-bodySm" />
        </div>
        <button type="submit" className="rounded-md bg-brand-black px-4 py-1.5 text-bodySm text-white">
          جستجو
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg bg-surface shadow-sm">
        <table className="w-full text-right text-bodySm">
          <thead className="border-b border-border text-caption text-text-muted">
            <tr>
              <th className="p-3">نام</th>
              <th className="p-3">موبایل</th>
              <th className="p-3">تاریخ ثبت‌نام</th>
              <th className="p-3">نقش فعلی</th>
              <th className="p-3">تغییر نقش</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="p-3">{u.name ?? "—"}</td>
                <td className="p-3" dir="ltr">
                  {u.mobile}
                </td>
                <td className="p-3 text-caption text-text-muted">{new Date(u.createdAt).toLocaleDateString("fa-IR")}</td>
                <td className="p-3">{u.role ? ROLE_LABELS[u.role] ?? u.role : "بدون نقش (مشتری)"}</td>
                <td className="p-3">
                  <RoleAssignForm userId={u.id} currentRole={u.role} currentBranchId={u.branchId} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section>
        <h2 className="mb-3 text-h4 text-text-primary">جدول نقش/دسترسی (Role/Permission Matrix)</h2>
        <div className="overflow-x-auto rounded-lg bg-surface shadow-sm">
          <table className="w-full text-right text-caption">
            <thead className="border-b border-border text-text-muted">
              <tr>
                <th className="p-2">مجوز</th>
                {roles.map((r) => (
                  <th key={r} className="p-2 text-center">
                    {ROLE_LABELS[r]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_PERMISSIONS.map((permission) => (
                <tr key={permission} className="border-b border-border last:border-0">
                  <td className="p-2">{PERMISSION_LABELS[permission] ?? permission}</td>
                  {roles.map((r) => (
                    <td key={r} className="p-2 text-center">
                      {ROLE_PERMISSIONS[r].includes(permission) ? (
                        <span className="text-state-success">✓</span>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Container>
  );
}
