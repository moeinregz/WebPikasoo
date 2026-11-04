/** تصویر محصول؛ اگه عکس نداشت، یه بسته‌ی قهوه با رنگ محصول کشیده می‌شه. */
export function imgSrc(image: string): string {
  if (!image) return "";
  if (/^(https?:)?\/\//.test(image) || image.startsWith("/")) return image;
  return `/api/uploads/${image}`;
}

export default function ProductArt({ image, color, name }: { image?: string; color?: string; name: string }) {
  const src = imgSrc(image || "");
  if (src) return <img src={src} alt={name} loading="lazy" />;
  const c = color || "#6b3f26";
  const label = name.split(" ").slice(0, 2).join(" ");
  return (
    <svg viewBox="0 0 300 300" role="img" aria-label={name}>
      <defs>
        <linearGradient id={`g${c.slice(1)}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#3d2819" />
          <stop offset="1" stopColor="#221510" />
        </linearGradient>
      </defs>
      <rect width="300" height="300" fill={`url(#g${c.slice(1)})`} />
      <ellipse cx="150" cy="262" rx="88" ry="12" fill="rgba(0,0,0,.45)" />
      <path d="M92 70 L208 70 L222 250 Q150 262 78 250 Z" fill={c} />
      <path d="M92 70 L208 70 L212 92 L88 92 Z" fill="rgba(0,0,0,.18)" />
      <path d="M100 52 H200 L208 70 H92 Z" fill={c} />
      <path d="M100 52 H200 L208 70 H92 Z" fill="rgba(255,255,255,.15)" />
      <rect x="104" y="120" width="92" height="96" rx="12" fill="#fbf1dc" stroke="#d6a650" strokeWidth="3" />
      <text x="150" y="152" textAnchor="middle" fontSize="22" fontFamily="Lalezar, Vazirmatn, sans-serif" fill="#3b2316">ممد قهوه</text>
      <g transform="translate(150 182)">
        <ellipse rx="10" ry="15" fill={c} />
        <path d="M0 -14 C-7 -4 7 4 0 14" stroke="#fbf6ee" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>
      <text x="150" y="208" textAnchor="middle" fontSize="11" fontFamily="Vazirmatn, sans-serif" fill="#6b3f26">{label}</text>
      <path d="M210 92 L216 240" stroke="rgba(255,255,255,.18)" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}
