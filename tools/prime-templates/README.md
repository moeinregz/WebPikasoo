# تولیدکننده‌ی قالب‌های «prime»

`engine.html` موتور مشترک است و هر `cfg_*.py` تنظیمات صنف‌ها (رنگ، فونت، نماد SVG، متن‌ها).

```
python3 tools/prime-templates/build.py            # همه‌ی قالب‌ها را دوباره می‌سازد
python3 tools/prime-templates/build.py cafe-prime # فقط یک قالب
python3 tools/prime-templates/register.py         # ثبت در lib/siteTemplates/index.ts (چندباره‌اجرا امن است)
```
خروجی در `lib/siteTemplates/templates/*-prime.template.html` نوشته می‌شود.
