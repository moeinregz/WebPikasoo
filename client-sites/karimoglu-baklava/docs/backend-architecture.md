# معماری Backend — «باقلوا کریم اغلو» (Prompt 10)

این سند خروجی مستندسازی بخش ۱۹ Prompt 10 است (موارد ۱ تا ۱۳). پیاده‌سازی
واقعی مطابق این سند در کد انجام شده؛ جزئیات پیاده‌سازی و آنچه هنوز TODO است
در گزارش پایانی چت (نه این فایل) خلاصه شده.

━━━━━━━━━━━━━━━━━━━━
۱. معماری Backend
━━━━━━━━━━━━━━━━━━━━

**Modular Monolith** — طبق ترجیح صریح Prompt. دلیل عدم انتخاب Microservices:
پروژه یک فروشگاه تک‌برند با ~۶ شعبه و ~۱۰۰ محصول است؛ پیچیدگی عملیاتی
Microservices (Service Discovery، Distributed Transaction برای رزرو
موجودی، Network Latency بین سرویس‌ها) هیچ فایده‌ای برای این مقیاس ندارد و
دقیقاً مشکلی که Prompt Section 5 نگرانش است (رزرو موجودی Race-free) را در
یک معماری توزیع‌شده حل کردن بسیار سخت‌تر می‌شود.

لایه‌بندی هر ماژول (الگوی یکسان در کل پروژه):

```
Route Handler (app/api/**)         ← اعتبارسنجی ورودی + احراز هویت/RBAC
  → Service (lib/**/*.ts)          ← منطق کسب‌وکار، Transaction Boundary
    → Repository (lib/**/*Repo.ts) ← SQL خام (node:sqlite)، بدون منطق کسب‌وکار
      → SQLite (lib/db/schema.sql)
```

ماژول‌های پیاده‌سازی‌شده (کد واقعی، تست‌شده):

| ماژول | وضعیت |
|---|---|
| Authentication | ✅ واقعی (موبایل+رمز، Session Cookie) |
| Users / Roles / Permissions | ✅ واقعی (RBAC مبتنی بر دیتابیس) |
| Products / Categories / Variants / Packaging | ⚠️ Schema واقعی + Seed از کاتالوگ فعلی؛ محتوای واقعی محصولات هنوز از `lib/mock-data.ts` می‌آید |
| Pricing | ✅ واقعی (`lib/pricing.ts`، از Prompt 7) |
| Cart / Checkout | ✅ واقعی (`lib/cart/*`، از Prompt 7) |
| Orders / Order Items | ✅ واقعی، روی SQL، با Snapshot و Status History |
| Branches | ✅ واقعی (Seed‌شده در DB) |
| Inventory / Warehouse / Stock Reservation | ✅ واقعی، روی SQL، Transaction-Safe |
| Smart Branch Engine | ✅ واقعی (از Prompt 8، بدون تغییر معماری) |
| Delivery | ✅ Formula واقعی (از Prompt 8)، Zone دقیق TODO |
| Payments | ✅ Abstraction واقعی + Provider Mock |
| Discounts / Coupons / Campaigns | ⚠️ فقط Schema — منطق سرویس مرحله بعد |
| Reviews / Wishlist | ⚠️ فقط Schema |
| Notifications / SMS | ⚠️ فقط Schema |
| Reports | ⚠️ پیاده نشده |
| Admin | ✅ واقعی برای Inventory؛ سایر بخش‌ها مرحله بعد |
| Audit Logs | ✅ برای موجودی (InventoryTransaction) و سفارش (OrderStatusHistory)؛ Audit عمومی (`audit_logs`) فقط Schema |
| Settings | ⚠️ فقط Schema |

━━━━━━━━━━━━━━━━━━━━
۲. Database Schema
━━━━━━━━━━━━━━━━━━━━

فایل کامل: `lib/db/schema.sql` (اجرا‌شده، تست‌شده). موتور: **SQLite واقعی**
از طریق ماژول توکار Node.js به نام `node:sqlite` — نه یک شبیه‌سازی حافظه.

