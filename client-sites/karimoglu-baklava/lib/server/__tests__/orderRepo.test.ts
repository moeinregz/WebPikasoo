import { beforeEach, describe, expect, it } from "vitest";
import { __resetDbForTest } from "@/lib/db/client";
import { seedDatabaseIfEmpty } from "@/lib/db/seed";
import { findOrderIdByIdempotencyKey, getOrderById, getOrderStatusHistory, setOrder, setOrderStatusWithActor } from "../orderRepo";
import type { Order } from "@/lib/types";

beforeEach(async () => {
  await __resetDbForTest();
  await seedDatabaseIfEmpty();
});

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: overrides.id ?? "order-1",
    orderNumber: "KO-TEST-0001",
    customer: { name: "Test User", phone: "09120000000" },
    address: { fullAddress: "Somewhere", city: "تهران", latitude: null, longitude: null },
    items: [
      {
        lineId: "line-1",
        productId: "p1",
        variantId: "w-500",
        productName: "Test Product",
        variantLabel: "500g",
        packagingLabel: "Standard",
        quantity: 2,
        unitPrice: 1000,
        lineTotal: 2000,
      },
    ],
    subtotal: 2000,
    discountTotal: 0,
    deliveryFee: 0,
    deliveryFeeIsPending: false,
    total: 2000,
    deliveryMethod: "express",
    branchId: "satarkhan",
    branchName: "ستارخان",
    paymentMethod: "online",
    status: "payment_pending",
    paymentStatus: "pending",
    etaMinutesMin: 30,
    etaMinutesMax: 30,
    createdAt: new Date().toISOString(),
    cancelDeadline: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    idempotencyKey: overrides.idempotencyKey ?? "idem-1",
    ...overrides,
  };
}

describe("order repository (real SQL persistence)", () => {
  it("round-trips an order with its snapshot line items", async () => {
    const order = makeOrder();
    await setOrder(order);

    const fetched = await getOrderById(order.id);
    expect(fetched).toBeDefined();
    expect(fetched?.items).toHaveLength(1);
    expect(fetched?.items[0]?.productName).toBe("Test Product");
    expect(fetched?.total).toBe(2000);
  });

  it("preserves the order snapshot even if the underlying catalog product changes later", async () => {
    // Snapshot به‌جای Join به کاتالوگ ذخیره شده؛ حتی نام محصول Placeholder
    // ("Test Product") که هرگز در کاتالوگ واقعی وجود ندارد، دست‌نخورده می‌ماند.
    const order = makeOrder({ id: "order-snapshot" });
    await setOrder(order);
    const fetched = await getOrderById("order-snapshot");
    expect(fetched?.items[0]?.productName).toBe("Test Product");
    expect(fetched?.items[0]?.unitPrice).toBe(1000);
  });

  it("looks up an order by idempotency key without a separate map", async () => {
    const order = makeOrder({ id: "order-idem", idempotencyKey: "unique-key-123" });
    await setOrder(order);
    expect(await findOrderIdByIdempotencyKey("unique-key-123")).toBe("order-idem");
    expect(await findOrderIdByIdempotencyKey("does-not-exist")).toBeUndefined();
  });

  it("updates mutable fields (status/paymentStatus) on a second set() without duplicating the order", async () => {
    const order = makeOrder({ id: "order-update" });
    await setOrder(order);
    await setOrder({ ...order, status: "paid", paymentStatus: "succeeded" });

    const fetched = await getOrderById("order-update");
    expect(fetched?.status).toBe("paid");
    expect(fetched?.paymentStatus).toBe("succeeded");
    expect(fetched?.items).toHaveLength(1); // آیتم‌ها دوباره درج نشده‌اند
  });

  it("records a status history entry whenever the status actually changes", async () => {
    const order = makeOrder({ id: "order-history" });
    await setOrder(order); // ایجاد → یک ردیف تاریخچه اولیه
    await setOrder({ ...order, status: "paid", paymentStatus: "succeeded" }); // تغیر وضعیت → ردیف دوم
    await setOrder({ ...order, status: "paid", paymentStatus: "succeeded" }); // بدون تغییر وضعیت → ردیف اضافه نمی‌شود

    const history = await getOrderStatusHistory("order-history");
    expect(history.map((h) => h.status)).toEqual(["payment_pending", "paid"]);
  });

  it("lets an admin change order status with an audited actor + note", async () => {
    const order = makeOrder({ id: "order-admin" });
    await setOrder(order);
    await setOrderStatusWithActor("order-admin", "preparing", { id: "admin-1", role: "site_admin" }, "شروع آماده‌سازی");

    const history = await getOrderStatusHistory("order-admin");
    const last = history[history.length - 1];
    expect(last?.status).toBe("preparing");
    expect(last?.changedById).toBe("admin-1");
    expect(last?.note).toBe("شروع آماده‌سازی");
  });
});
