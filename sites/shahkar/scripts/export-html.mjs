// Builds a single self-contained HTML file of the site (fonts + images embedded,
// animations re-implemented in vanilla JS/CSS, reservation form → WhatsApp).
//
// Usage: start the site first (npm run build && npm start), then
//   node scripts/export-html.mjs [http://localhost:3100] [output.html]
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.argv[2] || "http://localhost:3100";
const OUT = path.resolve(process.argv[3] || path.join(ROOT, "..", "..", "private-sites", "shahkar.html"));
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const b64 = (p, mime) => `data:${mime};base64,${fs.readFileSync(p).toString("base64")}`;

/* ---------- fonts: only arabic + latin subsets, woff2 only ---------- */
function fontCss(pkg, weights) {
  let out = "";
  for (const w of weights) {
    const css = read(`node_modules/@fontsource/${pkg}/${w}.css`);
    for (const block of css.match(/@font-face\s*{[^}]*}/g) ?? []) {
      const file = /url\(\.\/files\/([^)]+\.woff2)\)/.exec(block)?.[1];
      if (!file || !/-(arabic|latin)-\d+-normal/.test(file)) continue;
      const data = b64(path.join(ROOT, `node_modules/@fontsource/${pkg}/files/${file}`), "font/woff2");
      out += block.replace(/src:[^;]+;/, `src: url(${data}) format("woff2");`) + "\n";
    }
  }
  return out;
}

const fonts =
  fontCss("vazirmatn", [400, 500, 700, 900]) + fontCss("aref-ruqaa", [700]) + fontCss("lalezar", [400]);

/* ---------- capture rendered DOM ---------- */
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

// Menu: capture every tab's panel.
const tabCount = await page.locator(".menu-tab").count();
const panels = [];
for (let i = 0; i < tabCount; i++) {
  await page.locator(".menu-tab").nth(i).click();
  await page.waitForTimeout(900);
  panels.push(
    await page.evaluate(() => {
      const board = document.querySelector(".menu-board > div:not(.menu-corner)");
      return board ? board.innerHTML : "";
    }),
  );
}
await page.locator(".menu-tab").first().click();

// Scroll through so every whileInView animation settles.
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 500) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 120));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(1500);

const result = await page.evaluate((panels) => {
  const STRIP = ["opacity", "transform", "visibility", "clip-path", "filter", "translate", "rotate", "scale", "will-change", "background"];
  const body = document.body.cloneNode(true);
  body.querySelectorAll("script, next-route-announcer, template, .loader, .drawer, .lightbox").forEach((n) => n.remove());
  body.querySelectorAll("[style]").forEach((el) => {
    STRIP.forEach((p) => el.style.removeProperty(p));
    if (!el.getAttribute("style")?.trim()) el.removeAttribute("style");
  });
  // menu: replace the single animated panel with one panel per tab
  const board = body.querySelector(".menu-board");
  const live = board.querySelector(":scope > div:not(.menu-corner)");
  const holder = document.createElement("div");
  panels.forEach((p, i) => {
    const d = document.createElement("div");
    d.className = "menu-panel" + (i === 0 ? " on" : "");
    d.setAttribute("role", "tabpanel");
    d.innerHTML = p;
    d.querySelectorAll("[style]").forEach((el) => el.removeAttribute("style"));
    holder.appendChild(d);
  });
  live.replaceWith(...holder.childNodes);
  body.querySelectorAll(".menu-pill").forEach((n) => n.remove());
  body.querySelectorAll(".menu-tab").forEach((t, i) => {
    t.classList.toggle("is-active", i === 0);
    t.setAttribute("aria-selected", String(i === 0));
  });
  // fab / cursor glow get re-created by the runtime styles
  const emblem = body.querySelector(".footer-emblem").outerHTML.replace("footer-emblem", "ld-emblem");
  const links = [...body.querySelectorAll(".nav-links a")].map((a) => `<li><a href="${a.getAttribute("href")}">${a.textContent}</a></li>`).join("");
  const reserveCard = body.querySelector(".reserve-card");
  const form = reserveCard.querySelector("form");
  form.removeAttribute("style");
  form.querySelectorAll(".f-err").forEach((n) => n.remove());
  form.querySelector(".hp")?.remove();
  return { body: body.innerHTML, emblem, links };
}, panels);

