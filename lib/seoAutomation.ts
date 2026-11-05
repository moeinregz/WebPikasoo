// خودکارسازی سئو و تولید محتوا:
//   ۱) کلمه‌ی کلیدی از پیشنهادهای جستجوی گوگل (autocomplete) پیدا می‌شه،
//   ۲) هوش مصنوعی (Claude) با قوانین سئو یه مقاله‌ی کامل فارسی می‌نویسه،
//   ۳) مقاله مستقیم توی وبلاگ منتشر می‌شه،
//   ۴) لینک‌سازی داخلی: مقاله‌ی جدید به صفحه‌های خدمات و مقاله‌های قبلی لینک
//      می‌ده و مقاله‌های مرتبط قبلی هم توی بخش «مطالب مرتبط» به مقاله‌ی جدید.
// هر روز کرون Vercel صداش می‌زنه (vercel.json) و خودش بر اساس interval_days
// (پیش‌فرض ۲ روز) تصمیم می‌گیره نوبت مقاله‌ی جدید هست یا نه.
import Anthropic from "@anthropic-ai/sdk";
import { findPhoto } from "@/lib/stockPhoto";
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

/** Content rules — kept in one place so the prompt and the checks agree. */
export const RULES = {
  words: 2800,
  minWords: 1800,
  density: 2, // ٪ — (تکرار کلمه‌ی کلیدی × تعداد کلمه‌هاش) ÷ کل کلمه‌ها
  metaMin: 145,
  metaMax: 160,
  linksMin: 3,
  linksMax: 4,
  imagesMin: 3,
  imagesMax: 4,
};

export const IMAGE_PLACEHOLDER = "/blog-placeholder.svg";

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

کار تو: از بین کلمه‌های کلیدی پیشنهادی، بهترین کلمه‌ی کلیدی اصلی رو انتخاب کنی و براش یه مقاله‌ی جامع، کاربردی و انسانی به فارسی بنویسی.

انتخاب کلمه‌ی کلیدی اصلی:
- به خدمات وب پیکاسو مربوط باشه و کسی که جستجوش می‌کنه بتونه مشتری بشه.
- موضوعش با مقاله‌های موجود تکراری نباشه.
- کلمه‌هایی که اسم برند یا شرکت دیگه‌ای دارن، بی‌ربطن یا معنی ندارن رو توی skip_keywords بذار.
- اگه هیچ‌کدوم مناسب نبود، خودت یه کلمه‌ی کلیدی واقعی، پرجستجو و مرتبط پیشنهاد بده.

عنوان (title) — همه‌ی این‌ها الزامیه:
- دقیقاً با کلمه‌ی کلیدی اصلی شروع بشه (اولین کلمه‌های عنوان، بدون هیچ کلمه‌ای قبلش).
- یه عدد داشته باشه (مثلاً «۷ نکته»، «۱۰ قدم»، «راهنمای ۱۴۰۵»). عدد رو با رقم فارسی بنویس.
- بین ۵۰ تا ۷۰ کاراکتر، جذاب و قابل کلیک.
- نمونه: «طراحی سایت کافه: ۹ نکته برای جذب مشتری بیشتر در ۱۴۰۵»

توضیحات متا (meta_description):
- بین ${RULES.metaMin} تا ${RULES.metaMax} کاراکتر (حرف، نه کلمه) — دقیق بشمار.
- کلمه‌ی کلیدی اصلی اول جمله بیاد و یه دعوت به عمل داشته باشه.

slug: کوتاه، فارسی، با کلمه‌ی کلیدی اصلی، کلمه‌ها با خط تیره (مثلاً «طراحی-سایت-کافه»).

