"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  branchId: string;
  productId: string;
  variantId: string;
  currentOnHand: number;
  currentReserved: number;
}

/**
 * ✅ به‌روزرسانی امنیتی Prompt 10: این فرم دیگر «نقش بازیگر» را از کاربر
 * نمی‌پرسد و به‌عنوان هدر ارسال نمی‌کند (آن روش Prompt 9 یک Placeholder
 * صریحاً ناامن بود). حالا هویت/نقش واقعی از Session Cookie کاربر لاگین‌شده
 * (`/admin/login`) در دیتابیس خوانده می‌شود — کلاینت هیچ کنترلی روی نقش
 * خودش ندارد.
 */
export function InventoryAdjustForm({ branchId, productId, variantId, currentOnHand, currentReserved }: Props) {
  const router = useRouter();
  const [newOnHand, setNewOnHand] = useState(currentOnHand);
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setMessage(null);

    try {
      const res = await fetch("/api/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-requested-with": "karimoglu-web" },
        body: JSON.stringify({ branchId, productId, variantId, newOnHand, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "خطایی رخ داد. (آیا وارد پنل مدیریت شده‌اید؟ /admin/login)");
        return;
      }
      setStatus("done");
      setMessage("موجودی با موفقیت به‌روزرسانی شد.");
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("ارتباط با سرور برقرار نشد.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 rounded-lg bg-surface p-4 shadow-sm">
      <div className="flex flex-col gap-1">
        <label className="text-caption text-text-muted">موجودی فعلی: {currentOnHand} (رزروشده: {currentReserved})</label>
        <input
          type="number"
          min={0}
          value={newOnHand}
          onChange={(e) => setNewOnHand(Number(e.target.value))}
          className="w-28 rounded-md border border-border-strong px-2 py-1.5 text-bodySm"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <label className="text-caption text-text-muted">دلیل تغییر (الزامی)</label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="مثلاً: شمارش دستی انبار / تأمین مجدد"
          className="rounded-md border border-border-strong px-2 py-1.5 text-bodySm"
        />
      </div>

      <button
        type="submit"
        disabled={status === "saving"}
        className="rounded-md bg-brand-black px-4 py-1.5 text-bodySm text-white disabled:opacity-50"
      >
        {status === "saving" ? "در حال ثبت..." : "ثبت اصلاح"}
      </button>

      {message && (
        <p className={`w-full text-caption ${status === "error" ? "text-state-error" : "text-state-success"}`}>{message}</p>
      )}
    </form>
  );
}
