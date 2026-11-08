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
// - the project screenshots are landscape, so the block's portrait
//   cards are landscape (14:9, like the screenshots) so each screenshot
//   fills its card edge to edge, with the text on a frosted-glass panel
//   over the bottom of the image;
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
    return { distanceDivisor: 120, velocityDivisor: 500, sensitivity: 180, xMultiplier: 120, yMultiplier: 14, rotationMultiplier: 8, scaleReduction: 0.07 };
  }
  if (width < 1024) {
    return { distanceDivisor: 160, velocityDivisor: 650, sensitivity: 220, xMultiplier: 230, yMultiplier: 22, rotationMultiplier: 10, scaleReduction: 0.09 };
  }
  return { distanceDivisor: 200, velocityDivisor: 800, sensitivity: 250, xMultiplier: 300, yMultiplier: 28, rotationMultiplier: 11, scaleReduction: 0.11 };
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
      <div className="relative flex h-[15rem] w-full items-center justify-center sm:h-[22rem] lg:h-[27rem]" dir="ltr">
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
  const opacity = useTransform(offset, (o) => (Math.abs(o) > 4.2 ? 0 : Math.abs(o) > 3.6 ? (4.2 - Math.abs(o)) / 0.6 : 1));
  const display = useTransform(offset, (o) => (Math.abs(o) > 4.3 ? "none" : "block"));
  const zIndex = useTransform(offset, (o) => Math.round(100 - Math.abs(o) * 10));
  const shade = useTransform(offset, [-2, -0.5, 0, 0.5, 2], [0.55, 0.25, 0, 0.25, 0.55]);
  const textOpacity = useTransform(offset, [-0.6, 0, 0.6], [0, 1, 0]);
  // Backdrop blur is costly; only the front card's panel gets it.
  const glass = useTransform(offset, (o) => (Math.abs(o) < 0.5 ? "blur(12px)" : "none"));

  return (
    <motion.div
      style={{ x, rotate, y, scale, opacity, zIndex, display }}
      className="pointer-events-none absolute aspect-[14/9] w-[78vw] max-w-[18rem] overflow-hidden rounded-2xl border border-white/10 bg-[#101013] shadow-2xl shadow-black/40 sm:max-w-none sm:w-[26rem] lg:w-[34rem]"
    >
      {slide.image ? (
        // Cards share the screenshots' 14:9 shape, so the image fills the
        // card edge to edge without cropping its sides.
        <Image src={slide.image} alt={slide.title} fill sizes="(min-width: 1024px) 544px, (min-width: 640px) 416px, 78vw" className="object-cover object-top" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-white/10 to-transparent font-display text-5xl text-white/30">
          {slide.title.slice(0, 1)}
        </div>
      )}

      <motion.div style={{ opacity: shade }} className="pointer-events-none absolute inset-0 bg-black" />

      {/* frosted-glass panel with the text */}
      <motion.div dir="rtl" style={{ backdropFilter: glass, WebkitBackdropFilter: glass }} className="absolute inset-x-0 bottom-0 border-t border-white/15 bg-black/35 px-3.5 py-2.5 text-right text-white sm:px-5 sm:py-3.5">
        <Badge className="mb-1.5 border-white/20 bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-black">{slide.badge}</Badge>
        <motion.p style={{ opacity: textOpacity }} className="font-display text-base leading-tight drop-shadow-md sm:text-xl">
          {slide.title}
        </motion.p>
        <motion.p style={{ opacity: textOpacity }} className="mt-0.5 hidden truncate text-[12.5px] leading-6 text-white/80 sm:block">
          {slide.description}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
