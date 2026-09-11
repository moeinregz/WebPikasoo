// One-off helper for the CRM "note" → "business_type" / "problem_status"
// migration. It CANNOT be run from inside the chat session that wrote this
// file — that session has no network access and never touched your real
// database — so this is something you run yourself, once, from your own
// machine or server.
//
// What it does:
//   For every existing crm_leads document that still has its old free-text
//   `note` field (and no business_type/problem_status yet), it guesses a
//   business_type and/or problem_status from keywords found in that note,
//   using the exact category list from lib/businessSites.ts and the exact
//   problem-status list from lib/crmReport.ts, so anything it sets is a
//   value the app itself recognizes.
//
//   This is a rough guess, not a real classifier — Persian free text is
//   too varied to match reliably by keyword. Nothing is written to the
//   database until you pass --commit; without it, the script only PRINTS
//   what it would change, per lead, so you can read through and sanity
//   check it first. Leads it can't confidently guess are left untouched —
//   go set those two fields by hand from the CRM tab instead of guessing.
//
// Usage (run from the project root, i.e. the folder with package.json):
//   node -r dotenv/config scripts/backfill-crm-fields.js            (dry run — just prints)
//   node -r dotenv/config scripts/backfill-crm-fields.js --commit   (actually writes)
// (the `-r dotenv/config` flag loads MONGODB_URI from .env.local — install
// with `npm install dotenv --save-dev` once, or export MONGODB_URI in your
// shell before running the plain `node scripts/backfill-crm-fields.js`.)

const { MongoClient } = require("mongodb");

// Keep this in sync with lib/businessSites.ts's `categories` export.
const BUSINESS_CATEGORIES = [
  "رستوران و کافه",
  "فروشگاه و ای‌کامرس",
  "لوازم آرایشی و بهداشتی",
  "پزشکی و کلینیک",
  "املاک و مستغلات",
  "آموزشی",
  "خدماتی",
  "شرکتی و کسب‌وکار",
  "گردشگری و اقامتی",
];

// Rough keyword hints per category — edit these to match how your team
// actually writes notes before trusting the output.
const CATEGORY_KEYWORDS = {
  "رستوران و کافه": ["رستوران", "کافه", "فست فود", "فست‌فود", "قنادی", "شیرینی", "آبمیوه", "بستنی"],
  "فروشگاه و ای‌کامرس": ["فروشگاه", "بوتیک", "فروش آنلاین", "ای کامرس", "ای‌کامرس", "مغازه"],
  "لوازم آرایشی و بهداشتی": ["آرایشی", "بهداشتی", "لوازم آرایش", "سالن زیبایی"],
  "پزشکی و کلینیک": ["کلینیک", "پزشک", "دندانپزشک", "دکتر", "مطب"],
  "املاک و مستغلات": ["املاک", "مستغلات", "مشاور املاک", "بنگاه"],
  "آموزشی": ["آموزشگاه", "آموزشی", "مدرسه", "آموزش"],
  "خدماتی": ["خدمات", "تعمیر", "تعمیرگاه"],
  "شرکتی و کسب‌وکار": ["شرکت", "استارتاپ", "کسب و کار", "کسب‌وکار"],
  "گردشگری و اقامتی": ["هتل", "اقامتگاه", "تور", "گردشگری", "بوم‌گردی"],
};

// Keep this in sync with lib/crmReport.ts's `CRM_PROBLEM_STATUS_OPTIONS`.
const PROBLEM_STATUS_KEYWORDS = {
  "سایت نداره": ["سایت نداره", "سایت نداره", "بدون سایت", "سایت نداشت"],
  "نیاز به بهینه‌سازی سایت": ["بهینه", "کند", "قدیمی بود", "طراحی بده", "خرابه"],
  "نیاز به سئو": ["سئو", "seo", "رتبه گوگل", "رنک نداره"],
};

function guessBusinessType(note) {
  const text = (note || "").toLowerCase();
  for (const category of BUSINESS_CATEGORIES) {
    const hints = CATEGORY_KEYWORDS[category] || [];
    if (hints.some((h) => text.includes(h.toLowerCase()))) return category;
  }
  return "";
}

function guessProblemStatus(note) {
  const text = (note || "").toLowerCase();
  for (const status of Object.keys(PROBLEM_STATUS_KEYWORDS)) {
    const hints = PROBLEM_STATUS_KEYWORDS[status];
    if (hints.some((h) => text.includes(h.toLowerCase()))) return status;
  }
  return "";
}

async function main() {
  const commit = process.argv.includes("--commit");

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error(
      "متغیر محیطی MONGODB_URI تنظیم نشده. یا آن را export کن، یا با `node -r dotenv/config scripts/backfill-crm-fields.js ...` اجرا کن تا از .env.local خونده بشه."
    );
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  try {
    const db = client.db(process.env.MONGODB_DB || "webpikaso");
    const leads = db.collection("crm_leads");

    const all = await leads
      .find({}, { projection: { _id: 0 } })
      .sort({ id: 1 })
      .toArray();

    let guessed = 0;
    let skipped = 0;

    for (const lead of all) {
      const alreadySet = lead.business_type || lead.problem_status;
      if (alreadySet) {
        skipped++;
        continue;
      }

      const note = lead.note || "";
      const businessType = guessBusinessType(note);
      const problemStatus = guessProblemStatus(note);

      if (!businessType && !problemStatus) {
        console.log(`#${lead.id} ${lead.name} — یادداشت: "${note}" → حدسی زده نشد، دستی پر کن.`);
        skipped++;
        continue;
      }

      guessed++;
      console.log(
        `#${lead.id} ${lead.name} — یادداشت: "${note}" → نوع کسب‌وکار: "${businessType || "—"}", وضعیت مشکل: "${problemStatus || "—"}"`
      );

      if (commit) {
        const set = {};
        if (businessType) set.business_type = businessType;
        if (problemStatus) set.problem_status = problemStatus;
        await leads.updateOne({ id: lead.id }, { $set: set });
      }
    }

    console.log("");
    console.log(`${guessed} مورد ${commit ? "به‌روزرسانی شد" : "قابل حدس بود (dry run — چیزی ذخیره نشد)"}.`);
    console.log(`${skipped} مورد بدون تغییر ماند (یا قبلاً پر بود، یا حدسی پیدا نشد).`);
    if (!commit) {
      console.log("برای ذخیره‌ی واقعی این تغییرات، دوباره با فلگ --commit اجرا کن.");
    }
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
