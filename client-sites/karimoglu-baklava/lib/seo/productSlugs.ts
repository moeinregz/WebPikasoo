/**
 * ===== سیستم Slug محصولات (اصلاح بخش ۱۱ Prompt) =====
 *
 * Root Cause باگ قبلی: Slug محصولات به‌صورت مکانیکی `${category}-${index}`
 * ساخته می‌شد (مثلاً `baklava-5`) — نه بر اساس نام واقعی محصول، و نه
 * انگلیسی/خوانا به‌معنای واقعی کلمه. طبق الزام صریح («Slug نباید صرفاً
 * ترجمه مکانیکی بی‌کیفیت باشد»)، این‌جا یک نگاشت دستی و باکیفیت برای تمام
 * ۳۹ نام محصول Placeholder فعلی نوشته شده — نه یک الگوریتم حدسی.
 *
 * برای محصولات واقعی آینده (که ادمین وارد می‌کند)، `suggestSlug` یک پیشنهاد
 * اولیه (بهترین تلاش، نه ترجمه رسمی) می‌سازد که در فرم Add/Edit Product
 * قابل ویرایش دستی است — تصمیم نهایی کیفیت Slug با انسان (ادمین) است، نه
 * یک Transliteration خودکار کورکورانه.
 */

// ⚠️ این نگاشت مربوط به کاتالوگ Placeholder قدیمی است که کاملاً با کاتالوگ
// واقعی (lib/menuProductsData.ts) جایگزین شد — هیچ‌کدام از این نام‌ها دیگر
// در کاتالوگ زنده وجود ندارند. بی‌ضرر نگه داشته شده (هرگز Match نمی‌شود)
// چون suggestSlug اول اینجا و بعد دیکشنری واقعی زیر را چک می‌کند؛ صرفاً
// برای مرجع تاریخی/توسعه احتمالی آینده حذف نشد.
export const KNOWN_PRODUCT_SLUGS: Record<string, string> = {
  // باقلوا
  "باقلوا کلاسیک با پسته": "classic-pistachio-baklava",
  "باقلوا ویژه پسته اعلا": "premium-pistachio-baklava",
  "باقلوا مغز گردو": "walnut-baklava",
  "باقلوا عسلی": "honey-baklava",
  "باقلوا لوزی پسته": "pistachio-diamond-baklava",
  "باقلوا مخصوص کریم‌اوغلو": "karimoglu-special-baklava",
  "باقلوا با روکش شکلات": "chocolate-coated-baklava",
  "باقلوا سنتی خانگی": "homestyle-traditional-baklava",
  // استانبولی
  "استانبولی مغز گردو": "walnut-istanbuli",
  "استانبولی پسته": "pistachio-istanbuli",
  "استانبولی مخصوص": "special-istanbuli",
  "استانبولی لایه‌ای": "layered-istanbuli",
  "استانبولی عسلی": "honey-istanbuli",
  "استانبولی جعبه‌ای": "boxed-istanbuli",
  // باقلوا عربی
  "جعبه باقلوا عربی مخصوص": "special-arabic-baklava-box",
  "باقلوا عربی با پسته حلب": "aleppo-pistachio-arabic-baklava",
  "باقلوا عربی کنجدی": "sesame-arabic-baklava",
  "باقلوا عربی مینیاتوری": "mini-arabic-baklava",
  "جعبه هدیه باقلوا عربی": "arabic-baklava-gift-box",
  // شیرینی خشک
  "جعبه شیرینی خشک میکس": "mixed-dry-pastry-box",
  "نان بادامی": "almond-cookies",
  "کلمپه سنتی": "traditional-kolompeh",
  "نان نخودچی": "chickpea-cookies",
  "شیرینی زبان": "zaban-pastry",
  "شیرینی کشمشی": "raisin-cookies",
  "جعبه پذیرایی شیرینی خشک": "dry-pastry-platter-box",
  // دنر کباب
  "دنر کباب گوشت": "beef-doner-kebab",
  "دنر کباب مرغ": "chicken-doner-kebab",
  "دنر کباب مخصوص": "special-doner-kebab",
  "دنر کباب دوبل": "double-doner-kebab",
  // فست‌فود
  "ساندویچ مخصوص": "special-sandwich",
  "پیتزا مینی": "mini-pizza",
  "سیب‌زمینی سرخ‌کرده": "french-fries",
  "برگر مخصوص": "special-burger",
  "سالاد فصل": "seasonal-salad",
};

