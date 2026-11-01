import { randomUUID } from "crypto";
import { allProducts, branches, getProductDetailById, getBranchScopeForProduct } from "@/lib/mock-data";
import { db } from "@/lib/db/client";

/**
 * ⚠️ Prompt 10 — این فایل دیگر یک Map حافظه نیست. موجودی حالا واقعاً در
 * جدول‌های SQL (`branch_inventory` / `warehouse_inventory`، تعریف‌شده در
 * `lib/db/schema.sql`) نگه داشته می‌شود؛ `lib/inventory/core.ts` مستقیماً با
 * SQL کار می‌کند. این فایل فقط دو مسئولیت باقی‌مانده دارد: (۱) مقداردهی
 * اولیه Placeholder موجودی شعب (دقیقاً همان مقادیر قطعی Prompt 8/9، حالا در
 * ردیف‌های واقعی دیتابیس)، و (۲) کمک به تست‌ها برای پاک‌سازی کامل.
 */

export const CENTRAL_WAREHOUSE_ID = "central-warehouse";

export function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function allProductVariantPairs(): { productId: string; variantId: string }[] {
  const pairs: { productId: string; variantId: string }[] = [];
  for (const product of allProducts) {
    const detail = getProductDetailById(product.id);
    if (!detail) continue;
    for (const group of detail.saleTypes) {
      for (const variant of group.variants) {
        pairs.push({ productId: product.id, variantId: variant.id });
      }
    }
  }
  return pairs;
}

async function isInventorySeeded(): Promise<boolean> {
  const row = await db.prepare("SELECT COUNT(*) as c FROM branch_inventory").get() as { c: number };
  return row.c > 0;
}

/**
 * موجودی اولیه شعبه — قطعی (Deterministic)، نه تصادفی واقعی — دقیقاً به همان
 * دلیل Prompt 8/9: نتایج باید بین اجراها ثابت بمانند. صرفاً داده Placeholder
 * توسعه؛ ورود موجودی واقعی از پنل مدیریت انجام می‌شود.
 */
export async function seedBranchInventoryIfEmpty(): Promise<void> {
  if (await isInventorySeeded()) return;

  const now = new Date().toISOString();
  const pairs = allProductVariantPairs();
  const insertBranchRow = db.prepare(
    "INSERT INTO branch_inventory (id, branch_id, product_id, variant_id, on_hand, reserved, sold, updated_at) VALUES (?, ?, ?, ?, ?, 0, 0, ?)",
  );
  const insertWarehouseRow = db.prepare(
    "INSERT INTO warehouse_inventory (id, warehouse_id, product_id, variant_id, on_hand, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
  );

  for (const branch of branches) {
    for (const { productId, variantId } of pairs) {
      // ⚠️ اصلاح باگ واقعی: قبلاً به هر ۶ شعبه موجودی داده می‌شد، حتی
      // شعبی که آن آیتم را اصلاً نمی‌فروشند (مثلاً پیتزا در ستارخان) —
      // یعنی Smart Branch Engine می‌توانست پیتزا را به شعبه‌ای بدون منوی
      // غذا Route کند. حالا موجودی فقط در شعبه(های) واقعاً مرتبط ساخته می‌شود.
      const scope = getBranchScopeForProduct(productId);
      if (scope !== "all" && scope !== branch.id) continue;
      const onHand = hashString(`${branch.id}:${productId}:${variantId}`) % 8; // ۰ تا ۷ — قطعی
      await insertBranchRow.run(randomUUID(), branch.id, productId, variantId, onHand, now);
    }
  }

  for (const { productId, variantId } of pairs) {
    const onHand = hashString(`warehouse:${productId}:${variantId}`) % 40; // ۰ تا ۳۹ — قطعی
    await insertWarehouseRow.run(randomUUID(), CENTRAL_WAREHOUSE_ID, productId, variantId, onHand, now);
  }
}

/** فقط برای تست — پاک‌سازی جدول‌های موجودی و بازگرداندن به حالت اولیه قطعی */
export async function __resetInventoryDbForTest(): Promise<void> {
  for (const table of [
    "stock_reservation_items",
    "stock_reservations",
    "inventory_transactions",
    "low_stock_thresholds",
    "warehouse_inventory",
    "branch_inventory",
  ]) {
    await db.exec(`DELETE FROM ${table};`);
  }
  await seedBranchInventoryIfEmpty();
}
