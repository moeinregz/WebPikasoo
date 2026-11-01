"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { ProductDetail } from "@/lib/types";
import { formatToman } from "@/lib/format";
import { track } from "@/lib/analytics";
import { useCart } from "@/lib/cart/CartContext";
import { Button } from "@/components/ui/Button";
import { RatingStars } from "@/components/ui/RatingStars";
import { QuantitySelector } from "./QuantitySelector";
import { BranchAvailability } from "./BranchAvailability";

export function PurchasePanel({ product }: { product: ProductDetail }) {
  const cart = useCart();
  const [activeSaleTypeIndex, setActiveSaleTypeIndex] = useState(0);
  const activeSaleType = product.saleTypes[activeSaleTypeIndex];

  const firstAvailableVariant = activeSaleType?.variants.find((v) => v.isAvailable);
  const [variantId, setVariantId] = useState(firstAvailableVariant?.id);
  const [packagingId, setPackagingId] = useState(product.packagingOptions[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [isWished, setIsWished] = useState(false);
  const [wishlistStatus, setWishlistStatus] = useState<"idle" | "loading" | "error">("idle");
  const [justAdded, setJustAdded] = useState(false);
  // نوار موقت «مشاهده سبد / ثبت سفارش» بعد از افزودن به سبد
  const [showAddedBar, setShowAddedBar] = useState(false);
  const addedBarTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (addedBarTimer.current) clearTimeout(addedBarTimer.current);
  }, []);

  const selectedVariant = activeSaleType?.variants.find((v) => v.id === variantId);
  const selectedPackaging = product.packagingOptions.find((p) => p.id === packagingId);

  const unitPrice = (selectedVariant?.price ?? 0) + (selectedPackaging?.priceDelta ?? 0);
  const totalPrice = unitPrice * quantity;

  function handleSelectSaleType(index: number) {
    setActiveSaleTypeIndex(index);
    const group = product.saleTypes[index];
    const firstAvailable = group?.variants.find((v) => v.isAvailable);
    setVariantId(firstAvailable?.id);
  }

  function handleSelectVariant(id: string, available: boolean) {
    if (!available) return;
    setVariantId(id);
    track({ name: "variant_select", productId: product.id, saleType: activeSaleType?.type ?? "", variantId: id });
  }

  function handleSelectPackaging(id: string) {
    setPackagingId(id);
    track({ name: "packaging_select", productId: product.id, packagingId: id });
  }

  async function handleToggleWishlist() {
    setWishlistStatus("loading");
    try {
      // TODO: اتصال به `POST/DELETE /api/v1/wishlist` واقعی
      await new Promise((resolve) => setTimeout(resolve, 300));
      setIsWished((v) => !v);
      track({ name: isWished ? "remove_from_wishlist" : "add_to_wishlist", productId: product.id });
      setWishlistStatus("idle");
    } catch {
      setWishlistStatus("error");
    }
  }

  function handleAddToCart() {
    if (!selectedVariant || !selectedPackaging || !activeSaleType) return;
    cart.addItem(
      {
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        categoryLabel: product.categoryLabel,
        saleType: activeSaleType.type,
        variantId: selectedVariant.id,
        variantLabel: selectedVariant.label,
        packagingId: selectedPackaging.id,
        packagingLabel: selectedPackaging.label,
        quantity,
      },
      unitPrice,
    );
    track({ name: "add_to_cart", productId: product.id, variantId: selectedVariant.id, quantity });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
    setShowAddedBar(true);
    if (addedBarTimer.current) clearTimeout(addedBarTimer.current);
    addedBarTimer.current = setTimeout(() => setShowAddedBar(false), 12_000);
  }

  const canAddToCart = product.isAvailable && Boolean(selectedVariant?.isAvailable);

  const purchaseControls = useMemo(
    () => (
      <div className="flex flex-col gap-5">
        {product.saleTypes.length > 1 && (
          <fieldset className="flex flex-col gap-2">
            <legend className="text-label text-text-secondary">نوع فروش</legend>
            <div className="flex gap-2" role="tablist">
              {product.saleTypes.map((group, index) => (
                <button
                  key={group.type}
                  type="button"
                  role="tab"
                  aria-selected={index === activeSaleTypeIndex}
                  onClick={() => handleSelectSaleType(index)}
                  className={`rounded-full border px-4 py-2 text-bodySm transition-colors ${
                    index === activeSaleTypeIndex
                      ? "border-brand-black bg-brand-black text-text-inverse"
                      : "border-border-strong text-text-secondary hover:border-brand-black"
                  }`}
                >
                  {group.label}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {activeSaleType && (
          <fieldset className="flex flex-col gap-2">
            <legend className="text-label text-text-secondary">
              {activeSaleType.type === "weight" ? "وزن" : activeSaleType.type === "box" ? "اندازه جعبه" : "تعداد"}
            </legend>
            <div className="flex flex-wrap gap-2">
              {activeSaleType.variants.map((variant) => {
                const isSelected = variant.id === variantId;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    disabled={!variant.isAvailable}
                    onClick={() => handleSelectVariant(variant.id, variant.isAvailable)}
                    aria-pressed={isSelected}
                    className={`rounded-full border px-4 py-2 text-bodySm transition-colors ${
                      !variant.isAvailable
                        ? "cursor-not-allowed border-border text-text-muted line-through"
                        : isSelected
                          ? "border-brand-red bg-brand-redLight text-brand-redDark"
                          : "border-border-strong text-text-secondary hover:border-brand-black"
                    }`}
                  >
                    {variant.label}
                    {!variant.isAvailable && " (ناموجود)"}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        {product.packagingOptions.length > 0 && (
          <fieldset className="flex flex-col gap-2">
            <legend className="text-label text-text-secondary">بسته‌بندی</legend>
            <div className="flex flex-wrap gap-2">
              {product.packagingOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectPackaging(opt.id)}
                  aria-pressed={opt.id === packagingId}
                  className={`rounded-full border px-4 py-2 text-bodySm transition-colors ${
                    opt.id === packagingId
                      ? "border-brand-red bg-brand-redLight text-brand-redDark"
                      : "border-border-strong text-text-secondary hover:border-brand-black"
                  }`}
                >
                  {opt.label}
                  {opt.priceDelta > 0 && ` (+${formatToman(opt.priceDelta)})`}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <QuantitySelector value={quantity} onChange={setQuantity} />
      </div>
    ),
    [activeSaleType, activeSaleTypeIndex, packagingId, product.packagingOptions, product.saleTypes, quantity, variantId],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-caption text-text-muted">{product.categoryLabel}</span>
        <h1 className="text-h1Mobile tablet:text-h1 text-text-primary">{product.name}</h1>
        {product.rating && <RatingStars rating={product.rating} reviewCount={product.reviewCount} />}
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-price text-text-primary">{formatToman(totalPrice)}</span>
        {selectedPackaging && selectedPackaging.priceDelta === 0 && quantity === 1 && (
          <span className="text-caption text-text-muted">برای {selectedVariant?.label}</span>
        )}
      </div>

      {!product.isAvailable ? (
        <div className="rounded-md bg-bg-secondary px-4 py-3 text-bodySm text-text-secondary">
          این محصول در حال حاضر ناموجود است.
        </div>
      ) : (
        purchaseControls
      )}

      <BranchAvailability
        isProductAvailable={product.isAvailable}
        productId={product.id}
        variantId={variantId ?? ""}
      />

      <div className="flex items-center gap-3">
        <Button
          variant="accent"
          size="lg"
          fullWidthOnMobile
          disabled={!canAddToCart}
          onClick={handleAddToCart}
          className="flex-1"
        >
          {justAdded ? "✓ اضافه شد" : canAddToCart ? "افزودن به سبد" : "ناموجود"}
        </Button>
        <button
          type="button"
          onClick={handleToggleWishlist}
          disabled={wishlistStatus === "loading"}
          aria-pressed={isWished}
          aria-label={isWished ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-md border border-border-strong text-xl hover:border-brand-black disabled:opacity-50"
        >
          <span aria-hidden="true" className={isWished ? "text-brand-red" : "text-text-muted"}>
            {wishlistStatus === "loading" ? "…" : isWished ? "♥" : "♡"}
          </span>
        </button>
      </div>
      {showAddedBar && (
        <div
          role="status"
          className="fixed inset-x-4 bottom-24 z-drawer flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-floating tablet:static tablet:inset-auto tablet:shadow-none"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-bodySm text-text-primary">✓ به سبد خرید اضافه شد</span>
            <button
              type="button"
              onClick={() => setShowAddedBar(false)}
              aria-label="بستن"
              className="text-text-muted hover:text-text-primary"
            >
              ✕
            </button>
          </div>
          <div className="flex gap-2">
            <Link href="/cart" className="flex-1">
              <Button variant="secondary" size="md" className="w-full">
                مشاهده سبد خرید
              </Button>
            </Link>
            <Link href="/checkout" className="flex-1">
              <Button variant="accent" size="md" className="w-full">
                ثبت سفارش
              </Button>
            </Link>
          </div>
        </div>
      )}

      {wishlistStatus === "error" && (
        <p role="alert" className="text-caption text-state-error">
          مشکلی پیش آمد، دوباره تلاش کنید.
        </p>
      )}

      {/* نوار خرید Sticky برای موبایل — طبق الزام Conversion-focused بودن موبایل */}
      <div className="fixed inset-x-0 bottom-0 z-drawer flex items-center gap-3 border-t border-border bg-surface p-4 shadow-floating tablet:hidden">
        <div className="flex-1">
          <span className="block text-caption text-text-muted">{selectedVariant?.label}</span>
          <span className="block text-price text-text-primary">{formatToman(totalPrice)}</span>
        </div>
        <Button
          variant="accent"
          size="md"
          disabled={!canAddToCart}
          onClick={handleAddToCart}
          className="flex-1"
        >
          {justAdded ? "✓ اضافه شد" : canAddToCart ? "افزودن به سبد" : "ناموجود"}
        </Button>
      </div>
    </div>
  );
}
