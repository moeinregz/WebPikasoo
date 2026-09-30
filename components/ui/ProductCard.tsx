"use client";

import Link from "next/link";
import { useState } from "react";
import type { ProductSummary } from "@/lib/types";
import { formatToman } from "@/lib/format";
import { getProductDetailById } from "@/lib/mock-data";
import { useCart } from "@/lib/cart/CartContext";
import { track } from "@/lib/analytics";
import { Badge } from "./Badge";
import { RatingStars } from "./RatingStars";
import { ImagePlaceholder } from "./ImagePlaceholder";
import { Button } from "./Button";

/**
 * پیاده‌سازی دقیق Product Card طبق سند Design System (بخش ۱۱):
 * سلسله‌مراتب بصری کنترل‌شده — وزن/عدد/بسته‌بندی عمداً روی کارت نمایش داده نمی‌شوند
 * تا شلوغ نشود؛ این انتخاب‌ها به Product Page موکول شده‌اند.
 */
export function ProductCard({ product }: { product: ProductSummary }) {
  const [isWished, setIsWished] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const cart = useCart();

  function handleQuickAdd() {
    // افزودن سریع فقط برای محصولاتی که واحد فروش پیش‌فرض ساده دارند مجاز
    // است (طبق Design System بخش ۱۱) — جزئیات Variant واقعی از کاتالوگ کامل
    // محصول خوانده می‌شود، نه از این کارت خلاصه‌شده.
    const detail = getProductDetailById(product.id);
    const saleGroup = detail?.saleTypes[0];
    const variant = saleGroup?.variants.find((v) => v.isAvailable);
    const packaging = detail?.packagingOptions[0];
    if (!detail || !saleGroup || !variant || !packaging) return;

    cart.addItem(
      {
        productId: detail.id,
        productSlug: detail.slug,
        productName: detail.name,
        categoryLabel: detail.categoryLabel,
        saleType: saleGroup.type,
        variantId: variant.id,
        variantLabel: variant.label,
        packagingId: packaging.id,
        packagingLabel: packaging.label,
        quantity: 1,
      },
      variant.price + packaging.priceDelta,
    );
    track({ name: "add_to_cart", productId: detail.id, variantId: variant.id, quantity: 1 });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg bg-surface shadow-sm transition-shadow duration-hover hover:shadow-md">
      <div className="relative">
        <Link href={`/product/${product.slug}`} className="block">
          {product.imageUrl ? (
            <div className="aspect-square overflow-hidden rounded-image border border-border bg-bg-secondary">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.imageUrl}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-hover group-hover:scale-[1.03]"
              />
            </div>
          ) : (
            <ImagePlaceholder
              label={`تصویر ${product.name} — به‌زودی`}
              className="transition-transform duration-hover group-hover:scale-[1.03]"
            />
          )}
        </Link>

        <button
          type="button"
          onClick={() => setIsWished((v) => !v)}
          aria-pressed={isWished}
          aria-label={isWished ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
          className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 text-lg shadow-sm transition-transform duration-hover hover:scale-110"
        >
          <span aria-hidden="true" className={isWished ? "text-brand-red" : "text-text-muted"}>
            {isWished ? "♥" : "♡"}
          </span>
        </button>

        {!product.isAvailable && (
          <div className="absolute right-3 top-3">
            <Badge tone="neutral">ناموجود</Badge>
          </div>
        )}
        {product.isAvailable && product.discountPercent && (
          <div className="absolute right-3 top-3">
            <Badge tone="accent">{product.discountPercent.toLocaleString("fa-IR")}٪ تخفیف</Badge>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-caption text-text-muted">{product.categoryLabel}</span>
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-h4 text-text-primary line-clamp-2">{product.name}</h3>
        </Link>

        {product.rating && (
          <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
        )}

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-price text-text-primary">
            {product.hasSimpleDefaultUnit ? "" : "از "}
            {formatToman(product.startingPrice)}
          </span>
          {product.previousPrice && (
            <span className="text-priceSm text-text-muted line-through">
              {formatToman(product.previousPrice)}
            </span>
          )}
        </div>

        <div className="mt-auto pt-2">
          {product.isAvailable ? (
            product.hasSimpleDefaultUnit ? (
              <Button
                variant="secondary"
                size="sm"
                fullWidthOnMobile
                className="w-full"
                onClick={handleQuickAdd}
                aria-label={`افزودن ${product.name} به سبد خرید`}
              >
                {justAdded ? "✓ اضافه شد" : "افزودن به سبد"}
              </Button>
            ) : (
              <Link
                href={`/product/${product.slug}`}
                aria-label={`مشاهده و انتخاب ${product.name}`}
                className="flex h-9 w-full items-center justify-center rounded-md border border-brand-black text-btn text-brand-black transition-colors duration-hover hover:bg-brand-black hover:text-text-inverse"
              >
                مشاهده و انتخاب
              </Link>
            )
          ) : (
            <Button variant="secondary" size="sm" className="w-full" disabled>
              ناموجود
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
