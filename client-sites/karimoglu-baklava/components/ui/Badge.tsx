import type { ReactNode } from "react";

type Tone = "accent" | "neutral" | "success" | "warning";

const toneClasses: Record<Tone, string> = {
  accent: "bg-brand-red text-white border-brand-black",
  neutral: "bg-cream text-text-secondary border-brand-black",
  success: "bg-pistachio-light text-pistachio-deep border-pistachio-deep",
  warning: "bg-honey-light text-honey-deep border-honey-deep",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border-[1.5px] px-2.5 py-0.5 text-caption font-bold ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
