import type { SVGProps } from "react";

/**
 * ===== تصویرسازی‌های SVG اختصاصی باقلوا =====
 * همه با خط دور ضخیم و رنگ تخت (Flat/Matte) — هماهنگ با سایه‌های سخت سایت.
 * تزئینی‌اند (aria-hidden)، و چون تصویر واقعی محصول جایگزینشان نمی‌شود،
 * هیچ ادعای محصولی هم نمی‌کنند.
 */

const INK = "#1E1611";

type Topping = "pistachio" | "walnut";

const TOPPING = {
  pistachio: { base: "#8EA05E", dark: "#4E6534", light: "#B9C88A" },
  walnut: { base: "#9A6B45", dark: "#5E3B22", light: "#C49468" },
} as const;

/** یک برش باقلوای لوزی به‌صورت ایزومتریک: لایه‌های یوفکا + رویه پسته/گردو */
export function BaklavaSlice({
  topping = "pistachio",
  ...props
}: SVGProps<SVGSVGElement> & { topping?: Topping }) {
  const t = TOPPING[topping];
  // خطوط لایه‌ها روی دو وجه کناری
  const layers = [12, 20, 28, 36, 44];
  return (
    <svg viewBox="0 0 200 170" fill="none" aria-hidden="true" focusable="false" {...props}>
      {/* سایه سخت زیر برش */}
      <path d="M12 66 92 101 92 154 12 119Z M92 101 172 66 172 119 92 154Z" fill={INK} transform="translate(-6 8)" />
      {/* وجه چپ */}
      <path className="bk-face" d="M20 58 100 93 100 146 20 111Z" fill="#C98A2E" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      {/* وجه راست */}
      <path className="bk-face" d="M100 93 180 58 180 111 100 146Z" fill="#DFA03F" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      {layers.map((k) => (
        <g key={k} className="bk-layer" stroke="#F5D89A" strokeWidth="2.2" strokeLinecap="round">
          <path d={`M24 ${60 + k} Q42 ${66 + k} 60 ${76 + k} T96 ${93 + k}`} />
          <path d={`M104 ${93 + k} Q122 ${82 + k} 140 ${76 + k} T176 ${60 + k}`} />
        </g>
      ))}
      {/* رویه */}
      <path className="bk-top" d="M100 22 180 58 100 93 20 58Z" fill={t.base} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <g className="bk-crumbs">
        <circle cx="78" cy="52" r="6" fill={t.dark} />
        <circle cx="104" cy="44" r="5" fill={t.light} />
        <circle cx="122" cy="58" r="7" fill={t.dark} />
        <circle cx="96" cy="66" r="5.5" fill={t.light} />
        <circle cx="62" cy="60" r="4" fill={t.light} />
        <circle cx="140" cy="54" r="4" fill={t.light} />
        <circle cx="112" cy="74" r="3.5" fill={t.dark} />
        <circle cx="88" cy="36" r="3" fill={t.dark} />
      </g>
      {/* رگه شهد روی لبه */}
      <path d="M36 62 Q60 72 84 82" stroke="#F5E2B8" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}

/** نمای بالای یک تکه لوزی (برای الگوها، آیکون‌ها و لودینگ) */
export function BaklavaDiamond({
  topping = "pistachio",
  ...props
}: SVGProps<SVGSVGElement> & { topping?: Topping }) {
  const t = TOPPING[topping];
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" focusable="false" {...props}>
      <path d="M60 10 112 62 60 114 8 62Z" fill={INK} transform="translate(-4 4)" />
      <path d="M60 6 112 58 60 110 8 58Z" fill="#DFA03F" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M60 20 98 58 60 96 22 58Z" fill="#F5E2B8" stroke="#B0721F" strokeWidth="2" />
      <path d="M60 32 86 58 60 84 34 58Z" fill={t.base} stroke={INK} strokeWidth="2.5" />
      <circle cx="56" cy="52" r="4.5" fill={t.dark} />
      <circle cx="66" cy="60" r="3.5" fill={t.light} />
      <circle cx="54" cy="64" r="3" fill={t.light} />
      <circle cx="64" cy="48" r="2.5" fill={t.dark} />
    </svg>
  );
}

