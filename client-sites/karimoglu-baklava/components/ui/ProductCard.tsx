"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ProductSummary } from "@/lib/types";
import { formatToman } from "@/lib/format";
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
  const [showCartLink, setShowCartLink] = useState(false);
  const cartLinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (cartLinkTimer.current) clearTimeout(cartLinkTimer.current);
  }, []);
  const cart = useCart();

  function handleQuickAdd() {
    // افزودن سریع فقط برای محصولاتی که یک نسخه ساده دارند؛ جزئیات از خود کارت (که از کاتالوگ دیتابیس
    // آمده) خوانده می‌شود. قیمت نهایی همیشه سمت سرور دوباره حساب می‌شود.
    const quick = product.quickAdd;
    if (!quick) return;

    cart.addItem(
      {
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        categoryLabel: product.categoryLabel,
        saleType: quick.saleType,
        variantId: quick.variantId,
        variantLabel: quick.variantLabel,
        packagingId: quick.packagingId,
        packagingLabel: quick.packagingLabel,
        quantity: 1,
      },
      quick.unitPrice,
    );
    track({ name: "add_to_cart", productId: product.id, variantId: quick.variantId, quantity: 1 });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
    setShowCartLink(true);
    if (cartLinkTimer.current) clearTimeout(cartLinkTimer.current);
    cartLinkTimer.current = setTimeout(() => setShowCartLink(false), 8000);
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border-2 border-brand-black bg-surface shadow-hard transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1.5 hover:translate-x-1 hover:shadow-hard-lg">
      <div className="relative m-2 mb-0 overflow-hidden rounded-lg border-2 border-brand-black">
        <Link href={`/product/${product.slug}`} className="block">
          {product.imageUrl ? (
            <div className="aspect-square overflow-hidden bg-cream">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.imageUrl}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:-rotate-1"
              />
            </div>
          ) : (
            <ImagePlaceholder
              label={`تصویر ${product.name} — به‌زودی`}
              className="!rounded-none !border-0 transition-transform duration-700 group-hover:scale-110"
            />
          )}
        </Link>

        <button
          type="button"
          onClick={() => setIsWished((v) => !v)}
          aria-pressed={isWished}
          aria-label={isWished ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
          className="absolute left-2 top-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-brand-black bg-cream text-lg shadow-hard-xs transition-transform duration-200 hover:scale-110 active:scale-90"
        >
          <span aria-hidden="true" className={isWished ? "text-brand-red" : "text-text-muted"}>
            {isWished ? "♥" : "♡"}
          </span>
        </button>

        {!product.isAvailable && (
          <div className="absolute right-2 top-2">
            <Badge tone="neutral">ناموجود</Badge>
          </div>
        )}
        {product.isAvailable && product.discountPercent && (
          <div className="absolute right-2 top-2 -rotate-6">
            <Badge tone="accent">{product.discountPercent.toLocaleString("fa-IR")}٪ تخفیف</Badge>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-pistachio-light px-2 py-0.5 text-caption font-medium text-pistachio-deep">
          <span aria-hidden="true">◆</span>
          {product.categoryLabel}
        </span>
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-h4 text-text-primary line-clamp-2 transition-colors group-hover:text-brand-red">{product.name}</h3>
        </Link>

        {product.rating && (
          <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
        )}

        <div className="mt-1 flex flex-wrap items-baseline gap-2 border-t-2 border-dashed border-border pt-2">
          <span className="text-price text-brand-redDark">
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
            product.hasSimpleDefaultUnit && product.quickAdd ? (
              <>
              <Button
                variant={justAdded ? "primary" : "accent"}
                size="sm"
                fullWidthOnMobile
                className="w-full"
                onClick={handleQuickAdd}
                aria-label={`افزودن ${product.name} به سبد خرید`}
              >
                {justAdded ? "✓ اضافه شد" : "افزودن به سبد"}
              </Button>
              {showCartLink && (
                <Link href="/cart" className="mt-2 block text-center text-caption text-brand-red hover:underline">
                  مشاهده سبد خرید و ثبت سفارش ←
                </Link>
              )}
              </>
            ) : (
              <Link
                href={`/product/${product.slug}`}
                aria-label={`مشاهده و انتخاب ${product.name}`}
                className="flex h-10 w-full items-center justify-center rounded-lg border-2 border-brand-black bg-cream text-btn font-semibold text-brand-black shadow-hard-xs transition-all duration-200 hover:bg-honey hover:shadow-hard-sm active:translate-y-0.5 active:shadow-none"
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
