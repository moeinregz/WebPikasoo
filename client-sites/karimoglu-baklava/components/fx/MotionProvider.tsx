"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** همه انیمیشن‌های Motion به تنظیم «کاهش حرکت» سیستم کاربر احترام می‌گذارند. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
