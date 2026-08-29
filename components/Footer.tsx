"use client";

export default function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-canvas py-7">
      <div className="mx-auto flex max-w-container flex-wrap items-center justify-between gap-3 px-6">
        <p className="font-mono text-[13px] text-dim">
          © 2026 وب پیکاسو WebPIKASO —
        </p>
        <button
          className="flex items-center gap-2 font-mono text-[13px] text-dim transition-colors hover:text-accent"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          بازگشت به بالا
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      </div>
    </footer>
  );
}
