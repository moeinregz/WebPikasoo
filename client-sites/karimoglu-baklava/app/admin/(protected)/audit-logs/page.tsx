import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { requirePageAccess } from "@/lib/auth/adminGuard";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { getAuditLogs } from "@/lib/server/auditRepo";

export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, string> = {
  "product.create": "ایجاد محصول",
  "product.update": "ویرایش محصول",
  "product.activate": "فعال‌سازی محصول",
  "product.deactivate": "غیرفعال‌سازی محصول",
  "product.delete": "حذف منطقی محصول",
  "product.restore": "بازگردانی محصول",
  "branch.update_settings": "تغییر تنظیمات شعبه",
  "user.role_assigned": "انتساب نقش",
  "user.role_removed": "حذف نقش",
  "coupon.create": "ایجاد کد تخفیف",
  "coupon.activate": "فعال‌سازی کد تخفیف",
  "coupon.deactivate": "غیرفعال‌سازی کد تخفیف",
  "campaign.create": "ایجاد کمپین",
  "review.approve": "تأیید نظر",
  "review.reject": "رد نظر",
  "review.delete": "حذف نظر",
  "settings.update": "تغییر تنظیمات",
};

export default async function AdminAuditLogsPage({ searchParams }: { searchParams: { entityType?: string } }) {
  const access = await requirePageAccess("audit.view");
  if (!access.allowed) return <AccessDenied />;

  const logs = await getAuditLogs({ entityType: searchParams.entityType, limit: 200 });

  return (
    <Container className="flex flex-col gap-6 py-2">
      <div>
        <h1 className="text-h2 text-text-primary">گزارش تغییرات (Audit Log)</h1>
        <p className="text-bodySm text-text-secondary">
          این صفحه عملیات حساس پنل مدیریت (محصول، نقش کاربر، تخفیف، تنظیمات، نظرات) را نشان می‌دهد. برای Audit دقیق موجودی و
          سفارش، صفحات اختصاصی زیر را ببینید:
        </p>
        <div className="mt-2 flex gap-4 text-caption">
          <Link href="/admin/inventory/history" className="text-brand-red hover:underline">
            تاریخچه موجودی ←
          </Link>
          <Link href="/admin/orders" className="text-brand-red hover:underline">
            Timeline هر سفارش (در صفحه جزئیات سفارش) ←
          </Link>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-lg bg-surface p-8 text-center text-bodySm text-text-muted shadow-sm">هنوز عملیات حساسی ثبت نشده.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-surface shadow-sm">
          <table className="w-full text-right text-bodySm">
            <thead className="border-b border-border text-caption text-text-muted">
              <tr>
                <th className="p-3">زمان</th>
                <th className="p-3">کاربر</th>
                <th className="p-3">عملیات</th>
                <th className="p-3">موجودیت</th>
                <th className="p-3">قبل</th>
                <th className="p-3">بعد</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-border align-top last:border-0">
                  <td className="p-3 text-caption text-text-muted">{new Date(log.createdAt).toLocaleString("fa-IR")}</td>
                  <td className="p-3 text-caption">
                    {log.actorId} ({log.actorRole})
                  </td>
                  <td className="p-3">{ACTION_LABELS[log.action] ?? log.action}</td>
                  <td className="p-3 text-caption text-text-muted">
                    {log.entityType}
                    {log.entityId && ` / ${log.entityId}`}
                  </td>
                  <td className="max-w-[220px] truncate p-3 text-caption text-text-muted" title={log.before ? JSON.stringify(log.before) : ""}>
                    {log.before ? JSON.stringify(log.before) : "—"}
                  </td>
                  <td className="max-w-[220px] truncate p-3 text-caption text-text-muted" title={log.after ? JSON.stringify(log.after) : ""}>
                    {log.after ? JSON.stringify(log.after) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Container>
  );
}
