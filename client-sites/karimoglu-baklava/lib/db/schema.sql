-- ===== Karimoglu Baklava — Database Schema (PostgreSQL) =====
--
-- موتور: PostgreSQL (روی لیارا یا هر سرور PostgreSQL ≥ 13).
-- این فایل توسط `lib/db/client.ts` در اولین اتصال اجرا می‌شود؛ همه دستورات
-- `IF NOT EXISTS` هستند، پس اجرای مکرر بی‌خطر است. تغییرات بعدی Schema باید با
-- فایل‌های Migration (پوشه lib/db/migrations و scripts/migrate.mjs) انجام شود.
--
-- نکته‌ها:
-- - همه کلیدهای اصلی TEXT هستند (UUID یا شناسه خوانا مثل "satarkhan"، "p1"، "w-500").
-- - اعداد صحیح BIGINT هستند (مبلغ‌های ریالی از ۲.۱ میلیارد بیشتر می‌شوند).
-- - Booleanها به‌صورت BIGINT 0/1 نگه داشته می‌شوند (سازگار با کد موجود).
-- - تاریخ‌ها به‌صورت TEXT با فرمت ISO-8601 ذخیره می‌شوند.

-- ===== Migration Tracking (اضافه‌شده در Prompt 15) =====
--
-- ⚠️ یافته صادقانه DevOps این مرحله: تا امروز این پروژه اصلاً سیستم Migration
-- نداشت — کل این فایل با `CREATE TABLE IF NOT EXISTS` یک‌بار اجرا می‌شود که
-- برای «اولین راه‌اندازی» کافی است اما هیچ راه امنی برای اعمال تغییرات آینده
-- (مثلاً افزودن یک ستون) روی یک دیتابیس Production که از قبل داده واقعی دارد
-- فراهم نمی‌کند. این جدول + `scripts/migrate.mjs` + پوشه `lib/db/migrations/`
-- کمینه‌ترین راه‌حل امن برای این مشکل است (رجوع به docs/database-migration-guide.md).
CREATE TABLE IF NOT EXISTS schema_migrations (
  id TEXT PRIMARY KEY,        -- نام فایل Migration، مثلاً "0001_add_x.sql"
  applied_at TEXT NOT NULL
);

-- ===== Auth / RBAC =====

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  mobile TEXT NOT NULL UNIQUE,
  name TEXT,
  password_hash TEXT, -- NULL برای مشتری مهمان (کاربر واقعی هرگز ساخته نمی‌شود مگر ثبت‌نام کند)
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE, -- site_admin | ceo | branch_manager | warehouse_staff | cashier
  label TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS permissions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id TEXT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- هر ادمین یک نقش دارد (ساده‌سازی آگاهانه — طبق کسب‌وکار فعلی نیازی به
-- چندنقشی بودن یک کاربر دیده نشده)؛ branch_id فقط برای مدیر شعبه پر می‌شود.

-- توکن خام Session هرگز ذخیره نمی‌شود — فقط Hash آن (SHA-256). اگر دیتابیس
-- لو برود، توکن‌های فعال قابل استفاده مجدد نیستند.
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- ===== Catalog =====

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category_id TEXT NOT NULL REFERENCES categories(id),
  unit_type TEXT NOT NULL CHECK (unit_type IN ('weight','count','box')),
  is_active BIGINT NOT NULL DEFAULT 1,
  deleted_at TEXT, -- حذف منطقی (Soft Delete) — جدا از is_active («غیرفعال») طبق بخش ۴ Prompt 11
  meta_title TEXT,
  meta_description TEXT,
  rating DOUBLE PRECISION,
  review_count BIGINT NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_deleted ON products(deleted_at);

