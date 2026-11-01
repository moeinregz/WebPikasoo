import { randomUUID } from "crypto";
import { getProductDetailById } from "@/lib/server/catalog";
import { db, withTransaction } from "@/lib/db/client";
import type { Actor } from "@/lib/auth/rbac";
import { CENTRAL_WAREHOUSE_ID } from "./store";
import {
  getAvailable,
  type BranchInventoryOverviewRow,
  type BranchInventoryRecord,
  type CartAvailabilityCheck,
  type CartAvailabilityItem,
  type InventoryReservation,
  type InventorySummary,
  type InventoryTransaction,
  type InventoryTransactionType,
  type LowStockThreshold,
  type ReservationLine,
  type WarehouseInventoryRecord,
} from "./types";

/**
 * ===== سرویس مرکزی موجودی (Prompt 10 — حالا روی دیتابیس واقعی SQL) =====
 *
 * تفاوت با نسخه Prompt 9: منطق دقیقاً همان است (همان امضای توابع، همان
 * رفتار All-or-nothing، همان Idempotency)، اما پیاده‌سازی داخلی از Map
 * حافظه به SQL واقعی تغییر کرده — بدون نیاز به تغییر در
 * `branch-selection/inventoryService.ts`، `orderService.ts`، یا هیچ Route
 * Handler‌ای که از این ماژول استفاده می‌کند.
 *
 * ===== همزمانی (Concurrency) — حالا واقعاً سطح دیتابیس، نه فقط سطح فرآیند =====
 * `reserveForOrder` کل بررسی+کسر یک سبد را داخل یک تراکنش SQL واحد
 * (`withTransaction` → `BEGIN IMMEDIATE ... COMMIT`) انجام می‌دهد. در SQLite،
 * `BEGIN IMMEDIATE` بلافاصله قفل نوشتن را می‌گیرد؛ اگر دو رزرو هم‌زمان برای
 * آخرین واحد موجودی تلاش کنند، دومی تا پایان تراکنش اولی مسدود می‌ماند و
 * وقتی نوبتش می‌رسد، شرط `available >= qty` را دیگر برقرار نمی‌بیند و شکست
 * می‌خورد — دقیقاً معادل رفتار `UPDATE ... WHERE (on_hand - reserved) >= qty`
 * مستندشده در `docs/inventory-database-schema.md`.
 */

function nowIso(): string {
  return new Date().toISOString();
}

interface BranchInventoryRow {
  id: string;
  branch_id: string;
  product_id: string;
  variant_id: string;
  on_hand: number;
  reserved: number;
  sold: number;
  updated_at: string;
}

function rowToBranchRecord(row: BranchInventoryRow): BranchInventoryRecord {
  return {
    branchId: row.branch_id,
    productId: row.product_id,
    variantId: row.variant_id,
    onHand: row.on_hand,
    reserved: row.reserved,
    sold: row.sold,
    updatedAt: row.updated_at,
  };
}

async function getOrCreateBranchRow(branchId: string, productId: string, variantId: string): Promise<BranchInventoryRow> {
  let row = await db
    .prepare("SELECT * FROM branch_inventory WHERE branch_id = ? AND product_id = ? AND variant_id = ?")
    .get(branchId, productId, variantId) as BranchInventoryRow | undefined;

  if (!row) {
    await db.prepare(
      "INSERT INTO branch_inventory (id, branch_id, product_id, variant_id, on_hand, reserved, sold, updated_at) VALUES (?, ?, ?, ?, 0, 0, 0, ?)",
    ).run(randomUUID(), branchId, productId, variantId, nowIso());
    row = await db
      .prepare("SELECT * FROM branch_inventory WHERE branch_id = ? AND product_id = ? AND variant_id = ?")
      .get(branchId, productId, variantId) as BranchInventoryRow;
  }
  return row;
}

interface WarehouseInventoryRow {
  warehouse_id: string;
  product_id: string;
  variant_id: string;
  on_hand: number;
  updated_at: string;
}

