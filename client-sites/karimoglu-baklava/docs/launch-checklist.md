# Launch Checklist — «باقلوا کریم اغلو»

وضعیت هر مورد صادقانه علامت زده شده — ✅ انجام‌شده/تأییدشده، ⚠️ ناقص/نیازمند
اقدام، ❌ اصلاً شروع نشده (معمولاً چون منتظر تصمیم/اطلاعات تیم است).

## Application
- ✅ Build موفق (`npm run build` — بخشی از CI)
- ✅ Tests موفق (Vitest رسمی پروژه + ۳۲ تست Integration اضافه‌شده در Prompt 14، هر دو در CI)
- ✅ No Critical Bug باز (۲ باگ Critical/High پیدا‌شده در Prompt 14 اصلاح و با تست واقعی تأیید شدند)

## Database
- ⚠️ Migration: زیرساخت آماده و تست‌شده (این مرحله) — اما هنوز صفر Migration واقعی اجرا شده روی داده Production واقعی (چون هنوز Production واقعی وجود ندارد)
- ⚠️ Backup: اسکریپت آماده و با یک Restore کامل تست‌شده — اما هنوز **زمان‌بندی خودکار (Cron) روی هیچ سروری فعال نیست** (چون سرور واقعی وجود ندارد) و ذخیره خارج از سرور هنوز پیاده نشده
- ✅ Index: بررسی‌شده در Prompt 13، مناسب
- ❌ **معماری دیتابیس نهایی نیست** — SQLite طبق مستندات خودِ پروژه یک تصمیم Sandbox موقت بوده (رجوع به `architecture.md`)؛ تصمیم تیم لازم است

## Security
- ⚠️ HTTPS: پیکربندی آماده (Caddy) اما فعلاً غیرقابل‌تست چون Domain واقعی TODO است
- ✅ Firewall/SSH: راهنما آماده (`server-setup-guide.md`) — اجرا روی سرور واقعی در انتظار مشخص شدن سرور
- ✅ Secrets: هیچ Secret واقعی در کد/Git نیست؛ `.gitignore`/`.env.example` از Prompt 13
- ✅ Admin Security: RBAC + Audit Log + رفع Backdoor رمز پیش‌فرض (Prompt 13) — همه با تست واقعی تأیید شده (Prompt 14)

## SEO
- ✅ Sitemap، Robots، Canonical، Schema (Prompt 12، صحت‌سنجی مجدد Prompt 14)
- ❌ Search Console: نیاز به مالکیت Domain واقعی دارد — TODO تیم

## Performance
- ✅ Core Web Vitals/Caching/N+1: بررسی و اصلاح در Prompt 13
- ⚠️ Image Optimization: کد آماده (`next/image` طبق TODO مستند) اما چون تصاویر واقعی محصولات هنوز آپلود نشده، عملاً هنوز فعال نشده
- ❌ CDN: TODO — نیاز به تصمیم تیم (کدام Provider)

## Operations
- ⚠️ Monitoring: فقط Health Endpoint + Docker Healthcheck آماده؛ **هیچ سرویس APM/Alert واقعی متصل نیست** (`monitoring-guide.md`)
- ⚠️ Logging: فقط `console.*` خام؛ Centralized Logging TODO
- ❌ Alerts: صفر — وابسته به انتخاب سرویس Monitoring
- ⚠️ Backup: بالا (Database) را ببینید
- ✅ Restore: تست واقعی موفق در همین مرحله

## Business (همه TODO تیم — طبق الزام صریح Prompt، حدس زده نشدند)
- ❌ Domain واقعی
- ❌ IP/مشخصات سرور واقعی
- ❌ Payment Provider واقعی (فعلاً فقط Mock)
- ❌ SMS Provider واقعی
- ⚠️ محصولات/قیمت‌ها: کاتالوگ نمونه (Placeholder) در کد هست، کاتالوگ واقعی نهایی هنوز از ادمین وارد نشده
- ⚠️ شعب: نام/ساعت/تلفن ۵ شعبه تهران کامل، همدان ناقص (تلفن TODO)؛ مختصات جغرافیایی همه شعب TODO (طبق الزام صریح از ابتدای پروژه)
- ❌ Delivery: فرمول دقیق هزینه/Zone هنوز TODO

## نتیجه این چک‌لیست

از ۲۸ مورد: **۱۱ ✅، ۱۰ ⚠️، ۷ ❌**. اکثر موارد ❌/⚠️ به تصمیم یا اطلاعات تیم
وابسته‌اند (Domain، Provider، سرور)، نه به کاری که در کد باقی مانده باشد —
رجوع به «Final Production Report» برای جمع‌بندی و وضعیت نهایی READY/NOT
READY.
