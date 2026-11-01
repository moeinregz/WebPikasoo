import { db } from "@/lib/db/client";
import { branches } from "@/lib/mock-data";
import type {
  PackagingOption,
  ProductCategory,
  ProductDetail,
  ProductSummary,
  SaleTypeGroup,
  UnitType,
} from "@/lib/types";

/**
 * ===== کاتالوگ فروشگاه — خوانده‌شده از PostgreSQL =====
 *
 * منبع حقیقت محصولات، قیمت‌ها، نسخه‌ها (Variant)، بسته‌بندی و عکس‌ها دیتابیس است (همان چیزی که پنل
 * ادمین ویرایش می‌کند). `lib/mock-data.ts` فقط داده اولیه (Seed) برای یک دیتابیس خالی است.
 *
 * - نتیجه چند ثانیه در حافظه Cache می‌شود (۵ Query برای کل کاتالوگ) و با هر تغییر محصول در پنل ادمین
 *   فوراً باطل می‌شود (`invalidateCatalogCache`).
 * - «قابل‌مشاهده در فروشگاه آنلاین» یعنی: فعال، حذف‌نشده، و فروخته‌شدن حداقل در یکی از شعب آنلاین
 *   (`branch_scope`). محصولی که فقط در شعبه غیرآنلاین (مثل پیروزی) فروخته می‌شود، دیده نمی‌شود.
 */

const CACHE_TTL_MS = Number(process.env.CATALOG_CACHE_MS ?? 15_000);

const SALE_TYPE_LABEL: Record<UnitType, string> = { weight: "وزنی", box: "جعبه‌ای", count: "عددی" };
const DEFAULT_PACKAGING: PackagingOption = { id: "standard", label: "بسته‌بندی استاندارد", priceDelta: 0 };
const natural = new Intl.Collator("en", { numeric: true });

interface CatalogEntry {
  summary: ProductSummary;
  detail: ProductDetail;
  visible: boolean;
}

interface Catalog {
  entries: CatalogEntry[];
  byId: Map<string, CatalogEntry>;
  bySlug: Map<string, CatalogEntry>;
}

async function selectAll<T>(sql: string): Promise<T[]> {
  return (await db.prepare(sql).all()) as T[];
}

declare global {
  // eslint-disable-next-line no-var
  var __karimoglu_catalog__: { value?: Catalog; expires: number; loading?: Promise<Catalog> } | undefined;
}

function cacheState() {
  if (!globalThis.__karimoglu_catalog__) globalThis.__karimoglu_catalog__ = { expires: 0 };
  return globalThis.__karimoglu_catalog__;
}

/** پس از هر تغییر در محصولات (ایجاد/ویرایش/حذف/فعال‌سازی) صدا زده می‌شود */
export function invalidateCatalogCache(): void {
  const state = cacheState();
  state.value = undefined;
  state.expires = 0;
}

function isRenderableImageUrl(url: string): boolean {
  return url.startsWith("/uploads/") || /^https?:\/\//i.test(url);
}

function onlineBranchIds(): Set<string> {
  return new Set(branches.filter((b) => b.acceptsOnlineOrders).map((b) => b.id));
}

function scopeFeature(scope: string, online: Set<string>): string {
  if (scope === "all") {
    const names = branches.filter((b) => online.has(b.id)).map((b) => b.name);
    return `قابل سفارش آنلاین از شعب ${names.join("، ")}`;
  }
  const branch = branches.find((b) => b.id === scope);
  return `این آیتم فقط در شعبه ${branch?.name ?? scope} ارائه می‌شود`;
}