const head = await page.evaluate(() => ({
  title: document.title,
  description: document.querySelector('meta[name="description"]')?.content ?? "",
  jsonld: document.querySelector('script[type="application/ld+json"]')?.textContent ?? "",
}));
await browser.close();

/* ---------- hand-written pieces that only exist while animating ---------- */
const loader = `
<div class="loader" aria-hidden="true">
  <div class="ld-light"></div>
  <div class="ld-gate">
    <div class="ld-door ld-door-r"><span class="ld-door-pattern"></span><span class="ld-handle"></span></div>
    <div class="ld-door ld-door-l"><span class="ld-door-pattern"></span><span class="ld-handle"></span></div>
  </div>
  <div class="ld-center"><span class="ld-glow"></span>${result.emblem}<div class="ld-name">شاهکار</div><div class="ld-sub">باغچه رستوران</div></div>
</div>`;
const drawer = `
<div class="drawer"><ul>${result.links}</ul>
  <div class="drawer-foot"><a href="tel:+989353030519">۰۹۳۵۳۰۳۰۵۱۹</a><a href="https://instagram.com/sofrehkaneh.shahkar" target="_blank" rel="noreferrer" dir="ltr">@sofrehkaneh.shahkar</a></div>
</div>`;
const lightbox = `
<div class="lightbox" role="dialog" aria-modal="true" aria-label="نمایش عکس">
  <img alt="" /><p class="lb-caption"></p>
  <button class="lb-close" aria-label="بستن">×</button>
  <button class="lb-nav lb-prev" aria-label="قبلی">›</button>
  <button class="lb-nav lb-next" aria-label="بعدی">‹</button>
</div>`;
const done = `
<div class="reserve-done">
  <svg viewBox="0 0 80 80" class="done-check" aria-hidden="true"><circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" stroke-width="2" pathLength="1"/><path d="M24 41l11 11 22-24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" pathLength="1"/></svg>
  <h3>درخواست شما آماده‌ی ارسال است</h3>
  <p>پیام رزرو در واتساپ باز شد؛ کافیست آن را ارسال کنید. اگر واتساپ باز نشد، دکمه‌ی زیر را بزنید یا با <b>۰۹۳۵۳۰۳۰۵۱۹</b> تماس بگیرید.</p>
  <div class="reserve-done-actions"><a class="btn btn-gold" href="#" target="_blank" rel="noreferrer">ارسال در واتساپ</a><button type="button" class="btn btn-ghost">رزرو دیگر</button></div>
</div>`;

/* ---------- images: one data URI per photo, set by the runtime ---------- */
const imgDir = path.join(ROOT, "public", "images");
const used = new Set();
let body = result.body.replace(/<img([^>]*?)>/g, (tag, attrs) => {
  const m = /src="\/images\/([a-z-]+?)(?:-sm)?\.webp"/.exec(attrs);
  if (!m) return tag;
  used.add(m[1]);
  const clean = attrs
    .replace(/\s(src|srcset|srcSet|sizes|fetchpriority)="[^"]*"/g, "")
    .replace(/\/$/, "");
  return `<img data-img="${m[1]}"${clean}>`;
});
body = body
  .replace(/<!--\/?\$-->/g, "")
  .replace('<div class="reserve-card"', '<div class="reserve-card"')
  .replace(/(<div class="reserve-card"[^>]*>)/, `$1${done}`)
  .replace(/<span class="f-or">/, '<span class="f-or">با ثبت، پیام آماده در واتساپ باز می‌شود · ');
const imgMap = Object.fromEntries([...used].map((n) => [n, b64(path.join(imgDir, `${n}.webp`), "image/webp")]));

const icon = "data:image/svg+xml," + encodeURIComponent(read("public/icon.svg").trim());
const css = read("app/globals.css") + "\n" + read("scripts/static/extra.css");

const htmlOut = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#0a0907">
<title>${head.title}</title>
<meta name="description" content="${head.description.replace(/"/g, "&quot;")}">
<link rel="icon" href="${icon}">
<style>
${fonts}
${css}
</style>
<script type="application/ld+json">${head.jsonld}</script>
</head>
<body>
${loader}
${drawer}
${body}
${lightbox}
<script>window.__IMG=${JSON.stringify(imgMap)};</script>
<script>
${read("scripts/static/runtime.js")}
</script>
</body>
</html>
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, htmlOut);
console.log(`wrote ${OUT} (${(htmlOut.length / 1024 / 1024).toFixed(2)} MB, ${used.size} images)`);
