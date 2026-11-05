// خودکارسازی سئو و تولید محتوا:
//   ۱) کلمه‌ی کلیدی از پیشنهادهای جستجوی گوگل (autocomplete) پیدا می‌شه،
//   ۲) هوش مصنوعی (Claude) با قوانین سئو یه مقاله‌ی کامل فارسی می‌نویسه،
//   ۳) مقاله مستقیم توی وبلاگ منتشر می‌شه،
//   ۴) لینک‌سازی داخلی: مقاله‌ی جدید به صفحه‌های خدمات و مقاله‌های قبلی لینک
//      می‌ده و مقاله‌های مرتبط قبلی هم توی بخش «مطالب مرتبط» به مقاله‌ی جدید.
// هر روز کرون Vercel صداش می‌زنه (vercel.json) و خودش بر اساس interval_days
// (پیش‌فرض ۲ روز) تصمیم می‌گیره نوبت مقاله‌ی جدید هست یا نه.
import Anthropic from "@anthropic-ai/sdk";
import {
  addSeoKeywords,
  claimSeoRunLock,
  createBlogPost,
  getAllBlogPosts,
  getBlogPostBySlug,
  getSeoKeywords,
  getSeoSettings,
  logSeoRun,
  releaseSeoRunLock,
  setBlogPostContent,
  setSeoKeywordStatus,
  updateSeoSettings,
  type BlogPostWithAuthor,
} from "@/lib/db";
import { landingPages } from "@/lib/landingPages";
import { slugify, isValidSlug } from "@/lib/slug";
import { TRADES } from "@/lib/siteTemplates/trades";

const MODEL = "claude-opus-5-5";
export const RELATED_HEADING = "## مطالب مرتبط";
const MAX_RELATED = 6;

// -----------------------------------------------------------------------
// 1) Keyword discovery
// -----------------------------------------------------------------------

/** Topics the site actually sells — every keyword is grown from one of these. */
function seedPhrases(): string[] {
  const base = [
    ...Object.values(landingPages).map((p) => p.title),
    "سئو سایت",
    "افزایش بازدید سایت",
    "فروش آنلاین",
    "سایت فروشگاهی",
    "طراحی سایت موبایل",
    "هزینه سایت",
    "دامنه و هاست",
    "سایت برای کسب و کار",
  ];
  const trades = TRADES.map((t) => `سایت ${t.label.split(/[—(]/)[0].trim()}`);
  return [...base, ...trades];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const PERSIAN = /[؀-ۿ]/;

/** Real search phrases people type, from Google's public autocomplete. */
async function googleSuggest(seed: string): Promise<string[]> {
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=fa&gl=ir&ie=utf-8&oe=utf-8&q=${encodeURIComponent(seed)}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { "User-Agent": "Mozilla/5.0 (compatible; WebPikasoSEO/1.0)" } });
    if (!res.ok) return [];
    const data = (await res.json()) as [string, string[]];
    return Array.isArray(data?.[1]) ? data[1] : [];
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

function cleanKeyword(k: string): string | null {
  const s = k.replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/\s+/g, " ").trim();
  const words = s.split(" ").length;
  if (!PERSIAN.test(s) || words < 2 || words > 9 || s.length > 80) return null;
  return s;
}

/** Grows the keyword queue from a few random seeds; returns how many were new. */
export async function discoverKeywords(seedCount = 8): Promise<number> {
  const seeds = shuffle(seedPhrases()).slice(0, seedCount);
  const found: { keyword: string; seed: string }[] = [];
  const results = await Promise.all(seeds.map(async (seed) => ({ seed, list: await googleSuggest(seed) })));
  for (const { seed, list } of results) {
    for (const raw of list) {
      const k = cleanKeyword(raw);
      if (k && k !== seed) found.push({ keyword: k, seed });
    }
  }
  return addSeoKeywords(found);
}

// -----------------------------------------------------------------------
// 2) Article generation
// -----------------------------------------------------------------------

type LinkTarget = { url: string; title: string };

function linkTargets(posts: BlogPostWithAuthor[]): { landing: LinkTarget[]; blog: LinkTarget[] } {
  const landing: LinkTarget[] = [
    ...Object.values(landingPages).map((p) => ({ url: `/${p.slug}`, title: p.title })),
    { url: "/portfolio", title: "نمونه‌کارها" },
    { url: "/order", title: "ثبت سفارش طراحی سایت" },
    { url: "/contact", title: "تماس و مشاوره" },
  ];
  const blog = posts
    .filter((p) => p.published)
    .slice(0, 60)
    .map((p) => ({ url: `/blog/${p.slug}`, title: p.title }));
  return { landing, blog };
}

