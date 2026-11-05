/** نشان وب پیکاسو: یه «P» لاتین (Pikaso) که سه نقطه‌ی «پ» فارسی زیرشه — یعنی
 *  هم P می‌خونه هم پ. داخل کاسه‌ی P یه «چشم» کوبیستی لوزی‌شکل (ادای احترام به
 *  پیکاسو) و یه برش مورب که فرم رو هندسی و نقاشانه می‌کنه. رنگ: گرادیان
 *  رنگین‌کمونی یاسی → صورتی → آبی یخی، مخصوص نشستن روی سکه‌ی مشکی. */
export default function BrandMark({ className = "", idSuffix = "m" }: { className?: string; idSuffix?: string }) {
  const g = `bm-iris-${idSuffix}`;
  const s = `bm-shine-${idSuffix}`;
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="نشان وب پیکاسو">
      <defs>
        <linearGradient id={g} x1="12%" y1="8%" x2="88%" y2="92%">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.28" stopColor="#D9CCFF" />
          <stop offset="0.55" stopColor="#B49BFF" />
          <stop offset="0.78" stopColor="#FF9EDF" />
          <stop offset="1" stopColor="#9BEBFF" />
        </linearGradient>
        <linearGradient id={s} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset=".5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g transform="translate(2.2 -2.1) scale(.92)">
      <g fill={`url(#${g})`}>
        {/* ساقه */}
        <rect x="27" y="14" width="13" height="58" rx="6.5" />
        {/* کاسه: حلقه‌ی ضخیم، با یه برش مورب کوبیستی */}
        <path d="M40 14h15.5a21.5 21.5 0 0 1 0 43H40V45h15.5a9.5 9.5 0 0 0 0-19H40z" />
        {/* سه نقطه‌ی «پ» */}
        <circle cx="27.5" cy="83" r="5.2" />
        <circle cx="41" cy="83" r="5.2" />
        <circle cx="34.2" cy="94" r="5.2" />
      </g>
      {/* برش مورب روی کاسه (رنگ سکه) */}
      <path d="M58.6 14.6 52.6 26" stroke="#07070a" strokeWidth="3.2" strokeLinecap="butt" />
      {/* چشم کوبیستی */}
      <path d="M55.5 30.5 62 35.5 55.5 40.5 49 35.5z" fill={`url(#${g})`} />
      <circle cx="55.5" cy="35.5" r="1.9" fill="#07070a" />
      {/* برق بالای حروف */}
      <rect x="27" y="14" width="13" height="30" rx="6.5" fill={`url(#${s})`} />
      </g>
    </svg>
  );
}
