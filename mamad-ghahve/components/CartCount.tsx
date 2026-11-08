"use client";
import { useCart } from "./CartProvider";
import { faNum } from "@/lib/format";

export default function CartCount() {
  const { count, ready } = useCart();
  if (!ready || !count) return null;
  return <span className="badge-count">{faNum(count > 99 ? "99+" : count)}</span>;
}
