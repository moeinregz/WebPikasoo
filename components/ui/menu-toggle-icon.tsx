"use client";

import { cn } from "@/lib/utils";

// Hamburger that morphs into an X (the header block's MenuToggleIcon; its
// source wasn't provided, so this is a small SVG version).
export function MenuToggleIcon({ open, className, duration = 300 }: { open: boolean; className?: string; duration?: number }) {
  const t = { transition: `transform ${duration}ms ease, opacity ${duration}ms ease`, transformOrigin: "12px 12px" };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className={cn("size-5", className)} aria-hidden="true">
      <path d="M4 7h16" style={{ ...t, transform: open ? "translateY(5px) rotate(45deg)" : "none" }} />
      <path d="M4 12h16" style={{ ...t, opacity: open ? 0 : 1 }} />
      <path d="M4 17h16" style={{ ...t, transform: open ? "translateY(-5px) rotate(-45deg)" : "none" }} />
    </svg>
  );
}
