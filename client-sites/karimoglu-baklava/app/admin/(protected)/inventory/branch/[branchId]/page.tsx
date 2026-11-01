import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { branches } from "@/lib/mock-data";
import { getBranchInventoryOverview } from "@/lib/inventory/core";
import { InventoryAdjustForm } from "@/components/admin/InventoryAdjustForm";

export const dynamic = "force-dynamic";

export default async function BranchInventoryPage({ params }: { params: { branchId: string } }) {
  const branch = branches.find((b) => b.id === params.branchId);
  if (!branch) notFound();

  const items = await getBranchInventoryOverview(branch.id);
  const outOfStock = items.filter((i) => i.available === 0).length;

  return (
    <Container className="flex flex-col gap-6 py-10">
      <div>
        <h1 className="text-h2 text-text-primary">موجودی شعبه {branch.name}</h1>
        <p className="text-bodySm text-text-secondary">
          {items.length} ترکیب محصول/Variant ردیابی می‌شود — {outOfStock} مورد ناموجود.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg bg-surface shadow-sm">
        <table className="w-full text-right text-bodySm">
          <thead className="border-b border-border text-caption text-text-muted">
            <tr>
              <th className="p-3">محصول</th>
              <th className="p-3">Variant</th>
              <th className="p-3">موجودی فیزیکی</th>
              <th className="p-3">رزروشده</th>
              <th className="p-3">قابل فروش</th>
              <th className="p-3">فروخته‌شده (تجمعی)</th>
              <th className="p-3">آخرین به‌روزرسانی</th>
              <th className="p-3">اصلاح</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={`${item.productId}:${item.variantId}`} className="border-b border-border align-top last:border-0">
                <td className="p-3">{item.productName}</td>
                <td className="p-3 text-caption text-text-muted">{item.variantLabel}</td>
                <td className="p-3">{item.onHand}</td>
                <td className="p-3">{item.reserved}</td>
                <td className={`p-3 font-medium ${item.available === 0 ? "text-state-error" : "text-text-primary"}`}>
                  {item.available}
                </td>
                <td className="p-3 text-caption text-text-muted">{item.sold}</td>
                <td className="p-3 text-caption text-text-muted">
                  {new Date(item.updatedAt).toLocaleString("fa-IR")}
                </td>
                <td className="p-3">
                  <details>
                    <summary className="cursor-pointer text-caption text-brand-red">اصلاح موجودی</summary>
                    <div className="mt-2 min-w-[520px]">
                      <InventoryAdjustForm
                        branchId={branch.id}
                        productId={item.productId}
                        variantId={item.variantId}
                        currentOnHand={item.onHand}
                        currentReserved={item.reserved}
                      />
                    </div>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
}
