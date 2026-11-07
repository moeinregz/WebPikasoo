"use client";

import * as React from "react";
import { NeuroNoise } from "@paper-design/shaders-react";
import { ArrowUpLeft, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

// Final call-to-action from the "cta-06" block (21st.dev): a bordered panel
// with an animated neuro-noise shader fading in from one side. Changes:
// - the theme comes from the site's own `.dark` class on <html> (the site
//   has its own toggle, not next-themes);
// - blood-red shader instead of white, fading in from the left (RTL: the
//   copy sits on the right);
// - the shader stops animating while the panel is off screen;
// - Persian copy and the site's WhatsApp / phone actions.

function useIsDark() {
  const [dark, setDark] = React.useState(true);
  React.useEffect(() => {
    const html = document.documentElement;
    const read = () => setDark(html.classList.contains("dark"));
    read();
    const mo = new MutationObserver(read);
    mo.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);
  return dark;
}

export default function CTA() {
  const dark = useIsDark();
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="px-0 py-16 sm:px-6">
      <div ref={ref} className="relative mx-auto max-w-5xl overflow-hidden border-y border-ink/15 bg-surface/40 p-8 shadow-lg shadow-black/20 sm:rounded-xl sm:border-x sm:p-14">
        <NeuroNoise
          aria-hidden
          brightness={0}
          className="absolute inset-0 [mask-image:linear-gradient(to_right,black_30%,transparent)] sm:[mask-image:linear-gradient(to_right,black_10%,transparent)]"
          colorBack={dark ? "rgba(0, 0, 0, 0)" : "rgba(120, 8, 22, 0.06)"}
          colorFront={dark ? "rgba(255, 210, 215, 0.9)" : "rgba(120, 8, 22, 0.08)"}
          colorMid={dark ? "rgba(178, 16, 36, 0.95)" : "rgba(150, 10, 30, 0.55)"}
          contrast={1}
          height={720}
          scale={0.55}
          speed={visible && !reduced ? 1 : 0}
          width={1280}
          maxPixelCount={1280 * 720}
        />

        <div className="relative isolate text-right">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-blood-hi/40 bg-blood/[0.08] px-3.5 py-1.5 text-[12.5px] text-dim">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-blood-hi" />
            آماده‌ی همکاری روی پروژه‌های جدید
          </span>
          <h2 className="text-balance font-display text-4xl font-normal leading-[1.35] text-ink md:leading-tight lg:text-[2.9rem]">
            بیا یه چیز خفن با هم بسازیم.
          </h2>
          <p className="mt-4 max-w-[46ch] text-balance text-lg/normal text-dim md:mt-3 lg:text-[1.3rem]/normal">
            برای پنل مدیریت، فروشگاه آنلاین یا هر ایده‌ای که تو سرته پیام بده؛ سریع جواب می‌دیم. بدون تعهد، بدون هزینه.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild className="btn-blood h-12 gap-2 px-7 text-[15px] font-bold text-white">
              <a href="https://wa.me/989965745535" target="_blank" rel="noopener noreferrer">
                شروع گفتگو در واتساپ <ArrowUpLeft className="size-5" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-12 gap-2 px-7 text-[15px] font-bold">
              <a href="tel:+989965745535">
                <Phone className="size-4" /> تماس مستقیم
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
