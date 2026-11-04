"use client";
import { useEffect, useState } from "react";
import type { CartItem } from "./CartProvider";

export type QuoteRes = {
  lines: { product_id: number; name: string; option: string; price: number; qty: number; line: number }[];
  subtotal: number;
  discount: number;
  coupon: string;
  couponError: string;
  shipping: number;
  pointsUsed: number;
  pointsDiscount: number;
  maxPoints: number;
  total: number;
  errors: string[];
  loggedIn: boolean;
  points: number;
};

/** قیمت نهایی همیشه از سرور گرفته می‌شه */
export function useQuote(items: CartItem[], coupon: string, usePoints: boolean) {
  const [quote, setQuote] = useState<QuoteRes | null>(null);
  const [loading, setLoading] = useState(false);
  const key = JSON.stringify(items.map((i) => [i.id, i.qty, i.option])) + coupon + usePoints;
  useEffect(() => {
    if (!items.length) {
      setQuote(null);
      return;
    }
    const ctl = new AbortController();
    setLoading(true);
    fetch("/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: items.map((i) => ({ id: i.id, qty: i.qty, option: i.option })), coupon, usePoints }),
      signal: ctl.signal,
    })
      .then((r) => r.json())
      .then((q) => setQuote(q))
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => ctl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return { quote, loading };
}
