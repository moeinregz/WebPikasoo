import { randomUUID } from "crypto";
import { db, withTransaction } from "@/lib/db/client";
import type { Order, OrderItem, OrderStatusHistoryEntry } from "@/lib/types";

/**
 * ===== لایه دسترسی به سفارش (Order Repository) — Prompt 10 =====
 *
 * جایگزین `Map<string, Order>` قبلی در `lib/server/db.ts`. سفارش‌ها حالا در
 * جدول‌های رابطه‌ای واقعی (`orders` + `order_items` + `order_status_history`)
 * ذخیره می‌شوند، دقیقاً طبق طراحی `lib/db/schema.sql`.
 *
 * طبق الزام صریح «Order باید Snapshot نگه دارد»: `order_items` هرگز به
 * محصولات واقعی Join نمی‌خورد — تمام مقادیر نمایشی (نام، برچسب Variant،
 * برچسب بسته‌بندی، قیمت واحد) در همان لحظه سفارش کپی شده‌اند.
 */

interface OrderRow {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  address_full: string;
  address_city: string;
  address_lat: number | null;
  address_lng: number | null;
  subtotal: number;
  discount_total: number;
  delivery_fee: number;
  delivery_fee_is_pending: number;
  total: number;
  delivery_method: string;
  branch_id: string;
  branch_name: string;
  payment_method: string;
  status: string;
  payment_status: string;
  eta_minutes_min: number | null;
  eta_minutes_max: number | null;
  created_at: string;
  cancel_deadline: string;
  idempotency_key: string;
}

interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  variant_label: string;
  packaging_label: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

function rowToOrderItem(row: OrderItemRow): OrderItem {
  return {
    lineId: row.id,
    productId: row.product_id,
    variantId: row.variant_id,
    productName: row.product_name,
    variantLabel: row.variant_label,
    packagingLabel: row.packaging_label,
    quantity: row.quantity,
    unitPrice: row.unit_price,
    lineTotal: row.line_total,
  };
}

function rowToOrder(row: OrderRow, items: OrderItem[]): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customer: { name: row.customer_name, phone: row.customer_phone },
    address: {
      fullAddress: row.address_full,
      city: row.address_city as Order["address"]["city"],
      latitude: row.address_lat,
      longitude: row.address_lng,
    },
    items,
    subtotal: row.subtotal,
    discountTotal: row.discount_total,
    deliveryFee: row.delivery_fee,
    deliveryFeeIsPending: !!row.delivery_fee_is_pending,
    total: row.total,
    deliveryMethod: row.delivery_method as Order["deliveryMethod"],
    branchId: row.branch_id,
    branchName: row.branch_name,
    paymentMethod: row.payment_method as Order["paymentMethod"],
    status: row.status as Order["status"],
    paymentStatus: row.payment_status as Order["paymentStatus"],
    etaMinutesMin: row.eta_minutes_min ?? 0,
    etaMinutesMax: row.eta_minutes_max ?? 0,
    createdAt: row.created_at,
    cancelDeadline: row.cancel_deadline,
    idempotencyKey: row.idempotency_key,
  };
}

