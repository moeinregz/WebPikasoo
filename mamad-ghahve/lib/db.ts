import "server-only";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { seedIfEmpty } from "./seed";

const DB_PATH = path.resolve(process.cwd(), process.env.DATABASE_PATH || "./data/shop.db");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT DEFAULT '☕',
  sort INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  short_desc TEXT DEFAULT '',
  description TEXT DEFAULT '',
  price INTEGER NOT NULL,              -- تومان
  compare_price INTEGER DEFAULT 0,     -- قیمت قبل از تخفیف (تومان)
  stock INTEGER DEFAULT 0,
  weight INTEGER DEFAULT 250,          -- گرم
  options TEXT DEFAULT '',             -- گزینه‌ها با ویرگول: دانه,آسیاب اسپرسو,...
  image TEXT DEFAULT '',
  color TEXT DEFAULT '#6b3f26',
  badge TEXT DEFAULT '',
  is_active INTEGER DEFAULT 1,
  is_featured INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  rating REAL DEFAULT 5,
  basalam_id TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_products_cat ON products(category_id);

CREATE TABLE IF NOT EXISTS slides (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  button_text TEXT DEFAULT '',
  button_link TEXT DEFAULT '/shop',
  image TEXT DEFAULT '',
  bg TEXT DEFAULT '#3b2316',
  emoji TEXT DEFAULT '☕',
  sort INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  birthday TEXT DEFAULT '',
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  postal_code TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS point_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  order_id INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  kind TEXT NOT NULL,                 -- customer | admin
  user_id INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS coupons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'percent', -- percent | amount
  value INTEGER NOT NULL,
  min_total INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT 0,          -- 0 = نامحدود
  used INTEGER DEFAULT 0,
  club_only INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  expires_at TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT DEFAULT '',
  address TEXT NOT NULL,
  postal_code TEXT DEFAULT '',
  note TEXT DEFAULT '',
  subtotal INTEGER NOT NULL,
  discount INTEGER DEFAULT 0,
  points_used INTEGER DEFAULT 0,
  points_discount INTEGER DEFAULT 0,
  shipping INTEGER DEFAULT 0,
  total INTEGER NOT NULL,
  coupon_code TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending', -- pending | paid | processing | shipped | delivered | cancelled | failed
  payment_provider TEXT DEFAULT '',
  payment_authority TEXT DEFAULT '',
  payment_ref TEXT DEFAULT '',
  payment_meta TEXT DEFAULT '',
  points_earned INTEGER DEFAULT 0,
  tracking_code TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  paid_at TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER,
  name TEXT NOT NULL,
  option TEXT DEFAULT '',
  price INTEGER NOT NULL,
  qty INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;

declare global {
  // eslint-disable-next-line no-var
  var __mgDb: Database.Database | undefined;
}

function open(): Database.Database {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA);
  migrate(db);
  seedIfEmpty(db);
  return db;
}

/** ستون‌هایی که بعداً اضافه شدن، برای دیتابیس‌های قدیمی */
function migrate(db: Database.Database) {
  const cols = (t: string) => (db.prepare(`PRAGMA table_info(${t})`).all() as { name: string }[]).map((c) => c.name);
  if (!cols("products").includes("basalam_photo")) db.exec("ALTER TABLE products ADD COLUMN basalam_photo TEXT DEFAULT ''");
}

export function db(): Database.Database {
  if (!globalThis.__mgDb) globalThis.__mgDb = open();
  return globalThis.__mgDb;
}

export type Category = { id: number; name: string; slug: string; icon: string; sort: number };

export type Product = {
  id: number;
  name: string;
  category_id: number | null;
  short_desc: string;
  description: string;
  price: number;
  compare_price: number;
  stock: number;
  weight: number;
  options: string;
  image: string;
  color: string;
  badge: string;
  is_active: number;
  is_featured: number;
  sales_count: number;
  rating: number;
  basalam_id: string;
  basalam_photo: string;
  created_at: string;
  updated_at: string;
  category_name?: string;
};

export type Slide = {
  id: number;
  title: string;
  subtitle: string;
  button_text: string;
  button_link: string;
  image: string;
  bg: string;
  emoji: string;
  sort: number;
  is_active: number;
};

export type Customer = {
  id: number;
  name: string;
  phone: string;
  password_hash: string;
  points: number;
  total_spent: number;
  birthday: string;
  address: string;
  city: string;
  postal_code: string;
  created_at: string;
};

export type Order = {
  id: number;
  code: string;
  customer_id: number | null;
  name: string;
  phone: string;
  city: string;
  address: string;
  postal_code: string;
  note: string;
  subtotal: number;
  discount: number;
  points_used: number;
  points_discount: number;
  shipping: number;
  total: number;
  coupon_code: string;
  status: string;
  payment_provider: string;
  payment_authority: string;
  payment_ref: string;
  payment_meta: string;
  points_earned: number;
  tracking_code: string;
  created_at: string;
  paid_at: string;
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: number | null;
  name: string;
  option: string;
  price: number;
  qty: number;
};

export type Coupon = {
  id: number;
  code: string;
  type: "percent" | "amount";
  value: number;
  min_total: number;
  max_uses: number;
  used: number;
  club_only: number;
  is_active: number;
  expires_at: string;
};
