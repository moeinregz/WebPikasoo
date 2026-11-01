import { Container } from "@/components/ui/Container";
import { requirePageAccess } from "@/lib/auth/adminGuard";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { listReviews } from "@/lib/server/reviewsRepo";
import { ReviewActions } from "@/components/admin/ReviewActions";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage({ searchParams }: { searchParams: { status?: "pending" | "approved" | "all" } }) {
  const access = await requirePageAccess("reviews.manage");
  if (!access.allowed) return <AccessDenied />;

  const status = searchParams.status ?? "pending";
  const reviews = await listReviews(status);

  return (
    <Container className="flex flex-col gap-6 py-2">
      <div>
        <h1 className="text-h2 text-text-primary">نظرات</h1>
        <p className="text-bodySm text-text-secondary">تأیید، رد یا حذف منطقی نظرات مشتریان.</p>
      </div>

      <div className="flex gap-2">
        {(["pending", "approved", "all"] as const).map((s) => (
          <a
            key={s}
            href={`/admin/reviews?status=${s}`}
            className={`rounded-full px-3 py-1 text-caption ${status === s ? "bg-brand-black text-white" : "border border-border-strong text-text-secondary"}`}
          >
            {{ pending: "در انتظار بررسی", approved: "تأییدشده", all: "همه" }[s]}
          </a>
        ))}
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-lg bg-surface p-8 text-center text-bodySm text-text-muted shadow-sm">نظری در این بخش نیست.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-lg bg-surface p-4 shadow-sm">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-bodySm text-text-primary">
                  {r.productName} · {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </p>
                <ReviewActions id={r.id} />
              </div>
              {r.comment && <p className="text-bodySm text-text-secondary">{r.comment}</p>}
              <p className="mt-1 text-caption text-text-muted">
                {r.userMobile ?? "کاربر مهمان"} · {new Date(r.createdAt).toLocaleDateString("fa-IR")}
              </p>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
