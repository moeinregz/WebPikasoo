import { Fragment, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

// A deliberately tiny, purpose-built markdown-lite — not a general markdown
// parser. It only understands the handful of things the BlogPanel editor's
// toolbar (H2..H6 / list / link / image / custom text size) actually
// inserts, which keeps this dependency-free and predictable. Plain
// paragraphs (no special syntax) render exactly like before — this only
// adds new block/inline types on top.

type Block =
  | { type: "heading"; level: 2 | 3 | 4 | 5 | 6; text: string }
  | { type: "list"; items: string[] }
  | { type: "image"; url: string; alt: string }
  | { type: "cta"; text: string; button?: { label: string; href: string } }
  | { type: "paragraph"; lines: string[] };

// "##" through "######" — H1 is reserved for the page/post title itself, so
// the editor toolbar only ever offers H2..H6 (see BlogPanel.tsx).
const HEADING_RE = /^(#{2,6})\s+/;
const LIST_ITEM_RE = /^[-*]\s+/;
const STANDALONE_IMAGE_RE = /^!\[([^\]]*)\]\(([^)\s]+)\)$/;
// ">> متن [برچسب دکمه](/order)" — a call-to-action box. A link at the very
// end of the line becomes the box's button; any other links stay inline.
const CTA_RE = /^>>\s+/;
const CTA_BUTTON_RE = /\s*\[([^\]]+)\]\(([^)\s]+)\)\s*$/;

function toBlocks(content: string): Block[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    const headingMatch = line.match(HEADING_RE);
    if (headingMatch) {
      const level = headingMatch[1].length as 2 | 3 | 4 | 5 | 6;
      blocks.push({ type: "heading", level, text: line.replace(HEADING_RE, "").trim() });
      i++;
      continue;
    }

    if (CTA_RE.test(line)) {
      let text = line.replace(CTA_RE, "").trim();
      const btn = text.match(CTA_BUTTON_RE);
      let button: { label: string; href: string } | undefined;
      if (btn) {
        button = { label: btn[1], href: btn[2] };
        text = text.slice(0, btn.index).trim();
      }
      blocks.push({ type: "cta", text, button });
      i++;
      continue;
    }

    const imageMatch = line.trim().match(STANDALONE_IMAGE_RE);
    if (imageMatch) {
      blocks.push({ type: "image", alt: imageMatch[1], url: imageMatch[2] });
      i++;
      continue;
    }

    if (LIST_ITEM_RE.test(line)) {
      const items: string[] = [];
      while (i < lines.length && LIST_ITEM_RE.test(lines[i])) {
        items.push(lines[i].replace(LIST_ITEM_RE, "").trim());
        i++;
      }
      blocks.push({ type: "list", items });
      continue;
    }

    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !HEADING_RE.test(lines[i]) &&
      !LIST_ITEM_RE.test(lines[i]) &&
      !CTA_RE.test(lines[i]) &&
      !STANDALONE_IMAGE_RE.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) blocks.push({ type: "paragraph", lines: paraLines });
  }

  return blocks;
}

// Font sizes step down clearly as the heading level goes deeper — each level
// needs a visible gap from its neighbors (a real, unmistakable jump, not
// 1-2px) so every level reads as its own heading: smaller than the h1 title
// (28px/34px) but still bigger than the body text (16px/leading-[1.9]) down
// through h5. h6 is deliberately styled as a small uppercase label rather
// than shrinking below body text, which would be unreadable.
// Exported so BlogPanel's live WYSIWYG editor can use the exact same
// classes when it creates real <h2>..<h6> DOM nodes — the editor and the
// published page must always render headings identically, from one source.
export const HEADING_CLASS: Record<2 | 3 | 4 | 5 | 6, string> = {
  // h2: the big section title — accent bar on the start (right, RTL) side,
  // Lalezar display face (single weight, so no synthetic bold).
  2: "mb-5 mt-12 border-r-[5px] border-accent pr-4 font-display text-[27px] font-normal leading-[1.5] text-ink sm:text-[33px]",
  // h3: accent-colored, a small square marker before it.
  3: "relative mb-3.5 mt-9 pr-5 font-display text-[22px] font-normal leading-[1.5] text-accent2 dark:text-accent3 before:absolute before:right-0 before:top-[0.62em] before:h-2.5 before:w-2.5 before:rounded-[3px] before:bg-accent sm:text-[25px]",
  4: "mb-3 mt-7 font-display text-[19px] font-normal leading-snug text-ink sm:text-[21px]",
  5: "mb-2.5 mt-6 text-[17px] font-bold leading-snug text-ink sm:text-[18px]",
  6: "mb-2 mt-5 text-[14px] font-bold uppercase tracking-wide leading-snug text-ink/65 sm:text-[14.5px]",
};

// Same idea for the other block/inline types — one shared set of classes
// used by both the public article renderer below and the admin editor.
export const BLOG_CLASSES = {
  list: "my-5 list-disc space-y-2 pr-6 marker:text-accent",
  link: "text-accent underline decoration-accent/40 underline-offset-2 transition hover:decoration-accent",
  image: "my-6 w-full h-auto rounded-card border border-ink/[0.14]",
  paragraph: "my-5 text-[16px] leading-[1.9] text-ink/90",
  cta: "my-8 rounded-card border border-accent/40 bg-accent/[0.07] p-5 sm:p-6",
  ctaText: "text-[16px] font-semibold leading-[1.9] text-ink",
  ctaButton:
    "mt-4 inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-[15px] font-bold text-white no-underline shadow-sm transition hover:opacity-90",
};

