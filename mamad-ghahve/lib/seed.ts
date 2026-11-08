import type Database from "better-sqlite3";
import { hashPassword } from "./hash";

/** اولین اجرا: دسته‌ها، محصولات نمونه، اسلایدها، تنظیمات و ادمین پیش‌فرض ساخته می‌شن. */
export function seedIfEmpty(db: Database.Database) {
  const hasAdmin = db.prepare("SELECT COUNT(*) c FROM admins").get() as { c: number };
  if (!hasAdmin.c) {
    db.prepare("INSERT INTO admins (username, password_hash) VALUES (?, ?)").run(
      process.env.ADMIN_USERNAME || "admin",
      hashPassword(process.env.ADMIN_PASSWORD || "admin123")
    );
  }

  const defaults: Record<string, string> = {
    shop_name: "ممد قهوه",
    shop_tagline: "قهوه‌ی تازه‌برشته، درِ خونه‌ی شما",
    shop_phone: "۰۹۳۶۴۶۰۵۵۴۹",
    shop_address: "کرج، کرج نو، آزادراه شهید فلاحی، بلوار شهید بهشتی، خ دهقان ویلای دوم، پ ۳۸",
    instagram: "",
    shipping_fee: "60000",
    free_shipping_over: "1500000",
    // باشگاه مشتریان
    club_earn_per: "10000", // به ازای هر چند تومان خرید، ۱ امتیاز
    club_point_value: "100", // ارزش هر امتیاز موقع خرج کردن (تومان)
    club_welcome_points: "200",
    club_max_redeem_percent: "30", // حداکثر درصد مبلغ سفارش که با امتیاز پرداخت می‌شه
    // درگاه‌ها
    pay_mock_enabled: "1",
    zarinpal_enabled: "0",
    zarinpal_merchant: "",
    zarinpal_sandbox: "1",
    snappay_enabled: "0",
    snappay_base_url: "https://api.snapppay.ir", // آدرس دقیق (تست یا اصلی) رو اسنپ‌پی بعد از قرارداد می‌ده
    snappay_client_id: "",
    snappay_client_secret: "",
    snappay_username: "",
    snappay_password: "",
    digipay_enabled: "0",
    digipay_base_url: "https://uat.mydigipay.info",
    digipay_client_id: "",
    digipay_client_secret: "",
    digipay_username: "",
    digipay_password: "",
    digipay_ticket_type: "11",
    // باسلام
    basalam_token: "",
    basalam_vendor_id: "",
    basalam_category_id: "",
    basalam_base_url: "https://openapi.basalam.com",
    basalam_unit_type: "6304", // 6304 = عدد، 6306 = گرم، 6305 = کیلوگرم
    basalam_preparation_days: "2",
    basalam_price_unit: "rial", // rial | toman
  };
  const ins = db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");
  for (const [k, v] of Object.entries(defaults)) ins.run(k, v);

  const hasCats = db.prepare("SELECT COUNT(*) c FROM categories").get() as { c: number };
  if (hasCats.c) {
    // دیتابیس‌های قدیمی: به اسلایدهای پیش‌فرضِ بدون عکس، تصویرسازی بده (فقط یک بار)
    // آدرس جدید API باسلام
    db.prepare("UPDATE settings SET value = 'https://openapi.basalam.com' WHERE key = 'basalam_base_url' AND value IN ('https://core.basalam.com', '')").run();
    const done = db.prepare("SELECT value FROM settings WHERE key = 'hero_art_v1'").get();
    if (!done) {
      const art: Record<string, string> = { "☕": "/hero/roast.svg", "🎁": "/hero/club.svg", "⚗️": "/hero/gear.svg" };
      for (const [e, img] of Object.entries(art)) db.prepare("UPDATE slides SET image = ? WHERE image = '' AND emoji = ?").run(img, e);
      db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('hero_art_v1', '1')").run();
    }
    return;
  }

  const cats: [string, string, string][] = [
    ["قهوه دانه", "beans", "🫘"],
    ["قهوه آسیاب‌شده", "ground", "☕"],
    ["کپسول و فوری", "capsule", "🥤"],
    ["لوازم دم‌آوری", "gear", "⚗️"],
    ["شکلات و تنقلات", "snacks", "🍫"],
    ["پک هدیه", "gift", "🎁"],
  ];
  const catIns = db.prepare("INSERT INTO categories (name, slug, icon, sort) VALUES (?, ?, ?, ?)");
  const catId: Record<string, number> = {};
  cats.forEach(([n, s, i], k) => {
    catId[s] = Number(catIns.run(n, s, i, k).lastInsertRowid);
  });

  const G = "دانه,آسیاب اسپرسو,آسیاب موکاپات,آسیاب فرانسه,آسیاب ترک";
  type P = [string, string, string, string, number, number, number, number, string, string, string, number, number];
  // name, cat, short, desc, price, compare, stock, weight, options, color, badge, featured, sales
  const products: P[] = [
    ["اسپرسو بلند ممد", "beans", "۷۰٪ عربیکا، ۳۰٪ روبوستا", "بلند اختصاصی ممد قهوه با بادی سنگین، کرمای پرپشت و نت‌های شکلات تلخ و فندق. مناسب اسپرسو و قهوه‌های شیری.", 485000, 540000, 40, 250, G, "#5a3420", "پرفروش", 1, 128],
    ["عربیکا اتیوپی یرگاچف", "beans", "۱۰۰٪ عربیکا، رست روشن", "تک‌خاستگاه اتیوپی با اسیدیته‌ی روشن و نت‌های گل یاس، لیمو و چای سیاه. برای دم‌آوری دستی عالیه.", 690000, 0, 18, 250, G, "#a5643a", "جدید", 1, 64],
    ["عربیکا کلمبیا سوپریمو", "beans", "۱۰۰٪ عربیکا، رست متوسط", "شیرین و متعادل با نت‌های کارامل، سیب قرمز و کاکائو.", 640000, 0, 25, 250, G, "#7a4a2a", "", 0, 51],
    ["برزیل سانتوس", "beans", "۱۰۰٪ عربیکا، رست متوسط-تیره", "بادی کرمی، اسیدیته‌ی کم و نت بادام‌زمینی و شکلات شیری.", 560000, 620000, 30, 250, G, "#6b3f26", "تخفیف", 0, 87],
    ["روبوستا هند", "beans", "۱۰۰٪ روبوستا، رست تیره", "کافئین بالا و تلخی دلچسب؛ برای کسایی که قهوه‌ی قوی دوست دارن.", 390000, 0, 50, 250, G, "#3f2416", "", 0, 42],
    ["قهوه ترک ممد", "ground", "آسیاب خیلی ریز، هل‌دار", "قهوه ترک با آسیاب پودری و کمی هل؛ عطر خونه‌ی مادربزرگ.", 320000, 360000, 60, 250, "", "#8a5530", "پرفروش", 1, 156],
    ["قهوه فرانسه کلاسیک", "ground", "آسیاب متوسط برای فرنچ‌پرس", "ملایم و خوش‌عطر با نت گردو؛ برای قهوه‌ساز و فرنچ‌پرس.", 350000, 0, 45, 250, "", "#94603a", "", 0, 73],
    ["گلد اسپرسو آسیاب‌شده", "ground", "آسیاب اسپرسو", "مناسب اسپرسوسازهای خانگی و موکاپات.", 410000, 0, 35, 250, "", "#5e3622", "جدید", 0, 22],
    ["کپسول اسپرسو (۱۰ عددی)", "capsule", "سازگار با دستگاه‌های نسپرسو", "هر کپسول ۵.۵ گرم قهوه‌ی تازه‌برشته، شدت ۹ از ۱۲.", 295000, 0, 80, 60, "", "#2f6b5a", "جدید", 1, 39],
    ["گلد فوری (۱۰۰ گرم)", "capsule", "فریز درای، حل‌شونده", "قهوه‌ی فوری طلایی با طعم صاف؛ برای سفر و محل کار.", 340000, 380000, 40, 100, "", "#b5823f", "", 0, 95],
    ["موکاپات ۳ کاپ", "gear", "آلومینیومی، ایتالیایی", "موکاپات کلاسیک ۳ کاپ برای قهوه‌ی غلیظ روی گاز.", 1250000, 1400000, 12, 600, "", "#6f6f73", "تخفیف", 0, 18],
    ["فرنچ‌پرس ۶۰۰ میلی", "gear", "شیشه‌ی پیرکس، فیلتر استیل", "برای دم‌آوری قهوه و چای؛ بدنه‌ی مقاوم به حرارت.", 890000, 0, 15, 700, "", "#3c5a6b", "", 0, 27],
    ["آسیاب دستی سرامیکی", "gear", "تیغه‌ی سرامیکی قابل تنظیم", "آسیاب دستی با تنظیم درجه‌ی آسیاب از ترک تا فرانسه.", 1650000, 0, 8, 500, "", "#4a4a4a", "جدید", 1, 11],
    ["شکلات تلخ ۷۲٪", "snacks", "۱۰۰ گرم، همراه قهوه", "شکلات تلخ با کاکائوی غنا؛ همراه همیشگی اسپرسو.", 185000, 0, 70, 100, "", "#3a2018", "", 0, 110],
    ["بیسکوتی بادام", "snacks", "۲۰۰ گرم، دست‌ساز", "بیسکوتی ایتالیایی دوبار پخت با بادام درختی؛ زدنی تو قهوه.", 220000, 250000, 30, 200, "", "#c9935a", "پرفروش", 0, 134],
    ["پک هدیه‌ی ممد", "gift", "۲ قهوه + ماگ + شکلات", "جعبه‌ی هدیه با دو بسته قهوه‌ی ۲۵۰ گرمی، ماگ سرامیکی ممد قهوه و شکلات تلخ.", 1490000, 1690000, 10, 1200, "", "#8b2f2f", "ویژه", 1, 33],
  ];
  const pIns = db.prepare(
    `INSERT INTO products (name, category_id, short_desc, description, price, compare_price, stock, weight, options, color, badge, is_featured, sales_count, rating, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))`
  );
  products.forEach((p, i) => {
    const [name, cat, short, desc, price, compare, stock, weight, opts, color, badge, feat, sales] = p;
    pIns.run(name, catId[cat], short, desc, price, compare, stock, weight, opts, color, badge, feat, sales, 4.5 + ((i * 7) % 6) / 10, `-${(products.length - i) * 2} days`);
  });

  const slides = [
    ["قهوه‌ی تازه‌برشته، هر هفته", "هر بسته‌ی ممد قهوه حداکثر ۷ روز بعد از برشته‌کاری به دستت می‌رسه.", "خرید قهوه", "/shop?cat=beans", "#3b2316", "☕", "/hero/roast.svg"],
    ["عضو باشگاه مشتری‌های ممد شو", "با هر خرید امتیاز بگیر، با امتیازهات قهوه‌ی مجانی بخر. ۲۰۰ امتیاز هدیه‌ی عضویت!", "عضویت رایگان", "/club", "#6b3a1f", "🎁", "/hero/club.svg"],
    ["تا ۲۰٪ تخفیف لوازم دم‌آوری", "موکاپات، فرنچ‌پرس و آسیاب دستی با قیمت ویژه.", "دیدن تخفیف‌ها", "/shop?cat=gear", "#2a1810", "⚗️", "/hero/gear.svg"],
  ];
  const sIns = db.prepare("INSERT INTO slides (title, subtitle, button_text, button_link, bg, emoji, image, sort) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  slides.forEach((s, i) => sIns.run(...s, i));

  db.prepare("INSERT INTO coupons (code, type, value, min_total, club_only) VALUES (?, ?, ?, ?, ?)").run("MAMAD10", "percent", 10, 500000, 0);
}
