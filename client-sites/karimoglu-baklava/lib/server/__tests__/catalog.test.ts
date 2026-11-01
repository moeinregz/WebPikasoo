import { randomUUID } from "crypto";
import { afterEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db/client";
import { allProducts, getBranchScopeForProduct } from "@/lib/mock-data";
import {
  getCatalogProducts,
  getFeaturedProducts,
  getProductDetailById,
  getProductDetailBySlug,
  getRelatedProducts,
  invalidateCatalogCache,
} from "../catalog";

const onlineProducts = allProducts.filter((p) => getBranchScopeForProduct(p.id) !== "piroozi");
const piroozProducts = allProducts.filter((p) => getBranchScopeForProduct(p.id) === "piroozi");

afterEach(() => {
  invalidateCatalogCache();
});

describe("catalog (read from PostgreSQL)", () => {
  it("serves exactly the products that can be sold online", async () => {
    const catalog = await getCatalogProducts();
    expect(new Set(catalog.map((p) => p.id))).toEqual(new Set(onlineProducts.map((p) => p.id)));
  });

  it("hides products sold only at a non-online branch (Piroozi) but still resolves them by id for admin pages", async () => {
    expect(piroozProducts.length).toBeGreaterThan(0);
    for (const product of piroozProducts.slice(0, 3)) {
      expect(await getProductDetailBySlug(product.slug)).toBeUndefined();
      const detail = await getProductDetailById(product.id);
      expect(detail?.isAvailable).toBe(false);
    }
  });

  it("builds sale types, prices and packaging from the database", async () => {
    const product = onlineProducts[0]!;
    const detail = await getProductDetailById(product.id);
    expect(detail).toBeDefined();
    expect(detail!.saleTypes.length).toBeGreaterThan(0);
    expect(detail!.saleTypes[0]!.variants[0]!.price).toBeGreaterThan(0);
    expect(detail!.packagingOptions.length).toBeGreaterThan(0);
    expect(detail!.startingPrice).toBe(product.startingPrice);
  });

  it("never shows internal review notes to customers", async () => {
    for (const product of (await getCatalogProducts()).slice(0, 20)) {
      const detail = await getProductDetailById(product.id);
      expect(detail!.features.join(" ")).not.toContain("⚠️");
    }
  });

  it("offers quick-add data only for single-variant products", async () => {
    const catalog = await getCatalogProducts();
    for (const product of catalog) {
      if (product.hasSimpleDefaultUnit && product.isAvailable) {
        expect(product.quickAdd?.variantId).toBeTruthy();
      } else if (!product.hasSimpleDefaultUnit) {
        expect(product.quickAdd).toBeUndefined();
      }
    }
  });

  it("reflects a price change after the cache is invalidated", async () => {
    const product = onlineProducts[0]!;
    const before = await getProductDetailById(product.id);
    const variant = before!.saleTypes[0]!.variants[0]!;
    await db
      .prepare("INSERT INTO product_prices (id, product_id, variant_id, price, effective_from) VALUES (?, ?, ?, ?, ?)")
      .run(randomUUID(), product.id, variant.id, 987654, new Date(Date.now() + 60_000).toISOString());
    invalidateCatalogCache();

    const after = await getProductDetailById(product.id);
    expect(after!.saleTypes[0]!.variants[0]!.price).toBe(987654);

    await db.prepare("DELETE FROM product_prices WHERE product_id = ? AND variant_id = ? AND price = ?").run(product.id, variant.id, 987654);
  });

  it("hides a product the admin deactivated", async () => {
    const product = onlineProducts[1]!;
    await db.prepare("UPDATE products SET is_active = 0 WHERE id = ?").run(product.id);
    invalidateCatalogCache();
    expect(await getProductDetailBySlug(product.slug)).toBeUndefined();
    expect((await getCatalogProducts()).some((p) => p.id === product.id)).toBe(false);

    await db.prepare("UPDATE products SET is_active = 1 WHERE id = ?").run(product.id);
    invalidateCatalogCache();
    expect(await getProductDetailBySlug(product.slug)).toBeDefined();
  });

  it("returns featured and related products from the same visible catalog", async () => {
    const featured = await getFeaturedProducts(8);
    expect(featured.length).toBeGreaterThan(0);
    expect(featured.every((p) => p.isAvailable)).toBe(true);

    const first = (await getCatalogProducts())[0]!;
    const related = await getRelatedProducts(first, 4);
    expect(related.every((p) => p.category === first.category && p.id !== first.id)).toBe(true);
  });
});
