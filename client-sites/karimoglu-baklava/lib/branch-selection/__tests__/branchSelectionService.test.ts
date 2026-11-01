import { beforeEach, describe, expect, it } from "vitest";
import { selectBranchForOrder } from "../branchSelectionService";
import { __setStockForTest } from "../inventoryService";
import type { CartItem } from "@/lib/types";

function item(productId: string, quantity = 1): CartItem {
  return {
    lineId: productId,
    productId,
    productSlug: productId,
    productName: productId,
    categoryLabel: "تست",
    saleType: "weight",
    variantId: "v1",
    variantLabel: "تست",
    packagingId: "p1",
    packagingLabel: "تست",
    quantity,
    unitPriceSnapshot: 100000,
    addedAt: new Date().toISOString(),
  };
}

// فقط این ۴ شعبه فروش آنلاین دارند (acceptsOnlineOrders)
const TEHRAN_BRANCH_IDS = ["satarkhan", "ariashahr", "kourosh-mall", "tajrish"];

// مختصات واقعی شعب (برای تست نزدیک‌ترین شعبه)
const ARIASHAHR = { lat: 35.721900305922844, lng: 51.347495725159206 };
const TAJRISH = { lat: 35.805434774305354, lng: 51.432041605515366 };

async function giveAllTehranBranchesPlentyOfStock(productId: string, qty = 10) {
  for (const branchId of TEHRAN_BRANCH_IDS) {
    await __setStockForTest(branchId, productId, "v1", qty);
  }
  await __setStockForTest("hamedan", productId, "v1", qty);
}

