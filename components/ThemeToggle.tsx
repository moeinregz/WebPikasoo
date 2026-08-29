"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "webpikaso-theme";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  // Starts true (dark) to match the server-rendered markup and the
  // no-FOUC script in layout.tsx; synced from the DOM right after mount.
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // localStorage unavailable (e.g. private mode) — theme just won't persist.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "تغییر به حالت روشن" : "تغییر به حالت تاریک"}
      title={isDark ? "حالت روشن" : "حالت تاریک"}
      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-ink/[0.12] text-ink/80 transition hover:border-accent hover:text-accent ${className}`}
    >
      {/* Reserve the icon slot before mount so there's no layout jump; a
          bare button with no icon briefly is preferable to guessing wrong. */}
      {mounted && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-[18px] w-[18px]">
          {isDark ? (
            <>
              <circle cx="12" cy="12" r="4.5" />
              <path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
            </>
          ) : (
            <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
          )}
        </svg>
      )}
    </button>
  );
}