**چرا SQLite و نه PostgreSQL؟** محیط اجرای این پروژه (Sandbox توسعه) به
هیچ سرور دیتابیس یا رجیستری Binary خارجی (مثل Prisma Engines، که از
`binaries.prisma.sh` دانلود می‌شوند) دسترسی شبکه ندارد — فقط رجیستری‌های
npm/pip در دسترس‌اند. بین «شبیه‌سازی یک دیتابیس با Map حافظه» (که خودِ
Prompt 9 آن را موقتی اعلام کرده بود) و «یک SQL Engine واقعی و کاملاً
Embedded»، گزینه دوم انتخاب شد: `node:sqlite` تراکنش، Constraint، Index و
Isolation واقعی SQL را می‌دهد، بدون هیچ وابستگی خارجی. Schema عمداً نزدیک
به SQL استاندارد نوشته شده تا Migration به PostgreSQL در آینده (فقط با
تغییرات نحوی جزئی) ساده باشد.

فهرست کامل جدول‌ها در `schema.sql` مستند است؛ خلاصه دسته‌بندی:

- **Auth/RBAC**: `users`, `roles`, `permissions`, `role_permissions`, `user_roles`, `sessions`
- **کاتالوگ**: `categories`, `products`, `product_categories`, `product_variants`, `product_prices`, `packaging_options`, `product_packaging`, `product_images`
- **شعب/انبار**: `branches`, `branch_working_hours`, `branch_delivery_zones`, `warehouses`
- **موجودی**: `branch_inventory`, `warehouse_inventory`, `inventory_transactions`, `stock_reservations`, `stock_reservation_items`, `low_stock_thresholds`
- **سبد/آدرس**: `carts`, `cart_items`, `addresses`
- **سفارش**: `orders`, `order_items`, `order_status_history`
- **پرداخت**: `payment_transactions`
- **تخفیف**: `discounts`, `campaigns`, `coupons`, `coupon_redemptions`
- **نظر/علاقه‌مندی**: `reviews`, `wishlists`, `wishlist_items`
- **اعلان**: `notifications`, `sms_logs`
- **Audit/تنظیمات**: `audit_logs`, `settings`

**نکته صادقانه مهم درباره FK**: در محیط Production، تمام FKهای تعریف‌شده در
Schema فعال‌اند (`PRAGMA foreign_keys = ON`). فقط در محیط تست خودکار
(Vitest)، این Pragma خاموش است — چون مجموعه تست‌های موجود از Prompt 8/9
عمداً از شناسه‌های Synthetic ایزوله (مثل `"branch-a"`) استفاده می‌کنند که در
جدول‌های Seed‌شده واقعی وجود ندارند. این یک تصمیم آگاهانه برای حفظ ارزش
تست‌های موجود بدون بازنویسی کامل آن‌هاست، نه یک ضعف در Schema.

همچنین سه FK عمداً حذف شده‌اند (`inventory_transactions.order_id`,
`stock_reservations.order_id`, و `order_items.product_id`) چون این سطرها
قبل از وجود ردیف `orders` متناظر نوشته می‌شوند (رزرو موجودی قبل از ثبت نهایی
سفارش، برای Fail-Fast) یا باید حتی پس از حذف/تغییر محصول واقعی دست‌نخورده
بمانند (Snapshot).

━━━━━━━━━━━━━━━━━━━━
۳. روابط Entityها (ERD خلاصه)
━━━━━━━━━━━━━━━━━━━━

```
users 1───* user_roles *───1 roles *───* permissions (via role_permissions)
users 1───* sessions
users 1───* orders (nullable — Guest Order)
users 1───* addresses
users 1───1 carts (nullable user_id — Guest Cart)

categories 1───* products 1───* product_variants 1───* product_prices
products *───* packaging_options (via product_packaging)
products 1───* product_images

branches 1───* branch_inventory *───1 (products, product_variants)
warehouses 1───* warehouse_inventory
branch_inventory/warehouse_inventory 1───* inventory_transactions
orders 1───1 stock_reservations 1───* stock_reservation_items

orders 1───* order_items (Snapshot — بدون FK به products)
orders 1───* order_status_history
orders 1───* payment_transactions

campaigns 1───* coupons 1───* coupon_redemptions *───1 orders
products 1───* reviews
users 1───1 wishlists 1───* wishlist_items *───1 products
```

