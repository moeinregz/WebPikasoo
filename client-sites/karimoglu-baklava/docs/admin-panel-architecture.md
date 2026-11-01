# معماری پنل مدیریت — «باقلوا کریم اغلو» (Prompt 11)

خروجی مستندسازی بخش ۱۹ (موارد ۱ تا ۱۰). پیاده‌سازی واقعی مطابق این سند
انجام شده؛ آنچه هنوز ناقص/TODO است در پایان همین سند و در گزارش چت صریحاً
فهرست شده.

━━━━━━━━━━━━━━━━━━━━
۱. Sitemap پنل
━━━━━━━━━━━━━━━━━━━━

```
/admin/login                          ورود (تنها صفحه خارج از محافظ)
/admin                                داشبورد
/admin/orders                         لیست سفارش‌ها
/admin/orders/[id]                    جزئیات سفارش + Timeline + تغییر وضعیت
/admin/products                       لیست محصولات
/admin/products/new                   ایجاد محصول
/admin/products/[id]                  ویرایش محصول + حذف منطقی
/admin/inventory                      نمای کلی موجودی
/admin/inventory/branch/[branchId]    موجودی شعبه + اصلاح دستی
/admin/inventory/history              تاریخچه/Audit موجودی
/admin/branches                       مدیریت شعب
/admin/users                          کاربران + انتساب نقش + Role/Permission Matrix
/admin/reports                        گزارش‌های فروش/محصول/سفارش
/admin/coupons                        کوپن و کمپین
/admin/reviews                        بررسی نظرات
/admin/notifications                  اعلان‌ها و لاگ پیامک
/admin/audit-logs                     گزارش تغییرات حساس
/admin/settings                       تنظیمات
/admin/branch-selection               ابزار تست موتور انتخاب شعبه (از Prompt 8)
```

━━━━━━━━━━━━━━━━━━━━
۲. ساختار ناوبری
━━━━━━━━━━━━━━━━━━━━

`app/admin/(protected)/layout.tsx` + `components/admin/AdminSidebar.tsx`.

ساختار مسیرها عمداً با یک Route Group به نام `(protected)` جدا شده تا
`/admin/login` خودش زیر محافظ ورود نرود (وگرنه حلقه بی‌نهایت Redirect
ایجاد می‌شد).

ناوبری بر اساس Permission فیلتر می‌شود: هر آیتم منو یک `permission` دارد و
فقط وقتی نمایش داده می‌شود که نقش کاربر آن را داشته باشد. **اما این فقط
UX است** — بخش ۵ همین سند توضیح می‌دهد که چرا این به‌تنهایی امنیت نیست.

━━━━━━━━━━━━━━━━━━━━
۳. Role / Permission Matrix
━━━━━━━━━━━━━━━━━━━━

منبع حقیقت: `lib/auth/rolesData.ts`. همین جدول به‌صورت زنده در
`/admin/users` هم رندر می‌شود.

| مجوز | Super Admin | مدیرعامل | مدیر شعبه | انبار | صندوقدار |
|---|:--:|:--:|:--:|:--:|:--:|
| inventory.view | ✓ | ✓ | ✓ | ✓ | ✓ |
| inventory.adjust | ✓ | ✓ | ✓ (فقط شعبه خود) | — | — |
| inventory.receive | ✓ | ✓ | — | ✓ | — |
| inventory.transfer | ✓ | ✓ | — | ✓ | — |
| inventory.history.view | ✓ | ✓ | ✓ | ✓ | — |
| inventory.thresholds.manage | ✓ | ✓ | — | — | — |
| inventory.reservation.override | ✓ | ✓ | — | — | — |
| orders.view | ✓ | ✓ | ✓ (فقط شعبه خود) | — | ✓ |
| orders.update_status | ✓ | ✓ | ✓ (فقط شعبه خود) | — | — |
| products.manage | ✓ | ✓ | — | — | — |
| branches.manage | ✓ | ✓ | — | — | — |
| users.manage | ✓ | ✓ | — | — | — |
| coupons.manage | ✓ | ✓ | — | — | — |
| reviews.manage | ✓ | ✓ | — | — | — |
| notifications.view | ✓ | ✓ | — | — | — |
| reports.view | ✓ | ✓ | ✓ | — | — |
| settings.manage | ✓ | ✓ | — | — | — |
| audit.view | ✓ | ✓ | — | — | — |

محدودیت شعبه‌ای (`canActOnBranch`) جداگانه اعمال می‌شود: مدیر شعبه حتی با
داشتن `inventory.adjust`/`orders.update_status`، فقط روی شعبه خودش
می‌تواند عمل کند — در `/api/inventory/adjust` و
`/api/admin/orders/[id]/status` تست‌شده.

━━━━━━━━━━━━━━━━━━━━
۴. معماری داشبورد
━━━━━━━━━━━━━━━━━━━━

