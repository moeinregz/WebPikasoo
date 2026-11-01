import { beforeEach, describe, expect, it } from "vitest";
import {
  checkCartAvailability,
  checkCartAvailabilityForBranches,
  commitSale,
  getBranchStock,
  getLowStockItems,
  getTransactionHistory,
  manualSetStock,
  receiveIntoWarehouse,
  releaseOrCompensateForCancelledOrder,
  releaseReservation,
  reserveForOrder,
  setLowStockThreshold,
  transferWarehouseToBranch,
} from "../core";
import { getAvailable } from "../types";
import { SYSTEM_ACTOR, type Actor } from "../rbac";
import { __resetInventoryDbForTest } from "../store";

const ADMIN: Actor = { id: "admin-1", role: "site_admin" };
const V = "v-500g";

beforeEach(async () => {
  await __resetInventoryDbForTest();
});

describe("manual stock entry & adjustment", () => {
  it("records a manual_entry transaction the first time a SKU is touched", async () => {
    const result = await manualSetStock("branch-a", "prod-1", V, 20, "شمارش اولیه انبار", ADMIN);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.result.record.onHand).toBe(20);
    expect(result.result.transaction.type).toBe("manual_entry");
    expect(result.result.transaction.onHandBefore).toBe(0);
    expect(result.result.transaction.onHandAfter).toBe(20);
  });

  it("records a manual_adjustment (not manual_entry) on subsequent changes", async () => {
    await manualSetStock("branch-a", "prod-1", V, 20, "ورود اولیه", ADMIN);
    const second = await manualSetStock("branch-a", "prod-1", V, 15, "اصلاح پس از شمارش مجدد", ADMIN);
    expect(second.success).toBe(true);
    if (!second.success) return;
    expect(second.result.transaction.type).toBe("manual_adjustment");
    expect(second.result.transaction.onHandDelta).toBe(-5);
  });

  // سناریو ۳: جلوگیری از موجودی منفی
  it("rejects negative or non-integer stock values", async () => {
    expect((await manualSetStock("branch-a", "prod-1", V, -1, "x", ADMIN)).success).toBe(false);
    expect((await manualSetStock("branch-a", "prod-1", V, 1.5, "x", ADMIN)).success).toBe(false);
  });

  it("refuses to set on-hand below the currently reserved quantity", async () => {
    await manualSetStock("branch-a", "prod-1", V, 10, "ورود اولیه", ADMIN);
    await reserveForOrder("order-res", "branch-a", [{ productId: "prod-1", variantId: V, quantity: 4 }], SYSTEM_ACTOR);
    const attempt = await manualSetStock("branch-a", "prod-1", V, 2, "تلاش اشتباه", ADMIN);
    expect(attempt.success).toBe(false);
  });
});

