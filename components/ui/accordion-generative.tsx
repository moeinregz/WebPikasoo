import { Sparkles } from "lucide-react";

import {
  Accordion,
  AccordionItem,
  AccordionStreamingContent,
  AccordionTrigger,
} from "@/components/ui/accordion-generative-utils/accordion";

// "accordion-generative" block: card-style accordion whose answers stream in
// like a model writing them. Takes the questions as data; the sparkle icon
// uses the site's ink color instead of the block's violet.

export type GenerativeQA = { value: string; question: string; answer: string };

export default function AccordionGenerative({
  items,
  defaultValue,
  className = "w-full max-w-lg",
}: {
  items: GenerativeQA[];
  defaultValue?: string;
  className?: string;
}) {
  return (
    <Accordion type="single" collapsible variant="card" defaultValue={defaultValue} className={className}>
      {items.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger>
            <span className="flex items-center gap-2.5">
              <Sparkles aria-hidden="true" className="size-4 shrink-0 text-blood-hi drop-shadow-[0_0_6px_rgb(var(--color-blood-hi)/0.6)]" strokeWidth={2} />
              {item.question}
            </span>
          </AccordionTrigger>
          <AccordionStreamingContent text={item.answer} speed={12} />
        </AccordionItem>
      ))}
    </Accordion>
  );
}
