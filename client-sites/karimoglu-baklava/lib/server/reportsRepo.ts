import { db } from "@/lib/db/client";
import { branches } from "@/lib/mock-data";
import type { OrderStatus } from "@/lib/types";

/**
 * ===== لایه گزارش‌گیری (Prompt 11، بخش ۱ و ۱۱) =====
 *
 * تمام اعداد این فایل مستقیماً از جدول‌های واقعی `orders`/`order_items`
 * محاسبه می‌شوند — هیچ عدد Mock/ثابتی در این فایل نیست. اگر هنوز سفارشی
 * ثبت نشده باشد، همه‌چیز به‌درستی صفر برمی‌گردد (نه یک عدد ساختگی).
 */

function todayRangeIso(): { from: string; to: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { from: start.toISOString(), to: end.toISOString() };
}

// وضعیت‌هایی که «سفارش نهایی‌شده و در جریان کسب‌وکار» محسوب می‌شوند — لغو/شکست‌خورده از فروش کنار گذاشته می‌شوند
const REVENUE_STATUSES: OrderStatus[] = ["paid", "processing", "preparing", "ready", "out_for_delivery", "delivered"];

function inClause(values: string[]): string {
  return values.map(() => "?").join(", ");
}

export interface DashboardSummary {
  todaysSales: number;
  todaysOrderCount: number;
  ordersByStatus: Record<string, number>;
  lowStockCount: number;
  outOfStockCount: number;
  branchPerformance: { branchId: string; branchName: string; orderCount: number; revenue: number }[];
  topProducts: { productId: string; productName: string; quantitySold: number; revenue: number }[];
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { from, to } = todayRangeIso();

  const todays = await db
    .prepare(
      `SELECT COUNT(*) as cnt, COALESCE(SUM(total), 0) as revenue
       FROM orders WHERE created_at >= ? AND created_at < ? AND status IN (${inClause(REVENUE_STATUSES)})`,
    )
    .get(from, to, ...REVENUE_STATUSES) as { cnt: number; revenue: number };

  const statusRows = await db.prepare("SELECT status, COUNT(*) as cnt FROM orders GROUP BY status").all() as {
    status: string;
    cnt: number;
  }[];
  const ordersByStatus: Record<string, number> = {};
  for (const row of statusRows) ordersByStatus[row.status] = row.cnt;

  const branchRows = await db
    .prepare(
      `SELECT branch_id, branch_name, COUNT(*) as cnt, COALESCE(SUM(total), 0) as revenue
       FROM orders WHERE status IN (${inClause(REVENUE_STATUSES)}) GROUP BY branch_id`,
    )
    .all(...REVENUE_STATUSES) as { branch_id: string; branch_name: string; cnt: number; revenue: number }[];

  const branchPerformance = branchRows
    .map((r) => ({ branchId: r.branch_id, branchName: r.branch_name, orderCount: r.cnt, revenue: r.revenue }))
    .sort((a, b) => b.revenue - a.revenue);

  const topProductRows = await db
    .prepare(
      `SELECT oi.product_id, oi.product_name, SUM(oi.quantity) as qty, SUM(oi.line_total) as revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.status IN (${inClause(REVENUE_STATUSES)})
       GROUP BY oi.product_id, oi.product_name
       ORDER BY qty DESC
       LIMIT 10`,
    )
    .all(...REVENUE_STATUSES) as { product_id: string; product_name: string; qty: number; revenue: number }[];

  return {
    todaysSales: todays.revenue,
    todaysOrderCount: todays.cnt,
    ordersByStatus,
    lowStockCount: 0, // در Route با getLowStockItems پر می‌شود (وابستگی مستقیم به inventory/core اینجا اجتناب شد تا این فایل تک‌مسئولیتی بماند)
    outOfStockCount: 0,
    branchPerformance,
    topProducts: topProductRows.map((r) => ({
      productId: r.product_id,
      productName: r.product_name,
      quantitySold: r.qty,
      revenue: r.revenue,
    })),
  };
}

export type SalesPeriod = "daily" | "weekly" | "monthly" | "yearly";

