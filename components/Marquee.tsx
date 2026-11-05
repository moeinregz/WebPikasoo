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
    <div dir="ltr" data-marquee className="overflow-hidden">
      <div
        className={`flex w-max items-center ${
          reverse ? "animate-marquee-rtl" : "animate-marquee-ltr"
        }`}
      >
        {repeated.map((t, i) => (
          <span
            key={i}
            className={`flex items-center gap-6 whitespace-nowrap px-6 font-mono text-[20px] font-black tracking-tight sm:text-[28px] ${
              reverse ? "text-ink" : "text-white"
            }`}
          >
            {t}
            <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" fill="currentColor" aria-hidden>
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
    // دو نوار مات و ضربدری — مثل دو تکه چسب‌نواری روی هم. هر ردیف با
    // سرعت اسکرول کج می‌شه (ScrollFx، data-marquee).
    <section className="relative overflow-hidden py-14">
      <div className="relative z-[2] -mx-6 -rotate-2 border-y border-accent/30 bg-accent py-4 shadow-[0_24px_60px_-24px_rgb(var(--color-accent)/0.7)]">
        <MarqueeRow items={stackItems} />
      </div>
      <div className="relative z-[1] -mx-6 -mt-3 rotate-[1.5deg] border-y border-accent/30 bg-surface py-4">
        <MarqueeRow items={growthItems} reverse />
      </div>
    </section>
  );
}