`lib/server/reportsRepo.ts` → `app/admin/(protected)/page.tsx`.

تمام اعداد با SQL Aggregate مستقیم روی جدول‌های واقعی `orders` /
`order_items` محاسبه می‌شوند — هیچ عدد Mock یا ثابتی وجود ندارد. اگر هنوز
سفارشی ثبت نشده باشد، همه‌چیز صفر برمی‌گردد و Empty State نمایش داده
می‌شود (نه یک عدد ساختگی).

فروش فقط از سفارش‌هایی شمرده می‌شود که در وضعیت‌های
`paid/processing/preparing/ready/out_for_delivery/delivered` باشند —
سفارش لغوشده یا ناموفق در فروش نمی‌آید.

━━━━━━━━━━━━━━━━━━━━
۵. مدل امنیتی (Defense in Depth — سه لایه)
━━━━━━━━━━━━━━━━━━━━

طبق الزام صریح Prompt: «کاربر نباید صرفاً با مخفی‌شدن دکمه‌ها محدود شود».
سه لایه مستقل پیاده شده:

1. **لایه ناوبری (UX)** — آیتم منو بر اساس Permission فیلتر می‌شود.
   به‌تنهایی امنیت نیست؛ فقط شلوغی را کم می‌کند.
2. **لایه صفحه (Server Component)** — `requirePageAccess(permission)` در
   `lib/auth/adminGuard.ts`. اگر کاربری مستقیماً URL را باز کند، همان‌جا
   `AccessDenied` می‌بیند. تست زنده: صندوقدار روی `/admin/products` →
   «دسترسی ندارید».
3. **لایه API (Backend)** — `requirePermission(request, permission)` روی
   هر Route تغییردهنده. تست زنده: صندوقدار روی
   `POST /api/admin/products` → **403**.

علاوه بر این:
- **Session واقعی**: نقش از جدول `user_roles` خوانده می‌شود، نه از هدر
  کلاینت. هدر جعلی `x-actor-role` کاملاً بی‌اثر است (تست رگرسیون دارد).
- **CSRF**: `assertSameOrigin` روی تمام Routeهای تغییردهنده.
- **Rate Limiting**: `lib/server/rateLimit.ts` — ورود ۱۰ بار/۱۵دقیقه،
  ثبت‌نام ۵ بار/ساعت. تست زنده: تلاش یازدهم → **429**.
- **Security Headers**: `middleware.ts` — `X-Frame-Options: DENY`،
  `nosniff`، `Referrer-Policy`، `Permissions-Policy`، و روی `/admin`
  هم `X-Robots-Tag: noindex` و `Cache-Control: no-store`.
- **Audit**: عملیات حساس در `audit_logs` (+ سیستم‌های اختصاصی موجودی و
  سفارش).

━━━━━━━━━━━━━━━━━━━━
۶. APIهای مورد استفاده پنل
━━━━━━━━━━━━━━━━━━━━

| Endpoint | Method | Permission |
|---|---|---|
| `/api/auth/login` `/logout` `/me` `/register` | POST/GET | — (Rate-limited) |
| `/api/admin/orders/[id]/status` | POST | `orders.update_status` + Scope شعبه |
| `/api/admin/products` | GET/POST | `products.manage` |
| `/api/admin/products/[id]` | GET/PATCH/DELETE | `products.manage` |
| `/api/admin/branches/[id]` | PATCH | `branches.manage` |
| `/api/admin/users/[id]/role` | POST | `users.manage` |
| `/api/admin/coupons` | GET/POST | `coupons.manage` |
| `/api/admin/coupons/[id]` | PATCH | `coupons.manage` |
| `/api/admin/campaigns` | GET/POST | `coupons.manage` |
| `/api/admin/reviews/[id]` | PATCH/DELETE | `reviews.manage` |
| `/api/admin/settings` | GET/POST | `settings.manage` |
| `/api/inventory/*` | — | از Prompt 9/10 (بدون تغییر) |

صفحات Server Component مستقیماً از Repository می‌خوانند (بدون رفت‌وبرگشت
HTTP اضافه)؛ فقط عملیات تغییردهنده از سمت کلاینت از API عبور می‌کنند.

━━━━━━━━━━━━━━━━━━━━
۷. معماری Component
━━━━━━━━━━━━━━━━━━━━

```
app/admin/(protected)/         Server Components — خواندن داده + بررسی Permission
components/admin/              Client Components — فقط فرم‌ها و تعامل
  AdminSidebar                 ناوبری + خروج
  AccessDenied                 پیام یکنواخت عدم دسترسی
  OrderStatusForm              تغییر وضعیت سفارش (با Confirmation)
  ProductForm / ProductDangerZone
  InventoryAdjustForm          از Prompt 9 (هدر جعلی نقش حذف شد)
  BranchEditForm / RoleAssignForm / CouponCreateForm / CampaignCoupon
  ReviewActions / SettingsForm
```

