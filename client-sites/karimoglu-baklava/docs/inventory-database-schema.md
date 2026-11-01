# ساختار پیشنهادی دیتابیس — سیستم مدیریت موجودی (Prompt 9)

> این سند نگاشت دقیق پیاده‌سازی فعلی (In-memory، در `lib/inventory/store.ts`)
> به یک دیتابیس رابطه‌ای واقعی (PostgreSQL پیشنهاد می‌شود) است. منطق سرویس
> (`lib/inventory/core.ts`) طوری نوشته شده که با جایگزینی لایه Store با یک
> Repository واقعی روی این جدول‌ها، بدون تغییر در امضای توابع کار کند.

## ۱. جدول‌ها و ستون‌ها

### `branch_inventory`
موجودی مستقل هر شعبه، به تفکیک محصول + Variant.

| ستون | نوع | توضیح |
|---|---|---|
| `id` | `uuid` PK | |
| `branch_id` | `uuid` FK → `branches.id` | |
| `product_id` | `uuid` FK → `products.id` | |
| `variant_id` | `uuid` FK → `product_variants.id` | |
| `on_hand` | `integer` | موجودی فیزیکی |
| `reserved` | `integer` | موجودی رزروشده |
| `sold` | `integer` | مجموع تجمعی فروخته‌شده (فقط گزارشی) |
| `updated_at` | `timestamptz` | |

- **UNIQUE** `(branch_id, product_id, variant_id)` — کلید طبیعی موجودی.
- **CHECK** `on_hand >= 0`
- **CHECK** `reserved >= 0`
- **CHECK** `reserved <= on_hand` — تضمین می‌کند هرگز بیشتر از موجودی فیزیکی رزرو نشود.
- **INDEX** روی `(product_id, variant_id)` — برای «خلاصه موجودی محصول در تمام شعب».
- **INDEX** روی `(branch_id)` — برای «موجودی شعبه» در پنل مدیریت.

موجودی قابل‌فروش (`available`) هرگز ستون مستقل نیست؛ همیشه به‌صورت
`GENERATED ALWAYS AS (on_hand - reserved) STORED` یا در لایه Query محاسبه
می‌شود — تا هرگز با تغییرات همزمان Desync نشود.

### `warehouse_inventory`
موجودی انبار مرکزی — عمداً از `branch_inventory` جدا (طبق الزام صریح Prompt).

| ستون | نوع |
|---|---|
| `id` | `uuid` PK |
| `warehouse_id` | `uuid` FK → `warehouses.id` |
| `product_id` | `uuid` FK |
| `variant_id` | `uuid` FK |
| `on_hand` | `integer`, `CHECK (on_hand >= 0)` |
| `updated_at` | `timestamptz` |

**UNIQUE** `(warehouse_id, product_id, variant_id)`.

### `inventory_transactions`
Audit Trail — منبع حقیقت برای «چه کسی/چه چیزی/قبل/بعد/چرا/چه‌زمانی».

| ستون | نوع |
|---|---|
| `id` | `uuid` PK |
| `type` | `enum` (`manual_entry`, `manual_adjustment`, `reservation_created`, `reservation_released`, `sale_committed`, `order_cancelled`, `warehouse_receipt`, `warehouse_transfer_out`, `branch_transfer_in`, `correction`) |
| `branch_id` | `uuid` FK nullable |
| `warehouse_id` | `uuid` FK nullable |
| `product_id` | `uuid` FK |
| `variant_id` | `uuid` FK |
| `on_hand_delta` | `integer` |
| `on_hand_before` / `on_hand_after` | `integer` |
| `reserved_before` / `reserved_after` | `integer` |
| `order_id` | `uuid` FK nullable → `orders.id` |
| `actor_id` | `text` |
| `actor_role` | `text` |
| `reason` | `text` nullable |
| `created_at` | `timestamptz` |

این جدول **Append-only** است — هیچ `UPDATE`/`DELETE` روی آن مجاز نیست
(اجرا با یک `REVOKE UPDATE, DELETE` در سطح دیتابیس برای نقش برنامه، به‌جز
Migration/Superuser). این دقیقاً همان الزام «Audit نباید به‌راحتی توسط
کاربران عادی قابل دستکاری باشد» را برآورده می‌کند.

- **INDEX** `(branch_id, product_id, variant_id, created_at DESC)` — پرسش رایج «تاریخچه یک SKU در یک شعبه».
- **INDEX** `(order_id)` — پرسش «تمام تراکنش‌های موجودی یک سفارش».
- **INDEX** `(created_at DESC)` — برای فیلتر بازه تاریخ در پنل مدیریت.

### `inventory_reservations`
رزرو کل سبد یک سفارش، به‌عنوان یک واحد.