━━━━━━━━━━━━━━━━━━━━
۴. فهرست کامل API
━━━━━━━━━━━━━━━━━━━━

**تصمیم معماری مهم که باید توضیح داده شود (طبق قانون ۱۷ Prompt ۱):** Prompt
۱۰ صراحتاً API Versioned (`/api/v1/...`) می‌خواهد، اما تمام APIهای موجود از
Prompt 7 تا 9 (که Frontend همین پروژه به آن‌ها وابسته است) روی مسیرهای
Unversioned (`/api/orders`, `/api/cart/...`) ساخته شده‌اند. تغییر این
مسیرها یعنی شکستن Frontend موجود بدون هیچ فایده عملی (چون فعلاً فقط یک
نسخه از API وجود دارد). **تصمیم**: مسیرهای موجود دست‌نخورده می‌مانند (این‌جا
هم به‌عنوان v1 منطقی مستند شده‌اند)؛ APIهای *جدید*ی که در همین Prompt اضافه
شدند (`/api/auth/*`, `/api/inventory/*`) هم به همین دلیل هماهنگی با معماری
Blueprint موجود، Unversioned ساخته شدند. اگر/وقتی نسخه دوم واقعی API لازم
شود (مثلاً App موبایل جدا)، پیشنهاد می‌شود مسیرهای جدید زیر `/api/v1/` و
مسیرهای فعلی به‌عنوان Alias موقت نگه داشته شوند.

### Auth (جدید — Prompt 10)
| Method | Endpoint | Auth | توضیح |
|---|---|---|---|
| POST | `/api/auth/register` | Same-origin | ثبت‌نام مشتری با موبایل+رمز |
| POST | `/api/auth/login` | Same-origin | ورود، صدور Session Cookie |
| POST | `/api/auth/logout` | Same-origin | ابطال Session |
| GET | `/api/auth/me` | Session (اختیاری) | وضعیت فعلی کاربر لاگین‌شده |

### Inventory (Prompt 9، به‌روزشده با RBAC واقعی در Prompt 10)
| Method | Endpoint | Auth | Permission |
|---|---|---|---|
| GET | `/api/inventory/branches/[branchId]` | Session | `inventory.view` |
| GET | `/api/inventory/products/[productId]` | Session | `inventory.view` |
| POST | `/api/inventory/adjust` | Session + Same-origin | `inventory.adjust` (+ Scope شعبه) |
| POST | `/api/inventory/receive` | Session + Same-origin | `inventory.receive` |
| POST | `/api/inventory/transfer` | Session + Same-origin | `inventory.transfer` |
| GET | `/api/inventory/history` | Session | `inventory.history.view` |
| GET | `/api/inventory/low-stock` | Session | `inventory.view` |
| GET | `/api/inventory/summary` | Session | `inventory.view` |
| GET/POST | `/api/inventory/thresholds` | Session | `inventory.view` / `inventory.thresholds.manage` |
| POST | `/api/inventory/check-batch` | Same-origin | — (داخلی/بدون داده حساس) |
| POST | `/api/inventory/product-availability` | Same-origin | — (Public-safe، بدون عدد دقیق موجودی) |

### Cart / Branch-selection (Prompt 7/8، بدون تغییر)
`POST /api/cart/validate`, `POST /api/cart/price`, `POST /api/cart/resolve-branch`,
`POST /api/branch-selection/select`, `POST /api/branch-selection/validate-manual`

### Orders / Payments (Prompt 7، Prompt 10 آن‌ها را روی SQL واقعی برد)
`POST /api/orders`, `GET /api/orders/[id]`, `POST /api/orders/[id]/cancel`,
`POST /api/payments/initiate`, `POST /api/payments/verify`

