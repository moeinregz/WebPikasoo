import Link from "next/link";
import { categoryShowcase } from "@/lib/mock-data";
import type { ProductCategory } from "@/lib/types";

export function ShopCategoryNav({ activeCategory }: { activeCategory?: ProductCategory }) {
  return (
    <nav
      aria-label="دسته‌بندی محصولات"
      className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <Link
        href="/shop"
        className={`shrink-0 rounded-full border px-4 py-2 text-bodySm transition-colors ${
          !activeCategory
            ? "border-brand-black bg-brand-black text-text-inverse"
            : "border-border-strong text-text-secondary hover:border-brand-black"
        }`}
      >
        همه محصولات
      </Link>
      {categoryShowcase.map((c) => (
        <Link
          key={c.id}
          href={`/shop/${c.id}`}
          className={`shrink-0 rounded-full border px-4 py-2 text-bodySm transition-colors ${
            activeCategory === c.id
              ? "border-brand-black bg-brand-black text-text-inverse"
              : "border-border-strong text-text-secondary hover:border-brand-black"
          }`}
        >
          {c.label}
        </Link>
      ))}
    </nav>
  );
}