async function insertOrderFull(order: Order): Promise<void> {
  await withTransaction(async () => {
    await db.prepare(
      `INSERT INTO orders
        (id, order_number, user_id, customer_name, customer_phone, address_full, address_city, address_lat, address_lng, subtotal,
         discount_total, delivery_fee, delivery_fee_is_pending, total, delivery_method, branch_id, branch_name,
         payment_method, status, payment_status, eta_minutes_min, eta_minutes_max, created_at, cancel_deadline,
         idempotency_key)
       VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      order.id,
      order.orderNumber,
      order.customer.name,
      order.customer.phone,
      order.address.fullAddress,
      order.address.city,
      order.address.latitude ?? null,
      order.address.longitude ?? null,
      order.subtotal,
      order.discountTotal,
      order.deliveryFee,
      order.deliveryFeeIsPending ? 1 : 0,
      order.total,
      order.deliveryMethod,
      order.branchId,
      order.branchName,
      order.paymentMethod,
      order.status,
      order.paymentStatus,
      order.etaMinutesMin,
      order.etaMinutesMax,
      order.createdAt,
      order.cancelDeadline,
      order.idempotencyKey,
    );

    const insertItem = db.prepare(
      `INSERT INTO order_items
        (id, order_id, product_id, variant_id, product_name, variant_label, packaging_label, quantity, unit_price, line_total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const item of order.items) {
      // ⚠️ اصلاح باگ واقعی این مرحله (کشف‌شده با اجرای واقعی تست، نه تئوری):
      // `item.lineId` در سبد خرید به‌صورت قطعی از روی
      // `productId__variantId__packagingId` ساخته می‌شود (`lib/cart/CartContext.tsx`)
      // — یعنی برای هر دو سفارش متفاوت که همان ترکیب محصول/Variant/بسته‌بندی را
      // دارند (بسیار محتمل برای محصولات پرفروش)، `lineId` یکسان تولید می‌شود.
      // چون `order_items.id` یک PRIMARY KEY سراسری است (نه ترکیبی با order_id)،
      // ذخیره مستقیم `item.lineId` باعث می‌شد دومین سفارشی که همان ترکیب را
      // دارد با خطای `UNIQUE constraint failed` کامل شکست بخورد — یک باگ
      // Critical که مستقیماً مانع تکمیل سفارش واقعی مشتری می‌شد. اینجا یک
      // شناسه تازه و سراسراً یکتا ساخته می‌شود؛ `item.lineId` اصلی هنوز به‌طور
      // کامل در `product_id`/`variant_id` (زیر) حفظ است و چیزی از Snapshot
      // سفارش گم نمی‌شود.
      await insertItem.run(
        randomUUID(),
        order.id,
        item.productId,
        item.variantId,
        item.productName,
        item.variantLabel,
        item.packagingLabel,
        item.quantity,
        item.unitPrice,
        item.lineTotal,
      );
    }

    await appendStatusHistory(order.id, order.status, null, null, "سفارش ایجاد شد");
  });
}

async function updateOrderMutableFields(order: Order): Promise<void> {
  const previous = await getOrderById(order.id);
  await db.prepare(
    `UPDATE orders SET status = ?, payment_status = ?, delivery_fee = ?, delivery_fee_is_pending = ?,
       eta_minutes_min = ?, eta_minutes_max = ? WHERE id = ?`,
  ).run(
    order.status,
    order.paymentStatus,
    order.deliveryFee,
    order.deliveryFeeIsPending ? 1 : 0,
    order.etaMinutesMin,
    order.etaMinutesMax,
    order.id,
  );

  if (previous && previous.status !== order.status) {
    await appendStatusHistory(order.id, order.status, null, null, null);
  }
}

/** معادل `Map.set` قبلی — اگر سفارش وجود ندارد کامل درج می‌شود، وگرنه فیلدهای قابل‌تغییرش به‌روزرسانی می‌شود */
export async function setOrder(order: Order): Promise<void> {
  const exists = await db.prepare("SELECT 1 FROM orders WHERE id = ?").get(order.id);
  if (!exists) {
    await insertOrderFull(order);
  } else {
    await updateOrderMutableFields(order);
  }
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const row = await db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as OrderRow | undefined;
  if (!row) return undefined;
  const itemRows = await db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(id) as OrderItemRow[];
  return rowToOrder(row, itemRows.map(rowToOrderItem));
}

export async function findOrderIdByIdempotencyKey(key: string): Promise<string | undefined> {
  const row = await db.prepare("SELECT id FROM orders WHERE idempotency_key = ?").get(key) as { id: string } | undefined;
  return row?.id;
}

async function appendStatusHistory(
  orderId: string,
  status: string,
  changedById: string | null,
  changedByRole: string | null,
  note: string | null,
): Promise<void> {
  await db.prepare(
    "INSERT INTO order_status_history (id, order_id, status, changed_by_id, changed_by_role, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
  ).run(randomUUID(), orderId, status, changedById, changedByRole, note, new Date().toISOString());
}

/** برای پنل مدیریت: مدیر می‌تواند وضعیت سفارش را با ثبت Audit در همین تاریخچه تغییر دهد */
export async function setOrderStatusWithActor(
  orderId: string,
  status: Order["status"],
  actor: { id: string; role: string },
  note?: string,
): Promise<void> {
  const order = await getOrderById(orderId);
  if (!order) return;
  await db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, orderId);
  await appendStatusHistory(orderId, status, actor.id, actor.role, note ?? null);
}

interface StatusHistoryRow {
  id: string;
  order_id: string;
  status: string;
  changed_by_id: string | null;
  changed_by_role: string | null;
  note: string | null;
  created_at: string;
}

export async function getOrderStatusHistory(orderId: string): Promise<OrderStatusHistoryEntry[]> {
  const rows = await db
    .prepare("SELECT * FROM order_status_history WHERE order_id = ? ORDER BY created_at ASC")
    .all(orderId) as StatusHistoryRow[];
  return rows.map((r) => ({
    id: r.id,
    orderId: r.order_id,
    status: r.status as Order["status"],
    changedById: r.changed_by_id,
    changedByRole: r.changed_by_role,
    note: r.note,
    createdAt: r.created_at,
  }));
}
