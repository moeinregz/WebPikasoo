import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { DATA_DIR, DB_PATH, UPLOAD_DIR } from "@/lib/paths";

export const dynamic = "force-dynamic";

/** صفحه‌ی بررسی سلامت: /api/health — برای عیب‌یابی روی سرور (اطلاعات محرمانه‌ای نشون نمی‌ده) */
export async function GET() {
  const out: Record<string, unknown> = { ok: false, node: process.version, cwd: process.cwd(), dataDir: DATA_DIR, dbPath: DB_PATH };
  const p = process as unknown as { getBuiltinModule?: (id: string) => unknown };
  out.sqliteBuiltin = !!p.getBuiltinModule?.("node:sqlite");
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const probe = path.join(DATA_DIR, ".write-test");
    fs.writeFileSync(probe, String(Date.now()));
    fs.unlinkSync(probe);
    out.dataDirWritable = true;
  } catch (e) {
    out.dataDirWritable = false;
    out.dataDirError = (e as Error).message;
  }
  out.uploadsDirExists = fs.existsSync(UPLOAD_DIR);
  try {
    const { db } = await import("@/lib/db");
    const c = db().prepare("SELECT COUNT(*) AS c FROM products").get() as { c: number };
    out.database = "ok";
    out.products = c.c;
    out.ok = true;
  } catch (e) {
    out.database = "error";
    out.databaseError = (e as Error).message;
  }
  out.siteUrlSet = !!process.env.SITE_URL;
  return NextResponse.json(out, { status: out.ok ? 200 : 500 });
}
