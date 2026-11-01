import type { ReactNode } from "react";

/**
 * تیتر سکشن — با برچسب کوچک (eyebrow) عسلی و تیتر نمایشی لاله‌زار.
 * tone="inverse" برای سکشن‌های تیره/رنگی.
 */
export function SectionHeading({
  title,
  description,
  align = "right",
  action,
  as: Tag = "h2",
  eyebrow,
  tone = "default",
  id,
}: {
  title: string;
  description?: string;
  align?: "right" | "center";
  action?: ReactNode;
  as?: "h2" | "h3";
  eyebrow?: string;
  tone?: "default" | "inverse";
  id?: string;
}) {
  const alignClass = align === "center" ? "text-center items-center" : "text-right items-start";
  const titleSize =
    Tag === "h2" ? "font-fancy text-[34px] leading-[1.2] tablet:text-[46px] font-normal" : "text-h3";
  const titleColor = tone === "inverse" ? "text-cream" : "text-text-primary";
  const descColor = tone === "inverse" ? "text-text-inverseMuted" : "text-text-secondary";

  return (
    <div className={`flex flex-col gap-3 ${alignClass}`}>
      {eyebrow && (
        <span className="eyebrow">
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" aria-hidden="true">
            <path d="M6 0 12 6 6 12 0 6Z" fill="currentColor" />
          </svg>
          {eyebrow}
        </span>
      )}
      <div className={`flex w-full items-end gap-4 ${align === "center" ? "justify-center" : "justify-between"}`}>
        <Tag id={id} className={`${titleSize} ${titleColor}`}>
          {title}
        </Tag>
        {action && <div className="hidden shrink-0 tablet:block">{action}</div>}
      </div>
      {description && <p className={`max-w-[60ch] text-body ${descColor}`}>{description}</p>}
    </div>
  );
}
