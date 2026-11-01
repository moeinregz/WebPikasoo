import { seedDatabaseIfEmpty } from "./seed";
import { seedBranchInventoryIfEmpty } from "@/lib/inventory/store";
import { runRuntimeMigrations } from "./runtimeMigrations";

/**
 * داده پایه (کاتالوگ، شعب، انبار، نقش‌ها/مجوزها، حساب ادمین پیش‌فرض) را در
 * دیتابیس خالی وارد می‌کند. توسط `lib/db/client.ts` دقیقاً یک‌بار، قبل از اولین
 * Query واقعی، صدا زده می‌شود. هر دو تابع Idempotent هستند.
 *
 * (قبلاً این فایل با Import شدن، Seed را به‌صورت Side Effect اجرا می‌کرد؛ چون
 * حالا Seed باید Async باشد، این کار به خود Client منتقل شده است.)
 */
export async function runBootstrap(): Promise<void> {
  await seedDatabaseIfEmpty();
  await seedBranchInventoryIfEmpty();
  await runRuntimeMigrations();
}
