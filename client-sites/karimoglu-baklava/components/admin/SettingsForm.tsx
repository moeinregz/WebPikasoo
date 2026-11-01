"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SETTING_FIELDS } from "@/lib/settingsFields";

const GROUP_LABELS: Record<string, string> = {
  store: "اطلاعات فروشگاه",
  orders: "تنظیمات سفارش",
  delivery: "تنظیمات ارسال",
  payment: "تنظیمات پرداخت",
  sms: "تنظیمات پیامک",
  seo: "تنظیمات SEO",
};

export function SettingsForm({ initial }: { initial: Record<string, string> }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const groups = Array.from(new Set(SETTING_FIELDS.map((f) => f.group)));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-requested-with": "karimoglu-web" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json();
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {groups.map((group) => (
        <section key={group} className="rounded-lg bg-surface p-4 shadow-sm">
          <h2 className="mb-3 text-h4 text-text-primary">{GROUP_LABELS[group] ?? group}</h2>
          <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
            {SETTING_FIELDS.filter((f) => f.group === group).map((field) => (
              <div key={field.key} className="flex flex-col gap-1">
                <label className="text-caption text-text-muted">{field.label}</label>
                <input
                  value={values[field.key] ?? ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  className="rounded-md border border-border-strong px-3 py-1.5 text-bodySm"
                />
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={status === "saving"} className="rounded-md bg-brand-black px-5 py-2 text-bodySm text-white disabled:opacity-50">
          {status === "saving" ? "در حال ذخیره..." : "ذخیره تنظیمات"}
        </button>
        {message && <p className="text-caption text-state-error">{message}</p>}
      </div>
    </form>
  );
}
