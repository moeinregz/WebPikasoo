/**
 * جانشین موقت تصویر — طبق الزام صریح پروژه، تصاویر واقعی محصولات/شعب/کافه
 * هنوز ارسال نشده‌اند (TODO). این کامپوننت به‌جای گذاشتن <img> شکسته یا حدس‌زدن
 * تصویر، یک بلوک بصری خنثی با ابعاد صحیح (برای جلوگیری از Layout Shift) نمایش می‌دهد.
 *
 * در فاز اتصال تصاویر واقعی، این کامپوننت با next/image (با alt متن واقعی،
 * width/height صحیح، و loading="lazy" به‌جز تصویر اول صفحه) جایگزین می‌شود.
 */
export function ImagePlaceholder({
  label,
  aspectClassName = "aspect-square",
  className = "",
}: {
  label: string;
  aspectClassName?: string;
  className?: string;
}) {
  return (
    <div
      className={`img-placeholder flex flex-col items-center justify-center gap-2 rounded-image border-2 border-border ${aspectClassName} ${className}`}
      role="img"
      aria-label={label}
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7 text-honey-deep" aria-hidden="true">
        <path d="M12 2 22 12 12 22 2 12Z" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="3" fill="currentColor" />
      </svg>
      <span className="px-4 text-center text-caption text-text-muted">{label}</span>
    </div>
  );
}
