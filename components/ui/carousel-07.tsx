"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useMotionValue, useTransform, animate, type PanInfo, type MotionValue } from "motion/react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Stacked, draggable card carousel adapted from the "carousel-07" block
// (21st.dev): same motion math (offset → x, y, rotate, scale, z-index,
// wrap-around). Adaptations for the portfolio:
// - slides come from props (the projects), not a hard-coded list;
// - the project screenshots are landscape while cards are portrait, so a
//   card shows the whole screenshot over a blurred, frosted copy of itself
//   and puts the text on a frosted-glass panel at the bottom;
// - a tap on the drag surface opens the front card's link; arrow buttons
//   and the keyboard also move it;
// - cards far from the front are not displayed, so a long list stays light;
// - theme tokens and Tailwind 3 classes instead of shadcn/Tailwind 4 ones.

export interface Slide {
  image: string;
  title: string;
  description: string;
  badge: string;
  href?: string;
}

interface CarouselConfig {
  distanceDivisor: number;
  velocityDivisor: number;
  sensitivity: number;
  xMultiplier: number;
  yMultiplier: number;
  rotationMultiplier: number;
  scaleReduction: number;
}

const getCarouselConfig = (width: number): CarouselConfig => {
  if (width < 640) {
    return { distanceDivisor: 120, velocityDivisor: 500, sensitivity: 180, xMultiplier: 110, yMultiplier: 20, rotationMultiplier: 8, scaleReduction: 0.07 };
  }
  if (width < 1024) {
    return { distanceDivisor: 160, velocityDivisor: 650, sensitivity: 220, xMultiplier: 170, yMultiplier: 30, rotationMultiplier: 10, scaleReduction: 0.09 };
  }
  return { distanceDivisor: 200, velocityDivisor: 800, sensitivity: 250, xMultiplier: 220, yMultiplier: 40, rotationMultiplier: 11, scaleReduction: 0.11 };
};

const SPRING = { type: "spring" as const, stiffness: 200, damping: 30, mass: 1 };

