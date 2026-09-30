# تغییرات

هر فایل رو با همون مسیر تو پروژه جایگزین/اضافه کن.

**جدید**
- `app/dashboard/PrivateSitesPanel.tsx` — تب «سایت‌های خصوصی» (فقط ادمین)
- `app/preview/[token]/route.ts` — مسیر عمومی لینک: `/preview/<توکن>`

**تغییر یافته**
- `lib/db.ts` — کالکشن `private_sites` (جدا از `projects`)
- `lib/uploads.ts` — `savePrivateSiteHtmlFile`
- `app/dashboard/actions.ts` — `createPrivateSiteAction` و `deletePrivateSiteAction` (فقط ادمین)
- `app/dashboard/page.tsx` — اضافه شدن تب + کانتینر پهن‌تر (`max-w-[1680px]`)
- `app/dashboard/CrmPanel.tsx` — درست شدن ظاهر وضعیت تماس / وضعیت مشکل
- `components/PricingPlans.tsx` — دسته‌ی «ادمین اینستاگرام» (پایه ۱۵ / معمولی ۲۵ / حرفه‌ای ۳۵ میلیون در ماه)
- `app/robots.ts` — `/preview` از ایندکس بلاک شد

نیاز به متغیر `BLOB_READ_WRITE_TOKEN` داره (همون که آپلود نمونه‌کار استفاده می‌کنه).
