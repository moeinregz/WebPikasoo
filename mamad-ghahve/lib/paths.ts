import path from "path";

/**
 * محل ذخیره‌ی داده‌های ماندگار (دیتابیس + عکس‌های آپلودی).
 * روی لیارا یک دیسک روی پوشه‌ی data سوار می‌شه؛ اگه لازم شد با متغیر DATA_DIR مسیر مطلق بده (مثلاً /app/data).
 */
export const DATA_DIR = path.resolve(process.cwd(), process.env.DATA_DIR || "./data");
export const DB_PATH = process.env.DATABASE_PATH ? path.resolve(process.cwd(), process.env.DATABASE_PATH) : path.join(DATA_DIR, "shop.db");
export const UPLOAD_DIR = process.env.UPLOAD_DIR ? path.resolve(process.cwd(), process.env.UPLOAD_DIR) : path.join(DATA_DIR, "uploads");