async function loadCatalog(): Promise<Catalog> {
  const [products, variants, prices, packagings, images] = await Promise.all([
    selectAll<{
      id: string;
      slug: string;
      name: string;
      description: string | null;
      category_id: string;
      category_label: string;
      unit_type: UnitType;
      is_active: number;
      deleted_at: string | null;
      branch_scope: string;
      created_at: string;
      sale_type_labels: string | null;
    }>(
      `SELECT p.id, p.slug, p.name, p.description, p.category_id, c.label AS category_label, p.unit_type,
              p.is_active, p.deleted_at, p.branch_scope, p.created_at, p.sale_type_labels
       FROM products p JOIN categories c ON c.id = p.category_id`,
    ),
    selectAll<{ id: string; product_id: string; sale_type: UnitType; label: string; is_available: number }>(
      "SELECT id, product_id, sale_type, label, is_available FROM product_variants",
    ),
    selectAll<{
      product_id: string;
      variant_id: string;
      price: number;
      previous_price: number | null;
      discount_percent: number | null;
    }>(
      `SELECT DISTINCT ON (product_id, variant_id) product_id, variant_id, price, previous_price, discount_percent
       FROM product_prices ORDER BY product_id, variant_id, effective_from DESC`,
    ),
    selectAll<{ product_id: string; id: string; label: string; price_delta: number }>(
      `SELECT pp.product_id, po.id, po.label, po.price_delta
       FROM product_packaging pp JOIN packaging_options po ON po.id = pp.packaging_id`,
    ),
    selectAll<{ product_id: string; url: string }>("SELECT product_id, url FROM product_images ORDER BY product_id, sort_order"),
  ]);

  const priceByVariant = new Map(prices.map((p) => [`${p.product_id}\u0000${p.variant_id}`, p]));
  const variantsByProduct = new Map<string, typeof variants>();
  for (const v of variants) {
    const list = variantsByProduct.get(v.product_id) ?? [];
    list.push(v);
    variantsByProduct.set(v.product_id, list);
  }
  const packagingByProduct = new Map<string, PackagingOption[]>();
  for (const p of packagings) {
    const list = packagingByProduct.get(p.product_id) ?? [];
    list.push({ id: p.id, label: p.label, priceDelta: p.price_delta });
    packagingByProduct.set(p.product_id, list);
  }
  const imagesByProduct = new Map<string, string[]>();
  for (const img of images) {
    if (!isRenderableImageUrl(img.url)) continue;
    const list = imagesByProduct.get(img.product_id) ?? [];
    list.push(img.url);
    imagesByProduct.set(img.product_id, list);
  }

  const online = onlineBranchIds();
  const sorted = [...products].sort((a, b) => a.created_at.localeCompare(b.created_at) || natural.compare(a.id, b.id));

  const entries: CatalogEntry[] = sorted.map((row, index) => {
    const productVariants = [...(variantsByProduct.get(row.id) ?? [])].sort((a, b) => natural.compare(a.id, b.id));
    const priced = productVariants.map((v) => {
      const p = priceByVariant.get(`${row.id}\u0000${v.id}`);
      return { variant: v, price: p?.price ?? 0, previousPrice: p?.previous_price ?? null, discountPercent: p?.discount_percent ?? null };
    });
    const availableVariants = priced.filter((x) => x.variant.is_available);

    // برچسب گروه‌های نوع فروش (مثلاً weight → «کیلویی»)؛ اگر نبود/خراب بود، برچسب پیش‌فرض
    let customLabels: Partial<Record<UnitType, string>> = {};
    try {
      if (row.sale_type_labels) customLabels = JSON.parse(row.sale_type_labels) as Partial<Record<UnitType, string>>;
    } catch {
      customLabels = {};
    }

    // گروه‌بندی نسخه‌ها بر اساس نوع فروش (وزنی/عددی/جعبه‌ای) با حفظ ترتیب
    const groups: SaleTypeGroup[] = [];
    for (const x of priced) {
      let group = groups.find((g) => g.type === x.variant.sale_type);
      if (!group) {
        group = { type: x.variant.sale_type, label: customLabels[x.variant.sale_type] ?? SALE_TYPE_LABEL[x.variant.sale_type], variants: [] };
        groups.push(group);
      }
      group.variants.push({ id: x.variant.id, label: x.variant.label, price: x.price, isAvailable: !!x.variant.is_available });
    }

    const packagingOptions = packagingByProduct.get(row.id) ?? [DEFAULT_PACKAGING];
    const cheapest = [...(availableVariants.length ? availableVariants : priced)].sort((a, b) => a.price - b.price)[0];
    const imageUrls = imagesByProduct.get(row.id) ?? [];

    const sellsOnline = row.branch_scope === "all" || online.has(row.branch_scope);
    const visible = !!row.is_active && !row.deleted_at && sellsOnline;
    const isAvailable = visible && availableVariants.length > 0;

    const firstGroup = groups[0];
    const quickVariant = firstGroup?.variants.find((v) => v.isAvailable);
    const hasSimpleDefaultUnit = productVariants.length === 1;

    const summary: ProductSummary = {
      id: row.id,
      slug: row.slug,
      name: row.name,
      category: row.category_id as ProductCategory,
      categoryLabel: row.category_label,
      startingPrice: cheapest?.price ?? 0,
      previousPrice: cheapest?.previousPrice ?? undefined,
      discountPercent: cheapest?.discountPercent ?? undefined,
      isAvailable,
      hasSimpleDefaultUnit,
      unitType: row.unit_type,
      availableSaleTypes: groups.map((g) => g.type),
      addedIndex: index,
      imageUrl: imageUrls[0],
      quickAdd:
        hasSimpleDefaultUnit && firstGroup && quickVariant
          ? {
              saleType: firstGroup.type,
              variantId: quickVariant.id,
              variantLabel: quickVariant.label,
              packagingId: packagingOptions[0]!.id,
              packagingLabel: packagingOptions[0]!.label,
              unitPrice: quickVariant.price + packagingOptions[0]!.priceDelta,
            }
          : undefined,
    };

    const detail: ProductDetail = {
      ...summary,
      descriptionIntro: row.description ?? "",
      features: [scopeFeature(row.branch_scope, online)],
      saleTypes: groups,
      packagingOptions,
      reviews: [],
      imageCount: imageUrls.length,
    };

    return { summary, detail, visible };
  });

  return {
    entries,
    byId: new Map(entries.map((e) => [e.summary.id, e])),
    bySlug: new Map(entries.map((e) => [e.summary.slug, e])),
  };
}

