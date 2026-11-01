/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // برای Docker: خروجی Standalone یک پوشه حداقلی (فقط فایل‌های واقعاً لازم +
  // یک server.js سبک) می‌سازد؛ Image نهایی نیازی به کل node_modules ندارد.
  // فقط وقتی `NEXT_OUTPUT=standalone` باشد (در Dockerfile ست می‌شود). روی پلتفرم Next.js لیارا
  // (که با `npm start` اجرا می‌کند) این گزینه نباید فعال باشد.
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  experimental: {
    // درایور PostgreSQL باید Bundle نشود و مستقیم از node_modules بارگذاری شود
    serverComponentsExternalPackages: ["pg"],
    // فایل schema.sql را برنامه در زمان اجرا می‌خواند؛ در خروجی Standalone (Docker) باید حتماً کپی شود
    outputFileTracingIncludes: { "/**": ["./lib/db/schema.sql"] },
  },
  images: {
    // در فاز واقعی، دامنه CDN/Object Storage نهایی (طبق Blueprint) این‌جا اضافه می‌شود
    formats: ["image/avif", "image/webp"],
  },
  // اصلاح بخش ۱۳ Prompt (Routing Audit): مسیر واقعی فروشگاه در این پروژه
  // از ابتدا `/shop` بوده (رجوع به app/shop) — تغییر نام آن به `/products`
  // یک تغییر معماری/Route بدون دلیل واقعی بود (طبق قانون صریح این پروژه
  // ممنوع)، اما چون Prompt صراحتاً می‌خواهد `/products` هرگز 404 ندهد
  // (شاید به‌خاطر لینک‌های بیرونی/تبلیغاتی با این نام)، یک Redirect ۳۰۸
  // (معادل عملکردی ۳۰۱ برای SEO) اضافه شده — بدون نیاز به پیاده‌سازی مجدد
  // یا جابه‌جایی صفحه فروشگاه.
  async redirects() {
    return [{ source: "/products", destination: "/shop", permanent: true }];
  },
};

module.exports = nextConfig;
