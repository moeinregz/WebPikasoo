# تب «ساخت سایت از قالب»

هر فایل رو با همون مسیر توی پروژه جایگزین/اضافه کن.

**جدید**
- `app/dashboard/SiteGeneratorPanel.tsx` — فرم تب (صنف، قالب، برند، آدرس، ۱ تا ۳ شماره، ساعت کاری اختیاری، ۲ رنگ اختیاری)
- `lib/siteTemplates/trades.ts` — لیست صنف‌ها و رنگ پیش‌فرض هر صنف
- `lib/siteTemplates/generate.ts` — موتور پر کردن قالب
- `lib/siteTemplates/index.ts` — ثبت قالب‌ها
- `lib/siteTemplates/templates/cafe-adra.template.html` — اولین قالب صنف کافه
- `lib/siteTemplates/templates/EXAMPLE.template.html` — نمونه‌ی سینتکس قالب
- `types/html-templates.d.ts`

**تغییر یافته** (فقط اضافه شده، چیزی حذف نشده)
- `app/dashboard/actions.ts` — `generateSiteAction`
- `app/dashboard/page.tsx` — اضافه شدن تب (فقط ادمین)
- `next.config.js` — قاعده‌ی webpack برای import فایل‌های `*.template.html`

سایت ساخته‌شده مثل «سایت‌های خصوصی» ذخیره می‌شه و لینک `/preview/<توکن>` می‌گیره.
بدون هیچ پکیج یا متغیر محیطی جدید (همون `BLOB_READ_WRITE_TOKEN` قبلی کافیه).

## سینتکس قالب
`{{brand}} {{address}} {{hours}} {{trade}} {{year}} {{map_url}}`
`{{phone}} {{phone_href}}` (شماره‌ی اول)، `{{phone2}} {{phone3}}` و `_href` هر کدوم
`{{brand_first}} {{brand_rest}}` — کلمه‌ی اول اسم و بقیه‌اش (برای تیتر دو خطی)
`{{color_primary}} {{color_secondary}} {{color_accent}} {{color_bg}} {{color_text}}`

**رنگ مشتق‌شده** (کل سایت با یک رنگ هماهنگ می‌شه): `{{c:عبارت}}` در هر جای قالب (CSS، استایل، SVG)
عبارت: `primary | secondary | accent | bg | text | white | black | #hex`
`mix(A,B,0.3)` ترکیب دو رنگ — `ink(A)` رنگ خوانا روی A — `best(A,B,C)` و `pref(A,3,B,C)` انتخاب بر اساس کنتراست

`<!--if:hours-->…<!--/if:hours-->` فقط وقتی ساعت کاری داده شده نمایش داده می‌شه
`<!--each:phones-->…<!--/each:phones-->` به تعداد شماره‌ها تکرار می‌شه
متغیرهای CSS قالب (مثل `--gold`) در `index.ts` با `vars` به نقش رنگ وصل می‌شن.

## قالب‌های فعلی (۱۸ قالب، ۱۷ صنف)
کافه ×۲ (آدرا، سارا)، فست‌فود، فرش‌فروشی، آژانس مسافرتی، باشگاه، مبل‌شویی، باربری، لباس مردانه و بوتیک،
دفتر وکالت، آموزشگاه زبان، طلافروشی، ساعت‌فروشی، لوازم آرایشی، بستنی و آبمیوه، شیرینی‌فروشی، آموزشگاه موسیقی، املاک.

## رنگ هر قالب
هر قالب رنگ مخصوص خودش را دارد (`palette` در `lib/siteTemplates/index.ts`). بدون انتخاب رنگ، همان ظاهر اصلی ساخته می‌شود.
با انتخاب رنگ، همه‌ی رنگ‌های هم‌خانواده در قالب با رنگ انتخابی هماهنگ می‌شوند (روشنی و تیرگی و کنتراست حفظ می‌شود).

## اینستاگرام و واتساپ (اختیاری)
`{{instagram}} {{instagram_href}} {{whatsapp}} {{whatsapp_href}}` و `<!--if:instagram-->…<!--/if:instagram-->` (واتساپ هم همین‌طور).
قالبی که خودش جای شبکه‌ی اجتماعی دارد از همان جا استفاده می‌کند؛ بقیه یک نوار «اینستاگرام / واتساپ» بالای فوتر می‌گیرند.
`{{wa:?text=…}}` لینک واتساپ با پیام آماده (اگر واتساپ نداده باشی، تماس تلفنی).
