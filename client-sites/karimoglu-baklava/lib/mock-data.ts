import type {
  BranchSummary,
  CategoryShowcaseItem,
  ProductDetail,
  ProductSummary,
  SaleTypeGroup,
} from "./types";
import { suggestSlug } from "./seo/productSlugs";
import { RAW_MENU_ITEMS, type RawMenuItem } from "./menuProductsData";

/**
 * ⚠️ داده شعب زیر برگرفته از اطلاعات واقعی کسب‌وکار (Prompt 1) است —
 * نام، تلفن و ساعت کاری صحیح‌اند. فیلدهای آدرس و مختصات عمداً `null` هستند
 * چون هنوز TODO محسوب می‌شوند (طبق Blueprint، بخش 30) و نباید حدس زده شوند.
 * پیش از استقرار (Deploy) نهایی، این آرایه باید با فراخوانی واقعی API
 * (`GET /api/v1/branches`) جایگزین شود.
 */
export const branches: BranchSummary[] = [
  {
    id: "satarkhan",
    slug: "satarkhan",
    name: "ستارخان",
    city: "تهران",
    // اطلاعات واقعی دریافت‌شده از مجموعه
    shortArea: "توحید، ستارخان، بین کوثر یک و دو، پلاک ۶۲",
    phone: "02166909305",
    openingHours: "۰۸:۰۰ تا ۲۴:۰۰",
    hasCafeService: true,
    hasPos: false,
    supportsCashOnDelivery: false,
    // مختصات واقعی (اعلام‌شده توسط کسب‌وکار)
    coordinates: { lat: 35.707522848391676, lng: 51.375353343799986 },
    acceptsOnlineOrders: true,
    serviceRadiusKm: null,
    supportedDeliveryMethods: ["express", "same-day"],
    status: "active",
  },
  {
    id: "ariashahr",
    slug: "ariashahr",
    name: "آریاشهر",
    city: "تهران",
    shortArea: "چهارراه خسرو شمالی، جنب تره‌بار صادقیه",
    phone: "02144204940",
    openingHours: "۰۸:۰۰ تا ۲۴:۰۰",
    hasCafeService: true,
    hasPos: false,
    supportsCashOnDelivery: false,
    // مختصات واقعی (اعلام‌شده توسط کسب‌وکار)
    coordinates: { lat: 35.721900305922844, lng: 51.347495725159206 },
    acceptsOnlineOrders: true,
    serviceRadiusKm: null,
    supportedDeliveryMethods: ["express", "same-day"],
    status: "active",
  },
  {
    id: "kourosh-mall",
    slug: "kourosh-mall",
    name: "کوروش مال",
    city: "تهران",
    shortArea: "ستاری شمال، کوروش مال، محیط پیرامونی، پلاک ۷",
    phone: "02144971127",
    openingHours: "۰۸:۰۰ تا ۲۴:۰۰",
    hasCafeService: true,
    hasPos: false,
    supportsCashOnDelivery: false,
    // مختصات واقعی (اعلام‌شده توسط کسب‌وکار)
    coordinates: { lat: 35.73833815934255, lng: 51.31340497179829 },
    acceptsOnlineOrders: true,
    serviceRadiusKm: null,
    supportedDeliveryMethods: ["express", "same-day"],
    status: "active",
  },
  {
    id: "tajrish",
    slug: "tajrish",
    name: "تجریش",
    city: "تهران",
    shortArea: "خیابان شهرداری، کوچه حدادی، روبروی مترو، پلاک ۱۱۶",
    phone: "02122730801",
    openingHours: "۰۸:۰۰ تا ۲۴:۰۰",
    hasCafeService: true,
    hasPos: false,
    // اطلاعات جدید: تجریش فعلاً تنها شعبه با «پرداخت درب منزل» است
    supportsCashOnDelivery: true,
    // مختصات واقعی (اعلام‌شده توسط کسب‌وکار)
    coordinates: { lat: 35.805434774305354, lng: 51.432041605515366 },
    acceptsOnlineOrders: true,
    serviceRadiusKm: null,
    supportedDeliveryMethods: ["express", "same-day"],
    status: "active",
  },
  {
    id: "piroozi",
    slug: "piroozi",
    name: "پیروزی",
    city: "تهران",
    // TODO: آدرس دقیق شعبه پیروزی هنوز اعلام نشده — حدس زده نشود
    shortArea: null,
    phone: "02133050018",
    openingHours: "۰۸:۰۰ تا ۲۴:۰۰",
    hasCafeService: true,
    hasPos: false,
    supportsCashOnDelivery: false,
    coordinates: null,
    // فروش آنلاین فعلاً فقط از ۴ شعبه ستارخان، آریاشهر، تجریش و کوروش مال انجام می‌شود
    acceptsOnlineOrders: false,
    serviceRadiusKm: null,
    supportedDeliveryMethods: ["express", "same-day"],
    status: "active",
  },
  {
    id: "hamedan",
    slug: "hamedan",
    name: "همدان",
    city: "همدان",
    // TODO: آدرس دقیق شعبه همدان هنوز اعلام نشده — حدس زده نشود
    shortArea: null,
    // TODO: تلفن شعبه همدان هنوز اعلام نشده (Blueprint بخش 30)
    phone: null,
    openingHours: "۰۸:۰۰ تا ۲۴:۰۰",
    hasCafeService: true,
    hasPos: false,
    supportsCashOnDelivery: false,
    coordinates: null,
    // فروش آنلاین فعلاً فقط از ۴ شعبه ستارخان، آریاشهر، تجریش و کوروش مال انجام می‌شود
    acceptsOnlineOrders: false,
    serviceRadiusKm: null,
    supportedDeliveryMethods: ["express", "same-day"],
    status: "active",
  },
];