describe("selectBranchForOrder", () => {
  // پیش از هر تست، یک محصول تازه (شناسه یکتا بر اساس expect.getState) استفاده
  // می‌شود تا هیچ تستی از رزرو/موجودی تست دیگر متأثر نشود.
  let productA: string;
  let productB: string;

  beforeEach((ctx) => {
    const testId = ctx.task.id;
    productA = `A-${testId}`;
    productB = `B-${testId}`;
  });

  // سناریو ۱: نزدیک‌ترین شعبه همه محصولات را دارد
  it("selects the nearest branch when it can fulfill the entire cart", async () => {
    await giveAllTehranBranchesPlentyOfStock(productA);
    await giveAllTehranBranchesPlentyOfStock(productB);

    const result = await selectBranchForOrder({
      cartItems: [item(productA), item(productB)],
      customerLocation: { coordinates: null, city: "تهران" },
      deliveryMethod: "express",
      now: new Date(Date.UTC(2026, 0, 1, 10, 30, 0)), // ۱۴:۰۰ به وقت تهران
    });

    expect(result.status).toBe("selected");
    expect(result.selected?.branchId).toBe("satarkhan"); // اولین شعبه در ترتیب اولویت فعلی
  });

  // سناریو ۲ و ۳: نزدیک‌ترین شعبه یکی از محصولات را ندارد؛ شعبه دوم کل سبد را دارد
  it("skips the nearest branch when it lacks one product, and picks the next branch that has the full cart", async () => {
    await __setStockForTest("satarkhan", productA, "v1", 5);
    await __setStockForTest("satarkhan", productB, "v1", 0); // نزدیک‌ترین شعبه، محصول B را ندارد

    await __setStockForTest("ariashahr", productA, "v1", 5);
    await __setStockForTest("ariashahr", productB, "v1", 5); // شعبه دوم کل سبد را دارد

    const result = await selectBranchForOrder({
      cartItems: [item(productA), item(productB)],
      customerLocation: { coordinates: null, city: "تهران" },
      deliveryMethod: "express",
      now: new Date(Date.UTC(2026, 0, 1, 10, 30, 0)), // ۱۴:۰۰ به وقت تهران
    });

    expect(result.status).toBe("selected");
    expect(result.selected?.branchId).toBe("ariashahr");
  });

  // سناریو ۴: هیچ شعبه‌ای کل سبد را ندارد
  it("returns no_branch_available when no branch can fulfill the whole cart", async () => {
    await giveAllTehranBranchesPlentyOfStock(productA);
    // هیچ شعبه‌ای موجودی productB ندارد
    const result = await selectBranchForOrder({
      cartItems: [item(productA), item(productB)],
      customerLocation: { coordinates: null, city: "تهران" },
      deliveryMethod: "express",
      now: new Date(Date.UTC(2026, 0, 1, 10, 30, 0)), // ۱۴:۰۰ به وقت تهران
    });

    expect(result.status).toBe("no_branch_available");
    expect(result.selected).toBeNull();
    expect(result.userMessage).toMatch(/هیچ شعبه‌ای/);
  });

  // سناریو ۵: انتخاب دستی شعبه (معتبر و نامعتبر)
  it("accepts a valid manual branch override even if it is not the top-ranked one", async () => {
    await giveAllTehranBranchesPlentyOfStock(productA);

    const result = await selectBranchForOrder({
      cartItems: [item(productA)],
      customerLocation: { coordinates: null, city: "تهران" },
      deliveryMethod: "express",
      now: new Date(Date.UTC(2026, 0, 1, 10, 30, 0)), // ۱۴:۰۰ به وقت تهران
      preferredBranchId: "tajrish",
    });

    expect(result.status).toBe("selected");
    expect(result.selected?.branchId).toBe("tajrish");
  });

  it("rejects a manual branch override that cannot fulfill the cart, without bypassing validation", async () => {
    await __setStockForTest("tajrish", productA, "v1", 0);

    const result = await selectBranchForOrder({
      cartItems: [item(productA)],
      customerLocation: { coordinates: null, city: "تهران" },
      deliveryMethod: "express",
      now: new Date(Date.UTC(2026, 0, 1, 10, 30, 0)), // ۱۴:۰۰ به وقت تهران
      preferredBranchId: "tajrish",
    });

    expect(result.status).toBe("manual_branch_rejected");
    expect(result.selected).toBeNull();
  });

  // سناریو ۱۲: مشتری آدرس (شهر) خود را تغییر می‌دهد → تصمیم دوباره گرفته می‌شود
  it("re-evaluates the decision when the customer changes their city", async () => {
    await giveAllTehranBranchesPlentyOfStock(productA, 10);
    await __setStockForTest("hamedan", productA, "v1", 0); // همدان این محصول را ندارد

    const tehranResult = await selectBranchForOrder({
      cartItems: [item(productA)],
      customerLocation: { coordinates: null, city: "تهران" },
      deliveryMethod: "express",
      now: new Date(Date.UTC(2026, 0, 1, 10, 30, 0)), // ۱۴:۰۰ به وقت تهران
    });
    expect(tehranResult.status).toBe("selected");

    const hamedanResult = await selectBranchForOrder({
      cartItems: [item(productA)],
      customerLocation: { coordinates: null, city: "همدان" },
      deliveryMethod: "express",
      now: new Date(Date.UTC(2026, 0, 1, 10, 30, 0)), // ۱۴:۰۰ به وقت تهران
    });
    expect(hamedanResult.status).toBe("no_branch_available");
    expect(hamedanResult.userMessage).toMatch(/فروش آنلاین/); // همدان فعلاً فروش آنلاین ندارد
  });

  // سناریو ۱۳: مشتری سبد خود را تغییر می‌دهد → تصمیم دوباره باید کل سبد جدید را بررسی کند
  it("re-evaluates the decision when the cart contents change", async () => {
    await __setStockForTest("satarkhan", productA, "v1", 5);
    await __setStockForTest("satarkhan", productB, "v1", 0);
    await __setStockForTest("ariashahr", productA, "v1", 5);
    await __setStockForTest("ariashahr", productB, "v1", 5);

    const beforeAddingB = await selectBranchForOrder({
      cartItems: [item(productA)],
      customerLocation: { coordinates: null, city: "تهران" },
      deliveryMethod: "express",
      now: new Date(Date.UTC(2026, 0, 1, 10, 30, 0)), // ۱۴:۰۰ به وقت تهران
    });
    expect(beforeAddingB.selected?.branchId).toBe("satarkhan");

    const afterAddingB = await selectBranchForOrder({
      cartItems: [item(productA), item(productB)],
      customerLocation: { coordinates: null, city: "تهران" },
      deliveryMethod: "express",
      now: new Date(Date.UTC(2026, 0, 1, 10, 30, 0)), // ۱۴:۰۰ به وقت تهران
    });
    expect(afterAddingB.selected?.branchId).toBe("ariashahr");
  });

  it("returns a clear error when neither coordinates nor city are provided (never guesses location)", async () => {
    const result = await selectBranchForOrder({
      cartItems: [item(productA)],
      customerLocation: { coordinates: null, city: null },
      deliveryMethod: "express",
      now: new Date(Date.UTC(2026, 0, 1, 10, 30, 0)), // ۱۴:۰۰ به وقت تهران
    });
    expect(result.status).toBe("no_branch_available");
    expect(result.userMessage).toMatch(/موقعیت/);
  });

  // ===== انتخاب نزدیک‌ترین شعبه با مختصات واقعی =====
  const NOW = new Date(Date.UTC(2026, 0, 1, 10, 30, 0)); // ۱۴:۰۰ به وقت تهران

  it("picks the geographically nearest online branch when it has the full cart", async () => {
    await giveAllTehranBranchesPlentyOfStock(productA);

    const nearAria = await selectBranchForOrder({
      cartItems: [item(productA)],
      customerLocation: { coordinates: ARIASHAHR, city: "تهران" },
      deliveryMethod: "express",
      now: NOW,
    });
    expect(nearAria.selected?.branchId).toBe("ariashahr");
    expect(nearAria.selected?.distanceKm).toBeLessThan(0.5);

    const nearTajrish = await selectBranchForOrder({
      cartItems: [item(productA)],
      customerLocation: { coordinates: TAJRISH, city: "تهران" },
      deliveryMethod: "express",
      now: NOW,
    });
    expect(nearTajrish.selected?.branchId).toBe("tajrish");
  });

  it("falls back to the next nearest branch when the nearest lacks stock, then the next one", async () => {
    await giveAllTehranBranchesPlentyOfStock(productA);

    // آریاشهر موجودی ندارد → نزدیک‌ترین بعدی از آریاشهر ستارخان است (حدود ۳ کیلومتر)
    await __setStockForTest("ariashahr", productA, "v1", 0);
    const second = await selectBranchForOrder({
      cartItems: [item(productA)],
      customerLocation: { coordinates: ARIASHAHR, city: "تهران" },
      deliveryMethod: "express",
      now: NOW,
    });
    expect(second.selected?.branchId).toBe("satarkhan");
    expect(second.selected?.reason).toMatch(/نزدیک‌ترین شعبه بعدی/);

    // ستارخان هم موجودی ندارد → کوروش مال (حدود ۳٫۶ کیلومتر)
    await __setStockForTest("satarkhan", productA, "v1", 0);
    const third = await selectBranchForOrder({
      cartItems: [item(productA)],
      customerLocation: { coordinates: ARIASHAHR, city: "تهران" },
      deliveryMethod: "express",
      now: NOW,
    });
    expect(third.selected?.branchId).toBe("kourosh-mall");

    // کوروش مال هم ندارد → تجریش (دورترین)
    await __setStockForTest("kourosh-mall", productA, "v1", 0);
    const fourth = await selectBranchForOrder({
      cartItems: [item(productA)],
      customerLocation: { coordinates: ARIASHAHR, city: "تهران" },
      deliveryMethod: "express",
      now: NOW,
    });
    expect(fourth.selected?.branchId).toBe("tajrish");
  });

  it("never selects a branch without online sales (piroozi/hamedan), even if it has stock", async () => {
    await __setStockForTest("piroozi", productA, "v1", 50);
    await __setStockForTest("hamedan", productA, "v1", 50);
    // هیچ‌یک از ۴ شعبه آنلاین موجودی ندارد

    const result = await selectBranchForOrder({
      cartItems: [item(productA)],
      customerLocation: { coordinates: null, city: "تهران" },
      deliveryMethod: "express",
      now: NOW,
    });
    expect(result.status).toBe("no_branch_available");
  });

  it("rejects a manual override of a branch that has no online sales", async () => {
    await __setStockForTest("piroozi", productA, "v1", 50);
    const result = await selectBranchForOrder({
      cartItems: [item(productA)],
      customerLocation: { coordinates: null, city: "تهران" },
      deliveryMethod: "express",
      now: NOW,
      preferredBranchId: "piroozi",
    });
    expect(result.status).toBe("manual_branch_rejected");
  });
});
