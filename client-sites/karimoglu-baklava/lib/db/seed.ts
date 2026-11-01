import { randomUUID } from "crypto";
import { db, withTransaction } from "./client";
import { allProducts, branches, getProductDetailById, getBranchScopeForProduct } from "@/lib/mock-data";
import { BRANCH_MANAGER_DATA } from "@/lib/server/branchManagerSeedData";
import { CENTRAL_WAREHOUSE_ID } from "@/lib/inventory/store";
import { ALL_PERMISSIONS, ROLE_LABELS, ROLE_PERMISSIONS, type Role } from "@/lib/auth/rbac";
import { hashPassword } from "@/lib/auth/passwords";

/**
 * Seed کاتالوگ/شعب/انبار/RBAC.
 *
 * ⚠️ نکته صادقانه مهم (باید در گزارش پایانی باشد): محتوای واقعی کاتالوگ
 * (نام/قیمت/دسته‌بندی محصولات) هنوز از `lib/mock-data.ts` می‌آید — همان
 * منبع Placeholder که در Promptهای قبلی صراحتاً اعلام شده «داده واقعی هنوز
 * دریافت نشده». این Seed صرفاً همان محتوا را به جدول‌های واقعی منتقل می‌کند
 * تا Foreign Key بین `branch_inventory` و `product_variants` معنا داشته
 * باشد و ساختار رابطه‌ای واقعی از روز اول برقرار باشد — نه این‌که منتظر
 * دریافت محتوای واقعی کاتالوگ بمانیم. وقتی محتوای واقعی محصولات از کسب‌وکار
 * دریافت شود، فقط همین فایل Seed (نه Schema، نه سرویس‌ها) باید جایگزین شود.
 */

function nowIso(): string {
  return new Date().toISOString();
}

async function isSeeded(): Promise<boolean> {
  const row = await db.prepare("SELECT COUNT(*) as c FROM products").get() as { c: number };
  return row.c > 0;
}

/**
 * یک محصول کاتالوگ (از داده اولیه کد) را با همه نسخه‌ها، قیمت‌ها و بسته‌بندی‌هایش در دیتابیس درج می‌کند.
 * هم برای ساخت اولیه دیتابیس خالی و هم برای Migration ادغام نسخه‌ها (`runtimeMigrations.ts`) استفاده می‌شود.
 * همه Insertها `ON CONFLICT DO NOTHING` هستند؛ اجرای دوباره بی‌خطر است.
 */
export async function insertCatalogProduct(productId: string, createdAt: string = nowIso()): Promise<void> {
  const product = allProducts.find((p) => p.id === productId);
  const detail = getProductDetailById(productId);
  if (!product || !detail) return;

  await db
    .prepare("INSERT INTO categories (id, slug, label) VALUES (?, ?, ?) ON CONFLICT DO NOTHING")
    .run(product.category, product.category, product.categoryLabel);

  const saleTypeLabels = JSON.stringify(Object.fromEntries(detail.saleTypes.map((g) => [g.type, g.label])));
  await db
    .prepare(
      "INSERT INTO products (id, slug, name, description, category_id, unit_type, is_active, rating, review_count, created_at, branch_scope, sale_type_labels) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING",
    )
    .run(
      product.id,
      product.slug,
      product.name,
      detail.descriptionIntro || null,
      product.category,
      detail.saleTypes[0]?.type ?? "count",
      1,
      detail.rating ?? null,
      detail.reviewCount ?? 0,
      createdAt,
      getBranchScopeForProduct(product.id),
      saleTypeLabels,
    );
  await db
    .prepare("INSERT INTO product_categories (product_id, category_id) VALUES (?, ?) ON CONFLICT DO NOTHING")
    .run(product.id, product.category);

  for (const group of detail.saleTypes) {
    for (const variant of group.variants) {
      await db
        .prepare("INSERT INTO product_variants (id, product_id, sale_type, label, is_available) VALUES (?, ?, ?, ?, ?) ON CONFLICT DO NOTHING")
        .run(variant.id, product.id, group.type, variant.label, variant.isAvailable ? 1 : 0);
      await db
        .prepare("INSERT INTO product_prices (id, product_id, variant_id, price, effective_from) VALUES (?, ?, ?, ?, ?) ON CONFLICT DO NOTHING")
        .run(randomUUID(), product.id, variant.id, variant.price, nowIso());
    }
  }

  for (const packaging of detail.packagingOptions) {
    await db
      .prepare("INSERT INTO packaging_options (id, label, price_delta) VALUES (?, ?, ?) ON CONFLICT DO NOTHING")
      .run(packaging.id, packaging.label, packaging.priceDelta);
    await db
      .prepare("INSERT INTO product_packaging (product_id, packaging_id) VALUES (?, ?) ON CONFLICT DO NOTHING")
      .run(product.id, packaging.id);
  }
}

