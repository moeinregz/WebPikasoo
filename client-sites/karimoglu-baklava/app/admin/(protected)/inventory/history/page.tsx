import { Container } from "@/components/ui/Container";
import { branches } from "@/lib/mock-data";
import { getTransactionHistory } from "@/lib/inventory/core";
import type { InventoryTransactionType } from "@/lib/inventory/types";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<InventoryTransactionType, string> = {
  manual_entry: "ورود دستی",
  manual_adjustment: "اصلاح دستی",
  reservation_created: "رزرو سفارش",
  reservation_released: "آزادسازی رزرو",
  sale_committed: "فروش قطعی",
  order_cancelled: "لغو سفارش (بازگشت موجودی)",
  warehouse_receipt: "ورود به انبار مرکزی",
  warehouse_transfer_out: "خروج از انبار (انتقال)",
  branch_transfer_in: "ورود به شعبه (از انبار)",
  correction: "اصلاح اشتباه",
};

export default async function InventoryHistoryPage({
  searchParams,
}: {
  searchParams: { branchId?: string; productId?: string; orderId?: string; type?: string };
}) {
  const transactions = await getTransactionHistory({
    branchId: searchParams.branchId || undefined,
    productId: searchParams.productId || undefined,
    orderId: searchParams.orderId || undefined,
    type: (searchParams.type as InventoryTransactionType) || undefined,
    limit: 200,
  });

  return (
    <Container className="flex flex-col gap-6 py-10">
      <div>
        <h1 className="text-h2 text-text-primary">تاریخچه موجودی (Audit)</h1>
        <p className="text-bodySm text-text-secondary">۲۰۰ تراکنش اخیر — قابل فیلتر بر اساس شعبه، محصول، سفارش یا نوع تراکنش.</p>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg bg-surface p-4 shadow-sm" method="get">
        <FilterField label="شعبه" name="branchId" defaultValue={searchParams.branchId}>
          <option value="">همه</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </FilterField>

        <FilterField label="نوع تراکنش" name="type" defaultValue={searchParams.type}>
          <option value="">همه</option>
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </FilterField>

        <div className="flex flex-col gap-1">
          <label className="text-caption text-text-muted">شناسه محصول</label>
          <input name="productId" defaultValue={searchParams.productId} className="rounded-md border border-border-strong px-2 py-1.5 text-bodySm" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-caption text-text-muted">شناسه سفارش</label>
          <input name="orderId" defaultValue={searchParams.orderId} className="rounded-md border border-border-strong px-2 py-1.5 text-bodySm" />
        </div>

        <button type="submit" className="rounded-md bg-brand-black px-4 py-1.5 text-bodySm text-white">
          اعمال فیلتر
        </button>
      </form>

      {transactions.length === 0 ? (
        <p className="text-bodySm text-text-muted">هیچ تراکنشی با این فیلترها یافت نشد.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-surface shadow-sm">
          <table className="w-full text-right text-bodySm">
            <thead className="border-b border-border text-caption text-text-muted">
              <tr>
                <th className="p-3">زمان</th>
                <th className="p-3">نوع</th>
                <th className="p-3">شعبه/انبار</th>
                <th className="p-3">محصول/Variant</th>
                <th className="p-3">تغییر موجودی</th>
                <th className="p-3">رزرو قبل → بعد</th>
                <th className="p-3">سفارش</th>
                <th className="p-3">بازیگر</th>
                <th className="p-3">دلیل</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => {
                const branchName = t.branchId ? branches.find((b) => b.id === t.branchId)?.name ?? t.branchId : null;
                return (
                  <tr key={t.id} className="border-b border-border last:border-0">
                    <td className="p-3 text-caption text-text-muted">{new Date(t.createdAt).toLocaleString("fa-IR")}</td>
                    <td className="p-3">{TYPE_LABELS[t.type]}</td>
                    <td className="p-3">{branchName ?? t.warehouseId ?? "—"}</td>
                    <td className="p-3 text-caption text-text-muted">
                      {t.productId} / {t.variantId}
                    </td>
                    <td className={`p-3 font-medium ${t.onHandDelta < 0 ? "text-state-error" : t.onHandDelta > 0 ? "text-state-success" : "text-text-muted"}`}>
                      {t.onHandBefore} → {t.onHandAfter}
                    </td>
                    <td className="p-3 text-caption text-text-muted">
                      {t.reservedBefore} → {t.reservedAfter}
                    </td>
                    <td className="p-3 text-caption text-text-muted">{t.orderId ?? "—"}</td>
                    <td className="p-3 text-caption text-text-muted">
                      {t.actorRole} ({t.actorId})
                    </td>
                    <td className="p-3 text-caption text-text-muted">{t.reason ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Container>
  );
}

function FilterField({
  label,
  name,
  defaultValue,
  children,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-caption text-text-muted">{label}</label>
      <select name={name} defaultValue={defaultValue ?? ""} className="rounded-md border border-border-strong px-2 py-1.5 text-bodySm">
        {children}
      </select>
    </div>
  );
}
