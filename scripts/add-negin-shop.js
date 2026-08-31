// Standalone helper — deliberately plain JavaScript (not TypeScript) so it
// runs with a bare `node`, no ts-node/build step required. It talks to the
// same data/inquiries.db file the Next.js app uses.
//
// چرا این اسکریپت لازمه:
// گالری «نمونه‌کارها» تو صفحه‌ی اصلی از یه جدول تو دیتابیس (projects) خونده
// می‌شه، نه مستقیم از lib/businessSites.ts. اون فایل فقط یه بار — همون اول
// کار — تو دیتابیس seed شده؛ از اون به بعد دیتابیس منبع اصلیه و باید یا از
// /dashboard > پروژه‌ها اضافه کنی، یا با همین اسکریپت.
//
// این اسکریپت دو کار می‌کنه:
//   ۱. اگه پروژه‌ی «نگین شاپ» تو دیتابیس نباشه، اضافه‌ش می‌کنه (با دسته‌بندی
//      جدید «لوازم آرایشی و بهداشتی»).
//   ۲. پروژه‌های «گلگون» و «دیوان عطر» رو هم (اگه باشن) به همین دسته‌بندی
//      جدید منتقل می‌کنه — تا همون اول با ۳ نمونه شروع بشه، نه ۱.
//
// اجرا (از ریشه‌ی پروژه، همونجایی که package.json هست):
//   node scripts/add-negin-shop.js

const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.join(__dirname, "..", "data", "inquiries.db");
const db = new Database(dbPath);

const NEW_CATEGORY = "لوازم آرایشی و بهداشتی";

const NEGIN_SHOP = {
  name: "نگین شاپ",
  category: NEW_CATEGORY,
  description:
    "فروشگاه لوازم آرایشی و بهداشتی با هویت بصری طلایی و مجلل؛ دسته‌بندی محصولات، فیلتر و انیمیشن‌های ظریف.",
  url: "/projects/negin-shop.html",
  image: "/screenshots/negin-shop.jpg",
};

// هر آیتمی که از قبل با همین url تو دیتابیس باشه یعنی همون سایته — فقط
// دسته‌بندیش رو آپدیت می‌کنیم، دوباره insert نمی‌کنیم (این باعث می‌شه اجرای
// چندبارهٔ اسکریپت هم بی‌خطر باشه).
const RECATEGORIZE_URLS = ["/projects/golgoon-cosmetics.html", "/projects/divan-atr.html"];

function upsertNeginShop() {
  const existing = db.prepare(`SELECT id FROM projects WHERE url = ?`).get(NEGIN_SHOP.url);
  if (existing) {
    db.prepare(`UPDATE projects SET name = ?, category = ?, description = ?, image = ? WHERE id = ?`).run(
      NEGIN_SHOP.name,
      NEGIN_SHOP.category,
      NEGIN_SHOP.description,
      NEGIN_SHOP.image,
      existing.id
    );
    console.log(`نگین شاپ از قبل بود (id ${existing.id}) — به‌روزرسانی شد.`);
  } else {
    const result = db
      .prepare(`INSERT INTO projects (name, category, description, url, image) VALUES (@name, @category, @description, @url, @image)`)
      .run(NEGIN_SHOP);
    console.log(`نگین شاپ اضافه شد (id ${result.lastInsertRowid}).`);
  }
}

function recategorize() {
  for (const url of RECATEGORIZE_URLS) {
    const row = db.prepare(`SELECT id, name, category FROM projects WHERE url = ?`).get(url);
    if (!row) {
      console.log(`(پیدا نشد، رد شد: ${url})`);
      continue;
    }
    if (row.category === NEW_CATEGORY) {
      console.log(`${row.name} از قبل تو دسته‌ی جدید بود.`);
      continue;
    }
    db.prepare(`UPDATE projects SET category = ? WHERE id = ?`).run(NEW_CATEGORY, row.id);
    console.log(`${row.name} به دسته‌ی «${NEW_CATEGORY}» منتقل شد.`);
  }
}

upsertNeginShop();
recategorize();

const { count } = db
  .prepare(`SELECT COUNT(*) AS count FROM projects WHERE category = ?`)
  .get(NEW_CATEGORY);
console.log(`\nالان «${NEW_CATEGORY}» ${count} نمونه‌سایت داره.`);
