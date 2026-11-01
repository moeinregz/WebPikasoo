import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { getDashboardSummary } from "@/lib/server/reportsRepo";
import { getInventorySummary } from "@/lib/inventory/core";

export const dynamic = "force-dynamic";

function toman(amount: number): string {
  return `${amount.toLocaleString("fa-IR")} تومان`;
}

export default async function AdminDashboardPage() {
  const dashboard = await getDashboardSummary();
  const inventorySummary = await getInventorySummary();

  const preparingCount =
    (dashboard.ordersByStatus.processing ?? 0) + (dashboard.ordersByStatus.preparing ?? 0) + (dashboard.ordersByStatus.ready ?? 0);
  const pendingCount = (dashboard.ordersByStatus.pending ?? 0) + (dashboard.ordersByStatus.payment_pending ?? 0);
  const shippedCount = dashboard.ordersByStatus.out_for_delivery ?? 0;
  const deliveredCount = dashboard.ordersByStatus.delivered ?? 0;
  const cancelledCount = dashboard.ordersByStatus.cancelled ?? 0;

  return (
    <Container className="flex flex-col gap-8 py-2">
      <div>
        <h1 className="text-h2 text-text-primary">داشبورد</h1>
        <p className="text-bodySm text-text-secondary">نمای کلی فروش، سفارش‌ها و موجودی — به‌روز تا همین لحظه.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 tablet:grid-cols-4">
        <StatCard label="فروش امروز" value={toman(dashboard.todaysSales)} />
        <StatCard label="سفارش‌های امروز" value={dashboard.todaysOrderCount.toLocaleString("fa-IR")} />
        <StatCard label="در انتظار" value={pendingCount.toLocaleString("fa-IR")} tone="warning" />
        <StatCard label="در حال آماده‌سازی" value={preparingCount.toLocaleString("fa-IR")} />
        <StatCard label="ارسال‌شده" value={shippedCount.toLocaleString("fa-IR")} />
        <StatCard label="تکمیل‌شده" value={deliveredCount.toLocaleString("fa-IR")} tone="success" />
        <StatCard label="لغوشده" value={cancelledCount.toLocaleString("fa-IR")} tone="error" />
        <StatCard label="رزرو فعال موجودی" value={inventorySummary.activeReservationCount.toLocaleString("fa-IR")} />
      </div>

      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
        <Link href="/admin/inventory" className="rounded-lg bg-surface p-4 shadow-sm hover:ring-1 hover:ring-brand-black">
          <p className="text-caption text-text-muted">موجودی کم</p>
          <p className="text-stat text-state-warning">{inventorySummary.lowStockCount.toLocaleString("fa-IR")}</p>
          <p className="mt-1 text-caption text-brand-red">مشاهده در بخش موجودی ←</p>
        </Link>
        <Link href="/admin/inventory" className="rounded-lg bg-surface p-4 shadow-sm hover:ring-1 hover:ring-brand-black">
          <p className="text-caption text-text-muted">محصولات ناموجود</p>
          <p className="text-stat text-state-error">{inventorySummary.outOfStockCount.toLocaleString("fa-IR")}</p>
          <p className="mt-1 text-caption text-brand-red">مشاهده در بخش موجودی ←</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 desktop:grid-cols-2">
        <section>
          <h2 className="mb-3 text-h4 text-text-primary">عملکرد شعب</h2>
          {dashboard.branchPerformance.length === 0 ? (
            <EmptyState text="هنوز هیچ سفارشی ثبت نشده است." />
          ) : (
            <div className="overflow-x-auto rounded-lg bg-surface shadow-sm">
              <table className="w-full text-right text-bodySm">
                <thead className="border-b border-border text-caption text-text-muted">
                  <tr>
                    <th className="p-3">شعبه</th>
                    <th className="p-3">تعداد سفارش</th>
                    <th className="p-3">فروش</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.branchPerformance.map((row) => (
                    <tr key={row.branchId} className="border-b border-border last:border-0">
                      <td className="p-3">{row.branchName}</td>
                      <td className="p-3">{row.orderCount.toLocaleString("fa-IR")}</td>
                      <td className="p-3 font-medium">{toman(row.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-h4 text-text-primary">محصولات پرفروش</h2>
          {dashboard.topProducts.length === 0 ? (
            <EmptyState text="هنوز هیچ فروشی ثبت نشده است." />
          ) : (
            <div className="overflow-x-auto rounded-lg bg-surface shadow-sm">
              <table className="w-full text-right text-bodySm">
                <thead className="border-b border-border text-caption text-text-muted">
                  <tr>
                    <th className="p-3">محصول</th>
                    <th className="p-3">تعداد فروخته‌شده</th>
                    <th className="p-3">فروش</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.topProducts.map((row) => (
                    <tr key={row.productId} className="border-b border-border last:border-0">
                      <td className="p-3">{row.productName}</td>
                      <td className="p-3">{row.quantitySold.toLocaleString("fa-IR")}</td>
                      <td className="p-3 font-medium">{toman(row.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </Container>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone?: "warning" | "error" | "success" }) {
  const toneClass =
    tone === "error" ? "text-state-error" : tone === "warning" ? "text-state-warning" : tone === "success" ? "text-state-success" : "text-text-primary";
  return (
    <div className="rounded-lg bg-surface p-4 shadow-sm">
      <p className="text-caption text-text-muted">{label}</p>
      <p className={`text-stat ${toneClass}`}>{value}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-lg bg-surface p-6 text-center text-bodySm text-text-muted shadow-sm">{text}</div>;
}