متن (content):
- طول: حدود ${RULES.words} کلمه (حداقل ۲۵۰۰). کوتاه‌تر قبول نیست.
- چگالی کلمه‌ی کلیدی اصلی دقیقاً حدود ${RULES.density}٪: تعداد تکرار = (${RULES.words} × ${RULES.density / 100}) ÷ تعداد کلمه‌های خود کلمه‌ی کلیدی. مثلاً برای یه کلمه‌ی کلیدی ۳ کلمه‌ای حدود ۱۹ بار، برای ۲ کلمه‌ای حدود ۲۸ بار. تکرارها طبیعی و پخش در کل متن باشن (پاراگراف اول، تیترها، وسط و جمع‌بندی). کلمه‌ی کلیدی رو دقیقاً با همون املا تکرار کن.
- کلمه‌ی کلیدی اصلی توی پاراگراف اول و حداقل ۳ تا از تیترهای ## بیاد.
- ساختار: مقدمه‌ی گیرا که مستقیم به سوال جواب بده، ۷ تا ۱۰ بخش با تیتر ##، زیربخش‌ها با ###، بخش «## سوالات متداول» با ۴ تا ۶ سوال (هر سوال یه تیتر ### و جواب کوتاه)، و جمع‌بندی با دعوت به سفارش یا مشاوره.
- تیترها جذاب و کنجکاوی‌برانگیز باشن، نه خشک (مثلاً «چرا ۷۰٪ سایت‌ها مشتری رو فراری می‌دن؟» فقط اگه آمارش واقعی باشه؛ وگرنه «چرا بیشتر سایت‌ها مشتری رو فراری می‌دن؟»).
- حداقل ۳ لیست (هر آیتم یه خط که با «- » شروع بشه)، هر لیست ۳ تا ۷ آیتم.
- پاراگراف‌های کوتاه (۲ تا ۴ جمله). از کلمه‌های مرتبط و هم‌معنی (LSI) استفاده کن.

عکس‌ها:
- ${RULES.imagesMin} تا ${RULES.imagesMax} جای عکس توی متن بذار، هر کدوم توی یه خط جدا و بعد از یه پاراگراف مرتبط، با این فرمت دقیق: ![متن alt](IMAGE_1) ، ![متن alt](IMAGE_2) و...
- alt هر عکس فقط به فارسی (بدون کلمه‌ی انگلیسی، مگه اینکه خود کلمه‌ی کلیدی انگلیسی داشته باشه)، توصیف واقعی عکس باشه و کلمه‌ی کلیدی اصلی توش بیاد (مثلاً «طراحی سایت کافه روی موبایل مشتری»).
- برای هر عکس توی آرایه‌ی images یه آیتم با همون id، همون alt و یه عبارت جستجوی انگلیسی کوتاه برای پیدا کردن عکس استوک مناسب (search_query_en) بذار.

لینک‌سازی (هر دو نوع الزامیه):
- لینک داخلی: ${RULES.linksMin} تا ${RULES.linksMax} لینک (یا بیشتر اگه طبیعی بود) با انکرتکست توصیفی — حداقل ۲ لینک به صفحه‌های خدمات و اگه مقاله‌ی مرتبط هست ۱ تا ۲ لینک به مقاله‌های قبلی. فقط از آدرس‌های لیست، دقیقاً همون‌طور که نوشته شده.
- لینک خارجی: ${RULES.linksMin} تا ${RULES.linksMax} لینک به منابع معتبر و واقعی که مطمئنی صفحه‌شون وجود داره. فقط صفحه‌های پایدار و شناخته‌شده؛ ترجیحاً: developers.google.com/search/docs ، web.dev ، developer.mozilla.org ، fa.wikipedia.org ، schema.org ، w3.org ، support.google.com. آدرس کامل با https بنویس. به سایت رقبای طراحی سایت لینک نده. لینک‌های خراب خودکار حذف می‌شن، پس فقط آدرس‌هایی که مطمئنی.
- انکرتکست «اینجا کلیک کنید» ممنوع.
- توی related_post_slugs اسلاگ ۱ تا ۳ مقاله‌ی موجود که بیشترین ارتباط رو دارن بذار (فقط از لیست؛ اگه نیست، خالی).

فرمت content (یه مارک‌داون ساده؛ هر چیز دیگه خام نمایش داده می‌شه):
- تیتر: «## » و «### » (تیتر # ممنوع؛ عنوان جداست). بخش «## مطالب مرتبط» ننویس؛ خودکار اضافه می‌شه.
- لیست: هر آیتم یه خط که با «- » شروع بشه.
- لینک: [انکرتکست](آدرس)
- عکس: یه خط جدا ![alt](IMAGE_n)
- باکس دعوت به اقدام (CTA): یه خط جدا که با «>> » شروع بشه و آخرش یه لینک باشه که دکمه می‌شه؛ مثلاً «>> اگه وقت این کارها رو ندارید، تیم وب پیکاسو سایتتون رو حرفه‌ای طراحی می‌کنه. [ثبت سفارش](/order)».
- پاراگراف‌ها با یه خط خالی از هم جدا بشن.
- بولد (**)، ایتالیک، جدول، کد، نقل‌قول و HTML ممنوع.