const SYSTEM_PROMPT = `تو نویسنده‌ی ارشد محتوا و متخصص سئوی «وب پیکاسو» هستی؛ یه تیم طراحی سایت ایرانی که برای کسب‌وکارها (کافه، رستوران، فروشگاه، کلینیک، آموزشگاه و...) سایت اختصاصی، فروشگاهی و شرکتی طراحی می‌کنه و خدمات سئو می‌ده.

کار تو: از بین کلمه‌های کلیدی پیشنهادی، بهترین کلمه رو انتخاب کنی و براش یه مقاله‌ی کامل، کاربردی و انسانی به فارسی بنویسی.

انتخاب کلمه‌ی کلیدی:
- کلمه‌ای رو انتخاب کن که به خدمات وب پیکاسو مربوطه و کسی که جستجوش می‌کنه می‌تونه مشتری بشه.
- کلمه‌ای که موضوعش با مقاله‌های موجود تکراری باشه انتخاب نکن (کنیبالیزیشن).
- کلمه‌هایی که اسم برند یا شرکت دیگه‌ای دارن، بی‌ربطن یا معنی ندارن رو توی skip_keywords بذار.
- اگه هیچ‌کدوم مناسب نبود، خودت یه کلمه‌ی کلیدی واقعی و پرجستجو و مرتبط با خدمات پیشنهاد بده.

قوانین سئو:
- کلمه‌ی کلیدی اصلی دقیقاً توی title، توی پاراگراف اول و توی حداقل یکی از تیترهای ## بیاد؛ توی متن طبیعی و بدون تکرار زورکی (چگالی حدود ۱٪).
- title بین ۴۰ تا ۶۵ کاراکتر، جذاب و قابل کلیک.
- meta_description بین ۱۲۰ تا ۱۶۰ کاراکتر، شامل کلمه‌ی کلیدی و یه دعوت به عمل.
- slug: کوتاه، فارسی، کلمه‌ها با خط تیره، بدون حروف اضافه (مثلاً «طراحی-سایت-کافه»).
- طول متن ۱۲۰۰ تا ۱۸۰۰ کلمه؛ پاراگراف‌های کوتاه (۲ تا ۴ جمله).
- ساختار: مقدمه‌ی کوتاه که مستقیم به سوال جواب بده، ۴ تا ۷ بخش با تیتر ##، زیربخش‌ها با ###، حداقل یه لیست، بخش «## سوالات متداول» با ۳ تا ۵ سوال (هر سوال یه تیتر ### و جواب کوتاه زیرش)، و یه جمع‌بندی با دعوت به سفارش یا مشاوره.
- از کلمه‌های مرتبط و هم‌معنی (LSI) استفاده کن.

لینک‌سازی داخلی (خیلی مهم):
- ۳ تا ۶ لینک داخلی توی متن بذار، با انکرتکست طبیعی و توصیفی (نه «اینجا کلیک کنید»).
- حداقل ۲ لینک به صفحه‌های خدمات و اگه مقاله‌ی مرتبط وجود داره، ۱ تا ۳ لینک به مقاله‌های قبلی.
- فقط و فقط از آدرس‌هایی که توی لیست داده شده استفاده کن، دقیقاً همون‌طور که نوشته شده. هیچ لینک خارجی نذار.
- توی related_post_slugs اسلاگ ۱ تا ۳ مقاله‌ی موجود که بیشترین ارتباط موضوعی رو دارن بذار (فقط از لیست؛ اگه هیچ‌کدوم مرتبط نیست، خالی بذار).

فرمت content (یه مارک‌داون ساده؛ هر چیز دیگه خام نمایش داده می‌شه):
- تیتر: «## » و «### » (تیتر # ممنوع؛ عنوان جداست). بخش «## مطالب مرتبط» ننویس؛ خودکار اضافه می‌شه.
- لیست: هر آیتم یه خط که با «- » شروع بشه.
- لینک: [انکرتکست](/آدرس)
- پاراگراف‌ها با یه خط خالی از هم جدا بشن.
- بولد (**)، ایتالیک، جدول، کد، نقل‌قول و HTML ممنوع.

صداقت:
- آمار، درصد، قیمت دقیق، اسم مشتری یا نقل‌قول ساختگی ننویس. اگه به قیمت اشاره می‌کنی، بگو به امکانات بستگی داره و به صفحه‌ی قیمت لینک بده.
- لحن: صمیمی، حرفه‌ای و مفید؛ فارسی روان و درست با نیم‌فاصله.`;

const OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["keyword", "skip_keywords", "title", "slug", "meta_description", "content", "related_post_slugs"],
  properties: {
    keyword: { type: "string", description: "کلمه‌ی کلیدی اصلی انتخاب‌شده" },
    skip_keywords: { type: "array", items: { type: "string" }, description: "کلمه‌های پیشنهادی بی‌ربط یا نامناسب" },
    title: { type: "string" },
    slug: { type: "string" },
    meta_description: { type: "string" },
    content: { type: "string" },
    related_post_slugs: { type: "array", items: { type: "string" } },
  },
} as const;

type Article = {
  keyword: string;
  skip_keywords: string[];
  title: string;
  slug: string;
  meta_description: string;
  content: string;
  related_post_slugs: string[];
};

async function writeArticle(candidates: string[], targets: { landing: LinkTarget[]; blog: LinkTarget[] }): Promise<Article> {
  const client = new Anthropic();
  const list = (items: LinkTarget[]) => items.map((t) => `- ${t.url} — ${t.title}`).join("\n");
  const userMsg = `کلمه‌های کلیدی پیشنهادی (از جستجوهای واقعی گوگل):
${candidates.length ? candidates.map((k) => `- ${k}`).join("\n") : "(فعلاً خالیه؛ خودت یه کلمه‌ی مناسب پیشنهاد بده)"}

صفحه‌های خدمات سایت (برای لینک داخلی):
${list(targets.landing)}

مقاله‌های منتشرشده‌ی قبلی (برای لینک داخلی و جلوگیری از موضوع تکراری):
${targets.blog.length ? list(targets.blog) : "(هنوز مقاله‌ای نیست)"}

یه کلمه انتخاب کن و مقاله‌ش رو بنویس.`;

  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: 32000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    thinking: { type: "adaptive" },
    output_config: { effort: "high", format: { type: "json_schema", schema: OUTPUT_SCHEMA as unknown as Record<string, unknown> } },
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMsg }],
  });
  const msg = await stream.finalMessage();

  if (msg.stop_reason === "refusal") throw new Error("مدل درخواست رو رد کرد (refusal)");
  if (msg.stop_reason === "max_tokens") throw new Error("خروجی مدل نصفه موند (max_tokens)");
  const text = msg.content
    .filter((b): b is Extract<typeof b, { type: "text" }> => b.type === "text")
    .map((b) => b.text)
    .join("");
  const parsed = JSON.parse(text) as Article;
  if (!parsed.title || !parsed.content || !parsed.keyword) throw new Error("خروجی مدل ناقصه");
  return parsed;
}

// -----------------------------------------------------------------------
// 3) Post-processing: safe content + internal links
// -----------------------------------------------------------------------

function normUrl(u: string): string {
  try {
    return decodeURIComponent(u).replace(/\/+$/, "");
  } catch {
    return u.replace(/\/+$/, "");
  }
}

/** Keeps only links to real pages of this site; anything else becomes plain text. */
export function sanitizeContent(content: string, allowed: Set<string>): { content: string; links: number } {
  let links = 0;
  let out = content
    .replace(/\r\n/g, "\n")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/^#\s+.*$/gm, "") // H1 belongs to the page title
    .replace(/<[^>]+>/g, "");
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text: string, url: string) => {
    const u = normUrl(url);
    if (allowed.has(u)) {
      links++;
      return `[${text}](${u})`;
    }
    return text;
  });
  // the related block is managed by code, never by the model
  const rel = out.indexOf(RELATED_HEADING);
  if (rel >= 0) out = out.slice(0, rel);
  return { content: out.replace(/\n{3,}/g, "\n\n").trim(), links };
}

/** Adds links into a post's «مطالب مرتبط» list (kept last, newest first, de-duplicated). */
export function upsertRelated(content: string, add: LinkTarget[]): string {
  const idx = content.indexOf(RELATED_HEADING);
  const body = (idx >= 0 ? content.slice(0, idx) : content).trimEnd();
  const existing: LinkTarget[] = [];
  if (idx >= 0) {
    for (const line of content.slice(idx + RELATED_HEADING.length).split("\n")) {
      const m = line.match(/^-\s+\[([^\]]+)\]\(([^)\s]+)\)/);
      if (m) existing.push({ title: m[1], url: m[2] });
    }
  }
  const merged: LinkTarget[] = [];
  for (const t of [...add, ...existing]) {
    if (!merged.some((x) => normUrl(x.url) === normUrl(t.url))) merged.push(t);
  }
  const items = merged.slice(0, MAX_RELATED);
  if (!items.length) return body;
  return `${body}\n\n${RELATED_HEADING}\n${items.map((t) => `- [${t.title}](${t.url})`).join("\n")}`;
}

