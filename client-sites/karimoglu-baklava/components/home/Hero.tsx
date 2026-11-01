"use client";

import Link from "next/link";
import { useRef } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SplitWords } from "@/components/fx/SplitWords";
import { Magnetic } from "@/components/fx/Magnetic";
import { BaklavaSlice, BaklavaDiamond, Pistachio, HoneyDrop, TeaGlass, Shamseh } from "@/components/decor/Baklava";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/fx/gsap";
import { onIntroDone } from "@/lib/fx/intro";

/**
 * Hero — Copy همان متن کارکردی قبلی است (شعار نهایی برند هنوز TODO است).
 * به‌جای Placeholder خاکستری، یک ترکیب تصویرسازی اختصاصی (برش باقلوا، استکان
 * چای، پسته و قطره عسل داخل قاب طاق عثمانیِ هم‌شکل لوگو) قرار گرفته که هیچ
 * ادعای محصولی نمی‌کند و تا رسیدن عکاسی واقعی، صفحه را زنده نگه می‌دارد.
 *
 * انیمیشن‌ها (GSAP):
 *  - بعد از پایان لودینگ ورود، تیتر کلمه‌به‌کلمه از زیر ماسک بالا می‌آید
 *  - قاب طاق می‌چرخد و بزرگ می‌شود، برش باقلوا با جهش می‌افتد
 *  - لایه‌های تصویر با حرکت ماوس در عمق‌های مختلف جابه‌جا می‌شوند
 *  - با اسکرول، ترکیب تصویر آرام‌تر از صفحه حرکت می‌کند (Parallax)
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);

      // حالت اولیه پیش از Paint (زیر پرده لودینگ)
      gsap.set(q(".split-inner"), { yPercent: 115, rotate: 4 });
      gsap.set(q(".hero-fade"), { autoAlpha: 0, y: 30 });
      gsap.set(q(".hero-arch"), { scale: 0.5, rotate: -12, autoAlpha: 0 });
      gsap.set(q(".hero-pop"), { scale: 0, autoAlpha: 0 });
      gsap.set(q(".hero-slice"), { y: -260, autoAlpha: 0 });

      const play = () => {
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
        tl.to(q(".split-inner"), { yPercent: 0, rotate: 0, duration: 1, stagger: 0.07 })
          .to(q(".hero-fade"), { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.1 }, "-=0.7")
          .to(q(".hero-arch"), { scale: 1, rotate: 0, autoAlpha: 1, duration: 1.1, ease: "elastic.out(1, 0.7)" }, 0.1)
          .to(q(".hero-slice"), { y: 0, autoAlpha: 1, duration: 1, ease: "bounce.out" }, 0.45)
          .to(q(".hero-pop"), { scale: 1, autoAlpha: 1, duration: 0.6, stagger: 0.07, ease: "back.out(2.5)" }, 0.7);
      };
      const off = onIntroDone(play);

      // Parallax با اسکرول
      gsap.to(q(".hero-art"), {
        yPercent: 18,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.5 },
      });
      gsap.to(q(".hero-copy"), {
        yPercent: 10,
        autoAlpha: 0.2,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "center center", end: "bottom top", scrub: 0.5 },
      });

      // Parallax با حرکت ماوس — هر لایه با عمق data-depth
      const layers = q<HTMLElement>("[data-depth]").map((el) => ({
        depth: Number(el.dataset.depth),
        x: gsap.quickTo(el, "x", { duration: 0.8, ease: "power3.out" }),
        y: gsap.quickTo(el, "y", { duration: 0.8, ease: "power3.out" }),
      }));
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        layers.forEach((l) => {
          l.x(nx * l.depth * 60);
          l.y(ny * l.depth * 40);
        });
      };
      const section = root.current;
      section?.addEventListener("pointermove", onMove);
      return () => {
        off();
        section?.removeEventListener("pointermove", onMove);
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} className="matte relative overflow-hidden bg-cocoa bg-lattice-dark text-cream">
      {/* لکه‌های رنگی مات پس‌زمینه */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-10 h-[420px] w-[420px] rounded-full bg-cocoa-light" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 bottom-0 h-[360px] w-[360px] rounded-full bg-[#3a281e]" />

      <Container className="relative grid min-h-[calc(100svh-64px)] grid-cols-1 items-center gap-12 pb-20 pt-12 tablet:pb-24 desktop:min-h-[calc(100vh-116px)] desktop:grid-cols-[1.1fr_1fr] desktop:pt-16">
        <div className="hero-copy flex flex-col items-start gap-6 text-right">
          <span className="hero-fade inline-flex items-center gap-2 rounded-full border-2 border-brand-blackDeep bg-honey px-4 py-1.5 text-label font-bold text-brand-black shadow-[-3px_3px_0_0_#140E0A]">
            <span aria-hidden="true">◆</span>
            باقلوا کریم‌اوغلو · ۶ شعبه در تهران و همدان
          </span>

          <h1 className="font-fancy text-[40px] font-normal leading-[1.25] text-cream tablet:text-[58px] desktop:text-[66px]">
            <SplitWords text="طعمی اصیل، با استانداردی که همیشه می‌توانید به آن تکیه کنید" />
          </h1>

          <p className="hero-fade max-w-[46ch] text-body text-text-inverseMuted tablet:text-[17px]">
            از باقلوا و استانبولی سنتی تا شیرینی خشک و فست‌فود تازه — تهیه‌شده در ۶ شعبه فعال در
            تهران و همدان، با ارسال فوری و همان‌روز به سراسر ایران.
          </p>

          <div className="hero-fade flex w-full flex-col gap-4 pt-2 tablet:w-auto tablet:flex-row">
            <Magnetic className="w-full tablet:w-auto">
              <Link href="/shop" className="block">
                <Button variant="accent" size="lg" fullWidthOnMobile className="w-full tablet:w-auto">
                  مشاهده محصولات
                  <span aria-hidden="true">←</span>
                </Button>
              </Link>
            </Magnetic>
            <Magnetic className="w-full tablet:w-auto">
              <Link href="/branches" className="block">
                <Button variant="outlineInverse" size="lg" fullWidthOnMobile className="w-full tablet:w-auto">
                  پیدا کردن نزدیک‌ترین شعبه
                </Button>
              </Link>
            </Magnetic>
          </div>

          <dl className="hero-fade mt-2 grid grid-cols-3 gap-3 tablet:gap-6">
            {[
              ["۶", "شعبه فعال"],
              ["۲", "شهر"],
              ["۸ تا ۲۴", "ساعت کاری"],
            ].map(([value, label]) => (
              <div key={label} className="flex flex-col border-r-4 border-honey pr-3">
                <dt className="order-2 text-caption text-text-inverseMuted">{label}</dt>
                <dd className="order-1 font-fancy text-[28px] leading-tight text-honey">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ===== ترکیب تصویرسازی ===== */}
        <div className="hero-art relative mx-auto aspect-[4/5] w-full max-w-[460px]" aria-hidden="true">
          <div data-depth="0.3" className="absolute inset-0">
            <div className="hero-arch arch absolute inset-x-6 bottom-0 top-6 border-[3px] border-brand-blackDeep bg-honey bg-lattice-honey shadow-[-14px_14px_0_0_#F6EEDF]">
              <div className="arch absolute inset-5 border-[3px] border-dashed border-brand-blackDeep/70" />
            </div>
          </div>

          <div data-depth="0.15" className="absolute left-1/2 top-[22%] w-[62%] -translate-x-1/2">
            <div className="hero-pop">
              <Shamseh className="w-full animate-spin-slow text-honey-light" />
            </div>
          </div>

          <div data-depth="0.6" className="absolute bottom-[14%] right-[4%] w-[46%]">
            <div className="hero-slice">
              <div className="animate-float" style={{ ["--r" as string]: "6deg", animationDelay: "-2s" }}>
                <BaklavaSlice topping="walnut" className="w-full" />
              </div>
            </div>
          </div>

          <div data-depth="0.9" className="absolute bottom-[4%] left-[8%] w-[60%]">
            <div className="hero-slice">
              <div className="animate-float" style={{ ["--r" as string]: "-4deg" }}>
                <BaklavaSlice topping="pistachio" className="w-full" />
              </div>
            </div>
          </div>

          <div data-depth="0.5" className="absolute right-[-2%] top-[30%] w-[22%]">
            <div className="hero-pop">
              <TeaGlass className="w-full" />
            </div>
          </div>

          <div data-depth="1.2" className="absolute left-[-4%] top-[18%] w-[15%]">
            <div className="hero-pop">
              <div className="animate-float" style={{ ["--r" as string]: "-20deg", animationDelay: "-1s" }}>
                <Pistachio className="w-full" />
              </div>
            </div>
          </div>
          <div data-depth="1.4" className="absolute right-[18%] top-[2%] w-[11%]">
            <div className="hero-pop">
              <div className="animate-float" style={{ ["--r" as string]: "25deg", animationDelay: "-3s" }}>
                <Pistachio className="w-full" />
              </div>
            </div>
          </div>
          <div data-depth="1" className="absolute left-[12%] top-[4%] w-[9%]">
            <div className="hero-pop">
              <div className="animate-float" style={{ animationDelay: "-4s" }}>
                <HoneyDrop className="w-full" />
              </div>
            </div>
          </div>
          <div data-depth="1.6" className="absolute bottom-[38%] left-[-6%] w-[14%]">
            <div className="hero-pop">
              <div className="animate-float" style={{ ["--r" as string]: "12deg", animationDelay: "-2.5s" }}>
                <BaklavaDiamond className="w-full" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