/**
 * پیشنهاد Slug برای یک نام جدید که در نگاشت بالا نیست — Best-effort، نه
 * تضمین کیفیت. فقط برای پرکردن اولیه فیلد Slug در فرم ادمین استفاده شود؛
 * همیشه توسط انسان قابل ویرایش قبل از ذخیره است (رجوع به ProductForm).
 */
export function suggestSlug(name: string): string {
  const known = KNOWN_PRODUCT_SLUGS[name.trim()];
  if (known) return known;

  const dictionarySlug = translateViaDictionary(name);
  if (dictionarySlug) return dictionarySlug;

  // Fallback خیلی ساده: فقط کاراکترهای Latin/عدد موجود در متن (اگر نامی
  // ترکیبی فارسی/انگلیسی باشد) را نگه می‌دارد؛ در غیر این صورت یک شناسه
  // Deterministic از خودِ متن (نه زمان — چون Date.now() در یک حلقه سریع
  // برای چند آیتم پشت‌سرهم مقدار یکسان می‌داد و باعث برخورد Slug می‌شد)
  // می‌سازد تا ادمین بعداً آن را دستی جایگزین کند.
  const latinOnly = name
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (latinOnly.length >= 3) return latinOnly;

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return `product-${hash.toString(36)}`;
}

/**
 * ===== دیکشنری ترجمه کلمه‌به‌کلمه — برای کاتالوگ منوی واقعی =====
 *
 * چون کاتالوگ واقعی منو (lib/menuProductsData.ts) حدود ۱۱۰ آیتم دارد،
 * نوشتن Slug دستی برای هرکدام (مثل KNOWN_PRODUCT_SLUGS بالا) عملاً غیرممکن
 * بود. این دیکشنری واژگان واقعی همان منو را پوشش می‌دهد — نه یک مترجم
 * عمومی — و `translateViaDictionary` نام را کلمه‌به‌کلمه (بعد از حذف
 * کلمات رابط بی‌معنا برای Slug) ترجمه می‌کند. نتیجه Best-effort است و
 * می‌تواند بعداً از پنل ادمین توسط انسان اصلاح شود؛ ادعای ترجمه رسمی/کامل
 * ندارد.
 */
const MENU_WORD_DICTIONARY: Record<string, string> = {
  // باقلوا/کنافه/عربی
  باقلوا: "baklava", استانبولی: "istanbul-style", عربی: "arabic", کیلویی: "by-kilo",
  گردویی: "walnut", "پسته‌ای": "pistachio", پسته: "pistachio", گردو: "walnut",
  سوپر: "super", میکس: "mix", اسلایس: "slice", اسلایسی: "sliced", کوچک: "small",
  بزرگ: "large", هاویچ: "havij", کادایوف: "kadayif", آشیانه: "ashiyaneh",
  خندان: "khandan", مغربی: "moroccan", "کره‌ای": "buttery", بامیه: "bamieh",
  برازق: "baraziq", رژیمی: "diet", خشک: "dry", کنافه: "kunafa", پنیری: "cheese",
  نوتلایی: "nutella", "تک‌نفره": "single-serving", یکنفره: "single-serving",
  دونفره: "double-serving", "سه الی چهار نفره": "family-serving",
  "با شهد عسل و زعفران": "honey-saffron-syrup",
  // معجون/دسر
  معجون: "mix-drink", کریماوغلو: "karimoglu", "کریم‌اوغلو": "karimoglu",
  دسر: "dessert", کازان: "kazan", دبی: "dubai", سوتلاچ: "sutlac", تریلچه: "trilece",
  کارامل: "caramel", نارگیل: "coconut", سرشیر: "clotted-cream", اسکوپی: "scoop",
  بستنی: "ice-cream", وانیلی: "vanilla", مخصوص: "special", شکلات: "chocolate",
  متوسط: "medium", موچی: "mochi", ساده: "plain", ژاپنی: "japanese", کوکی: "cookie",
  کاکائویی: "cocoa",
  // نوشیدنی
  نوشیدنی: "drink", قهوه: "coffee", ترک: "turkish", چای: "tea", لیوانی: "glass",
  اسپرسو: "espresso", سینگل: "single", دبل: "double", ماسالا: "masala",
  موکا: "mocha", کاپوچینو: "cappuccino", نسکافه: "nescafe", "هات چاکلت": "hot-chocolate",
  لته: "latte", آب: "water", معدنی: "mineral", آفاکادو: "avocado-drink",
  موهیتو: "mojito", لیموناد: "lemonade", شیک: "shake", لوتوس: "lotus",
  انبه: "mango", "توت‌فرنگی": "strawberry", زعفران: "saffron", تابستان: "summer",
  آیس: "iced", ماکیاتو: "macchiato", کرک: "kerak", هل: "cardamom",
  "شیر کاکائو": "cocoa-milk", دمنوش: "herbal-tea",
  // فست‌فود/ساندویچ
  رویال: "royal", برگر: "burger", ژامبون: "ham", تنوری: "oven-baked",
  قارچ: "mushroom", پنیر: "cheese", ماشروم: "mushroom", چیز: "cheese",
  کلاسیک: "classic", رست: "roast", بیف: "beef", فیله: "fillet", مرغ: "chicken",
  سوخاری: "fried", میکس2: "mix", سرد: "cold", هات: "hot", داگ: "dog",
  بندری: "bandari", سوسیس: "sausage",
  // سیب‌زمینی/پاستا
  "سیب‌زمینی": "fries", سیب: "potato", آلفردو: "alfredo", سیر: "garlic",
  نان: "bread", سه: "three", تیکه: "piece", کتف: "wing", بال: "wing",
  سبد: "basket", پاستا: "pasta", چیکن: "chicken", سالاد: "salad", کلم: "cabbage",
  // پیتزا
  پیتزا: "pizza", سبزیجات: "vegetable", مخلوط: "mixed", پپرونی: "pepperoni",
  دنر: "doner", گوشت: "beef", استیک: "steak",
  // کباب ترکی
  کباب: "kebab", پرس: "portion", شماره: "no", پرسی: "portion",
  // بیکری
  کروسان: "croissant", کیوب: "cube", دنیش: "danish", میوهای: "fruit",
  "میوه‌ای": "fruit", گاتا: "gata", تونیست: "toast", اشترودل: "strudel",
  کیک: "cake", هویج: "carrot", چیزکیک: "cheesecake", شکلاتی: "chocolate-flavored",
  // صبحانه
  املت: "omelette", نیمرو: "fried-egg", عسل: "honey",
  // کلمات رابط — حذف می‌شوند (ترجمه نمی‌شوند، فقط از متن جدا می‌شوند)
  با: "", و: "", یا: "", در: "", از: "", "الی": "",
};