const VALID_SALES_PERIODS: SalesPeriod[] = ["daily", "weekly", "monthly", "yearly"];

/** نوع `SalesPeriod` فقط زمان Build بررسی می‌شود؛ ورودی واقعی این تابع از
 *  `searchParams` صفحه گزارش می‌آید که در Runtime فقط رشته خام URL است (نه
 *  یک مقدار تضمین‌شده از این Union) — یعنی TypeScript این مسیر را ایمن نشان
 *  می‌دهد اما در عمل ایمن نیست. پیش از این، مقدار نامعتبر باعث می‌شد Switch
 *  بدون match بماند و تابع `undefined` برگرداند که مستقیم داخل رشته SQL
 *  (`strftime('${undefined}', ...)`) جای می‌گرفت و Query را با خطا می‌شکست —
 *  نه یک آسیب‌پذیری SQL Injection (چون مقدار ورودی کاربر مستقیماً درون Query
 *  قرار نمی‌گرفت، فقط خروجی ثابت این تابع)، اما یک نقطه ضعف Robustness/DoS
 *  ساده بود که با یک `?period=` دلخواه در URL قابل تحریک بود. */
export function isValidSalesPeriod(value: unknown): value is SalesPeriod {
  return typeof value === "string" && (VALID_SALES_PERIODS as string[]).includes(value);
}

/** فرمت‌دهی `to_char` در PostgreSQL برای گروه‌بندی زمانی — طبق دوره درخواستی (بر پایه UTC) */
function periodFormat(period: SalesPeriod): string {
  switch (period) {
    case "daily":
      return "YYYY-MM-DD";
    case "weekly":
      return "IYYY-IW"; // سال-شماره هفته (ISO، شروع هفته از دوشنبه)
    case "monthly":
      return "YYYY-MM";
    case "yearly":
      return "YYYY";
    default:
      // دفاع در عمق: اگر روزی این تابع از جایی غیر از `getSalesReport` (که
      // اکنون ورودی را Runtime اعتبارسنجی می‌کند) صدا زده شود، به‌جای
      // برگرداندن `undefined` و شکستن Query، صریحاً خطا می‌دهد.
      throw new Error(`دوره گزارش نامعتبر: ${period as string}`);
  }
}

export interface SalesReportRow {
  period: string;
  orderCount: number;
  revenue: number;
}

export async function getSalesReport(period: SalesPeriod, from?: string, to?: string): Promise<SalesReportRow[]> {
  // اعتبارسنجی Runtime واقعی (نه فقط تکیه به نوع TypeScript) — رجوع به توضیح
  // بالای `isValidSalesPeriod`.
  const safePeriod: SalesPeriod = isValidSalesPeriod(period) ? period : "daily";

  const clauses = [`status IN (${inClause(REVENUE_STATUSES)})`];
  const params: unknown[] = [...REVENUE_STATUSES];
  if (from) {
    clauses.push("created_at >= ?");
    params.push(from);
  }
  if (to) {
    clauses.push("created_at < ?");
    params.push(to);
  }

  const rows = await db
    .prepare(
      `SELECT to_char(created_at::timestamptz AT TIME ZONE 'UTC', '${periodFormat(safePeriod)}') as period, COUNT(*) as cnt, COALESCE(SUM(total), 0) as revenue
       FROM orders WHERE ${clauses.join(" AND ")} GROUP BY period ORDER BY period ASC`,
    )
    .all(...params) as { period: string; cnt: number; revenue: number }[];

  return rows.map((r) => ({ period: r.period, orderCount: r.cnt, revenue: r.revenue }));
}

export async function getSalesByBranch(from?: string, to?: string): Promise<{ branchId: string; branchName: string; orderCount: number; revenue: number }[]> {
  const clauses = [`status IN (${inClause(REVENUE_STATUSES)})`];
  const params: unknown[] = [...REVENUE_STATUSES];
  if (from) {
    clauses.push("created_at >= ?");
    params.push(from);
  }
  if (to) {
    clauses.push("created_at < ?");
    params.push(to);
  }
  const rows = await db
    .prepare(
      `SELECT branch_id, branch_name, COUNT(*) as cnt, COALESCE(SUM(total), 0) as revenue
       FROM orders WHERE ${clauses.join(" AND ")} GROUP BY branch_id, branch_name ORDER BY revenue DESC`,
    )
    .all(...params) as { branch_id: string; branch_name: string; cnt: number; revenue: number }[];
  return rows.map((r) => ({ branchId: r.branch_id, branchName: r.branch_name, orderCount: r.cnt, revenue: r.revenue }));
}

