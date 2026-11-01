/**
 * لبه «کاغذ شیرینی» (کنگره‌ای) — مثل لبه کاغذهای زیر شیرینی در جعبه.
 * رنگ کنگره‌ها همان رنگ سکشن بالایی است و روی سکشن پایینی می‌نشیند.
 */
export function Scallop({ color, flip = false, className = "" }: { color: string; flip?: boolean; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none relative z-[2] h-5 w-full ${flip ? "-mt-5 rotate-180" : "-mb-5"} ${className}`}
      style={{
        backgroundImage: `radial-gradient(circle at 50% 0, ${color} 13px, transparent 14px)`,
        backgroundSize: "36px 20px",
        backgroundRepeat: "repeat-x",
      }}
    />
  );
}