async function seedCatalog(): Promise<void> {
  for (const product of allProducts) {
    await insertCatalogProduct(product.id);
  }
}

async function seedBranches(): Promise<void> {
  const insertBranch = db.prepare(
    `INSERT INTO branches
      (id, slug, name, city, short_area, address, phone, opening_hours, has_cafe_service, has_pos,
       supports_cash_on_delivery, manager_name, manager_phone, lat, lng, service_radius_km, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1) ON CONFLICT DO NOTHING`,
  );
  for (const branch of branches) {
    const manager = BRANCH_MANAGER_DATA[branch.id];
    await insertBranch.run(
      branch.id,
      branch.slug,
      branch.name,
      branch.city,
      branch.shortArea,
      branch.shortArea, // address — همان مقدار واقعی (رجوع به کامنت ستون در schema.sql)
      branch.phone,
      branch.openingHours,
      branch.hasCafeService ? 1 : 0,
      branch.hasPos ? 1 : 0,
      branch.supportsCashOnDelivery ? 1 : 0,
      manager?.managerName ?? null,
      manager?.managerPhone ?? null,
      branch.coordinates?.lat ?? null,
      branch.coordinates?.lng ?? null,
      branch.serviceRadiusKm ?? null,
    );
  }
  await db.prepare("INSERT INTO warehouses (id, name) VALUES (?, ?) ON CONFLICT DO NOTHING").run(CENTRAL_WAREHOUSE_ID, "انبار مرکزی");
}

/**
 * ===== Menu Seed (اطلاعات واقعی: عکس‌های منو دریافت‌شده از مجموعه) =====
 *
 * ⚠️ اصلاح‌شده طبق توضیح مستقیم کسب‌وکار (نسخه قبلی این تابع اشتباه فرض
 * کرده بود پیروزی و تجریش منوی «غذا» یکسانی دارند — اشتباه بود):
 *
 * - عمومی (باقلوا/دسر/نوشیدنی) → همه شعب فعال (تنها چیز مشترک بین همه شعب)
 * - غذا (ساندویچ/پیتزا/سیب‌زمینی-پاستا/کباب) → **فقط تجریش**
 * - ویژه پیروزی (باقلوا کیلویی/کیک با قیمت‌های به‌روزشده + نوشیدنی/صبحانه) → **فقط پیروزی**
 *
 * این تابع هیچ‌جا نام شعبه را Hardcode نمی‌کند برای «آیا این شعبه این منو
 * را دارد» — فقط یک‌بار در زمان Seed، بر اساس داده واقعی، رابطه را در
 * جدول `branch_menus` می‌سازد؛ از این پس تخصیص کاملاً در دیتابیس است و از
 * پنل ادمین قابل تغییر، بدون نیاز به تغییر این کد.
 */
