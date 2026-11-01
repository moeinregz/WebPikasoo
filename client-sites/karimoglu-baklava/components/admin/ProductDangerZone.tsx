"use client";

import { useRouter } from "next/navigation";

export function ProductDangerZone({ productId, isDeleted }: { productId: string; isDeleted: boolean }) {
  const router = useRouter();

  async function handleDelete() {
    if (!window.confirm("این محصول حذف منطقی شود؟ همچنان در گزارش‌ها و سفارش‌های قبلی باقی می‌ماند.")) return;
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: "DELETE",
      headers: { "x-requested-with": "karimoglu-web" },
    });
    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    }
  }

  if (isDeleted) {
    return (
      <div className="rounded-lg border border-state-error bg-state-errorBg p-4 text-bodySm text-state-error">
        این محصول حذف منطقی شده و در فروشگاه نمایش داده نمی‌شود.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-state-error p-4">
      <p className="mb-2 text-bodySm text-text-primary">حذف محصول</p>
      <button type="button" onClick={handleDelete} className="rounded-md border border-state-error px-4 py-1.5 text-bodySm text-state-error">
        حذف منطقی محصول
      </button>
    </div>
  );
}
