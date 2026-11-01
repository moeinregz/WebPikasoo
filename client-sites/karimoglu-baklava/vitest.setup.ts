// این فایل قبل از هر فایل تست در همان Worker اجرا می‌شود — تضمین می‌کند
// process.env.NODE_ENV دقیقاً "test" باشد (نه undefined)، چون
// `lib/db/client.ts` بر اساس همین متغیر تصمیم می‌گیرد که آیا FK Enforcement
// دیتابیس (برای تست‌های با شناسه‌های Synthetic) موقتاً خاموش شود یا نه.
(process.env as Record<string, string>).NODE_ENV = "test";
