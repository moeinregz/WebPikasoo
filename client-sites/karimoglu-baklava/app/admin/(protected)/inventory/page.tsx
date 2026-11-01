import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { branches } from "@/lib/mock-data";
import { getInventorySummary, getLowStockItems } from "@/lib/inventory/core";

export const dynamic = "force-dynamic";

/**
 * ⚠️ همان محدودیت صفحه `/admin/branch-selection` (Prompt 8): این صفحه هنوز
 * پشت هیچ احراز هویتی نیست — طبق Blueprint، پنل مدیریت واقعی باید پشت
 * Session/RBAC واقعی قرار گیرد. منطق RBAC خودش (`lib/inventory/rbac.ts`) کامل
 * پیاده‌سازی شده و روی API Routeهای موجودی (`/api/inventory/*`) Enforce
 * می‌شود؛ همین صفحات سرور-ساخته (Server Component) چون مستقیماً از سرویس
 * مرکزی می‌خوانند، فعلاً از همان محافظت عبور نمی‌کنند — این‌جا هم باید در فاز
 * اتصال Auth واقعی اصلاح شود.
 */
export default async function InventoryOverviewPage() {
  const summary = await getInventorySummary();
  const lowStock = (await getLowStockItems()).slice(0, 20);

  return (
    <Container className="flex flex-col gap-8 py-10">
      <div>
        <h1 className="text-h2 text-text-primary">نمای کلی موجودی</h1>
        <p className="text-bodySm text-text-secondary">
          خلاصه وضعیت موجودی همه شعب — برای بررسی دقیق‌تر هر شعبه از فهرست زیر استفاده کنید.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <SummaryCard label="تعداد شعب" value={summary.branchCount} />
        <SummaryCard label="ترکیب‌های محصول/Variant ردیابی‌شده" value={summary.trackedSkuCount} />
        <SummaryCard label="ناموجود" value={summary.outOfStockCount} tone="error" />
        <SummaryCard label="کم‌موجود" value={summary.lowStockCount} tone="warning" />
        <SummaryCard label="رزرو فعال" value={summary.activeReservationCount} />
      </div>

      <div>
        <h2 className="mb-3 text-h4 text-text-primary">شعب</h2>
        <div className="flex flex-wrap gap-2">
          {branches.map((branch) => (
            <Link
              key={branch.id}
              href={`/admin/inventory/branch/${branch.id}`}
              className="rounded-full border border-border-strong px-4 py-1.5 text-bodySm text-text-primary hover:border-brand-black"
            >
              {branch.name}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-h4 text-text-primary">کم‌موجود / ناموجود (۲۰ مورد اول)</h2>
          <Link href="/admin/inventory/history" className="text-bodySm text-brand-red hover:underline">
            مشاهده تاریخچه کامل ←
          </Link>
        </div>

        {lowStock.length === 0 ? (
          <p className="text-bodySm text-text-muted">هیچ موردی زیر آستانه موجودی کم نیست.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg bg-surface shadow-sm">
            <table className="w-full text-right text-bodySm">
              <thead className="border-b border-border text-caption text-text-muted">
                <tr>
                  <th className="p-3">شعبه</th>
                  <th className="p-3">محصول</th>
                  <th className="p-3">Variant</th>
                  <th className="p-3">موجودی فیزیکی</th>
                  <th className="p-3">رزروشده</th>
                  <th className="p-3">قابل فروش</th>
                  <th className="p-3">آستانه</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((row) => {
                  const branchName = branches.find((b) => b.id === row.branchId)?.name ?? row.branchId;
                  return (
                    <tr key={`${row.branchId}:${row.productId}:${row.variantId}`} className="border-b border-border last:border-0">
                      <td className="p-3">{branchName}</td>
                      <td className="p-3">{row.productName}</td>
                      <td className="p-3 text-caption text-text-muted">{row.variantLabel}</td>
                      <td className="p-3">{row.onHand}</td>
                      <td className="p-3">{row.reserved}</td>
                      <td className={`p-3 font-medium ${row.available === 0 ? "text-state-error" : "text-state-warning"}`}>
                        {row.available}
                      </td>
                      <td className="p-3 text-caption text-text-muted">{row.threshold}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Container>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone?: "warning" | "error" }) {
  const toneClass = tone === "error" ? "text-state-error" : tone === "warning" ? "text-state-warning" : "text-text-primary";
  return (
    <div className="rounded-lg bg-surface p-4 shadow-sm">
      <p className="text-caption text-text-muted">{label}</p>
      <p className={`text-h3 ${toneClass}`}>{value}</p>
    </div>
  );
}