| ستون | نوع |
|---|---|
| `id` | `uuid` PK |
| `order_id` | `uuid` UNIQUE FK → `orders.id` |
| `branch_id` | `uuid` FK |
| `status` | `enum` (`active`, `released`, `committed`, `expired`) |
| `created_at` | `timestamptz` |
| `expires_at` | `timestamptz` nullable |
| `released_at` | `timestamptz` nullable |
| `committed_at` | `timestamptz` nullable |
| `release_reason` | `text` nullable |

### `inventory_reservation_items`
اقلام هر رزرو (رابطه یک‌به‌چند با `inventory_reservations`).

| ستون | نوع |
|---|---|
| `id` | `uuid` PK |
| `reservation_id` | `uuid` FK → `inventory_reservations.id` |
| `product_id` | `uuid` FK |
| `variant_id` | `uuid` FK |
| `quantity` | `integer`, `CHECK (quantity > 0)` |

**INDEX** `(status, expires_at)` روی `inventory_reservations` — برای Job آینده «آزادسازی خودکار رزروهای منقضی» (TODO؛ فعلاً چنین Jobی وجود ندارد).

### `low_stock_thresholds`

| ستون | نوع |
|---|---|
| `id` | `uuid` PK |
| `branch_id` | `uuid` FK nullable (`null` = همه شعب) |
| `product_id` | `uuid` FK nullable (`null` = همه محصولات) |
| `variant_id` | `uuid` FK nullable |
| `threshold` | `integer` |
| `updated_at` | `timestamptz` |

**UNIQUE** `(branch_id, product_id, variant_id)` (با NULL بودن به‌عنوان بخشی از کلید ترکیبی).

### RBAC — `roles`, `permissions`, `role_permissions`, `admin_users`
جدول‌های استاندارد RBAC. در پیاده‌سازی فعلی (بدون Auth واقعی)، این به‌صورت
یک نگاشت ثابت در کد (`lib/inventory/rbac.ts`) شبیه‌سازی شده؛ در فاز اتصال
Auth واقعی باید به جدول واقعی منتقل شود تا نقش‌ها از پنل مدیریت قابل تغییر
باشند.

## ۲. روابط (ERD خلاصه)

```
products 1───* product_variants
products 1───* branch_inventory *───1 branches
products 1───* warehouse_inventory *───1 warehouses
branch_inventory  1───* inventory_transactions
warehouse_inventory 1───* inventory_transactions
orders 1───1 inventory_reservations 1───* inventory_reservation_items
orders 1───* inventory_transactions
admin_users *───* roles *───* permissions
```

## ۳. مرز تراکنش (Transaction Boundary)

عملیات‌هایی که باید در **یک تراکنش دیتابیسی واحد** اجرا شوند (BEGIN...COMMIT):

1. **رزرو سبد سفارش**: برای هر قلم سبد، یک
   `UPDATE branch_inventory SET reserved = reserved + :qty
    WHERE branch_id=:b AND product_id=:p AND variant_id=:v
      AND (on_hand - reserved) >= :qty`
   اگر Affected Rows هر کدام صفر بود → کل تراکنش `ROLLBACK`، هیچ `INSERT`ی در
   `inventory_transactions`/`inventory_reservations` باقی نمی‌ماند. برای
   جلوگیری از Deadlock، ردیف‌ها باید به ترتیب ثابت (`ORDER BY product_id,
   variant_id`) قفل شوند.
2. **فروش قطعی (Commit)**: `UPDATE ... SET on_hand = on_hand - qty, reserved
   = reserved - qty, sold = sold + qty` برای هر قلم رزرو + `UPDATE
   inventory_reservations SET status='committed'` — یک تراکنش واحد.
3. **آزادسازی رزرو**: مشابه، یک تراکنش واحد برای همه اقلام + بروزرسانی وضعیت رزرو.
4. **انتقال انبار→شعبه**: کاهش `warehouse_inventory` و افزایش
   `branch_inventory` باید در یک تراکنش باشند (در غیر این صورت، شکست جزئی
   می‌تواند کالا را «گم» کند).

## ۴. ایندکس‌های کلیدی برای عملکرد

- Compound Index `(branch_id, product_id, variant_id)` روی `branch_inventory` (از طریق UNIQUE constraint رایگان به دست می‌آید).
- Index `(product_id)` مستقل روی `branch_inventory` برای Queryهای Cross-branch.
- Index `(order_id)` روی `inventory_transactions` و `inventory_reservations`.
- Index زمانی نزولی روی `inventory_transactions.created_at` برای صفحه‌بندی تاریخچه.
- هیچ Cache‌ای روی مقادیر موجودی/قابل‌فروش قرار نمی‌گیرد (طبق الزام صریح Prompt).
