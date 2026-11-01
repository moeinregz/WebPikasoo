"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CampaignCreateForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const res = await fetch("/api/admin/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-requested-with": "karimoglu-web" },
      body: JSON.stringify({ name, description: description || null, startsAt: startsAt || null, endsAt: endsAt || null, isActive: true }),
    });
    if (res.ok) {
      setName("");
      setDescription("");
      router.refresh();
    } else {
      setStatus("error");
    }
    setStatus("idle");
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 rounded-lg bg-surface p-4 shadow-sm tablet:grid-cols-4">
      <input placeholder="نام کمپین" value={name} onChange={(e) => setName(e.target.value)} required className="rounded-md border border-border-strong px-3 py-1.5 text-bodySm" />
      <input placeholder="توضیح" value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-md border border-border-strong px-3 py-1.5 text-bodySm tablet:col-span-2" />
      <input type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="rounded-md border border-border-strong px-3 py-1.5 text-bodySm" />
      <input type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className="rounded-md border border-border-strong px-3 py-1.5 text-bodySm" />
      <button type="submit" disabled={status === "saving"} className="rounded-md bg-brand-black px-4 py-1.5 text-bodySm text-white disabled:opacity-50">
        ایجاد کمپین
      </button>
    </form>
  );
}

export function CouponActiveToggle({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter();
  async function toggle() {
    await fetch(`/api/admin/coupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-requested-with": "karimoglu-web" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    router.refresh();
  }
  return (
    <button type="button" onClick={toggle} className="text-caption text-brand-red hover:underline">
      {isActive ? "غیرفعال کردن" : "فعال کردن"}
    </button>
  );
}
