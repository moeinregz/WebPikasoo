"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

interface Me {
  authenticated: boolean;
  userId?: string;
  mobile?: string | null;
  name?: string | null;
}

async function apiPost(path: string, body: unknown) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-requested-with": "karimoglu-web" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "خطایی رخ داد.");
  return data;
}

export function AccountView() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(setMe)
      .catch(() => setMe({ authenticated: false }));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "login") {
        await apiPost("/api/auth/login", { mobile, password });
      } else {
        await apiPost("/api/auth/register", { mobile, password, name: name || undefined });
      }
      router.refresh();
      const fresh = await fetch("/api/auth/me").then((r) => r.json());
      setMe(fresh);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطایی رخ داد.");
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    setBusy(true);
    try {
      await apiPost("/api/auth/logout", {});
      setMe({ authenticated: false });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (me === null) {
    return <p className="text-bodySm text-text-secondary">در حال بارگذاری...</p>;
  }

  if (me.authenticated) {
    return (
      <div className="flex flex-col gap-6">
        <div className="rounded-lg border border-border p-5">
          <p className="text-bodySm text-text-secondary">خوش آمدید</p>
          <p className="text-h4 text-text-primary">{me.name || me.mobile}</p>
          {me.name && <p className="text-bodySm text-text-secondary">{me.mobile}</p>}
        </div>

        <div className="rounded-lg border border-dashed border-border p-5 text-bodySm text-text-secondary">
          تاریخچه سفارش‌ها و مدیریت پروفایل کامل به‌زودی در این بخش اضافه می‌شود.
          برای پیگیری یک سفارش مشخص، از لینکی که بعد از ثبت سفارش دریافت کرده‌اید استفاده کنید.
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={busy}
          className="w-fit rounded-md border border-brand-black px-6 py-2.5 text-btn text-brand-black hover:bg-brand-black hover:text-text-inverse disabled:opacity-50"
        >
          خروج از حساب
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 border-b border-border">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`px-4 py-2 text-btn ${mode === "login" ? "border-b-2 border-brand-red text-text-primary" : "text-text-secondary"}`}
        >
          ورود
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`px-4 py-2 text-btn ${mode === "register" ? "border-b-2 border-brand-red text-text-primary" : "text-text-secondary"}`}
        >
          ثبت‌نام
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-4">
        {mode === "register" && (
          <label className="flex flex-col gap-1.5 text-bodySm text-text-secondary">
            نام (اختیاری)
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-md border border-border px-3 py-2.5 text-body text-text-primary"
              autoComplete="name"
            />
          </label>
        )}
        <label className="flex flex-col gap-1.5 text-bodySm text-text-secondary">
          شماره موبایل
          <input
            type="tel"
            required
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="09xxxxxxxxx"
            className="rounded-md border border-border px-3 py-2.5 text-body text-text-primary"
            autoComplete="tel"
            dir="ltr"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-bodySm text-text-secondary">
          رمز عبور
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-border px-3 py-2.5 text-body text-text-primary"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </label>

        {error && (
          <p role="alert" className="text-bodySm text-brand-red">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-brand-black px-6 py-3 text-btn text-text-inverse hover:bg-[#242424] disabled:opacity-50"
        >
          {busy ? "..." : mode === "login" ? "ورود" : "ساخت حساب"}
        </button>
      </form>
    </div>
  );
}
