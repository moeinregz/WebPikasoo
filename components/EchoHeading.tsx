import type { CSSProperties, ReactNode } from "react";

/** A key Persian heading with a big English "echo" of the same text above
 *  it: Latin display face, fading out toward the bottom, and sitting low
 *  enough that the Persian heading covers its lower half (see .echo-* in
 *  globals.css). The echo is decorative (aria-hidden); the real heading
 *  stays the Persian text.
 *
 *  The echo's size follows its length so a long phrase still fits one
 *  line on a phone and in its column; `max` caps it in px. */
export function echoStyle(en: string, max = 128, fit = 1112): CSSProperties {
  // Syne 800 averages ~1em per character (measured); size the line so it fits the
  // viewport (minus the page gutters) and `fit` px (the heading's column).
  const k = 1 / (1.04 * Math.max(en.length, 5));
  return { ["--echo-size" as string]: `min(calc((100vw - 56px) * ${k.toFixed(4)}), ${Math.floor(fit * k)}px, ${max}px)` };
}

export function EchoText({ en, className = "" }: { en: string; className?: string }) {
  return (
    <span aria-hidden="true" dir="ltr" className={`echo-en ${className}`}>
      {en}
    </span>
  );
}

export default function EchoHeading({
  en,
  as: Tag = "h2",
  align = "start",
  max,
  fit,
  onDark = false,
  className = "",
  children,
}: {
  en: string;
  as?: "h1" | "h2";
  align?: "start" | "center";
  max?: number;
  /** Width of the heading's column in px (defaults to the page container). */
  fit?: number;
  /** On a fixed dark panel (e.g. the contact card) in either theme. */
  onDark?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`echo ${onDark ? "echo-on-dark" : ""} ${align === "center" ? "text-center" : "text-right"}`} style={echoStyle(en, max, fit)}>
      <EchoText en={en} />
      <Tag className={`echo-fa ${className}`}>{children}</Tag>
    </div>
  );
}
