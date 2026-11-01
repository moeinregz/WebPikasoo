import { randomUUID } from "crypto";
import { db, withTransaction } from "./client";
import { allProducts, branches, getBranchScopeForProduct, getProductDetailById } from "@/lib/mock-data";
import { MERGED_MENU_GROUPS } from "@/lib/menuProductsData";
import { insertCatalogProduct } from "./seed";
import { CENTRAL_WAREHOUSE_ID, hashString } from "@/lib/inventory/store";

/**
 * ===== Migrationهای داده که هنگام بالا آمدن برنامه، دقیقاً یک‌بار اجرا می‌شوند =====
 *
 * هر Migration با شناسه‌اش در جدول `schema_migrations` ثبت می‌شود و دفعه بعد اجرا نمی‌شود.
 * (برای تغییرات ساختاری بعدی، همچنان از `npm run migrate` و پوشه `lib/db/migrations` استفاده کنید.)
 * این‌ها داده‌ی دیتابیس‌هایی را اصلاح می‌کنند که قبل از این تغییرات ساخته شده‌اند.
 */

const IS_TEST = process.env.NODE_ENV === "test" || process.env.VITEST === "true" || process.env.VITEST === "1";

async function runOnce(id: string, fn: () => Promise<void>): Promise<void> {
  const done = await db.prepare("SELECT 1 AS x FROM schema_migrations WHERE id = ?").get(id);
  if (done) return;
  await withTransaction(async () => {
    await fn();
    await db
      .prepare("INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?) ON CONFLICT DO NOTHING")
      .run(id, new Date().toISOString());
  });
}

/** شعبه فروش + توضیحات محصولات سید‌شده (قبلاً ذخیره نمی‌شدند و فقط در کد بودند) */
async function backfillCatalogScopeAndDescriptions(): Promise<void> {
  for (const product of allProducts) {
    const scope = getBranchScopeForProduct(product.id);
    if (scope !== "all") {
      await db.prepare("UPDATE products SET branch_scope = ? WHERE id = ? AND branch_scope = 'all'").run(scope, product.id);
    }
    const description = getProductDetailById(product.id)?.descriptionIntro;
    if (description) {
      await db
        .prepare("UPDATE products SET description = ? WHERE id = ? AND (description IS NULL OR description = '')")
        .run(description, product.id);
    }
  }
}

/** مختصات واقعی شعب (برای ردیف‌هایی که قبلاً بدون مختصات ساخته شده بودند) */
async function backfillBranchCoordinates(): Promise<void> {
  for (const branch of branches) {
    if (!branch.coordinates) continue;
    await db
      .prepare("UPDATE branches SET lat = ?, lng = ? WHERE id = ? AND lat IS NULL AND lng IS NULL")
      .run(branch.coordinates.lat, branch.coordinates.lng, branch.id);
  }
}

/**
 * موجودی اولیه‌ی Seed شده یک عدد ساختگی و قطعی (۰ تا ۷ برای شعبه، ۰ تا ۳۹ برای انبار) بود، نه موجودی واقعی.
 * این Migration فقط ردیف‌هایی را صفر می‌کند که «هنوز دست‌نخورده‌اند»:
 *  - مقدارشان دقیقاً برابر عدد ساختگی Seed است،
 *  - رزرو/فروش نداشته‌اند،
 *  - و هیچ تراکنش موجودی (ثبت دستی/تعدیل/سفارش) برایشان در تاریخچه نیست.
 * موجودی‌ای که ادمین واقعاً وارد کرده یا سفارش واقعی روی آن اثر گذاشته، دست نمی‌خورد.
 */
async function resetUntouchedFakeInventory(): Promise<void> {
  const now = new Date().toISOString();

  const branchRows = (await db
    .prepare(
      `SELECT bi.id, bi.branch_id, bi.product_id, bi.variant_id, bi.on_hand
       FROM branch_inventory bi
       WHERE bi.on_hand > 0 AND bi.reserved = 0 AND bi.sold = 0
         AND NOT EXISTS (
           SELECT 1 FROM inventory_transactions t
           WHERE t.branch_id = bi.branch_id AND t.product_id = bi.product_id AND t.variant_id = bi.variant_id
         )`,
    )
    .all()) as { id: string; branch_id: string; product_id: string; variant_id: string; on_hand: number }[];
  const branchIds = branchRows
    .filter((r) => r.on_hand === hashString(`${r.branch_id}:${r.product_id}:${r.variant_id}`) % 8)
    .map((r) => r.id);

  const warehouseRows = (await db
    .prepare(
      `SELECT wi.id, wi.product_id, wi.variant_id, wi.on_hand
       FROM warehouse_inventory wi
       WHERE wi.on_hand > 0 AND wi.warehouse_id = ?
         AND NOT EXISTS (
           SELECT 1 FROM inventory_transactions t
           WHERE t.warehouse_id = wi.warehouse_id AND t.product_id = wi.product_id AND t.variant_id = wi.variant_id
         )`,
    )
    .all(CENTRAL_WAREHOUSE_ID)) as { id: string; product_id: string; variant_id: string; on_hand: number }[];
  const warehouseIds = warehouseRows
    .filter((r) => r.on_hand === hashString(`warehouse:${r.product_id}:${r.variant_id}`) % 40)
    .map((r) => r.id);

  for (let i = 0; i < branchIds.length; i += 200) {
    await db
      .prepare("UPDATE branch_inventory SET on_hand = 0, updated_at = ? WHERE id = ANY(?)")
      .run(now, branchIds.slice(i, i + 200));
  }
  for (let i = 0; i < warehouseIds.length; i += 200) {
    await db
      .prepare("UPDATE warehouse_inventory SET on_hand = 0, updated_at = ? WHERE id = ANY(?)")
      .run(now, warehouseIds.slice(i, i + 200));
  }
  // eslint-disable-next-line no-console
  console.log(`[migration] موجودی ساختگی صفر شد: ${branchIds.length} ردیف شعبه، ${warehouseIds.length} ردیف انبار`);
}

