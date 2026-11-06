// Turns the static React build (out/) into ONE self-contained HTML file:
// CSS, fonts and images embedded, no JavaScript at all.
//   npm run build && node scripts/build-html.mjs [output.html]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTDIR = path.join(ROOT, "out");
const DEST = path.resolve(process.argv[2] || path.join(ROOT, "..", "..", "private-sites", "shahkar-lite.html"));
const b64 = (p, mime) => `data:${mime};base64,${fs.readFileSync(p).toString("base64")}`;

if (!fs.existsSync(path.join(OUTDIR, "index.html"))) {
  console.error("out/index.html not found — run `npm run build` first.");
  process.exit(1);
}

// Fonts: Vazirmatn 400 + 900, arabic + latin subsets only.
let fonts = "";
const fdir = path.join(ROOT, "node_modules/@fontsource/vazirmatn");
for (const w of [400, 900]) {
  const css = fs.readFileSync(path.join(fdir, `${w}.css`), "utf8");
  for (const block of css.match(/@font-face\s*{[^}]*}/g) ?? []) {
    const file = /url\(\.\/files\/([^)]+\.woff2)\)/.exec(block)?.[1];
    if (!file || !/-(arabic|latin)-\d+-normal/.test(file)) continue;
    fonts += block.replace(/src:[^;]+;/, `src: url(${b64(path.join(fdir, "files", file), "font/woff2")}) format("woff2");`) + "\n";
  }
}

let html = fs.readFileSync(path.join(OUTDIR, "index.html"), "utf8");

// Inline the page CSS (minus Next's own @font-face rules, replaced above).
let css = "";
html = html.replace(/<link[^>]+rel="stylesheet"[^>]*>/g, (tag) => {
  const href = /href="([^"]+)"/.exec(tag)?.[1];
  if (href) css += fs.readFileSync(path.join(OUTDIR, href), "utf8").replace(/@font-face\s*{[^}]*}/g, "");
  return "";
});
html = html.replace("</head>", `<style>${fonts}${css}</style></head>`);

// No JavaScript: the page is fully server-rendered.
html = html
  .replace(/<script\b[\s\S]*?<\/script>/g, "")
  .replace(/<link[^>]+rel="(preload|modulepreload)"[^>]*>/g, "")
  .replace(/<link[^>]+as="script"[^>]*>/g, "");

// Images and favicon as data URIs.
html = html.replace(/(src|href)="\/(images\/[^"]+\.webp|icon\.svg)(?:\?[^"]*)?"/g, (_, attr, p) => {
  const file = path.join(OUTDIR, p);
  const uri = p.endsWith(".svg")
    ? "data:image/svg+xml," + encodeURIComponent(fs.readFileSync(file, "utf8").trim())
    : b64(file, "image/webp");
  return `${attr}="${uri}"`;
});

fs.mkdirSync(path.dirname(DEST), { recursive: true });
fs.writeFileSync(DEST, html);
console.log(`wrote ${DEST} (${(html.length / 1024).toFixed(0)} KB)`);
