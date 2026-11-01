#!/usr/bin/env node
// ===== اجراکننده Migration (PostgreSQL) — «باقلوا کریم اغلو» =====
//
// ساخت جدول‌های پایه خودکار است (برنامه در اولین اتصال `lib/db/schema.sql` را اجرا می‌کند).
// این اسکریپت فقط برای «تغییرات بعدی Schema» است: فایل‌های `lib/db/migrations/NNNN_name.sql`
// به ترتیب نام اجرا می‌شوند و هرکدام فقط یک‌بار (ثبت در جدول schema_migrations).
//
// اجرا:  DATABASE_URL="postgresql://..." npm run migrate
import { createRequire } from "node:module";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const pg = require("pg");

const url = process.env.DATABASE_URL ?? process.env.PG_URI;
if (!url) {
  console.error("[migrate] DATABASE_URL تنظیم نشده است.");
  process.exit(1);
}

const client = new pg.Client({
  connectionString: url.replace(/([?&])(sslmode|ssl)=[^&]*&?/gi, "$1").replace(/[?&]$/, ""),
  ssl: process.env.PG_SSL === "true" ? { rejectUnauthorized: false } : false,
});
await client.connect();

try {
  await client.query("SELECT pg_advisory_lock(727001)");
  await client.query(readFileSync(path.resolve(process.cwd(), "lib", "db", "schema.sql"), "utf-8"));

  const applied = new Set((await client.query("SELECT id FROM schema_migrations")).rows.map((r) => r.id));
  const dir = path.resolve(process.cwd(), "lib", "db", "migrations");
  const pending = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .filter((f) => !applied.has(f));

  if (pending.length === 0) {
    console.log("[migrate] هیچ Migration در انتظاری نیست. دیتابیس به‌روز است.");
  }

  for (const file of pending) {
    console.log(`[migrate] در حال اجرا: ${file}`);
    try {
      await client.query("BEGIN");
      await client.query(readFileSync(path.join(dir, file), "utf-8"));
      await client.query("INSERT INTO schema_migrations (id, applied_at) VALUES ($1, $2)", [file, new Date().toISOString()]);
      await client.query("COMMIT");
      console.log(`[migrate] ✅ اعمال شد: ${file}`);
    } catch (error) {
      await client.query("ROLLBACK");
      console.error(`[migrate] ❌ شکست خورد و Rollback شد: ${file}`);
      console.error(error);
      process.exitCode = 1;
      break;
    }
  }
} finally {
  await client.query("SELECT pg_advisory_unlock(727001)").catch(() => {});
  await client.end();
}
