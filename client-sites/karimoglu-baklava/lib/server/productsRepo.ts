import { randomUUID } from "crypto";
import { db, withTransaction } from "@/lib/db/client";
import { recordAuditLog } from "./auditRepo";
import { invalidateCatalogCache } from "./catalog";
import type { Actor } from "@/lib/auth/rbac";

/**
 * ===== مدیریت محصولات (نسخه PostgreSQL) =====
 *
 * روی همان جدول‌های کاتالوگ واقعی کار می‌کند. همه توابع این فایل async هستند
 * (باید با `await` صدا زده شوند). هر تغییر مهم (ایجاد/ویرایش/غیرفعال‌سازی/حذف منطقی)
 * در `audit_logs` ثبت می‌شود.
 */

export interface ProductVariantInput {
  id: string; // مثلاً "w-500" — از UI کنترل می‌شود تا با سبد/موجودی سازگار بماند
  saleType: "weight" | "count" | "box";
  label: string;
  price: number;
  isAvailable: boolean;
}

export interface ProductInput {
  id?: string;
  slug: string;
  name: string;
  description: string | null;
  categoryId: string;
  unitType: "weight" | "count" | "box";
  isActive: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  variants: ProductVariantInput[];
  packagingIds: string[];
  imageUrls: string[];
}

export interface ProductListRow {
  id: string;
  slug: string;
  name: string;
  categoryLabel: string;
  isActive: boolean;
  isDeleted: boolean;
  variantCount: number;
  startingPrice: number | null;
}

export interface ProductDetail extends ProductInput {
  id: string;
  isDeleted: boolean;
  createdAt: string;
}

export async function listCategories(): Promise<{ id: string; label: string }[]> {
  const rows = (await db.prepare("SELECT id, label FROM categories ORDER BY label").all()) as {
    id: string;
    label: string;
  }[];
  return rows.map((r) => ({ id: r.id, label: r.label }));
}

export async function listPackagingOptions(): Promise<{ id: string; label: string; priceDelta: number }[]> {
  const rows = (await db.prepare("SELECT id, label, price_delta FROM packaging_options ORDER BY price_delta").all()) as {
    id: string;
    label: string;
    price_delta: number;
  }[];
  return rows.map((r) => ({ id: r.id, label: r.label, priceDelta: r.price_delta }));
}

export interface ProductListFilters {
  search?: string;
  categoryId?: string;
  status?: "active" | "inactive" | "deleted" | "all";
  page?: number;
  pageSize?: number;
}

export async function listProducts(filters: ProductListFilters = {}): Promise<{ rows: ProductListRow[]; total: number }> {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.status !== "all" && filters.status !== "deleted") {
    clauses.push("p.deleted_at IS NULL");
  } else if (filters.status === "deleted") {
    clauses.push("p.deleted_at IS NOT NULL");
  }
  if (filters.status === "active") clauses.push("p.is_active = 1");
  if (filters.status === "inactive") clauses.push("p.is_active = 0");
  if (filters.search) {
    clauses.push("p.name ILIKE ?"); // ILIKE: جستجوی بدون حساسیت به حروف بزرگ/کوچک (در PostgreSQL، LIKE حساس است)
    params.push(`%${filters.search}%`);
  }
  if (filters.categoryId) {
    clauses.push("p.category_id = ?");
    params.push(filters.categoryId);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const pageSize = Math.min(Math.max(filters.pageSize ?? 20, 1), 100);
  const page = Math.max(filters.page ?? 1, 1);
  const offset = (page - 1) * pageSize;

  const total = ((await db.prepare(`SELECT COUNT(*) as c FROM products p ${where}`).get(...params)) as { c: number }).c;

  const rows = (await db
    .prepare(
      `SELECT p.id, p.slug, p.name, c.label as category_label, p.is_active, p.deleted_at,
              (SELECT COUNT(*) FROM product_variants v WHERE v.product_id = p.id) as variant_count,
              (SELECT MIN(pr.price) FROM product_prices pr WHERE pr.product_id = p.id) as starting_price
       FROM products p JOIN categories c ON c.id = p.category_id
       ${where}
       ORDER BY p.name, p.id
       LIMIT ? OFFSET ?`,
    )
    .all(...params, pageSize, offset)) as {
    id: string;
    slug: string;
    name: string;
    category_label: string;
    is_active: number;
    deleted_at: string | null;
    variant_count: number;
    starting_price: number | null;
  }[];

  return {
    total,
    rows: rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      categoryLabel: r.category_label,
      isActive: !!r.is_active,
      isDeleted: !!r.deleted_at,
      variantCount: r.variant_count,
      startingPrice: r.starting_price,
    })),
  };
}

