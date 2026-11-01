# راهنمای Rollback — «باقلوا کریم اغلو»

## Application Rollback (کد/Docker Image)

چون Deploy با Tag دقیق (نه `latest`) انجام می‌شود (رجوع به
`deployment-guide.md`)، Rollback یعنی بازگرداندن به Tag/Commit قبلی که
سالم بود:

```bash
# روی سرور
docker compose pull   # اگر از Registry با Tag مشخص استفاده می‌کنید
# یا: git checkout <commit-قبلی-سالم> && docker compose build
docker compose up -d
curl -f https://$SITE_DOMAIN/api/health
```

چون هیچ Replica دیگری در معماری فعلی (تک‌سرور، رجوع به `architecture.md`)
وجود ندارد، این Rollback چند ثانیه Downtime دارد — قابل قبول برای این
مقیاس، اما TODO آینده اگر معماری تغییر کند.

## Database Rollback

طبق `database-migration-guide.md`، هیچ Rollback خودکار Schema وجود ندارد.
روش امن: `docs/restore-guide.md` — از Backup **قبل از Migration مشکل‌ساز**
Restore کنید (به همین دلیل، Backup قبل از هر Migration الزامی است، نه
اختیاری).

## ترتیب صحیح Rollback کامل یک Deployment خراب

1. بلافاصله Traffic را متوقف نکنید مگر خطا بحرانی/امنیتی باشد — ابتدار Root Cause را از Monitoring/Logs (`monitoring-guide.md`) شناسایی کنید
2. اگر فقط کد مشکل دارد (نه دیتابیس): فقط Application Rollback (بالا) کافی است
3. اگر Migration هم اجرا شده و داده را تغییر داده:
   - اول Application Rollback (نسخه قبلی کد بالا بیاید)
   - بعد Database Restore از Backup قبل از آن Migration
   - **ترتیب مهم است**: اگر ابتدا فقط Database Restore شود ولی کد جدید (که Schema جدید انتظار دارد) هنوز در حال اجراست، برنامه با Schema قدیمی خطا می‌دهد
4. Smoke Test کامل (`docs/troubleshooting-guide.md` چک‌لیست Smoke Test)
5. Incident را طبق `incident-response-guide.md` مستند کنید — حتی اگر Rollback موفق بود

## Previous Release — چگونه نگه داریم

- Git Tag/Commit هر Deploy موفق Production باید مشخص و قابل‌جستجو باشد (پیشنهاد: `git tag production-YYYY-MM-DD-HHmm` بعد از هر Deploy موفق)
- حداقل ۳ Backup اخیر دیتابیس همیشه در دسترس نگه داشته شود (Retention پیش‌فرض ۱۴ روز این را پوشش می‌دهد)