**درس معماری مهمی که حین کار پیدا شد**: هر داده‌ای که Client Component
لازم دارد باید در فایلی بدون Import سمت‌سرور باشد، وگرنه زنجیره
`node:sqlite` وارد Bundle مرورگر شده و Build می‌شکند. به همین دلیل
`lib/auth/rolesData.ts` و `lib/settingsFields.ts` از همتایان سمت‌سرورشان
جدا شدند.

━━━━━━━━━━━━━━━━━━━━
۸. State Management
━━━━━━━━━━━━━━━━━━━━

عمداً **بدون** کتابخانه State (Redux/Zustand). دلیل: تقریباً تمام State
پنل، State سرور است.

- **خواندن**: Server Component + `dynamic = "force-dynamic"` → همیشه داده تازه.
- **فیلتر/جستجو/صفحه‌بندی**: در URL (`searchParams`) با فرم `method="get"` —
  یعنی قابل Bookmark و Share، و بدون State سمت کلاینت.
- **نوشتن**: فرم Client → `fetch` به API → `router.refresh()` برای
  بازخوانی داده سرور.

افزودن Redux برای این الگو صرفاً پیچیدگی بی‌دلیل بود.

━━━━━━━━━━━━━━━━━━━━
۹. UX
━━━━━━━━━━━━━━━━━━━━

- RTL کامل (`dir="rtl"` روی Layout).
- Desktop-first با Sidebar ثابت؛ زیر breakpoint `tablet` به نوار بالایی تبدیل می‌شود.
- Empty State واقعی روی همه لیست‌ها («هنوز سفارشی ثبت نشده» نه جدول خالی).
- Loading State روی همه فرم‌ها (دکمه غیرفعال + متن «در حال ثبت...»).
- Error State از پیام واقعی Backend (نه پیام عمومی).
- Confirmation روی عملیات حساس: تغییر وضعیت سفارش، تغییر نقش کاربر، حذف محصول/نظر.

━━━━━━━━━━━━━━━━━━━━
۱۰. Testing Plan
━━━━━━━━━━━━━━━━━━━━

**خودکار (۷۹ تست، `npx vitest run`)**:
- RBAC: نگاشت نقش→مجوز، محدودیت شعبه‌ای، رد Session جعلی/منقضی، رد هدر جعلی نقش.
- رگرسیون: تفکیک «لاگین بودن» از «داشتن نقش» (باگ واقعی پیداشده در همین مرحله).
- Rate Limiting: سقف، تفکیک IP، تفکیک کلید، ریست پنجره.
- Order Repository: Snapshot، Idempotency، Status History.
- Inventory: از Prompt 9/10 (رزرو/آزادسازی/فروش/همزمانی).

**دستی (Smoke Test زنده انجام‌شده)**:
- ورود/خروج، Redirect کاربر بدون Session به `/admin/login`.
- هر ۱۲ صفحه پنل → HTTP 200 با Session معتبر.
- صندوقدار: `/admin/products` → «دسترسی ندارید»؛ `/admin/orders` → صفحه واقعی؛ `POST /api/admin/products` → 403.
- ایجاد محصول واقعی از API → موفق.
- Rate limit: تلاش ۱۱ام ورود → 429.
- هدرهای امنیتی روی `/admin` → همه حاضر.

**هنوز انجام نشده**: تست E2E مرورگری (Playwright)، تست بار.

━━━━━━━━━━━━━━━━━━━━
TODO / محدودیت‌های صریح
━━━━━━━━━━━━━━━━━━━━

1. **کوپن به Checkout وصل نیست** — پنل فقط امکان *تعریف* کوپن/کمپین را
   می‌دهد؛ اعمال آن در محاسبه قیمت سفارش هنوز پیاده نشده.
2. **آدرس و مختصات شعب** — طبق دستور صریح، هیچ مقدار جعلی وارد نشده.
   محدوده ارسال (`branch_delivery_zones`) هم خالی است.
3. **CSP کامل** — به‌جای یک CSP شکننده، فعلاً اضافه نشده (توضیح در `middleware.ts`).
4. **Rate Limiting در حافظه پروسه** — برای چند Instance نیاز به Redis دارد.
5. **2FA** — فقط معماری‌اش آماده است (جدول `users` نیازی به تغییر ندارد)؛ پیاده نشده.
6. **اعلان/پیامک** — هیچ Provider واقعی وصل نیست؛ صفحه فقط لاگ‌های موجود را نشان می‌دهد.
7. **Wishlist/Addresses در صفحه کاربران** — جدول‌ها موجودند اما UI اختصاصی ندارند.
8. **حساب ادمین پیش‌فرض** (`09120000000` / `ChangeMe123!`) باید قبل از
   Production حتماً تغییر کند.
