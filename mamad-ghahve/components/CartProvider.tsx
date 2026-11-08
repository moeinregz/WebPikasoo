"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export type CartItem = { id: number; qty: number; option: string; name: string; price: number; image: string; color: string };

type Ctx = {
  items: CartItem[];
  count: number;
  ready: boolean;
  add: (it: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (id: number, option: string, qty: number) => void;
  remove: (id: number, option: string) => void;
  clear: () => void;
  toast: (msg: string) => void;
};

const CartCtx = createContext<Ctx | null>(null);
const KEY = "mg_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [msg, setMsg] = useState("");
  const t = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  const toast = useCallback((m: string) => {
    setMsg(m);
    clearTimeout(t.current);
    t.current = setTimeout(() => setMsg(""), 2600);
  }, []);

  const add = useCallback(
    (it: Omit<CartItem, "qty">, qty = 1) => {
      setItems((prev) => {
        const i = prev.findIndex((p) => p.id === it.id && p.option === it.option);
        if (i >= 0) {
          const next = [...prev];
          next[i] = { ...next[i], qty: Math.min(50, next[i].qty + qty) };
          return next;
        }
        return [...prev, { ...it, qty }];
      });
      toast("به سبد خرید اضافه شد ☕");
    },
    [toast]
  );

  const setQty = useCallback((id: number, option: string, qty: number) => {
    setItems((prev) => prev.map((p) => (p.id === id && p.option === option ? { ...p, qty: Math.max(1, Math.min(50, qty)) } : p)));
  }, []);

  const remove = useCallback((id: number, option: string) => {
    setItems((prev) => prev.filter((p) => !(p.id === id && p.option === option)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({ items, count: items.reduce((a, b) => a + b.qty, 0), ready, add, setQty, remove, clear, toast }),
    [items, ready, add, setQty, remove, clear, toast]
  );

  return (
    <CartCtx.Provider value={value}>
      {children}
      <div className={`toast ${msg ? "show" : ""}`} role="status" aria-live="polite">
        {msg} {msg.includes("سبد") && <a href="/cart">مشاهده‌ی سبد</a>}
      </div>
    </CartCtx.Provider>
  );
}

export function useCart() {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
}
