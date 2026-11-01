import type { SVGProps } from "react";

/** آیکون‌های خطی ضخیم برای سکشن‌های ویژگی (جایگزین Emoji) */
const base = {
  viewBox: "0 0 48 48",
  fill: "none",
  stroke: "#1E1611",
  strokeWidth: 3,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};
type P = SVGProps<SVGSVGElement>;

export const LayersIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M24 6 42 15 24 24 6 15Z" fill="#8EA05E" />
    <path d="M6 23 24 32 42 23" />
    <path d="M6 31 24 40 42 31" />
  </svg>
);
export const GiftBoxIcon = (p: P) => (
  <svg {...base} {...p}>
    <rect x="7" y="18" width="34" height="23" rx="3" fill="#DFA03F" />
    <rect x="5" y="12" width="38" height="8" rx="2" fill="#F6EEDF" />
    <path d="M24 12v29" />
    <path d="M24 12c-4-7-12-6-10-1 1 2 6 2 10 1Zm0 0c4-7 12-6 10-1-1 2-6 2-10 1Z" fill="#B8273A" />
  </svg>
);
export const ScaleIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M24 8v30M14 40h20" />
    <path d="M8 14h32" />
    <path d="M8 14 3 26h10Z" fill="#DFA03F" />
    <path d="M40 14l-5 12h10Z" fill="#8EA05E" />
    <circle cx="24" cy="8" r="3" fill="#F6EEDF" />
  </svg>
);
export const StoreIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M8 20v20h32V20" fill="#F6EEDF" />
    <path d="M5 20 9 8h30l4 12Z" fill="#B8273A" />
    <path d="M5 20c0 3 3 5 6.5 5S18 23 18 20c0 3 3 5 6 5s6-2 6-5c0 3 3 5 6.5 5S43 23 43 20" />
    <rect x="19" y="29" width="10" height="11" fill="#DFA03F" />
  </svg>
);
export const BoltIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M27 4 9 27h13l-3 17 20-25H26Z" fill="#DFA03F" />
  </svg>
);
export const CalendarIcon = (p: P) => (
  <svg {...base} {...p}>
    <rect x="6" y="10" width="36" height="31" rx="4" fill="#F6EEDF" />
    <path d="M6 18h36" />
    <path d="M15 6v8M33 6v8" />
    <path d="M17 29l5 5 9-10" stroke="#4E6534" />
  </svg>
);
export const ScooterIcon = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="36" r="6" fill="#F6EEDF" />
    <circle cx="38" cy="36" r="6" fill="#F6EEDF" />
    <path d="M11 36h14l6-14h5l2 14" />
    <rect x="12" y="18" width="13" height="11" rx="2" fill="#B8273A" />
    <path d="M31 22l-3-10h6" />
  </svg>
);
export const MapIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M5 11 17 6l14 5 12-5v31l-12 5-14-5-12 5Z" fill="#DEE5C4" />
    <path d="M17 6v31M31 11v31" />
    <path d="M24 14c-4 0-6 3-6 6 0 5 6 10 6 10s6-5 6-10c0-3-2-6-6-6Z" fill="#B8273A" />
  </svg>
);
