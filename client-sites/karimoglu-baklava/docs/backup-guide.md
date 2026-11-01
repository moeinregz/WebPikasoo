# راهنمای Backup — «باقلوا کریم اغلو»

## چه چیزی Backup می‌شود

- **دیتابیس** (`scripts/backup-db.mjs`) — تنها منبع داده واقعی برنامه (سفارش، کاربر، موجودی، ...)
- **فایل‌های آپلودی** — فعلاً چیزی برای Backup نیست چون تصاویر واقعی محصولات هنوز آپلود نشده‌اند (TODO تیم)؛ وقتی Object Storage واقعی اضافه شد، Backup آن جدا مستند شود

## چطور کار می‌کند (`scripts/backup-db.mjs`)

از تابع رسمی و امن خودِ Node یعنی `node:sqlite`’s `backup()` استفاده
می‌کند (نه کپی خام فایل) — این یعنی حتی اگر دیتابیس در همان لحظه در حال
استفاده باشد (WAL Mode)، Backup سالم و Consistent می‌ماند. خروجی فشرده
(`gzip`) می‌شود و Backupهای قدیمی‌تر از `KARIMOGLU_BACKUP_RETENTION_DAYS`
(پیش‌فرض ۱۴ روز) خودکار حذف می‌شوند.

**این اسکریپت در همین چت واقعاً اجرا و تست شد** — نه فقط نوشته شد (رجوع به
گزارش نهایی برای جزئیات اجرای واقعی).

## اجرای دستی

```bash
node --experimental-strip-types scripts/backup-db.mjs
```

## زمان‌بندی خودکار (Cron — روی سرور Production)

```cron
# هر روز ساعت ۳ بامداد
0 3 * * * cd /opt/karimoglu && KARIMOGLU_DB_PATH=/opt/karimoglu/.data/karimoglu.sqlite3 node --experimental-strip-types scripts/backup-db.mjs >> /var/log/karimoglu-backup.log 2>&1
```

(اگر از Docker استفاده می‌شود، این را از طریق `docker compose exec app node ...` یا یک Container/Cron Job جدا اجرا کنید.)

## ⚠️ خارج از سرور (TODO تیم — الزام صریح Prompt)

طبق متن صریح Prompt: «Backup باید خارج از همان Server اصلی نیز نگهداری
شود.» این هنوز پیاده‌سازی نشده چون مقصد (S3-compatible Bucket؟ سرور دوم؟)
هنوز انتخاب نشده — حدس زده نشد. بخش انتهای `scripts/backup-db.mjs` دقیقاً
جایی است که این کد بعد از تصمیم‌گیری اضافه می‌شود. **تا آن زمان، اگر خود
سرور از بین برود، همه Backupها هم از بین می‌روند — این مهم‌ترین ریسک باز
این بخش است.**

## Retention

پیش‌فرض: ۱۴ روز محلی. برای نگهداری خارج از سرور، سیاست Retention جداگانه
(مثلاً ۹۰ روز در Object Storage ارزان‌تر) بعد از انتخاب مقصد تعریف شود —
تصمیم کسب‌وکار/هزینه است، اینجا حدس زده نشد.
