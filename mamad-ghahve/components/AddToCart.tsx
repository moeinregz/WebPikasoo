"use client";
import { useState } from "react";
import { useCart } from "./CartProvider";

type P = { id: number; name: string; price: number; image: string; color: string; options: string; stock: number };

/** دکمه‌ی کوچیک «+» روی کارت محصول */
export function AddMini({ p }: { p: P }) {
  const { add } = useCart();
  const [done, setDone] = useState(false);
  if (p.stock <= 0) return <span className="oos">ناموجود</span>;
  const option = p.options ? p.options.split(",")[0].trim() : "";
  return (
    <button
      className={`add-mini ${done ? "done" : ""}`}
      aria-label={`افزودن ${p.name} به سبد`}
      onClick={(e) => {
        e.preventDefault();
        add({ id: p.id, name: p.name, price: p.price, image: p.image, color: p.color, option });
        setDone(true);
        setTimeout(() => setDone(false), 1200);
      }}
    >
      {done ? "✓" : "+"}
    </button>
  );
}

/** بخش خرید صفحه‌ی محصول: انتخاب نوع آسیاب و تعداد */
export function BuyBox({ p }: { p: P }) {
  const { add } = useCart();
  const opts = p.options ? p.options.split(",").map((x) => x.trim()).filter(Boolean) : [];
  const [opt, setOpt] = useState(opts[0] || "");
  const [qty, setQty] = useState(1);
  const out = p.stock <= 0;
  return (
    <div className="stack">
      {opts.length > 0 && (
        <div>
          <b style={{ display: "block", marginBottom: 8 }}>نوع آسیاب</b>
          <div className="opts">
            {opts.map((o) => (
              <button key={o} className={o === opt ? "on" : ""} onClick={() => setOpt(o)} type="button">
                {o}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="row buy-bar">
        {!out && (
          <div className="qty">
            <button type="button" onClick={() => setQty((q) => Math.min(Math.min(50, p.stock), q + 1))} aria-label="بیشتر">+</button>
            <span>{qty.toLocaleString("fa-IR")}</span>
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="کمتر">−</button>
          </div>
        )}
        <button
          className="btn grow"
          disabled={out}
          onClick={() => add({ id: p.id, name: p.name, price: p.price, image: p.image, color: p.color, option: opt }, qty)}
        >
          {out ? "ناموجود" : "🛒 افزودن به سبد خرید"}
        </button>
      </div>
    </div>
  );
}
