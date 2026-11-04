"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CartCount from "./CartCount";

const LINKS = [
  { href: "/", i: "🏠", t: "خانه" },
  { href: "/shop", i: "🛍️", t: "فروشگاه" },
  { href: "/cart", i: "🛒", t: "سبد" },
  { href: "/club", i: "🎁", t: "باشگاه" },
  { href: "/account", i: "👤", t: "حساب" },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="bottom-nav only-sm" aria-label="منوی پایین">
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} className={(l.href === "/" ? path === "/" : path.startsWith(l.href)) ? "on" : ""}>
          <span className="i">{l.i}</span>
          {l.t}
          {l.href === "/cart" && <CartCount />}
        </Link>
      ))}
    </nav>
  );
}
