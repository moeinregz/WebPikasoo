import Reveal from "./Reveal";
import { businessSites, categories } from "@/lib/businessSites";
import EchoHeading from "@/components/EchoHeading";
import { FeaturesGrid } from "@/components/ui/features-8";

/** «چرا وب پیکاسو» — heading, a one-line summary of the numbers, and the
 *  bento feature grid (components/ui/features-8.tsx). */
export default function Trust() {
  const stats = [
    { n: "۱۰ نفر", t: "تیم متخصص" },
    { n: `${categories.length.toLocaleString("fa-IR")} صنف`, t: "حوزه‌ی کاری" },
    { n: `+${businessSites.length.toLocaleString("fa-IR")}`, t: "نمونه‌سایت" },
  ];
  return (
    <section id="trust" className="section-light relative scroll-mt-[90px] overflow-hidden border-t border-ink/10 py-[110px]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[480px] bg-dot-grid" />

      <div className="relative z-[1] mx-auto max-w-container px-6">
        <Reveal className="mb-12">
          <EchoHeading en="Why WebPikaso?" className="font-display text-[32px] font-normal leading-[1.3] sm:text-[40px] lg:text-[50px]">
            چرا کسب‌وکارت رو به وب پیکاسو بسپاری؟
          </EchoHeading>
          <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
            یه تیم کوچیک و متخصصیم، نه یه آژانس بزرگ با هزار واسطه — یعنی هم سریع‌تر جواب می‌گیری، هم دقیقاً می‌دونی پروژه‌ت دست کیه.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {stats.map((s) => (
              <li key={s.t} className="rounded-full border border-ink/15 px-3.5 py-1.5 text-[13px] text-dim">
                <b className="font-bold text-ink">{s.n}</b> {s.t}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal>
          <FeaturesGrid />
        </Reveal>
      </div>
    </section>
  );
}