async function uniqueSlug(wanted: string, fallback: string): Promise<string> {
  let base = slugify(wanted);
  if (!base || !isValidSlug(base)) base = slugify(fallback);
  base = base.slice(0, 80).replace(/-+$/, "");
  let slug = base;
  for (let n = 2; await getBlogPostBySlug(slug); n++) slug = `${base}-${n}`;
  return slug;
}

// -----------------------------------------------------------------------
// 4) One run
// -----------------------------------------------------------------------

export type SeoRunResult =
  | { ok: true; skipped?: false; postId: number; slug: string; title: string; keyword: string; linked: number }
  | { ok: true; skipped: true; reason: string }
  | { ok: false; error: string };

function hoursSince(at: string | null): number {
  if (!at) return Infinity;
  return (Date.now() - new Date(at.replace(" ", "T") + "Z").getTime()) / 3_600_000;
}

/** cron: runs only when enabled and the interval has passed; manual: always. */
export async function runSeoAutomation(trigger: "cron" | "manual"): Promise<SeoRunResult> {
  const settings = await getSeoSettings();
  if (trigger === "cron") {
    if (!settings.enabled) return { ok: true, skipped: true, reason: "اتوماسیون خاموشه" };
    // 2h slack so a cron that fires a few minutes early doesn't skip a whole day
    if (hoursSince(settings.last_run_at) < settings.interval_days * 24 - 2) {
      return { ok: true, skipped: true, reason: "هنوز نوبت مقاله‌ی بعدی نرسیده" };
    }
  }
  if (!process.env.ANTHROPIC_API_KEY) return { ok: false, error: "ANTHROPIC_API_KEY توی تنظیمات Vercel ست نشده" };
  if (!(await claimSeoRunLock())) return { ok: true, skipped: true, reason: "یه اجرای دیگه در جریانه" };

  let keyword: string | null = null;
  try {
    await discoverKeywords().catch(() => 0);
    const queue = await getSeoKeywords("new", 40);
    const candidates = queue.map((k) => k.keyword);

    const posts = await getAllBlogPosts();
    const targets = linkTargets(posts);
    const article = await writeArticle(candidates, targets);
    keyword = cleanKeyword(article.keyword) ?? article.keyword.trim();

    const allowed = new Set([...targets.landing, ...targets.blog].map((t) => normUrl(t.url)));
    const { content: body } = sanitizeContent(article.content, allowed);
    if (body.split(/\s+/).length < 500) throw new Error("مقاله خیلی کوتاه بود؛ منتشر نشد");

    const published = posts.filter((p) => p.published);
    const related = article.related_post_slugs
      .map((s) => published.find((p) => p.slug === s.replace(/^\/?blog\//, "")))
      .filter((p): p is BlogPostWithAuthor => !!p)
      .slice(0, 3);
    // Not enough related picks: fill from the newest posts so every article links somewhere.
    for (const p of published) {
      if (related.length >= 3) break;
      if (!related.includes(p)) related.push(p);
    }

    const slug = await uniqueSlug(article.slug, keyword);
    const title = article.title.trim().slice(0, 120);
    const content = upsertRelated(body, related.map((p) => ({ title: p.title, url: `/blog/${p.slug}` })));
    const postId = await createBlogPost({
      title,
      slug,
      excerpt: article.meta_description.trim().slice(0, 300),
      content,
      published: true,
    });

    // Backlinks: each related older post gets a link to the new one.
    for (const p of related) {
      await setBlogPostContent(p.id, upsertRelated(p.content, [{ title, url: `/blog/${slug}` }]));
    }

    if (candidates.includes(keyword)) await setSeoKeywordStatus(keyword, "used", postId);
    else await addSeoKeywords([{ keyword, seed: "ai" }]).then(() => setSeoKeywordStatus(keyword!, "used", postId));
    for (const s of article.skip_keywords) if (candidates.includes(s) && s !== keyword) await setSeoKeywordStatus(s, "skipped");

    await updateSeoSettings({ last_run_at: new Date().toISOString().slice(0, 19).replace("T", " ") });
    await logSeoRun({ trigger, ok: true, keyword, post_id: postId, post_slug: slug, post_title: title, linked_post_ids: related.map((p) => p.id), error: null });
    return { ok: true, postId, slug, title, keyword, linked: related.length };
  } catch (e) {
    const error = e instanceof Anthropic.APIError ? `خطای API (${e.status}): ${e.message}` : e instanceof Error ? e.message : String(e);
    await logSeoRun({ trigger, ok: false, keyword, post_id: null, post_slug: null, post_title: null, linked_post_ids: [], error }).catch(() => {});
    return { ok: false, error };
  } finally {
    await releaseSeoRunLock().catch(() => {});
  }
}
