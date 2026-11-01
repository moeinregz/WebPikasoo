"use client";

import { useState } from "react";
import type { FaqItem } from "@/lib/faq";

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <div className="flex flex-col divide-y divide-border rounded-lg bg-surface shadow-sm">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-right text-bodySm font-medium text-text-primary"
            >
              {item.question}
              <span aria-hidden="true" className="text-text-muted">
                {isOpen ? "−" : "+"}
              </span>
            </button>
            {isOpen && (
              <p className="px-5 pb-4 text-bodySm text-text-secondary">{item.answer}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
