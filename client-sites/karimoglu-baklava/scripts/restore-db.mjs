#!/usr/bin/env node
// ===== Restore دیتابیس PostgreSQL از فایل Backup (`pg_restore`) =====
// ⚠️ مخرب: جدول‌های موجود را پاک و با محتوای Backup جایگزین می‌کند.
// اجرا:  DATABASE_URL="postgresql://..." npm run db:restore -- backups/karimoglu-XXXX.dump --yes
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const url = process.env.DATABASE_URL ?? process.env.PG_URI;
const file = process.argv[2];
if (!url || !file || !existsSync(file)) {
  console.error("استفاده: DATABASE_URL=... npm run db:restore -- <فایل.dump> --yes");
  process.exit(1);
}
if (!process.argv.includes("--yes")) {
  console.error("این عملیات داده‌های فعلی را پاک می‌کند. برای تأیید گزینه --yes را اضافه کنید.");
  process.exit(1);
}
const result = spawnSync("pg_restore", ["--clean", "--if-exists", "--no-owner", "--dbname", url, file], { stdio: "inherit" });
if (result.error || result.status !== 0) {
  console.error("[restore] ❌ pg_restore با خطا تمام شد (هشدارهای جزئی ممکن است طبیعی باشند؛ خروجی بالا را بررسی کنید).");
  process.exit(1);
}
console.log("[restore] ✅ انجام شد.");