export default function CarouselStacked({ slides, className }: { slides: Slide[]; className?: string }) {
  const scrollProgress = useMotionValue(0);
  const startProgress = React.useRef(0);
  const dragged = React.useRef(false);
  const [windowWidth, setWindowWidth] = React.useState(1280);
  const [active, setActive] = React.useState(0);
  const total = slides.length;

  React.useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Which slide is in front (for the counter, the link and the arrows).
  React.useEffect(
    () =>
      scrollProgress.on("change", (p) => {
        const i = ((Math.round(p) % total) + total) % total;
        setActive((cur) => (cur === i ? cur : i));
      }),
    [scrollProgress, total]
  );

  const config = React.useMemo(() => getCarouselConfig(windowWidth), [windowWidth]);

  const go = (step: number) => animate(scrollProgress, Math.round(scrollProgress.get()) + step, SPRING);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const distanceShift = -info.offset.x / config.distanceDivisor;
    const velocityShift = -info.velocity.x / config.velocityDivisor;
    const totalShift = Math.max(-3, Math.min(3, Math.round(distanceShift + velocityShift)));
    animate(scrollProgress, Math.round(startProgress.current) + totalShift, SPRING);
  };

  const openActive = () => {
    const href = slides[active]?.href;
    if (href && !dragged.current) window.open(href, "_blank", "noopener,noreferrer");
  };

  if (total === 0) return null;

  return (
    <div
      className={cn("flex w-full select-none flex-col items-center justify-center overflow-hidden py-6", className)}
      role="region"
      aria-roledescription="carousel"
      aria-label="نمونه‌کارها"
      tabIndex={0}
      onKeyDown={(e) => {
        // RTL: the left arrow moves forward.
        if (e.key === "ArrowLeft") go(1);
        else if (e.key === "ArrowRight") go(-1);
        else if (e.key === "Enter") openActive();
      }}
    >
      <div className="relative flex h-[22rem] w-full max-w-7xl items-center justify-center sm:h-[28rem] lg:h-[32rem]" dir="ltr">
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0}
          onDragStart={() => {
            dragged.current = true;
            startProgress.current = scrollProgress.get();
          }}
          onDrag={(_, info) => scrollProgress.set(scrollProgress.get() - info.delta.x / config.sensitivity)}
          onDragEnd={(e, info) => {
            handleDragEnd(e, info);
            setTimeout(() => (dragged.current = false), 0);
          }}
          onTap={openActive}
          className={cn("absolute inset-0 z-[200] cursor-grab active:cursor-grabbing", slides[active]?.href && "cursor-pointer")}
          aria-hidden
        />
        {slides.map((slide, i) => (
          <Card key={`${slide.title}-${i}`} slide={slide} index={i} total={total} progress={scrollProgress} config={config} />
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 px-4">
        <button type="button" onClick={() => go(-1)} aria-label="قبلی" className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink transition hover:bg-ink/10">
          <ChevronRight className="h-5 w-5" />
        </button>
        <span className="min-w-[4.5rem] text-center text-[13px] text-dim" aria-live="polite">
          {(active + 1).toLocaleString("fa-IR")} از {total.toLocaleString("fa-IR")}
        </span>
        <button type="button" onClick={() => go(1)} aria-label="بعدی" className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink transition hover:bg-ink/10">
          <ChevronLeft className="h-5 w-5" />
        </button>
        {slides[active]?.href && (
          <a
            href={slides[active].href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full bg-ink px-4 text-[13px] font-bold text-canvas transition hover:bg-ink/85"
          >
            مشاهده‌ی {slides[active].title}
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  );
}

interface CardProps {
  slide: Slide;
  index: number;
  total: number;
  progress: MotionValue<number>;
  config: CarouselConfig;
}

function Card({ slide, index, total, progress, config }: CardProps) {
  const offset = useTransform(progress, (p) => {
    let diff = (index - p) % total;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  });

  const x = useTransform(offset, (o) => o * config.xMultiplier);
  const rotate = useTransform(offset, (o) => (Math.abs(o) < 0.05 ? 0 : o * config.rotationMultiplier));
  const y = useTransform(offset, (o) => (Math.abs(o) < 0.05 ? 0 : Math.abs(o) * config.yMultiplier));
  const scale = useTransform(offset, (o) => 1 - Math.abs(o) * config.scaleReduction);
  const opacity = useTransform(offset, (o) => (Math.abs(o) > 3.2 ? 0 : Math.abs(o) > 2.6 ? (3.2 - Math.abs(o)) / 0.6 : 1));
  const display = useTransform(offset, (o) => (Math.abs(o) > 3.3 ? "none" : "block"));
  const zIndex = useTransform(offset, (o) => Math.round(100 - Math.abs(o) * 10));
  const shade = useTransform(offset, [-2, -0.5, 0, 0.5, 2], [0.55, 0.25, 0, 0.25, 0.55]);
  const textOpacity = useTransform(offset, [-0.6, 0, 0.6], [0, 1, 0]);

  return (
    <motion.div
      style={{ x, rotate, y, scale, opacity, zIndex, display }}
      className="pointer-events-none absolute h-80 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#101013] shadow-2xl shadow-black/40 sm:h-[25rem] sm:w-72 lg:h-[28rem] lg:w-80"
    >
      {slide.image ? (
        <>
          {/* frosted fill: the same screenshot, blurred, covering the card */}
          <Image src={slide.image} alt="" fill sizes="96px" className="scale-125 object-cover opacity-70 blur-2xl" aria-hidden />
          <div className="absolute inset-0 bg-black/30" />
          {/* the whole screenshot, uncropped */}
          <div className="absolute inset-x-3 top-3 overflow-hidden rounded-xl border border-white/15 shadow-lg sm:inset-x-4 sm:top-4">
            <Image src={slide.image} alt={slide.title} width={1400} height={900} sizes="(min-width: 1024px) 320px, (min-width: 640px) 288px, 224px" className="h-auto w-full" />
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex items-start justify-center bg-gradient-to-b from-white/10 to-transparent pt-16 font-display text-5xl text-white/30">
          {slide.title.slice(0, 1)}
        </div>
      )}

      <motion.div style={{ opacity: shade }} className="pointer-events-none absolute inset-0 bg-black" />

      {/* frosted-glass panel with the text */}
      <div dir="rtl" className="absolute inset-x-0 bottom-0 border-t border-white/15 bg-white/10 p-4 text-right text-white backdrop-blur-xl sm:p-5">
        <Badge className="mb-2 border-white/20 bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-black">{slide.badge}</Badge>
        <motion.p style={{ opacity: textOpacity }} className="mb-1 font-display text-lg leading-tight drop-shadow-md sm:text-xl">
          {slide.title}
        </motion.p>
        <motion.p style={{ opacity: textOpacity }} className="line-clamp-2 text-[12.5px] leading-6 text-white/75">
          {slide.description}
        </motion.p>
      </div>
    </motion.div>
  );
}
