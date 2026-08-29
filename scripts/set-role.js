// Standalone helper for granting/revoking dashboard access — plain
// JavaScript (not TypeScript) so it runs with a bare `node`, no
// ts-node/build step required. It talks to the same MongoDB Atlas
// database the Next.js app uses (via the MONGODB_URI env var), touching
// only the `users` collection.
//
// Usage (run from the project root, i.e. the folder with package.json):
//   node -r dotenv/config scripts/set-role.js list
//   node -r dotenv/config scripts/set-role.js set <id> <customer|developer|admin>
// (the `-r dotenv/config` flag loads MONGODB_URI from .env.local — install
// with `npm install dotenv --save-dev` once, or just export MONGODB_URI in
// your shell before running the plain `node scripts/set-role.js ...`.)
//
// Examples:
//   node scripts/set-role.js list
//   node scripts/set-role.js set 1 admin
//   node scripts/set-role.js set 2 developer
//   node scripts/set-role.js set 1 customer

const { MongoClient } = require("mongodb");

const VALID_ROLES = ["customer", "developer", "admin"];

async function getUsersCollection() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error(
      "متغیر محیطی MONGODB_URI تنظیم نشده. یا آن را export کن، یا با `node -r dotenv/config scripts/set-role.js ...` اجرا کن تا از .env.local خونده بشه."
    );
    process.exit(1);
  }
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "webpikaso");
  return { client, users: db.collection("users") };
}

async function list() {
  const { client, users } = await getUsersCollection();
  try {
    const all = await users
      .find({}, { projection: { _id: 0, id: 1, name: 1, phone: 1, role: 1 } })
      .sort({ id: 1 })
      .toArray();
    if (all.length === 0) {
      console.log("هیچ کاربری تو دیتابیس نیست — اول یه نفر باید تو /account ثبت‌نام کنه.");
      return;
    }
    console.log("id\trole\t\tname\t\tphone");
    for (const u of all) {
      console.log(`${u.id}\t${u.role}\t${u.name}\t${u.phone}`);
    }
  } finally {
    await client.close();
  }
}

async function set(idArg, roleArg) {
  const id = Number(idArg);
  if (!Number.isInteger(id) || id <= 0) {
    console.error(`آی‌دی نامعتبره: "${idArg}". از "node scripts/set-role.js list" آی‌دی درست رو پیدا کن.`);
    process.exit(1);
  }
  if (!VALID_ROLES.includes(roleArg)) {
    console.error(`نقش نامعتبره: "${roleArg}". یکی از این‌ها باید باشه: ${VALID_ROLES.join(", ")}`);
    process.exit(1);
  }

  const { client, users } = await getUsersCollection();
  try {
    const existing = await users.findOne({ id }, { projection: { _id: 0, id: 1, name: 1, role: 1 } });
    if (!existing) {
      console.error(`کاربری با آی‌دی ${id} پیدا نشد.`);
      process.exit(1);
    }

    await users.updateOne(
      { id },
      { $set: { role: roleArg, is_admin: roleArg === "admin" ? 1 : 0 } }
    );

    console.log(`${existing.name} (id ${id}) از نقش "${existing.role}" به "${roleArg}" تغییر کرد.`);
  } finally {
    await client.close();
  }
}

const [, , command, ...rest] = process.argv;

(async () => {
  if (command === "list") {
    await list();
  } else if (command === "set") {
    await set(rest[0], rest[1]);
  } else {
    console.log("استفاده:");
    console.log("  node scripts/set-role.js list");
    console.log("  node scripts/set-role.js set <id> <customer|developer|admin>");
    process.exit(command ? 1 : 0);
  }
})();