صداقت:
- آمار، درصد، قیمت دقیق، اسم مشتری یا نقل‌قول ساختگی ننویس. اگه به قیمت اشاره می‌کنی، بگو به امکانات بستگی داره و به صفحه‌ی قیمت لینک بده.
- لحن: صمیمی، حرفه‌ای و مفید؛ فارسی روان و درست با نیم‌فاصله.

جهت‌گیری فروش (الزامی):
- وب پیکاسو سایت‌ساز یا ابزار آماده نمی‌فروشه؛ مقاله آموزشیه ولی خواننده رو به این سمت ببره که طراحی سایت یا سئو رو به وب پیکاسو بسپاره.
- ۳ تا ۴ باکس CTA در طول مقاله بذار: یکی بعد از بخش‌های اول، یکی وسط، یکی قبل از اشتباهات یا سوالات متداول، و یکی بعد از جمع‌بندی. هر کدوم متن متفاوت و مرتبط با همون بخش داشته باشه و به یکی از آدرس‌های لیست لینک بده (ترجیحاً /order ، /contact یا صفحه‌ی خدمت مرتبط).
- فقط خدمات و پیشنهادهای واقعی: طراحی سایت (اختصاصی، فروشگاهی، شرکتی، وردپرسی)، خدمات سئو، مشاوره‌ی رایگان و پشتیبانی بعد از تحویل. تخفیف، تضمین رتبه یا چیزی که وجود نداره رو وعده نده.`;

const OUTPUT_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  required: ["keyword", "skip_keywords", "title", "slug", "meta_description", "content", "images", "related_post_slugs"],
  properties: {
    keyword: { type: "string", description: "کلمه‌ی کلیدی اصلی انتخاب‌شده" },
    skip_keywords: { type: "array", items: { type: "string" } },
    title: { type: "string" },
    slug: { type: "string" },
    meta_description: { type: "string" },
    content: { type: "string" },
    images: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "alt", "search_query_en"],
        properties: { id: { type: "string" }, alt: { type: "string" }, search_query_en: { type: "string" } },
      },
    },
    related_post_slugs: { type: "array", items: { type: "string" } },
  },
};

type Article = {
  keyword: string;
  skip_keywords: string[];
  title: string;
  slug: string;
  meta_description: string;
  content: string;
  images: { id: string; alt: string; search_query_en: string }[];
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

یه کلمه‌ی کلیدی اصلی انتخاب کن و مقاله‌ی ${RULES.words} کلمه‌ای‌ش رو با همه‌ی قوانین بنویس.`;

  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: 48000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    thinking: { type: "adaptive" },
    // medium keeps a 2800-word article inside the 300s function limit
    output_config: { effort: "medium", format: { type: "json_schema", schema: OUTPUT_SCHEMA } },
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
// 3) Post-processing: safe content, checked links, images
// -----------------------------------------------------------------------

function normUrl(u: string): string {
  try {
    return decodeURIComponent(u).replace(/\/+$/, "");
  } catch {
    return u.replace(/\/+$/, "");
  }
}

const OWN_HOSTS = ["webpikaso.ir", "www.webpikaso.ir"];

/** Is this external page really there? (HEAD, then GET for servers that refuse HEAD) */
async function urlAlive(url: string): Promise<boolean> {
  for (const method of ["HEAD", "GET"] as const) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 7000);
    try {
      const res = await fetch(url, { method, redirect: "follow", signal: ctrl.signal, headers: { "User-Agent": "Mozilla/5.0 (compatible; WebPikasoLinkCheck/1.0)" } });
      if (res.ok) return true;
      if (method === "GET" || ![403, 405, 501].includes(res.status)) return false;
    } catch {
      if (method === "GET") return false;
    } finally {
      clearTimeout(timer);
    }
  }
  return false;
}

/** Internal links must point at real pages of this site; external links must
 *  be live https pages. Anything else becomes plain text. */
