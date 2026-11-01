"use client";

import { useState } from "react";
import type { ProductDetail } from "@/lib/types";

interface Section {
  title: string;
  content: string | null;
  /** اگر true باشد، یعنی این بخش هنوز محتوای واقعی ندارد (TODO) */
  isPending?: boolean;
}

export function ProductDescription({ product }: { product: ProductDetail }) {
  const sections: Section[] = [
    { title: "معرفی", content: product.descriptionIntro },
    {
      title: "ویژگی‌ها",
      content: product.features.map((f) => `• ${f}`).join("\n"),
    },
    {
      title: "مواد اولیه",
      content: null,
      isPending: true,
    },
    {
      title: "روش نگهداری",
      content: null,
      isPending: true,
    },
    {
      title: "اطلاعات بسته‌بندی",
      content: `این محصول با گزینه‌های زیر قابل بسته‌بندی است: ${product.packagingOptions
        .map((p) => p.label)
        .join("، ")}.`,
    },
    {
      title: "اطلاعات ارسال",
      content:
        "آماده‌سازی سفارش حدود ۳۰ دقیقه زمان می‌برد؛ زمان تحویل بر اساس فاصله شما تا شعبه محاسبه می‌شود.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col divide-y divide-border rounded-lg bg-surface shadow-sm">
      {sections.map((section, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={section.title}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-right text-bodySm font-medium text-text-primary"
            >
              {section.title}
              <span aria-hidden="true" className="text-text-muted">
                {isOpen ? "−" : "+"}
              </span>
            </button>
            {isOpen && (
              <div className="px-5 pb-4">
                {section.isPending ? (
                  <p className="text-bodySm text-text-muted">
                    این بخش پس از دریافت اطلاعات از کارفرما تکمیل می‌شود.
                  </p>
                ) : (
                  <p className="whitespace-pre-line text-bodySm text-text-secondary">
                    {section.content}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