export async function getProductById(id: string): Promise<ProductDetail | undefined> {
  const row = (await db.prepare("SELECT * FROM products WHERE id = ?").get(id)) as
    | {
        id: string;
        slug: string;
        name: string;
        description: string | null;
        category_id: string;
        unit_type: "weight" | "count" | "box";
        is_active: number;
        deleted_at: string | null;
        meta_title: string | null;
        meta_description: string | null;
        created_at: string;
      }
    | undefined;
  if (!row) return undefined;

  const variantRows = (await db
    .prepare("SELECT id, sale_type, label, is_available FROM product_variants WHERE product_id = ?")
    .all(id)) as { id: string; sale_type: "weight" | "count" | "box"; label: string; is_available: number }[];

  const priceRows = (await db
    .prepare(
      "SELECT variant_id, price FROM product_prices WHERE product_id = ? AND effective_from = (SELECT MAX(effective_from) FROM product_prices p2 WHERE p2.product_id = product_prices.product_id AND p2.variant_id = product_prices.variant_id)",
    )
    .all(id)) as { variant_id: string; price: number }[];
  const priceByVariant = new Map(priceRows.map((p) => [p.variant_id, p.price]));

  const packagingRows = (await db.prepare("SELECT packaging_id FROM product_packaging WHERE product_id = ?").all(id)) as {
    packaging_id: string;
  }[];

  const imageRows = (await db
    .prepare("SELECT url FROM product_images WHERE product_id = ? ORDER BY sort_order")
    .all(id)) as { url: string }[];

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    categoryId: row.category_id,
    unitType: row.unit_type,
    isActive: !!row.is_active,
    isDeleted: !!row.deleted_at,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    createdAt: row.created_at,
    variants: variantRows.map((v) => ({
      id: v.id,
      saleType: v.sale_type,
      label: v.label,
      price: priceByVariant.get(v.id) ?? 0,
      isAvailable: !!v.is_available,
    })),
    packagingIds: packagingRows.map((p) => p.packaging_id),
    imageUrls: imageRows.map((i) => i.url),
  };
}

/**
 * نسخه‌ها (Variant)، قیمت‌ها، بسته‌بندی و تصاویر محصول را با مقدار فرم جایگزین می‌کند.
 *
 * ⚠️ نسخه‌ها را «پاک و دوباره بساز» نمی‌کنیم: جدول‌های موجودی (branch_inventory و
 * warehouse_inventory) با کلید خارجی به product_variants وصل‌اند و در PostgreSQL پاک کردن
 * نسخه‌ای که موجودی دارد خطا می‌دهد (خطای ۵۰۰ هنگام ذخیره محصول). به‌جای آن:
 *  - نسخه‌های موجود/جدید Upsert می‌شوند (ردیف‌های موجودی دست‌نخورده می‌مانند)
 *  - نسخه‌ای که از فرم حذف شده: اگر موجودی ثبت‌شده دارد فقط «ناموجود» می‌شود، وگرنه پاک می‌شود
 */
async function replaceVariantsPricingPackagingImages(productId: string, input: ProductInput): Promise<void> {
  const now = new Date().toISOString();
  const keepIds = input.variants.map((v) => v.id);

  // ۱) نسخه‌های موجود/جدید
  for (const variant of input.variants) {
    await db
      .prepare(
        `INSERT INTO product_variants (id, product_id, sale_type, label, is_available)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT (product_id, id) DO UPDATE
         SET sale_type = EXCLUDED.sale_type, label = EXCLUDED.label, is_available = EXCLUDED.is_available`,
      )
      .run(variant.id, productId, variant.saleType, variant.label, variant.isAvailable ? 1 : 0);
  }

  // ۲) نسخه‌هایی که از فرم حذف شده‌اند
  const existing = (await db.prepare("SELECT id FROM product_variants WHERE product_id = ?").all(productId)) as { id: string }[];
  for (const { id: variantId } of existing) {
    if (keepIds.includes(variantId)) continue;
    const inUse = await db
      .prepare(
        `SELECT 1 AS x FROM branch_inventory WHERE product_id = ? AND variant_id = ?
         UNION ALL
         SELECT 1 FROM warehouse_inventory WHERE product_id = ? AND variant_id = ?
         LIMIT 1`,
      )
      .get(productId, variantId, productId, variantId);
    if (inUse) {
      await db.prepare("UPDATE product_variants SET is_available = 0 WHERE product_id = ? AND id = ?").run(productId, variantId);
    } else {
      await db.prepare("DELETE FROM product_variants WHERE product_id = ? AND id = ?").run(productId, variantId);
    }
  }

  // ۳) قیمت‌ها، بسته‌بندی و تصاویر (هیچ کلید خارجی‌ای به این جدول‌ها اشاره نمی‌کند)
  await db.prepare("DELETE FROM product_prices WHERE product_id = ?").run(productId);
  await db.prepare("DELETE FROM product_packaging WHERE product_id = ?").run(productId);
  await db.prepare("DELETE FROM product_images WHERE product_id = ?").run(productId);

  for (const variant of input.variants) {
    await db
      .prepare("INSERT INTO product_prices (id, product_id, variant_id, price, effective_from) VALUES (?, ?, ?, ?, ?)")
      .run(randomUUID(), productId, variant.id, variant.price, now);
  }
  for (const packagingId of input.packagingIds) {
    await db.prepare("INSERT INTO product_packaging (product_id, packaging_id) VALUES (?, ?)").run(productId, packagingId);
  }
  for (let index = 0; index < input.imageUrls.length; index++) {
    await db
      .prepare("INSERT INTO product_images (id, product_id, url, sort_order) VALUES (?, ?, ?, ?)")
      .run(randomUUID(), productId, input.imageUrls[index], index);
  }
}

