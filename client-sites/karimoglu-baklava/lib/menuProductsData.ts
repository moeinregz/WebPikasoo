import type { ProductCategory, UnitType } from "./types";

/**
 * ===== کاتالوگ واقعی محصولات — استخراج‌شده از عکس‌های منوی واقعی مجموعه =====
 *
 * منبع: ۷ تصویر منو که مستقیماً از کسب‌وکار دریافت شد (منوی عمومی باقلوا/دسر/
 * نوشیدنی که در همه شعب یکسان است، ۴ تصویر منوی غذای شعبه تجریش، و ۲ تصویر
 * منوی ویژه شعبه پیروزی). نام و قیمت هر آیتم مستقیماً از روی تصویر نوشته شده —
 * هیچ آیتم/قیمتی اختراع نشده.
 *
 * ⚠️ محدودیت‌های صادقانه این استخراج (باید توسط مدیریت بازبینی شود):
 * - تصاویر شعبه پیروزی (۶ و ۷) دست‌نویس/حاشیه‌نویسی‌شده بودند؛ چند رقم قیمت
 *   در نقاطی با خوانایی پایین‌تر بودند — این موارد با پرچم `priceUncertain`
 *   علامت‌گذاری شده‌اند تا از پنل ادمین قبل از انتشار عمومی بازبینی شوند.
 * - قیمت باقلوای کیلویی در تصویر پیروزی (تصویر ۶) با تصویر عمومی (تصویر ۱)
 *   فرق داشت (گران‌تر). چون این پروژه یک محصول را در یک قیمت واحد نگه
 *   می‌دارد (نه قیمت متفاوت به ازای شعبه — چنین قابلیتی هنوز در معماری
 *   Pricing وجود ندارد و اختراع آن خارج از دامنه این وظیفه است)، قیمت
 *   تصویر ۱ (عمومی) به‌عنوان مرجع نگه داشته شد و آیتم‌های تکراری تصویر ۶
 *   دوباره وارد نشدند — فقط آیتم‌های واقعاً جدید تصویر ۶ (کیک/کروسان/...)
 *   به دسته `bakery` (مخصوص پیروزی) اضافه شدند. این یک تصمیم صریح است، نه
 *   یک خطا — TODO تیم: اگر قیمت شعبه‌محور واقعاً مدنظر است، این یک تصمیم
 *   معماری جداست که باید آگاهانه گرفته شود.
 * - واحد فروش (`unitType`) بر پایه نوع واقعی هر آیتم تعیین شده: موارد
 *   «کیلویی» → وزنی؛ بقیه (تک‌سفارش یا با سایز) → عددی.
 */

export interface RawMenuVariant {
  label: string;
  price: number;
  priceUncertain?: boolean;
  /** نوع فروش این نسخه (وزنی/عددی/جعبه‌ای). اگر نباشد، همان `unitType` آیتم است. */
  saleType?: UnitType;
}

export interface RawMenuItem {
  /** شناسه ثابت محصول: `rm<N>` برای آیتم‌های قدیمی (شماره در لیست اولیه)، `rmg<N>` برای محصولات ادغام‌شده */
  id: string;
  name: string;
  category: ProductCategory;
  categoryLabel: string;
  unitType: UnitType;
  variants: RawMenuVariant[];
  /** توضیح — فقط وقتی خود منو مواد تشکیل‌دهنده را نوشته بود؛ در غیر این صورت خالی */
  description?: string;
  /** کدام شعب این آیتم را دارند */
  branchScope: "all" | "tajrish" | "piroozi";
  /** برچسب گروه‌های نوع فروش برای نمایش (مثلاً weight → «کیلویی»، count → «اسلایسی»)؛ پیش‌فرض: وزنی/عددی/جعبه‌ای */
  saleTypeLabels?: Partial<Record<UnitType, string>>;
}

/** آیتم در لیست اولیه (قبل از ادغام نسخه‌ها) — شناسه‌اش از شماره ردیف ساخته می‌شود */
type LegacyRawMenuItem = Omit<RawMenuItem, "id" | "saleTypeLabels">;

const T = (price: number): RawMenuVariant[] => [{ label: "قیمت", price }];