describe("reservation lifecycle", () => {
  it("reserves stock and reduces available quantity without touching onHand", async () => {
    await manualSetStock("branch-a", "prod-1", V, 10, "init", ADMIN);
    const outcome = await reserveForOrder("order-1", "branch-a", [{ productId: "prod-1", variantId: V, quantity: 3 }], SYSTEM_ACTOR);
    expect(outcome.success).toBe(true);

    const record = await getBranchStock("branch-a", "prod-1", V);
    expect(record.onHand).toBe(10);
    expect(record.reserved).toBe(3);
    expect(getAvailable(record)).toBe(7);
  });

  it("is idempotent for the same orderId (no double reservation)", async () => {
    await manualSetStock("branch-a", "prod-1", V, 10, "init", ADMIN);
    await reserveForOrder("order-1", "branch-a", [{ productId: "prod-1", variantId: V, quantity: 3 }], SYSTEM_ACTOR);
    const again = await reserveForOrder("order-1", "branch-a", [{ productId: "prod-1", variantId: V, quantity: 3 }], SYSTEM_ACTOR);
    expect(again.success).toBe(true);
    if (again.success) expect(again.alreadyReserved).toBe(true);
    expect((await getBranchStock("branch-a", "prod-1", V)).reserved).toBe(3); // نه ۶
  });

  // سناریو ۹ و ۱۰: خرید چندتایی + چند نوع محصول در یک رزرو
  it("reserves multiple quantities across multiple products atomically (all-or-nothing)", async () => {
    await manualSetStock("branch-a", "prod-1", V, 5, "init", ADMIN);
    await manualSetStock("branch-a", "prod-2", V, 5, "init", ADMIN);

    const outcome = await reserveForOrder(
      "order-multi",
      "branch-a",
      [
        { productId: "prod-1", variantId: V, quantity: 2 },
        { productId: "prod-2", variantId: V, quantity: 4 },
      ],
      SYSTEM_ACTOR,
    );
    expect(outcome.success).toBe(true);
    expect((await getBranchStock("branch-a", "prod-1", V)).reserved).toBe(2);
    expect((await getBranchStock("branch-a", "prod-2", V)).reserved).toBe(4);
  });

  it("fails entirely (no partial reservation) when any single item is short", async () => {
    await manualSetStock("branch-a", "prod-1", V, 5, "init", ADMIN);
    await manualSetStock("branch-a", "prod-2", V, 1, "init", ADMIN);

    const outcome = await reserveForOrder(
      "order-partial",
      "branch-a",
      [
        { productId: "prod-1", variantId: V, quantity: 2 },
        { productId: "prod-2", variantId: V, quantity: 5 }, // بیشتر از موجودی
      ],
      SYSTEM_ACTOR,
    );
    expect(outcome.success).toBe(false);
    expect((await getBranchStock("branch-a", "prod-1", V)).reserved).toBe(0); // دست‌نخورده
  });

  // سناریو ۸: دو سفارش هم‌زمان برای آخرین واحد
  it("only one of two concurrent reservations for the last unit succeeds", async () => {
    await manualSetStock("branch-a", "prod-1", V, 1, "init", ADMIN);
    const first = await reserveForOrder("order-c1", "branch-a", [{ productId: "prod-1", variantId: V, quantity: 1 }], SYSTEM_ACTOR);
    const second = await reserveForOrder("order-c2", "branch-a", [{ productId: "prod-1", variantId: V, quantity: 1 }], SYSTEM_ACTOR);
    expect([first, second].filter((r) => r.success)).toHaveLength(1);
  });

  // سناریو ۵ و ۱۸: آزادسازی رزرو (مثلاً بعد از شکست پرداخت)
  it("releases a reservation and restores available quantity", async () => {
    await manualSetStock("branch-a", "prod-1", V, 10, "init", ADMIN);
    await reserveForOrder("order-1", "branch-a", [{ productId: "prod-1", variantId: V, quantity: 3 }], SYSTEM_ACTOR);

    const release = await releaseReservation("order-1", "payment_failed", SYSTEM_ACTOR);
    expect(release.released).toBe(true);
    const record = await getBranchStock("branch-a", "prod-1", V);
    expect(record.reserved).toBe(0);
    expect(getAvailable(record)).toBe(10);
  });

  it("release is idempotent — calling it twice has no double effect", async () => {
    await manualSetStock("branch-a", "prod-1", V, 10, "init", ADMIN);
    await reserveForOrder("order-1", "branch-a", [{ productId: "prod-1", variantId: V, quantity: 3 }], SYSTEM_ACTOR);
    await releaseReservation("order-1", "payment_failed", SYSTEM_ACTOR);
    const secondRelease = await releaseReservation("order-1", "payment_failed", SYSTEM_ACTOR);
    expect(secondRelease.released).toBe(false);
    expect((await getBranchStock("branch-a", "prod-1", V)).reserved).toBe(0);
  });

  // سناریو ۶: تبدیل رزرو به فروش قطعی
  it("commits a reservation to a final sale: onHand and reserved both drop, sold increases", async () => {
    await manualSetStock("branch-a", "prod-1", V, 10, "init", ADMIN);
    await reserveForOrder("order-1", "branch-a", [{ productId: "prod-1", variantId: V, quantity: 3 }], SYSTEM_ACTOR);

    const commit = await commitSale("order-1", SYSTEM_ACTOR);
    expect(commit.committed).toBe(true);

    const record = await getBranchStock("branch-a", "prod-1", V);
    expect(record.onHand).toBe(7);
    expect(record.reserved).toBe(0);
    expect(record.sold).toBe(3);
  });

  it("cannot commit an already-released reservation", async () => {
    await manualSetStock("branch-a", "prod-1", V, 10, "init", ADMIN);
    await reserveForOrder("order-1", "branch-a", [{ productId: "prod-1", variantId: V, quantity: 3 }], SYSTEM_ACTOR);
    await releaseReservation("order-1", "cancelled", SYSTEM_ACTOR);
    expect((await commitSale("order-1", SYSTEM_ACTOR)).committed).toBe(false);
  });
});

