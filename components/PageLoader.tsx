// لودینگ برند‌دار — یه ترکیب هندسیِ الهام‌گرفته از لوگوی کوبیستی وب‌پیکاسو:
// ۸ تکه‌ی رنگی از بیرون به مرکز پرواز می‌کنن، یه لحظه به‌شکل یه «چهره‌»ی
// هندسی کنار هم می‌مونن (با نماد </> وسطش که چشمک می‌زنه)، بعد دوباره از
// هم می‌پاشن و می‌چرخه. کاملاً CSS/SVG، بدون جاوااسکریپت — چون این کامپوننت
// هم توی app/loading.tsx (لودینگ ناوبری) و هم به‌عنوان fallback اولیه‌ی
// خودِ سایت استفاده می‌شه و باید فوری، بدون تأخیر هیدریشن، نمایش داده بشه.

import type { CSSProperties } from "react";

const pieces: { points: string; color: string; dx: string; dy: string; dr: string; delay: string }[] = [
  { points: "90,90 168,90 149.7,140.2", color: "#D9D7D1", dx: "46px", dy: "-8px", dr: "22deg", delay: "0s" },
  { points: "90,90 149.7,140.2 96.8,167.7", color: "#CFCDC7", dx: "34px", dy: "34px", dr: "-18deg", delay: ".12s" },
  { points: "90,90 96.8,167.7 63.3,163.3", color: "#BAB8B2", dx: "6px", dy: "46px", dr: "16deg", delay: ".24s" },
  { points: "90,90 63.3,163.3 16.7,116.7", color: "#E4E2DC", dx: "-34px", dy: "34px", dr: "-24deg", delay: ".36s" },
  { points: "90,90 16.7,116.7 22.5,51", color: "#4A4A52", dx: "-46px", dy: "2px", dr: "20deg", delay: ".48s" },
  { points: "90,90 22.5,51 76.4,13.2", color: "#1C1C20", dx: "-26px", dy: "-38px", dr: "-16deg", delay: ".6s" },
  { points: "90,90 76.4,13.2 129,22.5", color: "#ECEAE4", dx: "6px", dy: "-46px", dr: "24deg", delay: ".72s" },
  { points: "90,90 129,22.5 168,90", color: "#F0EEE9", dx: "34px", dy: "-30px", dr: "-20deg", delay: ".84s" },
];

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-canvas">
      {/* پس‌زمینه‌ی نقطه‌چین + دو هاله‌ی نرم، همون بافت هیروی خودِ سایت */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-dot-grid" />
      <span
        className="pointer-events-none absolute -right-[200px] -top-[200px] z-0 h-[480px] w-[480px] animate-float-glow rounded-full opacity-50"
        style={{ background: "radial-gradient(closest-side, rgba(217, 215, 209, .4), transparent)" }}
      />
      <span
        className="pointer-events-none absolute -left-[220px] top-[80px] z-0 h-[440px] w-[440px] animate-float-glow-slow rounded-full opacity-40"
        style={{ background: "radial-gradient(closest-side, rgba(74, 74, 82, .35), transparent)" }}
      />

      <div className="relative z-[1] flex flex-col items-center gap-8">
        {/* نشان هندسی + حلقه‌ی نقطه‌چین چرخان دورش */}
        <div className="relative h-[180px] w-[180px]">
          <svg
            viewBox="0 0 180 180"
            className="absolute inset-0 h-full w-full animate-spin-slow opacity-40"
            fill="none"
          >
            <circle cx="90" cy="90" r="86" stroke="rgb(var(--color-ink) / 0.35)" strokeWidth="1.5" strokeDasharray="3 7" />
          </svg>

          <svg viewBox="0 0 180 180" className="absolute inset-0 h-full w-full drop-shadow-[0_0_30px_rgba(217, 215, 209,.35)]">
            {pieces.map((p, i) => (
              <polygon
                key={i}
                points={p.points}
                fill={p.color}
                stroke="rgb(var(--color-canvas))"
                strokeWidth={2.5}
                strokeLinejoin="round"
                className="origin-center animate-assemble-piece"
                style={
                  {
                    "--dx": p.dx,
                    "--dy": p.dy,
                    "--dr": p.dr,
                    transformBox: "fill-box",
                    transformOrigin: "center",
                    animationDelay: p.delay,
                  } as CSSProperties
                }
              />
            ))}
          </svg>

          <div className="absolute inset-0 flex animate-center-mark-fade items-center justify-center">
            <span className="rounded-lg bg-canvas/80 px-2.5 py-1 font-mono text-[19px] font-bold text-ink drop-shadow-[0_0_10px_rgba(207, 205, 199,.85)]">
              &lt;/&gt;
            </span>
          </div>
        </div>

        {/* وردمارک + نوار پیشرفت */}
        <div className="flex flex-col items-center gap-3.5">
          <p
            className="animate-gradient-move-fast bg-[length:200%_auto] bg-clip-text font-display text-[26px] font-normal text-transparent"
            style={{
              backgroundImage: "linear-gradient(90deg, #D9D7D1, #CFCDC7, #4A4A52, #D9D7D1)",
            }}
          >
            WebPIKASO
          </p>
          <div className="h-[3px] w-52 overflow-hidden rounded-full bg-surface">
            <span className="block h-full w-1/3 animate-loader-bar-slide rounded-full bg-gradient-to-r from-accent2 via-accent to-accent3" />
          </div>
        </div>
      </div>
    </div>
  );
}
