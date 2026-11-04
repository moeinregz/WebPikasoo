import Link from "next/link";
import { CartProvider } from "@/components/CartProvider";
import CartCount from "@/components/CartCount";
import BottomNav from "@/components/BottomNav";
import { getSettings } from "@/lib/settings";
import { currentCustomer } from "@/lib/auth";
import { categories } from "@/lib/products";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const s = getSettings();
  const me = currentCustomer();
  const cats = categories();
  const tel = (s.shop_phone || "").replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
  return (
    <CartProvider>
      <div className="topbar">
        🚚 ارسال رایگان برای خریدهای بالای {Number(s.free_shipping_over || 0).toLocaleString("fa-IR")} تومان · 🎁 با عضویت در باشگاه {Number(s.club_welcome_points || 0).toLocaleString("fa-IR")} امتیاز هدیه بگیر
      </div>
      <header className="header">
        <div className="container in">
          <Link href="/" className="logo" aria-label={s.shop_name}>
            <span className="cup">☕</span>
            {s.shop_name}
          </Link>
          <nav className="nav hide-sm">
            <Link href="/shop">فروشگاه</Link>
            <Link href="/shop?sort=popular">پرفروش‌ها</Link>
            <Link href="/shop?sale=1">تخفیف‌ها</Link>
            <Link href="/club">باشگاه مشتریان</Link>
          </nav>
          <form className="search" action="/shop">
            <input name="q" placeholder="جستجوی قهوه، لوازم و…" aria-label="جستجو" />
            <button aria-label="جستجو">🔍</button>
          </form>
          <div className="icons">
            <Link href="/shop" className="icon-btn only-sm" aria-label="جستجو">🔍</Link>
            <Link href={me ? "/account" : "/club#login"} className="icon-btn hide-sm" aria-label="حساب کاربری" title={me ? me.name : "ورود / عضویت"}>
              👤
            </Link>
            <Link href="/cart" className="icon-btn" aria-label="سبد خرید">
              🛒
              <CartCount />
            </Link>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="footer">
        <div className="container cols">
          <div>
            <div className="logo" style={{ marginBottom: 12 }}>
              <span className="cup">☕</span>
              {s.shop_name}
            </div>
            <p>{s.shop_tagline}</p>
            <p style={{ marginTop: 8 }}>📍 {s.shop_address}</p>
            <p>
              📞 <a href={`tel:${tel}`}>{s.shop_phone}</a>
            </p>
          </div>
          <div>
            <h4>دسته‌بندی‌ها</h4>
            <ul>
              {cats.map((c) => (
                <li key={c.id}>
                  <Link href={`/shop?cat=${c.slug}`}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>دسترسی سریع</h4>
            <ul>
              <li><Link href="/club">باشگاه مشتریان</Link></li>
              <li><Link href="/account">پیگیری سفارش‌ها</Link></li>
              <li><Link href="/cart">سبد خرید</Link></li>
              <li><Link href="/shop?sale=1">تخفیف‌ها</Link></li>
            </ul>
          </div>
        </div>
        <div className="container copy">© {new Date().getFullYear().toLocaleString("fa-IR", { useGrouping: false })} {s.shop_name} — همه‌ی حقوق محفوظه.</div>
      </footer>
      <BottomNav />
    </CartProvider>
  );
}