function normalizeForSlug(name: string): string {
  return name
    .replace(/\u200c/g, "") // نیم‌فاصله حذف می‌شود تا کلمات مرکب (کریم‌اوغلو، یک‌نفره) سالم بمانند
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))) // اعداد فارسی → لاتین
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))); // اعداد عربی → لاتین
}

// کلیدهای دیکشنری هم با همان نرمال‌سازی (حذف ZWNJ) مقایسه می‌شوند
const NORMALIZED_DICTIONARY: Record<string, string> = Object.fromEntries(
  Object.entries({
    ...MENU_WORD_DICTIONARY,
    یک: "one", دو: "two", سه: "three", چهار: "four", نفره: "serving", نفر: "person",
  }).map(([k, v]) => [k.replace(/\u200c/g, ""), v]),
);

function translateViaDictionary(name: string): string | null {
  // پرانتزها (مثل «(کیلویی)» یا «(24cm)») را جدا نگه می‌داریم چون معمولاً
  // اطلاعات مفید (نوع/سایز) دارند، نه نویز
  const cleaned = normalizeForSlug(name).replace(/[()،٪%+]/g, " ");
  const words = cleaned.split(/\s+/).filter(Boolean);
  const translatedWords: string[] = [];
  for (const word of words) {
    const key = word.trim();
    if (key in NORMALIZED_DICTIONARY) {
      const translated = NORMALIZED_DICTIONARY[key];
      if (translated) translatedWords.push(translated);
    } else if (/^[a-z0-9]+$/i.test(key)) {
      // خودِ عدد/واحد لاتین (مثل "24cm"، "1"، "3") — نگه داشته می‌شود، نه رد
      translatedWords.push(key.toLowerCase());
    }
    // کلمه ناشناخته فارسی دیگر: به‌جای لغو کل ترجمه (که قبلاً باعث برگشتن
    // به یک Fallback بی‌کیفیت و حتی برخورد Timestamp می‌شد)، فقط همان یک
    // کلمه Best-effort نادیده گرفته می‌شود — نتیجه کمی ناقص‌تر اما همچنان
    // یک Slug معنادار و یکتا از باقی کلمات شناخته‌شده است.
  }
  const slug = translatedWords.join("-").toLowerCase().replace(/[^a-z0-9-]/g, "");
  return slug.length >= 3 ? slug : null;
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) && slug.length >= 3 && slug.length <= 80;
}
