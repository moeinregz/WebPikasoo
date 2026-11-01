import { AsyncLocalStorage } from "node:async_hooks";
import { readFileSync } from "fs";
import path from "path";
import * as pgModule from "pg";
import type { Pool as PgPool, PoolClient } from "pg";

/**
 * ===== لایه اتصال به PostgreSQL =====
 *
 * پروژه قبلاً با `node:sqlite` (همزمان/Sync) نوشته شده بود. این فایل همان شکل
 * ظاهری `db.prepare(sql).get/all/run(...)` و `db.exec(sql)` و
 * `withTransaction(fn)` را حفظ می‌کند، اما حالا همه‌چیز **async** است
 * (باید `await` شود) و پشتش یک Pool واقعی PostgreSQL قرار دارد.
 *
 * - Placeholderهای `?` به‌صورت خودکار به `$1, $2, ...` تبدیل می‌شوند.
 * - اتصال از متغیر محیطی `DATABASE_URL` (یا `PG_URI`) خوانده می‌شود.
 * - اولین Query بعد از بالا آمدن سرور، Schema را می‌سازد و داده پایه (Seed) را
 *   فقط اگر دیتابیس خالی باشد وارد می‌کند. این کار با یک Advisory Lock انجام
 *   می‌شود تا اگر چند Instance هم‌زمان بالا بیایند، تداخل پیش نیاید.
 * - در `withTransaction` یک Advisory Lock سراسری گرفته می‌شود؛ این دقیقاً همان
 *   رفتار `BEGIN IMMEDIATE` در SQLite است (رزروهای هم‌زمان موجودی پشت سر هم
 *   اجرا می‌شوند) و منطق موجودی/سفارش را بدون تغییر درست نگه می‌دارد.
 */

// pg یک ماژول CommonJS است؛ این‌طور Import با Next.js، Node و Vitest سازگار است.
const pg: typeof import("pg") = (pgModule as unknown as { default?: typeof import("pg") }).default ?? (pgModule as typeof import("pg"));

// BIGINT (OID 20) و NUMERIC (OID 1700) به‌صورت پیش‌فرض String برمی‌گردند؛ COUNT/SUM و
// مبلغ‌ها در کل پروژه Number هستند (مبالغ ریالی در محدوده امن Number قرار دارند).
pg.types.setTypeParser(20, (value: string) => Number(value));
pg.types.setTypeParser(1700, (value: string) => Number(value));

// پارامترها عمداً `unknown` هستند (کد موجود آرایه‌های پارامتر عمومی می‌سازد)؛ مقدار نهایی در runQuery نرمال می‌شود
export type SqlParam = unknown;

export interface RunResult {
  changes: number;
}

export interface Statement {
  get(...params: SqlParam[]): Promise<any>;
  all(...params: SqlParam[]): Promise<any[]>;
  run(...params: SqlParam[]): Promise<RunResult>;
}

interface DbContext {
  client?: PoolClient; // وقتی داخل withTransaction هستیم، همه Queryها از همین Client می‌روند
  initializing?: boolean; // Queryهای خود فرایند Init نباید منتظر Init بمانند (Deadlock)
}

const als = new AsyncLocalStorage<DbContext>();

const IS_TEST = process.env.NODE_ENV === "test" || process.env.VITEST === "true" || process.env.VITEST === "1";

const INIT_LOCK_KEY = 727001; // Advisory Lock مربوط به ساخت Schema/Seed
const TX_LOCK_KEY = 727002; // Advisory Lock سراسری تراکنش‌ها (معادل BEGIN IMMEDIATE)

declare global {
  // eslint-disable-next-line no-var
  var __karimoglu_pg_pool__: PgPool | undefined;
  // eslint-disable-next-line no-var
  var __karimoglu_pg_ready__: Promise<void> | undefined;
}

