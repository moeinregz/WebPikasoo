"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS } from "@/lib/server/orderStatusLabels";
import type { OrderStatus } from "@/lib/types";

export function OrderStatusForm({ orderId, currentStatus }: { orderId: string; currentStatus: OrderStatus }) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [note, setNote] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === currentStatus) return;
    // طبق بخش ۱۷ Prompt («Confirmation برای عملیات حساس»)
    if (!window.confirm(`وضعیت سفارش به «${ORDER_STATUS_LABELS[status]}» تغییر کند؟`)) return;

    setState("saving");
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-requested-with": "karimoglu-web" },
        body: JSON.stringify({ status, note: note || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState("error");
        setMessage(data.error ?? "خطا در تغییر وضعیت.");
        return;
      }
      router.refresh();
    } catch {
      setState("error");
      setMessage("ارتباط با سرور برقرار نشد.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-caption text-text-muted">تغییر وضعیت</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          className="rounded-md border border-border-strong px-2 py-1.5 text-bodySm"
        >
          {ORDER_STATUS_FLOW.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-1 min-w-[180px] flex-col gap-1">
        <label className="text-caption text-text-muted">یادداشت (اختیاری)</label>
        <input value={note} onChange={(e) => setNote(e.target.value)} className="rounded-md border border-border-strong px-3 py-1.5 text-bodySm" />
      </div>
      <button
        type="submit"
        disabled={state === "saving" || status === currentStatus}
        className="rounded-md bg-brand-black px-4 py-1.5 text-bodySm text-white disabled:opacity-50"
      >
        {state === "saving" ? "در حال ثبت..." : "ثبت تغییر"}
      </button>
      {message && <p className="w-full text-caption text-state-error">{message}</p>}
    </form>
  );
}
