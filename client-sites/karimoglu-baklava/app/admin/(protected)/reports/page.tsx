import { Container } from "@/components/ui/Container";
import { requirePageAccess } from "@/lib/auth/adminGuard";
import { AccessDenied } from "@/components/admin/AccessDenied";
import {
  getLowSellingProducts,
  getOrderStatsReport,
  getSalesByBranch,
  getSalesReport,
  getTopProducts,
  isValidSalesPeriod,
  type SalesPeriod,
} from "@/lib/server/reportsRepo";

export const dynamic = "force-dynamic";

function toman(amount: number): string {
  return `${amount.toLocaleString("fa-IR")} تومان`;
}

export default async function AdminReportsPage({ searchParams }: { searchParams: { period?: string } }) {
  const access = await requirePageAccess("reports.view");
  if (!access.allowed) return <AccessDenied />;

  // searchParams از URL می‌آید — یعنی در Runtime فقط رشته خام است، نه لزوماً
  // یکی از مقادیر مجاز `SalesPeriod`؛ نوع قبلی این را از TypeScript پنهان
  // می‌کرد. اینجا صراحتاً Runtime Validate می‌شود (علاوه بر دفاع مشابه داخل
  // خود `getSalesReport`).
  const period: SalesPeriod = isValidSalesPeriod(searchParams.period) ? searchParams.period : "daily";
  const sales = (await getSalesReport(period)).slice(-14); // ۱۴ دوره اخیر — نمودار خیلی طولانی نشود
  const byBranch = await getSalesByBranch();
  const topProducts = await getTopProducts(10);
  const lowSelling = await getLowSellingProducts(10);
  const stats = await getOrderStatsReport();

  return (
    <Container className="flex flex-col gap-8 py-2">
      <div>
        <h1 className="text-h2 text-text-primary">گزارش‌ها</h1>
        <p className="text-bodySm text-text-secondary">تمام اعداد این صفحه از سفارش‌های واقعی ثبت‌شده محاسبه شده‌اند.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 tablet:grid-cols-4">
        <StatCard label="تعداد کل سفارش‌ها" value={stats.orderCount.toLocaleString("fa-IR")} />
        <StatCard label="میانگین مبلغ سفارش" value={toman(stats.averageOrderValue)} />
        <StatCard label="نرخ لغو" value={`${stats.cancellationRate.toLocaleString("fa-IR")}٪`} />
        <StatCard label="سفارش پرداخت‌شده" value={(stats.paymentStatusBreakdown.succeeded ?? 0).toLocaleString("fa-IR")} />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-h4 text-text-primary">فروش دوره‌ای</h2>
          <form method="get" className="flex gap-2">
            {(["daily", "weekly", "monthly", "yearly"] as SalesPeriod[]).map((p) => (
              <button
                key={p}
                type="submit"
                name="period"
                value={p}
                className={`rounded-full px-3 py-1 text-caption ${period === p ? "bg-brand-black text-white" : "border border-border-strong text-text-secondary"}`}
              >
                {{ daily: "روزانه", weekly: "هفتگی", monthly: "ماهانه", yearly: "سالانه" }[p]}
              </button>
            ))}
          </form>
        </div>
        {sales.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto rounded-lg bg-surface shadow-sm">
            <table className="w-full text-right text-bodySm">
              <thead className="border-b border-border text-caption text-text-muted">
                <tr>
                  <th className="p-3">دوره</th>
                  <th className="p-3">تعداد سفارش</th>
                  <th className="p-3">فروش</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((row) => (
                  <tr key={row.period} className="border-b border-border last:border-0">
                    <td className="p-3">{row.period}</td>
                    <td className="p-3">{row.orderCount.toLocaleString("fa-IR")}</td>
                    <td className="p-3 font-medium">{toman(row.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 desktop:grid-cols-2">
        <section>
          <h2 className="mb-3 text-h4 text-text-primary">فروش هر شعبه</h2>
          {byBranch.length === 0 ? (
            <EmptyState />
          ) : (
            <SimpleTable
              columns={["شعبه", "تعداد سفارش", "فروش"]}
              rows={byBranch.map((b) => [b.branchName, b.orderCount.toLocaleString("fa-IR"), toman(b.revenue)])}
            />
          )}
        </section>

        <section>
          <h2 className="mb-3 text-h4 text-text-primary">وضعیت پرداخت سفارش‌ها</h2>
          <SimpleTable
            columns={["وضعیت", "تعداد"]}
            rows={Object.entries(stats.paymentStatusBreakdown).map(([k, v]) => [k, v.toLocaleString("fa-IR")])}
          />
        </section>

        <section>
          <h2 className="mb-3 text-h4 text-text-primary">محصولات پرفروش</h2>
          {topProducts.length === 0 ? (
            <EmptyState />
          ) : (
            <SimpleTable
              columns={["محصول", "تعداد فروخته‌شده", "فروش"]}
              rows={topProducts.map((p) => [p.productName, p.quantitySold.toLocaleString("fa-IR"), toman(p.revenue)])}
            />
          )}
        </section>

        <section>
          <h2 className="mb-3 text-h4 text-text-primary">محصولات کم‌فروش</h2>
          {lowSelling.length === 0 ? (
            <EmptyState />
          ) : (
            <SimpleTable
              columns={["محصول", "تعداد فروخته‌شده", "فروش"]}
              rows={lowSelling.map((p) => [p.productName, p.quantitySold.toLocaleString("fa-IR"), toman(p.revenue)])}
            />
          )}
        </section>
      </div>
    </Container>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface p-4 shadow-sm">
      <p className="text-caption text-text-muted">{label}</p>
      <p className="text-stat text-text-primary">{value}</p>
    </div>
  );
}

function SimpleTable({ columns, rows }: { columns: string[]; rows: string[][] }) {
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
  return <div className="rounded-lg bg-surface p-6 text-center text-bodySm text-text-muted shadow-sm">هنوز داده‌ای برای نمایش نیست.</div>;
}