// Custom inline text-size wrapper the editor's "بزرگ‌نمایی متن" tool inserts
// around a selected word/phrase: {{size:32}}متن{{/size}}. Kept as its own
// tiny syntax (not real HTML) so untrusted content still never gets
// interpreted as markup — this only ever produces a <span style="font-size">.
const SIZE_RE = /\{\{size:(\d{1,3})\}\}([\s\S]*?)\{\{\/size\}\}/g;
const MIN_SIZE = 10;
const MAX_SIZE = 96;

/** Renders `[text](url)` links inside otherwise-plain text; everything else
 *  passes through untouched (and untrusted HTML is never interpreted —
 *  this only ever produces text nodes and <Link> elements). */
function renderLinks(text: string, keyPrefix: string): ReactNode[] {
  const linkRe = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = linkRe.exec(text))) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    // Internal links (/blog/..., /website-design...) open in the same tab so
    // link equity and the reader both stay on the site; external ones open
    // a new tab as before.
    const internal = match[2].startsWith("/");
    parts.push(
      <Link
        key={`${keyPrefix}-a-${i++}`}
        href={match[2]}
        target={internal ? undefined : "_blank"}
        rel={internal ? undefined : "noopener noreferrer"}
        className="text-accent underline decoration-accent/40 underline-offset-2 transition hover:decoration-accent"
      >
        {match[1]}
      </Link>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

/** Renders `{{size:N}}text{{/size}}` custom-size spans (from the editor's
 *  "بزرگ‌نمایی متن" tool) on top of link parsing — a plain word or phrase
 *  wrapped so it renders visibly bigger, both in the editor's live preview
 *  and on the published article page. Size is clamped to a sane range so a
 *  stray/garbled value can never blow up the layout. */
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  SIZE_RE.lastIndex = 0;
  while ((match = SIZE_RE.exec(text))) {
    if (match.index > lastIndex) {
      parts.push(...renderLinks(text.slice(lastIndex, match.index), `${keyPrefix}-t${i}`));
    }
    const size = Math.min(MAX_SIZE, Math.max(MIN_SIZE, parseInt(match[1], 10) || MIN_SIZE));
    parts.push(
      <span key={`${keyPrefix}-sz-${i}`} style={{ fontSize: `${size}px`, lineHeight: 1.4 }} className="font-semibold">
        {renderLinks(match[2], `${keyPrefix}-sz-${i}-in`)}
      </span>
    );
    i++;
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(...renderLinks(text.slice(lastIndex), `${keyPrefix}-t${i}`));
  return parts;
}

/** Turns an article's stored content into styled JSX — headings, lists,
 *  links, custom-size text spans, and inline images, on top of plain
 *  paragraphs. Server-safe (no client-only APIs), so it can be called
 *  straight from /blog/[slug] — and also from the BlogPanel editor's live
 *  preview, since it's a plain function with no server-only imports. */
export function renderBlogContent(content: string, fallbackAlt?: string): ReactNode {
  // Older posts can carry English (or empty) alts; with a fallback (the post
  // title, which starts with the main keyword) those render in Persian.
  const altOf = (alt: string) => (fallbackAlt && !/[\u0600-\u06FF]/.test(alt) ? fallbackAlt : alt);
  const blocks = toBlocks(content).map((b) => (b.type === "image" ? { ...b, alt: altOf(b.alt) } : b));

  return (
    <>
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          const Tag = `h${block.level}` as "h2" | "h3" | "h4" | "h5" | "h6";
          return (
            <Tag key={i} className={HEADING_CLASS[block.level]}>
              {renderInline(block.text, `h-${i}`)}
            </Tag>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={i} className="my-5 list-disc space-y-2 pr-6 marker:text-accent">
              {block.items.map((item, j) => (
                <li key={j}>{renderInline(item, `li-${i}-${j}`)}</li>
              ))}
            </ul>
          );
        }
        if (block.type === "cta") {
          // data-cta lets the dashboard editor turn this box back into
          // ">> ..." when it re-serializes the DOM (see BlogPanel.tsx).
          return (
            <aside key={i} data-cta="1" className={BLOG_CLASSES.cta}>
              <p className={BLOG_CLASSES.ctaText}>{renderInline(block.text, `cta-${i}`)}</p>
              {block.button && (
                <Link href={block.button.href} data-cta-button="1" className={BLOG_CLASSES.ctaButton}>
                  {block.button.label}
                </Link>
              )}
            </aside>
          );
        }
        if (block.type === "image" && block.url === "/blog-placeholder.svg") {
          // Spot reserved for a photo (the SEO automation adds 3–4 per article
          // when it has no stock photo). Replace it from the blog editor.
          return (
            <figure key={i} className="my-8">
              <img src={block.url} alt={block.alt} width={1200} height={675} loading="lazy" className="w-full rounded-card border border-accent/30" />
              {block.alt && <figcaption className="mt-2 text-center text-[13px] text-dim">{block.alt}</figcaption>}
            </figure>
          );
        }
        if (block.type === "image") {
          return (
            <Image
              key={i}
              src={block.url}
              alt={block.alt}
              width={1200}
              height={675}
              unoptimized
              style={{ width: "100%", height: "auto" }}
              className="my-6 rounded-card border border-ink/[0.14]"
            />
          );
        }
        return (
          <p key={i} className="my-5 text-[16px] leading-[1.9] text-ink/90">
            {block.lines.map((line, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {renderInline(line, `p-${i}-${j}`)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
}