async function getCatalog(): Promise<Catalog> {
  const state = cacheState();
  if (state.value && Date.now() < state.expires) return state.value;
  if (!state.loading) {
    // یک بارگذاری مشترک: درخواست‌های هم‌زمان منتظر همان Promise می‌مانند (بدون Query تکراری)
    state.loading = new Promise<Catalog>((resolve, reject) => {
      void loadCatalog()
        .then((catalog) => {
          state.value = catalog;
          state.expires = Date.now() + CACHE_TTL_MS;
          resolve(catalog);
        })
        .catch(reject)
        .finally(() => {
          state.loading = undefined;
        });
    });
  }
  return state.loading;
}

/** محصولات قابل‌مشاهده در فروشگاه آنلاین (به ترتیب ورود به کاتالوگ) */
export async function getCatalogProducts(): Promise<ProductSummary[]> {
  return (await getCatalog()).entries.filter((e) => e.visible).map((e) => e.summary);
}

/**
 * جزئیات یک محصول با شناسه — برای قیمت‌گذاری سبد، موجودی و پنل‌ها. محصول غیرفعال/حذف‌شده یا
 * بدون شعبه آنلاین هم برمی‌گردد، اما `isAvailable` آن false است.
 */
export async function getProductDetailById(productId: string): Promise<ProductDetail | undefined> {
  return (await getCatalog()).byId.get(productId)?.detail;
}

/** جزئیات محصول برای صفحه عمومی — فقط محصولات قابل‌مشاهده؛ در غیر این صورت undefined (۴۰۴) */
export async function getProductDetailBySlug(slug: string): Promise<ProductDetail | undefined> {
  const entry = (await getCatalog()).bySlug.get(slug);
  return entry?.visible ? entry.detail : undefined;
}

export async function getFeaturedProducts(limit = 8): Promise<ProductSummary[]> {
  return (await getCatalogProducts()).filter((p) => p.isAvailable).slice(0, limit);
}

export async function getRelatedProducts(product: ProductSummary, limit = 4): Promise<ProductSummary[]> {
  return (await getCatalogProducts())
    .filter((p) => p.id !== product.id && p.category === product.category && p.isAvailable)
    .slice(0, limit);
}
