import { Container } from "@/components/ui/Container";
import { requirePageAccess } from "@/lib/auth/adminGuard";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { listNotifications, listSmsLogs } from "@/lib/server/notificationsRepo";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const access = await requirePageAccess("notifications.view");
  if (!access.allowed) return <AccessDenied />;

  const notifications = await listNotifications();
  const smsLogs = await listSmsLogs();

  return (
    <Container className="flex flex-col gap-8 py-2">
      <div>
        <h1 className="text-h2 text-text-primary">اعلان‌ها و پیامک</h1>
        <p className="text-bodySm text-text-secondary">
          ⚠️ فعلاً هیچ Providerی برای ارسال واقعی پیامک/اعلان وصل نشده — این صفحه صرفاً ثبت‌های موجود در دیتابیس را نمایش می‌دهد؛ در حال حاضر خالی است چون هیچ پیامی هنوز ارسال نشده.
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-h4 text-text-primary">پیامک‌ها</h2>
        {smsLogs.length === 0 ? (
          <EmptyState />
        ) : (
          <Table
            columns={["گیرنده", "قالب", "وضعیت", "مرجع", "تاریخ"]}
            rows={smsLogs.map((s) => [s.toMobile, s.template, s.status, s.providerRef ?? "—", new Date(s.createdAt).toLocaleString("fa-IR")])}
          />
        )}
      </section>

      <section>
        <h2 className="mb-3 text-h4 text-text-primary">اعلان‌ها</h2>
        {notifications.length === 0 ? (
          <EmptyState />
        ) : (
          <Table
            columns={["کاربر", "نوع", "وضعیت", "تاریخ"]}
            rows={notifications.map((n) => [n.userMobile ?? "—", n.type, n.isRead ? "خوانده‌شده" : "خوانده‌نشده", new Date(n.createdAt).toLocaleString("fa-IR")])}
          />
        )}
      </section>
    </Container>
  );
}

function Table({ columns, rows }: { columns: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg bg-surface shadow-sm">
      <table className="w-full text-right text-bodySm">
        <thead className="border-b border-border text-caption text-text-muted">
          <tr>
            {columns.map((c) => (
              <th key={c} className="p-3">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="p-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState() {
  return <div className="rounded-lg bg-surface p-6 text-center text-bodySm text-text-muted shadow-sm">هیچ موردی ثبت نشده است.</div>;
}
