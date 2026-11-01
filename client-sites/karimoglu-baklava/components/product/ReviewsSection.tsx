"use client";

import { useState } from "react";
import type { ProductDetail } from "@/lib/types";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/Button";
import { RatingStars } from "@/components/ui/RatingStars";

/**
 * چون هیچ نظر واقعی مشتری هنوز در سیستم ثبت نشده (`product.reviews` همیشه
 * خالی در داده Placeholder فعلی است)، این Component به‌صورت کامل برای هر دو
 * حالت (خالی/دارای نظر) نوشته شده — طبق دستور صریح، نظر جعلی تولید نشده.
 * طبق تصمیم UX Architecture (بخش ۱۲): ثبت نظر محدود به خریداران واقعی
 * (Verified Purchase) خواهد بود؛ این تصمیم باید پیش از فعال‌سازی نهایی تایید شود.
 */
export function ReviewsSection({ product }: { product: ProductDetail }) {
  const [helpfulClicks, setHelpfulClicks] = useState<Record<string, boolean>>({});
  const { reviews } = product;

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));
  const maxCount = Math.max(1, ...distribution.map((d) => d.count));

  function markHelpful(reviewId: string) {
    setHelpfulClicks((prev) => ({ ...prev, [reviewId]: true }));
    track({ name: "review_helpful_click", reviewId });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6 tablet:flex-row">
        <div className="flex flex-col items-center justify-center gap-1 rounded-lg bg-surface p-6 shadow-sm tablet:w-48">
          <span className="text-display text-text-primary">
            {(product.rating ?? 0).toLocaleString("fa-IR")}
          </span>
          {product.rating && <RatingStars rating={product.rating} />}
          <span className="text-caption text-text-muted">
            {reviews.length > 0
              ? `از ${reviews.length.toLocaleString("fa-IR")} نظر`
              : "هنوز نظری ثبت نشده"}
          </span>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-2 rounded-lg bg-surface p-6 shadow-sm">
          {distribution.map((d) => (
            <div key={d.star} className="flex items-center gap-3">
              <span className="w-10 text-caption text-text-secondary">{d.star.toLocaleString("fa-IR")} ★</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg-secondary">
                <div
                  className="h-full rounded-full bg-brand-red"
                  style={{ width: `${(d.count / maxCount) * 100}%` }}
                />
              </div>
              <span className="w-6 text-caption text-text-muted">{d.count.toLocaleString("fa-IR")}</span>
            </div>
          ))}
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg bg-bg-secondary p-8 text-center">
          <p className="text-bodySm text-text-secondary">
            هنوز نظری برای این محصول ثبت نشده است. پس از دریافت سفارش، می‌توانید اولین نفری
            باشید که نظر می‌دهد.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-lg bg-surface p-5 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-bodySm font-medium text-text-primary">{review.authorName}</span>
                  {review.verifiedPurchase && (
                    <span className="rounded-sm bg-state-successBg px-2 py-0.5 text-caption text-state-success">
                      خرید تأییدشده
                    </span>
                  )}
                </div>
                <span className="text-caption text-text-muted">
                  {new Date(review.date).toLocaleDateString("fa-IR")}
                </span>
              </div>
              <RatingStars rating={review.rating} />
              <p className="mt-2 text-bodySm text-text-secondary">{review.text}</p>
              <button
                type="button"
                onClick={() => markHelpful(review.id)}
                disabled={helpfulClicks[review.id]}
                className="mt-3 text-caption text-text-muted hover:text-text-primary disabled:text-brand-red"
              >
                {helpfulClicks[review.id] ? "✓ مفید بود" : "مفید بود؟"}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex justify-center">
        <Button variant="secondary">ثبت نظر</Button>
      </div>
    </div>
  );
}