/**
 * توضیح هر دسته (description/intro/metaDescription) کپی‌رایتی کوتاه و عمومی
 * بر پایه حقایق تأییدشده (نام دسته، ماهیت کلی محصول طبق Blueprint) است —
 * نه محتوای تخصصی/تاریخی بازاریابی که هنوز از سوی کارفرما تایید نشده.
 * پیش از انتشار نهایی، این متن‌ها باید توسط تیم محتوای برند بازبینی شوند.
 */
const ALL_CATEGORIES: CategoryShowcaseItem[] = [
  {
    id: "baklava",
    label: "باقلوا",
    description: "طعم اصیل و سنتی",
    intro: "باقلوای کریم‌اوغلو با ترکیب پسته/گردو، به‌صورت کیلویی یا اسلایسی، طبق منوی واقعی مجموعه.",
    metaDescription: "خرید آنلاین باقلوا از باقلوا کریم‌اوغلو — ارسال فوری و همان‌روز در تهران و همدان.",
  },
  {
    id: "arabic-baklava",
    label: "باقلوا عربی",
    description: "طعم و بافتی متفاوت",
    intro: "باقلوا عربی با بافتی متفاوت از باقلوای سنتی، به‌صورت کیلویی یا تک‌اسلایس، طبق منوی واقعی مجموعه.",
    metaDescription: "خرید باقلوا عربی آنلاین — باقلوا کریم‌اوغلو، تهران و همدان.",
  },
  {
    id: "kunafa",
    label: "کنافه",
    description: "با شهد عسل و زعفران",
    intro: "کنافه پنیری یا نوتلایی، با شهد عسل و زعفران، طبق منوی واقعی مجموعه.",
    metaDescription: "خرید آنلاین کنافه از باقلوا کریم‌اوغلو.",
  },
  {
    id: "mix",
    label: "معجون",
    description: "ترکیب مخصوص کریم‌اوغلو",
    intro: "معجون باقلوا مخصوص کریم‌اوغلو، در اندازه‌های یک‌نفره تا چهار نفره.",
    metaDescription: "خرید آنلاین معجون باقلوا از باقلوا کریم‌اوغلو.",
  },
  {
    id: "dessert",
    label: "دسر",
    description: "دسرهای متنوع",
    intro: "انواع دسر، طبق منوی واقعی مجموعه.",
    metaDescription: "خرید آنلاین انواع دسر از باقلوا کریم‌اوغلو.",
  },
  {
    id: "drinks",
    label: "نوشیدنی",
    description: "گرم و سرد",
    intro: "انواع نوشیدنی گرم و سرد، طبق منوی واقعی مجموعه.",
    metaDescription: "سفارش آنلاین نوشیدنی از باقلوا کریم‌اوغلو.",
  },
  {
    id: "pizza",
    label: "پیتزا",
    description: "فقط شعبه تجریش — سه سایز",
    intro: "منوی پیتزا فقط در شعبه تجریش ارائه می‌شود؛ در سه سایز یک‌نفره، دونفره و خانواده.",
    metaDescription: "سفارش آنلاین پیتزا از شعبه تجریش باقلوا کریم‌اوغلو.",
  },
  {
    id: "sandwich",
    label: "ساندویچ و برگر",
    description: "فقط شعبه تجریش",
    intro: "منوی ساندویچ و برگر (گوشت گوساله) فقط در شعبه تجریش ارائه می‌شود.",
    metaDescription: "سفارش آنلاین ساندویچ و برگر از شعبه تجریش باقلوا کریم‌اوغلو.",
  },
  {
    id: "sides-pasta",
    label: "سیب‌زمینی، سوخاری و پاستا",
    description: "فقط شعبه تجریش",
    intro: "منوی سیب‌زمینی، سوخاری و پاستا فقط در شعبه تجریش ارائه می‌شود.",
    metaDescription: "سفارش آنلاین سیب‌زمینی، سوخاری و پاستا از شعبه تجریش باقلوا کریم‌اوغلو.",
  },
  {
    id: "turkish-kebab",
    label: "کباب ترکی و استیک",
    description: "فقط شعبه تجریش",
    intro: "منوی کباب ترکی استانبولی و استیک فقط در شعبه تجریش ارائه می‌شود.",
    metaDescription: "سفارش آنلاین کباب ترکی و استیک از شعبه تجریش باقلوا کریم‌اوغلو.",
  },
  {
    id: "bakery",
    label: "نان‌های شیرین و کیک",
    description: "فقط شعبه پیروزی",
    intro: "کروسان، دنیش، گاتا و کیک اسلایسی، فقط در شعبه پیروزی.",
    metaDescription: "خرید آنلاین نان شیرین و کیک از شعبه پیروزی باقلوا کریم‌اوغلو.",
  },
  {
    id: "breakfast",
    label: "صبحانه",
    description: "فقط شعبه پیروزی",
    intro: "منوی صبحانه فقط در شعبه پیروزی ارائه می‌شود.",
    metaDescription: "سفارش آنلاین صبحانه از شعبه پیروزی باقلوا کریم‌اوغلو.",
  },
];

