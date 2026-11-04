import type { ReactNode } from "react";

/** Gold divider: line — diamond — eight-point star — diamond — line */
export function Divider({ className = "" }: { className?: string }) {
  return (
    <svg className={`divider ${className}`} viewBox="0 0 240 24" aria-hidden="true">
      <path d="M0 12h88M152 12h88" stroke="currentColor" strokeWidth="1" />
      <path d="M92 12l4-4 4 4-4 4zM140 12l4-4 4 4-4 4z" fill="currentColor" />
      <path
        d="M120 2l3 7 7-3-3 7 7 3-7 3 3 7-7-3-3 7-3-7-7 3 3-7-7-3 7-3-3-7 7 3z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <circle cx="120" cy="12" r="2.2" fill="currentColor" />
    </svg>
  );
}

export function SectionHead({
  eyebrow,
  title,
  children,
  align = "center",
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  align?: "center" | "start";
}) {
  return (
    <header className={`section-head ${align === "start" ? "is-start" : ""}`} data-reveal>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="section-title">{title}</h2>
      <Divider />
      {children && <p className="section-lead">{children}</p>}
    </header>
  );
}

/** Persian arch (taq) emblem with a hanging lantern. Paths use pathLength=1 for draw-on animations. */
export function Emblem({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 150" fill="none" aria-hidden="true">
      <path pathLength={1} d="M10 146V64C10 30 34 8 60 4c26 4 50 26 50 60v82" stroke="currentColor" strokeWidth="2" />
      <path pathLength={1} d="M22 146V68c0-26 18-44 38-50 20 6 38 24 38 50v78" stroke="currentColor" strokeWidth="1" opacity=".6" />
      <path pathLength={1} d="M60 18v26" stroke="currentColor" strokeWidth="1.4" />
      <path pathLength={1} d="M52 44h16l-2 5H54z" stroke="currentColor" strokeWidth="1.4" />
      <path pathLength={1} d="M48 52q12-6 24 0l4 34q-16 10-32 0z" stroke="currentColor" strokeWidth="1.6" />
      <path pathLength={1} d="M60 50v42M50 60q10 4 20 0M47 76q13 5 26 0" stroke="currentColor" strokeWidth="1" opacity=".7" />
      <path pathLength={1} d="M52 92h16l-4 8h-8z" stroke="currentColor" strokeWidth="1.4" />
      <path pathLength={1} d="M4 146h112" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

/** One hanging lantern drawing, used by <Lanterns/> and elsewhere. */
export function LanternSvg({ hue = "amber" }: { hue?: "amber" | "ruby" | "emerald" | "sapphire" }) {
  const glass = { amber: "#ffcf6b", ruby: "#ff7a59", emerald: "#7dffb0", sapphire: "#8fb8ff" }[hue];
  const id = `lg-${hue}`;
  return (
    <svg viewBox="0 0 60 110" className="lantern-svg" aria-hidden="true">
      <defs>
        <radialGradient id={id} cx="50%" cy="55%" r="60%">
          <stop offset="0" stopColor="#fff8e1" />
          <stop offset=".35" stopColor={glass} />
          <stop offset="1" stopColor={glass} stopOpacity=".25" />
        </radialGradient>
      </defs>
      <circle cx="30" cy="10" r="4" fill="none" stroke="#d9b45a" strokeWidth="2" />
      <path d="M21 16h18l-3 7H24z" fill="#b8913a" stroke="#f3d98b" strokeWidth=".8" />
      <path d="M30 4V0" stroke="#d9b45a" strokeWidth="1.5" />
      <path d="M17 26q13-6 26 0l5 40q-18 12-36 0z" fill={`url(#${id})`} className="lantern-glass" />
      <path
        d="M17 26q13-6 26 0l5 40q-18 12-36 0zM30 23v51M15 46q15 6 30 0"
        fill="none"
        stroke="#d9b45a"
        strokeWidth="1.6"
      />
      <path d="M20 75h20l-4 10H24z" fill="#b8913a" stroke="#f3d98b" strokeWidth=".8" />
      <path d="M30 85v12" stroke="#d9b45a" strokeWidth="1.4" />
      <path d="M27 97h6l-3 9z" fill="#d9b45a" />
    </svg>
  );
}