async function seedMenus(): Promise<void> {
  const insertMenu = db.prepare("INSERT INTO menus (id, slug, name, is_active, sort_order) VALUES (?, ?, ?, 1, ?) ON CONFLICT DO NOTHING");
  await insertMenu.run("menu-general", "general", "منوی عمومی", 0);
  await insertMenu.run("menu-food", "food", "منوی غذا (فقط شعبه تجریش)", 1);
  await insertMenu.run("menu-piroozi", "piroozi", "منوی ویژه شعبه پیروزی", 2);

  const insertImage = db.prepare(
    "INSERT INTO menu_images (id, menu_id, image_path, alt_text, sort_order) VALUES (?, ?, ?, ?, ?) ON CONFLICT DO NOTHING",
  );
  await insertImage.run("mi-general-1", "menu-general", "/images/menu/general-baklava-desserts-drinks.jpg", "منوی باقلوا، دسر و نوشیدنی", 0);
  await insertImage.run("mi-food-1", "menu-food", "/images/menu/food-sandwich-burger.jpg", "منوی ساندویچ و برگر", 0);
  await insertImage.run("mi-food-2", "menu-food", "/images/menu/food-fries-pasta.jpg", "منوی سیب‌زمینی، سوخاری و پاستا", 1);
  await insertImage.run("mi-food-3", "menu-food", "/images/menu/food-pizza.jpg", "منوی پیتزا", 2);
  await insertImage.run("mi-food-4", "menu-food", "/images/menu/food-kebab-steak.jpg", "منوی کباب ترکی استانبولی و استیک", 3);
  await insertImage.run("mi-piroozi-1", "menu-piroozi", "/images/menu/piroozi-baklava-cakes.jpg", "منوی باقلوای کیلویی و کیک — شعبه پیروزی", 0);
  await insertImage.run("mi-piroozi-2", "menu-piroozi", "/images/menu/piroozi-drinks-breakfast.jpg", "منوی نوشیدنی و صبحانه — شعبه پیروزی", 1);

  const insertAssignment = db.prepare("INSERT INTO branch_menus (branch_id, menu_id) VALUES (?, ?) ON CONFLICT DO NOTHING");
  for (const branch of branches) {
    await insertAssignment.run(branch.id, "menu-general"); // همه شعب: منوی عمومی
  }
  // اطلاعات واقعی (اصلاح‌شده): تجریش منوی غذا دارد؛ پیروزی منوی جداگانه خودش را دارد
  await insertAssignment.run("tajrish", "menu-food");
  await insertAssignment.run("piroozi", "menu-piroozi");
}

// نگاشت نقش→مجوز از `lib/auth/rbac.ts` Import شده (منبع حقیقت واحد) —
// اینجا فقط برای Persist کردن ردیف‌های roles/permissions/role_permissions
// در دیتابیس استفاده می‌شود تا `user_roles` بتواند به یک role_id واقعی FK بزند.
async function seedRbac(): Promise<void> {
  const insertRole = db.prepare("INSERT INTO roles (id, name, label) VALUES (?, ?, ?) ON CONFLICT DO NOTHING");
  const insertPermission = db.prepare("INSERT INTO permissions (id, name) VALUES (?, ?) ON CONFLICT DO NOTHING");
  const insertRolePermission = db.prepare(
    "INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?) ON CONFLICT DO NOTHING",
  );

  for (const permission of ALL_PERMISSIONS) {
    await insertPermission.run(permission, permission);
  }

  for (const role of Object.keys(ROLE_LABELS) as (keyof typeof ROLE_LABELS)[]) {
    await insertRole.run(role, role, ROLE_LABELS[role]);
    for (const permission of ROLE_PERMISSIONS[role]) {
      await insertRolePermission.run(role, permission);
    }
  }
}

const DEV_DEFAULT_ADMIN_MOBILE = "09120000000";
const DEV_DEFAULT_ADMIN_PASSWORD = "ChangeMe123!";

