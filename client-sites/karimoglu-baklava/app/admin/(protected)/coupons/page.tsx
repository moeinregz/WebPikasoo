import { Container } from "@/components/ui/Container";
import { requirePageAccess } from "@/lib/auth/adminGuard";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { listCampaigns, listCoupons } from "@/lib/server/couponsRepo";
import { CouponCreateForm } from "@/components/admin/CouponCreateForm";
import { CampaignCreateForm, CouponActiveToggle } from "@/components/admin/CampaignCoupon";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const access = await requirePageAccess("coupons.manage");
  if (!access.allowed) return <AccessDenied />;

  const campaigns = await listCampaigns();
  const coupons = await listCoupons();

  return (
    <Container className="flex flex-col gap-8 py-2">
      <div>
        <h1 className="text-h2 text-text-primary">تخفیف و کمپین</h1>
        <p className="text-bodySm text-text-secondary">
          ⚠️ این بخش امکان تعریف کد تخفیف/کمپین را می‌دهد؛ اتصال آن به محاسبه قیمت در Checkout هنوز پیاده‌سازی نشده (مرحله بعد).
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-h4 text-text-primary">کمپین‌ها</h2>
        <CampaignCreateForm />
        <div className="mt-3 overflow-x-auto rounded-lg bg-surface shadow-sm">
          <table className="w-full text-right text-bodySm">
            <thead className="border-b border-border text-caption text-text-muted">
              <tr>
                <th className="p-3">نام</th>
                <th className="p-3">بازه</th>
                <th className="p-3">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-text-muted">
                    هنوز کمپینی ثبت نشده.
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="p-3">{c.name}</td>
                    <td className="p-3 text-caption text-text-muted">
                      {c.startsAt ?? "—"} تا {c.endsAt ?? "—"}
                    </td>
                    <td className="p-3">{c.isActive ? "فعال" : "غیرفعال"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-h4 text-text-primary">کدهای تخفیف</h2>
        <CouponCreateForm campaigns={campaigns} />
        <div className="mt-3 overflow-x-auto rounded-lg bg-surface shadow-sm">
          <table className="w-full text-right text-bodySm">
            <thead className="border-b border-border text-caption text-text-muted">
              <tr>
                <th className="p-3">کد</th>
                <th className="p-3">تخفیف</th>
                <th className="p-3">حداقل سفارش</th>
                <th className="p-3">استفاده</th>
                <th className="p-3">وضعیت</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-text-muted">
                    هنوز کد تخفیفی ثبت نشده.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="p-3" dir="ltr">
                      {c.code}
                    </td>
                    <td className="p-3">{c.percent ? `${c.percent}٪` : c.amount ? `${c.amount.toLocaleString("fa-IR")} تومان` : "—"}</td>
                    <td className="p-3">{c.minOrderAmount ? `${c.minOrderAmount.toLocaleString("fa-IR")} تومان` : "—"}</td>
                    <td className="p-3">
                      {c.usedCount.toLocaleString("fa-IR")}
                      {c.maxUses ? ` / ${c.maxUses.toLocaleString("fa-IR")}` : ""}
                    </td>
                    <td className="p-3">{c.isActive ? "فعال" : "غیرفعال"}</td>
                    <td className="p-3">
                      <CouponActiveToggle id={c.id} isActive={c.isActive} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </Container>
  );
}
