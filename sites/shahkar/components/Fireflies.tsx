"use client";

import { useEffect, useRef } from "react";

/** Golden fireflies drifting over the garden. Pauses when off-screen. */
export default function Fireflies({ count = 55 }: { count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0, visible = true;

    // Pre-rendered glow sprite (cheaper than shadowBlur each frame).
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 64;
    const s = sprite.getContext("2d")!;
    const g = s.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,244,200,1)");
    g.addColorStop(0.2, "rgba(243,205,110,.85)");
    g.addColorStop(0.5, "rgba(217,170,70,.25)");
    g.addColorStop(1, "rgba(217,170,70,0)");
    s.fillStyle = g;
    s.fillRect(0, 0, 64, 64);

    const flies = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 6 + Math.random() * 14,
      vx: (Math.random() - 0.5) * 0.00025,
      vy: -0.00008 - Math.random() * 0.0002,
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 1.6,
      wob: 0.5 + Math.random(),
    }));

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(tick);
    });
    io.observe(canvas);

    let t = 0;
    function tick() {
      raf = 0;
      if (!visible) return;
      t += 0.016;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (const f of flies) {
        f.x += f.vx + Math.sin(t * f.wob + f.phase) * 0.00025;
        f.y += f.vy;
        if (f.y < -0.05) { f.y = 1.05; f.x = Math.random(); }
        if (f.x < -0.05) f.x = 1.05;
        if (f.x > 1.05) f.x = -0.05;
        const a = 0.25 + 0.75 * Math.max(0, Math.sin(t * f.speed + f.phase));
        ctx.globalAlpha = a;
        ctx.drawImage(sprite, f.x * w - f.r, f.y * h - f.r, f.r * 2, f.r * 2);
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [count]);

  return <canvas ref={ref} className="fireflies" aria-hidden="true" />;
}
