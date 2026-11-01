import { randomUUID } from "crypto";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db/client";
import { getProductDetailById, invalidateCatalogCache } from "@/lib/server/catalog";
import type { CartItem, ProductDetail } from "@/lib/types";
import { calculateCartPricing, priceCartItem } from "../pricing";

// «باقلوا گردویی»: محصول چندنوعی واقعی (کیلویی + اسلایسی) — شناسه ثابت rmg4
const PRODUCT_ID = "rmg4";
let product: ProductDetail;

beforeAll(async () => {
  product = (await getProductDetailById(PRODUCT_ID))!;
});

afterEach(async () => {
  // هر تخفیفی که تست ساخته، پاک می‌شود تا تست‌های دیگر قیمت واقعی ببینند
  await db.prepare("DELETE FROM product_prices WHERE product_id = ? AND discount_percent IS NOT NULL").run(PRODUCT_ID);
  invalidateCatalogCache();
});

function itemFor(productId: string, variantId: string, price: number, quantity = 1): CartItem {
  return {
    lineId: `${productId}-${variantId}`,
    productId,
    productSlug: productId,
    productName: productId,
    categoryLabel: "تست",
    saleType: "weight",
    variantId,
    variantLabel: "تست",
    packagingId: "standard",
    packagingLabel: "استاندارد",
    quantity,
    unitPriceSnapshot: price,
    addedAt: new Date().toISOString(),
  };
}

describe("pricing engine", () => {
  it("never trusts the client-sent price — recalculates from the canonical catalog", async () => {
    const variant = product.saleTypes[0]!.variants[0]!;
    // کلاینت ادعا می‌کند قیمت واحد فقط ۱ تومان است (دستکاری‌شده)
    const tamperedItem = itemFor(product.id, variant.id, 1, 2);

    const breakdown = await priceCartItem(tamperedItem);

    // مبلغ واقعی باید بر اساس قیمت کاتالوگ سرور محاسبه شود، نه ۱ تومان کلاینت
    expect(breakdown.unitBasePrice).toBe(variant.price);
    expect(breakdown.priceChanged).toBe(true);
  });

  it("applies the product discount percentage correctly", async () => {
    // تخفیف ۱۰٪ روی ارزان‌ترین نسخه (همان نسخه‌ای که قیمت «از ...» محصول را می‌سازد)
    const cheapest = product.saleTypes.flatMap((g) => g.variants).sort((a, b) => a.price - b.price)[0]!;
    await db
      .prepare(
        "INSERT INTO product_prices (id, product_id, variant_id, price, previous_price, discount_percent, effective_from) VALUES (?, ?, ?, ?, ?, ?, ?)",
      )
      .run(randomUUID(), PRODUCT_ID, cheapest.id, cheapest.price, Math.round(cheapest.price * 1.1), 10, new Date(Date.now() + 60_000).toISOString());
    invalidateCatalogCache();

    const discounted = (await getProductDetailById(PRODUCT_ID))!;
    expect(discounted.discountPercent).toBe(10);

    const variant = discounted.saleTypes[0]!.variants[0]!;
    const breakdown = await priceCartItem(itemFor(discounted.id, variant.id, variant.price, 1));

    const expectedDiscount = Math.round(variant.price * (discounted.discountPercent! / 100));
    expect(breakdown.productDiscountAmount).toBe(expectedDiscount);
    expect(breakdown.lineTotal).toBe(breakdown.lineSubtotal - expectedDiscount);
  });

  it("marks delivery fee as pending (not a fabricated number) when not provided", async () => {
    const variant = product.saleTypes[0]!.variants[0]!;
    const item = itemFor(product.id, variant.id, variant.price, 1);
    const result = await calculateCartPricing([item]);

    expect(result.deliveryFeeIsPending).toBe(true);
    expect(result.deliveryFee).toBe(0);
  });

  it("honestly reports that coupon codes are not yet active (Phase 2 feature)", async () => {
    const variant = product.saleTypes[0]!.variants[0]!;
    const item = itemFor(product.id, variant.id, variant.price, 1);
    const result = await calculateCartPricing([item], { couponCode: "SUMMER10" });

    expect(result.couponDiscountTotal).toBe(0);
    expect(result.couponError).toBeTruthy();
  });
});
