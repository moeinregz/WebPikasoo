"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

// Big outlined wordmark whose gradient is revealed under the cursor, from
// the "hover-footer" block (21st.dev). Changes: unique SVG ids per
// instance (the block's fixed ids would clash with other SVG gradients on
// the page), a blood-red/white gradient instead of the block's rainbow,
// the site's Latin display face, and the text stretched to the viewBox so
// any word fits.

export const TextHoverEffect = ({ text, duration, className }: { text: string; duration?: number; className?: string }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });
  const uid = useId().replace(/:/g, "");
  const gradId = `wp_text_grad_${uid}`;
  const revealId = `wp_reveal_${uid}`;
  const maskId = `wp_mask_${uid}`;

  useEffect(() => {
    if (!svgRef.current) return;
    const r = svgRef.current.getBoundingClientRect();
    // hidden (mobile) or not laid out yet: nothing to track
    if (!r.width || !r.height) return;
    setMaskPosition({ cx: `${((cursor.x - r.left) / r.width) * 100}%`, cy: `${((cursor.y - r.top) / r.height) * 100}%` });
  }, [cursor]);

  const textProps = {
    x: "50%",
    y: "50%",
    textAnchor: "middle" as const,
    dominantBaseline: "middle" as const,
    strokeWidth: 0.3,
    textLength: 286,
    lengthAdjust: "spacingAndGlyphs" as const,
    style: { fontFamily: "var(--font-latin), sans-serif", fontSize: 64, fontWeight: 800 },
  };

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 300 100"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      className={cn("cursor-default select-none", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="300" y2="0">
          {hovered && (
            <>
              <stop offset="0%" stopColor="#5e0612" />
              <stop offset="30%" stopColor="#b21024" />
              <stop offset="50%" stopColor="#f2eee8" />
              <stop offset="70%" stopColor="#b21024" />
              <stop offset="100%" stopColor="#5e0612" />
            </>
          )}
        </linearGradient>
        <motion.radialGradient
          id={revealId}
          gradientUnits="userSpaceOnUse"
          r="20%"
          initial={{ cx: "50%", cy: "50%" }}
          animate={maskPosition}
          transition={{ duration: duration ?? 0, ease: "easeOut" }}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>
        <mask id={maskId}>
          <rect x="0" y="0" width="100%" height="100%" fill={`url(#${revealId})`} />
        </mask>
      </defs>
      <text {...textProps} className="fill-transparent stroke-ink/25 [stroke-width:0.9px] sm:[stroke-width:0.5px] lg:[stroke-width:0.3px]" style={{ ...textProps.style, opacity: hovered ? 0.7 : 0 }}>
        {text}
      </text>
      <motion.text
        {...textProps}
        className="fill-transparent stroke-blood-hi [stroke-width:0.9px] sm:[stroke-width:0.5px] lg:[stroke-width:0.3px]"
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        whileInView={{ strokeDashoffset: 0, strokeDasharray: 1000 }}
        viewport={{ once: true }}
        transition={{ duration: 4, ease: "easeInOut" }}
      >
        {text}
      </motion.text>
      <text {...textProps} stroke={`url(#${gradId})`} mask={`url(#${maskId})`} className="fill-transparent [stroke-width:0.9px] sm:[stroke-width:0.5px] lg:[stroke-width:0.3px]">
        {text}
      </text>
    </svg>
  );
};

export const FooterBackgroundGradient = () => (
  <div
    aria-hidden
    className="absolute inset-0 z-0"
    style={{ background: "radial-gradient(125% 125% at 50% 10%, rgb(var(--color-canvas) / 0.4) 50%, rgb(var(--color-blood-hi) / 0.22) 100%)" }}
  />
);