/**
 * ادغام نسخه‌ها: چند ردیف جدا (مثلاً «باقلوا گردویی کیلویی»، «اسلایس کوچک»، «اسلایس بزرگ») در دیتابیس
 * قدیمی، حالا یک محصول با چند نسخه‌اند (رجوع به MERGE_SPECS در menuProductsData.ts).
 *
 * برای هر گروه ادغام‌شده که هنوز در دیتابیس نیست:
 *  1) محصول جدید با همه نسخه‌ها/قیمت‌ها ساخته می‌شود (جایگاه آن در لیست = جایگاه اولین ردیف قدیمی)،
 *  2) عکس‌های ردیف‌های قدیمی (که ادمین آپلود کرده) به محصول جدید منتقل می‌شوند،
 *  3) ردیف‌های قدیمی حذف منطقی (مخفی) می‌شوند — پاک نمی‌شوند تا سفارش‌ها و تاریخچه موجودی سالم بمانند.
 * ردیف‌های ادغام‌نشده کاملاً دست‌نخورده می‌مانند (همان شناسه، عکس و موجودی).
 * در دیتابیس تازه، محصولات ادغام‌شده از ابتدا ساخته می‌شوند و این Migration کاری ندارد.
 */
async function mergeProductVariants(): Promise<void> {
  const now = new Date().toISOString();
  let merged = 0;

  for (const group of MERGED_MENU_GROUPS) {
    const exists = await db.prepare("SELECT 1 AS x FROM products WHERE id = ?").get(group.id);
    if (exists) continue;

    const members = (await db
      .prepare("SELECT id, created_at FROM products WHERE id = ANY(?)")
      .all(group.memberLegacyIds)) as { id: string; created_at: string }[];
    if (members.length === 0) continue; // این دیتابیس اصلاً ردیف‌های قدیمی این گروه را ندارد

    const memberIds = members.map((m) => m.id);
    const earliest = members.map((m) => m.created_at).sort()[0]!;

    // عکس‌های ردیف‌های قدیمی: به ترتیب اعضای گروه، بدون تکرار
    const imageRows = (await db
      .prepare("SELECT product_id, url, sort_order FROM product_images WHERE product_id = ANY(?) ORDER BY sort_order")
      .all(memberIds)) as { product_id: string; url: string; sort_order: number }[];
    const urls: string[] = [];
    for (const memberId of group.memberLegacyIds) {
      for (const row of imageRows.filter((r) => r.product_id === memberId)) {
        if (!urls.includes(row.url)) urls.push(row.url);
      }
    }

    // آدرس (Slug) ردیف‌های قدیمی آزاد می‌شود تا محصول جدید بتواند از آن استفاده کند
    await db
      .prepare("UPDATE products SET slug = slug || '--merged-' || id, is_active = 0, deleted_at = ? WHERE id = ANY(?)")
      .run(now, memberIds);

    await insertCatalogProduct(group.id, earliest);

    for (let index = 0; index < urls.length; index++) {
      await db
        .prepare("INSERT INTO product_images (id, product_id, url, sort_order) VALUES (?, ?, ?, ?)")
        .run(randomUUID(), group.id, urls[index], index);
    }
    merged++;
  }
  // eslint-disable-next-line no-console
  console.log(`[migration] ادغام نسخه‌ها: ${merged} محصول چندنوعی ساخته شد`);
}

export async function runRuntimeMigrations(): Promise<void> {
  // ادغام نسخه‌ها باید قبل از بقیه اجرا شود (محصولات جدید با توضیحات و شعبه فروش درست ساخته می‌شوند)
  await runOnce("rt-2026-10-merge-product-variants", mergeProductVariants);
  await runOnce("rt-2026-10-catalog-scope-and-descriptions", backfillCatalogScopeAndDescriptions);
  await runOnce("rt-2026-10-branch-coordinates", backfillBranchCoordinates);
  // در تست‌ها موجودی Seed شده عمداً حفظ می‌شود (برخی تست‌ها به آن تکیه دارند)
  if (!IS_TEST) await runOnce("rt-2026-10-reset-fake-inventory", resetUntouchedFakeInventory);
}
