import type { ImageSlot, SiteTemplate } from "./generate";
import cafeAdra from "./templates/cafe-adra.template.html";
import cafeSara from "./templates/cafe-sara.template.html";
import fastfoodSimen from "./templates/fastfood-simen.template.html";
import carpetMatin from "./templates/carpet-matin.template.html";
import travelPargar from "./templates/travel-pargar.template.html";
import gymPulad from "./templates/gym-pulad.template.html";
import upholsteryFarshad from "./templates/upholstery-farshad.template.html";
import movingKarvan from "./templates/moving-karvan.template.html";
import fashionRococo from "./templates/fashion-rococo.template.html";
import lawParsa from "./templates/law-parsa.template.html";
import languageZabankadeh from "./templates/language-zabankadeh.template.html";
import jewelryZarafshan from "./templates/jewelry-zarafshan.template.html";
import watchSaatkade from "./templates/watch-saatkade.template.html";
import cosmeticsGolgoon from "./templates/cosmetics-golgoon.template.html";
import icecreamShahd from "./templates/icecream-shahd.template.html";
import pastryZafaran from "./templates/pastry-zafaran.template.html";
import musicNava from "./templates/music-nava.template.html";
import realestateZomorod from "./templates/realestate-zomorod.template.html";
import kebabBistoon from "./templates/kebab-bistoon.template.html";
import restaurantEmber from "./templates/restaurant-ember.template.html";
import dentalNora from "./templates/dental-nora.template.html";
import restaurantMadaen from "./templates/restaurant-madaen.template.html";
import gardenWillow from "./templates/garden-willow.template.html";
import gardenGilas from "./templates/garden-gilas.template.html";


// ---------------------------------------------------------------------------
// Template registry. To add a template: put the HTML in ./templates as
// `<name>.template.html` (placeholder syntax: see generate.ts and
// EXAMPLE.template.html), import it here and add an entry.
//  - `trade` must match an id in ./trades.ts
//  - `palette` = the template's OWN signature colors. With no color chosen the
//    template keeps its look; a chosen color re-themes the matching hue family.
//    (Templates that derive everything from {{c:...}} expressions, like
//    cafe-adra, take the trade's default palette instead and need no `palette`.)
// ---------------------------------------------------------------------------

