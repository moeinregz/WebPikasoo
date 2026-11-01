"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@/components/ui/icons";

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Accordion واقعی — هر آیتم یک <button> واقعی (نه div با onClick) داخل
 * یک <h3> (Semantic HTML طبق بخش ۷/۱۷ Prompt)، با aria-expanded و
 * aria-controls صحیح؛ باز/بسته شدن با کیبورد (Enter/Space) به‌صورت پیش‌فرض
 * روی <button> کار می‌کند، نیازی به مدیریت دستی کلید نیست.
 */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `faq-panel-${index}`;
        const buttonId = `faq-button-${index}`;
        return (
          <div key={item.question}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-right text-body text-text-primary hover:bg-bg-secondary"
              >
                <span>{item.question}</span>
                <ChevronDownIcon
                  className={`h-5 w-5 shrink-0 text-text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
            </h3>
            {isOpen && (
              <div id={panelId} role="region" aria-labelledby={buttonId} className="px-5 pb-4 text-bodySm text-text-secondary">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
