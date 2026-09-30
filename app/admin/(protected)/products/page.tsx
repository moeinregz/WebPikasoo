import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { requirePageAccess } from "@/lib/auth/adminGuard";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { listCategories, listProducts } from "@/lib/server/productsRepo";
import { AdminPagination } from "@/components/admin/AdminPagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

interface SearchParams {
  q?: string;
  categoryId?: string;
  status?: "active" | "inactive" | "deleted" | "all";
  page?: string;
}

export default function AdminProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const access = requirePageAccess("products.manage");
  if (!access.allowed) return <AccessDenied />;

  const categories = listCategories();
  const pageSize = PAGE_SIZE;
  const filters = {
    search: searchParams.q,
    categoryId: searchParams.categoryId,
    status: searchParams.status ?? "active",
  } as const;
  const requestedPage = Math.max(Number(searchParams.page) || 1, 1);
  let { rows, total } = listProducts({ ...filters, page: requestedPage, pageSize });
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const page = Math.min(requestedPage, totalPages);
  // اگر شماره صفحه از تعداد صفحات بیشتر بود (مثلاً بعد از اعمال فیلتر)، آخرین صفحه را نشان بده
  if (page !== requestedPage) ({ rows, total } = listProducts({ ...filters, page, pageSize }));

  return (
    <Container className="flex flex-col gap-6 py-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2 text-text-primary">محصولات</h1>
          <p className="text-bodySm text-text-secondary">{total.toLocaleString("fa-IR")} محصول</p>
        </div>
        <Link href="/admin/products/new" className="rounded-md bg-brand-black px-4 py-2 text-bodySm text-white">
          + محصول جدید
        </Link>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-3 rounded-lg bg-surface p-4 shadow-sm">
        <div className="flex flex-1 min-w-[200px] flex-col gap-1">
          <label className="text-caption text-text-muted">جستجو</label>
          <input name="q" defaultValue={searchParams.q} className="rounded-md border border-border-strong px-3 py-1.5 text-bodySm" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-caption text-text-muted">دسته‌بندی</label>
          <select name="categoryId" defaultValue={searchParams.categoryId ?? ""} className="rounded-md border border-border-strong px-2 py-1.5 text-bodySm">
            <option value="">همه</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-caption text-text-muted">وضعیت</label>
          <select name="status" defaultValue={searchParams.status ?? "active"} className="rounded-md border border-border-strong px-2 py-1.5 text-bodySm">
            <option value="active">فعال</option>
            <option value="inactive">غیرفعال</option>
            <option value="deleted">حذف‌شده</option>
            <option value="all">همه</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-brand-black px-4 py-1.5 text-bodySm text-white">
          اعمال
        </button>
      </form>

      {rows.length === 0 ? (
        <div className="rounded-lg bg-surface p-8 text-center text-bodySm text-text-muted shadow-sm">محصولی یافت نشد.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-surface shadow-sm">
          <table className="w-full text-right text-bodySm">
            <thead className="border-b border-border text-caption text-text-muted">
              <tr>
                <th className="p-3">نام</th>
                <th className="p-3">دسته‌بندی</th>
                <th className="p-3">تعداد Variant</th>
                <th className="p-3">شروع قیمت</th>
                <th className="p-3">وضعیت</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="p-3">{p.name}</td>
                  <td className="p-3 text-caption text-text-muted">{p.categoryLabel}</td>
                  <td className="p-3">{p.variantCount.toLocaleString("fa-IR")}</td>
                  <td className="p-3">{p.startingPrice ? `${p.startingPrice.toLocaleString("fa-IR")} تومان` : "—"}</td>
                  <td className="p-3">
                    {p.isDeleted ? (
                      <span className="rounded-full bg-state-errorBg px-2 py-0.5 text-caption text-state-error">حذف‌شده</span>
                    ) : p.isActive ? (
                      <span className="rounded-full bg-state-successBg px-2 py-0.5 text-caption text-state-success">فعال</span>
                    ) : (
                      <span className="rounded-full bg-state-warningBg px-2 py-0.5 text-caption text-state-warning">غیرفعال</span>
                    )}
                  </td>
                  <td className="p-3">
                    <Link href={`/admin/products/${p.id}`} className="text-caption text-brand-red hover:underline">
                      ویرایش
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminPagination
        basePath="/admin/products"
        currentPage={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        params={{ q: searchParams.q, categoryId: searchParams.categoryId, status: searchParams.status }}
      />
    </Container>
  );
}