export async function sanitizeContent(
  content: string,
  allowed: Set<string>,
  check: (url: string) => Promise<boolean> = urlAlive
): Promise<{ content: string; internal: number; external: number }> {
  let out = content
    .replace(/\r\n/g, "\n")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/^#\s+.*$/gm, "") // H1 belongs to the page title
    .replace(/<[^>]+>/g, "");
  const rel = out.indexOf(RELATED_HEADING); // managed by code, never by the model
  if (rel >= 0) out = out.slice(0, rel);

  const linkRe = /(!?)\[([^\]]+)\]\(([^)\s]+)\)/g;
  const externals = new Map<string, boolean>();
  for (const m of Array.from(out.matchAll(linkRe))) {
    const url = m[3];
    if (m[1] || !/^https:\/\//i.test(url)) continue;
    try {
      if (!OWN_HOSTS.includes(new URL(url).hostname)) externals.set(url, false);
    } catch {}
  }
  await Promise.all(Array.from(externals.keys()).map(async (u) => externals.set(u, await check(u))));

  let internal = 0;
  let external = 0;
  out = out.replace(linkRe, (whole, bang: string, text: string, url: string) => {
    if (bang) return whole; // images are handled separately
    if (externals.get(url)) {
      external++;
      return `[${text}](${url})`;
    }
    let u = normUrl(url);
    try {
      const parsed = new URL(url);
      if (OWN_HOSTS.includes(parsed.hostname)) u = normUrl(parsed.pathname);
    } catch {}
    if (allowed.has(u)) {
      internal++;
      return `[${text}](${u})`;
    }
    return text;
  });
  return { content: out.replace(/\n{3,}/g, "\n\n").trim(), internal, external };
}

/** Replaces IMAGE_n markers with photos (or the placeholder), makes sure every
 *  alt carries the keyword, and adds slots after ## sections if the model left
 *  out some — so every article has 3–4 image spots. */
export async function placeImages(
  content: string,
  images: Article["images"],
  keyword: string,
  photo: (q: string) => Promise<string | null> = findPhoto
): Promise<{ content: string; count: number; cover: string | null }> {
  const altFor = (alt: string, n: number) => {
    let a = (alt || "").replace(/[\[\]()]/g, "").trim();
    // Persian only: an alt the model wrote in English is dropped for the fallback.
    if (a && !/[\u0600-\u06FF]/.test(a)) a = "";
    if (a && a.includes(keyword)) return a;
    return a ? `${keyword} — ${a}` : `${keyword} — تصویر ${n}`;
  };
  const meta = new Map(images.map((im) => [im.id.trim(), im]));
  let out = content;
  const used: string[] = [];
  out = out.replace(/!\[([^\]]*)\]\((IMAGE_\d+)\)/g, (_m, alt: string, id: string) => {
    if (used.length >= RULES.imagesMax) return "";
    used.push(id);
    return `![${altFor(alt || meta.get(id)?.alt || "", used.length)}](${id})`;
  });
  // Too few slots: add after ## headings' first paragraph, spread through the article.
  if (used.length < RULES.imagesMin) {
    const lines = out.split("\n");
    const h2 = lines.map((l, i) => (l.startsWith("## ") && !l.startsWith(RELATED_HEADING) ? i : -1)).filter((i) => i >= 0);
    const spots = h2.filter((_, i) => i % 2 === 0);
    let added = 0;
    for (const at of spots.reverse()) {
      if (used.length + added >= RULES.imagesMin) break;
      // after the first paragraph under the heading
      let j = at + 1;
      while (j < lines.length && lines[j].trim() === "") j++;
      while (j < lines.length && lines[j].trim() !== "") j++;
      const id = `IMAGE_X${added + 1}`;
      lines.splice(j, 0, "", `![${altFor(lines[at].replace(/^##\s+/, ""), used.length + added + 1)}](${id})`);
      added++;
    }
    out = lines.join("\n");
  }
  // Resolve markers to photo URLs.
  const ids = Array.from(out.matchAll(/!\[[^\]]*\]\((IMAGE_[X\d]+)\)/g)).map((m) => m[1]);
  let cover: string | null = null;
  for (const id of ids) {
    const q = meta.get(id)?.search_query_en || "website design";
    const url = (await photo(q)) ?? IMAGE_PLACEHOLDER;
    if (!cover && url !== IMAGE_PLACEHOLDER) cover = url;
    out = out.replace(`(${id})`, `(${url})`);
  }
  return { content: out.replace(/\n{3,}/g, "\n\n").trim(), count: ids.length, cover };
}

function plainText(content: string): string {
  return content
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{2,6}\s+/gm, "")
    .replace(/^-\s+/gm, "")
    .replace(/^>>\s+/gm, "");
}

const normFa = (s: string) => s.replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/‌/g, " ").replace(/\s+/g, " ").trim();

