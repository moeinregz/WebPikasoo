// The ONE menu format shared by every café / restaurant template that has an
// editable menu. Templates convert it to whatever markup they like; the
// «سایت‌های خصوصی» editor reads and writes exactly this shape.
//
// Pure (no server-only imports) so the editor and the server both use it.

export type MenuItem = {
  name: string;
  desc?: string;
  /** Shown as typed (e.g. «۱۲۰,۰۰۰ تومان») — we never parse prices. */
  price?: string;
  emoji?: string;
  /** https URL of an uploaded photo (a data: URI only inside a downloaded file). */
  image?: string;
  /** Small label such as «پیشنهاد سرآشپز» / «محبوب». */
  badge?: string;
};

export type MenuCategory = {
  title: string;
  emoji?: string;
  items: MenuItem[];
};

export const MENU_LIMITS = {
  categories: 24,
  itemsPerCategory: 80,
  title: 60,
  name: 80,
  desc: 220,
  price: 40,
  emoji: 16,
  badge: 24,
};

// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u2028\u2029]/g;
const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(CONTROL, "").replace(/\s+/g, " ").trim().slice(0, max) : "";

const isHttps = (u: string) => /^https:\/\/[^\s"'<>\\]+$/.test(u) && u.length <= 600;

export type MenuCheck = { ok: true; menu: MenuCategory[] } | { ok: false; message: string };

/** Validates + normalises whatever the editor (or a stored document) hands us.
 *  Never trusts its input: strings are trimmed and capped, unknown fields are
 *  dropped, and photos must be plain https URLs. */
export function sanitizeMenu(input: unknown, opts: { allowData?: boolean } = {}): MenuCheck {
  if (!Array.isArray(input)) return { ok: false, message: "ساختار منو معتبر نیست." };
  if (input.length === 0) return { ok: false, message: "منو باید حداقل یک دسته داشته باشه." };
  if (input.length > MENU_LIMITS.categories) {
    return { ok: false, message: `حداکثر ${MENU_LIMITS.categories} دسته مجازه.` };
  }

  const menu: MenuCategory[] = [];
  let total = 0;
  for (const rawCat of input) {
    if (!rawCat || typeof rawCat !== "object") return { ok: false, message: "ساختار یکی از دسته‌ها معتبر نیست." };
    const c = rawCat as Record<string, unknown>;
    const title = clean(c.title, MENU_LIMITS.title);
    if (!title) return { ok: false, message: "هر دسته باید یک عنوان داشته باشه." };
    const rawItems = Array.isArray(c.items) ? c.items : [];
    if (rawItems.length > MENU_LIMITS.itemsPerCategory) {
      return { ok: false, message: `«${title}» بیشتر از ${MENU_LIMITS.itemsPerCategory} مورد داره.` };
    }
    const items: MenuItem[] = [];
    for (const rawItem of rawItems) {
      if (!rawItem || typeof rawItem !== "object") continue;
      const it = rawItem as Record<string, unknown>;
      const name = clean(it.name, MENU_LIMITS.name);
      if (!name) return { ok: false, message: `یکی از موردهای «${title}» اسم نداره.` };
      const image = typeof it.image === "string" ? it.image.trim() : "";
      const okData = !!opts.allowData && /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(image);
      if (image && !isHttps(image) && !okData) return { ok: false, message: `عکس «${name}» معتبر نیست.` };
      const item: MenuItem = { name };
      const desc = clean(it.desc, MENU_LIMITS.desc);
      const price = clean(it.price, MENU_LIMITS.price);
      const emoji = clean(it.emoji, MENU_LIMITS.emoji);
      const badge = clean(it.badge, MENU_LIMITS.badge);
      if (desc) item.desc = desc;
      if (price) item.price = price;
      if (emoji) item.emoji = emoji;
      if (badge) item.badge = badge;
      if (image) item.image = image;
      items.push(item);
    }
    total += items.length;
    const cat: MenuCategory = { title, items };
    const emoji = clean(c.emoji, MENU_LIMITS.emoji);
    if (emoji) cat.emoji = emoji;
    menu.push(cat);
  }
  if (total === 0) return { ok: false, message: "منو باید حداقل یک مورد داشته باشه." };
  return { ok: true, menu };
}

/** Every uploaded photo URL a menu references (to delete the ones that were removed). */
export function menuImages(menu: MenuCategory[] | undefined | null): string[] {
  const out: string[] = [];
  for (const c of menu ?? []) for (const i of c.items) if (i.image) out.push(i.image);
  return out;
}