const LEGACY_RAW_MENU_ITEMS: LegacyRawMenuItem[] = [
  // ===== منوی عمومی — همه شعب (تصویر ۱) =====

  // انواع معجون
  { name: "معجون باقلوا یک‌نفره کریم‌اوغلو", category: "mix", categoryLabel: "معجون", unitType: "count", variants: T(425000), branchScope: "all" },
  { name: "معجون باقلوا دونفره کریم‌اوغلو", category: "mix", categoryLabel: "معجون", unitType: "count", variants: T(525000), branchScope: "all" },
  { name: "معجون باقلوا سه الی چهار نفره کریم‌اوغلو", category: "mix", categoryLabel: "معجون", unitType: "count", variants: T(645000), branchScope: "all" },

  // انواع دسر
  { name: "کازان دبی", category: "dessert", categoryLabel: "دسر", unitType: "count", variants: T(205000), branchScope: "all" },
  { name: "سوتلاچ", category: "dessert", categoryLabel: "دسر", unitType: "count", variants: T(155000), branchScope: "all" },
  { name: "تریلچه پسته، گردو، کارامل، نارگیل", category: "dessert", categoryLabel: "دسر", unitType: "count", variants: T(225000), branchScope: "all" },
  { name: "سرشیر اسکوپی", category: "dessert", categoryLabel: "دسر", unitType: "count", variants: T(145000), branchScope: "all" },
  { name: "بستنی وانیلی مخصوص", category: "dessert", categoryLabel: "دسر", unitType: "count", variants: T(145000), branchScope: "all" },
  { name: "شکلات دبی کوچک", category: "dessert", categoryLabel: "دسر", unitType: "count", variants: T(95000), branchScope: "all" },
  { name: "شکلات دبی متوسط", category: "dessert", categoryLabel: "دسر", unitType: "count", variants: T(145000), branchScope: "all" },
  { name: "شکلات دبی بزرگ", category: "dessert", categoryLabel: "دسر", unitType: "count", variants: T(285000), branchScope: "all" },
  { name: "موچی ساده", category: "dessert", categoryLabel: "دسر", unitType: "count", variants: T(90000), branchScope: "all" },
  { name: "موچی ژاپنی", category: "dessert", categoryLabel: "دسر", unitType: "count", variants: T(95000), branchScope: "all" },

  // انواع باقلوای کیلویی
  { name: "باقلوا استانبولی گردویی (کیلویی)", category: "baklava", categoryLabel: "باقلوا", unitType: "weight", variants: T(695000), branchScope: "all" },
  { name: "باقلوا استانبولی پسته‌ای (کیلویی)", category: "baklava", categoryLabel: "باقلوا", unitType: "weight", variants: T(895000), branchScope: "all" },
  { name: "میکس استانبولی گردو و پسته (کیلویی)", category: "baklava", categoryLabel: "باقلوا", unitType: "weight", variants: T(795000), branchScope: "all" },
  { name: "باقلوا گردویی سوپر (کیلویی)", category: "baklava", categoryLabel: "باقلوا", unitType: "weight", variants: T(795000), branchScope: "all" },
  { name: "باقلوا پسته‌ای سوپر (کیلویی)", category: "baklava", categoryLabel: "باقلوا", unitType: "weight", variants: T(995000), branchScope: "all" },
  {
    name: "باقلوا عربی (کیلویی)",
    category: "arabic-baklava",
    categoryLabel: "باقلوا عربی",
    unitType: "weight",
    variants: [
      { label: "نوع ۱", price: 1150000 },
      { label: "نوع ۲", price: 1425000 },
      { label: "نوع ۳", price: 1650000 },
      { label: "نوع ۴", price: 2200000 },
    ],
    branchScope: "all",
  },
  { name: "کوکی گردویی، کاکائویی (کیلویی)", category: "dessert", categoryLabel: "دسر", unitType: "weight", variants: T(550000), branchScope: "all" },

  // باقلوا عربی یک اسلایس
  { name: "کادایوف", category: "arabic-baklava", categoryLabel: "باقلوا عربی", unitType: "count", variants: T(245000), branchScope: "all" },
  { name: "آشیانه", category: "arabic-baklava", categoryLabel: "باقلوا عربی", unitType: "count", variants: T(215000), branchScope: "all" },
  { name: "خندان پسته", category: "arabic-baklava", categoryLabel: "باقلوا عربی", unitType: "count", variants: T(245000), branchScope: "all" },
  { name: "اسلایس کوچک گردویی عربی", category: "arabic-baklava", categoryLabel: "باقلوا عربی", unitType: "count", variants: T(85000), branchScope: "all" },
  { name: "اسلایس کوچک پسته‌ای عربی", category: "arabic-baklava", categoryLabel: "باقلوا عربی", unitType: "count", variants: T(75000), branchScope: "all" },
  { name: "اسلایس بزرگ گردویی عربی", category: "arabic-baklava", categoryLabel: "باقلوا عربی", unitType: "count", variants: T(245000), branchScope: "all" },
  { name: "اسلایس بزرگ پسته‌ای عربی", category: "arabic-baklava", categoryLabel: "باقلوا عربی", unitType: "count", variants: T(220000), branchScope: "all" },
  { name: "هاویچ پسته‌ای عربی", category: "arabic-baklava", categoryLabel: "باقلوا عربی", unitType: "count", variants: T(375000), branchScope: "all" },
  { name: "کره‌ای مغربی", category: "arabic-baklava", categoryLabel: "باقلوا عربی", unitType: "count", variants: T(295000), branchScope: "all" },
  { name: "هاویچ مغربی", category: "arabic-baklava", categoryLabel: "باقلوا عربی", unitType: "count", variants: T(415000), branchScope: "all" },
  { name: "بامیه عربی", category: "arabic-baklava", categoryLabel: "باقلوا عربی", unitType: "count", variants: T(375000), branchScope: "all" },
  { name: "برازق رژیمی", category: "arabic-baklava", categoryLabel: "باقلوا عربی", unitType: "count", variants: T(655000), branchScope: "all" },
  { name: "خشک عربی", category: "arabic-baklava", categoryLabel: "باقلوا عربی", unitType: "weight", variants: T(650000), branchScope: "all" },

  // انواع کنافه
  { name: "کنافه پنیری یک‌نفره با شهد عسل و زعفران", category: "kunafa", categoryLabel: "کنافه", unitType: "count", variants: T(265000), branchScope: "all" },
  { name: "کنافه پنیری دونفره با شهد عسل و زعفران", category: "kunafa", categoryLabel: "کنافه", unitType: "count", variants: T(325000), branchScope: "all" },
  { name: "کنافه پنیری سه الی چهار نفره با شهد عسل و زعفران", category: "kunafa", categoryLabel: "کنافه", unitType: "count", variants: T(375000), branchScope: "all" },
  { name: "کنافه پنیری نوتلایی تک‌نفره با شهد عسل و زعفران", category: "kunafa", categoryLabel: "کنافه", unitType: "count", variants: T(315000), branchScope: "all" },
  { name: "کنافه پنیری نوتلایی دونفره با شهد عسل و زعفران", category: "kunafa", categoryLabel: "کنافه", unitType: "count", variants: T(375000), branchScope: "all" },
  { name: "کنافه پنیری نوتلایی سه الی چهار نفره با شهد عسل و زعفران", category: "kunafa", categoryLabel: "کنافه", unitType: "count", variants: T(425000), branchScope: "all" },

  // انواع باقلوای اسلایسی
  { name: "هاویچ استانبولی گردویی", category: "baklava", categoryLabel: "باقلوا", unitType: "count", variants: T(235000), branchScope: "all" },
  { name: "هاویچ استانبولی پسته‌ای", category: "baklava", categoryLabel: "باقلوا", unitType: "count", variants: T(295000), branchScope: "all" },
  { name: "هاویچ گردویی عربی", category: "arabic-baklava", categoryLabel: "باقلوا عربی", unitType: "count", variants: T(315000), branchScope: "all" },
  { name: "هاویچ پسته‌ای عربی (اسلایسی)", category: "arabic-baklava", categoryLabel: "باقلوا عربی", unitType: "count", variants: T(375000), branchScope: "all" },
  { name: "باقلوا گردویی اسلایس کوچک", category: "baklava", categoryLabel: "باقلوا", unitType: "count", variants: T(55000), branchScope: "all" },
  { name: "باقلوا پسته‌ای اسلایس کوچک", category: "baklava", categoryLabel: "باقلوا", unitType: "count", variants: T(65000), branchScope: "all" },
  { name: "باقلوا گردویی اسلایس بزرگ", category: "baklava", categoryLabel: "باقلوا", unitType: "count", variants: T(65000), branchScope: "all" },
  { name: "باقلوا پسته‌ای اسلایس بزرگ", category: "baklava", categoryLabel: "باقلوا", unitType: "count", variants: T(75000), branchScope: "all" },

  // انواع نوشیدنی (عمومی)
  { name: "قهوه ترک", category: "drinks", categoryLabel: "نوشیدنی", unitType: "count", variants: T(175000), branchScope: "all" },
  { name: "چای لیوانی بزرگ", category: "drinks", categoryLabel: "نوشیدنی", unitType: "count", variants: T(55000), branchScope: "all" },
  { name: "اسپرسو سینگل", category: "drinks", categoryLabel: "نوشیدنی", unitType: "count", variants: T(65000), branchScope: "all" },
  { name: "اسپرسو دبل", category: "drinks", categoryLabel: "نوشیدنی", unitType: "count", variants: T(85000), branchScope: "all" },
  { name: "چای ماسالا", category: "drinks", categoryLabel: "نوشیدنی", unitType: "count", variants: T(135000), branchScope: "all" },
  { name: "موکا", category: "drinks", categoryLabel: "نوشیدنی", unitType: "count", variants: T(135000), branchScope: "all" },
  { name: "کاپوچینو", category: "drinks", categoryLabel: "نوشیدنی", unitType: "count", variants: T(135000), branchScope: "all" },
  { name: "نسکافه", category: "drinks", categoryLabel: "نوشیدنی", unitType: "count", variants: T(135000), branchScope: "all" },
  { name: "هات چاکلت", category: "drinks", categoryLabel: "نوشیدنی", unitType: "count", variants: T(135000), branchScope: "all" },
  { name: "لته", category: "drinks", categoryLabel: "نوشیدنی", unitType: "count", variants: T(135000), branchScope: "all" },
  { name: "آب معدنی", category: "drinks", categoryLabel: "نوشیدنی", unitType: "count", variants: T(20000), branchScope: "all" },
  { name: "چای و باقلوا ترکی", category: "drinks", categoryLabel: "نوشیدنی", unitType: "count", variants: T(95000), branchScope: "all" },

  // ===== منوی غذا — فقط شعبه تجریش (تصاویر ۲ تا ۵) =====

  // ساندویچ/همبرگر (گوشت گوساله)
  { name: "رویال برگر", category: "sandwich", categoryLabel: "ساندویچ و برگر", unitType: "count", variants: T(665000), description: "۱۵۰ گرم برگر + ژامبون ۲ ورق + پنیر + سیب‌زمینی", branchScope: "tajrish" },
  { name: "برگر ژامبون تنوری", category: "sandwich", categoryLabel: "ساندویچ و برگر", unitType: "count", variants: T(665000), description: "۱۵۰ گرم ژامبون مرغ + قارچ و گوشت + سیب‌زمینی", branchScope: "tajrish" },
  { name: "برگر قارچ و پنیر", category: "sandwich", categoryLabel: "ساندویچ و برگر", unitType: "count", variants: T(655000), description: "۱۵۰ گرم برگر + ۷۰ گرم قارچ + ۵۰ گرم پنیر + سیب‌زمینی", branchScope: "tajrish" },
  { name: "ماشروم برگر", category: "sandwich", categoryLabel: "ساندویچ و برگر", unitType: "count", variants: T(615000), description: "۱۵۰ گرم برگر + سس قارچ آلفردو + سیب‌زمینی", branchScope: "tajrish" },
  { name: "چیز برگر", category: "sandwich", categoryLabel: "ساندویچ و برگر", unitType: "count", variants: T(615000), description: "۱۵۰ گرم برگر + پنیر پیتزا + سیب‌زمینی", branchScope: "tajrish" },
  { name: "برگر کلاسیک", category: "sandwich", categoryLabel: "ساندویچ و برگر", unitType: "count", variants: T(555000), description: "۱۵۰ گرم برگر + سیب‌زمینی", branchScope: "tajrish" },
  { name: "ساندویچ رست بیف", category: "sandwich", categoryLabel: "ساندویچ و برگر", unitType: "count", variants: T(625000), description: "۲۰۰ گرم گوشت ریش‌ریش‌شده گوساله + سس قارچ + باگت", branchScope: "tajrish" },
  { name: "ساندویچ فیله مرغ", category: "sandwich", categoryLabel: "ساندویچ و برگر", unitType: "count", variants: T(515000), description: "۳ عدد فیله مرغ گریل + سس قارچ + باگت", branchScope: "tajrish" },
  { name: "ساندویچ فیله سوخاری", category: "sandwich", categoryLabel: "ساندویچ و برگر", unitType: "count", variants: T(595000), description: "۳ عدد فیله سوخاری + پنیر ورقه‌ای + باگت", branchScope: "tajrish" },
  { name: "ژامبون تنوری", category: "sandwich", categoryLabel: "ساندویچ و برگر", unitType: "count", variants: T(495000), description: "۲ ورق ژامبون گوشت مرغ + قارچ + پنیر + باگت", branchScope: "tajrish" },
  { name: "میکس سرد", category: "sandwich", categoryLabel: "ساندویچ و برگر", unitType: "count", variants: T(325000), description: "۴ ورق گوشت و مرغ + سس مخصوص + باگت", branchScope: "tajrish" },
  { name: "هات داگ", category: "sandwich", categoryLabel: "ساندویچ و برگر", unitType: "count", variants: T(325000), description: "۱ عدد هات داگ ۷۰٪ + باگت + سس مخصوص", branchScope: "tajrish" },
  { name: "هات داگ تنوری", category: "sandwich", categoryLabel: "ساندویچ و برگر", unitType: "count", variants: T(395000), description: "۱ عدد هات داگ ۷۰٪ + ۲ ورق ژامبون تنوری گوشت + باگت + سس مخصوص", branchScope: "tajrish" },
  { name: "هات داگ پنیری", category: "sandwich", categoryLabel: "ساندویچ و برگر", unitType: "count", variants: T(395000), description: "۱ عدد هات داگ ۷۰٪ + پنیر پیتزا + باگت + سس مخصوص", branchScope: "tajrish" },
  { name: "بندری", category: "sandwich", categoryLabel: "ساندویچ و برگر", unitType: "count", variants: T(295000), description: "۳۰۰ گرم سوسیس بندری + باگت + سس مخصوص", branchScope: "tajrish" },
  { name: "بندری قارچ و پنیر", category: "sandwich", categoryLabel: "ساندویچ و برگر", unitType: "count", variants: T(395000), description: "۲۰۰ گرم سوسیس بندری + ۷۰ گرم قارچ + ۷۰ گرم پنیر", branchScope: "tajrish" },
  { name: "بندری مرغ و میکس", category: "sandwich", categoryLabel: "ساندویچ و برگر", unitType: "count", variants: T(495000), description: "۱۵۰ گرم سوسیس بندری + ۱۲۰ گرم مرغ", branchScope: "tajrish" },

  // سیب‌زمینی – سوخاری – پاستا
  { name: "سیب‌زمینی کوچک", category: "sides-pasta", categoryLabel: "سیب‌زمینی، سوخاری و پاستا", unitType: "count", variants: T(195000), description: "۲۰۰ گرم، ادویه یا سس دلخواه (ارگانیک)", branchScope: "tajrish" },
  { name: "سیب‌زمینی متوسط", category: "sides-pasta", categoryLabel: "سیب‌زمینی، سوخاری و پاستا", unitType: "count", variants: T(295000), description: "ادویه یا سس دلخواه (ارگانیک)", branchScope: "tajrish" },
  { name: "سیب‌زمینی بزرگ", category: "sides-pasta", categoryLabel: "سیب‌زمینی، سوخاری و پاستا", unitType: "count", variants: T(345000), description: "۴۵۰ گرم، ادویه یا سس دلخواه (ارگانیک)", branchScope: "tajrish" },
  { name: "سیب‌زمینی آلفردو", category: "sides-pasta", categoryLabel: "سیب‌زمینی، سوخاری و پاستا", unitType: "count", variants: T(485000), description: "۳۵۰ گرم + سس آلفردو با ادویه", branchScope: "tajrish" },
  { name: "سیب قارچ و پنیر", category: "sides-pasta", categoryLabel: "سیب‌زمینی، سوخاری و پاستا", unitType: "count", variants: T(425000), description: "۳۵۰ گرم + ۷۰ گرم قارچ + ۷۰ گرم پنیر + ادویه", branchScope: "tajrish" },
  { name: "سیب‌زمینی کریم‌اوغلو", category: "sides-pasta", categoryLabel: "سیب‌زمینی، سوخاری و پاستا", unitType: "count", variants: T(475000), description: "۳۵۰ گرم + ژامبون + ۷۰ گرم قارچ + ۷۰ گرم پنیر + ادویه", branchScope: "tajrish" },
  { name: "نان سیر", category: "sides-pasta", categoryLabel: "سیب‌زمینی، سوخاری و پاستا", unitType: "count", variants: T(295000), description: "۲۰۰ گرم خمیر + سیر + سس سیر", branchScope: "tajrish" },
  { name: "فیله سوخاری ۳ تیکه", category: "sides-pasta", categoryLabel: "سیب‌زمینی، سوخاری و پاستا", unitType: "count", variants: T(855000), description: "سیب‌زمینی ۱۵۰ گرم + قارچ سوخاری ۱۵۰ گرم + سالاد کلم", branchScope: "tajrish" },
  { name: "قارچ سوخاری", category: "sides-pasta", categoryLabel: "سیب‌زمینی، سوخاری و پاستا", unitType: "count", variants: T(295000), branchScope: "tajrish" },
  { name: "کتف و بال سوخاری", category: "sides-pasta", categoryLabel: "سیب‌زمینی، سوخاری و پاستا", unitType: "count", variants: T(745000), description: "۳ تکه کتف + ۳ تکه بال + سیب‌زمینی + سالاد کلم", branchScope: "tajrish" },
  { name: "سبد سوخاری", category: "sides-pasta", categoryLabel: "سیب‌زمینی، سوخاری و پاستا", unitType: "count", variants: T(895000), description: "۲ تکه فیله + ۲ تکه بال + قارچ + سیب‌زمینی", branchScope: "tajrish" },
  { name: "پاستا چیکن آلفردو", category: "sides-pasta", categoryLabel: "سیب‌زمینی، سوخاری و پاستا", unitType: "count", variants: T(655000), branchScope: "tajrish" },
  { name: "پاستا بیف آلفردو", category: "sides-pasta", categoryLabel: "سیب‌زمینی، سوخاری و پاستا", unitType: "count", variants: T(815000), branchScope: "tajrish" },
  { name: "سالاد کلم", category: "sides-pasta", categoryLabel: "سیب‌زمینی، سوخاری و پاستا", unitType: "count", variants: T(225000), branchScope: "tajrish" },

  // پیتزا (سایز: ۱ نفره ۲۴cm / ۲ نفره ۲۸cm / خانواده ۳۲cm)
  { name: "پیتزا سبزیجات", category: "pizza", categoryLabel: "پیتزا", unitType: "count", description: "کدو، گوجه گیلاسی، زیتون، ذرت، نخود فرنگی، هویج، فلفل دلمه، پنیر", branchScope: "tajrish", variants: [{ label: "۱ نفره (24cm)", price: 325000 }, { label: "۲ نفره (28cm)", price: 555000 }, { label: "خانواده (32cm)", price: 735000 }] },
  { name: "پیتزا مخلوط", category: "pizza", categoryLabel: "پیتزا", unitType: "count", description: "ژامبون گوشت و مرغ ۹۰٪، فلفل دلمه، زیتون، پنیر، سس مخصوص", branchScope: "tajrish", variants: [{ label: "۱ نفره (24cm)", price: 345000 }, { label: "۲ نفره (28cm)", price: 585000 }, { label: "خانواده (32cm)", price: 755000 }] },
  { name: "پیتزا پپرونی", category: "pizza", categoryLabel: "پیتزا", unitType: "count", description: "پپرونی ۹۰٪، هالوپینو، سس مخصوص، پنیر", branchScope: "tajrish", variants: [{ label: "۱ نفره (24cm)", price: 345000 }, { label: "۲ نفره (28cm)", price: 575000 }, { label: "خانواده (32cm)", price: 755000 }] },
  { name: "پیتزا چیکن آلفردو", category: "pizza", categoryLabel: "پیتزا", unitType: "count", description: "چیکن آلفردو، سس آلفردو", branchScope: "tajrish", variants: [{ label: "۱ نفره (24cm)", price: 615000 }, { label: "۲ نفره (28cm)", price: 855000 }, { label: "خانواده (32cm)", price: 1015000 }] },
  { name: "پیتزا رست ژامبون", category: "pizza", categoryLabel: "پیتزا", unitType: "count", description: "گوشت رست، ژامبون، قارچ، فلفل دلمه، زیتون، پنیر، سس مخصوص", branchScope: "tajrish", variants: [{ label: "۱ نفره (24cm)", price: 595000 }, { label: "۲ نفره (28cm)", price: 855000 }, { label: "خانواده (32cm)", price: 1125000 }] },
  { name: "پیتزا مخصوص کریم‌اوغلو", category: "pizza", categoryLabel: "پیتزا", unitType: "count", description: "بیکن ۹۰٪، ژامبون ۹۰٪، فلفل دلمه، مرغ و گوشت ترکی، فلفل دلمه، سس مخصوص", branchScope: "tajrish", variants: [{ label: "۱ نفره (24cm)", price: 625000 }, { label: "۲ نفره (28cm)", price: 895000 }, { label: "خانواده (32cm)", price: 1100000 }] },
  { name: "پیتزا مرغ دنر", category: "pizza", categoryLabel: "پیتزا", unitType: "count", description: "سس کچاپ + مرغ کباب ترکی + قارچ + پنیر و گارنیش", branchScope: "tajrish", variants: [{ label: "۱ نفره (24cm)", price: 455000 }, { label: "۲ نفره (28cm)", price: 675000 }, { label: "خانواده (32cm)", price: 895000 }] },
  { name: "پیتزا گوشت دنر", category: "pizza", categoryLabel: "پیتزا", unitType: "count", description: "سس کچاپ + مگوشت کباب ترکی + قارچ + پنیر و گارنیش", branchScope: "tajrish", variants: [{ label: "۱ نفره (24cm)", price: 695000 }, { label: "۲ نفره (28cm)", price: 945000 }, { label: "خانواده (32cm)", price: 1235000 }] },
  { name: "پیتزا بیف آلفردو", category: "pizza", categoryLabel: "پیتزا", unitType: "count", description: "سس آلفردو، گوشت ریش‌ریش گوساله، پنیر گارنیش", branchScope: "tajrish", variants: [{ label: "۱ نفره (24cm)", price: 735000 }, { label: "۲ نفره (28cm)", price: 995000 }, { label: "خانواده (32cm)", price: 1455000 }] },
  { name: "پیتزا رست بیف", category: "pizza", categoryLabel: "پیتزا", unitType: "count", description: "گوشت رست، ژامبون، قارچ، فلفل دلمه، زیتون، سس مخصوص", branchScope: "tajrish", variants: [{ label: "۱ نفره (24cm)", price: 655000 }, { label: "۲ نفره (28cm)", price: 895000 }, { label: "خانواده (32cm)", price: 1285000 }] },
  { name: "پیتزا گوشت و مرغ مخلوط", category: "pizza", categoryLabel: "پیتزا", unitType: "count", description: "سس کچاپ + مرغ و گوشت کباب ترکی + قارچ + پنیر و گارنیش", branchScope: "tajrish", variants: [{ label: "۱ نفره (24cm)", price: 655000 }, { label: "۲ نفره (28cm)", price: 895000 }, { label: "خانواده (32cm)", price: 1095000 }] },
  { name: "پیتزا سیر و استیک", category: "pizza", categoryLabel: "پیتزا", unitType: "count", description: "فیله گوساله، زیتون سلایس، پنیر، سس ترکیبی", branchScope: "tajrish", variants: [{ label: "۱ نفره (24cm)", price: 595000 }, { label: "۲ نفره (28cm)", price: 845000 }, { label: "خانواده (32cm)", price: 995000 }] },

  // کباب ترکی استانبولی – استیک گوشت (ساندویچ: مینی/متوسط/بزرگ)
  { name: "ساندویچ کباب ترکی مرغ", category: "turkish-kebab", categoryLabel: "کباب ترکی و استیک", unitType: "count", branchScope: "tajrish", variants: [{ label: "مینی", price: 430000 }, { label: "متوسط", price: 540000 }, { label: "بزرگ", price: 630000 }] },
  { name: "ساندویچ کباب ترکی گوشت", category: "turkish-kebab", categoryLabel: "کباب ترکی و استیک", unitType: "count", branchScope: "tajrish", variants: [{ label: "مینی", price: 565000 }, { label: "متوسط", price: 675000 }, { label: "بزرگ", price: 850000 }] },
  { name: "ساندویچ کباب ترکی مخلوط", category: "turkish-kebab", categoryLabel: "کباب ترکی و استیک", unitType: "count", branchScope: "tajrish", variants: [{ label: "مینی", price: 495000 }, { label: "متوسط", price: 610000 }, { label: "بزرگ", price: 740000 }] },
  { name: "پرس شماره ۱ مرغ", category: "turkish-kebab", categoryLabel: "کباب ترکی و استیک", unitType: "count", description: "۳۵۰ گرم گوشت و مرغ + مخلفات", branchScope: "tajrish", variants: T(855000) },
  { name: "پرس شماره ۱ مخلوط", category: "turkish-kebab", categoryLabel: "کباب ترکی و استیک", unitType: "count", description: "۳۵۰ گرم گوشت و مرغ + مخلفات", branchScope: "tajrish", variants: T(1055000) },
  { name: "پرس شماره ۱ گوشت", category: "turkish-kebab", categoryLabel: "کباب ترکی و استیک", unitType: "count", description: "۳۵۰ گرم گوشت و مرغ + مخلفات", branchScope: "tajrish", variants: T(1240000) },
  { name: "پرس شماره ۲ مرغ", category: "turkish-kebab", categoryLabel: "کباب ترکی و استیک", unitType: "count", description: "۴۵۰ گرم گوشت و مرغ + مخلفات", branchScope: "tajrish", variants: T(955000) },
  { name: "پرس شماره ۲ مخلوط", category: "turkish-kebab", categoryLabel: "کباب ترکی و استیک", unitType: "count", description: "۴۵۰ گرم گوشت و مرغ + مخلفات", branchScope: "tajrish", variants: T(1185000) },
  { name: "پرس شماره ۲ گوشت", category: "turkish-kebab", categoryLabel: "کباب ترکی و استیک", unitType: "count", description: "۴۵۰ گرم گوشت و مرغ + مخلفات", branchScope: "tajrish", variants: T(1440000) },
  { name: "پرس شماره ۳ مرغ", category: "turkish-kebab", categoryLabel: "کباب ترکی و استیک", unitType: "count", description: "۶۵۰ گرم گوشت و مرغ + مخلفات", branchScope: "tajrish", variants: T(1155000) },
  { name: "پرس شماره ۳ مخلوط", category: "turkish-kebab", categoryLabel: "کباب ترکی و استیک", unitType: "count", description: "۶۵۰ گرم گوشت و مرغ + مخلفات", branchScope: "tajrish", variants: T(1515000) },
  { name: "پرس شماره ۳ گوشت", category: "turkish-kebab", categoryLabel: "کباب ترکی و استیک", unitType: "count", description: "۶۵۰ گرم گوشت و مرغ + مخلفات", branchScope: "tajrish", variants: T(1685000) },
  { name: "ساندویچ استیک مخصوص کریم‌اوغلو", category: "turkish-kebab", categoryLabel: "کباب ترکی و استیک", unitType: "count", description: "۱۵۰ گرم گوشت + ۱۵۰ گرم مرغ", branchScope: "tajrish", variants: T(950000) },
  { name: "ساندویچ استیک گوشت", category: "turkish-kebab", categoryLabel: "کباب ترکی و استیک", unitType: "count", description: "۲۰۰ گرم گوشت با مخلفات", branchScope: "tajrish", variants: T(950000) },
  { name: "ساندویچ استیک مرغ", category: "turkish-kebab", categoryLabel: "کباب ترکی و استیک", unitType: "count", description: "۲۰۰ گرم مرغ با مخلفات", branchScope: "tajrish", variants: T(600000) },
  { name: "ساندویچ استیک پرسی گوشت", category: "turkish-kebab", categoryLabel: "کباب ترکی و استیک", unitType: "count", description: "۳۰۰ گرم گوشت با مخلفات", branchScope: "tajrish", variants: T(1200000) },
  { name: "ساندویچ استیک پرسی مرغ", category: "turkish-kebab", categoryLabel: "کباب ترکی و استیک", unitType: "count", description: "۳۰۰ گرم مرغ با مخلفات", branchScope: "tajrish", variants: T(800000) },

  // ===== منوی ویژه — فقط شعبه پیروزی (تصاویر ۶ و ۷؛ فقط آیتم‌های غیرتکراری با منوی عمومی) =====

  // نان‌های شیرین و کیک (بیکری)
  { name: "کروسان کره‌ای", category: "bakery", categoryLabel: "نان‌های شیرین و کیک", unitType: "count", variants: T(120000), branchScope: "piroozi" },
  { name: "کروسان کره‌ای شکلاتی", category: "bakery", categoryLabel: "نان‌های شیرین و کیک", unitType: "count", variants: T(180000), branchScope: "piroozi" },
  { name: "کیوب کروسان کره‌ای", category: "bakery", categoryLabel: "نان‌های شیرین و کیک", unitType: "count", variants: T(85000), branchScope: "piroozi" },
  { name: "کیوب کروسان کره‌ای شکلاتی", category: "bakery", categoryLabel: "نان‌های شیرین و کیک", unitType: "count", variants: T(110000), branchScope: "piroozi" },
  { name: "دنیش میوه‌ای", category: "bakery", categoryLabel: "نان‌های شیرین و کیک", unitType: "count", variants: T(110000), branchScope: "piroozi" },
  { name: "گاتا گردویی", category: "bakery", categoryLabel: "نان‌های شیرین و کیک", unitType: "count", variants: T(90000), branchScope: "piroozi" },
  { name: "تونیست شکلاتی", category: "bakery", categoryLabel: "نان‌های شیرین و کیک", unitType: "count", variants: [{ label: "قیمت", price: 90000, priceUncertain: true }], branchScope: "piroozi" },
  { name: "اشترودل قارچ و مرغ", category: "bakery", categoryLabel: "نان‌های شیرین و کیک", unitType: "count", variants: T(180000), branchScope: "piroozi" },
  { name: "کیک هویج گردو (اسلایسی)", category: "bakery", categoryLabel: "نان‌های شیرین و کیک", unitType: "count", variants: T(195000), branchScope: "piroozi" },
  { name: "کیک شکلات (اسلایسی)", category: "bakery", categoryLabel: "نان‌های شیرین و کیک", unitType: "count", variants: T(185000), branchScope: "piroozi" },
  { name: "چیزکیک لوتوس (اسلایسی)", category: "bakery", categoryLabel: "نان‌های شیرین و کیک", unitType: "count", variants: T(135000), branchScope: "piroozi" },

  // نوشیدنی سرد (فقط موارد جدید نسبت به منوی عمومی)
  { name: "آفاکادو", category: "drinks", categoryLabel: "نوشیدنی", unitType: "count", variants: [{ label: "قیمت", price: 245000, priceUncertain: true }], branchScope: "piroozi" },
  { name: "موهیتو", category: "drinks", categoryLabel: "نوشیدنی", unitType: "count", variants: T(235000), branchScope: "piroozi" },
  { name: "لیموناد", category: "drinks", categoryLabel: "نوشیدنی", unitType: "count", variants: T(235000), branchScope: "piroozi" },
  { name: "شیک (نوتلا، لوتوس یا کارامل)", category: "drinks", categoryLabel: "نوشیدنی", unitType: "count", variants: [{ label: "قیمت", price: 250000, priceUncertain: true }], branchScope: "piroozi" },
  { name: "لته پسته (سرد)", category: "drinks", categoryLabel: "نوشیدنی", unitType: "count", variants: T(245000), branchScope: "piroozi" },
  { name: "لته کارامل (سرد)", category: "drinks", categoryLabel: "نوشیدنی", unitType: "count", variants: T(245000), branchScope: "piroozi" },
  { name: "لته انبه (سرد)", category: "drinks", categoryLabel: "نوشیدنی", unitType: "count", variants: T(245000), branchScope: "piroozi" },
  { name: "لته توت‌فرنگی (سرد)", category: "drinks", categoryLabel: "نوشیدنی", unitType: "count", variants: T(245000), branchScope: "piroozi" },
  { name: "لته زعفران (سرد)", category: "drinks", categoryLabel: "نوشیدنی", unitType: "count", variants: T(245000), branchScope: "piroozi" },
  { name: "نوشیدنی تابستان", category: "drinks", categoryLabel: "نوشیدنی", unitType: "count", variants: T(175000), branchScope: "piroozi" },
  { name: "نوشیدنی انبه", category: "drinks", categoryLabel: "نوشیدنی", unitType: "count", variants: T(155000), branchScope: "piroozi" },
  { name: "نوشیدنی موهیتو", category: "drinks", categoryLabel: "نوشیدنی", unitType: "count", variants: T(155000), branchScope: "piroozi" },
  { name: "آیس موکا", category: "drinks", categoryLabel: "نوشیدنی", unitType: "count", variants: [{ label: "قیمت", price: 245000, priceUncertain: true }], branchScope: "piroozi" },
  { name: "آیس کارامل ماکیاتو", category: "drinks", categoryLabel: "نوشیدنی", unitType: "count", variants: [{ label: "قیمت", price: 245000, priceUncertain: true }], branchScope: "piroozi" },
  { name: "آیس لته", category: "drinks", categoryLabel: "نوشیدنی", unitType: "count", variants: [{ label: "قیمت", price: 245000, priceUncertain: true }], branchScope: "piroozi" },
  { name: "آیس کاپوچینو", category: "drinks", categoryLabel: "نوشیدنی", unitType: "count", variants: [{ label: "قیمت", price: 245000, priceUncertain: true }], branchScope: "piroozi" },

  // نوشیدنی گرم (فقط موارد جدید)
  { name: "چای کرک و هل و زعفران", category: "drinks", categoryLabel: "نوشیدنی", unitType: "count", variants: [{ label: "قیمت", price: 245000, priceUncertain: true }], branchScope: "piroozi" },
  { name: "شیر کاکائو", category: "drinks", categoryLabel: "نوشیدنی", unitType: "count", variants: [{ label: "قیمت", price: 185000, priceUncertain: true }], branchScope: "piroozi" },
  { name: "چای ساده", category: "drinks", categoryLabel: "نوشیدنی", unitType: "count", variants: T(55000), branchScope: "piroozi" },
  { name: "انواع دمنوش", category: "drinks", categoryLabel: "نوشیدنی", unitType: "count", variants: T(150000), branchScope: "piroozi" },
  { name: "چای زعفران", category: "drinks", categoryLabel: "نوشیدنی", unitType: "count", variants: [{ label: "قیمت", price: 145000, priceUncertain: true }], branchScope: "piroozi" },
  { name: "کارامل ماکیاتو", category: "drinks", categoryLabel: "نوشیدنی", unitType: "count", variants: [{ label: "قیمت", price: 225000, priceUncertain: true }], branchScope: "piroozi" },

  // منوی صبحانه
  { name: "املت", category: "breakfast", categoryLabel: "صبحانه", unitType: "count", variants: T(150000), branchScope: "piroozi" },
  { name: "نیمرو", category: "breakfast", categoryLabel: "صبحانه", unitType: "count", variants: T(120000), branchScope: "piroozi" },
  { name: "سرشیر و عسل", category: "breakfast", categoryLabel: "صبحانه", unitType: "count", variants: T(150000), branchScope: "piroozi" },
];