CREATE TABLE IF NOT EXISTS product_categories (
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

CREATE TABLE IF NOT EXISTS product_variants (
  id TEXT NOT NULL,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sale_type TEXT NOT NULL CHECK (sale_type IN ('weight','count','box')),
  label TEXT NOT NULL,
  is_available BIGINT NOT NULL DEFAULT 1,
  PRIMARY KEY (product_id, id) -- Variant idهایی مثل w-500 بین محصولات تکرار می‌شوند؛ کلید واقعی ترکیبی است
);

CREATE TABLE IF NOT EXISTS product_prices (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  price BIGINT NOT NULL CHECK (price >= 0),
  previous_price BIGINT,
  discount_percent BIGINT,
  effective_from TEXT NOT NULL,
  FOREIGN KEY (product_id, variant_id) REFERENCES product_variants(product_id, id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_prices_variant ON product_prices(product_id, variant_id, effective_from DESC);

CREATE TABLE IF NOT EXISTS packaging_options (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  price_delta BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS product_packaging (
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  packaging_id TEXT NOT NULL REFERENCES packaging_options(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, packaging_id)
);

CREATE TABLE IF NOT EXISTS product_images (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order BIGINT NOT NULL DEFAULT 0
);

-- ===== Branches / Warehouse =====

CREATE TABLE IF NOT EXISTS branches (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  city TEXT NOT NULL CHECK (city IN ('تهران','همدان')),
  short_area TEXT,
  -- ⚠️ اضافه‌شده (اطلاعات واقعی دریافت‌شده از مجموعه): آدرس کامل — تا امروز
  -- ستون جداگانه‌ای نداشت (short_area برای همین منظور رزرو شده بود ولی
  -- فروشگاه/سایت عمومی هنوز از lib/mock-data.ts می‌خواند، نه این جدول —
  -- رجوع به یادداشت‌های معماری قبلی پروژه). این ستون نسخه Admin/DB همان
  -- آدرس را نگه می‌دارد تا از طریق پنل هم قابل مشاهده/ویرایش باشد.
  address TEXT,
  phone TEXT,
  opening_hours TEXT NOT NULL,
  has_cafe_service BIGINT NOT NULL DEFAULT 0,
  has_pos BIGINT NOT NULL DEFAULT 0,
  -- ⚠️ اضافه‌شده: پرداخت درب منزل — اطلاعات واقعی (فقط تجریش فعلاً دارد)
  supports_cash_on_delivery BIGINT NOT NULL DEFAULT 0,
  -- ⚠️ اضافه‌شده: مسئول/مدیر شعبه — اطلاعات داخلی، هرگز نباید در API/صفحه
  -- عمومی برگردانده شود (رجوع به lib/server/branchesAdminRepo.ts و
  -- کامنت‌های همان فایل برای محل دقیق اعمال این محدودیت).
  manager_name TEXT,
  manager_phone TEXT,
  lat DOUBLE PRECISION, -- TODO: مختصات دقیق هنوز دریافت نشده
  lng DOUBLE PRECISION, -- TODO
  service_radius_km DOUBLE PRECISION, -- TODO: محدوده دقیق سرویس‌دهی هنوز مشخص نشده
  is_active BIGINT NOT NULL DEFAULT 1
);

-- (user_roles به branches ارجاع می‌دهد، پس باید بعد از آن ساخته شود)
CREATE TABLE IF NOT EXISTS user_roles (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  branch_id TEXT REFERENCES branches(id),
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS branch_working_hours ( -- برای توسعه آینده (ساعت متفاوت هر روز)؛ فعلاً همه از branches.opening_hours می‌خوانند
  id TEXT PRIMARY KEY,
  branch_id TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  day_of_week BIGINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  opens_at TEXT NOT NULL,
  closes_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS branch_delivery_zones ( -- TODO: هیچ داده واقعی محدوده ارسال هنوز دریافت نشده
  id TEXT PRIMARY KEY,
  branch_id TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  polygon_geojson TEXT
);

CREATE TABLE IF NOT EXISTS warehouses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

-- ===== Menu (اضافه‌شده — اطلاعات واقعی: اکثر شعب منوی عمومی یکسان دارند؛
-- پیروزی و تجریش علاوه بر منوی عمومی، منوی غذا هم دارند) =====
--
-- طراحی عمداً بدون Hardcode («if branch === piroozi») است: یک شعبه از
-- طریق جدول رابطه‌ای `branch_menus` به هر تعداد «منو»ی فعال وصل می‌شود؛
-- تخصیص کاملاً داده‌محور است و بعداً از پنل ادمین قابل تغییر خواهد بود
-- (بدون نیاز به تغییر کد).
CREATE TABLE IF NOT EXISTS menus (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_active BIGINT NOT NULL DEFAULT 1,
  sort_order BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS menu_images (
  id TEXT PRIMARY KEY,
  menu_id TEXT NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  image_path TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  sort_order BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_menu_images_menu ON menu_images(menu_id);

CREATE TABLE IF NOT EXISTS branch_menus (
  branch_id TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  menu_id TEXT NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  PRIMARY KEY (branch_id, menu_id)
);

-- ===== Inventory (از Prompt 9، حالا در دیتابیس واقعی به‌جای Map حافظه) =====

CREATE TABLE IF NOT EXISTS branch_inventory (
  id TEXT PRIMARY KEY,
  branch_id TEXT NOT NULL REFERENCES branches(id),
  product_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  on_hand BIGINT NOT NULL DEFAULT 0 CHECK (on_hand >= 0),
  reserved BIGINT NOT NULL DEFAULT 0 CHECK (reserved >= 0),
  sold BIGINT NOT NULL DEFAULT 0 CHECK (sold >= 0),
  updated_at TEXT NOT NULL,
  UNIQUE (branch_id, product_id, variant_id),
  CHECK (reserved <= on_hand),
  FOREIGN KEY (product_id, variant_id) REFERENCES product_variants(product_id, id)
);
CREATE INDEX IF NOT EXISTS idx_branch_inventory_sku ON branch_inventory(product_id, variant_id);

CREATE TABLE IF NOT EXISTS warehouse_inventory (
  id TEXT PRIMARY KEY,
  warehouse_id TEXT NOT NULL REFERENCES warehouses(id),
  product_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  on_hand BIGINT NOT NULL DEFAULT 0 CHECK (on_hand >= 0),
  updated_at TEXT NOT NULL,
  UNIQUE (warehouse_id, product_id, variant_id),
  FOREIGN KEY (product_id, variant_id) REFERENCES product_variants(product_id, id)
);

CREATE TABLE IF NOT EXISTS inventory_transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  branch_id TEXT REFERENCES branches(id),
  warehouse_id TEXT REFERENCES warehouses(id),
  product_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  on_hand_delta BIGINT NOT NULL,
  on_hand_before BIGINT NOT NULL,
  on_hand_after BIGINT NOT NULL,
  reserved_before BIGINT NOT NULL,
  reserved_after BIGINT NOT NULL,
  order_id TEXT, -- بدون FK به orders عمداً: رزرو موجودی قبل از درج نهایی ردیف سفارش اتفاق می‌افتد (Reserve-then-create-order، برای Fail Fast)
  actor_id TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  reason TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_inv_txn_branch_sku_time ON inventory_transactions(branch_id, product_id, variant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inv_txn_order ON inventory_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_inv_txn_created ON inventory_transactions(created_at DESC);

CREATE TABLE IF NOT EXISTS stock_reservations (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE, -- بدون FK به orders عمداً (همان دلیل inventory_transactions بالا)
  branch_id TEXT NOT NULL REFERENCES branches(id),
  status TEXT NOT NULL CHECK (status IN ('active','released','committed','expired')),
  created_at TEXT NOT NULL,
  expires_at TEXT,
  released_at TEXT,
  committed_at TEXT,
  release_reason TEXT
);
CREATE INDEX IF NOT EXISTS idx_reservation_status ON stock_reservations(status, expires_at);

CREATE TABLE IF NOT EXISTS stock_reservation_items (
  id TEXT PRIMARY KEY,
  reservation_id TEXT NOT NULL REFERENCES stock_reservations(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  quantity BIGINT NOT NULL CHECK (quantity > 0)
);
CREATE INDEX IF NOT EXISTS idx_reservation_items_reservation ON stock_reservation_items(reservation_id);

CREATE TABLE IF NOT EXISTS low_stock_thresholds (
  id TEXT PRIMARY KEY,
  branch_id TEXT REFERENCES branches(id),
  product_id TEXT,
  variant_id TEXT,
  threshold BIGINT NOT NULL,
  updated_at TEXT NOT NULL
);

-- ===== Cart =====

CREATE TABLE IF NOT EXISTS carts (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id), -- NULL = Guest Cart
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cart_items (
  id TEXT PRIMARY KEY, -- lineId
  cart_id TEXT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_slug TEXT NOT NULL,
  product_name TEXT NOT NULL,
  category_label TEXT NOT NULL,
  sale_type TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  variant_label TEXT NOT NULL,
  packaging_id TEXT NOT NULL,
  packaging_label TEXT NOT NULL,
  quantity BIGINT NOT NULL CHECK (quantity > 0),
  unit_price_snapshot BIGINT NOT NULL,
  added_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);

-- ===== Addresses =====

CREATE TABLE IF NOT EXISTS addresses (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  full_address TEXT NOT NULL,
  city TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  is_default BIGINT NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);

-- ===== Orders =====
-- طبق الزام صریح Prompt («Order باید Snapshot اطلاعات مهم زمان خرید را نگه
-- دارد»)، order_items هرگز به products/product_variants Join نمی‌خورد برای
-- نمایش — تمام مقادیر نمایشی در همان لحظه سفارش کپی می‌شوند.

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  user_id TEXT REFERENCES users(id), -- NULL = Guest Order
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  address_full TEXT NOT NULL,
  address_city TEXT NOT NULL,
  address_lat DOUBLE PRECISION,
  address_lng DOUBLE PRECISION,
  subtotal BIGINT NOT NULL,
  discount_total BIGINT NOT NULL DEFAULT 0,
  delivery_fee BIGINT NOT NULL DEFAULT 0,
  delivery_fee_is_pending BIGINT NOT NULL DEFAULT 0,
  total BIGINT NOT NULL,
  delivery_method TEXT NOT NULL,
  branch_id TEXT NOT NULL REFERENCES branches(id),
  branch_name TEXT NOT NULL, -- Snapshot — تغییر نام آینده شعبه نباید سفارش‌های قدیمی را خراب کند
  -- ⚠️ اصلاح باگ واقعی (کشف‌شده با اجرای واقعی تست هنگام افزودن «پرداخت درب
  -- منزل» تجریش): این CHECK قبلاً فقط 'online' و 'cash_on_delivery' (با
  -- Underscore) را مجاز می‌دانست — یعنی حتی دو روش پرداخت دیگری که از قبل
  -- در نوع TypeScript وجود داشتند (`card-to-card`, `in-branch-pos`) هرگز
  -- واقعاً قابل ثبت نبودند و هر تلاش برای ثبت سفارش با آن‌ها با خطای
  -- CHECK constraint در پایگاه‌داده شکست می‌خورد — بدون این‌که تا امروز
  -- تستی این مسیر را عملاً اجرا کرده باشد. مقادیر اینجا اکنون دقیقاً با
  -- `PaymentMethod` در lib/types.ts (همراه با Hyphen، نه Underscore) یکی است.
  payment_method TEXT NOT NULL CHECK (payment_method IN ('online','card-to-card','cash-on-delivery','in-branch-pos')),
  -- وضعیت استاندارد سفارش طبق بخش ۶ Prompt 10
  status TEXT NOT NULL CHECK (status IN (
    'pending','payment_pending','paid','processing','preparing','ready',
    'out_for_delivery','delivered','cancelled','failed'
  )),
  -- ⚠️ اصلاح باگ واقعی دیگر (هم‌زمان با اصلاح payment_method بالا کشف شد):
  -- این مقادیر با PaymentStatus در lib/types.ts یکی نبودند —
  -- 'not_applicable' اینجا بود اما نوع واقعی 'not_required' است، و
  -- 'cancelled' اصلاً در این Constraint نبود. یعنی هر سفارشی با روش
  -- پرداخت غیرآنلاین (که paymentStatus آن به‌درستی 'not_required' محاسبه
  -- می‌شود) یا هر Cancel سفارش، در پایگاه‌داده با خطای CHECK شکست می‌خورد.
  payment_status TEXT NOT NULL CHECK (payment_status IN ('not_required','pending','succeeded','failed','cancelled')),
  eta_minutes_min BIGINT,
  eta_minutes_max BIGINT,
  created_at TEXT NOT NULL,
  cancel_deadline TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE
);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_branch ON orders(branch_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY, -- lineId
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL, -- بدون FK به products عمداً — Snapshot باید حتی اگر محصول بعداً حذف شود پابرجا بماند
  variant_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  variant_label TEXT NOT NULL,
  packaging_label TEXT NOT NULL,
  quantity BIGINT NOT NULL CHECK (quantity > 0),
  unit_price BIGINT NOT NULL,
  line_total BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

CREATE TABLE IF NOT EXISTS order_status_history (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  changed_by_id TEXT,
  changed_by_role TEXT,
  note TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_status_history_order ON order_status_history(order_id, created_at);

-- ===== Payments =====

CREATE TABLE IF NOT EXISTS payment_transactions (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  provider TEXT NOT NULL,
  method TEXT NOT NULL,
  amount BIGINT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending','succeeded','failed','refunded')),
  reference_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_payment_order ON payment_transactions(order_id);

-- ===== Discounts / Campaigns / Coupons (Schema آماده — منطق سرویس مرحله بعد) =====

CREATE TABLE IF NOT EXISTS discounts (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products(id),
  percent BIGINT,
  amount BIGINT,
  starts_at TEXT,
  ends_at TEXT
);

CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  starts_at TEXT,
  ends_at TEXT,
  is_active BIGINT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  campaign_id TEXT REFERENCES campaigns(id),
  percent BIGINT,
  amount BIGINT,
  max_uses BIGINT,
  used_count BIGINT NOT NULL DEFAULT 0,
  per_user_limit BIGINT,
  min_order_amount BIGINT,
  starts_at TEXT,
  ends_at TEXT,
  is_active BIGINT NOT NULL DEFAULT 1,
  created_at TEXT -- برای مرتب‌سازی «جدیدترین اول» (SQLite از rowid استفاده می‌کرد؛ PostgreSQL ندارد)
);

-- جلوگیری از Coupon Abuse: هر سفارش فقط یک‌بار می‌تواند یک کد مشخص را استفاده کند
CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id TEXT PRIMARY KEY,
  coupon_id TEXT NOT NULL REFERENCES coupons(id),
  order_id TEXT NOT NULL REFERENCES orders(id),
  user_id TEXT REFERENCES users(id),
  redeemed_at TEXT NOT NULL,
  UNIQUE (coupon_id, order_id)
);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_user ON coupon_redemptions(coupon_id, user_id);

-- ===== Reviews / Wishlist (Schema آماده) =====

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id),
  user_id TEXT REFERENCES users(id),
  rating BIGINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_approved BIGINT NOT NULL DEFAULT 0,
  deleted_at TEXT, -- حذف منطقی طبق بخش ۱۳ Prompt 11
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id, is_approved);

CREATE TABLE IF NOT EXISTS wishlists (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS wishlist_items (
  id TEXT PRIMARY KEY,
  wishlist_id TEXT NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  added_at TEXT NOT NULL,
  UNIQUE (wishlist_id, product_id)
);

-- ===== Notifications / SMS (Schema آماده) =====

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  type TEXT NOT NULL,
  payload TEXT,
  is_read BIGINT NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sms_logs (
  id TEXT PRIMARY KEY,
  to_mobile TEXT NOT NULL,
  template TEXT NOT NULL,
  status TEXT NOT NULL,
  provider_ref TEXT,
  created_at TEXT NOT NULL
);

-- ===== Contact Form (اضافه‌شده در مرحله UI/UX Audit) =====
-- پیام‌های فرم تماس (صفحه /contact). ذخیره ساده و امن در همان دیتابیس —
-- بدون نیاز به سرویس بیرونی. اطلاعات حساس (رمز، شماره کارت) هرگز اینجا
-- ذخیره نمی‌شود چون فرم اصلاً چنین فیلدی ندارد.
CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new', -- new | read | resolved
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at);

-- ===== Audit Log =====

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  before_json TEXT,
  after_json TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id, created_at DESC);

-- ===== Settings =====

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- عکس‌های آپلودشده از پنل ادمین (محتوای فایل داخل خود دیتابیس؛ رجوع به lib/server/uploads.ts)
CREATE TABLE IF NOT EXISTS uploaded_images (
  id TEXT PRIMARY KEY,
  mime TEXT NOT NULL,
  size BIGINT NOT NULL,
  data BYTEA NOT NULL,
  created_at TEXT NOT NULL
);

-- شعبه‌ای که محصول در آن فروخته می‌شود: 'all' = همه شعب، یا شناسه یک شعبه (مثلاً 'tajrish').
-- فروش آنلاین فقط از شعب دارای acceptsOnlineOrders انجام می‌شود؛ محصولی که فقط در یک شعبه غیرآنلاین
-- (مثل پیروزی) فروخته می‌شود، در فروشگاه آنلاین نمایش داده نمی‌شود.
ALTER TABLE products ADD COLUMN IF NOT EXISTS branch_scope TEXT NOT NULL DEFAULT 'all';

-- برچسب گروه‌های نوع فروش برای نمایش در صفحه محصول (JSON مثل {"weight":"کیلویی","count":"اسلایسی"}).
-- اگر خالی باشد، برچسب‌های پیش‌فرض (وزنی/عددی/جعبه‌ای) استفاده می‌شود.
ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_type_labels TEXT;
