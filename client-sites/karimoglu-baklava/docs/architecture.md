# معماری Production — «باقلوا کریم اغلو»

## نمای کلی

```
                         ┌─────────────────────┐
  کاربر (Browser)  ───▶ │  Caddy (Reverse Proxy) │ ───▶  Next.js App (Container)
                         │  HTTPS/TLS خودکار     │         │
                         │  Header‌های امنیتی    │         ├── Frontend (Server/Client Components)
                         └─────────────────────┘         ├── API Routes (/api/**)
                                                            └── دیتابیس SQLite (Volume)
```

- **Frontend + Backend یک Process واحدند** (Next.js Modular Monolith، طبق تصمیم Prompt 1 — تغییر نکرده)
- **Reverse Proxy**: Caddy — HTTPS خودکار (Let's Encrypt) + Header امنیتی + مسیرهای خصوصی no-store
- **Database**: فایل SQLite (`node:sqlite`) روی یک Volume — رجوع به بخش «⚠️ محدودیت معماری» پایین همین فایل، این مهم‌ترین نکته کل این سند است
- **Cache**: سرویس جداگانه‌ای وجود ندارد. Rate Limiter فعلی In-Memory است (کافی برای تک‌سرور — Prompt 13)
- **File/Object Storage / CDN**: هنوز استفاده نمی‌شود چون تصاویر واقعی محصولات هنوز آپلود نشده‌اند (TODO تیم، طبق تمام مراحل قبل)
- **Monitoring/Logging/Backup**: رجوع به فایل‌های جداگانه همین پوشه

## ⚠️ محدودیت معماری حیاتی: دیتابیس SQLite

خودِ `lib/db/schema.sql` (نوشته‌شده در Prompt 10) صریحاً می‌گوید:

> «طبق Blueprint، هدف نهایی PostgreSQL است. اما محیط اجرای فعلی این پروژه
> (Sandbox توسعه) به هیچ سرور دیتابیس یا رجیستری Binary خارجی دسترسی شبکه
> ندارد... بنابراین از `node:sqlite` استفاده شده.»

یعنی **دیتابیس فعلی از ابتدا یک تصمیم موقت/Sandbox بوده، نه معماری نهایی
مورد نظر پروژه**. این مرحله (Prompt 15) این تصمیم را تغییر نداده (طبق قانون
«بدون دلیل Architecture را عوض نکن» و چون این‌جا هم به سرور PostgreSQL
واقعی دسترسی نبود)، اما پیامدهای Production آن باید صریح باشد:

| پیامد | توضیح |
|---|---|
| **بدون Scale افقی** | چون SQLite یک فایل روی دیسک است، دو Instance از برنامه نمی‌توانند هم‌زمان به‌طور امن روی همان فایل بنویسند (مگر با معماری پیچیده Replication که این پروژه ندارد). یعنی این `docker-compose.yml` فقط با **یک Container app** کار می‌کند — Replica بالا بردن `app` باعث خرابی داده می‌شود. |
| **بدون Load Balancing واقعی بین چند سرور فیزیکی** | تا وقتی دیتابیس روی یک فایل محلی است، نمی‌توان بین دو سرور جدا Load Balance کرد. |
| **Rate Limiter In-Memory هم به همین محدودیت وابسته است** | (مستند در Prompt 13) — این هم فرض «تک‌سرور» را تقویت می‌کند. |
| **API آن هنوز Node.js Active-Development است** | طبق مستندات رسمی Node.js، `node:sqlite` رسماً "Stable" نیست (در بهترین حالت این روزها Release Candidate در نسخه‌های جدید Node — رجوع به `docs/environment-variables.md` برای نسخه دقیق Pin‌شده). یعنی ریسک باگ/تغییر رفتار در Upgradeهای بعدی Node بیشتر از یک درایور کاملاً Stable (مثل `pg` برای PostgreSQL) است. |
| **Backup/Restore ساده‌تر است** (نکته مثبت) | یک فایل تکی یعنی Backup/Restore بسیار ساده‌تر از یک خوشه PostgreSQL — رجوع به `backup-guide.md`/`restore-guide.md`. |

**توصیه صریح (نه اجباری، تصمیم تیم است):** قبل از ترافیک واقعی/چندشعبه‌ای
گسترده، مهاجرت به PostgreSQL را جدی در نظر بگیرید — طبق کامنت خودِ
`schema.sql`، این Schema عمداً نزدیک به SQL استاندارد نوشته شده تا این
مهاجرت با کمترین تغییر نحوی ممکن باشد.

## Environments

سه محیط کاملاً جدا (بخش ۲ Prompt):

| Environment | هدف | دیتابیس | فایل env |
|---|---|---|---|
| Development | توسعه محلی | `.data/karimoglu.sqlite3` محلی هر Developer | `.env.local` (در Git نیست) |
| Staging | تست قبل از Production، دقیقاً مثل Production | فایل SQLite جدا روی سرور Staging | `.env.staging` (در Secrets GitHub Environment "staging") |
| Production | ترافیک واقعی مشتری | فایل SQLite روی Volume سرور Production | `.env.production` (در Secrets GitHub Environment "production") |

هیچ فایل `.env.*` واقعی در Git Commit نمی‌شود (`.gitignore` این را از Prompt
13 پوشش می‌دهد) — مقادیر واقعی هر محیط فقط در GitHub Environment Secrets
مربوط به همان محیط نگهداری می‌شوند، هرگز به‌اشتراک بین محیط‌ها.