export async function getTopProducts(limit = 10, from?: string, to?: string): Promise<{ productId: string; productName: string; quantitySold: number; revenue: number }[]> {
  return await topOrBottomProducts("DESC", limit, from, to);
}

export async function getLowSellingProducts(limit = 10, from?: string, to?: string): Promise<{ productId: string; productName: string; quantitySold: number; revenue: number }[]> {
  return await topOrBottomProducts("ASC", limit, from, to);
}

async function topOrBottomProducts(direction: "ASC" | "DESC", limit: number, from?: string, to?: string) {
  const clauses = [`o.status IN (${inClause(REVENUE_STATUSES)})`];
  const params: unknown[] = [...REVENUE_STATUSES];
  if (from) {
    clauses.push("o.created_at >= ?");
    params.push(from);
  }
  if (to) {
    clauses.push("o.created_at < ?");
    params.push(to);
  }
  const rows = await db
    .prepare(
      `SELECT oi.product_id, oi.product_name, SUM(oi.quantity) as qty, SUM(oi.line_total) as revenue
       FROM order_items oi JOIN orders o ON o.id = oi.order_id
       WHERE ${clauses.join(" AND ")}
       GROUP BY oi.product_id, oi.product_name
       ORDER BY qty ${direction}
       LIMIT ?`,
    )
    .all(...params, limit) as { product_id: string; product_name: string; qty: number; revenue: number }[];
  return rows.map((r) => ({ productId: r.product_id, productName: r.product_name, quantitySold: r.qty, revenue: r.revenue }));
}

export interface OrderStatsReport {
  orderCount: number;
  averageOrderValue: number;
  cancellationRate: number; // ۰ تا ۱۰۰
  paymentStatusBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
}

export async function getOrderStatsReport(from?: string, to?: string): Promise<OrderStatsReport> {
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (from) {
    clauses.push("created_at >= ?");
    params.push(from);
  }
  if (to) {
    clauses.push("created_at < ?");
    params.push(to);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  const totals = await db
    .prepare(`SELECT COUNT(*) as cnt, COALESCE(AVG(total), 0) as "avgTotal" FROM orders ${where}`)
    .get(...params) as { cnt: number; avgTotal: number };

  const cancelledCount = (
    await db.prepare(`SELECT COUNT(*) as cnt FROM orders ${where} ${where ? "AND" : "WHERE"} status = 'cancelled'`).get(
      ...params,
    ) as { cnt: number }
  ).cnt;

  const paymentRows = await db
    .prepare(`SELECT payment_status, COUNT(*) as cnt FROM orders ${where} GROUP BY payment_status`)
    .all(...params) as { payment_status: string; cnt: number }[];
  const statusRows = await db.prepare(`SELECT status, COUNT(*) as cnt FROM orders ${where} GROUP BY status`).all(
    ...params,
  ) as { status: string; cnt: number }[];

  const paymentStatusBreakdown: Record<string, number> = {};
  for (const r of paymentRows) paymentStatusBreakdown[r.payment_status] = r.cnt;
  const statusBreakdown: Record<string, number> = {};
  for (const r of statusRows) statusBreakdown[r.status] = r.cnt;

  return {
    orderCount: totals.cnt,
    averageOrderValue: Math.round(totals.avgTotal),
    cancellationRate: totals.cnt > 0 ? Math.round((cancelledCount / totals.cnt) * 1000) / 10 : 0,
    paymentStatusBreakdown,
    statusBreakdown,
  };
}

/** برای رفع خالی نبودن نام شعبه در گزارش‌هایی که هنوز هیچ سفارشی ندارند */
export function getAllBranchLabels(): { branchId: string; branchName: string }[] {
  return branches.map((b) => ({ branchId: b.id, branchName: b.name }));
}
