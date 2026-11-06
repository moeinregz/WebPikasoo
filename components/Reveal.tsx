"use client";

import { useEffect, useMemo, useRef, useState, type ElementType, type ReactNode, type CSSProperties } from "react";
import { motion, useInView, useReducedMotion, type Variants } from "motion/react";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  id?: string;
};

// حالت مخفی: کمی پایین‌تر، کوچیک‌تر و با یه چرخش سه‌بعدی ملایم به عقب؛
// موقع ورود با یه فنر نرم صاف می‌شه سر جاش.
// Light on purpose: opacity + a short slide (no scale / 3D rotation /
// perspective), and a plain tween instead of a spring, so dozens of these
// on a page stay cheap on phones.
const variants: Variants = {
  hidden: { opacity: 0, y: 28, transition: { duration: 0 } },
  shown: { opacity: 1, y: 0 },
};

export default function Reveal({
  children,
  as: Tag = "div",
  className = "",
  style,
  delay = 0,
  id,
}: RevealProps) {
  const MotionTag = useMemo(() => motion.create(Tag), [Tag]);
  const ref = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();
  // پیش‌فرض «دیده‌شده» — سرور و اولین رندر همیشه محتوا رو کامل نشون می‌دن.
  // فقط وقتی بعد از هیدریشن معلوم شد المان هنوز پایین‌تر از دیدرسه، مخفی
  // می‌شه و منتظر اسکرول می‌مونه. هر چیزی که همون لحظه‌ی اول تو دیده (یا
  // با لینک anchor ازش رد شدیم) اصلاً مخفی نمی‌شه.
  const [armed, setArmed] = useState(false);
  const inView = useInView(ref, { once: true, amount: "some", margin: "0px 0px -8% 0px" });

  useEffect(() => {
    if (!ref.current || reduce) return;
    const rect = ref.current.getBoundingClientRect();
    if (rect.top >= window.innerHeight * 0.9) setArmed(true);
  }, [reduce]);

  const state = !armed || inView ? "shown" : "hidden";

  return (
    <MotionTag
      ref={ref}
      id={id}
      style={style}
      className={className}
      variants={variants}
      initial={false}
      animate={state}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: delay / 1000 }}
    >
      {children}
    </MotionTag>
  );
}
