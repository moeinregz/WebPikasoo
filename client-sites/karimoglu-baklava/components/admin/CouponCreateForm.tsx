"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CampaignRow } from "@/lib/server/couponsRepo";

export function CouponCreateForm({ campaigns }: { campaigns: CampaignRow[] }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "amount">("percent");
  const [discountValue, setDiscountValue] = useState(10);
  const [minOrderAmount, setMinOrderAmount] = useState<number | "">("");
  const [maxUses, setMaxUses] = useState<number | "">("");
  const [perUserLimit, setPerUserLimit] = useState<number | "">(1);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [campaignId, setCampaignId] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setMessage(null);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-requested-with": "karimoglu-web" },
        body: JSON.stringify({
          code,
          campaignId: campaignId || null,
          percent: discountType === "percent" ? discountValue : null,
          amount: discountType === "amount" ? discountValue : null,
          minOrderAmount: minOrderAmount === "" ? null : minOrderAmount,
          maxUses: maxUses === "" ? null : maxUses,
          perUserLimit: perUserLimit === "" ? null : perUserLimit,
          startsAt: startsAt || null,
          endsAt: endsAt || null,
          isActive: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "خطا در ایجاد کد تخفیف.");
        return;
      }
      setCode("");
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("ارتباط با سرور برقرار نشد.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 rounded-lg bg-surface p-4 shadow-sm tablet:grid-cols-4">
      <input placeholder="کد (مثلاً EID10)" value={code} onChange={(e) => setCode(e.target.value)} dir="ltr" required className="rounded-md border border-border-strong px-3 py-1.5 text-bodySm" />
      <select value={discountType} onChange={(e) => setDiscountType(e.target.value as typeof discountType)} className="rounded-md border border-border-strong px-2 py-1.5 text-bodySm">
        <option value="percent">درصدی</option>
        <option value="amount">مبلغ ثابت</option>
      </select>
      <input type="number" placeholder="مقدار" value={discountValue} onChange={(e) => setDiscountValue(Number(e.target.value))} className="rounded-md border border-border-strong px-3 py-1.5 text-bodySm" />
      <select value={campaignId} onChange={(e) => setCampaignId(e.target.value)} className="rounded-md border border-border-strong px-2 py-1.5 text-bodySm">
        <option value="">بدون کمپین</option>
        {campaigns.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <input type="number" placeholder="حداقل مبلغ سفارش" value={minOrderAmount} onChange={(e) => setMinOrderAmount(e.target.value === "" ? "" : Number(e.target.value))} className="rounded-md border border-border-strong px-3 py-1.5 text-bodySm" />
      <input type="number" placeholder="محدودیت تعداد کل استفاده" value={maxUses} onChange={(e) => setMaxUses(e.target.value === "" ? "" : Number(e.target.value))} className="rounded-md border border-border-strong px-3 py-1.5 text-bodySm" />
      <input type="number" placeholder="محدودیت به‌ازای هر کاربر" value={perUserLimit} onChange={(e) => setPerUserLimit(e.target.value === "" ? "" : Number(e.target.value))} className="rounded-md border border-border-strong px-3 py-1.5 text-bodySm" />
      <input type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="rounded-md border border-border-strong px-3 py-1.5 text-bodySm" />
      <input type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className="rounded-md border border-border-strong px-3 py-1.5 text-bodySm" />
      <button type="submit" disabled={status === "saving"} className="rounded-md bg-brand-black px-4 py-1.5 text-bodySm text-white disabled:opacity-50">
        {status === "saving" ? "..." : "ایجاد کد تخفیف"}
      </button>
      {message && <p className="col-span-full text-caption text-state-error">{message}</p>}
    </form>
  );
}
