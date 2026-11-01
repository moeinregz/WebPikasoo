import { db } from "@/lib/db/client";

export interface OrderListFilters {
  search?: string;
  status?: string;
  branchId?: string;
  paymentMethod?: string;
  deliveryMethod?: string;
  from?: string;
  to?: string;
  sortBy?: "created_at" | "total";
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface OrderListRow {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  total: number;
  branchName: string;
  paymentMethod: string;
  deliveryMethod: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

interface OrderListRowDb {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  total: number;
  branch_name: string;
  payment_method: string;
  delivery_method: string;
  status: string;
  payment_status: string;
  created_at: string;
}

const SORT_COLUMNS = { created_at: "created_at", total: "total" } as const;

/** لیست سفارش‌ها برای صفحه مدیریت — طبق بخش ۲ Prompt 11 (جستجو، فیلتر، Sort، Pagination) */
export async function listOrders(filters: OrderListFilters = {}): Promise<{ rows: OrderListRow[]; total: number }> {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.search) {
    clauses.push("(order_number ILIKE ? OR customer_name ILIKE ? OR customer_phone ILIKE ?)");
    const like = `%${filters.search}%`;
    params.push(like, like, like);
  }
  if (filters.status) {
    clauses.push("status = ?");
    params.push(filters.status);
  }
  if (filters.branchId) {
    clauses.push("branch_id = ?");
    params.push(filters.branchId);
  }
  if (filters.paymentMethod) {
    clauses.push("payment_method = ?");
    params.push(filters.paymentMethod);
  }
  if (filters.deliveryMethod) {
    clauses.push("delivery_method = ?");
    params.push(filters.deliveryMethod);
  }
  if (filters.from) {
    clauses.push("created_at >= ?");
    params.push(filters.from);
  }
  if (filters.to) {
    clauses.push("created_at < ?");
    params.push(filters.to);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const sortColumn = SORT_COLUMNS[filters.sortBy ?? "created_at"];
  const sortDir = filters.sortDir === "asc" ? "ASC" : "DESC";
  const pageSize = Math.min(Math.max(filters.pageSize ?? 20, 1), 100);
  const page = Math.max(filters.page ?? 1, 1);
  const offset = (page - 1) * pageSize;

  const total = (await db.prepare(`SELECT COUNT(*) as c FROM orders ${where}`).get(...params) as { c: number }).c;

  const rows = await db
    .prepare(
      `SELECT id, order_number, customer_name, customer_phone, total, branch_name, payment_method, delivery_method, status, payment_status, created_at
       FROM orders ${where} ORDER BY ${sortColumn} ${sortDir} LIMIT ? OFFSET ?`,
    )
    .all(...params, pageSize, offset) as OrderListRowDb[];

  return {
    total,
    rows: rows.map((r) => ({
      id: r.id,
      orderNumber: r.order_number,
      customerName: r.customer_name,
      customerPhone: r.customer_phone,
      total: r.total,
      branchName: r.branch_name,
      paymentMethod: r.payment_method,
      deliveryMethod: r.delivery_method,
      status: r.status,
      paymentStatus: r.payment_status,
      createdAt: r.created_at,
    })),
  };
}
