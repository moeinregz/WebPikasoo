import type { ReactNode } from "react";
import Reveal from "./Reveal";

/** تیتر یکدست همه‌ی سکشن‌ها — چیپ کوچیک بالا، تیتر درشت و بولد و یه
 *  توضیح کوتاه. هر بخشی از تیتر که داخل <em> بیاد گرادیانی و متحرک می‌شه. */
export default function SectionHeading({
  eyebrow,
  title,
  desc,
  center = false,
  className = "",
}: {
  eyebrow: string;
  title: ReactNode;
  desc?: ReactNode;
  center?: boolean;
  className?: string;
}) {
  return (
    <Reveal className={`mb-14 ${center ? "text-center" : ""} ${className}`}>
      <span className="eyebrow">
        <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-accent3" />
        {eyebrow}
      </span>
      <h2
        className={`mt-5 font-display text-[34px] font-normal leading-[1.25] sm:text-[44px] lg:text-[54px] [&_em]:not-italic [&_em]:text-gradient ${
          center ? "mx-auto max-w-[22ch]" : "max-w-[24ch]"
        }`}
      >
        {title}
      </h2>
      {desc && (
        <p
          className={`mt-4 max-w-[60ch] text-[15.5px] leading-relaxed text-dim sm:text-[16.5px] ${
            center ? "mx-auto" : ""
          }`}
        >
          {desc}
        </p>
      )}
    </Reveal>
  );
}
