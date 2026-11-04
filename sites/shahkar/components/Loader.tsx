"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { markReady } from "@/lib/ready";
import { Emblem } from "./Ornaments";

/** Intro: an arch emblem draws itself, the name appears, then the garden gate swings open. */
export default function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("is-loading");
    const finish = () => {
      html.classList.remove("is-loading");
      setGone(true);
      markReady();
    };

    if (prefersReducedMotion()) {
      const t = setTimeout(finish, 300);
      return () => clearTimeout(t);
    }

    const ctx = gsap.context(() => {
      const quick = sessionStorage.getItem("shahkar-intro") === "1";
      try {
        sessionStorage.setItem("shahkar-intro", "1");
      } catch {}
      const tl = gsap.timeline({ onComplete: finish, defaults: { ease: "power3.out" } });
      tl.set(".ld-emblem path", { strokeDasharray: 1, strokeDashoffset: 1 })
        .to(".ld-emblem path", {
          strokeDashoffset: 0,
          duration: quick ? 0.6 : 1.4,
          ease: "power2.inOut",
          stagger: 0.06,
        })
        .from(".ld-name", { yPercent: 60, autoAlpha: 0, duration: 0.8 }, "-=0.6")
        .from(".ld-sub", { autoAlpha: 0, letterSpacing: "0.8em", duration: 0.7 }, "-=0.4")
        .to(".ld-glow", { autoAlpha: 1, scale: 1.2, duration: 0.6 }, "<")
        .to(".ld-center", { autoAlpha: 0, y: -20, duration: 0.45, delay: quick ? 0.1 : 0.4, ease: "power2.in" })
        .to(".ld-door-r", { rotateY: 104, duration: 1.4, ease: "power3.inOut" }, "open")
        .to(".ld-door-l", { rotateY: -104, duration: 1.4, ease: "power3.inOut" }, "open")
        .to(".ld-light", { autoAlpha: 1, duration: 0.6 }, "open")
        .to(root.current, { autoAlpha: 0, duration: 0.5 }, "-=0.45");
    }, root);

    // Safety net — never trap the visitor behind the intro.
    const safety = setTimeout(finish, 7000);
    return () => {
      clearTimeout(safety);
      ctx.revert();
    };
  }, []);

  if (gone) return null;

  return (
    <div className="loader" ref={root} aria-hidden="true">
      <div className="ld-light" />
      <div className="ld-gate">
        <div className="ld-door ld-door-r">
          <span className="ld-door-pattern" />
          <span className="ld-handle" />
        </div>
        <div className="ld-door ld-door-l">
          <span className="ld-door-pattern" />
          <span className="ld-handle" />
        </div>
      </div>
      <div className="ld-center">
        <span className="ld-glow" />
        <Emblem className="ld-emblem" />
        <div className="ld-name">شاهکار</div>
        <div className="ld-sub">باغچه رستوران</div>
      </div>
    </div>
  );
}