export const TEMPLATES: SiteTemplate[] = [
  {
    id: "cafe-adra",
    trade: "cafe",
    label: "کافه — رنگارنگ و شاد",
    html: cafeAdra,
  },
  {
    id: "cafe-sara",
    trade: "cafe",
    label: "کافه — گرم و دنج (سارا)",
    html: cafeSara,
    palette: { primary: "#d9673f", secondary: "#1f5451" },
  },
  {
    id: "fastfood-simen",
    trade: "fastfood",
    label: "فست‌فود — آتشین و پرانرژی",
    html: fastfoodSimen,
    images: [
      { key: "about", label: "عکس درباره‌ی ما", hint: "پیتزا یا غذای شاخص. اگه چیزی آپلود نکنی همون عکس نمونه نمایش داده می‌شه", ratio: "4:5" },
    ],
    palette: { primary: "#e63329", secondary: "#f5a623" },
  },
  {
    id: "carpet-matin",
    trade: "carpet",
    label: "فرش‌فروشی — شرابی و طلایی",
    html: carpetMatin,
    palette: { primary: "#6E1423", secondary: "#C39A4B" },
  },
  {
    id: "travel-pargar",
    trade: "travel",
    label: "آژانس مسافرتی — سرمه‌ای و طلایی",
    html: travelPargar,
    palette: { primary: "#1B4A66", secondary: "#E3A857" },
  },
  {
    id: "gym-pulad",
    trade: "gym",
    label: "باشگاه — تیره و پرانرژی",
    html: gymPulad,
    palette: { primary: "#ff4419", secondary: "#d7ff4a" },
  },
  {
    id: "upholstery-farshad",
    trade: "upholstery",
    label: "مبل‌شویی — سرمه‌ای و طلایی",
    html: upholsteryFarshad,
    palette: { primary: "#0A2540", secondary: "#C9A227" },
  },
  {
    id: "moving-karvan",
    trade: "moving",
    label: "باربری — زرد و نارنجی",
    html: movingKarvan,
    palette: { primary: "#FFC530", secondary: "#FF5A2A" },
  },
  {
    id: "fashion-rococo",
    trade: "fashion",
    label: "لباس مردانه — سبز و طلایی",
    html: fashionRococo,
    palette: { primary: "#1e5b3f", secondary: "#c6a35f" },
  },
  {
    id: "law-parsa",
    trade: "law",
    label: "دفتر وکالت — کلاسیک",
    html: lawParsa,
    palette: { primary: "#b8925a", secondary: "#16263d" },
  },
  {
    id: "language-zabankadeh",
    trade: "language",
    label: "آموزشگاه زبان — پستی و گرم",
    html: languageZabankadeh,
    palette: { primary: "#E8A33D", secondary: "#1B2A4A" },
  },
  {
    id: "jewelry-zarafshan",
    trade: "jewelry",
    label: "طلافروشی — مخملی و طلایی",
    html: jewelryZarafshan,
    palette: { primary: "#c9a13b", secondary: "#2a1014" },
  },
  {
    id: "watch-saatkade",
    trade: "watch",
    label: "ساعت‌فروشی — لوکس تیره",
    html: watchSaatkade,
    palette: { primary: "#c9a24b", secondary: "#7a2e3a" },
  },
  {
    id: "cosmetics-golgoon",
    trade: "cosmetics",
    label: "لوازم آرایشی — رز و طلایی",
    html: cosmeticsGolgoon,
    palette: { primary: "#C6455B", secondary: "#C9A15A" },
  },
  {
    id: "icecream-shahd",
    trade: "icecream",
    label: "بستنی و آبمیوه — شاد و میوه‌ای",
    html: icecreamShahd,
    palette: { primary: "#FF4D6D", secondary: "#FF8A3D" },
  },
  {
    id: "pastry-zafaran",
    trade: "pastry",
    label: "شیرینی‌فروشی — سنتی و طلایی",
    html: pastryZafaran,
    palette: { primary: "#C6942F", secondary: "#4A2020" },
  },
  {
    id: "music-nava",
    trade: "music",
    label: "آموزشگاه موسیقی — شرابی و طلایی",
    html: musicNava,
    palette: { primary: "#742642", secondary: "#cf9c4f" },
  },
  {
    id: "realestate-zomorod",
    trade: "realestate",
    label: "املاک — زمردی و طلایی",
    html: realestateZomorod,
    palette: { primary: "#155c42", secondary: "#c9a227" },
  },
  {
    id: "dental-nora",
    trade: "dental",
    label: "دندانپزشکی — سینمایی و تعاملی",
    html: dentalNora,
    palette: { primary: "#0F766E" },
  },
  {
    id: "restaurant-ember",
    trade: "restaurant",
    label: "رستوران — مدرن و رنگارنگ",
    html: restaurantEmber,
    palette: { primary: "#e4572e", secondary: "#1f6f5c" },
    images: [
      { key: "hero", label: "غذای شاخص (بالای صفحه)", hint: "قاب گرد بزرگ بالای صفحه — بهترین غذای رستوران، نمای نزدیک", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "قاب قوسی بخش درباره — آشپزخانه، سرآشپز یا نمای اصلی رستوران", ratio: "4:5" },
      { key: "dish1", label: "پیشنهاد سرآشپز ۱", hint: "کارت اول بخش پیشنهاد سرآشپز — نمای نزدیک غذا", ratio: "4:5" },
      { key: "dish2", label: "پیشنهاد سرآشپز ۲", hint: "کارت دوم بخش پیشنهاد سرآشپز", ratio: "4:5" },
      { key: "dish3", label: "پیشنهاد سرآشپز ۳", hint: "کارت سوم بخش پیشنهاد سرآشپز", ratio: "4:5" },
      { key: "env1", label: "فضا — سالن اصلی", hint: "قاب بزرگ گالری فضای رستوران", ratio: "1:1" },
      { key: "env2", label: "فضا — گوشه‌ی دنج", hint: "گالری فضای رستوران", ratio: "4:5" },
      { key: "env3", label: "فضا — نور و جزئیات", hint: "گالری فضای رستوران", ratio: "4:5" },
      { key: "env4", label: "فضا — میز و چیدمان", hint: "گالری فضای رستوران", ratio: "4:5" },
      { key: "env5", label: "فضا — پذیرایی", hint: "گالری فضای رستوران", ratio: "4:5" },
    ],
  },
  {
    id: "restaurant-madaen",
    trade: "restaurant",
    label: "رستوران — شرقی و برنجی (مدائن)",
    html: restaurantMadaen,
    images: [
      { key: "hall", label: "سالن اصلی", hint: "نمای اصلی بالای صفحه و گالری — یک عکس عمودی از سالن", ratio: "4:5" },
      { key: "dish", label: "غذای شاخص", hint: "بخش «غذای ویژه» — نمای نزدیک از بهترین غذای منو", ratio: "1:1" },
      { key: "table", label: "سالن دورهمی", hint: "گالری — میز بلند یا سالن پذیرایی گروهی", ratio: "4:5" },
      { key: "entrance", label: "ورودی", hint: "بخش درباره‌ما و گالری — در یا نمای ورودی", ratio: "3:4" },
      { key: "lounge", label: "سالن دوم", hint: "دایره‌ی کوچک بخش درباره‌ما و گالری", ratio: "1:1" },
    ],
    palette: { primary: "#8c1d36", secondary: "#c9a24f" },
  },
  {
    id: "kebab-bistoon",
    trade: "kebab",
    label: "کبابی — قرمز و شاد (بیستون)",
    html: kebabBistoon,
    palette: { primary: "#c8102e", secondary: "#2a1233" },
  },
  {
    id: "garden-willow",
    trade: "garden",
    label: "باغ رستوران — فانوس و سبز (بید مجنون)",
    html: gardenWillow,
    images: [
      { key: "about_main", label: "عکس اصلی درباره‌ی ما", hint: "بخش «درباره»، قاب بزرگ — فضای کلی باغ", ratio: "4:5" },
      { key: "about_small", label: "عکس کوچک درباره‌ی ما", hint: "بخش «درباره»، قاب کوچک — یک جزئیات جذاب", ratio: "1:1" },
      { key: "yard", label: "گالری — حیاط باغ", hint: "قاب بلند و بزرگ گالری", ratio: "3:4" },
      { key: "night", label: "گالری — حیاط در شب", hint: "نورپردازی شب", ratio: "4:3" },
      { key: "entrance", label: "گالری — ورودی و فانوس", hint: "ورودی یا فانوس‌ها", ratio: "4:3" },
      { key: "tables", label: "گالری — میزها", hint: "چیدمان میز و صندلی", ratio: "4:3" },
      { key: "roof", label: "گالری — سقف و نورپردازی", hint: "پرگولا یا سقف", ratio: "4:3" },
    ],
    palette: { primary: "#f2a63b", secondary: "#1f3d2b" },
  },
  {
    id: "garden-gilas",
    trade: "garden",
    label: "باغ رستوران — شب‌نشینی (گیلاس)",
    html: gardenGilas,
    palette: { primary: "#b01535", secondary: "#12392a" },
  },
];

