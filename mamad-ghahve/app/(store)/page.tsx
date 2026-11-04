import Link from "next/link";
import HeroSlider from "@/components/HeroSlider";
import ProductRail from "@/components/ProductRail";
import ProductCard from "@/components/ProductCard";
import { activeSlides, categories, discounted, featured, newest, popular, toCard } from "@/lib/products";
import { getSettings } from "@/lib/settings";
import { TIERS } from "@/lib/club";
import TrustBar from "@/components/TrustBar";
import Reviews from "@/components/Reviews";
import AboutBlock from "@/components/AboutBlock";

export default function Home() {
  const s = getSettings();
  const slides = activeSlides();
  const cats = categories();
  const news = newest(12).map(toCard);
  const pops = popular(12).map(toCard);
  const offs = discounted(12).map(toCard);
  const feats = featured(12).map(toCard);

  return (
    <>
      <HeroSlider slides={slides} />
      <div className="container">

        {news.length > 0 && (
          <ProductRail title="جدیدترین‌ها" subtitle="تازه‌ترین قهوه‌ها و محصولاتی که به ممد قهوه اضافه شدن" more="/shop">
            {news.map((p) => <ProductCard key={p.id} p={p} />)}
          </ProductRail>
        )}

        <TrustBar />

        {pops.length > 0 && (
          <ProductRail title="محبوب‌ترین‌ها" subtitle="پرفروش‌ترین محصولات به انتخاب مشتری‌ها" more="/shop?sort=popular">
            {pops.map((p) => <ProductCard key={p.id} p={p} />)}
          </ProductRail>
        )}


        <section className="section cats-section">
          <div className="section-head">
            <h2>
              دسته‌بندی‌ها
              <small>هر چی برای یه قهوه‌ی خوب لازم داری</small>
            </h2>
          </div>
          <nav className="cats" aria-label="دسته‌بندی‌ها">
          {cats.map((c) => (
            <Link key={c.id} href={`/shop?cat=${c.slug}`} className="cat">
              <span className="i">{c.icon}</span>
              {c.name}
            </Link>
          ))}
        </nav>
        </section>

        {offs.length > 0 && (
          <ProductRail title="تخفیف‌های ویژه" subtitle="تا تموم نشده بردار" more="/shop?sale=1">
            {offs.map((p) => <ProductCard key={p.id} p={p} />)}
          </ProductRail>
        )}

        <Reviews />

        {feats.length > 0 && (
          <ProductRail title="پیشنهاد ممد" subtitle="انتخاب‌های شخصی باریستای ما" more="/shop">
            {feats.map((p) => <ProductCard key={p.id} p={p} />)}
          </ProductRail>
        )}

        <section className="club-banner">
          <div>
            <span className="pill" style={{ background: "rgba(255,255,255,.15)", color: "#fbf6ee" }}>🎁 باشگاه مشتریان ممد قهوه</span>
            <h2 style={{ marginTop: 12 }}>هر خرید = امتیاز؛ امتیاز = قهوه‌ی مجانی</h2>
            <p style={{ opacity: 0.88, margin: "8px 0 18px" }}>
              به ازای هر {Number(s.club_earn_per).toLocaleString("fa-IR")} تومان خرید ۱ امتیاز بگیر و موقع پرداخت، هر امتیاز رو {Number(s.club_point_value).toLocaleString("fa-IR")} تومان خرج کن.
              عضویت رایگانه و {Number(s.club_welcome_points).toLocaleString("fa-IR")} امتیاز هدیه داره.
            </p>
            <Link href="/club" className="btn gold">عضو شو</Link>
          </div>
          <div className="tiers">
            {TIERS.map((t) => (
              <div className="tier" key={t.key}>
                <b style={{ color: t.color }}>{t.name}</b>
                ضریب امتیاز ×{t.mult.toLocaleString("fa-IR")}
              </div>
            ))}
          </div>
        </section>

        <AboutBlock phone={s.shop_phone} />
      </div>
    </>
  );
}