/** Word count, keyword density (%), and how many times the keyword appears. */
export function measure(content: string, keyword: string): { words: number; density: number; hits: number } {
  const text = normFa(plainText(content));
  const words = text.split(" ").filter(Boolean).length;
  const kw = normFa(keyword);
  const hits = kw ? text.split(kw).length - 1 : 0;
  const kwWords = kw.split(" ").length;
  return { words, hits, density: words ? Math.round(((hits * kwWords) / words) * 1000) / 10 : 0 };
}

export function countLists(content: string): number {
  let n = 0;
  let inList = false;
  for (const line of content.split("\n")) {
    const item = /^-\s+/.test(line);
    if (item && !inList && !line.match(/^-\s+\[[^\]]+\]\(\/blog\//)) n++;
    inList = item;
  }
  return n;
}

/** Keyword first, a number in it — fixed in code if the model slipped. */
export function fixTitle(title: string, keyword: string): string {
  let t = title.replace(/\s+/g, " ").trim();
  // Prepend rather than cut the keyword out of the middle, which breaks the sentence.
  if (!normFa(t).startsWith(normFa(keyword))) t = `${keyword}: ${t}`;
  if (!/[0-9۰-۹]/.test(t)) t = `${t} در ۱۴۰۵`;
  return t.slice(0, 120);
}

export function fixMeta(meta: string, keyword: string): string {
  let m = meta.replace(/\s+/g, " ").trim();
  if (!normFa(m).startsWith(normFa(keyword))) m = `${keyword}؛ ${m}`;
  if (m.length > RULES.metaMax) {
    const cut = m.slice(0, RULES.metaMax - 1);
    m = cut.slice(0, Math.max(cut.lastIndexOf(" "), RULES.metaMin - 10)).trim() + "…";
  }
  return m;
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

export type SeoMetrics = { words: number; density: number; internal: number; external: number; images: number; lists: number };

export type SeoRunResult =
  | { ok: true; skipped?: false; postId: number; slug: string; title: string; keyword: string; linked: number; metrics: SeoMetrics }
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
    const linked = await sanitizeContent(article.content, allowed);
    const withImages = await placeImages(linked.content, article.images ?? [], keyword);
    const body = withImages.content;
    const m = measure(body, keyword);
    if (m.words < RULES.minWords) throw new Error(`مقاله کوتاه بود (${m.words} کلمه)؛ منتشر نشد`);

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
    const title = fixTitle(article.title, keyword);
    const content = upsertRelated(body, related.map((p) => ({ title: p.title, url: `/blog/${p.slug}` })));
    const postId = await createBlogPost({
      title,
      slug,
      excerpt: fixMeta(article.meta_description, keyword),
      content,
      coverImage: withImages.cover ?? undefined,
      published: true,
    });

    // Backlinks: each related older post gets a link to the new one.
    for (const p of related) {
      await setBlogPostContent(p.id, upsertRelated(p.content, [{ title, url: `/blog/${slug}` }]));
    }

    if (candidates.includes(keyword)) await setSeoKeywordStatus(keyword, "used", postId);
    else await addSeoKeywords([{ keyword, seed: "ai" }]).then(() => setSeoKeywordStatus(keyword!, "used", postId));
    for (const s of article.skip_keywords) if (candidates.includes(s) && s !== keyword) await setSeoKeywordStatus(s, "skipped");

    const metrics: SeoMetrics = {
      words: m.words,
      density: m.density,
      internal: linked.internal + related.length,
      external: linked.external,
      images: withImages.count,
      lists: countLists(body),
    };
    await updateSeoSettings({ last_run_at: new Date().toISOString().slice(0, 19).replace("T", " ") });
    await logSeoRun({ trigger, ok: true, keyword, post_id: postId, post_slug: slug, post_title: title, linked_post_ids: related.map((p) => p.id), error: null, metrics });
    return { ok: true, postId, slug, title, keyword, linked: related.length, metrics };
  } catch (e) {
    const error = e instanceof Anthropic.APIError ? `خطای API (${e.status}): ${e.message}` : e instanceof Error ? e.message : String(e);
    await logSeoRun({ trigger, ok: false, keyword, post_id: null, post_slug: null, post_title: null, linked_post_ids: [], error }).catch(() => {});
    return { ok: false, error };
  } finally {
    await releaseSeoRunLock().catch(() => {});
  }
}
