"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BranchAdminRow } from "@/lib/server/branchesAdminRepo";

export function BranchEditForm({ branch }: { branch: BranchAdminRow }) {
  const router = useRouter();
  const [address, setAddress] = useState(branch.address ?? "");
  const [phone, setPhone] = useState(branch.phone ?? "");
  const [openingHours, setOpeningHours] = useState(branch.openingHours);
  const [hasCafeService, setHasCafeService] = useState(branch.hasCafeService);
  const [hasPos, setHasPos] = useState(branch.hasPos);
  const [supportsCashOnDelivery, setSupportsCashOnDelivery] = useState(branch.supportsCashOnDelivery);
  const [managerName, setManagerName] = useState(branch.managerName ?? "");
  const [managerPhone, setManagerPhone] = useState(branch.managerPhone ?? "");
  const [isActive, setIsActive] = useState(branch.isActive);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/branches/${branch.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-requested-with": "karimoglu-web" },
        body: JSON.stringify({
          address: address || null,
          phone: phone || null,
          openingHours,
          hasCafeService,
          hasPos,
          supportsCashOnDelivery,
          managerName: managerName || null,
          managerPhone: managerPhone || null,
          isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "خطا در ذخیره‌سازی.");
        return;
      }
      setStatus("idle");
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("ارتباط با سرور برقرار نشد.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-1 min-w-[220px] flex-col gap-1">
          <label className="text-caption text-text-muted">آدرس</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="هنوز ثبت نشده"
            className="rounded-md border border-border-strong px-3 py-1.5 text-bodySm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-caption text-text-muted">تلفن</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" className="rounded-md border border-border-strong px-3 py-1.5 text-bodySm" />
        </div>
        <div className="flex flex-1 min-w-[160px] flex-col gap-1">
          <label className="text-caption text-text-muted">ساعت کاری</label>
          <input value={openingHours} onChange={(e) => setOpeningHours(e.target.value)} className="rounded-md border border-border-strong px-3 py-1.5 text-bodySm" />
        </div>
      </div>

      {/* اطلاعات داخلی — فقط همین‌جا (پشت RBAC) قابل مشاهده/ویرایش است،
          هرگز در هیچ صفحه عمومی سایت نمایش داده نمی‌شود */}
      <div className="flex flex-wrap items-end gap-3 rounded-md bg-bg-secondary p-3">
        <span className="w-full text-caption text-text-muted">اطلاعات داخلی مسئول شعبه (فقط پنل ادمین)</span>
        <div className="flex flex-col gap-1">
          <label className="text-caption text-text-muted">نام مسئول</label>
          <input value={managerName} onChange={(e) => setManagerName(e.target.value)} className="rounded-md border border-border-strong px-3 py-1.5 text-bodySm" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-caption text-text-muted">موبایل مسئول</label>
          <input value={managerPhone} onChange={(e) => setManagerPhone(e.target.value)} dir="ltr" className="rounded-md border border-border-strong px-3 py-1.5 text-bodySm" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1 text-caption text-text-primary">
          <input type="checkbox" checked={hasCafeService} onChange={(e) => setHasCafeService(e.target.checked)} />
          کافه
        </label>
        <label className="flex items-center gap-1 text-caption text-text-primary">
          <input type="checkbox" checked={hasPos} onChange={(e) => setHasPos(e.target.checked)} />
          کارت‌خوان در شعبه
        </label>
        <label className="flex items-center gap-1 text-caption text-text-primary">
          <input
            type="checkbox"
            checked={supportsCashOnDelivery}
            onChange={(e) => setSupportsCashOnDelivery(e.target.checked)}
          />
          پرداخت درب منزل
        </label>
        <label className="flex items-center gap-1 text-caption text-text-primary">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          فعال
        </label>
        <button type="submit" disabled={status === "saving"} className="rounded-md bg-brand-black px-4 py-1.5 text-bodySm text-white disabled:opacity-50">
          {status === "saving" ? "..." : "ذخیره"}
        </button>
      </div>
      {message && <p className="w-full text-caption text-state-error">{message}</p>}
    </form>
  );
}