هر Endpoint در کد خودش Request/Response/Validation/Error را با
`jsonError`/Zod-like دستی مستند می‌کند (فایل‌های Route Handler).

━━━━━━━━━━━━━━━━━━━━
۵. معماری Authentication
━━━━━━━━━━━━━━━━━━━━

**تناقض حل‌شده (باید صریح باشد):** «ورود با موبایل» بدون OTP به‌تنهایی هیچ
اثبات مالکیت شماره نیست (هرکسی می‌تواند ادعای مالکیت شماره دیگری را بکند).
چون Prompt صریحاً OTP را غیرفعال نگه داشته، راهکار: موبایل = نام‌کاربری،
Password = اثبات مالکیت حساب (نه شماره). این با بخش Prompt که «اگر Password
وجود دارد باید Hash شود» همخوانی دارد.

- Hash رمز: `scrypt` توکار Node.js (فرمت `salt:hash`)، بدون وابستگی خارجی.
- Session: توکن تصادفی ۳۲ بایتی، فقط SHA-256 آن در دیتابیس (`sessions.token_hash`)
  ذخیره می‌شود — نه خود توکن.
- Cookie: `HttpOnly`, `SameSite=Lax`, `Secure` (در Production)، انقضای ۳۰ روزه.
- Guest Checkout: فعال — سفارش بدون نیاز به `user_id` ثبت می‌شود (`orders.user_id NULL`).
- OTP: TODO معماری‌آماده — افزودن آن نیازی به تغییر جدول `users` ندارد (فقط یک
  روش ورود موازی، نه جایگزین).

━━━━━━━━━━━━━━━━━━━━
۶. RBAC
━━━━━━━━━━━━━━━━━━━━

نقش‌ها (`lib/auth/rbac.ts`، منبع حقیقت واحد):

| نقش | معادل Prompt | دسترسی |
|---|---|---|
| `site_admin` | Super Admin / Website Designer | همه Permissionها |
| `ceo` | General Manager | همه Permissionها |
| `branch_manager` | Branch Manager | View/Adjust موجودی **فقط شعبه خودش**، View/Update سفارش |
| `warehouse_staff` | Warehouse Staff | View موجودی، Receive/Transfer انبار |
| `cashier` | Cashier / Order Operator | فقط View موجودی و سفارش |

**ارتقای امنیتی کلیدی نسبت به Prompt 9**: تشخیص نقش دیگر از هدر HTTP
قابل‌جعل (`x-actor-role`) نمی‌آید — از `getActorFromRequest` که Session
Cookie را در دیتابیس Lookup می‌کند. تست مشخص این را تأیید می‌کند: کلاینتی که
هدر `x-actor-role: site_admin` می‌فرستد اما Session واقعی‌اش نقشی ندارد، رد
می‌شود (`lib/auth/__tests__/rbac.test.ts`).

محدودیت Scope شعبه‌ای (`canActOnBranch`) به‌صورت جداگانه در هر Route
حساس (مثل `/api/inventory/adjust`) بررسی می‌شود، نه فقط در سطح Permission
کلی — چون «مدیر شعبه» و «ادمین سایت» هر دو `inventory.adjust` دارند اما
دامنه‌شان فرق دارد.

━━━━━━━━━━━━━━━━━━━━
۷. معماری Inventory
━━━━━━━━━━━━━━━━━━━━

بدون تغییر مفهومی نسبت به Prompt 9 (به آن سند + `docs/inventory-database-schema.md`
مراجعه شود)؛ تنها تغیر Prompt 10: پیاده‌سازی از Map حافظه به SQL واقعی
منتقل شد (`lib/inventory/core.ts`)، با همان امضای توابع. رزرو/آزادسازی/فروش
حالا داخل تراکنش SQL واقعی (`BEGIN IMMEDIATE ... COMMIT`) اجرا می‌شوند —
یعنی ضمانت جلوگیری از Overselling حالا واقعاً سطح دیتابیس است، نه فقط سطح
فرآیند Node.js.

