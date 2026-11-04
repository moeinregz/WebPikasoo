import "server-only";
import crypto from "crypto";
import { db, type Coupon, type Customer, type Order, type OrderItem, type Product } from "./db";
import { getSettings, num } from "./settings";
import { pointsFor } from "./club";

export type CartLine = { id: number; qty: number; option?: string };

export type QuoteLine = { product_id: number; name: string; option: string; price: number; qty: number; line: number; image: string; color: string; stock: number };

export type Quote = {
  lines: QuoteLine[];
  subtotal: number;
  discount: number;
  coupon: string;
  couponError: string;
  shipping: number;
  pointsUsed: number;
  pointsDiscount: number;
  maxPoints: number;
  total: number;
  errors: string[];
};

/** محاسبه‌ی قیمت سمت سرور. هیچ قیمتی از مرورگر قبول نمی‌شه. */
export function quote(cart: CartLine[], opts: { coupon?: string; usePoints?: boolean; customer?: Customer | null }): Quote {
  const s = getSettings();
  const errors: string[] = [];
  const lines: QuoteLine[] = [];
  const getP = db().prepare("SELECT * FROM products WHERE id = ?");

  for (const c of (cart || []).slice(0, 50)) {
    const qty = Math.max(1, Math.min(50, Math.floor(Number(c.qty) || 1)));
    const p = getP.get(Number(c.id)) as Product | undefined;
    if (!p || !p.is_active) {
      errors.push("یکی از محصولات سبد دیگه موجود نیست و حذف شد.");
      continue;
    }
    const opts = p.options ? p.options.split(",").map((x) => x.trim()).filter(Boolean) : [];
    const option = c.option && opts.includes(c.option) ? c.option : opts[0] || "";
    let q = qty;
    if (p.stock < q) {
      if (p.stock <= 0) {
        errors.push(`«${p.name}» ناموجود شد.`);
        continue;
      }
      errors.push(`از «${p.name}» فقط ${p.stock} عدد موجوده.`);
      q = p.stock;
    }
    lines.push({ product_id: p.id, name: p.name, option, price: p.price, qty: q, line: p.price * q, image: p.image, color: p.color, stock: p.stock });
  }

  const subtotal = lines.reduce((a, l) => a + l.line, 0);

  let discount = 0;
  let couponError = "";
  let coupon = "";
  if (opts.coupon) {
    const code = opts.coupon.trim().toUpperCase();
    const cp = db().prepare("SELECT * FROM coupons WHERE UPPER(code) = ?").get(code) as Coupon | undefined;
    if (!cp || !cp.is_active) couponError = "کد تخفیف معتبر نیست.";
    else if (cp.expires_at && new Date(cp.expires_at) < new Date()) couponError = "مهلت این کد تموم شده.";
    else if (cp.max_uses && cp.used >= cp.max_uses) couponError = "ظرفیت این کد تکمیل شده.";
    else if (cp.club_only && !opts.customer) couponError = "این کد فقط برای اعضای باشگاهه؛ اول وارد شو.";
    else if (subtotal < cp.min_total) couponError = `این کد برای خرید بالای ${cp.min_total.toLocaleString("fa-IR")} تومانه.`;
    else {
      discount = cp.type === "percent" ? Math.floor((subtotal * Math.min(100, cp.value)) / 100) : Math.min(subtotal, cp.value);
      coupon = cp.code;
    }
  }

  const afterDiscount = subtotal - discount;
  const freeOver = num(s, "free_shipping_over");
  const shipping = lines.length === 0 ? 0 : freeOver && afterDiscount >= freeOver ? 0 : num(s, "shipping_fee");

  // امتیاز باشگاه
  const pointValue = Math.max(0, num(s, "club_point_value", 100));
  const maxPct = Math.max(0, Math.min(100, num(s, "club_max_redeem_percent", 30)));
  let maxPoints = 0;
  let pointsUsed = 0;
  if (opts.customer && pointValue > 0) {
    const capByOrder = Math.floor((afterDiscount * maxPct) / 100 / pointValue);
    maxPoints = Math.max(0, Math.min(opts.customer.points, capByOrder));
    if (opts.usePoints) pointsUsed = maxPoints;
  }
  const pointsDiscount = pointsUsed * pointValue;
  const total = Math.max(0, afterDiscount - pointsDiscount + shipping);

  return { lines, subtotal, discount, coupon, couponError, shipping, pointsUsed, pointsDiscount, maxPoints, total, errors };
}

function orderCode(): string {
  // MG + ۸ رقم تصادفی
  return "MG" + crypto.randomInt(10_000_000, 99_999_999);
}

export type CheckoutInfo = { name: string; phone: string; city: string; address: string; postal_code: string; note: string };

