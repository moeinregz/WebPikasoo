"use client";

import { useEffect, useState, type ElementType, type ReactNode, type CSSProperties } from "react";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  delay?: number;
};

export default function Reveal({
  children,
  as: Tag = "div",
  className = "",
  style,
  delay = 0,
}: RevealProps) {
  const [node, setNode] = useState<Element | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [node]);

  return (
    <Tag
      ref={setNode}
      style={{ ...style, transitionDelay: visible ? `${delay}ms` : "0ms" }}
      className={[
        "transition-all duration-700 ease-out",
        "motion-reduce:transition-none motion-reduce:transform-none motion-reduce:blur-none motion-reduce:opacity-100",
        visible ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-7 blur-[6px]",
        className,
      ].join(" ")}
    >
      {children}
    </Tag>
  );
}