━━━━━━━━━━━━━━━━━━━━
۸. معماری Order
━━━━━━━━━━━━━━━━━━━━

وضعیت استاندارد (طبق بخش ۶ Prompt 10):

```
pending → payment_pending → paid → processing → preparing → ready
  → out_for_delivery → delivered
                                  ↘ cancelled (فقط در ۵ دقیقه اول)
                       ↘ failed (شکست پرداخت)
```

نگاشت با رفتار قبلی: سفارش با پرداخت آنلاین از `payment_pending` شروع
می‌شود (قبلاً `pending_payment`)؛ سفارش نقدی/COD مستقیم به `processing` می‌رود
(قبلاً `confirmed`)؛ پرداخت موفق: `payment_pending` → `paid`.

**Snapshot** (طبق الزام صریح): `order_items` شامل `product_name`,
`variant_label`, `packaging_label`, `unit_price`, `quantity`, `line_total`
است و **هرگز** به `products`/`product_variants` Join نمی‌خورد برای نمایش —
تغییر بعدی محصول اثری روی سفارش‌های قبلی ندارد (تست‌شده در
`lib/server/__tests__/orderRepo.test.ts`).

**OrderStatusHistory**: هر تغییر وضعیت (چه خودکار — ایجاد سفارش، پرداخت
موفق/ناموفق — چه دستی توسط ادمین) یک ردیف در `order_status_history` ثبت
می‌کند، شامل `changed_by_id`/`changed_by_role` (برای تغییرات خودکار سیستم،
`NULL`؛ برای تغییرات دستی، شناسه/نقش ادمین).

━━━━━━━━━━━━━━━━━━━━
۹. معماری Payment
━━━━━━━━━━━━━━━━━━━━

Abstraction در `lib/payment/types.ts` + `lib/payment/registry.ts` (از
Prompt 7، بدون تغییر معماری). Provider واقعی هنوز مشخص نشده (طبق دستور
صریح Prompt، حدس زده نشده) — فقط `mock-gateway` پیاده‌سازی شده، پشت همان
Interface. افزودن Provider واقعی فقط نیاز به یک فایل جدید در `lib/payment/`
دارد که همان Interface را پیاده کند و در `registry.ts` ثبت شود.

Idempotency: `payment_transactions.id` به‌عنوان کلید یکتای عملیات؛
Callback/Verify تکراری بی‌اثر است (رفتار قبلاً در Prompt 7 تضمین شده،
اکنون روی جدول واقعی).

━━━━━━━━━━━━━━━━━━━━
۱۰. اتصال به Smart Branch Engine
━━━━━━━━━━━━━━━━━━━━

بدون تغییر (Prompt 8). Backend مرجع نهایی است؛ Frontend فقط سبد/آدرس/روش
ارسال را می‌فرستد، شعبه/هزینه ارسال/موجودی همیشه توسط
`selectBranchForOrder` (که خودش از `lib/inventory/core.ts` واقعی می‌خواند)
محاسبه می‌شود.

━━━━━━━━━━━━━━━━━━━━
۱۱. Security Checklist
━━━━━━━━━━━━━━━━━━━━