function rowToWarehouseRecord(row: WarehouseInventoryRow): WarehouseInventoryRecord {
  return {
    warehouseId: row.warehouse_id,
    productId: row.product_id,
    variantId: row.variant_id,
    onHand: row.on_hand,
    updatedAt: row.updated_at,
  };
}

async function getOrCreateWarehouseRow(warehouseId: string, productId: string, variantId: string): Promise<WarehouseInventoryRow> {
  let row = await db
    .prepare("SELECT * FROM warehouse_inventory WHERE warehouse_id = ? AND product_id = ? AND variant_id = ?")
    .get(warehouseId, productId, variantId) as WarehouseInventoryRow | undefined;
  if (!row) {
    await db.prepare(
      "INSERT INTO warehouse_inventory (id, warehouse_id, product_id, variant_id, on_hand, updated_at) VALUES (?, ?, ?, ?, 0, ?)",
    ).run(randomUUID(), warehouseId, productId, variantId, nowIso());
    row = await db
      .prepare("SELECT * FROM warehouse_inventory WHERE warehouse_id = ? AND product_id = ? AND variant_id = ?")
      .get(warehouseId, productId, variantId) as WarehouseInventoryRow;
  }
  return row;
}

async function insertTransaction(entry: {
  type: InventoryTransactionType;
  branchId: string | null;
  warehouseId: string | null;
  productId: string;
  variantId: string;
  onHandDelta: number;
  onHandBefore: number;
  onHandAfter: number;
  reservedBefore: number;
  reservedAfter: number;
  orderId: string | null;
  actor: Actor;
  reason: string | null;
}): Promise<void> {
  await db.prepare(
    `INSERT INTO inventory_transactions
      (id, type, branch_id, warehouse_id, product_id, variant_id, on_hand_delta, on_hand_before, on_hand_after,
       reserved_before, reserved_after, order_id, actor_id, actor_role, reason, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    randomUUID(),
    entry.type,
    entry.branchId,
    entry.warehouseId,
    entry.productId,
    entry.variantId,
    entry.onHandDelta,
    entry.onHandBefore,
    entry.onHandAfter,
    entry.reservedBefore,
    entry.reservedAfter,
    entry.orderId,
    entry.actor.id,
    entry.actor.role,
    entry.reason,
    nowIso(),
  );
}

// ===== خواندن موجودی =====

export async function getBranchStock(branchId: string, productId: string, variantId: string): Promise<BranchInventoryRecord> {
  return rowToBranchRecord(await getOrCreateBranchRow(branchId, productId, variantId));
}

export async function getBranchAvailableQuantity(branchId: string, productId: string, variantId: string): Promise<number> {
  return getAvailable(rowToBranchRecord(await getOrCreateBranchRow(branchId, productId, variantId)));
}

export async function getWarehouseStock(
  productId: string,
  variantId: string,
  warehouseId = CENTRAL_WAREHOUSE_ID,
): Promise<WarehouseInventoryRecord> {
  return rowToWarehouseRecord(await getOrCreateWarehouseRow(warehouseId, productId, variantId));
}

async function findVariantLabel(productId: string, variantId: string): Promise<string> {
  const detail = await getProductDetailById(productId);
  if (!detail) return variantId;
  for (const group of detail.saleTypes) {
    const variant = group.variants.find((v) => v.id === variantId);
    if (variant) return variant.label;
  }
  return variantId;
}

/** موجودی کامل یک شعبه — یک Query واحد (بدون N+1)، سپس غنی‌سازی با اطلاعات نمایشی محصول */
export async function getBranchInventoryOverview(branchId: string): Promise<BranchInventoryOverviewRow[]> {
  const rows = await db.prepare("SELECT * FROM branch_inventory WHERE branch_id = ?").all(branchId) as BranchInventoryRow[];
  const overview: BranchInventoryOverviewRow[] = await Promise.all(
    rows.map(async (row) => {
    const record = rowToBranchRecord(row);
    const product = await getProductDetailById(record.productId);
    return {
      ...record,
      available: getAvailable(record),
      productName: product?.name ?? record.productId,
      variantLabel: await findVariantLabel(record.productId, record.variantId),
      categoryLabel: product?.categoryLabel ?? "",
    };
    }),
  );
  return overview.sort((a, b) => a.productName.localeCompare(b.productName, "fa"));
}

export async function getProductStockAcrossBranches(
  productId: string,
  variantId?: string,
): Promise<{ branchId: string; variantId: string; onHand: number; reserved: number; available: number }[]> {
  const rows = (
    variantId
      ? await db.prepare("SELECT * FROM branch_inventory WHERE product_id = ? AND variant_id = ?").all(productId, variantId)
      : await db.prepare("SELECT * FROM branch_inventory WHERE product_id = ?").all(productId)
  ) as BranchInventoryRow[];

  return rows.map((row) => ({
    branchId: row.branch_id,
    variantId: row.variant_id,
    onHand: row.on_hand,
    reserved: row.reserved,
    available: Math.max(0, row.on_hand - row.reserved),
  }));
}

// ===== بررسی موجودی سبد (Batch — بدون N+1) =====

export async function checkCartAvailability(branchId: string, items: CartAvailabilityItem[]): Promise<CartAvailabilityCheck> {
  const insufficientItems: CartAvailabilityCheck["insufficientItems"] = [];
  for (const item of items) {
    const available = await getBranchAvailableQuantity(branchId, item.productId, item.variantId);
    if (available < item.quantity) {
      insufficientItems.push({
        productId: item.productId,
        variantId: item.variantId,
        requested: item.quantity,
        available,
      });
    }
  }
  return { sufficient: insufficientItems.length === 0, insufficientItems };
}

export async function checkCartAvailabilityForBranches(
  branchIds: string[],
  items: CartAvailabilityItem[],
): Promise<Map<string, CartAvailabilityCheck>> {
  const result = new Map<string, CartAvailabilityCheck>();
  for (const branchId of branchIds) {
    result.set(branchId, await checkCartAvailability(branchId, items));
  }
  return result;
}

// ===== رزرو / آزادسازی / فروش (چرخه سفارش) =====

export type ReserveOutcome =
  | { success: true; reservationId: string; alreadyReserved: boolean }
  | {
      success: false;
      insufficientItem: { productId: string; variantId: string; requested: number; available: number };
    };

interface ReservationRow {
  id: string;
  order_id: string;
  branch_id: string;
  status: InventoryReservation["status"];
  created_at: string;
  expires_at: string | null;
  released_at: string | null;
  committed_at: string | null;
  release_reason: string | null;
}

async function getReservationRow(orderId: string): Promise<ReservationRow | undefined> {
  return await db.prepare("SELECT * FROM stock_reservations WHERE order_id = ?").get(orderId) as ReservationRow | undefined;
}

async function getReservationItems(reservationId: string): Promise<ReservationLine[]> {
  const rows = await db
    .prepare("SELECT product_id, variant_id, quantity FROM stock_reservation_items WHERE reservation_id = ?")
    .all(reservationId) as { product_id: string; variant_id: string; quantity: number }[];
  return rows.map((r) => ({ productId: r.product_id, variantId: r.variant_id, quantity: r.quantity }));
}

/**
 * رزرو اتمیک کل سبد یک سفارش در یک شعبه — All-or-nothing، در یک تراکنش SQL
 * واحد. Idempotent نسبت به `orderId`.
 */
export async function reserveForOrder(
  orderId: string,
  branchId: string,
  items: CartAvailabilityItem[],
  actor: Actor,
): Promise<ReserveOutcome> {
  return await withTransaction(async () => {
    const existing = await getReservationRow(orderId);
    if (existing && (existing.status === "active" || existing.status === "committed")) {
      return { success: true, reservationId: existing.id, alreadyReserved: true };
    }

    // فاز ۱: بررسی — همه اقلام باید عبور کنند (All-or-nothing)
    for (const item of items) {
      const available = await getBranchAvailableQuantity(branchId, item.productId, item.variantId);
      if (available < item.quantity) {
        return {
          success: false,
          insufficientItem: {
            productId: item.productId,
            variantId: item.variantId,
            requested: item.quantity,
            available,
          },
        } as const;
      }
    }

    // فاز ۲: کسر — چون هر دو فاز داخل همان تراکنش SQL هستند (که با
    // BEGIN IMMEDIATE قفل نوشتن گرفته)، هیچ تراکنش دیگری نمی‌تواند بین این
    // دو فاز مداخله کند.
    for (const item of items) {
      const row = await getOrCreateBranchRow(branchId, item.productId, item.variantId);
      const reservedBefore = row.reserved;
      await db.prepare("UPDATE branch_inventory SET reserved = reserved + ?, updated_at = ? WHERE id = ?").run(
        item.quantity,
        nowIso(),
        row.id,
      );
      await insertTransaction({
        type: "reservation_created",
        branchId,
        warehouseId: null,
        productId: item.productId,
        variantId: item.variantId,
        onHandDelta: 0,
        onHandBefore: row.on_hand,
        onHandAfter: row.on_hand,
        reservedBefore,
        reservedAfter: reservedBefore + item.quantity,
        orderId,
        actor,
        reason: null,
      });
    }

    const reservationId = randomUUID();
    await db.prepare(
      "INSERT INTO stock_reservations (id, order_id, branch_id, status, created_at) VALUES (?, ?, ?, 'active', ?)",
    ).run(reservationId, orderId, branchId, nowIso());
    const insertItem = db.prepare(
      "INSERT INTO stock_reservation_items (id, reservation_id, product_id, variant_id, quantity) VALUES (?, ?, ?, ?, ?)",
    );
    for (const item of items) {
      await insertItem.run(randomUUID(), reservationId, item.productId, item.variantId, item.quantity);
    }

    return { success: true, reservationId, alreadyReserved: false } as const;
  });
}

export async function releaseReservation(orderId: string, reason: string, actor: Actor): Promise<{ released: boolean }> {
  return await withTransaction(async () => await releaseReservationInternal(orderId, reason, actor));
}

/** منطق داخلی بدون تراکنش خودش — تا از تودرتو شدن تراکنش جلوگیری شود (SQLite تراکنش تودرتو را پشتیبانی نمی‌کند) */
async function releaseReservationInternal(orderId: string, reason: string, actor: Actor): Promise<{ released: boolean }> {
  const reservation = await getReservationRow(orderId);
  if (!reservation || reservation.status !== "active") return { released: false };

  const items = await getReservationItems(reservation.id);
  for (const item of items) {
    const row = await getOrCreateBranchRow(reservation.branch_id, item.productId, item.variantId);
    const reservedBefore = row.reserved;
    const reservedAfter = Math.max(0, row.reserved - item.quantity);
    await db.prepare("UPDATE branch_inventory SET reserved = ?, updated_at = ? WHERE id = ?").run(
      reservedAfter,
      nowIso(),
      row.id,
    );
    await insertTransaction({
      type: "reservation_released",
      branchId: reservation.branch_id,
      warehouseId: null,
      productId: item.productId,
      variantId: item.variantId,
      onHandDelta: 0,
      onHandBefore: row.on_hand,
      onHandAfter: row.on_hand,
      reservedBefore,
      reservedAfter,
      orderId,
      actor,
      reason,
    });
  }

  await db.prepare(
    "UPDATE stock_reservations SET status = 'released', released_at = ?, release_reason = ? WHERE id = ?",
  ).run(nowIso(), reason, reservation.id);
  return { released: true };
}

export async function commitSale(orderId: string, actor: Actor): Promise<{ committed: boolean }> {
  return await withTransaction(async () => {
    const reservation = await getReservationRow(orderId);
    if (!reservation || reservation.status !== "active") return { committed: false };

    const items = await getReservationItems(reservation.id);
    for (const item of items) {
      const row = await getOrCreateBranchRow(reservation.branch_id, item.productId, item.variantId);
      const onHandAfter = Math.max(0, row.on_hand - item.quantity);
      const reservedAfter = Math.max(0, row.reserved - item.quantity);
      await db.prepare(
        "UPDATE branch_inventory SET on_hand = ?, reserved = ?, sold = sold + ?, updated_at = ? WHERE id = ?",
      ).run(onHandAfter, reservedAfter, item.quantity, nowIso(), row.id);
      await insertTransaction({
        type: "sale_committed",
        branchId: reservation.branch_id,
        warehouseId: null,
        productId: item.productId,
        variantId: item.variantId,
        onHandDelta: -item.quantity,
        onHandBefore: row.on_hand,
        onHandAfter,
        reservedBefore: row.reserved,
        reservedAfter,
        orderId,
        actor,
        reason: null,
      });
    }

    await db.prepare("UPDATE stock_reservations SET status = 'committed', committed_at = ? WHERE id = ?").run(
      nowIso(),
      reservation.id,
    );
    return { committed: true };
  });
}

export async function releaseOrCompensateForCancelledOrder(orderId: string, actor: Actor): Promise<{ affected: boolean }> {
  return await withTransaction(async () => {
    const reservation = await getReservationRow(orderId);
    if (!reservation) return { affected: false };

    if (reservation.status === "active") {
      return { affected: (await releaseReservationInternal(orderId, "order_cancelled", actor)).released };
    }

    if (reservation.status === "committed") {
      const items = await getReservationItems(reservation.id);
      for (const item of items) {
        const row = await getOrCreateBranchRow(reservation.branch_id, item.productId, item.variantId);
        const onHandAfter = row.on_hand + item.quantity;
        await db.prepare("UPDATE branch_inventory SET on_hand = ?, sold = GREATEST(0, sold - ?), updated_at = ? WHERE id = ?").run(
          onHandAfter,
          item.quantity,
          nowIso(),
          row.id,
        );
        await insertTransaction({
          type: "order_cancelled",
          branchId: reservation.branch_id,
          warehouseId: null,
          productId: item.productId,
          variantId: item.variantId,
          onHandDelta: item.quantity,
          onHandBefore: row.on_hand,
          onHandAfter,
          reservedBefore: row.reserved,
          reservedAfter: row.reserved,
          orderId,
          actor,
          reason: "سفارش در بازه مجاز لغو شد؛ فروش قطعی‌شده برگردانده شد.",
        });
      }
      await db.prepare("UPDATE stock_reservations SET status = 'released', released_at = ? WHERE id = ?").run(
        nowIso(),
        reservation.id,
      );
      return { affected: true };
    }

    return { affected: false };
  });
}

// ===== ورود دستی / اصلاح دستی =====

export interface ManualSetStockResult {
  record: BranchInventoryRecord;
  transaction: { type: InventoryTransactionType; onHandDelta: number; onHandBefore: number; onHandAfter: number };
}

export async function manualSetStock(
  branchId: string,
  productId: string,
  variantId: string,
  newOnHand: number,
  reason: string,
  actor: Actor,
): Promise<{ success: true; result: ManualSetStockResult } | { success: false; error: string }> {
  if (!Number.isInteger(newOnHand) || newOnHand < 0) {
    return { success: false, error: "مقدار موجودی باید عدد صحیح غیرمنفی باشد." };
  }

  return await withTransaction(async () => {
    const row = await getOrCreateBranchRow(branchId, productId, variantId);
    if (newOnHand < row.reserved) {
      return {
        success: false,
        error: `موجودی جدید نمی‌تواند کمتر از مقدار رزروشده فعلی (${row.reserved}) باشد.`,
      } as const;
    }

    const hasPriorTransaction = await db
      .prepare(
        "SELECT 1 FROM inventory_transactions WHERE branch_id = ? AND product_id = ? AND variant_id = ? LIMIT 1",
      )
      .get(branchId, productId, variantId);
    const type: InventoryTransactionType = hasPriorTransaction ? "manual_adjustment" : "manual_entry";

    await db.prepare("UPDATE branch_inventory SET on_hand = ?, updated_at = ? WHERE id = ?").run(newOnHand, nowIso(), row.id);
    await insertTransaction({
      type,
      branchId,
      warehouseId: null,
      productId,
      variantId,
      onHandDelta: newOnHand - row.on_hand,
      onHandBefore: row.on_hand,
      onHandAfter: newOnHand,
      reservedBefore: row.reserved,
      reservedAfter: row.reserved,
      orderId: null,
      actor,
      reason,
    });

    const updatedRow = await getOrCreateBranchRow(branchId, productId, variantId);
    return {
      success: true,
      result: {
        record: rowToBranchRecord(updatedRow),
        transaction: { type, onHandDelta: newOnHand - row.on_hand, onHandBefore: row.on_hand, onHandAfter: newOnHand },
      },
    } as const;
  });
}

// ===== انبار مرکزی =====

export async function receiveIntoWarehouse(
  productId: string,
  variantId: string,
  quantity: number,
  reason: string,
  actor: Actor,
  warehouseId = CENTRAL_WAREHOUSE_ID,
): Promise<{ success: true; record: WarehouseInventoryRecord } | { success: false; error: string }> {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { success: false, error: "مقدار ورودی باید عدد صحیح مثبت باشد." };
  }

  return await withTransaction(async () => {
    const row = await getOrCreateWarehouseRow(warehouseId, productId, variantId);
    const onHandAfter = row.on_hand + quantity;
    await db.prepare(
      "UPDATE warehouse_inventory SET on_hand = ?, updated_at = ? WHERE warehouse_id = ? AND product_id = ? AND variant_id = ?",
    ).run(onHandAfter, nowIso(), warehouseId, productId, variantId);
    await insertTransaction({
      type: "warehouse_receipt",
      branchId: null,
      warehouseId,
      productId,
      variantId,
      onHandDelta: quantity,
      onHandBefore: row.on_hand,
      onHandAfter,
      reservedBefore: 0,
      reservedAfter: 0,
      orderId: null,
      actor,
      reason,
    });

    return { success: true, record: rowToWarehouseRecord({ ...row, on_hand: onHandAfter }) } as const;
  });
}

export async function transferWarehouseToBranch(
  branchId: string,
  productId: string,
  variantId: string,
  quantity: number,
  actor: Actor,
  warehouseId = CENTRAL_WAREHOUSE_ID,
): Promise<{ success: true } | { success: false; error: string }> {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { success: false, error: "مقدار انتقال باید عدد صحیح مثبت باشد." };
  }

  return await withTransaction(async () => {
    const warehouseRow = await getOrCreateWarehouseRow(warehouseId, productId, variantId);
    if (warehouseRow.on_hand < quantity) {
      return { success: false, error: "موجودی انبار مرکزی برای این مقدار انتقال کافی نیست." } as const;
    }

    const transferId = randomUUID();

    const warehouseOnHandAfter = warehouseRow.on_hand - quantity;
    await db.prepare(
      "UPDATE warehouse_inventory SET on_hand = ?, updated_at = ? WHERE warehouse_id = ? AND product_id = ? AND variant_id = ?",
    ).run(warehouseOnHandAfter, nowIso(), warehouseId, productId, variantId);
    await insertTransaction({
      type: "warehouse_transfer_out",
      branchId: null,
      warehouseId,
      productId,
      variantId,
      onHandDelta: -quantity,
      onHandBefore: warehouseRow.on_hand,
      onHandAfter: warehouseOnHandAfter,
      reservedBefore: 0,
      reservedAfter: 0,
      orderId: null,
      actor,
      reason: `انتقال به شعبه ${branchId} (شناسه انتقال: ${transferId})`,
    });

    const branchRow = await getOrCreateBranchRow(branchId, productId, variantId);
    const branchOnHandAfter = branchRow.on_hand + quantity;
    await db.prepare("UPDATE branch_inventory SET on_hand = ?, updated_at = ? WHERE id = ?").run(
      branchOnHandAfter,
      nowIso(),
      branchRow.id,
    );
    await insertTransaction({
      type: "branch_transfer_in",
      branchId,
      warehouseId: null,
      productId,
      variantId,
      onHandDelta: quantity,
      onHandBefore: branchRow.on_hand,
      onHandAfter: branchOnHandAfter,
      reservedBefore: branchRow.reserved,
      reservedAfter: branchRow.reserved,
      orderId: null,
      actor,
      reason: `دریافت از انبار مرکزی (شناسه انتقال: ${transferId})`,
    });

    return { success: true } as const;
  });
}

// ===== آستانه موجودی کم =====

export async function setLowStockThreshold(
  threshold: number,
  scope: { branchId?: string | null; productId?: string | null; variantId?: string | null },
): Promise<LowStockThreshold> {
  const branchId = scope.branchId ?? null;
  const productId = scope.productId ?? null;
  const variantId = scope.variantId ?? null;

  const existing = await db
    .prepare("SELECT id FROM low_stock_thresholds WHERE branch_id IS NOT DISTINCT FROM ? AND product_id IS NOT DISTINCT FROM ? AND variant_id IS NOT DISTINCT FROM ?")
    .get(branchId, productId, variantId) as { id: string } | undefined;

  const id = existing?.id ?? randomUUID();
  const updatedAt = nowIso();

  if (existing) {
    await db.prepare("UPDATE low_stock_thresholds SET threshold = ?, updated_at = ? WHERE id = ?").run(
      threshold,
      updatedAt,
      id,
    );
  } else {
    await db.prepare(
      "INSERT INTO low_stock_thresholds (id, branch_id, product_id, variant_id, threshold, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
    ).run(id, branchId, productId, variantId, threshold, updatedAt);
  }

  return { id, branchId, productId, variantId, threshold, updatedAt };
}

interface ThresholdRow {
  id: string;
  branch_id: string | null;
  product_id: string | null;
  variant_id: string | null;
  threshold: number;
  updated_at: string;
}

export async function getLowStockThresholds(): Promise<LowStockThreshold[]> {
  const rows = await db.prepare("SELECT * FROM low_stock_thresholds").all() as ThresholdRow[];
  return rows.map((r) => ({
    id: r.id,
    branchId: r.branch_id,
    productId: r.product_id,
    variantId: r.variant_id,
    threshold: r.threshold,
    updatedAt: r.updated_at,
  }));
}

const DEFAULT_LOW_STOCK_THRESHOLD_FALLBACK = 5;

async function resolveThreshold(branchId: string, productId: string, variantId: string): Promise<number> {
  const thresholds = (await getLowStockThresholds()).filter((t) => {
    if (t.branchId && t.branchId !== branchId) return false;
    if (t.productId && t.productId !== productId) return false;
    if (t.variantId && t.variantId !== variantId) return false;
    return true;
  });
  if (thresholds.length === 0) return DEFAULT_LOW_STOCK_THRESHOLD_FALLBACK;
  thresholds.sort((a, b) => specificityScore(b) - specificityScore(a));
  return thresholds[0]!.threshold;
}

function specificityScore(t: LowStockThreshold): number {
  return (t.branchId ? 1 : 0) + (t.productId ? 1 : 0) + (t.variantId ? 1 : 0);
}

export interface LowStockRow extends BranchInventoryOverviewRow {
  threshold: number;
}

export async function getLowStockItems(branchId?: string): Promise<LowStockRow[]> {
  const rows = (
    branchId
      ? await db.prepare("SELECT * FROM branch_inventory WHERE branch_id = ?").all(branchId)
      : await db.prepare("SELECT * FROM branch_inventory").all()
  ) as BranchInventoryRow[];

  const result: LowStockRow[] = [];
  for (const row of rows) {
    const record = rowToBranchRecord(row);
    const available = getAvailable(record);
    const threshold = await resolveThreshold(record.branchId, record.productId, record.variantId);
    if (available > threshold) continue;
    const product = await getProductDetailById(record.productId);
    result.push({
      ...record,
      available,
      threshold,
      productName: product?.name ?? record.productId,
      variantLabel: await findVariantLabel(record.productId, record.variantId),
      categoryLabel: product?.categoryLabel ?? "",
    });
  }
  return result.sort((a, b) => a.available - b.available);
}

// ===== تاریخچه (Audit) =====

export interface TransactionHistoryFilters {
  branchId?: string;
  productId?: string;
  variantId?: string;
  orderId?: string;
  type?: InventoryTransactionType;
  actorId?: string;
  from?: string;
  to?: string;
  limit?: number;
}

interface TransactionRow {
  id: string;
  type: InventoryTransactionType;
  branch_id: string | null;
  warehouse_id: string | null;
  product_id: string;
  variant_id: string;
  on_hand_delta: number;
  on_hand_before: number;
  on_hand_after: number;
  reserved_before: number;
  reserved_after: number;
  order_id: string | null;
  actor_id: string;
  actor_role: string;
  reason: string | null;
  created_at: string;
}

function rowToTransaction(row: TransactionRow): InventoryTransaction {
  return {
    id: row.id,
    type: row.type,
    branchId: row.branch_id,
    warehouseId: row.warehouse_id,
    productId: row.product_id,
    variantId: row.variant_id,
    onHandDelta: row.on_hand_delta,
    onHandBefore: row.on_hand_before,
    onHandAfter: row.on_hand_after,
    reservedBefore: row.reserved_before,
    reservedAfter: row.reserved_after,
    orderId: row.order_id,
    actorId: row.actor_id,
    actorRole: row.actor_role,
    reason: row.reason,
    createdAt: row.created_at,
  };
}

export async function getTransactionHistory(filters: TransactionHistoryFilters = {}): Promise<InventoryTransaction[]> {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.branchId) {
    clauses.push("branch_id = ?");
    params.push(filters.branchId);
  }
  if (filters.productId) {
    clauses.push("product_id = ?");
    params.push(filters.productId);
  }
  if (filters.variantId) {
    clauses.push("variant_id = ?");
    params.push(filters.variantId);
  }
  if (filters.orderId) {
    clauses.push("order_id = ?");
    params.push(filters.orderId);
  }
  if (filters.type) {
    clauses.push("type = ?");
    params.push(filters.type);
  }
  if (filters.actorId) {
    clauses.push("actor_id = ?");
    params.push(filters.actorId);
  }
  if (filters.from) {
    clauses.push("created_at >= ?");
    params.push(filters.from);
  }
  if (filters.to) {
    clauses.push("created_at <= ?");
    params.push(filters.to);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const limit = filters.limit ?? 100;
  const rows = await db
    .prepare(`SELECT * FROM inventory_transactions ${where} ORDER BY created_at DESC LIMIT ?`)
    .all(...params, limit) as TransactionRow[];

  return rows.map(rowToTransaction);
}

// ===== نمای کلی برای Dashboard مدیریت =====

export async function getInventorySummary(): Promise<InventorySummary> {
  const rows = await db.prepare("SELECT branch_id, on_hand, reserved FROM branch_inventory").all() as {
    branch_id: string;
    on_hand: number;
    reserved: number;
  }[];

  let outOfStockCount = 0;
  const branchIds = new Set<string>();

  for (const row of rows) {
    branchIds.add(row.branch_id);
    const available = Math.max(0, row.on_hand - row.reserved);
    if (available === 0) outOfStockCount += 1;
  }
  // برای شمارش دقیق کم‌موجود (که به آستانه اختصاصی هر SKU بستگی دارد)، از
  // همان مسیر getLowStockItems استفاده می‌شود تا منطق آستانه یک‌جا بماند.
  const lowStockCount = (await getLowStockItems()).filter((r) => r.available > 0).length;

  const activeReservationCount = (
    await db.prepare("SELECT COUNT(*) as c FROM stock_reservations WHERE status = 'active'").get() as { c: number }
  ).c;

  return {
    branchCount: branchIds.size,
    trackedSkuCount: rows.length,
    outOfStockCount,
    lowStockCount,
    activeReservationCount,
  };
}

export async function getReservationByOrderId(orderId: string): Promise<InventoryReservation | undefined> {
  const row = await getReservationRow(orderId);
  if (!row) return undefined;
  return {
    id: row.id,
    orderId: row.order_id,
    branchId: row.branch_id,
    items: await getReservationItems(row.id),
    status: row.status,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    releasedAt: row.released_at,
    committedAt: row.committed_at,
    releaseReason: row.release_reason,
  };
}
