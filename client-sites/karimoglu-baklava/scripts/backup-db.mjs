#!/usr/bin/env node
// ===== Backup دیتابیس PostgreSQL — با `pg_dump` =====
// نیاز: ابزار `pg_dump` روی همین کامپیوتر نصب باشد (بسته postgresql-client).
// اجرا:  DATABASE_URL="postgresql://..." npm run db:backup
// خروجی: backups/karimoglu-<تاریخ>.dump  (فرمت custom، قابل Restore با `npm run db:restore`)
// نکته: لیارا خودش هم برای دیتابیس Backup خودکار/دستی دارد؛ این اسکریپت یک نسخه اضافه روی کامپیوتر شماست.
import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";

const url = process.env.DATABASE_URL ?? process.env.PG_URI;
if (!url) {
  console.error("[backup] DATABASE_URL تنظیم نشده است.");
  process.exit(1);
}
const dir = process.env.KARIMOGLU_BACKUP_DIR ?? path.resolve(process.cwd(), "backups");
mkdirSync(dir, { recursive: true });
const file = path.join(dir, `karimoglu-${new Date().toISOString().replace(/[:.]/g, "-")}.dump`);

const result = spawnSync("pg_dump", ["--format=custom", "--no-owner", "--file", file, url], { stdio: "inherit" });
if (result.error || result.status !== 0) {
  console.error("[backup] ❌ pg_dump شکست خورد (آیا postgresql-client نصب است؟)");
  process.exit(1);
}
console.log(`[backup] ✅ ذخیره شد: ${file}`);