| تهدید | وضعیت |
|---|---|
| SQL Injection | ✅ تمام Queryها Parameterized (`?` placeholders)، هرگز String Concatenation |
| XSS | ✅ React به‌صورت پیش‌فرض Escape می‌کند؛ هیچ `dangerouslySetInnerHTML` در کد جدید |
| CSRF | ✅ `assertSameOrigin` روی تمام Route‌های تغییردهنده (از Prompt 7) |
| Mass Assignment | ✅ هر Route فقط فیلدهای مشخص را از Body می‌خواند، نه Spread کامل |
| Price/Quantity/Branch Tampering | ✅ Backend همیشه از کاتالوگ/موجودی واقعی محاسبه می‌کند (`lib/pricing.ts`, `lib/inventory/core.ts`)، هرگز از ورودی کلاینت |
| Coupon Abuse | ⚠️ Schema آماده (`coupon_redemptions` با UNIQUE) — منطق سرویس هنوز پیاده نشده |
| Duplicate Order/Payment | ✅ `idempotency_key` UNIQUE روی `orders`؛ Idempotent بودن `reserveForOrder`/Payment Verify |
| Password Storage | ✅ `scrypt` + Salt تصادفی |
| Session Hijacking | ✅ فقط Hash توکن ذخیره می‌شود؛ `HttpOnly`+`SameSite`+`Secure` |
| Role Spoofing | ✅ نقش از دیتابیس (Session)، نه از هدر کلاینت |
| Sensitive Data in Logs | ⚠️ باید بازبینی شود قبل از Production (رمز عبور هرگز Log نمی‌شود؛ بررسی کامل‌تر لازم) |
| Rate Limiting / Brute Force | ❌ TODO — هنوز پیاده نشده (باید قبل از Production روی `/api/auth/login` اضافه شود) |

━━━━━━━━━━━━━━━━━━━━
۱۲. Testing Strategy
━━━━━━━━━━━━━━━━━━━━

Vitest، ۷۳ تست (`npx vitest run` سبز):

- **Unit**: `lib/inventory/__tests__/core.test.ts` (منطق موجودی)، `lib/auth/__tests__/rbac.test.ts` (Permission mapping)
- **Integration/DB**: همان فایل‌ها + `lib/server/__tests__/orderRepo.test.ts` — روی SQLite واقعی (`:memory:` در تست)، نه Mock
- **Concurrency**: رزرو هم‌زمان آخرین واحد موجودی (`core.test.ts`) — با تراکنش SQL واقعی
- **Auth/RBAC**: جعل نقش از طریق هدر رد می‌شود؛ Session منقضی بی‌اثر است
- **API**: پوشش از طریق تست‌های Service (که مستقیماً همان مسیر Route Handler را فراخوانی می‌کنند) + Smoke Test دستی end-to-end (سفارش → پرداخت → Restart سرور → بررسی ماندگاری) در طول توسعه
- **Order**: Snapshot، Idempotency، Status History (`orderRepo.test.ts`)

TODO تست: Coupon abuse، Refund، E2E مرورگر (Playwright/Cypress) — هنوز اضافه نشده.

━━━━━━━━━━━━━━━━━━━━
۱۳. ساختار پوشه پروژه (خلاصه بخش‌های جدید Prompt 10)
━━━━━━━━━━━━━━━━━━━━

```
lib/
  db/
    schema.sql          # کل Schema رابطه‌ای
    client.ts           # اتصال SQLite + Transaction Helper
    seed.ts              # Seed کاتالوگ/شعب/RBAC/ادمین پیش‌فرض
    bootstrap.ts         # Side-effect import برای تضمین Seed شدن
  auth/
    rbac.ts              # نقش‌ها/مجوزها/Session-based Actor
    session.ts           # ساخت/اعتبارسنجی Session Token
    passwords.ts          # Hash/Verify رمز عبور
    service.ts            # ثبت‌نام/ورود/انتساب نقش
  inventory/
    core.ts               # سرویس مرکزی موجودی (حالا روی SQL)
    store.ts               # Seed موجودی اولیه
    types.ts, rbac.ts (re-export)
  server/
    orderRepo.ts           # Repository سفارش (SQL)
    paymentRepo.ts          # Repository پرداخت (SQL)
    orderService.ts          # منطق ایجاد سفارش (بدون تغییر معماری)
app/
  api/
    auth/{register,login,logout,me}/route.ts
    inventory/**            # از Prompt 9، حالا RBAC واقعی
    orders/**, payments/**  # از Prompt 7، حالا روی DB واقعی
  admin/
    login/page.tsx          # ورود پنل مدیریت
    inventory/**             # از Prompt 9
docs/
  inventory-database-schema.md   # از Prompt 9
  backend-architecture.md         # همین فایل
```
