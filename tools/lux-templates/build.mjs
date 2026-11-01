// Builds the cinematic «lux» templates: one engine (style.css + runtime.js +
// motifs.mjs) and one config per trade (trades/*.mjs).
//
//   node tools/lux-templates/build.mjs            # every trade
//   node tools/lux-templates/build.mjs cafe gym   # only these trades
//   node tools/lux-templates/build.mjs --register # also (re)write the registry block
//
// Output: lib/siteTemplates/templates/<trade>-lux.template.html. The output is
// a normal generator template ({{brand}}, {{t:#hex}}, <!--each:phones--> …).
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { MOTIFS, MOTIF_CSS, motif } from "./motifs.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const OUT = join(ROOT, "lib/siteTemplates/templates");
const CSS = readFileSync(join(HERE, "style.css"), "utf8");
const RUNTIME = readFileSync(join(HERE, "runtime.js"), "utf8");

const h = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const fa = (n) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
// texts may carry <em>…</em> for the accent word; everything else is escaped
const rich = (s) => h(s).replace(/&lt;em&gt;/g, "<em>").replace(/&lt;\/em&gt;/g, "</em>");
const wa = (text) => `{{wa:?text=${String(text).replace(/[{}]/g, "")}}}`;

function vars(t) {
  const on = t.on ?? "#ffffff";
  return `:root{--bg:${t.bg};--bg2:${t.bg2};--card:${t.card};--ink:${t.ink};--pr:{{t:${t.pr}}};--pr2:{{t:${t.pr2}}};--ac:{{t:${t.ac}}};--on:${on};
--ldbg:${t.ldbg ?? t.ink};--ldfg:${t.ldfg ?? t.bg};--mqbg:${t.mqbg ?? t.ink};--mqfg:${t.mqfg ?? t.bg};--grain:${t.grain ?? 0.05};
--mu:color-mix(in srgb,var(--ink) 60%,var(--bg));--line:color-mix(in srgb,var(--ink) 13%,transparent);
--fd:${t.fd};--fdw:${t.fdw};--fdls:${t.fdls ?? "0"};--fl:${t.fl};--fls:${t.fls ?? "italic"};--mqsep:"${t.mqsep ?? "✦"}";
--brad:${t.brad ?? "999px"};--crad:${t.crad ?? "26px"};--irad:${t.irad ?? "28px"};--glx:${t.glx ?? "30%"};--ease:cubic-bezier(.16,1,.3,1)}`;
}

function heroLines(lines) {
  return lines.map((l) => `<span class="ln"><span>${rich(l)}</span></span>`).join("");
}

function card(it, i, c) {
  const action = c.showcase.bag
    ? `<button class="add" data-i="${i}">${h(c.showcase.addLabel)}</button>`
    : `<a class="add" target="_blank" rel="noopener" href="${wa(`${c.showcase.askText} «${it.t}»`)}">${h(c.showcase.askLabel)}</a>`;
  return `<article class="card" style="--tone:${it.tone ?? "var(--pr)"}">${it.tag ? `<span class="tag">${h(it.tag)}</span>` : ""}<div class="vis"><span class="em">${it.e}</span></div><h3>${h(it.t)}</h3>${it.d ? `<p>${h(it.d)}</p>` : ""}<div class="ft"><span class="pr">${h(it.p ?? c.showcase.priceHint ?? "")}</span>${action}</div></article>`;
}

