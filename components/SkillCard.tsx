"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { SKILL_META, DEFAULT_SKILL_COLOR } from "./skillMeta";

type Skill = { name: string; desc: string };

// شعاعی که خارج از خودِ کارت هم حساب می‌شه — یعنی اگه موس تا این فاصله
// (وب پیکاسو) به لبه‌ی کارت نزدیک بشه، گلو شروع به روشن‌شدن می‌کنه، نه فقط
// وقتی دقیقاً روی کارته.
const PROXIMITY_REACH = 150;

// یه کارت مهارت تکی — بردر و بک‌گراندش رنگ خودِ برند اون تکنولوژیه و با
// فاصله‌ی موس تا کارت (نه فقط هاور مستقیم) روشن و کم‌رنگ می‌شه: هرچی موس
// نزدیک‌تر باشه، گلو قوی‌تره؛ از یه فاصله‌ی مشخص به بعد کاملاً خاموشه.
// موقعیت نور هم با --sx/--sy (نسبت به خود کارت) دنبال موس می‌ره — یعنی
// حتی وقتی موس بیرون کارته، نور از سمتی که موس نزدیک‌تره می‌تابه.
export default function SkillCard({ skill }: { skill: Skill }) {
  const ref = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const [logoOk, setLogoOk] = useState(true);
  const meta = SKILL_META[skill.name] ?? { color: DEFAULT_SKILL_COLOR };
  const words = skill.desc.split(" ");

  useEffect(() => {
    function applyFromPoint(x: number, y: number) {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();

      const nearestX = Math.min(Math.max(x, rect.left), rect.right);
      const nearestY = Math.min(Math.max(y, rect.top), rect.bottom);
      const dist = Math.hypot(x - nearestX, y - nearestY);

      const intensity = Math.max(0, 1 - dist / PROXIMITY_REACH);
      el.style.setProperty("--glow-o", intensity.toFixed(3));
      el.style.setProperty("--sx", `${((x - rect.left) / rect.width) * 100}%`);
      el.style.setProperty("--sy", `${((y - rect.top) / rect.height) * 100}%`);
    }

    function handlePointerMove(e: PointerEvent) {
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        applyFromPoint(e.clientX, e.clientY);
      });
    }

    function handlePointerLeaveDoc() {
      ref.current?.style.setProperty("--glow-o", "0");
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("pointerleave", handlePointerLeaveDoc);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", handlePointerLeaveDoc);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{ "--skill-color": meta.color } as CSSProperties}
      className="skill-card group rounded-[12px] border border-ink/10 bg-surface/50 p-6 transition-colors"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="skill-title-glow block font-mono text-[15px] font-bold group-hover:[animation:titleDrop_.4s_cubic-bezier(.16,1,.3,1)]">
          {skill.name}
        </span>

        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center">
          {meta.slug && logoOk ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`https://cdn.simpleicons.org/${meta.slug}`}
              alt=""
              width={20}
              height={20}
              loading="lazy"
              className="skill-icon-logo h-5 w-5"
              onError={() => setLogoOk(false)}
            />
          ) : (
            <span
              className="skill-icon-logo flex h-6 w-6 items-center justify-center rounded-[6px] border font-mono text-[10px] font-black leading-none"
              style={{ color: "var(--skill-color)", borderColor: "var(--skill-color)" }}
            >
              {meta.mono ?? skill.name[0]}
            </span>
          )}
        </span>
      </div>

      <span className="block text-[13.5px] leading-relaxed text-dim">
        {words.map((w, i) => (
          <span
            key={i}
            className="inline-block group-hover:[animation:rainIn_.5s_cubic-bezier(.16,1,.3,1)_both]"
            style={{ animationDelay: `${150 + i * 45}ms` }}
          >
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </span>
        ))}
      </span>
    </div>
  );
}
