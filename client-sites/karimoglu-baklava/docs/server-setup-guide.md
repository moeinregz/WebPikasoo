# راهنمای آماده‌سازی سرور — «باقلوا کریم اغلو»

## ⚠️ مشخصات سرور واقعی هنوز مشخص نشده (TODO تیم)

طبق الزام صریح Prompt، این‌جا مقدار جعلی (IP، حجم RAM/Storage خاص) گذاشته
نشده. این سند فقط **حداقل نیازها و مراحل آماده‌سازی** را مشخص می‌کند؛ وقتی
سرور واقعی انتخاب شد، این چک‌لیست را روی آن اجرا کنید.

## حداقل مشخصات پیشنهادی (برای شروع — نه یک الزام قطعی)

با توجه به این‌که معماری فعلی **تک‌سرور** است (رجوع به `architecture.md`،
بخش محدودیت SQLite) و حدود ۱۰۰ محصول/۶ شعبه (مقیاس فعلی کسب‌وکار طبق
Context اولیه پروژه)، یک سرور کوچک برای شروع کافی است؛ اما تصمیم نهایی با
تیم است:

- OS: لینوکس ۶۴ بیتی مدرن (Debian 12 / Ubuntu 22.04+ — چون Dockerfile روی `bookworm-slim` است)
- CPU/RAM: TODO تیم (بستگی به Provider انتخابی و بار واقعی دارد)
- Storage: SSD (فایل دیتابیس + Backupهای محلی) — TODO تیم برای حجم دقیق
- Network: IP عمومی ثابت + دسترسی خروجی برای Docker Pull/npm/Let's Encrypt

## مراحل آماده‌سازی (روی هر سروری که انتخاب شود)

1. **بروزرسانی سیستم**: `apt update && apt upgrade -y`
2. **کاربر غیر-root برای عملیات**: هرگز مستقیم با `root` روی سرور کار نکنید
   ```bash
   adduser deploy
   usermod -aG docker deploy   # بعد از نصب Docker
   ```
3. **SSH Hardening**:
   - ورود با کلید عمومی فقط (`PasswordAuthentication no` در `/etc/ssh/sshd_config`)
   - غیرفعال کردن ورود مستقیم `root` (`PermitRootLogin no`)
   - در صورت امکان، پورت SSH پیش‌فرض را عوض کنید
4. **Firewall** (مثلاً `ufw`):
   ```bash
   ufw default deny incoming
   ufw allow OpenSSH   # یا پورت SSH سفارشی
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw enable
   ```
   هیچ پورت دیگری (از جمله پورت داخلی ۳۰۰۰ برنامه) نباید مستقیماً از بیرون
   باز باشد — فقط از طریق شبکه داخلی Docker به Caddy می‌رسد (رجوع به
   `docker-compose.yml`: `expose` نه `ports` برای سرویس `app`).
5. **نصب Docker + Docker Compose**: طبق مستندات رسمی Docker برای توزیع لینوکس انتخابی
6. **دایرکتوری Deploy**:
   ```bash
   mkdir -p /opt/karimoglu
   chown deploy:deploy /opt/karimoglu
   ```
   `docker-compose.yml`، `Caddyfile`، و `.env.production` (دستی و امن منتقل‌شده، هرگز از طریق Git Public) اینجا قرار می‌گیرند.
7. **DNS**: بعد از مشخص شدن Domain واقعی (TODO تیم)، رکورد A را به IP همین سرور اشاره دهید — قبل از اجرای `docker-compose up`، تا Caddy بتواند Certificate واقعی بگیرد.
8. **Process Management**: خود Docker (`restart: unless-stopped` در `docker-compose.yml`) این نقش را ایفا می‌کند — نیازی به `systemd`/`pm2` جداگانه برای برنامه نیست؛ فقط مطمئن شوید سرویس Docker خودش با بوت سرور بالا می‌آید (`systemctl enable docker`).
9. **کپی اولیه پروژه + اجرا**:
   ```bash
   git clone <آدرس Repository> /opt/karimoglu
   cd /opt/karimoglu
   # .env.production را دستی/امن اینجا قرار دهید (هرگز از طریق git push)
   docker compose up -d --build
   node --experimental-strip-types scripts/migrate.mjs   # یا از داخل Container
   ```

## بعد از راه‌اندازی اول

- یک بار `scripts/backup-db.mjs` را دستی اجرا کنید و مطمئن شوید Backup ساخته می‌شود (رجوع به `backup-guide.md`)
- Cron برای Backup دوره‌ای تنظیم کنید (نمونه در همان راهنما)
- چک‌لیست کامل امنیتی: `security-hardening` بخش گزارش نهایی Prompt 13 و 15 را دوباره روی سرور واقعی مرور کنید
