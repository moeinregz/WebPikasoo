import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db/client";
import { getProductDetailById, invalidateCatalogCache } from "@/lib/server/catalog";
import type { CartItem, ProductDetail } from "@/lib/types";
import { validateCart } from "../validateCart";

// «باقلوا گردویی»: محصول چندنوعی واقعی (کیلویی + اسلایسی) — شناسه ثابت rmg4
let product: ProductDetail;

beforeAll(async () => {
  product = (await getProductDetailById("rmg4"))!;
});

afterEach(async () => {
  await db.prepare("UPDATE product_variants SET is_available = 1 WHERE product_id = ?").run("rmg4");
  invalidateCatalogCache();
});

function baseItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    lineId: "line-1",
    productId: product.id,
    productSlug: product.slug,
    productName: product.name,
    categoryLabel: product.categoryLabel,
    saleType: "weight",
    variantId: product.saleTypes[0]!.variants[0]!.id,
    variantLabel: product.saleTypes[0]!.variants[0]!.label,
    packagingId: product.packagingOptions[0]!.id,
    packagingLabel: product.packagingOptions[0]!.label,
    quantity: 1,
    unitPriceSnapshot: product.saleTypes[0]!.variants[0]!.price,
    addedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("validateCart", () => {
  it("passes for a correctly configured, available item", async () => {
    const result = await validateCart([baseItem()], { city: "تهران" });
    const itemIssues = result.issues.filter((i) => i.lineId === "line-1");
    expect(itemIssues).toHaveLength(0);
  });

  // سناریو ۸: نوع محصول (Variant) ناموجود است
  it("flags an unavailable variant (اسلایس کوچک که ادمین ناموجود کرده)", async () => {
    const countGroup = product.saleTypes.find((g) => g.type === "count")!;
    const variant = countGroup.variants[0]!;
    await db.prepare("UPDATE product_variants SET is_available = 0 WHERE product_id = ? AND id = ?").run(product.id, variant.id);
    invalidateCatalogCache();

    const result = await validateCart(
      [baseItem({ saleType: "count", variantId: variant.id, variantLabel: variant.label })],
      { city: "تهران" },
    );

    const issue = result.issues.find((i) => i.lineId === "line-1");
    expect(issue?.code).toBe("out_of_stock");
  });

  // سناریو ۹: بسته‌بندی ناموجود است
  it("flags a packaging option that does not exist for the product", async () => {
    const result = await validateCart([baseItem({ packagingId: "nonexistent-packaging" })], { city: "تهران" });
    const issue = result.issues.find((i) => i.lineId === "line-1");
    expect(issue?.code).toBe("packaging_not_found");
  });

  it("flags a product that no longer exists", async () => {
    const result = await validateCart([baseItem({ productId: "does-not-exist" })], { city: "تهران" });
    const issue = result.issues.find((i) => i.lineId === "line-1");
    expect(issue?.code).toBe("product_not_found");
  });
});
