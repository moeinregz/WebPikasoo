import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { categories, searchProducts, toCard } from "@/lib/products";
import { faNum } from "@/lib/format";

export const metadata = { title: "فروشگاه" };

type SP = { cat?: string; q?: string; sort?: string; sale?: string };

function href(sp: SP, patch: Partial<SP>) {
  const q = new URLSearchParams();
  const m = { ...sp, ...patch };
  for (const [k, v] of Object.entries(m)) if (v) q.set(k, v);
  const s = q.toString();
  return "/shop" + (s ? "?" + s : "");
}

export default function Shop({ searchParams }: { searchParams: SP }) {
  const sp: SP = { cat: searchParams.cat, q: searchParams.q?.slice(0, 80), sort: searchParams.sort, sale: searchParams.sale };
  const cats = categories();
  const items = searchProducts(sp).map(toCard);
  const cat = cats.find((c) => c.slug === sp.cat);
  const title = sp.q ? `نتیجه‌ی جستجو: «${sp.q}»` : sp.sale ? "تخفیف‌ها" : cat ? cat.name : "همه‌ی محصولات";

  return (
    <div className="container">
      <h1 className="page-title">{title}</h1>
      <form action="/shop" className="only-sm" style={{ marginBottom: 6 }}>
        {sp.cat && <input type="hidden" name="cat" value={sp.cat} />}
        <input className="input" name="q" defaultValue={sp.q} placeholder="🔍 جستجو در فروشگاه…" />
      </form>
      <div className="filters">
        <Link href={href(sp, { cat: undefined })} className={!sp.cat ? "on" : ""}>همه</Link>
        {cats.map((c) => (
          <Link key={c.id} href={href(sp, { cat: c.slug })} className={sp.cat === c.slug ? "on" : ""}>
            {c.icon} {c.name}
          </Link>
        ))}
      </div>
      <div className="filters" style={{ paddingTop: 0 }}>
        {[
          ["", "جدیدترین"],
          ["popular", "پرفروش‌ترین"],
          ["cheap", "ارزان‌ترین"],
          ["expensive", "گران‌ترین"],
        ].map(([k, t]) => (
          <Link key={k} href={href(sp, { sort: k || undefined })} className={(sp.sort || "") === k ? "on" : ""}>
            {t}
          </Link>
        ))}
        <Link href={href(sp, { sale: sp.sale ? undefined : "1" })} className={sp.sale ? "on" : ""}>٪ فقط تخفیف‌دارها</Link>
      </div>
      <p className="muted" style={{ marginBottom: 12, fontSize: ".85rem" }}>{faNum(items.length)} محصول</p>
      {items.length ? (
        <div className="pgrid">
          {items.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      ) : (
        <div className="empty">
          <div className="i">🫘</div>
          <p>محصولی پیدا نشد.</p>
          <Link href="/shop" className="btn" style={{ marginTop: 12 }}>دیدن همه‌ی محصولات</Link>
        </div>
      )}
    </div>
  );
}