/**
 * ⚠️ اصلاح امنیتی این مرحله (گزارش Performance/Security نهایی):
 * نسخه قبلی این تابع بدون قید‌وشرط (در Development *و* Production) یک
 * حساب ادمین با موبایل/رمز عبور ثابت و کاملاً شناخته‌شده (همین متن) می‌ساخت.
 * چون `bootstrap.ts` این فایل را به‌عنوان Side Effect در همان لحظه شروع
 * پروسه Import می‌کند، این یعنی هر استقرار Production — تا وقتی کسی به یاد
 * بیاورد این حساب را دستی غیرفعال/عوض کند — با یک "Backdoor" شناخته‌شده و
 * مستند بالا می‌آمد. این دقیقاً همان چیزی است که بخش «Secrets» و «Admin
 * Security» این Prompt می‌خواهد اصلاح شود، نه صرفاً گزارش شود.
 *
 * رفتار جدید:
 * - در Development/Test (دقیقاً همان تشخیص `IS_TEST`-محور که در
 *   `lib/db/client.ts` استفاده می‌شود، بازتر به «هر چیزی جز Production»):
 *   همان موبایل/رمز ثابت قبلی حفظ شده — چون مجموعه تست فعلی
 *   (`lib/auth/__tests__/rbac.test.ts`) دقیقاً به همین مقدار وابسته است و
 *   این یک محیط عمومی/در‌معرض‌اینترنت نیست.
 * - در Production: رمز عبور *باید* از متغیر محیطی
 *   `KARIMOGLU_BOOTSTRAP_ADMIN_PASSWORD` (و اختیاری
 *   `KARIMOGLU_BOOTSTRAP_ADMIN_MOBILE`) بیاید. اگر تنظیم نشده باشد، هیچ
 *   حساب ادمینی ساخته نمی‌شود (نه یک مقدار پیش‌فرض ساختگی) و یک هشدار واضح
 *   در Log ثبت می‌شود — تیم عملیات باید آگاهانه این متغیر را تنظیم کند یا
 *   اولین ادمین را از مسیر دیگری (مثلاً یک اسکریپت یک‌بار مصرف) بسازد.
 */
async function seedDefaultAdmin(): Promise<void> {
  const isProduction = process.env.NODE_ENV === "production";

  const mobile = isProduction
    ? process.env.KARIMOGLU_BOOTSTRAP_ADMIN_MOBILE
    : (process.env.KARIMOGLU_BOOTSTRAP_ADMIN_MOBILE ?? DEV_DEFAULT_ADMIN_MOBILE);
  const password = isProduction
    ? process.env.KARIMOGLU_BOOTSTRAP_ADMIN_PASSWORD
    : (process.env.KARIMOGLU_BOOTSTRAP_ADMIN_PASSWORD ?? DEV_DEFAULT_ADMIN_PASSWORD);

  if (isProduction && (!mobile || !password)) {
    // eslint-disable-next-line no-console
    console.warn(
      "[seed] هیچ حساب ادمین پیش‌فرضی ساخته نشد: در Production، KARIMOGLU_BOOTSTRAP_ADMIN_MOBILE و " +
        "KARIMOGLU_BOOTSTRAP_ADMIN_PASSWORD باید صراحتاً تنظیم شوند. این عمدی است — یک رمز/موبایل ثابت و " +
        "شناخته‌شده هرگز نباید در Production ساخته شود.",
    );
    return;
  }
  if (!mobile || !password) return; // برای TypeScript؛ عملاً فقط در حالت Production بالا رخ می‌دهد

  const existing = await db.prepare("SELECT id FROM users WHERE mobile = ?").get(mobile) as
    | { id: string }
    | undefined;
  if (existing) return;

  const id = randomUUID();
  await db.prepare("INSERT INTO users (id, mobile, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)").run(
    id,
    mobile,
    "ادمین پیش‌فرض",
    hashPassword(password),
    new Date().toISOString(),
  );
  await db.prepare("INSERT INTO user_roles (user_id, role_id, branch_id) VALUES (?, 'site_admin', NULL)").run(id);
}

export async function seedDatabaseIfEmpty(): Promise<void> {
  // RBAC (roles/permissions/role_permissions) به‌صورت جداگانه و همیشه اجرا
  // می‌شود (نه فقط وقتی کاتالوگ خالی است) — چون `INSERT OR IGNORE` است و
  // بی‌خطر؛ این‌طوری اگر بعداً Permission جدیدی به `lib/auth/rbac.ts` اضافه
  // شود، بدون نیاز به Wipe کامل دیتابیس در دیتابیس هم ظاهر می‌شود.
  await withTransaction(async () => {
    await seedRbac();
    await seedDefaultAdmin();
  });

  if (await isSeeded()) return;
  await withTransaction(async () => {
    await seedBranches();
    await seedCatalog();
    await seedMenus();
  });
}
