"use client";

/**
 * نقطه واحد ثبت پلاگین‌های GSAP. هر کامپوننتی که از GSAP استفاده می‌کند
 * باید از همین فایل import کند تا ScrollTrigger فقط یک‌بار (و فقط سمت
 * مرورگر) ثبت شود.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  gsap.defaults({ ease: "power3.out", duration: 0.8 });
}

export { gsap, ScrollTrigger, useGSAP };

/** آیا کاربر در تنظیمات سیستم «کاهش حرکت» را فعال کرده است؟ */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
