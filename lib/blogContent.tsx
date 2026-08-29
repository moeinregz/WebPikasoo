import { Fragment, type ReactNode } from "react";

// A deliberately tiny, purpose-built markdown-lite — not a general markdown
// parser. It only understands the handful of things the BlogPanel editor's
// toolbar (H2-H6 / list / link / image) actually inserts, which keeps this
// dependency-free and predictable. Plain paragraphs (no special syntax)
// render exactly like before — this only adds new block types on top.

type Block =
  | { type: "heading"; level: 2 | 3 | 4 | 5 | 6; text: string }
  | { type: "list"; items: string[] }
  | { type: "image"; url: string; alt: string }
  | { type: "paragraph"; lines: string[] };

// Matches 2-6 leading "#" (## through ######) — one "#" is intentionally
// not a heading here, to stay unambiguous with plain text starting with "#".
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

// Size (and heading tag) per level — H2 is the biggest/most prominent,
// shrinking down to H6, so nested sections read as visually subordinate.
// The literal "##"/"###..." markers themselves never reach the page: the
// parser above strips them off, this only renders the text after them.
const HEADING_STYLES: Record<2 | 3 | 4 | 5 | 6, { Tag: "h2" | "h3" | "h4" | "h5" | "h6"; className: string }> = {
  2: { Tag: "h2", className: "mb-4 mt-10 font-display text-[21px] font-normal leading-snug text-ink sm:text-[24px]" },
  3: { Tag: "h3", className: "mb-3.5 mt-9 font-display text-[19px] font-normal leading-snug text-ink sm:text-[21.5px]" },
  4: { Tag: "h4", className: "mb-3 mt-8 font-display text-[17.5px] font-normal leading-snug text-ink sm:text-[19px]" },
  5: { Tag: "h5", className: "mb-2.5 mt-7 text-[16px] font-bold leading-snug text-ink sm:text-[17px]" },
  6: { Tag: "h6", className: "mb-2 mt-6 text-[14.5px] font-bold leading-snug text-dim sm:text-[15.5px]" },
};

/** Turns an article's stored content into styled JSX — headings (H2-H6),
 *  lists, links, and inline images, on top of plain paragraphs. Server-safe
 *  (no client-only APIs), so it can be called straight from /blog/[slug]. */
export function renderBlogContent(content: string): ReactNode {
  const blocks = toBlocks(content);

  return (
    <>
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          const { Tag, className } = HEADING_STYLES[block.level];
          return (
            <Tag key={i} className={className}>
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