export async function createProduct(
  input: ProductInput,
  actor: Actor,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  if (!input.name.trim() || !input.slug.trim()) return { success: false, error: "نام و Slug محصول الزامی است." };
  if (input.variants.length === 0) return { success: false, error: "حداقل یک Variant لازم است." };

  const id = input.id?.trim() || randomUUID();
  const result = await withTransaction(async () => {
    try {
      await db
        .prepare(
          `INSERT INTO products (id, slug, name, description, category_id, unit_type, is_active, meta_title, meta_description, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          id,
          input.slug,
          input.name,
          input.description,
          input.categoryId,
          input.unitType,
          input.isActive ? 1 : 0,
          input.metaTitle,
          input.metaDescription,
          new Date().toISOString(),
        );
      await db
        .prepare("INSERT INTO product_categories (product_id, category_id) VALUES (?, ?) ON CONFLICT DO NOTHING")
        .run(id, input.categoryId);
      await replaceVariantsPricingPackagingImages(id, input);

      await recordAuditLog(actor, "product.create", "product", id, null, { name: input.name, slug: input.slug });
      return { success: true, id } as const;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "خطای ناشناخته" } as const;
    }
  });
  invalidateCatalogCache();
  return result;
}

export async function updateProduct(
  id: string,
  input: ProductInput,
  actor: Actor,
): Promise<{ success: true } | { success: false; error: string }> {
  const before = await getProductById(id);
  if (!before) return { success: false, error: "محصول یافت نشد." };

  const result = await withTransaction(async () => {
    await db
      .prepare(
        `UPDATE products SET slug = ?, name = ?, description = ?, category_id = ?, unit_type = ?, is_active = ?,
           meta_title = ?, meta_description = ? WHERE id = ?`,
      )
      .run(
        input.slug,
        input.name,
        input.description,
        input.categoryId,
        input.unitType,
        input.isActive ? 1 : 0,
        input.metaTitle,
        input.metaDescription,
        id,
      );
    await db.prepare("DELETE FROM product_categories WHERE product_id = ?").run(id);
    await db
      .prepare("INSERT INTO product_categories (product_id, category_id) VALUES (?, ?) ON CONFLICT DO NOTHING")
      .run(id, input.categoryId);
    await replaceVariantsPricingPackagingImages(id, input);

    await recordAuditLog(actor, "product.update", "product", id, before, input);
    return { success: true } as const;
  });
  invalidateCatalogCache();
  return result;
}

export async function setProductActive(id: string, isActive: boolean, actor: Actor): Promise<void> {
  const before = await getProductById(id);
  await db.prepare("UPDATE products SET is_active = ? WHERE id = ?").run(isActive ? 1 : 0, id);
  await recordAuditLog(actor, isActive ? "product.activate" : "product.deactivate", "product", id, before ?? null, { isActive });
  invalidateCatalogCache();
}

/** حذف منطقی — طبق الزام صریح، هرگز DELETE واقعی نیست */
export async function softDeleteProduct(id: string, actor: Actor): Promise<void> {
  const before = await getProductById(id);
  await db.prepare("UPDATE products SET deleted_at = ? WHERE id = ?").run(new Date().toISOString(), id);
  await recordAuditLog(actor, "product.delete", "product", id, before ?? null, null);
  invalidateCatalogCache();
}

export async function restoreProduct(id: string, actor: Actor): Promise<void> {
  await db.prepare("UPDATE products SET deleted_at = NULL WHERE id = ?").run(id);
  await recordAuditLog(actor, "product.restore", "product", id, null, null);
  invalidateCatalogCache();
}
