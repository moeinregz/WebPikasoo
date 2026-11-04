// Builds the budget "lite" version: one HTML file, no GSAP/Motion/JS.
//   node scripts/build-lite.mjs [output.html]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.resolve(process.argv[2] || path.join(ROOT, "..", "..", "private-sites", "shahkar-lite.html"));
const b64 = (p, mime) => `data:${mime};base64,${fs.readFileSync(p).toString("base64")}`;

// Vazirmatn only, 400 + 900, arabic + latin subsets.
let fonts = "";
for (const w of [400, 900]) {
  const dir = path.join(ROOT, "node_modules/@fontsource/vazirmatn");
  const css = fs.readFileSync(path.join(dir, `${w}.css`), "utf8");
  for (const block of css.match(/@font-face\s*{[^}]*}/g) ?? []) {
    const file = /url\(\.\/files\/([^)]+\.woff2)\)/.exec(block)?.[1];
    if (!file || !/-(arabic|latin)-\d+-normal/.test(file)) continue;
    fonts += block.replace(/src:[^;]+;/, `src: url(${b64(path.join(dir, "files", file), "font/woff2")}) format("woff2");`) + "\n";
  }
}

let html = fs.readFileSync(path.join(ROOT, "scripts/lite/template.html"), "utf8");
html = html
  .replace("{{fonts}}", fonts)
  .replace("{{icon}}", "data:image/svg+xml," + encodeURIComponent(fs.readFileSync(path.join(ROOT, "public/icon.svg"), "utf8").trim()))
  .replace(/{{img:([a-z-]+)}}/g, (_, n) => b64(path.join(ROOT, "public/images", `${n}-sm.webp`), "image/webp"));

fs.writeFileSync(OUT, html);
console.log(`wrote ${OUT} (${(html.length / 1024).toFixed(0)} KB)`);
