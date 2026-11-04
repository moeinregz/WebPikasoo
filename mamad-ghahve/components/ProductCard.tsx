import Link from "next/link";
import ProductArt from "./ProductArt";
import { AddMini } from "./AddToCart";
import { discountPercent, faNum } from "@/lib/format";
import type { CardProduct } from "@/lib/products";

export default function ProductCard({ p }: { p: CardProduct }) {
  const off = discountPercent(p.price, p.compare_price);
  return (
    <article className="pcard">
      <Link href={`/product/${p.id}`} className="media" aria-label={p.name}>
        {p.badge && <span className="tag">{p.badge}</span>}
        {off > 0 && <span className="off">٪{faNum(off)}</span>}
        <ProductArt image={p.image} color={p.color} name={p.name} />
      </Link>
      <div className="body">
        <span className="cat-name">{p.category_name}</span>
        <h3>
          <Link href={`/product/${p.id}`}>{p.name}</Link>
        </h3>
        <span className="short">{p.short_desc}</span>
        <div className="foot">
          <div className="price-box">
            {off > 0 && <del>{p.compare_price.toLocaleString("fa-IR")}</del>}
            <b>
              {p.price.toLocaleString("fa-IR")} <small>تومان</small>
            </b>
          </div>
          <AddMini p={p} />
        </div>
      </div>
    </article>
  );
}