function getConnectionString(): string {
  if (IS_TEST) {
    const testUrl = process.env.TEST_DATABASE_URL;
    if (!testUrl) {
      throw new Error(
        "برای اجرای تست‌ها باید TEST_DATABASE_URL (یک دیتابیس PostgreSQL جدا و مخصوص تست) تنظیم شود. " +
          "هرگز آدرس دیتابیس اصلی را اینجا نگذارید — تست‌ها همه جدول‌ها را پاک می‌کنند.",
      );
    }
    return testUrl;
  }
  const url = process.env.DATABASE_URL ?? process.env.PG_URI;
  if (!url) {
    throw new Error("متغیر محیطی DATABASE_URL (آدرس اتصال PostgreSQL) تنظیم نشده است.");
  }
  return url;
}

/** حذف پارامترهای `sslmode` / `ssl` از آدرس اتصال (کنترل SSL فقط با PG_SSL است) */
function stripSslParams(url: string): string {
  return url
    .replace(/([?&])(sslmode|ssl|sslrootcert|sslcert|sslkey)=[^&]*&?/gi, "$1")
    .replace(/[?&]$/, "");
}

function getPool(): PgPool {
  if (!globalThis.__karimoglu_pg_pool__) {
    // SSL فقط و فقط با متغیر PG_SSL کنترل می‌شود:
    //  - PG_SSL=true  → اتصال SSL (بدون راستی‌آزمایی گواهی؛ مناسب سرورهای با گواهی خودامضا)
    //  - غیر از این   → بدون SSL
    // پارامتر `sslmode` داخل آدرس و متغیر محیطی PGSSLMODE عمداً نادیده گرفته می‌شوند؛ وگرنه
    // روی سروری که SSL ندارد خطای «The server does not support SSL connections» می‌دهد.
    const useSsl = process.env.PG_SSL === "true";
    const pool = new pg.Pool({
      connectionString: stripSslParams(getConnectionString()),
      max: Number(process.env.PG_POOL_MAX ?? 10),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
    });
    // بدون این Handler، قطع شدن یک اتصال بیکار می‌تواند کل فرایند Node را از کار بیندازد
    pool.on("error", (error: Error) => {
      // eslint-disable-next-line no-console
      console.error("[db] خطای اتصال بیکار PostgreSQL:", error.message);
    });
    globalThis.__karimoglu_pg_pool__ = pool;
  }
  return globalThis.__karimoglu_pg_pool__;
}

/** `?` → `$1, $2, ...` */
function toPgPlaceholders(sql: string): string {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

/** فقط برای تست: Constraintهای FK حذف می‌شوند (تست‌ها عمداً از شناسه‌های Synthetic استفاده می‌کنند) */
function stripForeignKeys(sql: string): string {
  return sql
    .replace(/,\s*FOREIGN KEY\s*\([^)]*\)\s*REFERENCES[^\n]*/g, "")
    .replace(/\s+REFERENCES\s+\w+\s*\(\s*\w+\s*\)(\s+ON DELETE\s+(CASCADE|SET NULL|RESTRICT))?/g, "");
}

async function ensureReady(): Promise<void> {
  if (als.getStore()?.initializing) return;
  if (!globalThis.__karimoglu_pg_ready__) {
    globalThis.__karimoglu_pg_ready__ = als.run({ initializing: true }, initializeDatabase).catch((error) => {
      globalThis.__karimoglu_pg_ready__ = undefined; // اجازه تلاش دوباره در Request بعدی
      throw error;
    });
  }
  await globalThis.__karimoglu_pg_ready__;
}

