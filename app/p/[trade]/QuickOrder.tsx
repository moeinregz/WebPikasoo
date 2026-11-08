"use client";

import { useEffect, useState } from "react";
import { submitOfferOrder } from "@/app/actions";

const TEL = "tel:+989965745535";

/** Two-field order form for the SMS ad pages. Reads ?c= (SMS link code)
 *  and ?n= (business name) from the URL so a personal link is credited and
 *  pre-filled, without making the page itself dynamic. */
export default function QuickOrder({ tradeLabel, accent, onAccent }: { tradeLabel: string; accent: string; onAccent: string }) {
  const [code, setCode] = useState<string | undefined>();
  const [business, setBusiness] = useState("");
  const [state, setState] = useState<{ ok: boolean; message: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setCode(q.get("c") ?? undefined);
    setBusiness((q.get("n") ?? "").slice(0, 80));
  }, []);

  if (state?.ok) {
    return (
      <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/[0.08] p-6 text-center">
        <p className="text-[19px] font-black text-white">✅ {state.message}</p>
        <p className="mt-2 text-[14px] text-white/65">عجله داری؟ همین الان زنگ بزن تا زودتر شروع کنیم.</p>
        <a href={TEL} className="mt-5 inline-flex h-12 items-center justify-center rounded-xl px-7 text-[16px] font-black" style={{ background: accent, color: onAccent }}>
          📞 تماس فوری
        </a>
      </div>
    );
  }

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setBusy(true);
        const res = await submitOfferOrder({
          name: String(f.get("name") ?? ""),
          phone: String(f.get("phone") ?? ""),
          business: String(f.get("business") ?? ""),
          tradeLabel,
          code,
          website: String(f.get("website") ?? ""),
        });
        setBusy(false);
        setState(res);
      }}
    >
      <input name="name" required placeholder="اسم شما" autoComplete="name" className="h-[52px] w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 text-[16px] text-white outline-none placeholder:text-white/40 focus:border-white/40" />
      <input name="phone" required inputMode="tel" autoComplete="tel" dir="ltr" placeholder="09xx xxx xxxx" className="h-[52px] w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 text-left text-[16px] text-white outline-none placeholder:text-white/40 focus:border-white/40" />
      <input name="business" value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="اسم کسب‌وکار (اختیاری)" className="h-[52px] w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 text-[16px] text-white outline-none placeholder:text-white/40 focus:border-white/40" />
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <button type="submit" disabled={busy} className="h-14 w-full rounded-xl text-[17px] font-black shadow-lg transition active:scale-[0.98] disabled:opacity-60" style={{ background: accent, color: onAccent }}>
        {busy ? "در حال ثبت..." : "ثبت سفارش و مشاوره‌ی رایگان"}
      </button>
      {state && !state.ok && <p className="text-center text-[14px] text-red-300">{state.message}</p>}
    </form>
  );
}
