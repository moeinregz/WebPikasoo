"use client";

import { useRef } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Stagger, StaggerItem } from "@/components/fx/Reveal";
import { BoltIcon, CalendarIcon, MapIcon, ScooterIcon } from "@/components/decor/FeatureIcons";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/fx/gsap";

const features = [
  { Icon: BoltIcon, title: "ارسال فوری", description: "برای زمانی که نمی‌توانید صبر کنید." },
  { Icon: CalendarIcon, title: "ارسال همان‌روز", description: "سفارش امروز، دریافت همان روز." },
  { Icon: ScooterIcon, title: "پیک اختصاصی", description: "همراه با امکان استفاده از سرویس‌های واسطه." },
  { Icon: MapIcon, title: "ارسال به سراسر ایران", description: "فارغ از شهر شما، برایتان ارسال می‌کنیم." },
];

/**
 * سکشن ارسال — یک «جاده» با خط‌چین که هنگام اسکرول، جعبه باقلوا روی پیک
 * از شعبه (راست) تا خانه مشتری (چپ) حرکت می‌کند (GSAP ScrollTrigger scrub).
 */
export function DeliveryExperience() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        ".dl-rider",
        { left: "100%", xPercent: 0 },
        {
          left: "0%",
          xPercent: 0,
          ease: "none",
          scrollTrigger: { trigger: ".dl-road", start: "top 85%", end: "top 25%", scrub: 0.6 },
        },
      );
      gsap.fromTo(
        ".dl-road-fill",
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: ".dl-road", start: "top 85%", end: "top 25%", scrub: 0.6 },
        },
      );
      gsap.to(".dl-wheel", { rotate: -360, repeat: -1, duration: 0.8, ease: "none", transformOrigin: "50% 50%" });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-labelledby="delivery-heading"
      className="matte relative overflow-hidden bg-cocoa bg-lattice-dark py-20 text-text-inverse tablet:py-28"
    >
      <Container className="flex flex-col gap-12">
        <SectionHeading
          id="delivery-heading"
          eyebrow="ارسال"
          title="هر جای ایران باشید، به شما می‌رسانیم"
          description="آماده‌سازی سفارش حدود ۳۰ دقیقه زمان می‌برد؛ زمان رسیدن بسته به فاصله شما تا نزدیک‌ترین شعبه محاسبه و پیش از پرداخت به‌طور شفاف نمایش داده می‌شود."
          align="center"
          tone="inverse"
        />

        {/* جاده متحرک */}
        <div aria-hidden="true" className="dl-road relative mx-auto mt-4 h-24 w-full max-w-4xl">
          <div className="absolute inset-x-0 bottom-4 h-3 rounded-full border-2 border-brand-blackDeep bg-cocoa-light" />
          <div className="dl-road-fill absolute inset-x-0 bottom-4 h-3 origin-right rounded-full border-2 border-brand-blackDeep bg-honey" />
          <div className="absolute inset-x-4 bottom-[21px] border-t-2 border-dashed border-cream/60" />
          {/* شعبه */}
          <div className="absolute -right-2 bottom-6 flex flex-col items-center">
            <span className="rounded-md border-2 border-brand-blackDeep bg-brand-red px-2 py-1 text-caption font-bold text-cream shadow-[-3px_3px_0_0_#140E0A]">شعبه</span>
          </div>
          {/* خانه */}
          <div className="absolute -left-2 bottom-6 flex flex-col items-center">
            <span className="rounded-md border-2 border-brand-blackDeep bg-pistachio px-2 py-1 text-caption font-bold text-brand-black shadow-[-3px_3px_0_0_#140E0A]">خانه شما</span>
          </div>
          {/* پیک */}
          <div className="dl-rider absolute bottom-5" style={{ left: "100%" }}>
            <svg viewBox="0 0 90 60" className="h-16 w-24 -translate-x-1/2" fill="none">
              <rect x="34" y="6" width="26" height="22" rx="3" fill="#DFA03F" stroke="#140E0A" strokeWidth="3" />
              <path d="M40 17h14M47 10v14" stroke="#140E0A" strokeWidth="2.5" />
              <path d="M12 44h40l8-16h10l4 16" stroke="#140E0A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M26 30h26v14H22Z" fill="#B8273A" stroke="#140E0A" strokeWidth="3" strokeLinejoin="round" />
              <g className="dl-wheel">
                <circle cx="16" cy="48" r="9" fill="#F6EEDF" stroke="#140E0A" strokeWidth="3" />
                <path d="M16 41v14M9 48h14" stroke="#140E0A" strokeWidth="2" />
              </g>
              <g className="dl-wheel">
                <circle cx="74" cy="48" r="9" fill="#F6EEDF" stroke="#140E0A" strokeWidth="3" />
                <path d="M74 41v14M67 48h14" stroke="#140E0A" strokeWidth="2" />
              </g>
            </svg>
          </div>
        </div>

        <Stagger className="grid grid-cols-2 gap-4 tablet:gap-6 desktop:grid-cols-4">
          {features.map(({ Icon, title, description }) => (
            <StaggerItem key={title} className="h-full">
              <div className="group flex h-full flex-col items-center gap-3 rounded-xl border-2 border-brand-blackDeep bg-cream p-5 text-center text-brand-black shadow-hard-honey transition-[transform,box-shadow] duration-300 hover:-translate-y-2 hover:translate-x-1 hover:shadow-hard-honey-lg tablet:p-6">
                <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-brand-black bg-surface transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                  <Icon className="h-10 w-10" />
                </span>
                <h3 className="text-h4 font-bold">{title}</h3>
                <p className="text-caption text-text-secondary tablet:text-bodySm">{description}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