async function initializeDatabase(): Promise<void> {
  const lockClient = await getPool().connect();
  try {
    await lockClient.query("SELECT pg_advisory_lock($1)", [INIT_LOCK_KEY]);

    let schemaSql = readFileSync(path.resolve(process.cwd(), "lib", "db", "schema.sql"), "utf-8");
    if (IS_TEST) schemaSql = stripForeignKeys(schemaSql);
    await lockClient.query(schemaSql); // همه دستورات IF NOT EXISTS هستند — اجرای مکرر بی‌خطر است

    if (IS_TEST) await truncateAllTables(lockClient); // هر Worker تست از یک دیتابیس تمیز شروع می‌کند (مثل :memory: قبلی)

    const { runBootstrap } = await import("./bootstrap");
    await runBootstrap();
  } finally {
    try {
      await lockClient.query("SELECT pg_advisory_unlock($1)", [INIT_LOCK_KEY]);
    } finally {
      lockClient.release();
    }
  }
}

async function truncateAllTables(executor: { query: (sql: string) => Promise<{ rows: { tablename: string }[] }> }): Promise<void> {
  const { rows } = await executor.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = current_schema() AND tablename <> 'schema_migrations'",
  );
  if (rows.length === 0) return;
  await executor.query(`TRUNCATE ${rows.map((r) => `"${r.tablename}"`).join(", ")} RESTART IDENTITY CASCADE`);
}

function normalizeParam(value: unknown): unknown {
  if (value === undefined) return null;
  if (typeof value === "boolean") return value ? 1 : 0; // ستون‌های Boolean پروژه BIGINT 0/1 هستند
  return value;
}

async function runQuery(sql: string, params: SqlParam[]) {
  await ensureReady();
  const executor = als.getStore()?.client ?? getPool();
  return executor.query(toPgPlaceholders(sql), params.map(normalizeParam));
}

export const db = {
  prepare(sql: string): Statement {
    return {
      async get(...params) {
        const result = await runQuery(sql, params);
        return result.rows[0];
      },
      async all(...params) {
        const result = await runQuery(sql, params);
        return result.rows;
      },
      async run(...params) {
        const result = await runQuery(sql, params);
        return { changes: result.rowCount ?? 0 };
      },
    };
  },

  /** اجرای یک یا چند دستور SQL بدون پارامتر */
  async exec(sql: string): Promise<void> {
    await ensureReady();
    const executor = als.getStore()?.client ?? getPool();
    await executor.query(sql);
  },
};

/**
 * اجرای یک تابع درون یک تراکنش واقعی PostgreSQL. همه Queryهایی که داخل `fn`
 * (حتی در توابع صدا زده‌شده از آن) اجرا شوند، خودکار از همین تراکنش می‌روند.
 * اگر `fn` خطا بدهد، همه‌چیز Rollback می‌شود.
 */
export async function withTransaction<T>(fn: () => Promise<T> | T): Promise<T> {
  const parent = als.getStore();
  if (parent?.client) return fn(); // تراکنش تودرتو: به تراکنش بیرونی می‌پیوندد

  await ensureReady();
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock($1)", [TX_LOCK_KEY]);
    const result = await als.run({ ...parent, client }, async () => fn());
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // اتصال قبلاً قطع شده؛ خطای اصلی مهم‌تر است
    }
    throw error;
  } finally {
    client.release();
  }
}

/** بررسی سلامت: یک `SELECT 1` ساده (برای /api/health/ready) */
export async function pingDatabase(): Promise<void> {
  await db.prepare("SELECT 1 AS ok").get();
}

/** فقط برای تست — پاک‌سازی کامل تمام جدول‌ها. روی دیتابیسی که نامش «test» ندارد اجرا نمی‌شود. */
export async function __resetDbForTest(): Promise<void> {
  if (!IS_TEST) throw new Error("__resetDbForTest فقط در محیط تست مجاز است.");
  const databaseName = new URL(getConnectionString()).pathname.replace(/^\//, "");
  if (!/test/i.test(databaseName)) {
    throw new Error(`نام دیتابیس تست باید شامل «test» باشد (فعلی: «${databaseName}») تا اشتباهاً دیتابیس واقعی پاک نشود.`);
  }
  await ensureReady();
  await truncateAllTables(getPool());
}
