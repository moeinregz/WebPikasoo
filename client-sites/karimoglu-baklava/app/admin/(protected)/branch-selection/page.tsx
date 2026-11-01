import { Container } from "@/components/ui/Container";
import { getRecentBranchSelectionLogs } from "@/lib/branch-selection/logger";

export const dynamic = "force-dynamic";

/**
 * ⚠️ این صفحه یک پنل مدیریت کامل نیست — طبق Blueprint (بخش ۱۵)، پنل ادمین
 * واقعی نیازمند RBAC/احراز هویت است که هنوز در این فاز پیاده نشده. این صفحه
 * صرفاً حداقلی برای برآوردن الزام «مشاهده‌پذیری» Prompt 8 است (بررسی این‌که
 * سیستم چرا هر شعبه را انتخاب/رد کرده) و **باید پیش از استقرار عمومی پشت
 * احراز هویت قرار گیرد** — در حال حاضر هیچ محافظتی ندارد.
 */
export default function BranchSelectionAdminPage() {
  const logs = getRecentBranchSelectionLogs(50);

  return (
    <Container className="flex flex-col gap-6 py-10">
      <div>
        <h1 className="text-h2 text-text-primary">لاگ تصمیمات انتخاب شعبه</h1>
        <p className="text-bodySm text-text-secondary">
          ۵۰ تصمیم اخیر سیستم انتخاب هوشمند شعبه — فقط برای مشاهده داخلی/دیباگ.
        </p>
      </div>

      {logs.length === 0 ? (
        <p className="text-bodySm text-text-muted">هنوز هیچ درخواستی ثبت نشده است.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-surface shadow-sm">
          <table className="w-full text-right text-bodySm">
            <thead className="border-b border-border text-caption text-text-muted">
              <tr>
                <th className="p-3">زمان</th>
                <th className="p-3">شهر</th>
                <th className="p-3">روش ارسال</th>
                <th className="p-3">تعداد اقلام</th>
                <th className="p-3">نتیجه</th>
                <th className="p-3">شعبه انتخابی</th>
                <th className="p-3">کاندیدهای رد‌شده</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.timestamp} className="border-b border-border last:border-0">
                  <td className="p-3 text-caption text-text-muted">
                    {new Date(log.timestamp).toLocaleString("fa-IR")}
                  </td>
                  <td className="p-3">{log.city ?? "—"}</td>
                  <td className="p-3">{log.deliveryMethod}</td>
                  <td className="p-3">{log.cartProductIds.length}</td>
                  <td className="p-3">
                    <span
                      className={
                        log.status === "selected" ? "text-state-success" : "text-state-error"
                      }
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="p-3">{log.selectedBranchId ?? "—"}</td>
                  <td className="p-3 text-caption text-text-muted">
                    {log.candidates
                      .filter((c) => !c.passed)
                      .map((c) => `${c.branchId}:${c.rejectionReason}`)
                      .join("، ") || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Container>
  );
}