export function createOrder(q: Quote, info: CheckoutInfo, customer: Customer | null, provider: string): Order {
  const d = db();
  const tx = d.transaction(() => {
    let code = orderCode();
    while (d.prepare("SELECT 1 FROM orders WHERE code = ?").get(code)) code = orderCode();
    const r = d
      .prepare(
        `INSERT INTO orders (code, customer_id, name, phone, city, address, postal_code, note, subtotal, discount, points_used, points_discount, shipping, total, coupon_code, payment_provider)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(code, customer?.id ?? null, info.name, info.phone, info.city, info.address, info.postal_code, info.note, q.subtotal, q.discount, q.pointsUsed, q.pointsDiscount, q.shipping, q.total, q.coupon, provider);
    const orderId = Number(r.lastInsertRowid);
    const li = d.prepare("INSERT INTO order_items (order_id, product_id, name, option, price, qty) VALUES (?, ?, ?, ?, ?, ?)");
    for (const l of q.lines) li.run(orderId, l.product_id, l.name, l.option, l.price, l.qty);

    if (customer && q.pointsUsed > 0) {
      // امتیاز همین الان کم می‌شه (رزرو)؛ اگه پرداخت ناموفق بشه برمی‌گرده.
      d.prepare("UPDATE customers SET points = points - ? WHERE id = ?").run(q.pointsUsed, customer.id);
      d.prepare("INSERT INTO point_logs (customer_id, amount, reason, order_id) VALUES (?, ?, ?, ?)").run(customer.id, -q.pointsUsed, `استفاده در سفارش ${code}`, orderId);
    }
    if (customer) {
      // آدرس آخرین سفارش برای دفعه‌ی بعد تو پروفایل ذخیره می‌شه
      d.prepare("UPDATE customers SET address = ?, city = ?, postal_code = ? WHERE id = ?").run(info.address, info.city, info.postal_code, customer.id);
    }
    return d.prepare("SELECT * FROM orders WHERE id = ?").get(orderId) as Order;
  });
  return tx();
}

export function orderByCode(code: string): Order | null {
  return (db().prepare("SELECT * FROM orders WHERE code = ?").get(code) as Order) || null;
}

export function orderItems(orderId: number): OrderItem[] {
  return db().prepare("SELECT * FROM order_items WHERE order_id = ?").all(orderId) as OrderItem[];
}

export function setPaymentAuthority(orderId: number, authority: string, meta?: unknown) {
  db()
    .prepare("UPDATE orders SET payment_authority = ?, payment_meta = ? WHERE id = ?")
    .run(authority, meta ? JSON.stringify(meta) : "", orderId);
}

/** پرداخت موفق: کم کردن موجودی، شمارش فروش، امتیاز باشگاه. فقط یک بار اجرا می‌شه. */
export function markPaid(orderId: number, ref: string, meta?: unknown): Order {
  const d = db();
  const s = getSettings();
  const tx = d.transaction(() => {
    const o = d.prepare("SELECT * FROM orders WHERE id = ?").get(orderId) as Order;
    if (o.status !== "pending") return o;
    d.prepare("UPDATE orders SET status = 'paid', payment_ref = ?, paid_at = datetime('now'), payment_meta = COALESCE(?, payment_meta) WHERE id = ?").run(
      ref,
      meta ? JSON.stringify(meta) : null,
      orderId
    );
    for (const it of orderItems(orderId)) {
      if (!it.product_id) continue;
      d.prepare("UPDATE products SET stock = MAX(0, stock - ?), sales_count = sales_count + ? WHERE id = ?").run(it.qty, it.qty, it.product_id);
    }
    if (o.coupon_code) d.prepare("UPDATE coupons SET used = used + 1 WHERE code = ?").run(o.coupon_code);
    if (o.customer_id) {
      const c = d.prepare("SELECT * FROM customers WHERE id = ?").get(o.customer_id) as Customer | undefined;
      if (c) {
        const earned = pointsFor(o.total - o.shipping, c.total_spent, num(s, "club_earn_per", 10000));
        d.prepare("UPDATE customers SET points = points + ?, total_spent = total_spent + ? WHERE id = ?").run(earned, o.total, c.id);
        if (earned > 0) d.prepare("INSERT INTO point_logs (customer_id, amount, reason, order_id) VALUES (?, ?, ?, ?)").run(c.id, earned, `خرید ${o.code}`, o.id);
        d.prepare("UPDATE orders SET points_earned = ? WHERE id = ?").run(earned, o.id);
      }
    }
    return d.prepare("SELECT * FROM orders WHERE id = ?").get(orderId) as Order;
  });
  return tx();
}

export function markFailed(orderId: number, reason = ""): Order {
  const d = db();
  const tx = d.transaction(() => {
    const o = d.prepare("SELECT * FROM orders WHERE id = ?").get(orderId) as Order;
    if (o.status !== "pending") return o;
    d.prepare("UPDATE orders SET status = 'failed', note = CASE WHEN ? = '' THEN note ELSE note || ' | ' || ? END WHERE id = ?").run(reason, reason, orderId);
    if (o.customer_id && o.points_used > 0) {
      d.prepare("UPDATE customers SET points = points + ? WHERE id = ?").run(o.points_used, o.customer_id);
      d.prepare("INSERT INTO point_logs (customer_id, amount, reason, order_id) VALUES (?, ?, ?, ?)").run(o.customer_id, o.points_used, `برگشت امتیاز سفارش ناموفق ${o.code}`, o.id);
    }
    return d.prepare("SELECT * FROM orders WHERE id = ?").get(orderId) as Order;
  });
  return tx();
}
