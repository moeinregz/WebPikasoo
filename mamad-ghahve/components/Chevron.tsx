/** فلش SVG (کاراکترهای ‹ › تو متن راست‌به‌چپ آینه‌ای می‌شن، برای همین از آیکون استفاده می‌کنیم) */
export default function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" style={{ display: "block" }}>
      <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