export function templatesForTrade(tradeId: string): SiteTemplate[] {
  return TEMPLATES.filter((t) => t.trade === tradeId);
}

/** A specific template, or a random one of the trade when none is chosen. */
export function pickTemplate(tradeId: string, templateId?: string): SiteTemplate | null {
  const list = templatesForTrade(tradeId);
  if (list.length === 0) return null;
  if (templateId) return list.find((t) => t.id === templateId) ?? null;
  return list[Math.floor(Math.random() * list.length)];
}

/** A random template out of all templates of the given trades. */
export function pickTemplateAmong(tradeIds: string[]): SiteTemplate | null {
  const list = TEMPLATES.filter((t) => tradeIds.includes(t.trade));
  if (list.length === 0) return null;
  return list[Math.floor(Math.random() * list.length)];
}

/** Which template a private site came from. Sites built before the template id
 *  was stored are recognised by the «label» their note always contains. */
export function templateIdOfSite(site: { template_id?: string; note?: string }): string | undefined {
  if (site.template_id) return site.template_id;
  const label = site.note?.match(/«([^»]+)»/)?.[1];
  return label ? TEMPLATES.find((tpl) => tpl.label === label)?.id : undefined;
}

/** The photo spots of a template (empty when it needs none). */
export function imageSlotsFor(templateId?: string | null): ImageSlot[] {
  return TEMPLATES.find((t) => t.id === templateId)?.images ?? [];
}

/** Metadata only (safe to hand to a client component). */
export function templateOptions() {
  return TEMPLATES.map((t) => ({
    id: t.id,
    trade: t.trade,
    label: t.label,
    primary: t.palette?.primary ?? null,
    secondary: t.palette?.secondary ?? null,
  }));
}
