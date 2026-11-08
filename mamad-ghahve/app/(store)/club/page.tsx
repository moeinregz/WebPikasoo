import Link from "next/link";
import AuthForms from "./AuthForms";
import { currentCustomer } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { TIERS } from "@/lib/club";

export const metadata = { title: "باشگاه مشتریان" };

export default function ClubPage({ searchParams }: { searchParams: { next?: string } }) {
  const s = getSettings();
  const me = currentCustomer();
  const fmt = (k: string) => Number(s[k] || 0).toLocaleString("fa-IR");
  return (
    <div className="container">
      <section className="club-hero">
        <div style={{ fontSize: "3.4rem" }}>🎁</div>
        <h1>باشگاه مشتریان ممد قهوه</h1>
        <p style={{ opacity: 0.9, maxWidth: 560, margin: "8px auto 0" }}>
          با هر خرید امتیاز جمع کن، سطحت رو بالا ببر و با امتیازهات تخفیف بگیر. عضویت رایگانه و همین الان {fmt("club_welcome_points")} امتیاز هدیه می‌گیری.
        </p>
        {me && <Link href="/account" className="btn gold" style={{ marginTop: 18 }}>رفتن به کارت باشگاه من</Link>}
      </section>

      <section className="section">
        <div className="section-head"><h2>چطوری کار می‌کنه؟</h2></div>
        <div className="features" style={{ marginTop: 0 }}>
          <div className="feature"><span className="i">🛒</span><div><b>خرید کن</b><span>هر {fmt("club_earn_per")} تومان = ۱ امتیاز</span></div></div>
          <div className="feature"><span className="i">⭐</span><div><b>امتیاز بگیر</b><span>بعد از پرداخت موفق</span></div></div>
          <div className="feature"><span className="i">💰</span><div><b>خرج کن</b><span>هر امتیاز = {fmt("club_point_value")} تومان</span></div></div>
          <div className="feature"><span className="i">🏆</span><div><b>سطحت رو ببر بالا</b><span>امتیاز بیشتر در هر خرید</span></div></div>
        </div>
      </section>

      <section className="section">
        <div className="section-head"><h2>سطح‌های باشگاه</h2></div>
        <div className="pgrid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {TIERS.map((t) => (
            <div key={t.key} className="card center" style={{ borderTop: `6px solid ${t.color}` }}>
              <div className="display" style={{ fontSize: "1.8rem", color: t.color }}>{t.name}</div>
              <p className="muted" style={{ fontSize: ".85rem" }}>{t.min ? `از ${t.min.toLocaleString("fa-IR")} تومان خرید` : "از اولین روز عضویت"}</p>
              <p style={{ marginTop: 6 }}>{t.perk}</p>
              <b style={{ display: "block", marginTop: 6 }}>ضریب امتیاز ×{t.mult.toLocaleString("fa-IR")}</b>
            </div>
          ))}
        </div>
        <p className="muted center" style={{ fontSize: ".82rem", marginTop: 10 }}>حداکثر {fmt("club_max_redeem_percent")}٪ از مبلغ هر سفارش با امتیاز قابل پرداخته.</p>
      </section>

      {!me && (
        <section className="section">
          <AuthForms next={searchParams.next || "/account"} />
        </section>
      )}
    </div>
  );
}