/**
 * فقط دسته‌هایی که حداقل یک آیتم قابل‌فروش آنلاین دارند در سایت نمایش داده می‌شوند.
 * (دسته‌هایی که همه آیتم‌هایشان فقط در شعبه پیروزی است، مثل «نان‌های شیرین و کیک» و «صبحانه»،
 * فروش آنلاین ندارند؛ چون پیروزی فعلاً سفارش آنلاین نمی‌پذیرد.)
 */
const CATEGORIES_SOLD_ONLINE = new Set(RAW_MENU_ITEMS.filter((item) => item.branchScope !== "piroozi").map((item) => item.category));
export const categoryShowcase: CategoryShowcaseItem[] = ALL_CATEGORIES.filter((c) => CATEGORIES_SOLD_ONLINE.has(c.id));

/**
 * ===== کاتالوگ واقعی (اصلاح این مرحله) =====
 *
 * ⚠️ نسخه قبلی این فایل یک کاتالوگ کاملاً Placeholder (نام/قیمت ساختگی)
 * داشت. حالا کاتالوگ از روی منوی واقعی مجموعه (`lib/menuProductsData.ts`
 * — استخراج‌شده از ۷ عکس منوی واقعی) ساخته می‌شود. هر آیتم `branchScope`
 * دارد که مشخص می‌کند در کدام شعب موجودی می‌گیرد (رجوع به
 * `lib/db/seed.ts` → `seedCatalog` برای وایرینگ Inventory واقعی).
 */
const productSlugToRawItem = new Map<string, RawMenuItem>();

function buildRealCatalog(): ProductSummary[] {
  const usedSlugs = new Set<string>();
  const products: ProductSummary[] = [];

  RAW_MENU_ITEMS.forEach((item, index) => {
    let slug = suggestSlug(item.name);
    // دفاع در عمق: حتی اگر دو آیتم به یک Slug برسند (فعلاً چنین موردی
    // نیست — تست شده)، به‌جای بازنویسی بی‌صدا یکی روی دیگری، یک پسوند
    // عددی اضافه می‌شود تا هیچ محصولی از کاتالوگ گم نشود.
    let suffix = 2;
    while (usedSlugs.has(slug)) {
      slug = `${suggestSlug(item.name)}-${suffix}`;
      suffix += 1;
    }
    usedSlugs.add(slug);

    const startingPrice = Math.min(...item.variants.map((v) => v.price));
    const product: ProductSummary = {
      id: item.id, // شناسه ثابت (rm<N> برای آیتم تکی، rmg<N> برای محصول ادغام‌شده)
      slug,
      name: item.name,
      category: item.category,
      categoryLabel: item.categoryLabel,
      startingPrice,
      isAvailable: true,
      hasSimpleDefaultUnit: item.variants.length === 1,
      unitType: item.unitType,
      availableSaleTypes: [...new Set(item.variants.map((v) => v.saleType ?? item.unitType))],
      addedIndex: index,
    };
    products.push(product);
    productSlugToRawItem.set(slug, item);
  });

  return products;
}

export const allProducts: ProductSummary[] = buildRealCatalog();

