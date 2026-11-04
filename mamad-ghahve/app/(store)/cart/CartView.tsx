"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";
import ProductArt from "@/components/ProductArt";
import { useQuote } from "@/components/useQuote";

export default function CartView() {
  const { items, ready, setQty, remove } = useCart();
  const { quote, loading } = useQuote(items, "", false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !ready) return <p className="muted">در حال بارگذاری…</p>;
  if (!items.length)
    return (
      <div className="empty card">
        <div className="i">🛒</div>
        <p style={{ margin: "8px 0 16px" }}>سبد خریدت خالیه!</p>
        <Link href="/shop" className="btn">بریم خرید</Link>
      </div>
    );

  return (
    <div className="cart-layout">
      <div className="card">
        {quote?.errors?.map((e, i) => (
          <div key={i} className="alert warn" style={{ marginBottom: 8 }}>{e}</div>
        ))}
        {items.map((it) => {
          const live = quote?.lines.find((l) => l.product_id === it.id && l.option === it.option);
          const price = live?.price ?? it.price;
          return (
            <div className="cart-line" key={it.id + it.option}>
              <Link href={`/product/${it.id}`} className="thumb">
                <ProductArt image={it.image} color={it.color} name={it.name} />
              </Link>
              <div>
                <Link href={`/product/${it.id}`}><b>{it.name}</b></Link>
                {it.option && <div className="muted" style={{ fontSize: ".8rem" }}>{it.option}</div>}
                <div style={{ fontSize: ".9rem", marginTop: 4 }}>{price.toLocaleString("fa-IR")} تومان</div>
              </div>
              <div className="stack" style={{ textAlign: "left" }}>
                <div className="qty">
                  <button onClick={() => setQty(it.id, it.option, it.qty + 1)} aria-label="بیشتر">+</button>
                  <span>{it.qty.toLocaleString("fa-IR")}</span>
                  <button onClick={() => (it.qty > 1 ? setQty(it.id, it.option, it.qty - 1) : remove(it.id, it.option))} aria-label="کمتر">
                    {it.qty > 1 ? "−" : "🗑"}
                  </button>
                </div>
                <button className="muted" style={{ fontSize: ".78rem" }} onClick={() => remove(it.id, it.option)}>حذف</button>
              </div>
            </div>
          );
        })}
      </div>
      <aside className="card summary">
        <b style={{ display: "block", marginBottom: 8 }}>خلاصه‌ی سفارش</b>
        <div className="r"><span>جمع کالاها</span><span>{(quote?.subtotal ?? 0).toLocaleString("fa-IR")} تومان</span></div>
        <div className="r"><span>هزینه‌ی ارسال</span><span>{quote ? (quote.shipping ? quote.shipping.toLocaleString("fa-IR") + " تومان" : "رایگان") : "…"}</span></div>
        <div className="r total"><span>مبلغ قابل پرداخت</span><span>{(quote?.total ?? 0).toLocaleString("fa-IR")} تومان</span></div>
        <p className="muted" style={{ fontSize: ".8rem", margin: "8px 0 14px" }}>کد تخفیف و امتیاز باشگاه رو تو مرحله‌ی بعد می‌تونی اعمال کنی.</p>
        <Link href="/checkout" className="btn block" aria-disabled={loading}>ادامه‌ی خرید ←</Link>
      </aside>
    </div>
  );
}