// ============================================================================
// ===== ادغام نسخه‌ها: «یک محصول، چند نوع» =====
//
// در منوی اولیه هر نوع/اندازه/شکل فروش یک ردیف جدا بود (مثلاً «باقلوا گردویی کیلویی» و
// «باقلوا گردویی اسلایس کوچک» و «اسلایس بزرگ»). مشتری باید یک محصول ببیند و از داخل آن، نوع
// (کیلویی/اسلایسی/جعبه‌ای/اندازه/تعداد نفر) و تعداد همان نوع را انتخاب کند.
//
// هر گروه زیر چند ردیف اولیه را به یک محصول با چند «نسخه» (Variant) تبدیل می‌کند. قیمت‌ها همیشه
// از ردیف اولیه خوانده می‌شوند (`from`) تا عدد تکراری تایپ نشود. برای افزودن یا تغییر یک گروه،
// فقط همین لیست را ویرایش کنید.
// ============================================================================

interface MergeVariantSpec {
  label: string;
  /** نام دقیق ردیف اولیه‌ای که قیمت از آن می‌آید */
  from: string;
  /** اگر ردیف اولیه خودش چند نسخه داشت (مثل ساندویچ مینی/متوسط/بزرگ)، برچسب همان نسخه */
  fromVariant?: string;
  saleType?: UnitType;
}

