# متغیرهای محیطی — «باقلوا کریم اغلو»

هیچ مقدار واقعی/Secret در این فایل نیست — فقط مستندسازی نام و هدف هر متغیر.
مقدار واقعی هر محیط در `.env.production`/`.env.staging`/`.env.local` (هیچ‌کدام
در Git) یا GitHub Environment Secrets نگهداری می‌شود.

## متغیرهای فعلی (پیاده‌سازی‌شده)

| نام | الزامی؟ | پیش‌فرض | توضیح |
|---|---|---|---|
| `NODE_ENV` | بله | — | `development` / `test` / `production` |
| `KARIMOGLU_DB_PATH` | خیر | `.data/karimoglu.sqlite3` (یا `:memory:` در تست) | مسیر فایل دیتابیس SQLite |
| `KARIMOGLU_BOOTSTRAP_ADMIN_MOBILE` | فقط در `NODE_ENV=production` | — | موبایل اولین حساب ادمین (رجوع به `lib/db/seed.ts`، اصلاح Prompt 13) |
| `KARIMOGLU_BOOTSTRAP_ADMIN_PASSWORD` | فقط در `NODE_ENV=production` | — | رمز عبور اولین حساب ادمین — **فقط یک‌بار در اولین راه‌اندازی لازم است؛ بعد از اولین ورود، رمز را از پنل عوض کنید و این متغیر را از Secrets حذف کنید** |
| `KARIMOGLU_BACKUP_DIR` | خیر | کنار فایل دیتابیس، پوشه `backups/` | مقصد Backupهای محلی (`scripts/backup-db.mjs`) |
| `KARIMOGLU_BACKUP_RETENTION_DAYS` | خیر | `14` | چند روز Backup محلی نگه داشته شود |
| `SITE_DOMAIN` | بله (فقط Production/Staging) | — | دامنه واقعی — TODO تیم، هنوز مشخص نشده (رجوع به `Caddyfile`) |
| `PORT` | خیر | `3000` | پورت داخلی Next.js (توسط Dockerfile تنظیم می‌شود) |

## متغیرهایی که هنوز وجود ندارند چون سرویس واقعی متصل نیست (TODO تیم)

طبق الزام صریح این پروژه («هیچ Provider ساختگی نساز»)، این‌ها عمداً هنوز در
کد وجود ندارند — وقتی هر کدام واقعاً انتخاب/متصل شدند، باید اینجا هم اضافه
شوند:

- Payment Provider (Secret/API Key واقعی — معماری `lib/payment/` از قبل Provider-Agnostic است، رجوع به `docs/backend-architecture.md`)
- SMS Provider (برای OTP/اطلاع‌رسانی سفارش)
- هر Object Storage/CDN برای تصاویر واقعی محصولات

## قانون طلایی

- هیچ مقدار Production هرگز در `.env.local`/محیط توسعه Copy-Paste نشود و برعکس.
- هیچ Secret در کد، Log، یا Documentation (همین‌جا هم) قرار نمی‌گیرد.
- بعد از هر تغییر رمز/کلید، مقدار قدیمی را واقعاً از همه‌جا (Secrets GitHub، سرور، هر جای دیگر که Copy شده) حذف کنید — نه فقط جای جدید اضافه کنید.
