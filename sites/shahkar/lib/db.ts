import "server-only";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

export type MenuItem = {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: number | null;
  featured: number;
  visible: number;
  sort: number;
};

export type MenuCategory = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  sort: number;
};

export type MenuCategoryWithItems = MenuCategory & { items: MenuItem[] };

export type Reservation = {
  id: number;
  name: string;
  phone: string;
  event_type: string;
  guests: number;
  date_text: string;
  time_text: string;
  area: string;
  notes: string;
  status: ReservationStatus;
  created_at: string;
};

export const RESERVATION_STATUSES = ["new", "confirmed", "done", "cancelled"] as const;
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

const DB_PATH = process.env.SQLITE_PATH || path.join(process.cwd(), "data", "shahkar.db");

// Re-use one connection across hot reloads in dev.
const globalForDb = globalThis as unknown as { __shahkarDb?: Database.Database };

export function getDb(): Database.Database {
  if (globalForDb.__shahkarDb) return globalForDb.__shahkarDb;
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  seedMenu(db);
  globalForDb.__shahkarDb = db;
  return db;
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS menu_categories (
      id        INTEGER PRIMARY KEY,
      slug      TEXT NOT NULL UNIQUE,
      title     TEXT NOT NULL,
      subtitle  TEXT NOT NULL DEFAULT '',
      sort      INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS menu_items (
      id          INTEGER PRIMARY KEY,
      category_id INTEGER NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
      name        TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price       INTEGER,
      featured    INTEGER NOT NULL DEFAULT 0,
      visible     INTEGER NOT NULL DEFAULT 1,
      sort        INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS menu_items_category ON menu_items(category_id, sort);
    CREATE TABLE IF NOT EXISTS reservations (
      id          INTEGER PRIMARY KEY,
      name        TEXT NOT NULL,
      phone       TEXT NOT NULL,
      event_type  TEXT NOT NULL,
      guests      INTEGER NOT NULL,
      date_text   TEXT NOT NULL,
      time_text   TEXT NOT NULL DEFAULT '',
      area        TEXT NOT NULL DEFAULT '',
      notes       TEXT NOT NULL DEFAULT '',
      status      TEXT NOT NULL DEFAULT 'new',
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS reservations_created ON reservations(created_at DESC);
  `);
}

const SEED: { slug: string; title: string; subtitle: string; items: [string, string, boolean?][] }[] = [
  {
    slug: "kabab",
    title: "کباب‌های زغالی",
    subtitle: "روی آتش زغال، به رسم قدیم",
    items: [
      ["چلوکباب کوبیده", "دو سیخ کوبیده‌ی گوشت تازه با برنج ایرانی و گوجه‌ی کبابی", true],
      ["چلوکباب برگ", "فیله‌ی گوسفندی خوابانده در زعفران و پیاز"],
      ["چلوکباب سلطانی", "یک سیخ برگ و یک سیخ کوبیده؛ انتخاب شاهانه", true],
      ["جوجه‌کباب زعفرانی", "سینه‌ی مرغ خوابانده در زعفران و لیمو"],
      ["کباب بختیاری", "ترکیب جوجه و برگ روی یک سیخ"],
      ["شیشلیک", "دنده‌ی گوسفندی مزه‌دار شده، کبابی روی زغال"],
    ],
  },
  {
    slug: "traditional",
    title: "غذاهای سنتی",
    subtitle: "طعم سفره‌های خانگی ایرانی",
    items: [
      ["قورمه‌سبزی", "سبزی سرخ‌شده، لوبیا قرمز و گوشت، با چلو", true],
      ["قیمه", "لپه و گوشت با سیب‌زمینی خلالی"],
      ["باقالی‌پلو با ماهیچه", "ماهیچه‌ی گوسفندی پخته در سس مخصوص", true],
      ["زرشک‌پلو با مرغ", "مرغ زعفرانی با زرشک و خلال پسته"],
      ["فسنجان", "گردوی آسیاب‌شده و رب انار، ترش و شیرین"],
      ["دیزی سنگی", "آبگوشت در ظرف سنگی، با نان و مخلفات"],
    ],
  },
  {
    slug: "starters",
    title: "پیش‌غذا و مخلفات",
    subtitle: "آغاز یک شب خوب",
    items: [
      ["کشک بادمجان", "بادمجان کبابی، کشک، نعناع داغ و پیاز داغ"],
      ["میرزاقاسمی", "بادمجان دودی، سیر و تخم‌مرغ به سبک شمال"],
      ["سالاد شیرازی", "خیار، گوجه و پیاز با آبغوره"],
      ["ماست و خیار", "با نعناع خشک و گل‌سرخ"],
      ["زیتون پرورده", "زیتون، گردو و رب انار"],
    ],
  },
  {
    slug: "drinks",
    title: "نوشیدنی و دسر",
    subtitle: "حسن ختام",
    items: [
      ["چای آتیشی", "چای دم‌کشیده روی زغال با نبات زعفرانی", true],
      ["دوغ محلی", "دوغ گازدار با پونه و نعناع"],
      ["شربت سکنجبین", "شربت سنتی سرکه‌انگبین با خیار رنده‌شده"],
      ["شربت بیدمشک", "خنک و معطر، مخصوص شب‌های تابستان"],
      ["شله‌زرد", "با دارچین و خلال بادام"],
    ],
  },
];

function seedMenu(db: Database.Database) {
  const count = db.prepare("SELECT COUNT(*) AS n FROM menu_categories").get() as { n: number };
  if (count.n > 0) return;
  const insCat = db.prepare(
    "INSERT INTO menu_categories (slug, title, subtitle, sort) VALUES (?, ?, ?, ?)",
  );
  const insItem = db.prepare(
    "INSERT INTO menu_items (category_id, name, description, featured, sort) VALUES (?, ?, ?, ?, ?)",
  );
  db.transaction(() => {
    SEED.forEach((cat, ci) => {
      const { lastInsertRowid } = insCat.run(cat.slug, cat.title, cat.subtitle, ci);
      cat.items.forEach(([name, desc, featured], ii) => {
        insItem.run(lastInsertRowid, name, desc, featured ? 1 : 0, ii);
      });
    });
  })();
}

/* ---------- menu ---------- */

export function getMenu(opts: { includeHidden?: boolean } = {}): MenuCategoryWithItems[] {
  const db = getDb();
  const cats = db.prepare("SELECT * FROM menu_categories ORDER BY sort, id").all() as MenuCategory[];
  const items = db
    .prepare(
      `SELECT * FROM menu_items ${opts.includeHidden ? "" : "WHERE visible = 1"} ORDER BY sort, id`,
    )
    .all() as MenuItem[];
  return cats.map((c) => ({ ...c, items: items.filter((i) => i.category_id === c.id) }));
}

export function addMenuItem(input: {
  categoryId: number;
  name: string;
  description: string;
  price: number | null;
  featured: boolean;
}) {
  const db = getDb();
  const { m } = db
    .prepare("SELECT COALESCE(MAX(sort), -1) + 1 AS m FROM menu_items WHERE category_id = ?")
    .get(input.categoryId) as { m: number };
  db.prepare(
    "INSERT INTO menu_items (category_id, name, description, price, featured, sort) VALUES (?, ?, ?, ?, ?, ?)",
  ).run(input.categoryId, input.name, input.description, input.price, input.featured ? 1 : 0, m);
}

export function toggleMenuItem(id: number, field: "visible" | "featured") {
  getDb().prepare(`UPDATE menu_items SET ${field} = 1 - ${field} WHERE id = ?`).run(id);
}

export function deleteMenuItem(id: number) {
  getDb().prepare("DELETE FROM menu_items WHERE id = ?").run(id);
}

/* ---------- reservations ---------- */

export function createReservation(r: Omit<Reservation, "id" | "status" | "created_at">) {
  const { lastInsertRowid } = getDb()
    .prepare(
      `INSERT INTO reservations (name, phone, event_type, guests, date_text, time_text, area, notes)
       VALUES (@name, @phone, @event_type, @guests, @date_text, @time_text, @area, @notes)`,
    )
    .run(r);
  return Number(lastInsertRowid);
}

export function listReservations(limit = 200): Reservation[] {
  return getDb()
    .prepare("SELECT * FROM reservations ORDER BY id DESC LIMIT ?")
    .all(limit) as Reservation[];
}

export function setReservationStatus(id: number, status: ReservationStatus) {
  getDb().prepare("UPDATE reservations SET status = ? WHERE id = ?").run(status, id);
}

export function reservationStats() {
  return getDb()
    .prepare("SELECT status, COUNT(*) AS n FROM reservations GROUP BY status")
    .all() as { status: ReservationStatus; n: number }[];
}
