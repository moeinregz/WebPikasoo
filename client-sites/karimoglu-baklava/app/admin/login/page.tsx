"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * ورود پنل مدیریت — طبق ارتقای امنیتی Prompt 10، دیگر هیچ نقشی از طریق هدر
 * قابل‌جعل کلاینت پذیرفته نمی‌شود. ورود موفق یک Cookie Session واقعی
 * (HttpOnly) می‌گذارد؛ نقش واقعی کاربر از جدول `user_roles` در دیتابیس
 * خوانده می‌شود، نه از چیزی که این فرم ارسال می‌کند.
 *
 * حساب پیش‌فرض توسعه (طبق `lib/db/seed.ts`، فقط برای محیط توسعه):
 * موبایل ۰۹۱۲۰۰۰۰۰۰۰ / رمز ChangeMe123!
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-requested-with": "karimoglu-web" },
        body: JSON.stringify({ mobile, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "ورود ناموفق بود.");
        setLoading(false);
        return;
      }
      router.push("/admin/inventory");
      router.refresh();
    } catch {
      setError("ارتباط با سرور برقرار نشد.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4 py-16">
      <h1 className="text-h3 text-text-primary">ورود پنل مدیریت</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg bg-surface p-5 shadow-sm">
        <div className="flex flex-col gap-1">
          <label className="text-caption text-text-muted">شماره موبایل</label>
          <input
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="09xxxxxxxxx"
            className="rounded-md border border-border-strong px-3 py-2 text-bodySm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-caption text-text-muted">رمز عبور</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-border-strong px-3 py-2 text-bodySm"
          />
        </div>
        {error && <p className="text-caption text-state-error">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-brand-black px-4 py-2 text-bodySm text-white disabled:opacity-50"
        >
          {loading ? "در حال ورود..." : "ورود"}
        </button>
      </form>
    </div>
  );
}