function page(c) {
  const t = c.theme;
  const nav = c.nav; // [[href,label] x5]
  const runtimeCfg = {
    items: c.showcase.items, bag: !!c.showcase.bag, addLabel: c.showcase.addLabel, askLabel: c.showcase.askLabel,
    askText: c.showcase.askText, priceHint: c.showcase.priceHint ?? "", emoji: c.emoji, menu: !!c.menu,
    quiz: c.quiz ? { qs: c.quiz.qs, results: c.quiz.results, resKick: c.quiz.resKick, cta: c.quiz.cta, waText: c.quiz.waText } : null,
    form: { waIntro: c.request.waIntro, typeLabel: c.request.typeLabel, whenLabel: c.request.whenLabel, done: c.request.done },
    particles: c.particles, glyphs: c.glyphs ?? "", bagText: c.bag.text, emptyBag: c.bag.empty, addedMsg: c.bag.added,
  };
  const C = JSON.stringify(runtimeCfg).replace(/</g, "\\u003c");
  if (/\{\{/.test(C)) throw new Error(`${c.id}: config JSON must not contain "{{"`);

  const ghost = c.ghost ?? "";
  const g = c.gallery.items;
  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{brand}} | ${h(c.title)}</title>
<meta name="description" content="{{brand}} — ${h(c.description)} {{address}}">
<script>var d=document.documentElement;d.classList.add('js');if(!matchMedia('(prefers-reduced-motion:reduce)').matches)d.classList.add('motion');try{if(sessionStorage.getItem('seen:'+location.pathname)==='1')d.classList.add('seen')}catch(e){}if('scrollRestoration' in history)history.scrollRestoration='manual'</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?${t.gf}&display=swap" rel="stylesheet">
<style>
${vars(t)}
${CSS}
${MOTIF_CSS}
</style>
</head>
<body>

<div class="ld" aria-hidden="true">
  <div class="in"><div class="mk">${motif(c.motif)}</div><div class="bn"><span>{{brand}}</span></div><div class="pc">${h(c.loader)} · <span class="n">۰</span>٪</div></div>
  <div class="wps"><i class="wp"></i><i class="wp"></i><i class="wp"></i><i class="wp"></i><i class="wp"></i></div>
</div>
<div class="cur" aria-hidden="true"></div>

<header class="nav">
  <div class="wrap">
    <a class="logo" href="#top"><i>${c.logo}</i>{{brand}}</a>
    <nav class="links">${nav.map(([href, label]) => `<a href="${href}">${h(label)}</a>`).join("")}</nav>
    <div class="nr">
      ${c.showcase.bag ? `<button class="bag" data-open-bag aria-label="${h(c.bag.title)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg><span>${h(c.bag.title)}</span><b class="bag-n">۰</b></button>` : `<a class="bag" href="{{phone_href}}" aria-label="تماس"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.8.7a2 2 0 0 1 1.7 2Z"/></svg><span>تماس</span></a>`}
      <button class="burger" aria-label="منو"><span></span><span></span></button>
    </div>
  </div>
</header>
<nav class="mm" aria-label="منوی موبایل">${nav.map(([href, label], i) => `<a href="${href}">${h(label)} <small>0${i + 1}</small></a>`).join("")}</nav>

<main id="top">
<section class="hero${c.heroLayout === "center" ? " center" : ""}">
  <div class="glow"></div>
  ${ghost ? `<div class="ghost" dir="ltr">${h(ghost)}</div>` : ""}
  <canvas id="fx"></canvas>
  <div class="wrap hg">
    <div class="htx">
      <span class="kick h-in">${rich(c.hero.kick)}</span>
      <h1 class="h1">${heroLines(c.hero.lines)}</h1>
      <p class="h-in">${rich(c.hero.sub)}</p>
      <div class="acts h-in">
        <a class="btn p mag" href="${c.hero.cta1[1]}">${h(c.hero.cta1[0])} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M11 6l-6 6 6 6"/></svg></a>
        <a class="btn g mag" href="${c.hero.cta2[1]}">${h(c.hero.cta2[0])}</a>
      </div>
    </div>
    <div class="hvwrap">
      <div class="hv" id="heroVis"><span class="orb"></span><span class="disc"></span>${motif(c.motif)}</div>
      <div class="chips">${c.hero.chips.map(([e, tt, s]) => `<div class="chip"><i>${e}</i><div>${h(tt)}<small>${h(s)}</small></div></div>`).join("")}</div>
    </div>
  </div>
</section>

<div class="mq" aria-hidden="true">
  <div class="row">${[...c.marquee, ...c.marquee].map((w) => `<span>${h(w)}</span>`).join("")}</div>
  <div class="row r">${[...c.marqueeLat, ...c.marqueeLat].map((w) => `<span>${h(w)}</span>`).join("")}</div>
</div>

<section class="st" id="about">
  <div class="wrap stg">
    <div>
      <span class="kick">${rich(c.statement.kick)}</span>
      <p class="stx">${h(c.statement.text)}</p>
      <div class="sig lat">— ${h(c.statement.sig)}</div>
    </div>
    <div class="av" id="aboutVis">${motif(c.motif)}</div>
  </div>
</section>

<section class="sc" id="showcase">
  <div class="wrap sch">
    <div><span class="kick">${rich(c.showcase.kick)}</span><h2 class="h2">${rich(c.showcase.title)}</h2></div>
    <p class="sub rv">${rich(c.showcase.sub)}</p>
  </div>
  <div class="wrap"><div class="tabs" id="tabs"></div></div>
  <div class="pin"><div class="track" id="track">${c.showcase.items.map((it, i) => card(it, i, c)).join("")}</div></div>
</section>

${c.quiz ? `<section class="qz" id="finder">
  <div class="wrap" style="text-align:center">
    <span class="kick">${rich(c.quiz.kick)}</span>
    <h2 class="h2">${rich(c.quiz.title)}</h2>
    <p class="sub rv" style="margin:12px auto 0">${rich(c.quiz.sub)}</p>
  </div>
  <div class="wrap"><div class="qbox" id="quiz"><div class="qbar"><i></i></div><div class="qbody"></div></div></div>
</section>` : ""}

<section class="sp" id="steps">
  <div class="wrap">
    <span class="kick">${rich(c.steps.kick)}</span>
    <h2 class="h2">${rich(c.steps.title)}</h2>
    <div class="steps">
      <svg class="spath" viewBox="0 0 1200 110" preserveAspectRatio="none" fill="none"><path d="M1170 34 C 1050 110, 950 -30, 840 34 S 640 110, 540 34 S 330 -30, 240 34 S 60 110, 0 40" style="stroke:var(--pr);stroke-width:2;stroke-dasharray:8 8"/></svg>
      ${c.steps.list.map(([e, tt, dd], i) => `<div class="step rv"><span class="ic">${e}</span><b>0${i + 1}</b><h4>${h(tt)}</h4><p>${h(dd)}</p></div>`).join("")}
    </div>
  </div>
</section>

<section class="ss">
  <div class="wrap">
    <div class="stats">${c.stats.map(([n, suf, l]) => `<div class="stat"><b data-count="${n}" data-suf="${h(suf)}">${fa(n)}${h(suf)}</b><span>${h(l)}</span></div>`).join("")}</div>
    <span class="kick">${rich(c.services.kick)}</span>
    <h2 class="h2">${rich(c.services.title)}</h2>
    <div class="svg">${c.services.list.map(([e, tt, dd]) => `<div class="sv"><i>${e}</i><h4>${h(tt)}</h4><p>${h(dd)}</p></div>`).join("")}</div>
  </div>
</section>

<section class="gl">
  <div class="wrap">
    <span class="kick">${rich(c.gallery.kick)}</span>
    <h2 class="h2">${rich(c.gallery.title)}</h2>
    <div class="glg">${g.map(([label, tone], i) => `<figure class="gi" data-k="g${i + 1}" style="--tone:${tone}"><div class="ph">${motif(c.motif)}</div><figcaption>${h(label)}</figcaption></figure>`).join("")}</div>
  </div>
</section>

<section class="ts">
  <div class="wrap">
    <span class="kick">${rich(c.testimonials.kick)}</span>
    <div class="tq" id="tq">${c.testimonials.list.map(([q, n]) => `<blockquote>${h(q)}<cite>— ${h(n)}</cite></blockquote>`).join("")}</div>
    <div class="tdots" id="tdots"></div>
  </div>
</section>

<section class="rq" id="request">
  <div class="wrap">
    <span class="kick">${rich(c.request.kick)}</span>
    <h2 class="h2">${rich(c.request.title)}</h2>
    <div class="rqg">
      <div class="cta"><div class="bgm">${motif(c.motif)}</div>
        <h3>${h(c.request.ctaTitle)}</h3><p>${h(c.request.ctaSub)}</p>
        <div class="acts"><a class="btn p mag" href="${wa(c.request.ctaWa)}" target="_blank" rel="noopener">${h(c.request.ctaBtn ?? "پیام در واتساپ")}</a><a class="btn g mag" href="{{phone_href}}">{{phone}}</a></div>
      </div>
      <form class="form" id="rform" novalidate>
        <h3>${h(c.request.formTitle)}</h3>
        <div class="fld"><input id="rn" placeholder=" " autocomplete="name"><label for="rn">نام شما</label></div>
        <div class="fld"><input id="rp" placeholder=" " inputmode="tel" autocomplete="tel"><label for="rp">شماره تماس</label></div>
        <div class="chs" id="rtype"><small>${h(c.request.typeLabel)}</small>${c.request.types.map((x, i) => `<button type="button"${i ? "" : ' class="on"'}>${h(x)}</button>`).join("")}</div>
        <div class="fld"><select id="rw">${c.request.when.map((x) => `<option>${h(x)}</option>`).join("")}</select><label for="rw">${h(c.request.whenLabel)}</label></div>
        <div class="fld"><textarea id="rx" rows="2" placeholder=" "></textarea><label for="rx">${h(c.request.noteLabel ?? "توضیح (اختیاری)")}</label></div>
        <button class="btn p mag" type="submit">${h(c.request.submit)}</button>
      </form>
    </div>
  </div>
</section>

<section class="ct" id="contact">
  <div class="wrap">
    <span class="kick">${rich(c.contact.kick)}</span>
    <h2 class="h2">${rich(c.contact.title)}</h2>
    <div class="ctg">
      <!--each:phones--><a class="cr" href="{{phone_href}}"><span class="ci">📞</span><span><small>تلفن</small><span class="v">{{phone}}</span></span></a><!--/each:phones-->
      <a class="cr" href="{{map_url}}" target="_blank" rel="noopener"><span class="ci">📍</span><span><small>آدرس — مسیریابی</small><span class="v">{{address}}</span></span></a>
      <!--if:hours--><div class="cr"><span class="ci">🕰️</span><span><small>ساعت کاری</small><span class="v">{{hours}}</span></span></div><!--/if:hours-->
      <!--if:instagram--><a class="cr" href="{{instagram_href}}" target="_blank" rel="noopener"><span class="ci">📸</span><span><small>اینستاگرام</small><span class="v">{{instagram}}</span></span></a><!--/if:instagram-->
      <!--if:whatsapp--><a class="cr" href="{{whatsapp_href}}" target="_blank" rel="noopener"><span class="ci">💬</span><span><small>واتساپ</small><span class="v">{{whatsapp}}</span></span></a><!--/if:whatsapp-->
    </div>
  </div>
</section>
</main>

<footer>
  <div class="big">{{brand}}</div>
  <div class="wrap fb"><span>© {{year}} {{brand}} — همه‌ی حقوق محفوظ است.</span><span>{{address}}</span></div>
</footer>

<div class="mbar">${c.showcase.bag ? `<button data-open-bag>${h(c.bag.title)} <span class="bag-n">۰</span></button>` : `<a href="{{phone_href}}">تماس</a>`}<a class="p" href="${c.mbar[1]}"${c.mbar[1].startsWith("{{wa") ? ' target="_blank" rel="noopener"' : ""}>${h(c.mbar[0])}</a></div>

${c.showcase.bag ? `<aside class="dr" aria-label="${h(c.bag.title)}">
  <div class="ov" data-close-bag></div>
  <div class="pn">
    <h3>${h(c.bag.title)} <button data-close-bag aria-label="بستن">✕</button></h3>
    <ul class="bag-list"></ul>
    <a class="btn p send" target="_blank" rel="noopener">${h(c.bag.send)}</a>
  </div>
</aside>` : ""}
<div class="toast"></div>

<script>
var SI = {{images_json}}; /* uploaded photos: hero, about, g1-g4 */
var SM = ${c.menu ? "{{menu_json}}" : "[]"};${c.menu ? " /* editable menu */" : ""}
var WA = "{{wa:}}";
var C = ${C};
${RUNTIME}
</script>
<script>var __fxTimer=setTimeout(function(){if(window.__luxFx&&!window.__fxRan){window.__fxRan=1;window.__luxFx()}},4000);</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/motion@11.11.13/dist/motion.js"></script>
<script>if(!window.__fxRan){window.__fxRan=1;clearTimeout(__fxTimer);window.__luxFx()}</script>
</body>
</html>
`;
}

function validate(c) {
  const need = ["id", "trade", "label", "title", "description", "motif", "theme", "nav", "hero", "marquee", "marqueeLat", "statement", "showcase", "steps", "stats", "services", "gallery", "testimonials", "request", "contact", "bag", "mbar", "logo", "loader", "emoji"];
  for (const k of need) if (c[k] == null) throw new Error(`${c.trade}: missing "${k}"`);
  if (!MOTIFS[c.motif]) throw new Error(`${c.trade}: unknown motif ${c.motif}`);
  if (c.quiz) for (const q of c.quiz.qs) for (const o of q.o) if (o[3].length !== c.quiz.results.length) throw new Error(`${c.trade}: quiz score length mismatch in «${q.q}»`);
}

const args = process.argv.slice(2);
const only = args.filter((a) => !a.startsWith("--"));
const files = readdirSync(join(HERE, "trades")).filter((f) => f.endsWith(".mjs")).sort();
const built = [];
for (const f of files) {
  const c = (await import(join(HERE, "trades", f))).default;
  if (only.length && !only.includes(c.trade)) continue;
  validate(c);
  const html = page(c);
  writeFileSync(join(OUT, `${c.id}.template.html`), html);
  built.push(c);
  console.log(`✓ ${c.id}.template.html  ${(html.length / 1024).toFixed(1)} KB`);
}

if (args.includes("--register")) {
  const all = [];
  for (const f of files) all.push((await import(join(HERE, "trades", f))).default);
  const ident = (id) => id.replace(/-(\w)/g, (_m, ch) => ch.toUpperCase());
  const imports = all.map((c) => `import ${ident(c.id)} from "./templates/${c.id}.template.html";`).join("\n");
  const imgs = (c) => [
    `{ key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: ${JSON.stringify(c.imageHints?.hero ?? "محصول یا نمای شاخص")}, ratio: "1:1" }`,
    `{ key: "about", label: "درباره‌ی ما", hint: ${JSON.stringify(c.imageHints?.about ?? "فضای کسب‌وکار")}, ratio: "4:5" }`,
    ...c.gallery.items.map(([label], i) => `{ key: "g${i + 1}", label: ${JSON.stringify("گالری — " + label)}, hint: ${JSON.stringify(label)}, ratio: "4:5" }`),
  ];
  const entries = all.map((c) => `  {
    id: "${c.id}",
    trade: "${c.trade}",
    label: ${JSON.stringify(c.label)},
    html: ${ident(c.id)},
    palette: { primary: "${c.theme.pr}", secondary: "${c.theme.pr2}" },${c.menu ? "\n    menu: true," : ""}
    images: [
      ${imgs(c).join(",\n      ")},
    ],
  },`).join("\n");
  const p = join(ROOT, "lib/siteTemplates/index.ts");
  let s = readFileSync(p, "utf8");
  const IM0 = "// <lux-imports>", IM1 = "// </lux-imports>", EN0 = "  // <lux-templates>", EN1 = "  // </lux-templates>";
  const block = (a, b, body) => `${a}\n${body}\n${b}`;
  if (s.includes(IM0)) s = s.replace(new RegExp(`${IM0}[\\s\\S]*?${IM1}`), block(IM0, IM1, imports));
  else s = s.replace(/(\nexport const TEMPLATES)/, `\n${block(IM0, IM1, imports)}\n$1`);
  if (s.includes(EN0)) s = s.replace(new RegExp(`${EN0}[\\s\\S]*?${EN1}`), block(EN0, EN1, entries));
  else s = s.replace("export const TEMPLATES: SiteTemplate[] = [", `export const TEMPLATES: SiteTemplate[] = [\n${block(EN0, EN1, entries)}`);
  writeFileSync(p, s);

  // Food templates: their showcase items are also the default editable menu,
  // so the dashboard's menu editor starts from exactly what the site shows.
  const menus = {};
  for (const c of all.filter((x) => x.menu)) {
    menus[c.id] = [{ title: "منو", emoji: c.emoji, items: c.showcase.items.map((it) => ({ name: it.t, ...(it.d ? { desc: it.d } : {}), ...(it.p ? { price: it.p } : {}), emoji: it.e, ...(it.tag ? { badge: it.tag } : {}) })) }];
  }
  writeFileSync(join(ROOT, "lib/siteTemplates/menus.lux.ts"),
    `// Generated by tools/lux-templates/build.mjs --register — do not edit by hand.\nimport type { MenuCategory } from "./menu";\n\nexport const LUX_MENUS: Record<string, MenuCategory[]> = ${JSON.stringify(menus, null, 2)};\n`);
  console.log(`registered ${all.length} lux templates in lib/siteTemplates/index.ts (+ ${Object.keys(menus).length} default menus)`);
}
