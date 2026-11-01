# راهنمای Deployment — «باقلوا کریم اغلو»

## جریان کلی (بخش ۹ Prompt)

```
Push به main
  → CI (.github/workflows/ci.yml): Install → Lint → Type Check → Test → Audit → Build → Docker Build
  → موفقیت CI ماشه Deploy را می‌زند (.github/workflows/deploy.yml)
  → Deploy → Staging (خودکار)
  → Smoke Test روی Staging
  → توقف اجباری: تأیید دستی یک نفر (GitHub Environment "production" با Required Reviewer)
  → Deploy → Production
  → Smoke Test روی Production
```

این یعنی الزام صریح Prompt («Production Deploy نباید صرفاً با Push
اشتباهی انجام شود») توسط خودِ زیرساخت GitHub Environments تضمین می‌شود، نه
یک if داخل Workflow که می‌شود دور زد.

## استراتژی: چرا نه Blue/Green کامل؟

با معماری تک‌سرور فعلی (رجوع به `architecture.md`، محدودیت SQLite)،
Blue/Green واقعی (دو نسخه کامل هم‌زمان با دیتابیس مشترک) پیچیدگی زیادی
اضافه می‌کند بدون سود واقعی، چون فقط یک `app` Container مجاز است. به‌جای
آن:

- **Restart سریع با Downtime بسیار کوتاه** (چند ثانیه، زمان Pull + Restart Container) — برای این مقیاس کسب‌وکار (طبق Context اولیه پروژه) قابل قبول است.
- اگر در آینده به چند-سرور/PostgreSQL مهاجرت شد، این بخش باید بازنویسی و Blue/Green واقعی طراحی شود (TODO آینده، نه این مرحله).

## Secrets لازم در GitHub (هنوز تنظیم نشده‌اند — TODO تیم)

در تنظیمات Repository → Environments، برای هرکدام از `staging` و
`production` جداگانه:

- `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY` — دسترسی به همان سرور (بخش ۳/۱۰ Prompt)
- `REGISTRY` + Credential آن (اگر از یک Container Registry جدا استفاده می‌شود)
- `KARIMOGLU_BOOTSTRAP_ADMIN_MOBILE` / `KARIMOGLU_BOOTSTRAP_ADMIN_PASSWORD` (فقط برای Production، فقط بار اول — رجوع به `environment-variables.md`)
- `SITE_DOMAIN`

روی محیط `production`، حتماً «Required reviewers» را در تنظیمات همان
Environment فعال کنید — این دقیقاً همان تأیید دستی الزامی است.

## اجرای دستی (تا وقتی Secretهای بالا تنظیم شوند)

```bash
# روی سرور، داخل /opt/karimoglu
git pull
docker compose build
node --experimental-strip-types scripts/backup-db.mjs   # همیشه قبل از Migration
node --experimental-strip-types scripts/migrate.mjs
docker compose up -d
curl -f https://$SITE_DOMAIN/api/health
curl -f https://$SITE_DOMAIN/api/health/ready
```

## Branch Protection (بخش ۱۰ Prompt)

در تنظیمات Repository → Branches → `main`:
- Require pull request before merging
- Require status checks to pass (CI) before merging
- Require ۱ نفر حداقل Code Review
- Require branches to be up to date before merging
- (اختیاری ولی توصیه‌شده) Require signed commits

هیچ‌کدام از این‌ها را من نمی‌توانم از اینجا فعال کنم — این‌ها تنظیمات
GitHub Repository هستند که باید یک نفر با دسترسی Admin روی Repository
واقعی شرکت انجام دهد (رجوع به `handover-checklist.md`).
