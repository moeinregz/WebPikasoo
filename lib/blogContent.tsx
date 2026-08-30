import { Fragment, type ReactNode } from "react";

// A deliberately tiny, purpose-built markdown-lite — not a general markdown
// parser. It only understands the handful of things the BlogPanel editor's
// toolbar (H2 / list / link / image) actually inserts, which keeps this
// dependency-free and predictable. Plain paragraphs (no special syntax)
// render exactly like before — this only adds new block types on top.

type Block =
  | { type: "heading"; level: 2 | 3 | 4 | 5 | 6; text: string }
  | { type: "list"; items: string[] }
  | { type: "image"; url: string; alt: string }
  | { type: "paragraph"; lines: string[] };

// "##" through "######" — H1 is reserved for the page/post title itself, so
// the editor toolbar only ever offers H2..H6 (see BlogPanel.tsx).
const HEADING_RE = /^(#{2,6})\s+/;
const LIST_ITEM_RE = /^[-*]\s+/;
const STANDALONE_IMAGE_RE = /^!\[([^\]]*)\]\(([^)\s]+)\)$/;

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
// needs a visible gap from its neighbors (not just 1-2px) so every level
// reads unmistakably as its own heading, smaller than h1 (28px/34px) but
// still bigger than the body text (16px/leading-[1.9]) down through h5.
const HEADING_CLASS: Record<2 | 3 | 4 | 5 | 6, string> = {
  2: "mb-4 mt-10 font-display text-[24px] font-semibold leading-snug text-ink sm:text-[28px]",
  3: "mb-3.5 mt-8 font-display text-[21px] font-semibold leading-snug text-ink sm:text-[24px]",
  4: "mb-3 mt-7 font-display text-[18.5px] font-semibold leading-snug text-ink sm:text-[20px]",
  5: "mb-2.5 mt-6 text-[17px] font-bold leading-snug text-ink sm:text-[17.5px]",
  6: "mb-2 mt-5 text-[14.5px] font-bold uppercase tracking-wide leading-snug text-ink/65 sm:text-[15px]",
};

/** Renders `[text](url)` links inside otherwise-plain text; everything else
 *  passes through untouched (and untrusted HTML is never interpreted —
 *  this only ever produces text nodes and <a> elements). */
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const linkRe = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = linkRe.exec(text))) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    parts.push(
      <a
        key={`${keyPrefix}-a-${i++}`}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent underline decoration-accent/40 underline-offset-2 transition hover:decoration-accent"
      >
        {match[1]}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

/** Turns an article's stored content into styled JSX — headings, lists,
 *  links, and inline images, on top of plain paragraphs. Server-safe (no
 *  client-only APIs), so it can be called straight from /blog/[slug]. */
export function renderBlogContent(content: string): ReactNode {
  const blocks = toBlocks(content);

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
        if (block.type === "image") {
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={block.url}
              alt={block.alt}
              className="my-6 w-full rounded-card border border-ink/[0.14] object-cover"
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
