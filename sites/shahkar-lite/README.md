# باغچه رستوران شاهکار — نسخه‌ی اقتصادی (React / Next.js)

نسخه‌ی ساده‌ی سایت: همان تم مشکی و طلایی، **بدون GSAP، بدون Motion و بدون دیتابیس**.
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

نسخه‌ی حرفه‌ای (انیمیشن کامل، SQLite، پنل مدیریت) در `sites/shahkar` است.
