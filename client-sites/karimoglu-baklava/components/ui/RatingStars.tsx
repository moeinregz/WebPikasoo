export function RatingStars({
  rating,
  reviewCount,
}: {
  rating: number;
  reviewCount?: number;
}) {
  return (
    <div className="flex items-center gap-1 text-bodySm text-text-secondary" aria-hidden={false}>
      <span aria-hidden="true" className="text-brand-red">
        ★
      </span>
      <span>{rating.toLocaleString("fa-IR")}</span>
      {typeof reviewCount === "number" && (
        <span className="text-text-muted">({reviewCount.toLocaleString("fa-IR")} نظر)</span>
      )}
    </div>
  );
}
