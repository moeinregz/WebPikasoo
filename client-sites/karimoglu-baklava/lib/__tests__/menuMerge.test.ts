import { describe, expect, it } from "vitest";
import { MERGED_MENU_GROUPS, RAW_MENU_ITEMS } from "../menuProductsData";
import { allProducts, getProductDetailById } from "../mock-data";

describe("merged menu (one product, many variants)", () => {
  it("has unique product ids and unique slugs", () => {
    expect(new Set(RAW_MENU_ITEMS.map((i) => i.id)).size).toBe(RAW_MENU_ITEMS.length);
    expect(new Set(allProducts.map((p) => p.slug)).size).toBe(allProducts.length);
  });

  it("uses every legacy row at most once and never loses a legacy product id", () => {
    const members = MERGED_MENU_GROUPS.flatMap((g) => g.memberLegacyIds);
    expect(new Set(members).size).toBe(members.length);
    const keptLegacyIds = RAW_MENU_ITEMS.filter((i) => /^rm\d+$/.test(i.id)).map((i) => i.id);
    expect(keptLegacyIds.some((id) => members.includes(id))).toBe(false);
  });

  it("gives every variant a positive price and a unique variant id", () => {
    for (const product of allProducts) {
      const detail = getProductDetailById(product.id)!;
      const variants = detail.saleTypes.flatMap((g) => g.variants);
      expect(variants.length).toBeGreaterThan(0);
      expect(new Set(variants.map((v) => v.id)).size).toBe(variants.length);
      expect(variants.every((v) => v.price > 0)).toBe(true);
    }
  });

  it("puts kilo and slice sales of the same baklava into one product", () => {
    const walnut = getProductDetailById("rmg4")!;
    expect(walnut.name).toBe("باقلوا گردویی");
    expect(walnut.saleTypes.map((g) => g.type)).toEqual(["weight", "count"]);
    expect(walnut.saleTypes.map((g) => g.label)).toEqual(["کیلویی", "اسلایسی"]);
    expect(walnut.saleTypes[1]!.variants.map((v) => v.label)).toEqual(["اسلایس کوچک", "اسلایس بزرگ"]);
  });

  it("no longer lists the merged types as separate products", () => {
    const names = allProducts.map((p) => p.name);
    expect(names).not.toContain("باقلوا گردویی اسلایس کوچک");
    expect(names).not.toContain("شکلات دبی کوچک");
    expect(names).toContain("شکلات دبی");
  });
});
