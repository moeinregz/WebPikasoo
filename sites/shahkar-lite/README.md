# باغچه رستوران شاهکار — نسخه‌ی اقتصادی (React / Next.js)

نسخه‌ی ساده‌ی سایت: همان تم مشکی و طلایی با رنگ‌های فانوس‌های باغ (کهربایی، سبز، قرمز، آبی)، **بدون GSAP، بدون Motion و بدون دیتابیس**.
تمام کامپوننت‌ها Server Component هستند و هیچ جاوااسکریپت سمت کاربر برای انیمیشن ندارد.

```bash
npm install
npm run dev      # http://localhost:3200
npm run build    # خروجی استاتیک در پوشه‌ی out/ — روی هر هاست ساده‌ای آپلود می‌شود
```

- اطلاعات کسب‌وکار، خدمات، منو و مراسم: `lib/site.ts`
- بخش‌ها: `components/` (Header، Hero، Services، Gallery، Menu، Events، Contact، Footer)
- استایل: `app/globals.css`
- عکس‌ها: `public/images/`
- آیکون‌ها (SVG ساده): `components/Icons.tsx`

## فایل تک‌صفحه‌ای HTML
```bash
npm run build && node scripts/build-html.mjs
```
خروجی: `private-sites/shahkar-lite.html` — همه‌چیز (CSS، فونت، عکس) داخل یک فایل، بدون هیچ جاوااسکریپت.

نسخه‌ی حرفه‌ای (انیمیشن کامل، SQLite، پنل مدیریت) در `sites/shahkar` است.
