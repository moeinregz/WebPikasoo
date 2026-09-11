"use client";

import Image from "next/image";
import { memo, useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  createBlogPostAction,
  updateBlogPostAction,
  deleteBlogPostAction,
  toggleBlogPublishedAction,
  uploadBlogContentImageAction,
  type BlogFormState,
} from "./actions";
import { slugify } from "@/lib/slug";
import { renderBlogContent, HEADING_CLASS, BLOG_CLASSES } from "@/lib/blogContent";

export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  published: number;
  created_at: string;
  updated_at: string;
  author_name: string | null;
};

const inputClass =
  "w-full rounded-[10px] border border-ink/[0.16] bg-surface/40 px-4 py-3 text-[14.5px] text-ink placeholder:text-dim/60 outline-none transition focus:border-accent focus:bg-surface/70";

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full border border-red-500/40 bg-black/40 px-3 py-1.5 text-[12px] font-semibold text-red-400 backdrop-blur transition hover:bg-red-500/10 disabled:pointer-events-none disabled:opacity-60"
    >
      حذف
    </button>
  );
}

function PublishToggleButton({ published }: { published: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-full border px-3 py-1.5 text-[12px] font-bold transition disabled:pointer-events-none disabled:opacity-60 ${
        published
          ? "border-ink/[0.2] text-dim hover:border-accent hover:text-accent"
          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
      }`}
    >
      {published ? "برگردوندن به پیش‌نویس" : "انتشار"}
    </button>
  );
}

/** The two ways a create/edit form can be submitted — real HTML buttons,
 *  each with its own name+value, so whichever one gets physically clicked
 *  is what ends up in the FormData. No checkbox to forget to tick before
 *  saving, which used to be exactly how a finished article would get saved
 *  as an invisible draft (and then 404 on its own page). */
function PublishButtons({ currentlyPublished }: { currentlyPublished?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <div className="mt-1 flex flex-wrap gap-3">
      <button
        type="submit"
        name="published"
        value="1"
        disabled={pending}
        className="rounded-full bg-accent px-6 py-3 text-[14.5px] font-semibold text-black transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
      >
        {pending ? "در حال ذخیره..." : currentlyPublished ? "ذخیره‌ی تغییرات (منتشرشده)" : "انتشار مقاله"}
      </button>
      <button
        type="submit"
        name="published"
        value="0"
        disabled={pending}
        className="rounded-full border border-ink/[0.2] px-6 py-3 text-[14.5px] font-semibold text-ink transition hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-60"
      >
        {pending ? "..." : "ذخیره به‌عنوان پیش‌نویس"}
      </button>
    </div>
  );
}

const TOOLBAR_BUTTON_CLASS =
  "rounded-md border border-ink/[0.16] bg-canvas px-2.5 py-1.5 text-[12.5px] font-bold text-ink transition hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-50";

const HEADING_LEVELS = [2, 3, 4, 5, 6] as const;

/** Converts one inline-level DOM node's children into our stored markdown-
 *  lite text — only `<a href>` becomes `[text](url)` and `<br>` becomes a
 *  line break; anything else (bold/italic the browser may insert on paste,
 *  stray spans, etc.) is unwrapped down to plain text, since that's all
 *  lib/blogContent.tsx's renderer understands. */
function inlineToMarkdown(el: Node): string {
  let out = "";
  el.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      out += node.textContent ?? "";
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const child = node as HTMLElement;
    const tag = child.tagName.toLowerCase();
    if (tag === "br") {
      out += "\n";
      return;
    }
    if (tag === "a") {
      out += `[${child.textContent ?? ""}](${child.getAttribute("href") ?? ""})`;
      return;
    }
    out += inlineToMarkdown(child);
  });
  return out;
}

/** Walks the editor's actual DOM (after the admin has typed/inserted things
 *  directly into it) and turns it back into the same markdown-lite string
 *  lib/blogContent.tsx parses — the format saved to the database never
 *  changes, only how the admin edits it does. */
function domToMarkdown(root: HTMLElement): string {
  const blocks: string[] = [];
  root.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) blocks.push(text);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    const headingLevel = /^h([2-6])$/.exec(tag)?.[1];
    if (headingLevel) {
      blocks.push(`${"#".repeat(Number(headingLevel))} ${inlineToMarkdown(el).trim()}`);
      return;
    }
    if (tag === "ul" || tag === "ol") {
      const items = Array.from(el.children)
        .filter((li) => li.tagName === "LI")
        .map((li) => `- ${inlineToMarkdown(li).trim()}`);
      if (items.length) blocks.push(items.join("\n"));
      return;
    }
    if (tag === "img") {
      const img = el as HTMLImageElement;
      blocks.push(`![${img.alt || ""}](${img.getAttribute("src") || ""})`);
      return;
    }
    if (tag === "br") return;
    const text = inlineToMarkdown(el);
    if (text.trim()) blocks.push(text);
  });
  return blocks.join("\n\n");
}

/** Live, WYSIWYG body-text editor: instead of a raw textarea (which used
 *  to show literal "## عنوان" text) plus a separate preview underneath,
 *  this IS the preview — a single contentEditable surface where the
 *  toolbar inserts real <h2>..<h6>/<ul>/<a>/<img> elements styled with the
 *  exact same classes the public article page uses, so a heading looks
 *  genuinely big the moment it's inserted, not as markdown syntax. Typing
 *  and every toolbar action re-serialize the live DOM back into the small
 *  markdown-lite string (domToMarkdown, above) that's actually submitted
 *  in the hidden "content" field and that lib/blogContent.tsx renders on
 *  the public page — so the stored format, and that renderer, don't
 *  change at all; only how the admin edits it does. */
function ContentEditorImpl({ defaultValue }: { defaultValue?: string }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [markdown, setMarkdown] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  // A cloned Range (not plain offsets — contentEditable positions are DOM
  // nodes, not string indices) captured the moment "لینک" is clicked, so
  // the mini URL-entry panel below the toolbar knows exactly what to wrap
  // once the admin confirms, even after focus has moved to its input.
  const [linkDraft, setLinkDraft] = useState<{ range: Range; text: string } | null>(null);
  const [linkUrl, setLinkUrl] = useState("");

  // Renders the post's existing content (edit mode) into real DOM once on
  // mount, via the exact same renderer the public page uses — frozen
  // because ContentEditorImpl is wrapped in React.memo(..., () => true)
  // below, so React never re-renders (and never touches) this subtree
  // again after mount; from here on the browser owns these nodes.
  const initialContent = useState(() => defaultValue ?? "")[0];

  function syncFromDom() {
    const editor = editorRef.current;
    if (!editor) return;
    setMarkdown(domToMarkdown(editor));
  }

  /** Inserts a freshly created element right after whichever top-level
   *  block the cursor is currently in (or at the end, if the editor's
   *  empty / nothing's focused yet), then selects `focusTarget` so typing
   *  immediately replaces the placeholder text. */
  function insertElementAtCursor(el: HTMLElement, focusTarget: HTMLElement = el) {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const sel = window.getSelection();

    let anchor: Node | null =
      sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode) ? sel.getRangeAt(0).startContainer : null;
    if (anchor === editor) anchor = null;
    while (anchor && anchor.parentNode !== editor) anchor = anchor.parentNode;

    if (anchor) {
      anchor.parentNode?.insertBefore(el, anchor.nextSibling);
    } else {
      editor.appendChild(el);
    }

    const newRange = document.createRange();
    if (focusTarget.tagName === "IMG") {
      newRange.setStartAfter(focusTarget);
      newRange.collapse(true);
    } else {
      newRange.selectNodeContents(focusTarget);
    }
    sel?.removeAllRanges();
    sel?.addRange(newRange);
    syncFromDom();
  }

  function handleHeading(level: (typeof HEADING_LEVELS)[number]) {
    const el = document.createElement(`h${level}`);
    el.className = HEADING_CLASS[level];
    el.textContent = "عنوان بخش";
    insertElementAtCursor(el);
  }

  function handleList() {
    const ul = document.createElement("ul");
    ul.className = BLOG_CLASSES.list;
    const items = ["مورد اول", "مورد دوم", "مورد سوم"];
    let firstLi: HTMLLIElement | null = null;
    for (const text of items) {
      const li = document.createElement("li");
      li.textContent = text;
      ul.appendChild(li);
      if (!firstLi) firstLi = li;
    }
    insertElementAtCursor(ul, firstLi ?? ul);
  }

  /** Opens the mini link panel, remembering the exact live Range it should
   *  wrap once a URL is entered — cloned because the Range object itself
   *  would otherwise keep tracking (and shifting with) later edits. */
  function handleLinkClick() {
    const editor = editorRef.current;
    const sel = window.getSelection();
    let range: Range;
    if (sel && sel.rangeCount > 0 && editor && editor.contains(sel.anchorNode)) {
      range = sel.getRangeAt(0).cloneRange();
    } else if (editor) {
      range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
    } else {
      return;
    }
    const text = range.toString() || "متن لینک";
    setLinkDraft({ range, text });
    setLinkUrl("");
  }

  function applyLink() {
    if (!linkDraft) return;
    const url = linkUrl.trim();
    if (!url) return;
    const { range, text } = linkDraft;
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.className = BLOG_CLASSES.link;
    a.textContent = text;
    range.deleteContents();
    range.insertNode(a);

    const sel = window.getSelection();
    const newRange = document.createRange();
    newRange.setStartAfter(a);
    newRange.collapse(true);
    sel?.removeAllRanges();
    sel?.addRange(newRange);

    setLinkDraft(null);
    setLinkUrl("");
    syncFromDom();
    editorRef.current?.focus();
  }

  function cancelLink() {
    setLinkDraft(null);
    setLinkUrl("");
    editorRef.current?.focus();
  }

  function handleImageClick() {
    setUploadError("");
    fileInputRef.current?.click();
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    setUploadError("");
    try {
      const fd = new FormData();
      fd.set("image", file);
      const result = await uploadBlogContentImageAction(fd);
      if (result.ok && result.url) {
        const img = document.createElement("img");
        img.src = result.url;
        img.alt = "توضیح تصویر";
        img.className = BLOG_CLASSES.image;
        insertElementAtCursor(img, img);
      } else {
        setUploadError(result.message || "آپلود تصویر ناموفق بود.");
      }
    } catch {
      setUploadError("آپلود تصویر ناموفق بود.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-[12.5px] font-semibold text-dim">متن کامل مقاله</label>

      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        {HEADING_LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => handleHeading(level)}
            className={TOOLBAR_BUTTON_CLASS}
            title={`تیتر (H${level})`}
          >
            H{level}
          </button>
        ))}
        <span className="mx-0.5 h-5 w-px bg-ink/[0.14]" aria-hidden="true" />
        <button type="button" onClick={handleList} className={TOOLBAR_BUTTON_CLASS} title="لیست">
          لیست
        </button>
        <button type="button" onClick={handleLinkClick} className={TOOLBAR_BUTTON_CLASS} title="لینک روی یه کلمه">
          لینک
        </button>
        <button
          type="button"
          onClick={handleImageClick}
          disabled={uploading}
          className={TOOLBAR_BUTTON_CLASS}
          title="افزودن عکس داخل مقاله"
        >
          {uploading ? "در حال آپلود..." : "افزودن عکس"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
      </div>

      {linkDraft && (
        <div className="mb-2 flex flex-wrap items-center gap-2 rounded-md border border-accent/40 bg-accent/[0.06] p-2.5">
          <span className="max-w-[9rem] truncate text-[12.5px] font-semibold text-ink" title={linkDraft.text}>
            «{linkDraft.text}»
          </span>
          <input
            type="url"
            autoFocus
            dir="ltr"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              } else if (e.key === "Escape") {
                e.preventDefault();
                cancelLink();
              }
            }}
            placeholder="https://example.com"
            className={`${inputClass} flex-1 py-1.5 text-left text-[13px]`}
          />
          <button
            type="button"
            onClick={applyLink}
            disabled={!linkUrl.trim()}
            className="rounded-md bg-accent px-3 py-1.5 text-[12.5px] font-bold text-black transition disabled:pointer-events-none disabled:opacity-50"
          >
            اعمال لینک
          </button>
          <button
            type="button"
            onClick={cancelLink}
            className="rounded-md border border-ink/[0.2] px-3 py-1.5 text-[12.5px] font-semibold text-dim transition hover:text-ink"
          >
            انصراف
          </button>
        </div>
      )}

      {uploadError && <p className="mb-2 text-[12px] text-red-500">{uploadError}</p>}

      {/* This div IS the editor AND the preview at once — whatever's typed
       *  or inserted here renders at full, real size immediately (a real
       *  <h2>, not "## عنوان"), because it's genuinely the same markup
       *  the public article page renders, not a separate preview of it. */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={syncFromDom}
        onBlur={syncFromDom}
        dir="rtl"
        data-placeholder="متن کامل مقاله... برای تیتر/لیست/لینک/عکس از دکمه‌های بالا استفاده کن. Enter پاراگراف جدید می‌سازه، Shift+Enter فقط خط جدید."
        className={`${inputClass} min-h-[260px] resize-y leading-relaxed empty:before:pointer-events-none empty:before:text-dim/60 empty:before:content-[attr(data-placeholder)]`}
      >
        {renderBlogContent(initialContent)}
      </div>

      {/* Kept as a plain hidden field so the surrounding <form>'s FormData
       *  still submits "content" exactly like before — its value is just
       *  kept in sync with the contentEditable div above instead of being
       *  the thing the admin types into directly. */}
      <input type="hidden" name="content" value={markdown} />

      <p className="mt-1 text-[12px] text-dim/70">
        متن رو انتخاب کن، «لینک» رو بزن، آدرس رو توی همون کادر بنویس و «اعمال لینک» رو بزن. بدون انتخاب متن، یه نمونه‌ی
        آماده اضافه می‌شه که می‌تونی جاش رو عوض کنی. برای تیتر هم از H2 تا H6 رو داری — هرچی عدد کوچیک‌تر، تیتر بزرگ‌تره.
      </p>
    </div>
  );
}

// React never re-renders this after its first mount (comparator always
// returns "props are equal") — the contentEditable div's DOM is handed
// off to the browser on mount and must never be touched by React again,
// or the admin's live edits could be clobbered mid-typing.
const ContentEditor = memo(ContentEditorImpl, () => true);

function RemoveImageButton({ onClick, title }: { onClick: () => void; title: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-ink/[0.14] bg-canvas text-dim shadow transition hover:border-red-500/40 hover:text-red-500"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3.5 w-3.5">
        <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
      </svg>
    </button>
  );
}

/** Cover-image field: a file picker with a preview, where both a freshly
 *  picked file and an already-saved cover image (in edit mode) can be
 *  cleared with a small × button instead of just being replaced.
 *  - Clearing a freshly picked file just resets the <input>, nothing is
 *    submitted.
 *  - "Removing" the existing saved cover sets a hidden removeCoverImage=1
 *    field that actions.ts reads to explicitly clear cover_image — but only
 *    when no new file was picked in the same submit (a new pick always
 *    wins, and picking one cancels a pending removal). */
function CoverImageField({ existingCoverImage }: { existingCoverImage?: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeExisting, setRemoveExisting] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
    if (file) setRemoveExisting(false);
  }

  function clearPickedFile() {
    if (fileInputRef.current) fileInputRef.current.value = "";
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }

  const showExisting = !!existingCoverImage && !removeExisting && !previewUrl;

  return (
    <div>
      <label className="mb-1.5 block text-[12.5px] font-semibold text-dim">تصویر کاور</label>

      {previewUrl && (
        <div className="relative mb-2 inline-block h-32 w-full max-w-xs overflow-hidden rounded-lg border border-ink/[0.14]">
          <Image src={previewUrl} alt="" fill unoptimized sizes="320px" className="object-cover" />
          <RemoveImageButton onClick={clearPickedFile} title="حذف عکس انتخاب‌شده" />
        </div>
      )}

      {showExisting && (
        <div className="relative mb-2 inline-block h-32 w-full max-w-xs overflow-hidden rounded-lg border border-ink/[0.14]">
          <Image
            src={existingCoverImage!}
            alt=""
            fill
            sizes="320px"
            className="object-cover"
          />
          <RemoveImageButton onClick={() => setRemoveExisting(true)} title="حذف تصویر کاور" />
        </div>
      )}

      {removeExisting && !previewUrl && (
        <p className="mb-2 flex flex-wrap items-center gap-2 text-[12px] text-red-500">
          تصویر کاور فعلی با ذخیره‌ی فرم حذف می‌شه.
          <button
            type="button"
            onClick={() => setRemoveExisting(false)}
            className="font-semibold text-accent underline"
          >
            لغو حذف
          </button>
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        name="coverImage"
        accept="image/*"
        onChange={handleFileChange}
        className="block w-full text-[13.5px] text-dim file:ml-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-[12.5px] file:font-bold file:text-canvas"
      />
      {existingCoverImage && <input type="hidden" name="removeCoverImage" value={removeExisting ? "1" : "0"} />}
      {existingCoverImage && !removeExisting && (
        <p className="mt-1 text-[12px] text-dim/70">یه فایل جدید انتخاب کن تا عکس فعلی جایگزین بشه، وگرنه همون می‌مونه.</p>
      )}
    </div>
  );
}

/** Shared field set for both the "create" and "edit" forms. The slug field
 *  auto-fills from the title as the admin types (client-side, via the same
 *  slugify() the server re-validates with) but stays freely editable — this
 *  is the "لینک سازی" for the post's public URL, /blog/[slug]. */
function BlogFields({
  defaults,
}: {
  defaults?: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: string;
  };
}) {
  const [title, setTitle] = useState(defaults?.title ?? "");
  const [slug, setSlug] = useState(defaults?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!defaults?.slug);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  return (
    <div className="grid gap-4">
      <input
        name="title"
        required
        placeholder="عنوان مقاله"
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        className={inputClass}
      />

      <div>
        <label className="mb-1.5 block text-[12.5px] font-semibold text-dim">
          لینک مقاله (webpikaso.com/blog/…)
        </label>
        <input
          name="slug"
          dir="ltr"
          placeholder="خودکار از عنوان ساخته می‌شه"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
          className={`${inputClass} text-left`}
        />
      </div>

      <textarea
        name="excerpt"
        rows={2}
        defaultValue={defaults?.excerpt}
        placeholder="توضیح کوتاه (برای نمایش در لیست وبلاگ)"
        className={`${inputClass} resize-none`}
      />

      <ContentEditor defaultValue={defaults?.content} />

      <CoverImageField existingCoverImage={defaults?.coverImage} />
    </div>
  );
}

const initialState: BlogFormState = null;

function AddBlogPostForm() {
  const [state, formAction] = useFormState(createBlogPostAction, initialState);
  const [open, setOpen] = useState(false);
  // Bumped after a successful create so <BlogFields> (and its nested
  // ContentEditor/CoverImageField, which hold their own controlled state)
  // remounts from scratch — a plain form.reset() wouldn't touch that
  // controlled state, so the title/content/cover would otherwise stick
  // around after the article's been saved.
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (state?.ok) setResetKey((k) => k + 1);
  }, [state]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-ink/70 px-5 py-2.5 text-[13.5px] font-bold text-ink transition hover:bg-ink hover:text-canvas"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
          <path d="M12 5v14M5 12h14" />
        </svg>
        نوشتن مقاله‌ی جدید
      </button>
    );
  }

  return (
    <form action={formAction} className="mb-6 rounded-card border border-ink/[0.14] bg-surface/20 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-normal">مقاله‌ی جدید</h2>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-dim transition hover:text-ink">
          بستن
        </button>
      </div>

      <BlogFields key={resetKey} />

      {state && <p className={`mt-3 text-sm ${state.ok ? "text-accent" : "text-dim"}`}>{state.message}</p>}
      <PublishButtons />
    </form>
  );
}

function EditBlogPostForm({ post, onClose }: { post: BlogPost; onClose: () => void }) {
  const [state, formAction] = useFormState(updateBlogPostAction, initialState);

  // Once the edit is saved, close the inline form — reopening it later
  // remounts BlogFields fresh from the (now-updated) post prop, which is
  // the "refresh" here since the fields are controlled state.
  useEffect(() => {
    if (state?.ok) onClose();
  }, [state, onClose]);

  return (
    <form action={formAction} className="mt-4 border-t border-ink/[0.1] pt-4">
      <input type="hidden" name="postId" value={post.id} />
      <BlogFields
        defaults={{
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: post.cover_image,
        }}
      />
      {state && <p className={`mt-3 text-sm ${state.ok ? "text-accent" : "text-dim"}`}>{state.message}</p>}
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <PublishButtons currentlyPublished={!!post.published} />
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-ink/[0.2] px-6 py-3 text-[14.5px] font-semibold text-dim transition hover:text-ink"
        >
          انصراف
        </button>
      </div>
    </form>
  );
}

function BlogPostCard({ post, canDelete }: { post: BlogPost; canDelete: boolean }) {
  const [editing, setEditing] = useState(false);
  const isPublished = !!post.published;

  return (
    <article className="rounded-card border border-ink/[0.14] bg-surface/20 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-normal">{post.title}</h3>
            <span
              className={`rounded-md border px-2 py-0.5 font-mono text-[11px] ${
                isPublished
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                  : "border-ink/[0.2] text-dim"
              }`}
            >
              {isPublished ? "منتشرشده" : "پیش‌نویس"}
            </span>
          </div>
          <a
            href={`/blog/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            dir="ltr"
            className="block truncate text-[12.5px] text-accent underline"
          >
            /blog/{post.slug}
          </a>
          {post.excerpt && <p className="mt-2 text-[13.5px] text-dim">{post.excerpt}</p>}
          {post.author_name && (
            <p className="mt-1 font-mono text-[11.5px] text-dim/70">نویسنده: {post.author_name}</p>
          )}
        </div>

        {post.cover_image && (
          <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-ink/[0.14]">
            <Image src={post.cover_image} alt="" fill sizes="96px" className="object-cover" />
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-ink/[0.1] pt-4">
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="rounded-full border border-ink/[0.2] px-3 py-1.5 text-[12px] font-bold text-ink transition hover:border-accent hover:text-accent"
        >
          {editing ? "بستن ویرایش" : "ویرایش"}
        </button>
        <form action={toggleBlogPublishedAction}>
          <input type="hidden" name="postId" value={post.id} />
          <input type="hidden" name="published" value={isPublished ? "0" : "1"} />
          <PublishToggleButton published={isPublished} />
        </form>
        {canDelete && (
          <form action={deleteBlogPostAction}>
            <input type="hidden" name="postId" value={post.id} />
            <DeleteButton />
          </form>
        )}
      </div>

      {editing && <EditBlogPostForm post={post} onClose={() => setEditing(false)} />}
    </article>
  );
}

export default function BlogPanel({ posts, canDelete = false }: { posts: BlogPost[]; canDelete?: boolean }) {
  return (
    <div>
      <AddBlogPostForm />

      {posts.length === 0 ? (
        <div className="rounded-card border border-dashed border-ink/[0.2] p-8 sm:p-14 text-center text-dim">
          هنوز مقاله‌ای ثبت نشده — از دکمه‌ی بالا اولین مقاله رو بنویس.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((p) => (
            <BlogPostCard key={p.id} post={p} canDelete={canDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