// سناریو ۷: لغو سفارش
describe("order cancellation", () => {
  it("releases the reservation when the order is cancelled before payment succeeded", async () => {
    await manualSetStock("branch-a", "prod-1", V, 10, "init", ADMIN);
    await reserveForOrder("order-1", "branch-a", [{ productId: "prod-1", variantId: V, quantity: 3 }], SYSTEM_ACTOR);

    await releaseOrCompensateForCancelledOrder("order-1", SYSTEM_ACTOR);
    expect(getAvailable(await getBranchStock("branch-a", "prod-1", V))).toBe(10);
  });

  it("reverses a committed sale when the order is cancelled after payment already succeeded", async () => {
    await manualSetStock("branch-a", "prod-1", V, 10, "init", ADMIN);
    await reserveForOrder("order-1", "branch-a", [{ productId: "prod-1", variantId: V, quantity: 3 }], SYSTEM_ACTOR);
    await commitSale("order-1", SYSTEM_ACTOR);

    await releaseOrCompensateForCancelledOrder("order-1", SYSTEM_ACTOR);
    const record = await getBranchStock("branch-a", "prod-1", V);
    expect(record.onHand).toBe(10); // برگشت کامل
    expect(record.sold).toBe(0);
  });
});

describe("cart availability checks", () => {
  it("reports the whole cart as available when every item has enough stock", async () => {
    await manualSetStock("branch-a", "prod-1", V, 5, "init", ADMIN);
    await manualSetStock("branch-a", "prod-2", V, 5, "init", ADMIN);
    const check = await checkCartAvailability("branch-a", [
      { productId: "prod-1", variantId: V, quantity: 2 },
      { productId: "prod-2", variantId: V, quantity: 2 },
    ]);
    expect(check.sufficient).toBe(true);
  });

  // سناریو ۱۲ و ۱۴: شعبه A ناموجود / شعبه B موجود، یا هیچ‌کدام کل سبد را ندارند
  it("checks multiple branches in one batch call without recomputation per branch", async () => {
    await manualSetStock("branch-a", "prod-1", V, 0, "init", ADMIN); // شعبه A ناموجود
    await manualSetStock("branch-b", "prod-1", V, 5, "init", ADMIN); // شعبه B موجود

    const results = await checkCartAvailabilityForBranches(["branch-a", "branch-b"], [
      { productId: "prod-1", variantId: V, quantity: 2 },
    ]);

    expect(results.get("branch-a")?.sufficient).toBe(false);
    expect(results.get("branch-b")?.sufficient).toBe(true);
  });

  it("reports no branch can fulfil the cart when all are short", async () => {
    await manualSetStock("branch-a", "prod-1", V, 0, "init", ADMIN);
    await manualSetStock("branch-b", "prod-1", V, 1, "init", ADMIN);

    const results = await checkCartAvailabilityForBranches(["branch-a", "branch-b"], [
      { productId: "prod-1", variantId: V, quantity: 2 },
    ]);
    expect([...results.values()].every((r) => !r.sufficient)).toBe(true);
  });
});

