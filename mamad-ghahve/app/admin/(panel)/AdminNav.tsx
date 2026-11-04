"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const L = [
  ["/admin", "📊", "داشبورد"],
  ["/admin/orders", "🧾", "سفارش‌ها"],
  ["/admin/products", "☕", "محصولات"],
  ["/admin/categories", "🗂️", "دسته‌بندی‌ها"],
  ["/admin/slides", "🖼️", "اسلایدر"],
  ["/admin/customers", "🎁", "باشگاه مشتریان"],
  ["/admin/coupons", "🏷️", "کد تخفیف"],
  ["/admin/settings", "⚙️", "تنظیمات و درگاه‌ها"],
  ["/", "🏬", "مشاهده‌ی سایت"],
];

export default function AdminNav() {
  const p = usePathname();
  return (
    <nav>
      {L.map(([h, i, t]) => (
        <Link key={h} href={h} className={(h === "/admin" ? p === h : h !== "/" && p.startsWith(h)) ? "on" : ""} target={h === "/" ? "_blank" : undefined}>
          <span>{i}</span>
          {t}
        </Link>
      ))}
    </nav>
  );
}
