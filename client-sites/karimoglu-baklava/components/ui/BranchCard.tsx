import Link from "next/link";
import type { BranchSummary } from "@/lib/types";
import { Badge } from "./Badge";
import { Button } from "./Button";

/**
 * طبق Graceful Degradation تعریف‌شده در UX Architecture (بخش ۶) و Design System (بخش ۱۲):
 * تا زمانی که آدرس/مختصات دقیق شعب ارسال نشده، به‌جای نقشه/فاصله،
 * یک مسیر جایگزین محترمانه (تماس تلفنی) نمایش داده می‌شود.
 */
export function BranchCard({ branch }: { branch: BranchSummary }) {
  const hasLocationData = branch.coordinates !== null;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border-2 border-brand-black bg-surface shadow-hard transition-[transform,box-shadow] duration-300 hover:-translate-y-1.5 hover:translate-x-1 hover:shadow-hard-lg">
      {/* سربرگ تزئینی شعبه (تا رسیدن عکس واقعی شعب — هیچ تصویر جعلی‌ای جایش نمی‌نشیند) */}
      <div className={`matte relative flex h-32 items-end overflow-hidden border-b-2 border-brand-black p-4 ${branch.city === "همدان" ? "bg-pistachio bg-lattice-pistachio" : "bg-honey bg-lattice-honey"}`}>
        {/* درِ طاق‌دار مغازه */}
        <span aria-hidden="true" className="absolute -bottom-[2px] left-6 h-24 w-16 rounded-[999px_999px_0_0] border-2 border-b-0 border-brand-black bg-cream transition-[height] duration-500 group-hover:h-28">
          <span className="absolute inset-x-3 bottom-0 top-3 rounded-[999px_999px_0_0] border-2 border-b-0 border-brand-black bg-brand-red" />
        </span>
        <span className="relative font-fancy text-[30px] leading-none text-brand-black">{branch.name}</span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-h4 text-text-primary">شعبه {branch.name}</h3>
          <Badge tone="neutral">{branch.city}</Badge>
        </div>

        <p className="text-bodySm text-text-secondary">ساعت کاری: {branch.openingHours}</p>
        {branch.shortArea && <p className="text-bodySm text-text-secondary">{branch.shortArea}</p>}

        {branch.phone ? (
          <a
            href={`tel:${branch.phone}`}
            className="text-bodySm text-brand-red hover:underline"
            aria-label={`تماس با شعبه ${branch.name}`}
          >
            {branch.phone}
          </a>
        ) : (
          <span className="text-bodySm text-text-muted">شماره تماس به‌زودی اعلام می‌شود</span>
        )}

        {branch.hasCafeService && (
          <div>
            <Badge tone="neutral">☕ سرویس کافه</Badge>
          </div>
        )}

        <div className="mt-auto flex flex-col gap-2 pt-3 tablet:flex-row">
          {hasLocationData ? (
            <Button variant="secondary" size="sm" className="w-full">
              مسیریابی
            </Button>
          ) : branch.phone ? (
            <a
              href={`tel:${branch.phone}`}
              aria-label={`تماس بگیرید با ${branch.name}`}
              className="inline-flex h-10 w-full items-center justify-center rounded-lg border-2 border-brand-black bg-cream px-4 text-btn font-semibold text-brand-black shadow-hard-xs transition-all duration-200 hover:bg-honey hover:shadow-hard-sm active:translate-y-0.5 active:shadow-none"
            >
              تماس بگیرید
            </a>
          ) : null}
          <Link href={`/branches/${branch.slug}`} className="w-full">
            <Button variant="primary" size="sm" className="w-full">
              مشاهده شعبه
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
