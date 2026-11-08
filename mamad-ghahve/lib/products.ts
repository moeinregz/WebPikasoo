import "server-only";
import { db, type Category, type Product, type Slide } from "./db";

const BASE = `SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id`;

export function categories(): Category[] {
  return db().prepare("SELECT * FROM categories ORDER BY sort, id").all() as Category[];
}

export function newest(limit = 10): Product[] {
  return db().prepare(`${BASE} WHERE p.is_active = 1 ORDER BY p.created_at DESC, p.id DESC LIMIT ?`).all(limit) as Product[];
}

export function popular(limit = 10): Product[] {
  return db().prepare(`${BASE} WHERE p.is_active = 1 ORDER BY p.sales_count DESC, p.rating DESC LIMIT ?`).all(limit) as Product[];
}

export function discounted(limit = 10): Product[] {
  return db()
    .prepare(`${BASE} WHERE p.is_active = 1 AND p.compare_price > p.price ORDER BY (p.compare_price - p.price) * 1.0 / p.compare_price DESC LIMIT ?`)
    .all(limit) as Product[];
}

export function featured(limit = 10): Product[] {
  return db().prepare(`${BASE} WHERE p.is_active = 1 AND p.is_featured = 1 ORDER BY p.id DESC LIMIT ?`).all(limit) as Product[];
}

export function productById(id: number): Product | null {
  return (db().prepare(`${BASE} WHERE p.id = ?`).get(id) as Product) || null;
}

export function related(p: Product, limit = 8): Product[] {
  return db()
    .prepare(`${BASE} WHERE p.is_active = 1 AND p.id != ? AND p.category_id IS ? ORDER BY p.sales_count DESC LIMIT ?`)
    .all(p.id, p.category_id, limit) as Product[];
}

export type ShopQuery = { cat?: string; q?: string; sort?: string; sale?: string };

export function searchProducts(q: ShopQuery): Product[] {
  const where = ["p.is_active = 1"];
  const args: unknown[] = [];
  if (q.cat) {
    where.push("c.slug = ?");
    args.push(q.cat);
  }
  if (q.q) {
    where.push("(p.name LIKE ? OR p.short_desc LIKE ? OR p.description LIKE ?)");
    const like = `%${q.q}%`;
    args.push(like, like, like);
  }
  if (q.sale) where.push("p.compare_price > p.price");
  const order =
    q.sort === "cheap" ? "p.price ASC" : q.sort === "expensive" ? "p.price DESC" : q.sort === "popular" ? "p.sales_count DESC" : "p.created_at DESC, p.id DESC";
  return db().prepare(`${BASE} WHERE ${where.join(" AND ")} ORDER BY ${order}`).all(...args) as Product[];
}

export function activeSlides(): Slide[] {
  return db().prepare("SELECT * FROM slides WHERE is_active = 1 ORDER BY sort, id").all() as Slide[];
}

/** نسخه‌ی سبک برای کامپوننت‌های کلاینت */
export type CardProduct = Pick<
  Product,
  "id" | "name" | "short_desc" | "price" | "compare_price" | "stock" | "image" | "color" | "badge" | "options" | "category_name" | "rating"
>;

export function toCard(p: Product): CardProduct {
  return {
    id: p.id,
    name: p.name,
    short_desc: p.short_desc,
    price: p.price,
    compare_price: p.compare_price,
    stock: p.stock,
    image: p.image,
    color: p.color,
    badge: p.badge,
    options: p.options,
    category_name: p.category_name,
    rating: p.rating,
  };
}
