"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { useQuote } from "@/components/useQuote";

type Me = { name: string; phone: string; address: string; city: string; postal_code: string; points: number } | null;
type Gw = { id: string; title: string; note: string };

export default function CheckoutForm({ gateways, me }: { gateways: Gw[]; me: Me }) {
  const { items, ready } = useCart();
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState("");
  const [usePoints, setUsePoints] = useState(false);
  const [gw, setGw] = useState(gateways[0]?.id || "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [f, setF] = useState({ name: me?.name || "", phone: me?.phone || "", city: me?.city || "", address: me?.address || "", postal_code: me?.postal_code || "", note: "" });
  const { quote } = useQuote(items, coupon, usePoints);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !ready) return <p className="muted">در حال بارگذاری…</p>;
  if (!items.length)
    return (
      <div className="empty card">
        <div className="i">🛒</div>
        <p>سبد خریدت خالیه.</p>
        <Link href="/shop" className="btn" style={{ marginTop: 12 }}>رفتن به فروشگاه</Link>
      </div>
    );

  const up = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!gw && quote && quote.total > 0) return setErr("هیچ درگاه پرداختی فعال نیست. با فروشگاه تماس بگیر.");
    setBusy(true);
    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map((i) => ({ id: i.id, qty: i.qty, option: i.option })), coupon, usePoints, gateway: gw, info: f }),
      });
      const j = await r.json();
      if (!r.ok || !j.url) throw new Error(j.error || "خطا در ثبت سفارش");
      window.location.href = j.url;
    } catch (x) {
      setErr((x as Error).message);
      setBusy(false);
    }
  }

  return (
    <form className="cart-layout" onSubmit={submit}>
      <div className="stack">
        {!me && (
          <div className="alert warn">
            عضو باشگاه نیستی؟ <Link href="/club?next=/checkout" style={{ fontWeight: 700, textDecoration: "underline" }}>وارد شو یا ثبت‌نام کن</Link> تا از این خرید امتیاز بگیری.
          </div>
        )}
        <div className="card">
          <b style={{ display: "block", marginBottom: 12 }}>📦 اطلاعات گیرنده</b>
          <div className="grid2">
            <div className="field"><label>نام و نام خانوادگی</label><input required value={f.name} onChange={up("name")} autoComplete="name" /></div>
            <div className="field"><label>شماره موبایل</label><input required value={f.phone} onChange={up("phone")} inputMode="tel" dir="ltr" placeholder="09xxxxxxxxx" autoComplete="tel" /></div>
            <div className="field"><label>شهر</label><input required value={f.city} onChange={up("city")} /></div>
            <div className="field"><label>کد پستی</label><input value={f.postal_code} onChange={up("postal_code")} inputMode="numeric" dir="ltr" /></div>
            <div className="field span2"><label>آدرس کامل</label><textarea required value={f.address} onChange={up("address")} style={{ minHeight: 70 }} /></div>
            <div className="field span2"><label>توضیحات (اختیاری)</label><input value={f.note} onChange={up("note")} /></div>
          </div>
        </div>
        <div className="card">
          <b style={{ display: "block", marginBottom: 12 }}>💳 روش پرداخت</b>
          <div className="stack">
            {gateways.length === 0 && <div className="alert bad">فعلاً هیچ درگاهی فعال نیست.</div>}
            {gateways.map((g) => (
              <label key={g.id} className={`gw ${gw === g.id ? "on" : ""}`}>
                <input type="radio" name="gw" checked={gw === g.id} onChange={() => setGw(g.id)} />
                <span>
                  <b>{g.title}</b>
                  <small>{g.note}</small>
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <aside className="card summary">
        <b style={{ display: "block", marginBottom: 8 }}>خلاصه‌ی سفارش</b>
        {quote?.lines.map((l) => (
          <div className="r" key={l.product_id + l.option} style={{ fontSize: ".85rem" }}>
            <span>{l.name} {l.option && <small className="muted">({l.option})</small>} × {l.qty.toLocaleString("fa-IR")}</span>
            <span>{l.line.toLocaleString("fa-IR")}</span>
          </div>
        ))}
        {quote?.errors?.map((e, i) => <div key={i} className="alert warn" style={{ margin: "6px 0" }}>{e}</div>)}

        <div className="row" style={{ margin: "12px 0", flexWrap: "nowrap" }}>
          <input className="input" placeholder="کد تخفیف" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} dir="ltr" />
          <button type="button" className="btn light sm" onClick={() => setCoupon(couponInput.trim())}>اعمال</button>
        </div>
        {coupon && quote?.couponError && <div className="alert bad" style={{ marginBottom: 8 }}>{quote.couponError}</div>}
        {coupon && quote?.coupon && <div className="alert ok" style={{ marginBottom: 8 }}>کد «{quote.coupon}» اعمال شد.</div>}

        {me && (
          <label className="check" style={{ margin: "6px 0 10px", fontSize: ".9rem" }}>
            <input type="checkbox" checked={usePoints} onChange={(e) => setUsePoints(e.target.checked)} disabled={!quote?.maxPoints} />
            <span>
              استفاده از امتیاز باشگاه ({me.points.toLocaleString("fa-IR")} امتیاز داری
              {quote ? `، تا ${quote.maxPoints.toLocaleString("fa-IR")} قابل استفاده` : ""})
            </span>
          </label>
        )}

        <div className="r"><span>جمع کالاها</span><span>{(quote?.subtotal ?? 0).toLocaleString("fa-IR")} تومان</span></div>
        {!!quote?.discount && <div className="r green"><span>تخفیف</span><span>−{quote.discount.toLocaleString("fa-IR")}</span></div>}
        {!!quote?.pointsDiscount && <div className="r green"><span>امتیاز باشگاه</span><span>−{quote.pointsDiscount.toLocaleString("fa-IR")}</span></div>}
        <div className="r"><span>ارسال</span><span>{quote ? (quote.shipping ? quote.shipping.toLocaleString("fa-IR") + " تومان" : "رایگان") : "…"}</span></div>
        <div className="r total"><span>قابل پرداخت</span><span>{(quote?.total ?? 0).toLocaleString("fa-IR")} تومان</span></div>

        {err && <div className="alert bad" style={{ marginTop: 10 }}>{err}</div>}
        <button className="btn gold block" style={{ marginTop: 14 }} disabled={busy || !quote || !quote.lines.length}>
          {busy ? "در حال انتقال به درگاه…" : "پرداخت و ثبت سفارش"}
        </button>
      </aside>
    </form>
  );
}
