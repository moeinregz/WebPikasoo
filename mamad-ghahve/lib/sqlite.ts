/**
 * SQLite با موتور داخلی Node.js (node:sqlite) — بدون هیچ پکیج native.
 * یعنی موقع نصب چیزی کامپایل یا از GitHub دانلود نمی‌شه و روی هر سرور بیلدی (از جمله سرورهای ایران لیارا) کار می‌کنه.
 * نیاز: Node.js 22.13 به بالا (یا 23.4+، 24+).
 *
 * یک لایه‌ی کوچیک با همون رابط better-sqlite3 که پروژه ازش استفاده می‌کرد: prepare/get/all/run، exec، pragma، transaction.
 */

type Param = string | number | bigint | null | Uint8Array;

export interface Statement {
  get(...params: unknown[]): unknown;
  all(...params: unknown[]): unknown[];
  run(...params: unknown[]): { changes: number | bigint; lastInsertRowid: number | bigint };
}

export interface Database {
  prepare(sql: string): Statement;
  exec(sql: string): void;
  pragma(sql: string): void;
  transaction<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R;
  close(): void;
}

type NodeSqlite = {
  DatabaseSync: new (path: string) => {
    prepare(sql: string): {
      get(...p: Param[]): unknown;
      all(...p: Param[]): unknown[];
      run(...p: Param[]): { changes: number | bigint; lastInsertRowid: number | bigint };
    };
    exec(sql: string): void;
    close(): void;
  };
};

function loadSqlite(): NodeSqlite {
  // getBuiltinModule باعث می‌شه باندلر (webpack) دست به این ماژول نزنه
  const p = process as unknown as { getBuiltinModule?: (id: string) => unknown };
  const mod = p.getBuiltinModule?.("node:sqlite") as NodeSqlite | undefined;
  if (!mod?.DatabaseSync) {
    throw new Error(`این برنامه به Node.js 22.13 یا بالاتر نیاز داره (نسخه‌ی فعلی: ${process.version}).`);
  }
  return mod;
}

// node:sqlite مقدار undefined و boolean قبول نمی‌کنه؛ مثل better-sqlite3 تبدیلشون می‌کنیم
const norm = (params: unknown[]): Param[] =>
  params.map((v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : (v as Param)));

// ردیف‌ها تو node:sqlite شیء بدون prototype هستن؛ به شیء معمولی تبدیل می‌کنیم (برای ارسال به کامپوننت‌های کلاینت)
const plain = (row: unknown) => (row && typeof row === "object" ? { ...(row as object) } : row);

export function openDatabase(file: string): Database {
  const { DatabaseSync } = loadSqlite();
  const raw = new DatabaseSync(file);
  let depth = 0;

  const db: Database = {
    prepare(sql) {
      const st = raw.prepare(sql);
      return {
        get: (...p) => plain(st.get(...norm(p))),
        all: (...p) => st.all(...norm(p)).map(plain),
        run: (...p) => st.run(...norm(p)),
      };
    },
    exec: (sql) => raw.exec(sql),
    pragma: (sql) => raw.exec(`PRAGMA ${sql}`),
    transaction(fn) {
      return (...args) => {
        // تراکنش تودرتو با SAVEPOINT
        const name = `sp${depth}`;
        raw.exec(depth === 0 ? "BEGIN IMMEDIATE" : `SAVEPOINT ${name}`);
        depth++;
        try {
          const out = fn(...args);
          depth--;
          raw.exec(depth === 0 ? "COMMIT" : `RELEASE ${name}`);
          return out;
        } catch (e) {
          depth--;
          raw.exec(depth === 0 ? "ROLLBACK" : `ROLLBACK TO ${name}; RELEASE ${name}`);
          throw e;
        }
      };
    },
    close: () => raw.close(),
  };
  return db;
}
