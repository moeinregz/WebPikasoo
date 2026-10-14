// One-off helper: fixes the business type of EXISTING CRM leads whose name says
// they are a «باغ رستوران / باغ‌طور» or a «کبابی / کباب‌سرا», but whose type was
// saved as a generic «رستوران» (or «رستوران و کافه», or left empty).
//
// It uses the very same keyword rules the site builder uses
// (lib/siteTemplates/crmMapping.ts), so what it prints is what the builder
// would have picked from the name anyway — this just writes it into the lead.
// Leads with any other type (کافه، فست‌فود، …) are never touched.
//
// Nothing is written without --commit; without it the script only PRINTS.
//
// Usage (from the project root):
//   node -r dotenv/config scripts/fix-crm-types.js            (dry run)
//   node -r dotenv/config scripts/fix-crm-types.js --commit   (writes)
// (or export MONGODB_URI in your shell and drop `-r dotenv/config`)

const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const { MongoClient } = require("mongodb");

// Let plain node load the project's .ts files (crmMapping.ts → trades.ts).
require.extensions[".ts"] = (module, filename) => {
  const out = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
  }).outputText;
  module._compile(out, filename);
};
const { detectTrades } = require(path.join(__dirname, "..", "lib", "siteTemplates", "crmMapping.ts"));
const { TRADES } = require(path.join(__dirname, "..", "lib", "siteTemplates", "trades.ts"));

const FIXABLE_TYPES = ["", "رستوران", "رستوران و کافه"];
const TARGETS = ["garden", "kebab"];

/** [{ id, name, from, to }] for every lead that should change. */
function plan(leads) {
  const out = [];
  for (const l of leads) {
    const from = (l.business_type || "").trim();
    if (!FIXABLE_TYPES.includes(from)) continue;
    const guess = detectTrades(l.name || "", from);
    if (guess.source !== "name" || guess.tradeIds.length !== 1 || !TARGETS.includes(guess.tradeIds[0])) continue;
    const to = TRADES.find((t) => t.id === guess.tradeIds[0]).label;
    if (to !== from) out.push({ id: l.id, name: l.name, from, to });
  }
  return out;
}

async function main() {
  const commit = process.argv.includes("--commit");
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI تنظیم نشده. آن را export کن یا با `node -r dotenv/config ...` اجرا کن.");
    process.exit(1);
  }
  const client = new MongoClient(uri);
  await client.connect();
  try {
    const db = client.db(process.env.MONGODB_DB || "webpikaso");
    const col = db.collection("crm_leads");
    const all = await col.find({}, { projection: { _id: 0 } }).sort({ id: 1 }).toArray();
    const changes = plan(all);
    for (const c of changes) {
      console.log(`#${c.id} ${c.name} — «${c.from || "بدون نوع"}» → «${c.to}»`);
      if (commit) await col.updateOne({ id: c.id }, { $set: { business_type: c.to } });
    }
    console.log("");
    console.log(`${changes.length} لید ${commit ? "اصلاح شد" : "قابل اصلاحه (dry run — چیزی ذخیره نشد)"}.`);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
module.exports = { plan };
