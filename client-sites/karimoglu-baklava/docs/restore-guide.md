# راهنمای Restore — «باقلوا کریم اغلو»

## ✅ این فرآیند در همین چت واقعاً تست شد (نه فقط تئوری)

سناریوی اجراشده: یک دیتابیس نمونه با داده واقعی ساخته شد → Backup گرفته
شد → فایل دیتابیس اصلی **کاملاً حذف شد** (شبیه‌سازی خرابی کامل دیسک) →
`scripts/restore-db.mjs` روی همان Backup اجرا شد → داده با موفقیت کامل
(همه ۴۳ جدول + رکورد نمونه) برگشت. جزئیات در گزارش نهایی این مرحله.

## چطور کار می‌کند

`scripts/restore-db.mjs`:
1. فایل Backup فشرده (`.sqlite3.gz`) را از حالت فشرده خارج می‌کند
2. **قبل از جایگزینی**، سلامت فایل را با `PRAGMA integrity_check` و یک
   Query واقعی (`SELECT COUNT(*) FROM users`) تأیید می‌کند — یعنی یک Backup
   خراب/ناقص هرگز جایگزین دیتابیس زنده نمی‌شود
3. دیتابیس فعلی (هرچقدر هم مشکوک) را حذف نمی‌کند — به یک نام
   `.before-restore-<timestamp>` تغییر نام می‌دهد، بعد Backup را جایگزین
   می‌کند. یعنی Restore اشتباه هم برگشت‌پذیر است.

## اجرای دستی

```bash
node --experimental-strip-types scripts/restore-db.mjs /path/to/karimoglu-YYYY-MM-DDTHH-MM-SS.sqlite3.gz
```

بعد از Restore:
```bash
docker compose restart app   # یا هر روش Restart متناسب با محیط
curl -f https://$SITE_DOMAIN/api/health/ready
```

## چه زمانی از Restore استفاده کنیم

- خرابی کامل دیسک/فایل دیتابیس سرور Production
- یک Migration اشتباه که داده را خراب کرده (رجوع به `database-migration-guide.md` بخش Rollback)
- بازیابی به یک نقطه زمانی مشخص بعد از یک حادثه (Incident) — رجوع به `incident-response-guide.md`

## محدودیت مهم

Restore فقط تا آخرین Backup موجود بازمی‌گرداند — هر تراکنش/سفارش بعد از
آخرین Backup و قبل از حادثه **قابل بازیابی نیست** (چون طبق
`backup-guide.md`، Backup هنوز فقط محلی و روزانه است، نه Real-time). این
یکی از دلایل اصلی است که بخش «خارج از سرور» و تناوب Backup باید هرچه زودتر
توسط تیم نهایی شود.