interface MergeSpec {
  name: string;
  category?: ProductCategory;
  categoryLabel?: string;
  description?: string;
  saleTypeLabels?: Partial<Record<UnitType, string>>;
  variants: MergeVariantSpec[];
  /** ردیف‌های تکراری که در همین محصول ادغام می‌شوند ولی نسخه جدا نمی‌سازند */
  absorbs?: string[];
}

const MERGE_SPECS: MergeSpec[] = [
  // ----- معجون -----
  {
    name: "معجون باقلوا کریم‌اوغلو",
    variants: [
      { label: "یک‌نفره", from: "معجون باقلوا یک‌نفره کریم‌اوغلو" },
      { label: "دونفره", from: "معجون باقلوا دونفره کریم‌اوغلو" },
      { label: "سه الی چهار نفره", from: "معجون باقلوا سه الی چهار نفره کریم‌اوغلو" },
    ],
  },

  // ----- دسر -----
  {
    name: "شکلات دبی",
    variants: [
      { label: "کوچک", from: "شکلات دبی کوچک" },
      { label: "متوسط", from: "شکلات دبی متوسط" },
      { label: "بزرگ", from: "شکلات دبی بزرگ" },
    ],
  },
  {
    name: "موچی",
    variants: [
      { label: "ساده", from: "موچی ساده" },
      { label: "ژاپنی", from: "موچی ژاپنی" },
    ],
  },

  // ----- باقلوا: کیلویی و اسلایسی در یک محصول -----
  {
    name: "باقلوا گردویی",
    category: "baklava",
    categoryLabel: "باقلوا",
    saleTypeLabels: { weight: "کیلویی", count: "اسلایسی" },
    variants: [
      { label: "کیلویی استانبولی", from: "باقلوا استانبولی گردویی (کیلویی)", saleType: "weight" },
      { label: "کیلویی سوپر", from: "باقلوا گردویی سوپر (کیلویی)", saleType: "weight" },
      { label: "اسلایس کوچک", from: "باقلوا گردویی اسلایس کوچک", saleType: "count" },
      { label: "اسلایس بزرگ", from: "باقلوا گردویی اسلایس بزرگ", saleType: "count" },
    ],
  },
  {
    name: "باقلوا پسته‌ای",
    category: "baklava",
    categoryLabel: "باقلوا",
    saleTypeLabels: { weight: "کیلویی", count: "اسلایسی" },
    variants: [
      { label: "کیلویی استانبولی", from: "باقلوا استانبولی پسته‌ای (کیلویی)", saleType: "weight" },
      { label: "کیلویی سوپر", from: "باقلوا پسته‌ای سوپر (کیلویی)", saleType: "weight" },
      { label: "اسلایس کوچک", from: "باقلوا پسته‌ای اسلایس کوچک", saleType: "count" },
      { label: "اسلایس بزرگ", from: "باقلوا پسته‌ای اسلایس بزرگ", saleType: "count" },
    ],
  },

  // ----- باقلوای عربی -----
  {
    name: "باقلوا عربی گردویی",
    variants: [
      { label: "اسلایس کوچک", from: "اسلایس کوچک گردویی عربی" },
      { label: "اسلایس بزرگ", from: "اسلایس بزرگ گردویی عربی" },
    ],
  },
  {
    name: "باقلوا عربی پسته‌ای",
    variants: [
      { label: "اسلایس کوچک", from: "اسلایس کوچک پسته‌ای عربی" },
      { label: "اسلایس بزرگ", from: "اسلایس بزرگ پسته‌ای عربی" },
    ],
  },
  {
    name: "هاویچ گردویی",
    category: "arabic-baklava",
    categoryLabel: "باقلوا عربی",
    variants: [
      { label: "استانبولی", from: "هاویچ استانبولی گردویی" },
      { label: "عربی", from: "هاویچ گردویی عربی" },
    ],
  },
  {
    name: "هاویچ پسته‌ای",
    category: "arabic-baklava",
    categoryLabel: "باقلوا عربی",
    variants: [
      { label: "استانبولی", from: "هاویچ استانبولی پسته‌ای" },
      { label: "عربی", from: "هاویچ پسته‌ای عربی" },
    ],
    // در منو دو بار (یک‌بار «یک اسلایس» و یک‌بار «اسلایسی») با همین قیمت آمده بود
    absorbs: ["هاویچ پسته‌ای عربی (اسلایسی)"],
  },

  // ----- کنافه -----
  {
    name: "کنافه پنیری با شهد عسل و زعفران",
    variants: [
      { label: "ساده – یک‌نفره", from: "کنافه پنیری یک‌نفره با شهد عسل و زعفران" },
      { label: "ساده – دونفره", from: "کنافه پنیری دونفره با شهد عسل و زعفران" },
      { label: "ساده – سه الی چهار نفره", from: "کنافه پنیری سه الی چهار نفره با شهد عسل و زعفران" },
      { label: "نوتلایی – تک‌نفره", from: "کنافه پنیری نوتلایی تک‌نفره با شهد عسل و زعفران" },
      { label: "نوتلایی – دونفره", from: "کنافه پنیری نوتلایی دونفره با شهد عسل و زعفران" },
      { label: "نوتلایی – سه الی چهار نفره", from: "کنافه پنیری نوتلایی سه الی چهار نفره با شهد عسل و زعفران" },
    ],
  },

  // ----- سیب‌زمینی و پاستا (تجریش) -----
  {
    name: "سیب‌زمینی",
    description: "ادویه یا سس دلخواه (ارگانیک)",
    variants: [
      { label: "کوچک (۲۰۰ گرم)", from: "سیب‌زمینی کوچک" },
      { label: "متوسط", from: "سیب‌زمینی متوسط" },
      { label: "بزرگ (۴۵۰ گرم)", from: "سیب‌زمینی بزرگ" },
    ],
  },
  {
    name: "پاستا آلفردو",
    variants: [
      { label: "چیکن", from: "پاستا چیکن آلفردو" },
      { label: "بیف", from: "پاستا بیف آلفردو" },
    ],
  },

  // ----- کباب ترکی: ساندویچ (مینی/متوسط/بزرگ) و پرس (شماره ۱ تا ۳) هر نوع گوشت در یک محصول (تجریش) -----
  ...(["مرغ", "گوشت", "مخلوط"] as const).map(
    (meat): MergeSpec => ({
      name: `کباب ترکی ${meat}`,
      variants: [
        { label: "ساندویچ مینی", from: `ساندویچ کباب ترکی ${meat}`, fromVariant: "مینی" },
        { label: "ساندویچ متوسط", from: `ساندویچ کباب ترکی ${meat}`, fromVariant: "متوسط" },
        { label: "ساندویچ بزرگ", from: `ساندویچ کباب ترکی ${meat}`, fromVariant: "بزرگ" },
        { label: "پرس شماره ۱", from: `پرس شماره ۱ ${meat}` },
        { label: "پرس شماره ۲", from: `پرس شماره ۲ ${meat}` },
        { label: "پرس شماره ۳", from: `پرس شماره ۳ ${meat}` },
      ],
    }),
  ),

  // ----- استیک (تجریش) -----
  {
    name: "استیک مرغ",
    variants: [
      { label: "ساندویچ", from: "ساندویچ استیک مرغ" },
      { label: "پرسی", from: "ساندویچ استیک پرسی مرغ" },
    ],
  },
  {
    name: "استیک گوشت",
    variants: [
      { label: "ساندویچ", from: "ساندویچ استیک گوشت" },
      { label: "پرسی", from: "ساندویچ استیک پرسی گوشت" },
    ],
  },

  // ----- نوشیدنی -----
  {
    name: "اسپرسو",
    variants: [
      { label: "سینگل", from: "اسپرسو سینگل" },
      { label: "دبل", from: "اسپرسو دبل" },
    ],
  },
  {
    name: "لته سرد",
    variants: [
      { label: "پسته", from: "لته پسته (سرد)" },
      { label: "کارامل", from: "لته کارامل (سرد)" },
      { label: "انبه", from: "لته انبه (سرد)" },
      { label: "توت‌فرنگی", from: "لته توت‌فرنگی (سرد)" },
      { label: "زعفران", from: "لته زعفران (سرد)" },
    ],
  },

  // ----- بیکری (پیروزی) -----
  {
    name: "کروسان کره‌ای",
    variants: [
      { label: "ساده", from: "کروسان کره‌ای" },
      { label: "شکلاتی", from: "کروسان کره‌ای شکلاتی" },
    ],
  },
  {
    name: "کیوب کروسان کره‌ای",
    variants: [
      { label: "ساده", from: "کیوب کروسان کره‌ای" },
      { label: "شکلاتی", from: "کیوب کروسان کره‌ای شکلاتی" },
    ],
  },
];

