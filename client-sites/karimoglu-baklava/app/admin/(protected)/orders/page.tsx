import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { requirePageAccess } from "@/lib/auth/adminGuard";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { listOrders } from "@/lib/server/ordersAdminRepo";
import { branches } from "@/lib/mock-data";
import { ORDER_STATUS_LABELS } from "@/lib/server/orderStatusLabels";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

interface SearchParams {
  q?: string;
  status?: string;
  branchId?: string;
  page?: string;
  sortBy?: "created_at" | "total";
  sortDir?: "asc" | "desc";
}

function toman(amount: number): string {
  return `${amount.toLocaleString("fa-IR")} تومان`;
}

function buildQuery(params: SearchParams, overrides: Partial<SearchParams>): string {
  const merged = { ...params, ...overrides };
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value) search.set(key, String(value));
  }
  return `?${search.toString()}`;
}

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const access = await requirePageAccess("orders.view");
  if (!access.allowed) return <AccessDenied />;

  const page = Math.max(Number(searchParams.page) || 1, 1);
  const { rows, total } = await listOrders({
    search: searchParams.q,
    status: searchParams.status,
    branchId: searchParams.branchId,
    sortBy: searchParams.sortBy,
    sortDir: searchParams.sortDir,
    page,
    pageSize: PAGE_SIZE,
  });
  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  return (
    <Container className="flex flex-col gap-6 py-2">
      <div>
        <h1 className="text-h2 text-text-primary">سفارش‌ها</h1>
        <p className="text-bodySm text-text-secondary">{total.toLocaleString("fa-IR")} سفارش ثبت‌شده</p>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-3 rounded-lg bg-surface p-4 shadow-sm">
        <div className="flex flex-1 min-w-[200px] flex-col gap-1">
          <label className="text-caption text-text-muted">جستجو (شماره سفارش، نام یا موبایل مشتری)</label>
          <input name="q" defaultValue={searchParams.q} className="rounded-md border border-border-strong px-3 py-1.5 text-bodySm" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-caption text-text-muted">وضعیت</label>
          <select name="status" defaultValue={searchParams.status ?? ""} className="rounded-md border border-border-strong px-2 py-1.5 text-bodySm">
            <option value="">همه</option>
            {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-caption text-text-muted">شعبه</label>
          <select name="branchId" defaultValue={searchParams.branchId ?? ""} className="rounded-md border border-border-strong px-2 py-1.5 text-bodySm">
            <option value="">همه</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-caption text-text-muted">مرتب‌سازی</label>
          <select name="sortBy" defaultValue={searchParams.sortBy ?? "created_at"} className="rounded-md border border-border-strong px-2 py-1.5 text-bodySm">
            <option value="created_at">تاریخ</option>
            <option value="total">مبلغ</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-caption text-text-muted">جهت</label>
          <select name="sortDir" defaultValue={searchParams.sortDir ?? "desc"} className="rounded-md border border-border-strong px-2 py-1.5 text-bodySm">
            <option value="desc">نزولی</option>
            <option value="asc">صعودی</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-brand-black px-4 py-1.5 text-bodySm text-white">
          اعمال
        </button>
      </form>

      {rows.length === 0 ? (
        <div className="rounded-lg bg-surface p-8 text-center text-bodySm text-text-muted shadow-sm">
          هیچ سفارشی با این فیلترها یافت نشد.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-surface shadow-sm">
          <table className="w-full text-right text-bodySm">
            <thead className="border-b border-border text-caption text-text-muted">
              <tr>
                <th className="p-3">شماره سفارش</th>
                <th className="p-3">مشتری</th>
                <th className="p-3">مبلغ</th>
                <th className="p-3">شعبه</th>
                <th className="p-3">پرداخت</th>
                <th className="p-3">ارسال</th>
                <th className="p-3">وضعیت</th>
                <th className="p-3">تاریخ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0 hover:bg-bg-secondary">
                  <td className="p-3">
                    <Link href={`/admin/orders/${order.id}`} className="text-brand-red hover:underline">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="p-3">
                    {order.customerName}
                    <br />
                    <span className="text-caption text-text-muted" dir="ltr">
                      {order.customerPhone}
                    </span>
                  </td>
                  <td className="p-3 font-medium">{toman(order.total)}</td>
                  <td className="p-3">{order.branchName}</td>
                  <td className="p-3 text-caption">{order.paymentMethod === "online" ? "آنلاین" : order.paymentMethod}</td>
                  <td className="p-3 text-caption">{order.deliveryMethod === "express" ? "فوری" : "همان‌روز"}</td>
                  <td className="p-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="p-3 text-caption text-text-muted">{new Date(order.createdAt).toLocaleString("fa-IR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildQuery(searchParams, { page: String(p) })}
              className={`rounded-md px-3 py-1 text-bodySm ${p === page ? "bg-brand-black text-white" : "border border-border-strong text-text-secondary"}`}
            >
              {p.toLocaleString("fa-IR")}
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "delivered"
      ? "bg-state-successBg text-state-success"
      : status === "cancelled" || status === "failed"
        ? "bg-state-errorBg text-state-error"
        : "bg-state-warningBg text-state-warning";
  return <span className={`rounded-full px-2 py-0.5 text-caption ${tone}`}>{ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS] ?? status}</span>;
}
