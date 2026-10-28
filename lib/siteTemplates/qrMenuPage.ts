// The page a QR code on a table opens: a fast, mobile-first, standalone menu of
// the site (/m/<token>). Pure string building; everything dynamic is escaped.
import type { MenuCategory } from "./menu";

export type QrMenuPageInput = {
  brand: string;
  color: string; // #rrggbb
  menu: MenuCategory[];
  phone?: string; // digits
  address?: string;
  /** link of the site itself (for the «سفارش آنلاین» button), when ordering is on */
  orderHref?: string;
  /** shown under the title */
  tagline?: string;
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

function readable(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62 ? "#1a1a1a" : "#ffffff";
}

export function qrMenuPageHtml(i: QrMenuPageInput): string {
  const color = /^#[0-9a-fA-F]{6}$/.test(i.color) ? i.color : "#8B1E2D";
  const fg = readable(color);
  const phone = (i.phone ?? "").replace(/[^\d+]/g, "");

  const chips = i.menu
    .map((c, n) => `<a class="chip" href="#c${n}">${c.emoji ? esc(c.emoji) + " " : ""}${esc(c.title)}</a>`)
    .join("");

  const sections = i.menu
    .map((c, n) => {
      const items = c.items
        .map((it) => {
          const thumb = it.image
            ? `<img src="${esc(it.image)}" alt="" loading="lazy" decoding="async">`
            : `<span>${esc(it.emoji || c.emoji || "🍽️")}</span>`;
          return (
            `<li class="it" data-q="${esc((it.name + " " + (it.desc ?? "")).toLowerCase())}">` +
            `<div class="th">${thumb}</div>` +
            `<div class="tx"><b>${esc(it.name)}${it.badge ? ` <i>${esc(it.badge)}</i>` : ""}</b>` +
            (it.desc ? `<small>${esc(it.desc)}</small>` : "") +
            `</div>` +
            (it.price ? `<em>${esc(it.price)}</em>` : "") +
            `</li>`
          );
        })
        .join("");
      return `<section id="c${n}"><h2>${c.emoji ? esc(c.emoji) + " " : ""}${esc(c.title)}</h2><ul>${items}</ul></section>`;
    })
    .join("");

  const actions =
    (i.orderHref ? `<a class="act main" href="${esc(i.orderHref)}">🛒 سفارش آنلاین</a>` : "") +
    (phone ? `<a class="act" href="tel:${esc(phone)}">📞 تماس</a>` : "");

  return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="${color}">
<title>منو · ${esc(i.brand)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;800&display=swap" rel="stylesheet">
<style>
:root{--c:${color};--f:${fg};--bg:#faf8f5;--card:#fff;--tx:#1c1b19;--mut:#7b766e;--line:#ece7df}
@media(prefers-color-scheme:dark){:root{--bg:#141312;--card:#1d1c1a;--tx:#f2eee8;--mut:#a39d93;--line:#2b2926}}
*{box-sizing:border-box;margin:0}
body{font-family:Vazirmatn,Tahoma,system-ui,sans-serif;background:var(--bg);color:var(--tx);line-height:1.7;padding-bottom:calc(84px + env(safe-area-inset-bottom,0px))}
header{background:var(--c);color:var(--f);padding:calc(26px + env(safe-area-inset-top,0px)) 18px 22px;text-align:center}
header h1{font-size:24px;font-weight:800}
header p{opacity:.85;font-size:13.5px;margin-top:2px}
.bar{position:sticky;top:0;z-index:5;background:var(--bg);border-bottom:1px solid var(--line);padding:10px 14px 8px}
.s{width:100%;border:1.5px solid var(--line);background:var(--card);color:var(--tx);border-radius:12px;padding:10px 14px;font:inherit;outline:0}
.s:focus{border-color:var(--c)}
.chips{display:flex;gap:8px;overflow:auto;padding:10px 0 2px;scrollbar-width:none}
.chips::-webkit-scrollbar{display:none}
.chip{flex:none;text-decoration:none;color:var(--tx);border:1.5px solid var(--line);background:var(--card);border-radius:999px;padding:5px 14px;font-size:13.5px;font-weight:600}
main{max-width:720px;margin:0 auto;padding:6px 14px}
section{padding-top:18px;scroll-margin-top:118px}
h2{font-size:18px;font-weight:800;margin-bottom:6px}
ul{list-style:none;padding:0;background:var(--card);border:1px solid var(--line);border-radius:16px;overflow:hidden}
.it{display:flex;align-items:center;gap:12px;padding:12px 14px;border-bottom:1px solid var(--line)}
.it:last-child{border-bottom:0}
.th{flex:none;width:58px;height:58px;border-radius:12px;background:rgba(127,127,127,.1);display:grid;place-items:center;font-size:28px;overflow:hidden}
.th img{width:100%;height:100%;object-fit:cover}
.tx{flex:1;min-width:0}.tx b{display:block;font-size:15px}
.tx i{font-style:normal;font-size:11px;background:var(--c);color:var(--f);border-radius:999px;padding:1px 8px;margin-inline-start:4px;vertical-align:middle}
.tx small{display:block;color:var(--mut);font-size:12.5px;line-height:1.55}
em{flex:none;font-style:normal;font-weight:800;color:var(--c);font-size:13.5px;text-align:left;max-width:34%}
@media(prefers-color-scheme:dark){em{color:#fff;opacity:.9}}
.empty{display:none;text-align:center;color:var(--mut);padding:40px 0}
.dock{position:fixed;inset-inline:0;bottom:0;display:flex;gap:10px;padding:10px 14px calc(10px + env(safe-area-inset-bottom,0px));background:var(--bg);border-top:1px solid var(--line)}
.act{flex:1;text-align:center;text-decoration:none;border-radius:14px;padding:12px;font-weight:800;border:1.5px solid var(--line);background:var(--card);color:var(--tx)}
.act.main{background:var(--c);color:var(--f);border-color:var(--c)}
footer{text-align:center;color:var(--mut);font-size:12px;padding:22px 14px}
</style>
</head>
<body>
<header><h1>${esc(i.brand)}</h1><p>${esc(i.tagline || "منوی دیجیتال")}</p></header>
<div class="bar"><input class="s" id="q" type="search" placeholder="جستجو در منو…" autocomplete="off"><nav class="chips">${chips}</nav></div>
<main>${sections}<p class="empty" id="none">موردی پیدا نشد.</p></main>
${i.address ? `<footer>${esc(i.address)}</footer>` : ""}
${actions ? `<div class="dock">${actions}</div>` : ""}
<script>
(function(){
  var q=document.getElementById('q'),none=document.getElementById('none');
  function fa(s){return String(s).replace(/[۰-۹]/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)}).replace(/ي/g,'ی').replace(/ك/g,'ک').toLowerCase()}
  q.addEventListener('input',function(){
    var v=fa(q.value.trim()),any=false;
    document.querySelectorAll('section').forEach(function(s){
      var shown=0;
      s.querySelectorAll('.it').forEach(function(li){
        var ok=!v||fa(li.getAttribute('data-q')).indexOf(v)>-1;
        li.style.display=ok?'':'none';if(ok)shown++;
      });
      s.style.display=shown?'':'none';if(shown)any=true;
    });
    none.style.display=any?'none':'block';
  });
})();
</script>
</body>
</html>`;
}
