"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** نوار پیشرفت اسکرول بالای صفحه — رنگ شهد عسل، از راست به چپ (RTL) */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 24, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-1.5 origin-right bg-honey"
      style={{ scaleX }}
    />
  );
}
