# تب «ساخت سایت از قالب»

هر فایل رو با همون مسیر توی پروژه جایگزین/اضافه کن.

**جدید**
- `app/dashboard/SiteGeneratorPanel.tsx` — فرم تب (صنف، قالب، برند، آدرس، ۱ تا ۳ شماره، ساعت کاری اختیاری، ۲ رنگ اختیاری)
- `lib/siteTemplates/trades.ts` — لیست صنف‌ها و رنگ پیش‌فرض هر صنف
- `lib/siteTemplates/generate.ts` — موتور پر کردن قالب
- `lib/siteTemplates/index.ts` — ثبت قالب‌ها (فعلاً خالی)
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
`{{color_primary}} {{color_secondary}} {{color_accent}} {{color_bg}} {{color_text}}`

`<!--if:hours-->…<!--/if:hours-->` فقط وقتی ساعت کاری داده شده نمایش داده می‌شه
`<!--each:phones-->…<!--/each:phones-->` به تعداد شماره‌ها تکرار می‌شه
متغیرهای CSS قالب (مثل `--gold`) در `index.ts` با `vars` به نقش رنگ وصل می‌شن.