const legacyIdByName = new Map<string, string>();
const legacyByName = new Map<string, LegacyRawMenuItem>();
LEGACY_RAW_MENU_ITEMS.forEach((item, index) => {
  if (legacyByName.has(item.name)) throw new Error(`نام آیتم منو تکراری است: «${item.name}»`);
  legacyByName.set(item.name, item);
  legacyIdByName.set(item.name, `rm${index + 1}`);
});

function legacyOrThrow(name: string, context: string): LegacyRawMenuItem {
  const item = legacyByName.get(name);
  if (!item) throw new Error(`ادغام نسخه‌ها: ردیف «${name}» (در «${context}») در منوی اولیه پیدا نشد.`);
  return item;
}

export interface MergedMenuGroup {
  id: string;
  name: string;
  /** شناسه‌ی ردیف‌های اولیه‌ای که در این محصول ادغام شده‌اند (برای اصلاح دیتابیس‌های قدیمی) */
  memberLegacyIds: string[];
}

export const MERGED_MENU_GROUPS: MergedMenuGroup[] = [];

function buildMenuItems(): RawMenuItem[] {
  const consumed = new Set<string>();
  const mergedAt = new Map<number, RawMenuItem>(); // جایگاه (اولین ردیف عضو) → محصول ادغام‌شده

  MERGE_SPECS.forEach((spec, specIndex) => {
    const id = `rmg${specIndex + 1}`;
    const memberNames = [...spec.variants.map((v) => v.from), ...(spec.absorbs ?? [])];
    const members = [...new Set(memberNames)].map((name) => legacyOrThrow(name, spec.name));

    for (const name of new Set(memberNames)) {
      if (consumed.has(name)) throw new Error(`ادغام نسخه‌ها: ردیف «${name}» در دو گروه آمده است.`);
      consumed.add(name);
    }

    const first = members[0]!;
    const scopes = new Set(members.map((m) => m.branchScope));
    if (scopes.size > 1) throw new Error(`ادغام نسخه‌ها: ردیف‌های «${spec.name}» شعبه فروش یکسان ندارند.`);

    const variants: RawMenuVariant[] = spec.variants.map((v) => {
      const source = legacyOrThrow(v.from, spec.name);
      const sourceVariant = v.fromVariant ? source.variants.find((x) => x.label === v.fromVariant) : source.variants[0];
      if (!sourceVariant) throw new Error(`ادغام نسخه‌ها: نسخه «${v.fromVariant}» در «${v.from}» پیدا نشد.`);
      return {
        label: v.label,
        price: sourceVariant.price,
        priceUncertain: sourceVariant.priceUncertain,
        saleType: v.saleType ?? source.unitType,
      };
    });

    const descriptions = new Set(members.map((m) => m.description).filter(Boolean));
    const merged: RawMenuItem = {
      id,
      name: spec.name,
      category: spec.category ?? first.category,
      categoryLabel: spec.categoryLabel ?? first.categoryLabel,
      unitType: variants[0]!.saleType ?? first.unitType,
      description: spec.description ?? (descriptions.size === 1 ? [...descriptions][0] : undefined),
      branchScope: first.branchScope,
      variants,
      saleTypeLabels: spec.saleTypeLabels,
    };

    const memberIds = [...new Set(memberNames)].map((name) => legacyIdByName.get(name)!);
    MERGED_MENU_GROUPS.push({ id, name: spec.name, memberLegacyIds: memberIds });
    const position = Math.min(...memberNames.map((name) => LEGACY_RAW_MENU_ITEMS.indexOf(legacyByName.get(name)!)));
    mergedAt.set(position, merged);
  });

  const result: RawMenuItem[] = [];
  LEGACY_RAW_MENU_ITEMS.forEach((item, index) => {
    const merged = mergedAt.get(index);
    if (merged) result.push(merged);
    if (consumed.has(item.name)) return; // عضو یک گروه: خودش دیگر ردیف جدا ندارد
    result.push({ ...item, id: `rm${index + 1}` });
  });
  return result;
}

/** منوی نهایی که کاتالوگ فروشگاه از آن ساخته می‌شود: ردیف‌های ادغام‌شده + ردیف‌های تکی */
export const RAW_MENU_ITEMS: RawMenuItem[] = buildMenuItems();
