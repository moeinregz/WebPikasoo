"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveSeoSettingsAction, setSeoKeywordStatusAction } from "./actions";
import { formatDateTime } from "./format";

type Run = {
  id: number;
  at: string;
  trigger: "cron" | "manual";
  ok: boolean;
  keyword: string | null;
  post_slug: string | null;
  post_title: string | null;
  linked_post_ids: number[];
  error: string | null;
  metrics?: { words: number; density: number; internal: number; external: number; images: number; lists: number };
};

type Props = {
  settings: { enabled: boolean; interval_days: number; last_run_at: string | null };
  counts: { new: number; used: number; skipped: number };
  keywords: { keyword: string; seed: string; status: "new" | "used" | "skipped" }[];
  runs: Run[];
  hasApiKey: boolean;
  hasCronSecret: boolean;
};

const fa = (n: number) => n.toLocaleString("fa-IR");
const card = "rounded-card border border-ink/[0.14] bg-surface/20 p-5 sm:p-6";
const input =
  "rounded-[10px] border border-ink/[0.16] bg-surface/40 px-3 py-2 text-[14px] text-ink outline-none transition focus:border-accent";

export default function SeoAutomationPanel({ settings, counts, keywords, runs, hasApiKey, hasCronSecret }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [tab, setTab] = useState<"new" | "used" | "skipped">("new");

  async function runNow() {
    setBusy(true);
    setMsg({ ok: true, text: "در حال پیدا کردن کلمه‌ی کلیدی و نوشتن مقاله… (۱ تا ۳ دقیقه)" });
    try {
      const res = await fetch("/api/cron/seo", { method: "POST" });
      const data = await res.json();
      if (data.ok && data.postId) {
        setMsg({ ok: true, text: `منتشر شد: «${data.title}» — کلمه‌ی کلیدی «${data.keyword}»، ${fa(data.linked)} مقاله‌ی قبلی بهش لینک شد. ${fa(data.metrics.words)} کلمه، چگالی ${data.metrics.density.toLocaleString("fa-IR")}٪.` });
      } else if (data.ok) {
        setMsg({ ok: true, text: data.reason });
      } else {
        setMsg({ ok: false, text: data.error || "خطا" });
      }
    } catch {
      setMsg({ ok: false, text: "ارتباط قطع شد؛ چند دقیقه بعد لیست اجراها رو چک کن." });
    }
    setBusy(false);
    router.refresh();
  }

  const shown = keywords.filter((k) => k.status === tab);

  return (
    <div className="flex flex-col gap-5">
      {(!hasApiKey || !hasCronSecret) && (
        <div className="rounded-card border border-red-500/40 bg-red-500/[0.06] p-4 text-[13.5px] leading-7 text-ink">
          برای فعال شدن، این متغیرها رو توی Vercel ← Settings ← Environment Variables بذار و دوباره دیپلوی کن:
          <ul className="mt-1 list-disc pr-5 font-mono text-[12.5px]" dir="ltr">
            {!hasApiKey && <li>ANTHROPIC_API_KEY</li>}
            {!hasCronSecret && <li>CRON_SECRET (any long random string)</li>}
            <li className="opacity-70">PEXELS_API_KEY (optional — real photos instead of placeholders)</li>
          </ul>
        </div>
      )}

      <div className={card}>
        <h3 className="mb-1 text-[17px] font-bold text-ink">اتوماسیون سئو و تولید محتوا</h3>
        <p className="mb-4 text-[13.5px] leading-7 text-dim">
          کلمه‌های کلیدی از جستجوهای واقعی گوگل پیدا می‌شن، هوش مصنوعی با قوانین سئو مقاله می‌نویسه و مستقیم توی وبلاگ منتشر
          می‌کنه. مقاله‌ی جدید به صفحه‌های خدمات و مقاله‌های مرتبط لینک می‌ده و مقاله‌های مرتبط قبلی هم توی «مطالب مرتبط» بهش
          لینک می‌گیرن.
        </p>
        <form action={saveSeoSettingsAction} className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-[14px] text-ink">
            <input type="checkbox" name="enabled" defaultChecked={settings.enabled} className="h-4 w-4 accent-[var(--accent,#c8ff00)]" />
            انتشار خودکار روشن
          </label>
          <label className="flex items-center gap-2 text-[14px] text-ink">
            هر
            <input type="number" name="interval_days" min={1} max={30} defaultValue={settings.interval_days} className={`${input} w-20 text-center`} />
            روز یک مقاله
          </label>
          <button className="rounded-full border-2 border-ink/70 px-5 py-2 text-[13.5px] font-bold text-ink transition hover:bg-ink hover:text-canvas">
            ذخیره
          </button>
          <button
            type="button"
            onClick={runNow}
            disabled={busy || !hasApiKey}
            className="rounded-full bg-accent px-5 py-2 text-[13.5px] font-bold text-black transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
          >
            {busy ? "در حال نوشتن…" : "الان یه مقاله بساز"}
          </button>
        </form>
        <p className="mt-3 text-[12.5px] text-dim">
          آخرین مقاله‌ی خودکار: {settings.last_run_at ? formatDateTime(settings.last_run_at) : "هنوز نه"} · کلمه‌های در صف: {fa(counts.new)} ·
          استفاده‌شده: {fa(counts.used)} · ردشده: {fa(counts.skipped)}
        </p>
        {msg && (
          <p className={`mt-3 rounded-md p-3 text-[13.5px] ${msg.ok ? "bg-accent/[0.08] text-ink" : "bg-red-500/[0.08] text-red-600"}`}>{msg.text}</p>
        )}
      </div>

      <div className={card}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h3 className="ml-auto text-[16px] font-bold text-ink">کلمه‌های کلیدی</h3>
          {(["new", "used", "skipped"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setTab(s)}
              className={`rounded-full px-3 py-1 text-[12.5px] font-semibold ${tab === s ? "bg-ink text-canvas" : "border border-ink/20 text-dim"}`}
            >
              {s === "new" ? "در صف" : s === "used" ? "نوشته‌شده" : "ردشده"} ({fa(counts[s])})
            </button>
          ))}
        </div>
        <form action={setSeoKeywordStatusAction} className="mb-3 flex gap-2">
          <input type="hidden" name="status" value="add" />
          <input name="keyword" placeholder="یه کلمه‌ی کلیدی دستی اضافه کن…" className={`${input} flex-1`} />
          <button className="rounded-full border border-ink/30 px-4 text-[13px] font-semibold text-ink">افزودن</button>
        </form>
        {shown.length === 0 ? (
          <p className="text-[13px] text-dim">چیزی اینجا نیست. با هر اجرا کلمه‌های تازه از گوگل اضافه می‌شن.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {shown.slice(0, 80).map((k) => (
              <li key={k.keyword} className="flex items-center gap-1 rounded-full border border-ink/15 bg-surface/30 py-1 pl-1 pr-3 text-[13px] text-ink">
                {k.keyword}
                {k.status !== "used" && (
                  <form action={setSeoKeywordStatusAction}>
                    <input type="hidden" name="keyword" value={k.keyword} />
                    <input type="hidden" name="status" value={k.status === "new" ? "skipped" : "new"} />
                    <button title={k.status === "new" ? "رد کن" : "برگردون به صف"} className="rounded-full px-2 text-dim hover:text-ink">
                      {k.status === "new" ? "✕" : "↺"}
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={card}>
        <h3 className="mb-3 text-[16px] font-bold text-ink">اجراهای اخیر</h3>
        {runs.length === 0 ? (
          <p className="text-[13px] text-dim">هنوز اجرایی نبوده.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-ink/10">
            {runs.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-[13.5px]">
                <span className={r.ok ? "text-green-600" : "text-red-600"}>{r.ok ? "✓" : "✕"}</span>
                <span className="text-dim">{formatDateTime(r.at)}</span>
                <span className="rounded-full border border-ink/15 px-2 text-[11.5px] text-dim">{r.trigger === "cron" ? "خودکار" : "دستی"}</span>
                {r.ok && r.post_slug ? (
                  <a href={`/blog/${r.post_slug}`} target="_blank" rel="noreferrer" className="font-semibold text-ink underline decoration-accent/50">
                    {r.post_title}
                  </a>
                ) : (
                  <span className="text-red-600">{r.error}</span>
                )}
                {r.keyword && <span className="text-dim">«{r.keyword}»</span>}
                {r.ok && <span className="text-dim">{fa(r.linked_post_ids.length)} لینک برگشتی</span>}
                {r.metrics && (
                  <span className="w-full text-[12px] text-dim">
                    {fa(r.metrics.words)} کلمه · چگالی {r.metrics.density.toLocaleString("fa-IR")}٪ · لینک داخلی {fa(r.metrics.internal)} · لینک خارجی{" "}
                    {fa(r.metrics.external)} · عکس {fa(r.metrics.images)} · لیست {fa(r.metrics.lists)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