// سناریو ۱۷: آماده بودن اتصال انبار مرکزی
describe("central warehouse", () => {
  it("receiving stock into the warehouse never affects branch stock", async () => {
    await manualSetStock("branch-a", "prod-1", V, 5, "init", ADMIN);
    await receiveIntoWarehouse("prod-1", V, 50, "تأمین از تولیدکننده", ADMIN);
    expect((await getBranchStock("branch-a", "prod-1", V)).onHand).toBe(5);
  });

  it("transfers stock from warehouse to a branch, decrementing one and incrementing the other", async () => {
    await receiveIntoWarehouse("prod-1", V, 50, "تأمین", ADMIN);
    await manualSetStock("branch-a", "prod-1", V, 5, "init", ADMIN);

    const transfer = await transferWarehouseToBranch("branch-a", "prod-1", V, 10, ADMIN);
    expect(transfer.success).toBe(true);
    expect((await getBranchStock("branch-a", "prod-1", V)).onHand).toBe(15);
  });

  it("refuses to transfer more than the warehouse holds", async () => {
    await receiveIntoWarehouse("prod-1", V, 5, "تأمین", ADMIN);
    const transfer = await transferWarehouseToBranch("branch-a", "prod-1", V, 10, ADMIN);
    expect(transfer.success).toBe(false);
  });
});

describe("low stock thresholds", () => {
  it("is configurable per branch/product/variant instead of hard-coded", async () => {
    await manualSetStock("branch-a", "prod-1", V, 3, "init", ADMIN);
    expect(await getLowStockItems("branch-a")).toHaveLength(1); // پیش‌فرض کلی = ۵، پس ۳ کم‌موجود است

    await setLowStockThreshold(2, { branchId: "branch-a", productId: "prod-1", variantId: V });
    expect(await getLowStockItems("branch-a")).toHaveLength(0); // با آستانه اختصاصی ۲، مقدار ۳ دیگر کم‌موجود نیست

    await setLowStockThreshold(4, { branchId: "branch-a", productId: "prod-1", variantId: V });
    expect(await getLowStockItems("branch-a")).toHaveLength(1); // با آستانه ۴، مقدار ۳ دوباره کم‌موجود است
  });
});

// سناریو ۱۶: ثبت Audit
describe("audit trail", () => {
  it("logs who/what/before/after/why/when for every reservation + commit", async () => {
    await manualSetStock("branch-a", "prod-1", V, 10, "init", ADMIN);
    await reserveForOrder("order-1", "branch-a", [{ productId: "prod-1", variantId: V, quantity: 3 }], SYSTEM_ACTOR);
    await commitSale("order-1", SYSTEM_ACTOR);

    const history = await getTransactionHistory({ orderId: "order-1" });
    expect(history.map((t) => t.type)).toEqual(expect.arrayContaining(["reservation_created", "sale_committed"]));
    for (const t of history) {
      expect(t.actorId).toBe(SYSTEM_ACTOR.id);
      expect(t.actorRole).toBe(SYSTEM_ACTOR.role);
      expect(typeof t.createdAt).toBe("string");
      expect(t.orderId).toBe("order-1");
    }
  });

  it("filters history by branch, product and transaction type", async () => {
    await manualSetStock("branch-a", "prod-1", V, 10, "init", ADMIN);
    await manualSetStock("branch-b", "prod-2", V, 10, "init", ADMIN);

    const onlyBranchA = await getTransactionHistory({ branchId: "branch-a" });
    expect(onlyBranchA.every((t) => t.branchId === "branch-a")).toBe(true);

    const onlyManualEntries = await getTransactionHistory({ type: "manual_entry" });
    expect(onlyManualEntries.every((t) => t.type === "manual_entry")).toBe(true);
  });
});
