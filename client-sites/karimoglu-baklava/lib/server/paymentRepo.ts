import { db } from "@/lib/db/client";
import type { PaymentTransaction } from "@/lib/types";

/** جایگزین `Map<string, PaymentTransaction>` قبلی — جدول واقعی `payment_transactions` */

interface PaymentRow {
  id: string;
  order_id: string;
  provider: string;
  method: string;
  amount: number;
  status: string;
  reference_id: string | null;
  created_at: string;
  updated_at: string;
}

function rowToPayment(row: PaymentRow): PaymentTransaction {
  return {
    id: row.id,
    orderId: row.order_id,
    provider: row.provider as PaymentTransaction["provider"],
    method: row.method as PaymentTransaction["method"],
    amount: row.amount,
    status: row.status as PaymentTransaction["status"],
    createdAt: row.created_at,
    verifiedAt: row.updated_at !== row.created_at ? row.updated_at : undefined,
    referenceId: row.reference_id ?? undefined,
  };
}

export async function setPayment(payment: PaymentTransaction): Promise<void> {
  const now = new Date().toISOString();
  const exists = await db.prepare("SELECT 1 FROM payment_transactions WHERE id = ?").get(payment.id);
  if (!exists) {
    await db.prepare(
      `INSERT INTO payment_transactions (id, order_id, provider, method, amount, status, reference_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(payment.id, payment.orderId, payment.provider, payment.method, payment.amount, payment.status, payment.referenceId ?? null, payment.createdAt, now);
  } else {
    await db.prepare(
      "UPDATE payment_transactions SET status = ?, reference_id = ?, updated_at = ? WHERE id = ?",
    ).run(payment.status, payment.referenceId ?? null, now, payment.id);
  }
}

export async function getPaymentById(id: string): Promise<PaymentTransaction | undefined> {
  const row = await db.prepare("SELECT * FROM payment_transactions WHERE id = ?").get(id) as PaymentRow | undefined;
  return row ? rowToPayment(row) : undefined;
}

/** جستجوی تراکنش در‌انتظار یک سفارش — جایگزین `[...db.payments.values()].find(...)` قبلی، بدون اسکن کامل */
export async function findPendingPaymentByOrderId(orderId: string): Promise<PaymentTransaction | undefined> {
  const row = await db
    .prepare("SELECT * FROM payment_transactions WHERE order_id = ? AND status = 'pending' LIMIT 1")
    .get(orderId) as PaymentRow | undefined;
  return row ? rowToPayment(row) : undefined;
}

export async function getPaymentsByOrderId(orderId: string): Promise<PaymentTransaction[]> {
  const rows = await db.prepare("SELECT * FROM payment_transactions WHERE order_id = ? ORDER BY created_at DESC").all(orderId) as PaymentRow[];
  return rows.map(rowToPayment);
}
