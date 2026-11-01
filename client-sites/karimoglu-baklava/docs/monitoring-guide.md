# راهنمای Monitoring — «باقلوا کریم اغلو»

## وضعیت فعلی (صادقانه — این بخش هنوز عمدتاً TODO است)

بررسی کامل کد نشان داد: **هیچ سرویس Monitoring/APM/Error-Tracking واقعی به
پروژه متصل نیست.** خطاها فقط با `console.error`/`console.warn` معمولی
(مثلاً در `/api/health/ready`) چاپ می‌شوند که فقط در صورت جمع‌آوری دستی
Logها قابل مشاهده‌اند — هیچ Alert خودکاری برای هیچ‌کدام از موارد بخش ۱۷
Prompt (Server Down، Database Down، Payment Failure Spike، ...) فعلاً وجود
ندارد.

این حدس یا اختراع یک راه‌حل ساختگی نیست — چون اتصال به هر سرویز واقعی
(Sentry، Datadog، Grafana Cloud، UptimeRobot، ...) نیاز به یک حساب/API Key
واقعی دارد که تیم باید انتخاب و بسازد (دقیقاً مثل Payment/SMS Provider).

## چه چیزی همین الان آماده استفاده است

- **Health Endpoints واقعی** (`/api/health`, `/api/health/ready` — این مرحله): هر ابزار Uptime Monitoring (حتی رایگان مثل UptimeRobot/Better Uptime) می‌تواند همین الان به این دو آدرس Ping بزند و در صورت Down شدن Alert بفرستد — این ساده‌ترین و اولین قدم Monitoring است و صفر هزینه/کد اضافه نیاز دارد.
- **Docker Healthcheck** (`Dockerfile`): خود Docker/Orchestrator با همین Healthcheck می‌فهمد Container ناسالم است.
- **Audit Log واقعی در دیتابیس** (`audit_log` جدول، از Prompt‌های قبل): تغییرات حساس ادمین از قبل ثبت می‌شوند — این «Monitoring» به‌معنای دقیق کلمه نیست ولی برای بررسی حادثه (`incident-response-guide.md`) مفید است.

## توصیه حداقلی برای قبل از Launch (TODO تیم، انتخاب سرویس با تیم است)

1. **Uptime**: یک سرویس رایگان/ارزان (UptimeRobot و مشابه) روی `/api/health` هر ۱-۵ دقیقه — پوشش «Server Down» و «API Error Spike» ساده
2. **Error Tracking Frontend+Backend**: یک سرویس مثل Sentry (رایگان تا حجم مشخصی) — نیازمند یک خط `Sentry.init()` با DSN واقعی (بعد از ساخت حساب توسط تیم)
3. **Metrics سرور (CPU/RAM/Disk/Network)**: اکثر Providerهای VPS خودشان Dashboard پایه دارند؛ برای چیز جدی‌تر: Grafana Cloud/Netdata (Agent سبک، رایگان تا حدی)
4. **Response Time/API**: از همان Sentry Performance یا Log ساختاریافته (پایین) قابل استخراج است

## Logging (بخش ۱۶ Prompt)

فعلاً Log ساختاریافته/Centralized وجود ندارد (فقط `console.*` خام). حداقل
تغییر پیشنهادی قبل از Launch (بدون نیاز به هیچ Provider خارجی): چاپ همه
Logهای مهم به‌صورت یک خط JSON با Timestamp، سطح (info/warn/error)، و
Context — که بعداً به هر ابزار Centralized (Loki، CloudWatch، هرچیز دیگر)
قابل اتصال است. **اطلاعات حساس (رمز عبور، Session Token، شماره کارت، شماره
موبایل کامل مشتری) هرگز نباید در این Logها باشد** — کد فعلی (`security.ts`،
`orderService.ts`) از قبل این را رعایت می‌کند (بررسی‌شده در Prompt 13/14)؛
هر Log جدیدی که در آینده اضافه می‌شود باید همین قانون را رعایت کند.

## Alerts — چک‌لیست حداقلی بعد از انتخاب سرویس

- [ ] Server/Container Down > ۲ دقیقه
- [ ] `/api/health/ready` سه بار پیاپی Fail (یعنی دیتابیس در دسترس نیست)
- [ ] نرخ خطای ۵xx بالاتر از حد عادی در بازه ۵ دقیقه‌ای
- [ ] فضای Disk کمتر از ۱۵٪ (چون فایل دیتابیس + Backupها هر دو روی همان Disk هستند)
- [ ] چند شکست پرداخت پشت‌سرهم (بعد از اتصال Payment Provider واقعی)