/** استکان کمرباریک چای با نعلبکی */
export function TeaGlass(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 140 200" fill="none" aria-hidden="true" focusable="false" {...props}>
      <g className="tea-steam" stroke="#F6EEDF" strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M54 34 C46 24 62 18 54 6" />
        <path d="M72 30 C64 20 80 14 72 2" />
        <path d="M90 34 C82 24 98 18 90 6" />
      </g>
      <ellipse cx="66" cy="184" rx="60" ry="12" fill={INK} />
      <ellipse cx="70" cy="180" rx="60" ry="12" fill="#B8273A" stroke={INK} strokeWidth="3.5" />
      <ellipse cx="70" cy="178" rx="30" ry="5" fill="#8C1C2C" />
      <path
        d="M36 44 C36 76 54 86 50 112 C46 140 38 156 42 170 L98 170 C102 156 94 140 90 112 C86 86 104 76 104 44 Z"
        fill="#F6EEDF"
        stroke={INK}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M39 62 C42 82 56 90 52 112 C48 140 41 155 44 167 L96 167 C99 155 92 140 88 112 C84 90 98 82 101 62 Z"
        fill="#9E3B1E"
      />
      <path d="M44 66 C48 82 58 92 56 110" stroke="#C9643A" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="70" cy="44" rx="34" ry="6" fill="#F6EEDF" stroke={INK} strokeWidth="3.5" />
    </svg>
  );
}

/** یک دانه پسته نیم‌باز */
export function Pistachio(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 60 60" fill="none" aria-hidden="true" focusable="false" {...props}>
      <path d="M30 6 C48 10 54 34 42 50 C34 58 20 56 14 46 C6 30 14 8 30 6Z" fill="#EADCC2" stroke={INK} strokeWidth="3" />
      <path d="M30 14 C42 18 44 36 36 46 C30 50 22 48 20 40 C16 28 22 16 30 14Z" fill="#8EA05E" stroke={INK} strokeWidth="2.5" />
      <path d="M28 22 C34 26 34 36 30 42" stroke="#4E6534" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/** یک قطره شهد عسل */
export function HoneyDrop(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 40 56" fill="none" aria-hidden="true" focusable="false" {...props}>
      <path d="M20 4 C26 18 36 28 36 38 A16 16 0 0 1 4 38 C4 28 14 18 20 4Z" fill="#DFA03F" stroke={INK} strokeWidth="3" />
      <path d="M12 38 A8 8 0 0 0 18 46" stroke="#F5E2B8" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** ستاره هشت‌پر (شمسه) — نقش‌مایه کاشی و سینی‌های سنتی */
export function Shamseh(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" aria-hidden="true" focusable="false" {...props}>
      <path d="M50 4 61 22 81 19 78 39 96 50 78 61 81 81 61 78 50 96 39 78 19 81 22 61 4 50 22 39 19 19 39 22Z" fill="currentColor" />
      <circle cx="50" cy="50" r="14" fill="none" stroke="#1E1611" strokeWidth="3" />
    </svg>
  );
}

/**
 * لبه «شهد چکان» بین دو سکشن. رنگ با prop تعیین می‌شود و قطره‌ها کلاس
 * `honey-drip` دارند تا HoneyDripDivider با GSAP آن‌ها را هنگام اسکرول بکشد.
 */
const DRIPS: Array<[number, number, number]> = [
  // [x مرکز, پهنا, طول]
  [60, 26, 34], [170, 18, 58], [250, 30, 26], [360, 22, 72], [470, 16, 40],
  [560, 28, 50], [690, 20, 86], [790, 26, 30], [900, 18, 62], [1010, 30, 44],
  [1130, 22, 78], [1230, 16, 36], [1330, 26, 56], [1420, 20, 30],
];

export function HoneyDripEdge({ color, className = "" }: { color: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 120"
      preserveAspectRatio="xMidYMin slice"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {DRIPS.map(([cx, w, len], i) => {
        const r = w / 2;
        const top = 20;
        const bottom = top + len;
        return (
          <path
            key={i}
            className="honey-drip"
            data-len={len}
            d={`M${cx - r - 10} ${top} Q${cx - r} ${top} ${cx - r} ${top + 10} L${cx - r} ${bottom - r} A${r} ${r} 0 0 0 ${cx + r} ${bottom - r} L${cx + r} ${top + 10} Q${cx + r} ${top} ${cx + r + 10} ${top} Z`}
            fill={color}
          />
        );
      })}
      {/* نوار بالایی بعد از قطره‌ها رسم می‌شود تا قطره‌ها از زیرش بیرون بلغزند */}
      <rect x="0" y="0" width="1440" height="22" fill={color} />
    </svg>
  );
}
