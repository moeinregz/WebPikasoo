"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { submitOfferOrder } from "@/app/actions";
import { offerCopyFor } from "@/lib/offerContent";

type TradeOpt = { id: string; label: string; color: string };

type Props = {
  trades: TradeOpt[];
  initialTrade: string;
  /** business name from the SMS link, if any */
  name?: string;
  code?: string;
};

const WA = "https://wa.me/989965745535";
const TEL = "tel:+989965745535";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

function Section({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.2 }}
      variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.09 } } }}
      className={`relative mx-auto w-full max-w-[1180px] px-4 sm:px-6 ${className}`}
    >
      {children}
    </motion.section>
  );
}

export default function OfferLanding({ trades, initialTrade, name, code }: Props) {
  const [tradeId, setTradeId] = useState(initialTrade);
  const trade = trades.find((t) => t.id === tradeId) ?? trades[0];
  const copy = useMemo(() => offerCopyFor(trade.id), [trade.id]);
  const brand = name || "برند شما";
  const [device, setDevice] = useState<"phone" | "laptop">("phone");
  const demoSrc = `/o/demo/${trade.id}?b=${encodeURIComponent(brand)}`;

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroFade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div
      className="relative min-h-screen overflow-x-clip bg-[#02070A] font-fa text-[#e9eefc] selection:bg-[#5CC4FF]/40"
      style={{ ["--tc" as string]: trade.color }}
    >
      <Backdrop />

      {/* header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#02070A]/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1180px] items-center gap-3 px-4 sm:px-6">
          <a href="/" className="flex items-center gap-2.5">
            <span className="relative h-9 w-9 overflow-hidden rounded-xl ring-1 ring-white/15">
              <Image src="/logo.webp" alt="وب پیکاسو" fill sizes="36px" className="object-cover" />
            </span>
            <span className="font-display text-[19px] tracking-tight">وب پیکاسو</span>
          </a>
          <a href={TEL} className="mr-auto hidden text-[13.5px] text-white/60 transition hover:text-white sm:block" dir="ltr">
            0996 574 5535
          </a>
          <button
            onClick={() => scrollTo("order")}
            className="mr-auto rounded-full bg-white px-4 py-2 text-[13px] font-black text-[#02070A] transition hover:scale-[1.04] sm:mr-0"
          >
            ثبت سفارش
          </button>
        </div>
      </header>

      {/* hero */}
      <div ref={heroRef} className="relative">
        <Section className="grid items-center gap-10 pb-16 pt-10 sm:pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:pb-24">
          <motion.div style={{ y: heroY, opacity: heroFade }}>
            <motion.div variants={fadeUp} className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[13px] text-white/80">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3ddc97] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3ddc97]" />
              </span>
              {name ? (
                <>
                  سلام <b className="text-white">{name}</b> 👋 این صفحه رو مخصوص تو ساختیم
                </>
              ) : (
                <>پیشنهاد ویژه برای {trade.label}</>
              )}
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.h1
                key={copy.pain}
                initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-[36px] leading-[1.35] sm:text-[50px] lg:text-[58px]"
              >
                <span className="bg-gradient-to-l from-white via-white to-[color-mix(in_srgb,var(--tc)_55%,#5CC4FF)] bg-clip-text text-transparent">
                  {copy.pain}
                </span>
              </motion.h1>
            </AnimatePresence>

            <motion.p variants={fadeUp} className="mt-5 max-w-[560px] text-[16.5px] leading-[2] text-white/70">
              {copy.sub}
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => scrollTo("order")}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-l from-[#0297DE] to-[#5CC4FF] px-7 py-4 text-[15.5px] font-black text-on-accent shadow-[0_18px_50px_-12px_rgba(92, 196, 255,0.65)] transition hover:-translate-y-0.5"
              >
                <span className="relative z-10">می‌خوام سایت خودم رو داشته باشم</span>
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-l from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </button>
              <button
                onClick={() => scrollTo("demo")}
                className="rounded-2xl border border-white/15 bg-white/[0.04] px-6 py-4 text-[15px] font-bold text-white transition hover:border-white/35 hover:bg-white/[0.08]"
              >
                {copy.demoLabel} ↓
              </button>
            </motion.div>

            <motion.ul variants={fadeUp} className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[13.5px] text-white/60">
              {["دموی رایگان با اسم کسب‌وکارت", "مشاوره‌ی رایگان", `طراحی مخصوص ${trade.label}`].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#3ddc97]" fill="none" stroke="currentColor" strokeWidth={3}>
                    <path d="M5 12l5 5L19 7" />
                  </svg>
                  {t}
                </li>
              ))}
            </motion.ul>
          </motion.div>

          {/* phone preview in the hero */}
          <motion.div variants={fadeUp} className="relative mx-auto hidden lg:block">
            <Phone src={demoSrc} />
            <FloatTag className="-right-36 top-16" icon="⚡" title="آماده در چند روز" />
            <FloatTag className="-left-32 top-1/2" icon="📈" title="دیده شدن در گوگل" delay={0.6} />
            <FloatTag className="-right-32 bottom-24" icon="🛒" title="سفارش آنلاین" delay={1.2} />
          </motion.div>
        </Section>
      </div>

      {/* trade switcher (visitors without a personal link) */}
      {!code && (
        <Section className="pb-6">
          <motion.div variants={fadeUp} className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur">
            <p className="mb-3 text-[13px] text-white/55">صنفت رو انتخاب کن تا دموی مخصوص خودت رو ببینی:</p>
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
              {trades.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTradeId(t.id)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-bold transition ${
                    t.id === trade.id ? "border-transparent bg-white text-[#02070A]" : "border-white/10 text-white/70 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </motion.div>
        </Section>
      )}

      {/* live demo */}
      <Section id="demo" className="scroll-mt-20 py-16">
        <motion.div variants={fadeUp} className="mb-8 text-center">
          <span className="text-[13px] font-bold tracking-wide text-[#5CC4FF]">دموی زنده</span>
          <h2 className="mt-2 font-display text-[30px] leading-[1.45] sm:text-[42px]">
            سایت <span className="text-[color-mix(in_srgb,var(--tc)_45%,#ffffff)]">«{brand}»</span> این شکلی می‌شه
          </h2>
          <p className="mx-auto mt-3 max-w-[560px] text-[15px] leading-8 text-white/60">
            همین الان با اسم تو ساخته شد. اسکرول کن، دکمه‌هاش رو بزن، منو و بخش‌هاش رو ببین. رنگ، عکس‌ها و متن‌ها هم دقیقاً مال خودت می‌شه.
          </p>
          <div className="mt-6 inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1">
            {(["phone", "laptop"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDevice(d)}
                className={`rounded-full px-5 py-2 text-[13px] font-bold transition ${device === d ? "bg-white text-[#02070A]" : "text-white/60 hover:text-white"}`}
              >
                {d === "phone" ? "📱 موبایل" : "💻 دسکتاپ"}
              </button>
            ))}
          </div>
        </motion.div>
        <motion.div variants={fadeUp} className="flex justify-center">
          {device === "phone" ? <Phone src={demoSrc} big /> : <Laptop src={demoSrc} />}
        </motion.div>
      </Section>

      {/* before / after */}
      <Section className="py-16">
        <motion.h2 variants={fadeUp} className="mb-10 text-center font-display text-[30px] sm:text-[40px]">
          الان کجایی؟ <span className="text-[#5CC4FF]">کجا می‌تونی باشی؟</span>
        </motion.h2>
        <div className="grid gap-5 md:grid-cols-2">
          <motion.div variants={fadeUp} className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-7">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-red-500/15 text-[20px]">😓</span>
              <h3 className="font-display text-[22px] text-white/80">بدون سایت</h3>
            </div>
            <ul className="space-y-3.5">
              {copy.before.map((b) => (
                <li key={b} className="flex gap-3 text-[15px] leading-7 text-white/55">
                  <span className="mt-1 text-red-400">✕</span>
                  {b}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            variants={fadeUp}
            className="relative overflow-hidden rounded-3xl border border-[#5CC4FF]/30 bg-gradient-to-br from-[#0297DE]/25 via-[#02070A] to-[color-mix(in_srgb,var(--tc)_30%,#02070A)] p-7 shadow-[0_30px_80px_-30px_rgba(92, 196, 255,0.5)]"
          >
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#3ddc97]/15 text-[20px]">🚀</span>
              <h3 className="font-display text-[22px]">با سایت وب پیکاسو</h3>
            </div>
            <ul className="space-y-3.5">
              {copy.after.map((b) => (
                <li key={b} className="flex gap-3 text-[15px] leading-7 text-white/90">
                  <span className="mt-1 text-[#3ddc97]">✓</span>
                  {b}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </Section>

      {/* features */}
      <Section className="py-16">
        <motion.div variants={fadeUp} className="mb-10 text-center">
          <span className="text-[13px] font-bold text-[#5CC4FF]">همه‌چی که لازم داری</span>
          <h2 className="mt-2 font-display text-[30px] sm:text-[40px]">سایتی که کار می‌کنه، نه فقط قشنگه</h2>
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {copy.features.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.03] p-6 transition-colors hover:border-white/20"
            >
              <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-[var(--tc)] opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30" />
              <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.06] text-[24px]">{f.icon}</span>
              <h3 className="mb-2 text-[17px] font-black">{f.title}</h3>
              <p className="text-[14px] leading-7 text-white/60">{f.desc}</p>
              <span className="absolute left-5 top-5 font-display text-[40px] leading-none text-white/[0.04]">{(i + 1).toLocaleString("fa-IR")}</span>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* steps */}
      <Section className="py-16">
        <motion.h2 variants={fadeUp} className="mb-12 text-center font-display text-[30px] sm:text-[40px]">
          از این صفحه تا سایت خودت، <span className="text-[#5CC4FF]">۴ قدم</span>
        </motion.h2>
        <div className="relative grid gap-6 md:grid-cols-4">
          <div className="absolute right-[12.5%] left-[12.5%] top-7 hidden h-px bg-gradient-to-l from-[#5CC4FF]/0 via-[#5CC4FF]/50 to-[#5CC4FF]/0 md:block" />
          {[
            ["📝", "ثبت درخواست", "فرم پایین رو پر کن؛ کمتر از یه دقیقه."],
            ["📞", "مشاوره‌ی رایگان", "باهات تماس می‌گیریم و نیازت رو دقیق می‌پرسیم."],
            ["🎨", "طراحی با اسم تو", "رنگ، لوگو، عکس‌ها و متن‌های کسب‌وکار خودت."],
            ["🚀", "تحویل و آموزش", "سایت آنلاین می‌شه و پنلش رو یادت می‌دیم."],
          ].map(([icon, t, d], i) => (
            <motion.div key={t} variants={fadeUp} className="relative text-center">
              <div className="relative mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-[#5CC4FF]/30 bg-[#07131B] text-[24px] shadow-[0_0_30px_-6px_rgba(92, 196, 255,0.6)]">
                {icon}
                <span className="absolute -top-2 -left-2 grid h-6 w-6 place-items-center rounded-full bg-[#5CC4FF] text-[12px] font-black text-[#02070A]">
                  {(i + 1).toLocaleString("fa-IR")}
                </span>
              </div>
              <h3 className="mb-1.5 text-[16.5px] font-black">{t}</h3>
              <p className="text-[14px] leading-7 text-white/55">{d}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* order form */}
      <Section id="order" className="scroll-mt-20 py-16">
        <OrderForm brand={name ?? ""} tradeLabel={trade.label} code={code} />
      </Section>

      {/* FAQ */}
      <Section className="pb-28 pt-10 sm:pb-20">
        <motion.h2 variants={fadeUp} className="mb-8 text-center font-display text-[28px] sm:text-[36px]">
          سوال‌هایی که معمولاً می‌پرسن
        </motion.h2>
        <div className="mx-auto max-w-[760px] space-y-3">
          {[
            ["هزینه‌ی سایت چقدره؟", "به امکاناتی که لازم داری بستگی داره. قبل از شروع، قیمت دقیق و شفاف رو بهت می‌گیم و بدون تأیید تو کاری شروع نمی‌شه. جدول قیمت‌ها هم توی صفحه‌ی قیمت طراحی سایت هست."],
            ["چقدر طول می‌کشه؟", "بسته به امکانات و آماده بودن عکس‌ها و متن‌ها؛ زمان دقیق رو توی مشاوره‌ی رایگان بهت می‌گیم."],
            ["بعداً خودم می‌تونم تغییرش بدم؟", "بله. پنل مدیریت داری و قیمت‌ها، عکس‌ها و متن‌ها رو خودت عوض می‌کنی. کار با پنل رو هم یادت می‌دیم."],
            ["دامنه و هاست چی؟", "توی مشاوره راهنمایی‌ت می‌کنیم و اگه بخوای، همه‌چی رو برات راه می‌اندازیم."],
          ].map(([q, a]) => (
            <Faq key={q} q={q} a={a} />
          ))}
        </div>
      </Section>

      <footer className="border-t border-white/[0.06] py-8 text-center text-[13px] text-white/40">
        وب پیکاسو · طراحی سایت اختصاصی ·{" "}
        <a href="/website-price" className="underline decoration-white/20 hover:text-white/70">
          قیمت طراحی سایت
        </a>{" "}
        ·{" "}
        <a href="/portfolio" className="underline decoration-white/20 hover:text-white/70">
          نمونه‌کارها
        </a>
      </footer>

      {/* mobile sticky bar (covers the site-wide one, which points to the home page) */}
      <div className="fixed inset-x-0 bottom-0 z-[100] flex gap-2 border-t border-white/10 bg-[#02070A]/95 px-4 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2.5 backdrop-blur sm:hidden">
        <button onClick={() => scrollTo("order")} className="flex-1 rounded-xl bg-gradient-to-l from-[#0297DE] to-[#5CC4FF] py-3 text-[14.5px] font-black text-on-accent">
          ثبت سفارش سایت
        </button>
        <a href={WA} target="_blank" rel="noreferrer" aria-label="واتساپ" className="grid w-12 place-items-center rounded-xl bg-[#25D366] text-white">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
            <path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.2-.4.2-.4.7-1.2.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.7 11.8 11.8 0 004.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 001.8-1.2 2.2 2.2 0 00.1-1.2c0-.1-.2-.2-.5-.3z" />
          </svg>
        </a>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -right-40 -top-40 h-[560px] w-[560px] animate-[orb_18s_ease-in-out_infinite] rounded-full bg-[#0297DE] opacity-[0.28] blur-[120px]" />
      <div className="absolute -left-40 top-1/3 h-[520px] w-[520px] animate-[orb_22s_ease-in-out_infinite_reverse] rounded-full bg-[var(--tc)] opacity-[0.22] blur-[130px] transition-colors duration-700" />
      <div className="absolute bottom-[-200px] right-1/4 h-[480px] w-[480px] animate-[orb_26s_ease-in-out_infinite] rounded-full bg-[#5CC4FF] opacity-[0.15] blur-[120px]" />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at 50% 20%,#000 20%,transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 20%,#000 20%,transparent 70%)",
        }}
      />
      <style>{`@keyframes orb{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(60px,40px) scale(1.08)}66%{transform:translate(-40px,70px) scale(.95)}}`}</style>
    </div>
  );
}

function FloatTag({ className, icon, title, delay = 0 }: { className: string; icon: string; title: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
      transition={{ opacity: { delay: 0.8 + delay, duration: 0.5 }, scale: { delay: 0.8 + delay, duration: 0.5 }, y: { delay, duration: 4, repeat: Infinity, ease: "easeInOut" } }}
      className={`absolute z-10 flex items-center gap-2 whitespace-nowrap rounded-2xl border border-white/10 bg-[#07131B]/80 px-3.5 py-2.5 text-[13px] font-bold shadow-2xl backdrop-blur-xl ${className}`}
    >
      <span className="text-[18px]">{icon}</span>
      {title}
    </motion.div>
  );
}

function Frame({ src, title }: { src: string; title: string }) {
  // Mounted on the client only: a server-rendered iframe can finish loading
  // before hydration attaches onLoad, which would leave the spinner up forever.
  const [mounted, setMounted] = useState(false);
  const [loadedSrc, setLoadedSrc] = useState("");
  useEffect(() => setMounted(true), []);
  return (
    <>
      {loadedSrc !== src && (
        <div className="absolute inset-0 grid place-items-center bg-[#07131B]">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-[#5CC4FF]" />
        </div>
      )}
      {mounted && (
        <iframe key={src} src={src} title={title} onLoad={() => setLoadedSrc(src)} className="h-full w-full border-0 bg-white" />
      )}
    </>
  );
}

function Phone({ src, big = false }: { src: string; big?: boolean }) {
  return (
    <div
      className={`relative rounded-[46px] border border-white/15 bg-gradient-to-b from-[#1b2236] to-[#0b0f1c] p-3 shadow-[0_50px_120px_-30px_rgba(2, 151, 222,0.55)] ${
        big ? "h-[680px] w-[340px]" : "h-[600px] w-[300px]"
      }`}
    >
      <div className="absolute left-1/2 top-4 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
      <div className="relative h-full w-full overflow-hidden rounded-[36px]">
        <Frame src={src} title="دموی سایت روی موبایل" />
      </div>
    </div>
  );
}

function Laptop({ src }: { src: string }) {
  return (
    <div className="w-full max-w-[1000px]">
      <div className="rounded-t-[22px] border border-b-0 border-white/15 bg-[#121828] p-2.5 pb-0 shadow-[0_50px_120px_-30px_rgba(2, 151, 222,0.55)]">
        <div className="mb-2 flex items-center gap-1.5 px-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-[10px]">
          <Frame src={src} title="دموی سایت روی دسکتاپ" />
        </div>
      </div>
      <div className="mx-[-3%] h-4 rounded-b-[18px] bg-gradient-to-b from-[#2a3247] to-[#151b2b]" />
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-4 p-5 text-right text-[15.5px] font-bold">
        {q}
        <motion.span animate={{ rotate: open ? 45 : 0 }} className="text-[22px] text-[#5CC4FF]">
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <p className="px-5 pb-5 text-[14.5px] leading-8 text-white/60">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function OrderForm({ brand, tradeLabel, code }: { brand: string; tradeLabel: string; code?: string }) {
  const [state, setState] = useState<{ ok: boolean; message: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const field =
    "w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3.5 text-[15px] text-white outline-none transition placeholder:text-white/35 focus:border-[#5CC4FF] focus:bg-white/[0.08]";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    const res = await submitOfferOrder({
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      business: String(fd.get("business") ?? ""),
      tradeLabel,
      note: String(fd.get("note") ?? ""),
      code,
      website: String(fd.get("website") ?? ""),
    });
    setBusy(false);
    setState(res);
  }

  return (
    <motion.div
      variants={fadeUp}
      className="relative mx-auto max-w-[880px] overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#0A1C28] via-[#06111A] to-[#050E15] p-6 shadow-[0_40px_120px_-40px_rgba(92, 196, 255,0.55)] sm:p-10"
    >
      <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[70%] -translate-x-1/2 rounded-full bg-[#5CC4FF] opacity-20 blur-[90px]" />
      <AnimatePresence mode="wait">
        {state?.ok ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative py-10 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 14 }}
              className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-[#3ddc97] to-[#5CC4FF] shadow-[0_0_60px_-10px_rgba(61,220,151,0.8)]"
            >
              <svg viewBox="0 0 24 24" className="h-12 w-12 text-[#02070A]" fill="none" stroke="currentColor" strokeWidth={3}>
                <motion.path d="M5 12l5 5L19 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.5 }} />
              </svg>
            </motion.div>
            <h3 className="font-display text-[30px]">عالیه! 🎉</h3>
            <p className="mt-3 text-[16px] leading-8 text-white/70">{state.message}</p>
            <a href={WA} target="_blank" rel="noreferrer" className="mt-6 inline-block rounded-2xl border border-white/15 px-6 py-3 text-[14px] font-bold hover:bg-white/[0.06]">
              عجله داری؟ واتساپ بده
            </a>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={onSubmit} className="relative">
            <div className="mb-8 text-center">
              <h2 className="font-display text-[30px] leading-[1.45] sm:text-[40px]">سایت {brand ? `«${brand}»` : "خودت"} رو سفارش بده</h2>
              <p className="mt-2 text-[15px] text-white/60">مشاوره رایگانه و تا قیمت رو تأیید نکنی، کاری شروع نمی‌شه.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input name="name" required placeholder="اسم و فامیل" className={field} autoComplete="name" />
              <input name="phone" required placeholder="شماره موبایل (۰۹...)" className={field} inputMode="tel" autoComplete="tel" dir="ltr" style={{ textAlign: "right" }} />
              <input name="business" defaultValue={brand} placeholder="اسم کسب‌وکار" className={field} />
              <input value={tradeLabel} readOnly className={`${field} text-white/60`} aria-label="صنف" />
              <textarea name="note" rows={3} placeholder="چه امکاناتی می‌خوای؟ (اختیاری) — مثلاً نوبت‌دهی آنلاین، منوی QR، فروشگاه…" className={`${field} sm:col-span-2`} />
              <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
            </div>
            {state && !state.ok && <p className="mt-4 rounded-xl bg-red-500/10 p-3 text-center text-[14px] text-red-300">{state.message}</p>}
            <button
              disabled={busy}
              className="group relative mt-6 w-full overflow-hidden rounded-2xl bg-gradient-to-l from-[#0297DE] to-[#5CC4FF] py-[18px] text-[17px] font-black text-on-accent shadow-[0_20px_60px_-15px_rgba(92, 196, 255,0.8)] transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              <span className="relative z-10">{busy ? "در حال ثبت…" : "ثبت درخواست و مشاوره‌ی رایگان"}</span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-l from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </button>
            <p className="mt-4 text-center text-[12.5px] text-white/40">اطلاعاتت فقط برای تماس با خودت استفاده می‌شه.</p>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
