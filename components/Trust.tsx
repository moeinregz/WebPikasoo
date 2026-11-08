import Reveal from "./Reveal";
import EchoHeading from "@/components/EchoHeading";
import { FeaturesGrid } from "@/components/ui/features-8";

/** «چرا وب پیکاسو» — heading, a short intro and the
 *  bento feature grid (components/ui/features-8.tsx). */
export default function Trust() {
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
        </Reveal>

        <Reveal>
          <FeaturesGrid />
        </Reveal>
      </div>
    </section>
  );
}
