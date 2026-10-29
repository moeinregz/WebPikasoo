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
            className="flex items-center gap-[18px] whitespace-nowrap px-[22px] font-mono text-[15px] font-semibold text-dim transition-colors hover:text-ink sm:text-[17px]"
          >
            {t}
            <span className="h-1 w-1 rounded-full bg-accent" />
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Marquee() {
  return (
    <section className="relative overflow-hidden border-y border-ink/10 bg-surface/40 py-6">
      {/* Fade masks on both edges — the classic GitHub/Vercel logo-ticker
          treatment, so the loop never looks like it's hard-cut at the edge. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-canvas to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-canvas to-transparent" />
      <MarqueeRow items={stackItems} />
      <div className="mt-2.5">
        <MarqueeRow items={growthItems} reverse />
      </div>
    </section>
  );
}
