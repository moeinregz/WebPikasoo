"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { SITE, waLink } from "@/lib/site";

/** LED-curtain backdrop — a nod to the light curtain on Shahkar's stage. */
function LedCurtain() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const GAP = 22;
    const COLORS = ["#f3d98b", "#d9b45a", "#ffb347", "#f3d98b", "#ff6b6b", "#6bc5ff", "#8dff9e", "#d9b45a"];
    let w = 0, h = 0, cols = 0, rows = 0, raf = 0, visible = false, t = 0;
    let seeds: number[] = [];
    let mx = -9999, my = -9999;

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / GAP) + 1;
      rows = Math.ceil(h / GAP) + 1;
      seeds = Array.from({ length: cols * rows }, () => Math.random());
      draw();
    };
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const s = seeds[y * cols + x];
          const px = x * GAP + (y % 2 ? GAP / 2 : 0);
          const py = y * GAP;
          const wave = Math.sin(x * 0.35 + t * 1.6) * Math.cos(y * 0.28 - t * 1.1);
          const dist = Math.hypot(px - mx, py - my);
          const near = Math.max(0, 1 - dist / 180);
          let a = 0.08 + Math.max(0, wave) * 0.5 + near * 0.8;
          if (s > 0.985) a = Math.max(a, 0.5 + 0.5 * Math.sin(t * 6 + s * 100));
          ctx.globalAlpha = Math.min(1, a);
          ctx.fillStyle = s > 0.9 ? COLORS[Math.floor(s * 1000) % COLORS.length] : "#d9b45a";
          ctx.beginPath();
          ctx.arc(px, py, 2.2 + near * 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    const tick = () => {
      raf = 0;
      if (!visible) return;
      t += 0.016;
      draw();
      raf = requestAnimationFrame(tick);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting && !reduce;
      if (visible && !raf) raf = requestAnimationFrame(tick);
    });
    io.observe(canvas);
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    };
    const onLeave = () => { mx = my = -9999; };
    canvas.parentElement!.addEventListener("pointermove", onMove);
    canvas.parentElement!.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.parentElement?.removeEventListener("pointermove", onMove);
      canvas.parentElement?.removeEventListener("pointerleave", onLeave);
    };
  }, []);
  return <canvas ref={ref} className="led" aria-hidden="true" />;
}

export default function LiveMusic() {
  return (
    <section className="music" id="music">
      <LedCurtain />
      <div className="music-fade" />
      <div className="music-inner">
        <motion.div
          className="music-copy"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="eyebrow">شب‌های شاهکار</span>
          <h2 className="music-title">
            موسیقی <em>زنده</em>
          </h2>
          <p className="music-lead">
            صحنه‌ای زیر پرده‌ی نور، صدای زنده و حال خوب. در شب‌های ویژه، میزبان
            <strong> هنرمندان سینما و موزیک پاپ کشور </strong>
            هستیم؛ برای خبر از برنامه‌های پیش‌رو صفحه‌ی اینستاگرام ما را دنبال کنید.
          </p>
          <div className="music-actions">
            <a className="btn btn-gold" href={SITE.instagramHref} target="_blank" rel="noreferrer">
              برنامه‌ها در اینستاگرام
            </a>
            <a className="btn btn-ghost" href={waLink("سلام، برای شب موسیقی زنده‌ی شاهکار میز می‌خواستم.")} target="_blank" rel="noreferrer">
              رزرو میز شب اجرا
            </a>
          </div>
        </motion.div>

        <motion.div
          className="music-visual"
          initial={{ opacity: 0, scale: 0.8, rotate: -20 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="vinyl">
            <div className="vinyl-label">
              <span>شاهکار</span>
              <small>LIVE</small>
            </div>
          </div>
          <div className="eq" aria-hidden="true">
            {Array.from({ length: 18 }, (_, i) => (
              <span key={i} style={{ animationDelay: `${(i * 137) % 900}ms`, animationDuration: `${700 + ((i * 89) % 600)}ms` }} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