/**
 * برای Wiring موجودی per-branch (رجوع به lib/inventory/store.ts) — این
 * تابع مشخص می‌کند یک محصول باید فقط در کدام شعبه(ها) موجودی بگیرد.
 * بدون این تابع، Seed موجودی قبلی به هر ۶ شعبه (حتی شعبی که اصلاً آن آیتم
 * را نمی‌فروشند، مثل پیتزا در ستارخان) موجودی می‌داد — یک باگ واقعی که
 * همزمان با افزودن کاتالوگ واقعی کشف و همینجا بسته شد.
 */
export function getBranchScopeForProduct(productId: string): RawMenuItem["branchScope"] {
  const product = allProducts.find((p) => p.id === productId);
  if (!product) return "all";
  return productSlugToRawItem.get(product.slug)?.branchScope ?? "all";
}

/**
 * نسخه قبلی کاتالوگ (Placeholder) کاملاً با کاتالوگ واقعی بالا جایگزین شد
 * — یعنی Slugهای قدیمی (چه الگوی خیلی قدیمی `baklava-1`، چه Slugهای
 * باکیفیت‌تر مرحله قبل مثل `pistachio-diamond-baklava`) دیگر به هیچ
 * محصول واقعی در کاتالوگ اشاره نمی‌کنند — چون آن محصولات Placeholder
 * بودند و اصلاً معادل واقعی «همان محصول» در منوی واقعی وجود ندارد (این
 * جایگزینی کاتالوگ است، نه تغییر نام یک محصول ثابت). این پروژه هرگز به
 * Production واقعی نرفته (رجوع به گزارش Prompt 15) و این Slugها هرگز
 * توسط Google Index نشده‌اند، بنابراین Redirect ساختگی به یک محصول نامرتبط
 * ساخته نشد — درخواست به این Slugهای قدیمی طبیعتاً ۴۰۴ می‌گیرد (صفحه
 * ۴۰۴ موجود لینک بازگشت به فروشگاه دارد).
 */
export const LEGACY_PRODUCT_SLUG_REDIRECTS: Record<string, string> = {};

export const featuredProducts: ProductSummary[] = allProducts.filter((p) => p.isAvailable).slice(0, 8);

const commonPackagingOptions = [{ id: "standard", label: "بسته‌بندی استاندارد", priceDelta: 0 }];

const BRANCH_SCOPE_LABEL: Record<RawMenuItem["branchScope"], string> = {
  all: "قابل سفارش از هر ۶ شعبه فعال کریم‌اوغلو",
  tajrish: "این آیتم فقط در شعبه تجریش ارائه می‌شود",
  piroozi: "این آیتم فقط در شعبه پیروزی ارائه می‌شود",
};

export function getProductDetailBySlug(slug: string): ProductDetail | undefined {
  const product = allProducts.find((p) => p.slug === slug);
  const rawItem = productSlugToRawItem.get(slug);
  if (!product || !rawItem) return undefined;

  // هر نسخه نوع فروش خودش را دارد (کیلویی/اسلایسی/جعبه‌ای...) و نسخه‌ها بر اساس آن گروه‌بندی می‌شوند
  const DEFAULT_SALE_TYPE_LABEL = { weight: "وزنی", box: "جعبه‌ای", count: "عددی" } as const;
  const saleTypes: SaleTypeGroup[] = [];
  rawItem.variants.forEach((v, i) => {
    const type = v.saleType ?? rawItem.unitType;
    let group = saleTypes.find((g) => g.type === type);
    if (!group) {
      group = { type, label: rawItem.saleTypeLabels?.[type] ?? DEFAULT_SALE_TYPE_LABEL[type], variants: [] };
      saleTypes.push(group);
    }
    group.variants.push({ id: `${product.id}-v${i + 1}`, label: v.label, price: v.price, isAvailable: true });
  });

  const features = [BRANCH_SCOPE_LABEL[rawItem.branchScope]];
  if (rawItem.variants.some((v) => v.priceUncertain)) {
    features.push("⚠️ قیمت این آیتم از روی تصویر منو با خوانایی محدود ثبت شده — پیش از انتشار نهایی با مدیریت بازبینی شود");
  }

  return {
    ...product,
    descriptionIntro: rawItem.description ?? "",
    features,
    saleTypes,
    packagingOptions: commonPackagingOptions,
    reviews: [],
    imageCount: 0,
  };
}

export function getRelatedProducts(product: ProductSummary, limit = 4): ProductSummary[] {
  return allProducts
    .filter((p) => p.id !== product.id && p.category === product.category && p.isAvailable)
    .slice(0, limit);
}

export function getProductDetailById(productId: string): ProductDetail | undefined {
  const product = allProducts.find((p) => p.id === productId);
  if (!product) return undefined;
  return getProductDetailBySlug(product.slug);
}
