import Link from "next/link";
import { notFound } from "next/navigation";
import ProductArt from "@/components/ProductArt";
import ProductRail from "@/components/ProductRail";
import ProductCard from "@/components/ProductCard";
import { BuyBox } from "@/components/AddToCart";
import { productById, related, toCard } from "@/lib/products";
import { discountPercent, faNum } from "@/lib/format";

export function generateMetadata({ params }: { params: { id: string } }) {
  const p = productById(Number(params.id));
  return p ? { title: p.name, description: p.short_desc || p.description.slice(0, 150) } : {};
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const p = productById(Number(params.id));
  if (!p || !p.is_active) notFound();
  const off = discountPercent(p.price, p.compare_price);
  const rel = related(p).map(toCard);
  const stars = "★".repeat(Math.round(p.rating)) + "☆".repeat(5 - Math.round(p.rating));

  return (
    <div className="container">
      <nav className="muted" style={{ fontSize: ".82rem", marginTop: 16 }}>
        <Link href="/">خانه</Link> / <Link href="/shop">فروشگاه</Link> / {p.category_name && <>{p.category_name} / </>}
        {p.name}
      </nav>
      <div className="pdp">
        <div className="gallery">
          <ProductArt image={p.image} color={p.color} name={p.name} />
        </div>
        <div className="stack">
          {p.badge && <span className="pill">{p.badge}</span>}
          <h1>{p.name}</h1>
          <div className="row">
            <span className="stars">{stars}</span>
            <span className="muted" style={{ fontSize: ".85rem" }}>{faNum(p.sales_count)} خرید موفق</span>
          </div>
          <p className="muted">{p.short_desc}</p>
          <div className="price-lg">
            {off > 0 && <del>{p.compare_price.toLocaleString("fa-IR")}</del>}
            {p.price.toLocaleString("fa-IR")} <small style={{ fontSize: ".9rem", fontWeight: 400 }}>تومان</small>
            {off > 0 && <span className="pill bad" style={{ marginInlineStart: 10 }}>٪{faNum(off)} تخفیف</span>}
          </div>
          <div className="spec">
            <div><b>{faNum(p.weight)} گرم</b>وزن</div>
            <div><b>{p.stock > 0 ? (p.stock < 5 ? `فقط ${faNum(p.stock)} عدد` : "موجود") : "ناموجود"}</b>موجودی</div>
            <div><b>{p.category_name || "—"}</b>دسته</div>
          </div>
          <BuyBox p={{ id: p.id, name: p.name, price: p.price, image: p.image, color: p.color, options: p.options, stock: p.stock }} />
          <div className="card" style={{ boxShadow: "none", background: "var(--latte)" }}>
            <b>درباره‌ی این محصول</b>
            <p style={{ whiteSpace: "pre-line", marginTop: 6 }}>{p.description}</p>
          </div>
        </div>
      </div>
      {rel.length > 0 && (
        <ProductRail title="محصولات مشابه">
          {rel.map((r) => <ProductCard key={r.id} p={r} />)}
        </ProductRail>
      )}
    </div>
  );
}
