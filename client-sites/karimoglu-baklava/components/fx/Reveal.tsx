"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

/**
 * ظاهر شدن نرم هنگام ورود به دید (Scroll Reveal) با Motion.
 * - Reveal: یک بلوک تکی
 * - Stagger + StaggerItem: فرزندان پشت‌سرهم با تاخیر ظاهر می‌شوند
 */
type Direction = "up" | "down" | "left" | "right" | "scale" | "tilt";

const offsets: Record<Direction, Record<string, number>> = {
  up: { y: 48 },
  down: { y: -48 },
  left: { x: 60 },
  right: { x: -60 },
  scale: { scale: 0.85 },
  tilt: { y: 60, rotate: -4 },
};

const ease = [0.22, 1, 0.36, 1] as const;

export function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
  duration = 0.8,
  amount = 0.25,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: Direction;
  duration?: number;
  amount?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offsets[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

const container: Variants = {
  hidden: {},
  show: (stagger: number) => ({ transition: { staggerChildren: stagger, delayChildren: 0.05 } }),
};

const item: Variants = {
  hidden: { opacity: 0, y: 56, rotate: -2, scale: 0.96 },
  show: { opacity: 1, y: 0, rotate: 0, scale: 1, transition: { duration: 0.7, ease } },
};

export function Stagger({
  children,
  className,
  stagger = 0.09,
  amount = 0.15,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  amount?: number;
  as?: "div" | "ul";
}) {
  const Comp = as === "ul" ? motion.ul : motion.div;
  return (
    <Comp
      className={className}
      variants={container}
      custom={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {children}
    </Comp>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
}) {
  const Comp = as === "li" ? motion.li : motion.div;
  return (
    <Comp className={className} variants={item}>
      {children}
    </Comp>
  );
}
