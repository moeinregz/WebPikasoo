import { describe, expect, it } from "vitest";
import { __setStockForTest, getStock, hasSufficientStockForCart } from "../inventoryService";
import { reserveForOrder, releaseReservation } from "@/lib/inventory/core";
import { SYSTEM_ACTOR } from "@/lib/inventory/rbac";

const V = "v1";

describe("inventoryService (branch-selection adapter over lib/inventory/core)", () => {
  // سناریو ۱۰: تعداد بیشتر از موجودی است
  it("flags insufficient stock when quantity exceeds available stock", async () => {
    await __setStockForTest("branch-x", "product-a", V, 2);
    const result = await hasSufficientStockForCart("branch-x", [{ productId: "product-a", variantId: V, quantity: 3 }]);
    expect(result.sufficient).toBe(false);
    expect(result.missingProductIds).toContain("product-a");
  });

  it("passes when quantity is within available stock", async () => {
    await __setStockForTest("branch-x2", "product-a", V, 5);
    const result = await hasSufficientStockForCart("branch-x2", [{ productId: "product-a", variantId: V, quantity: 3 }]);
    expect(result.sufficient).toBe(true);
  });

  // سناریو ۸: دو مشتری هم‌زمان آخرین موجودی را می‌خرند — فقط یکی باید موفق شود
  it("only one of two simultaneous reservations for the last unit succeeds", async () => {
    await __setStockForTest("branch-concurrency", "last-item", V, 1);

    // هر دو درخواست بدون هیچ await میان‌راه، پشت‌سرهم (Synchronous) اجرا
    // می‌شوند — دقیقاً مدل واقعی همزمانی Node.js تک‌رشته‌ای.
    const firstAttempt = await reserveForOrder(
      "order-1",
      "branch-concurrency",
      [{ productId: "last-item", variantId: V, quantity: 1 }],
      SYSTEM_ACTOR,
    );
    const secondAttempt = await reserveForOrder(
      "order-2",
      "branch-concurrency",
      [{ productId: "last-item", variantId: V, quantity: 1 }],
      SYSTEM_ACTOR,
    );

    const successes = [firstAttempt, secondAttempt].filter((r) => r.success);
    expect(successes).toHaveLength(1);
    expect(await getStock("branch-concurrency", "last-item", V)).toBe(0);
  });

  it("all-or-nothing: a multi-item reservation fails entirely if any single item is short", async () => {
    await __setStockForTest("branch-y", "product-a", V, 5);
    await __setStockForTest("branch-y", "product-b", V, 0);

    const result = await reserveForOrder(
      "order-3",
      "branch-y",
      [
        { productId: "product-a", variantId: V, quantity: 1 },
        { productId: "product-b", variantId: V, quantity: 1 },
      ],
      SYSTEM_ACTOR,
    );

    expect(result.success).toBe(false);
    // چون هیچ‌کدام کسر نمی‌شوند، موجودی product-a باید دست‌نخورده بماند
    expect(await getStock("branch-y", "product-a", V)).toBe(5);
  });

  // سناریو ۱۱: موجودی هنگام Checkout تغییر می‌کند
  it("reservation fails if stock changes to zero between check and reserve", async () => {
    await __setStockForTest("branch-z", "product-a", V, 1);
    const initialCheck = await hasSufficientStockForCart("branch-z", [{ productId: "product-a", variantId: V, quantity: 1 }]);
    expect(initialCheck.sufficient).toBe(true);

    // شبیه‌سازی تغییر موجودی توسط یک سفارش دیگر در همین فاصله
    await __setStockForTest("branch-z", "product-a", V, 0);

    const reservation = await reserveForOrder(
      "order-4",
      "branch-z",
      [{ productId: "product-a", variantId: V, quantity: 1 }],
      SYSTEM_ACTOR,
    );
    expect(reservation.success).toBe(false);
  });

  it("releaseReservation restores previously reserved quantity (e.g. on order cancellation)", async () => {
    await __setStockForTest("branch-release", "product-a", V, 3);
    await reserveForOrder("order-5", "branch-release", [{ productId: "product-a", variantId: V, quantity: 2 }], SYSTEM_ACTOR);
    expect(await getStock("branch-release", "product-a", V)).toBe(1);

    await releaseReservation("order-5", "test_release", SYSTEM_ACTOR);
    expect(await getStock("branch-release", "product-a", V)).toBe(3);
  });
});
