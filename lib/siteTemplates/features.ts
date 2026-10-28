// Client-safe (no DB, no template HTML): the optional "قابلیت‌ها" an admin can
// switch on for a site built from a template — online ordering, table
// booking, a QR menu, a management panel, appointments...
//
// Features are NOT baked into each template. They are a shared add-on that is
// injected into the page when /preview/<token> is served (and into the
// downloaded .html), so every café / restaurant / clinic template — old and
// new — supports them without touching its HTML. Switching one on or off
// takes effect on the same link, no rebuild.

export type FeatureId = "order" | "reserve" | "qrmenu" | "appointment" | "callback" | "panel";

export type FeatureDef = {
  id: FeatureId;
  label: string;
  icon: string;
  /** one short sentence shown under the switch */
  desc: string;
  /** limit to some trades of the group (all trades of the group when omitted) */
  trades?: string[];
};

export type FeatureGroup = {
  id: "food" | "clinic";
  label: string;
  tradeIds: string[];
  features: FeatureDef[];
};

const PANEL: FeatureDef = {
  id: "panel",
  label: "پنل مدیریت",
  icon: "🛠️",
  desc: "پنل جدا با رمز برای صاحب کسب‌وکار: دیدن سفارش‌ها و درخواست‌ها، تغییر وضعیت، ویرایش منو.",
};

export const FEATURE_GROUPS: FeatureGroup[] = [
  {
    id: "food",
    label: "کافه و رستوران",
    tradeIds: ["cafe", "restaurant", "garden", "kebab", "fastfood", "bakery", "pastry", "icecream"],
    features: [
      {
        id: "order",
        label: "سفارش آنلاین",
        icon: "🛒",
        desc: "مشتری از روی منو سبد می‌سازه و سفارش (ارسال / تحویل حضوری / سر میز) ثبت می‌کنه.",
      },
      {
        id: "reserve",
        label: "رزرو میز",
        icon: "📅",
        desc: "فرم رزرو با تاریخ، ساعت و تعداد نفرات.",
        trades: ["cafe", "restaurant", "garden", "kebab"],
      },
      {
        id: "qrmenu",
        label: "منوی QR (بارکد)",
        icon: "📱",
        desc: "یک صفحه‌ی منوی موبایلی + بارکد قابل‌چاپ برای روی میز؛ با اسکن باز می‌شه.",
      },
      PANEL,
    ],
  },
  {
    id: "clinic",
    label: "کلینیک و مطب",
    tradeIds: ["clinic", "dental"],
    features: [
      {
        id: "appointment",
        label: "نوبت‌دهی آنلاین",
        icon: "🩺",
        desc: "فرم رزرو نوبت با خدمت / پزشک، تاریخ و ساعت دلخواه.",
      },
      {
        id: "callback",
        label: "درخواست تماس / مشاوره",
        icon: "📞",
        desc: "بیمار شماره‌ش رو می‌ذاره و کلینیک بهش زنگ می‌زنه.",
      },
      PANEL,
    ],
  },
];

export const FEATURE_LABELS: Record<FeatureId, string> = {
  order: "سفارش آنلاین",
  reserve: "رزرو میز",
  qrmenu: "منوی QR",
  appointment: "نوبت‌دهی آنلاین",
  callback: "درخواست تماس",
  panel: "پنل مدیریت",
};

/** Features that produce requests the owner has to see somewhere. */
const NEEDS_PANEL: FeatureId[] = ["order", "reserve", "appointment", "callback"];

export function featureGroupFor(tradeId?: string | null): FeatureGroup | null {
  return FEATURE_GROUPS.find((g) => !!tradeId && g.tradeIds.includes(tradeId)) ?? null;
}

/** The switches available for a trade (empty = the trade has no features). */
export function featuresForTrade(tradeId?: string | null): FeatureDef[] {
  const g = featureGroupFor(tradeId);
  if (!g) return [];
  return g.features.filter((f) => !f.trades || (!!tradeId && f.trades.includes(tradeId)));
}

/** Keeps only features the trade offers; the panel is switched on automatically
 *  whenever something that creates requests is on (otherwise nobody could read them). */
export function sanitizeFeatures(tradeId: string | null | undefined, input: unknown): FeatureId[] {
  const allowed = new Set(featuresForTrade(tradeId).map((f) => f.id));
  const asked = Array.isArray(input) ? input.filter((v): v is FeatureId => typeof v === "string" && allowed.has(v as FeatureId)) : [];
  const set = new Set<FeatureId>(asked);
  if (NEEDS_PANEL.some((f) => set.has(f)) && allowed.has("panel")) set.add("panel");
  // keep the display order of the definition
  return featuresForTrade(tradeId)
    .map((f) => f.id)
    .filter((id) => set.has(id));
}

export function hasFeature(features: readonly string[] | undefined | null, id: FeatureId): boolean {
  return !!features && features.includes(id);
}

/** Does this feature set need the site's menu data (order / QR menu)? */
export function needsMenu(features: readonly string[] | undefined | null): boolean {
  return hasFeature(features, "order") || hasFeature(features, "qrmenu");
}
