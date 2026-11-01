# راهنمای Troubleshooting — «باقلوا کریم اغلو»

## Smoke Test بعد از هر Deploy (بخش ۲۳ Prompt)

اجرای دستی (تا وقتی در `deploy.yml` خودکار شود):

```bash
DOMAIN=https://$SITE_DOMAIN   # بعد از مشخص شدن Domain واقعی

curl -f $DOMAIN/                          # Homepage
curl -f $DOMAIN/shop                      # Shop
curl -f $DOMAIN/api/health                # Liveness
curl -f $DOMAIN/api/health/ready          # Readiness (دیتابیس)
curl -f -o /dev/null -w "%{http_code}\n" $DOMAIN/cart      # باید 200 باشد ولی robots noindex
curl -I $DOMAIN | grep -i "strict-transport-security"      # HTTPS/HSTS فعال است؟
```

موارد زیر (طبق بخش ۲۳ Prompt) باید **دستی از طریق مرورگر واقعی** هم چک شوند
(چون به تعامل کاربر نیاز دارند — با `curl` قابل تست کامل نیستند):
- جستجوی محصول (Search)
- افزودن به سبد + انتخاب شعبه (Branch Selection)
- تکمیل Checkout با Payment Sandbox (بعد از اتصال Provider واقعی — فعلاً فقط Mock Provider)
- ورود ادمین (Admin Login)
- SSL/Domain به‌درستی نمایش داده می‌شود (بدون هشدار مرورگر)

## مشکلات رایج

### `/api/health/ready` مقدار 503 برمی‌گرداند
علت محتمل: فایل دیتابیس در دسترس نیست (Volume Mount نشده، Permission
اشتباه، یا Disk پر). بررسی:
```bash
docker compose logs app --tail=50
docker compose exec app ls -la /data
```

### Container بالا نمی‌آید / Healthcheck همیشه Unhealthy
```bash
docker compose logs app
```
اگر خطای مربوط به `node:sqlite` دیدید (مثلاً `ERR_UNKNOWN_BUILTIN_MODULE`):
نسخه Node Image با نسخه موردنیاز (رجوع به `Dockerfile`، فعلاً `24.7.0`)
مطابقت ندارد.

### Caddy نمی‌تواند Certificate بگیرد
- مطمئن شوید رکورد DNS دامنه واقعاً به IP همین سرور اشاره می‌کند (`dig $SITE_DOMAIN`)
- پورت ۸۰/۴۴۳ باید از بیرون باز باشند (Let's Encrypt از پورت ۸۰ برای اعتبارسنجی استفاده می‌کند)
- Logs: `docker compose logs reverse-proxy`

### سفارش ثبت نمی‌شود / خطای Branch Unavailable
طبق `lib/branch-selection/workingHoursService.ts`، این می‌تواند **رفتار
صحیح** باشد (خارج از ساعت کاری تمام شعب). قبل از فرض «باگ»، ساعت فعلی
تهران و ساعات کاری شعب را بررسی کنید (رجوع به یافته QA مستند در Prompt 14).

### نرخ محدودیت (۴۲۹ Too Many Requests) روی یک IP مشترک (NAT/دفتر شرکت)
طبق طراحی Prompt 13، Rate Limiter بر اساس IP است. اگر چند کاربر واقعی پشت
یک IP مشترک (اینترنت اداری/موبایل با CGNAT) باشند، ممکن است زودتر از حد
انتظار به سقف بخورند — این یک محدودیت شناخته‌شده معماری فعلی است، نه یک
باگ؛ اگر در عمل مشکل‌ساز شد، سقف‌های `lib/server/rateLimit.ts` قابل تنظیم
مجدد هستند (تصمیم Product/Ops).

## دسترسی به Logs

```bash
docker compose logs -f app             # Real-time
docker compose logs app --since 1h     # یک ساعت اخیر
docker compose logs reverse-proxy      # Caddy (شامل access.log هم در Volume caddy-data)
```
