const stackItems: string[] = [
  "React",
  "Next.js",
  "Node.js",
  "TypeScript",
  "Tailwind CSS",
  "MongoDB",
  "Express.js",
  "PostgreSQL",
  "Docker",
  "Git & GitHub",
  "SQLite",
  "Axios",
  "C#",
  "ASP.NET",
  "FastAPI",
  "Blazor",
  "SQL Server",
  "Redis",
];

const growthItems: string[] = [
  "WordPress",
  "Elementor",
  "WooCommerce",
  "WoodMart",
  "سئوی داخلی",
  "سئوی خارجی",
  "سئوی تکنیکال",
  "سئوی محلی",
  "Go",
  "PHP",
  "Python",
  "PyTorch",
  "TensorFlow",
  "Scikit-learn",
  "Ultralytics",
  "NumPy",
  "N8N",
];

function MarqueeRow({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  // Repeated 4x so the track is always wider than any real viewport
  // (including ultra-wide screens) — there's always more looping content
  // ahead of the visible window, so it can never run out mid-scroll.
  const repeated = Array.from({ length: 4 }, () => items).flat();

  return (
    // dir="ltr" is the actual fix here, not the repeat count. The page is
    // dir="rtl", so without this the untransformed track's static position
    // anchors to the *right* edge of its container (RTL block layout), while
    // the translateX() animation always moves physically left regardless of
    // text direction. Pinning this element to LTR makes its static position
    // anchor left, matching what translateX(0 → -50%) assumes.
    <div dir="ltr" className="overflow-hidden">
      <div
        className={`flex w-max items-center ${
          reverse ? "animate-marquee-rtl" : "animate-marquee-ltr"
        }`}
      >
        {repeated.map((t, i) => (
          <span
            key={i}
            className={`flex items-center gap-7 whitespace-nowrap px-7 font-mono text-[24px] font-black tracking-tight transition-colors sm:text-[34px] ${
              i % 2 ? "text-outline hover:text-ink" : "text-ink/80 hover:text-accent3"
            }`}
          >
            {t}
            <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0 text-accent3 sm:h-5 sm:w-5" fill="currentColor">
              <path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Marquee() {
  return (
    <div className="relative overflow-hidden py-8">
    <section className="relative -mx-4 -rotate-1 overflow-hidden border-y border-accent3/20 bg-surface/60 py-7 shadow-[0_0_80px_-30px_rgba(0,180,216,0.5)] backdrop-blur-sm">
      {/* Fade masks on both edges — the classic GitHub/Vercel logo-ticker
          treatment, so the loop never looks like it's hard-cut at the edge. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-canvas to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-canvas to-transparent" />
      <MarqueeRow items={stackItems} />
      <div className="mt-4">
        <MarqueeRow items={growthItems} reverse />
      </div>
    </section>
    </div>
  );
}
