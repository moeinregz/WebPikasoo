// The shared "قابلیت‌ها" add-on that every café / restaurant / clinic site gets
// when the admin switches features on (see features.ts).
//
// It is ONE self-contained block (<style> + <script>, no external requests)
// that is spliced in just before </body> when /preview/<token> is served and
// when the site is downloaded. Because it is added at serve time:
//   • all templates (old and new) support it without editing their HTML,
//   • switching a feature on/off works on the same link — no rebuild,
//   • it lives in a Shadow DOM, so no template CSS can break it and it can't
//     break the template.
//
// What it renders: a floating button (bottom-left) that opens the enabled
// actions — online order (menu + cart), table booking, clinic appointment,
// call-back request, QR menu — as bottom-sheet forms. Submissions are POSTed
// to <api>/api/site/<token>/submit (see app/api/site/[token]/submit).
// When the server can't be reached the form offers a WhatsApp / phone
// fallback with the message already written.
import type { FeatureId } from "./features";
import { sanitizeMenu, type MenuCategory } from "./menu";
import { qrSvg } from "./qr";

export type AddonConfig = {
  token: string;
  features: FeatureId[];
  brand: string;
  /** digits only, e.g. 09121234567 */
  phone?: string;
  /** international digits for wa.me, e.g. 989121234567 */
  whatsapp?: string;
  /** main color of the buttons (#hex) */
  color?: string;
  /** absolute origin of the webpikaso server that receives the requests */
  api: string;
  /** the menu used by «سفارش آنلاین» (omit when the site has no menu) */
  menu?: MenuCategory[];
  /** absolute URL of the QR-menu page (only with the qrmenu feature) */
  menuUrl?: string;
};

const ADDON_MARK = /<!--SA-->[\s\S]*?<!--SA_END-->/g;

function safeJson(v: unknown): string {
  return JSON.stringify(v).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

// -- the browser-side code. Plain ES2015, no template literals / ${} inside,
//    so it can live in a normal string constant. ----------------------------
const ADDON_JS = String.raw`
(function () {
  var C = window.__SA;
  if (!C || window.__SA_LOADED) return;
  window.__SA_LOADED = 1;
  var F = C.features || [];
  function has(f) { return F.indexOf(f) > -1; }

  var DIG = '۰۱۲۳۴۵۶۷۸۹', ARB = '٠١٢٣٤٥٦٧٨٩';
  function toEn(s) {
    return String(s == null ? '' : s)
      .replace(/[۰-۹]/g, function (d) { return DIG.indexOf(d); })
      .replace(/[٠-٩]/g, function (d) { return ARB.indexOf(d); });
  }
  function fa(n) { try { return Number(n).toLocaleString('fa-IR'); } catch (e) { return String(n); } }
  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'text') e.textContent = v;
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    (kids || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }

  // ---- colors ----
  var color = /^#[0-9a-fA-F]{6}$/.test(C.color || '') ? C.color : '#c0392b';
  function lum(h) {
    var r = parseInt(h.substr(1, 2), 16), g = parseInt(h.substr(3, 2), 16), b = parseInt(h.substr(5, 2), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }
  var fg = lum(color) > 0.62 ? '#1a1a1a' : '#ffffff';

  // ---- host + shadow root ----
  var host = document.createElement('div');
  host.id = 'sa-host';
  host.setAttribute('dir', 'rtl');
  host.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;z-index:2147483000;';
  try { host.style.fontFamily = getComputedStyle(document.body).fontFamily; } catch (e) {}
  var root = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;

  var css =
    ':host{all:initial}*{box-sizing:border-box}' +
    '.w{--c:' + color + ';--f:' + fg + ';font-family:inherit;direction:rtl;color:#1c1c1c;font-size:15px;line-height:1.6}' +
    'button,input,select,textarea{font:inherit;color:inherit}' +
    '.fabs{position:fixed;left:14px;bottom:14px;display:flex;flex-direction:column;align-items:flex-start;gap:10px;z-index:2}' +
    '@media(max-width:900px){.fabs{bottom:calc(86px + env(safe-area-inset-bottom,0px))}}' +
    '.main{width:56px;height:56px;border-radius:50%;border:0;background:var(--c);color:var(--f);font-size:24px;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.28);display:grid;place-items:center;transition:transform .2s}' +
    '.main:active{transform:scale(.94)}' +
    '.pill{display:flex;align-items:center;gap:8px;border:0;background:#fff;color:#1c1c1c;border-radius:999px;padding:10px 16px 10px 14px;font-weight:700;font-size:14px;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.22);white-space:nowrap;animation:up .22s both}' +
    '.pill b{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:var(--c);color:var(--f);font-size:15px}' +
    '.pill.solo{background:var(--c);color:var(--f)}.pill.solo b{background:rgba(255,255,255,.22)}' +
    '@keyframes up{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}' +
    '.ov{position:fixed;inset:0;background:rgba(10,10,10,.55);display:flex;align-items:flex-end;justify-content:center;z-index:5;animation:fade .2s both}' +
    '@keyframes fade{from{opacity:0}to{opacity:1}}' +
    '.sh{background:#fff;width:100%;max-width:560px;max-height:92vh;max-height:92dvh;border-radius:22px 22px 0 0;display:flex;flex-direction:column;overflow:hidden;animation:sheet .28s cubic-bezier(.2,.8,.2,1) both}' +
    '@keyframes sheet{from{transform:translateY(40px);opacity:.4}to{transform:none;opacity:1}}' +
    '@media(min-width:700px){.ov{align-items:center}.sh{border-radius:22px;max-height:88vh}}' +
    '.hd{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:16px 18px;border-bottom:1px solid #eee}' +
    '.hd h3{margin:0;font-size:17px;font-weight:800}' +
    '.x{width:36px;height:36px;border-radius:50%;border:0;background:#f1f1f1;cursor:pointer;font-size:16px}' +
    '.bd{padding:16px 18px;overflow:auto;flex:1;-webkit-overflow-scrolling:touch}' +
    '.ft{padding:12px 18px calc(12px + env(safe-area-inset-bottom,0px));border-top:1px solid #eee;background:#fff}' +
    '.btn{display:block;width:100%;border:0;border-radius:14px;padding:14px;background:var(--c);color:var(--f);font-weight:800;font-size:15px;cursor:pointer}' +
    '.btn[disabled]{opacity:.5;cursor:not-allowed}' +
    '.btn.ghost{background:#f1f1f1;color:#1c1c1c;margin-top:8px}' +
    '.lbl{display:block;font-size:13px;font-weight:700;margin:12px 0 6px;color:#444}' +
    '.in{width:100%;border:1.5px solid #ddd;border-radius:12px;padding:11px 13px;background:#fff;outline:0}' +
    '.in:focus{border-color:var(--c)}textarea.in{min-height:78px;resize:vertical}' +
    '.row{display:grid;grid-template-columns:1fr 1fr;gap:10px}' +
    '.seg{display:flex;gap:8px;flex-wrap:wrap}' +
    '.seg label{flex:1;min-width:96px;text-align:center;border:1.5px solid #ddd;border-radius:12px;padding:10px 8px;cursor:pointer;font-size:13.5px;font-weight:700}' +
    '.seg input{display:none}.seg input:checked+span{color:var(--c)}' +
    '.seg label.on{border-color:var(--c);background:rgba(0,0,0,.035)}' +
    '.err{color:#c0392b;font-size:13px;margin:10px 0 0;font-weight:700}' +
    '.hp{position:absolute;left:-9999px;opacity:0;height:0;width:0}' +
    '.chips{display:flex;gap:8px;overflow:auto;padding-bottom:10px;margin:0 -18px 6px;padding-inline:18px;scrollbar-width:none}' +
    '.chips::-webkit-scrollbar{display:none}' +
    '.chip{flex:none;border:1.5px solid #ddd;background:#fff;border-radius:999px;padding:7px 14px;font-size:13.5px;font-weight:700;cursor:pointer}' +
    '.chip.on{background:var(--c);border-color:var(--c);color:var(--f)}' +
    '.it{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #f0f0f0}' +
    '.th{flex:none;width:54px;height:54px;border-radius:12px;background:#f4f4f4;display:grid;place-items:center;font-size:26px;overflow:hidden}' +
    '.th img{width:100%;height:100%;object-fit:cover}' +
    '.inf{flex:1;min-width:0}.inf b{display:block;font-size:14.5px}.inf small{display:block;color:#777;font-size:12.5px;line-height:1.5}' +
    '.inf em{font-style:normal;font-weight:800;font-size:13.5px;color:var(--c)}' +
    '.qty{display:flex;align-items:center;gap:8px;flex:none}' +
    '.qty button{width:32px;height:32px;border-radius:50%;border:0;background:var(--c);color:var(--f);font-size:18px;line-height:1;cursor:pointer}' +
    '.qty button.m{background:#eee;color:#222}.qty span{min-width:20px;text-align:center;font-weight:800}' +
    '.sum{background:#f7f7f7;border-radius:14px;padding:12px 14px;margin-top:6px;font-size:13.5px}' +
    '.sum div{display:flex;justify-content:space-between;gap:10px;padding:3px 0}' +
    '.tot{font-weight:800;border-top:1px dashed #ccc;margin-top:6px;padding-top:8px!important}' +
    '.ok{text-align:center;padding:22px 6px}.ok .ic{font-size:54px}.ok h4{margin:8px 0 4px;font-size:19px}' +
    '.ok p{margin:4px 0;color:#555}.code{display:inline-block;margin-top:8px;padding:6px 16px;border-radius:999px;background:#f1f1f1;font-weight:800;letter-spacing:.5px}' +
    '.qrb{display:grid;place-items:center;padding:10px 0}.qrb svg{width:min(260px,70vw);height:auto;border-radius:12px;border:1px solid #eee}' +
    '.lnk{display:block;text-align:center;text-decoration:none}' +
    '@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}';

  root.appendChild(el('style', { text: css }));
  var wrap = el('div', { class: 'w' });
  root.appendChild(wrap);

  // ---- modal helper ----
  var openCount = 0;
  function modal(title, build) {
    var ov = el('div', { class: 'ov', role: 'dialog', 'aria-modal': 'true', 'aria-label': title });
    var body = el('div', { class: 'bd' });
    var foot = el('div', { class: 'ft' });
    var sh = el('div', { class: 'sh' }, [
      el('div', { class: 'hd' }, [
        el('h3', { text: title }),
        el('button', { class: 'x', type: 'button', 'aria-label': 'بستن', text: '✕', onclick: close })
      ]),
      body, foot
    ]);
    ov.appendChild(sh);
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    function onKey(e) { if (e.key === 'Escape') close(); }
    function close() {
      document.removeEventListener('keydown', onKey);
      if (ov.parentNode) ov.parentNode.removeChild(ov);
      if (--openCount <= 0) { openCount = 0; document.documentElement.style.overflow = prevOverflow; }
    }
    var prevOverflow = document.documentElement.style.overflow;
    document.addEventListener('keydown', onKey);
    if (openCount++ === 0) document.documentElement.style.overflow = 'hidden';
    wrap.appendChild(ov);
    build({ body: body, foot: foot, close: close });
    return close;
  }

  function field(label, input) {
    return el('div', null, [el('label', { class: 'lbl', text: label }), input]);
  }
  function inp(type, ph, extra) {
    var a = { class: 'in', type: type, placeholder: ph || '', autocomplete: 'off' };
    if (extra) for (var k in extra) a[k] = extra[k];
    return el('input', a);
  }
  function validPhone(v) { return /^[0-9+\-\s()]{7,20}$/.test(toEn(v).trim()) && toEn(v).replace(/\D/g, '').length >= 7; }

  function fallbackLink(text) {
    if (C.whatsapp) return 'https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(text);
    if (C.phone) return 'tel:' + C.phone;
    return '';
  }

  // POST as text/plain so the browser sends a "simple" request (no preflight)
  function send(payload, done) {
    var finished = false;
    function fin(ok, res) { if (finished) return; finished = true; done(ok, res || {}); }
    try {
      var ctl = window.AbortController ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctl) ctl.abort(); fin(false, { message: 'پاسخی از سرور نیومد.' }); }, 15000);
      fetch(C.api + '/api/site/' + C.token + '/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: JSON.stringify(payload),
        signal: ctl ? ctl.signal : undefined
      }).then(function (r) { return r.json().catch(function () { return {}; }); })
        .then(function (j) { clearTimeout(timer); fin(!!(j && j.ok), j); })
        .catch(function () { clearTimeout(timer); fin(false, { message: 'اتصال برقرار نشد.' }); });
    } catch (e) { fin(false, { message: 'اتصال برقرار نشد.' }); }
  }

  function successView(ctx, icon, title, lines, code, fbText) {
    ctx.body.innerHTML = '';
    ctx.foot.innerHTML = '';
    var kids = [el('div', { class: 'ic', text: icon }), el('h4', { text: title })];
    lines.forEach(function (l) { kids.push(el('p', { text: l })); });
    if (code) kids.push(el('span', { class: 'code', text: 'کد پیگیری: ' + fa(code) }));
    ctx.body.appendChild(el('div', { class: 'ok' }, kids));
    ctx.foot.appendChild(el('button', { class: 'btn', type: 'button', text: 'بستن', onclick: ctx.close }));
  }

  function submitWith(ctx, btn, errBox, payload, fbText, onOk) {
    btn.disabled = true;
    var old = btn.textContent;
    btn.textContent = 'در حال ارسال…';
    errBox.textContent = '';
    send(payload, function (ok, res) {
      btn.disabled = false;
      btn.textContent = old;
      if (ok) return onOk(res);
      errBox.textContent = (res && res.message) || 'ثبت انجام نشد.';
      var link = fallbackLink(fbText);
      if (link && !ctx.foot.querySelector('.fb')) {
        ctx.foot.appendChild(el('a', { class: 'btn ghost lnk fb', href: link, target: '_blank', rel: 'noopener', text: C.whatsapp ? 'ارسال از طریق واتساپ' : 'تماس تلفنی' }));
      }
    });
  }

  // =====================  ONLINE ORDER  =====================
  var MENU = (C.menu || []).filter(function (c) { return c && c.items && c.items.length; });
  function priceNum(p) {
    var m = toEn(p || '').replace(/[,٬،\s]/g, '').match(/\d+(\.\d+)?/);
    return m ? parseFloat(m[0]) : null;
  }
  function unitOf() {
    for (var i = 0; i < MENU.length; i++) for (var j = 0; j < MENU[i].items.length; j++) {
      if (/ریال/.test(MENU[i].items[j].price || '')) return 'ریال';
    }
    return 'تومان';
  }

  function openOrder() {
    var cart = {}; // "c:i" -> qty
    modal('سفارش آنلاین', function (ctx) {
      var step = MENU.length ? 1 : 2;
      var activeCat = 0;
      var listBox = el('div'), chipsBox = el('div', { class: 'chips' });
      var cartBtn = el('button', { class: 'btn', type: 'button' });

      function lines() {
        var out = [];
        MENU.forEach(function (c, ci) { c.items.forEach(function (it, ii) {
          var q = cart[ci + ':' + ii];
          if (q) out.push({ name: it.name, qty: q, price: it.price || '', n: priceNum(it.price) });
        }); });
        return out;
      }
      function totals() {
        var ls = lines(), count = 0, sum = 0, all = ls.length > 0;
        ls.forEach(function (l) { count += l.qty; if (l.n == null) all = false; else sum += l.n * l.qty; });
        return { ls: ls, count: count, sum: all ? sum : null };
      }
      function money(n) { return fa(Math.round(n)) + ' ' + unitOf(); }

      function renderChips() {
        chipsBox.innerHTML = '';
        MENU.forEach(function (c, i) {
          chipsBox.appendChild(el('button', { class: 'chip' + (i === activeCat ? ' on' : ''), type: 'button',
            text: (c.emoji ? c.emoji + ' ' : '') + c.title, onclick: function () { activeCat = i; renderChips(); renderItems(); } }));
        });
      }
      function renderItems() {
        listBox.innerHTML = '';
        var c = MENU[activeCat];
        c.items.forEach(function (it, ii) {
          var key = activeCat + ':' + ii;
          var th = el('div', { class: 'th' });
          if (it.image) th.appendChild(el('img', { src: it.image, alt: '', loading: 'lazy' }));
          else th.textContent = it.emoji || c.emoji || '🍽️';
          var q = el('div', { class: 'qty' });
          function paintQty() {
            q.innerHTML = '';
            var n = cart[key] || 0;
            if (n) q.appendChild(el('button', { class: 'm', type: 'button', 'aria-label': 'کم کن', text: '−', onclick: function () { cart[key] = n - 1; if (!cart[key]) delete cart[key]; paintQty(); paintCart(); } }));
            if (n) q.appendChild(el('span', { text: fa(n) }));
            q.appendChild(el('button', { type: 'button', 'aria-label': 'اضافه کن', text: '+', onclick: function () { cart[key] = n + 1; paintQty(); paintCart(); } }));
          }
          paintQty();
          listBox.appendChild(el('div', { class: 'it' }, [
            th,
            el('div', { class: 'inf' }, [
              el('b', { text: it.name }),
              it.desc ? el('small', { text: it.desc }) : null,
              it.price ? el('em', { text: it.price }) : null
            ]),
            q
          ]));
        });
      }
      function paintCart() {
        var t = totals();
        cartBtn.disabled = t.count === 0;
        cartBtn.textContent = t.count ? 'ادامه · ' + fa(t.count) + ' مورد' + (t.sum != null ? ' · ' + money(t.sum) : '') : 'یک مورد از منو انتخاب کن';
      }

      function showMenu() {
        step = 1;
        ctx.body.innerHTML = ''; ctx.foot.innerHTML = '';
        ctx.body.appendChild(chipsBox); ctx.body.appendChild(listBox);
        ctx.foot.appendChild(cartBtn);
        renderChips(); renderItems(); paintCart();
      }

      cartBtn.addEventListener('click', function () { if (totals().count) showForm(); });

      function showForm() {
        step = 2;
        ctx.body.innerHTML = ''; ctx.foot.innerHTML = '';
        var t = totals();
        var name = inp('text', 'نام و نام‌خانوادگی', { maxlength: 60, autocomplete: 'name' });
        var phone = inp('tel', '۰۹۱۲۳۴۵۶۷۸۹', { maxlength: 20, inputmode: 'tel', autocomplete: 'tel' });
        var addr = el('textarea', { class: 'in', placeholder: 'آدرس کامل برای ارسال', maxlength: 300 });
        var table = inp('text', 'شماره‌ی میز (اختیاری)', { maxlength: 20 });
        var note = el('textarea', { class: 'in', placeholder: 'توضیحات (اختیاری)', maxlength: 300 });
        var freeText = MENU.length ? null : el('textarea', { class: 'in', placeholder: 'سفارش‌ت رو بنویس، مثلاً: ۲ کباب کوبیده، ۱ نوشابه', maxlength: 600 });
        var hp = el('input', { class: 'hp', type: 'text', name: 'website', tabindex: '-1', autocomplete: 'off', 'aria-hidden': 'true' });
        var type = 'delivery';
        var seg = el('div', { class: 'seg' });
        var addrBox = field('آدرس', addr), tableBox = field('میز', table);
        var TYPES = [['delivery', '🛵 ارسال با پیک'], ['pickup', '🛍️ تحویل حضوری'], ['dinein', '🍽️ سرمیز']];
        function paintType() {
          seg.innerHTML = '';
          TYPES.forEach(function (tp) {
            seg.appendChild(el('label', { class: tp[0] === type ? 'on' : '', onclick: function () { type = tp[0]; paintType(); } }, [el('span', { text: tp[1] })]));
          });
          addrBox.style.display = type === 'delivery' ? '' : 'none';
          tableBox.style.display = type === 'dinein' ? '' : 'none';
        }
        paintType();
        var err = el('p', { class: 'err' });

        if (t.count) {
          var sum = el('div', { class: 'sum' });
          t.ls.forEach(function (l) { sum.appendChild(el('div', null, [el('span', { text: l.name + ' × ' + fa(l.qty) }), el('span', { text: l.n != null ? money(l.n * l.qty) : l.price })])); });
          if (t.sum != null) sum.appendChild(el('div', { class: 'tot' }, [el('span', { text: 'جمع' }), el('span', { text: money(t.sum) })]));
          ctx.body.appendChild(sum);
        }
        if (freeText) ctx.body.appendChild(field('سفارش', freeText));
        ctx.body.appendChild(field('نحوه‌ی دریافت', seg));
        ctx.body.appendChild(el('div', { class: 'row' }, [field('نام', name), field('تلفن', phone)]));
        ctx.body.appendChild(addrBox); ctx.body.appendChild(tableBox);
        ctx.body.appendChild(field('توضیحات', note));
        ctx.body.appendChild(hp); ctx.body.appendChild(err);

        var go = el('button', { class: 'btn', type: 'button', text: 'ثبت سفارش' });
        ctx.foot.appendChild(go);
        if (MENU.length) ctx.foot.appendChild(el('button', { class: 'btn ghost', type: 'button', text: 'بازگشت به منو', onclick: showMenu }));

        go.addEventListener('click', function () {
          err.textContent = '';
          if (name.value.trim().length < 2) { err.textContent = 'اسمت رو بنویس.'; return; }
          if (!validPhone(phone.value)) { err.textContent = 'شماره‌ی تماس معتبر نیست.'; return; }
          if (freeText && freeText.value.trim().length < 3) { err.textContent = 'سفارشت رو بنویس.'; return; }
          if (type === 'delivery' && addr.value.trim().length < 6) { err.textContent = 'آدرس رو کامل بنویس.'; return; }
          var items = t.ls.map(function (l) { return { name: l.name, qty: l.qty, price: l.price }; });
          var payload = {
            kind: 'order', name: name.value.trim(), phone: toEn(phone.value).trim(), website: hp.value,
            items: items, total: t.sum, unit: unitOf(), type: type,
            address: type === 'delivery' ? addr.value.trim() : '', table: type === 'dinein' ? table.value.trim() : '',
            note: note.value.trim(), text: freeText ? freeText.value.trim() : ''
          };
          var fb = 'سلام، سفارش از سایت ' + C.brand + ':\n' +
            (items.length ? items.map(function (i) { return '• ' + i.name + ' × ' + i.qty; }).join('\n') : payload.text) +
            '\nنام: ' + payload.name + '\nتلفن: ' + payload.phone + (payload.address ? '\nآدرس: ' + payload.address : '');
          submitWith(ctx, go, err, payload, fb, function (res) {
            successView(ctx, '✅', 'سفارش ثبت شد', ['سفارشت به ' + C.brand + ' رسید.', 'برای هماهنگی با شما تماس می‌گیریم.'], res.code);
          });
        });
      }

      if (MENU.length) showMenu(); else showForm();
    });
  }

  // =====================  TABLE BOOKING / APPOINTMENT / CALLBACK  =====================
  function todayIso() {
    var d = new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
  function stepper(min, max, val) {
    var n = val, out = el('span', { text: fa(n) });
    var box = el('div', { class: 'qty', style: 'justify-content:flex-start' }, [
      el('button', { class: 'm', type: 'button', text: '−', onclick: function () { if (n > min) { n--; out.textContent = fa(n); } } }),
      out,
      el('button', { type: 'button', text: '+', onclick: function () { if (n < max) { n++; out.textContent = fa(n); } } })
    ]);
    return { node: box, get: function () { return n; } };
  }

  // kind: reserve | appointment | callback
  function openForm(kind) {
    var T = {
      reserve: { title: 'رزرو میز', btn: 'ثبت رزرو', ok: 'درخواست رزرو ثبت شد', okLine: 'بعد از بررسی، برای تأیید با شما تماس می‌گیریم.', icon: '📅' },
      appointment: { title: 'نوبت‌دهی آنلاین', btn: 'ثبت درخواست نوبت', ok: 'درخواست نوبت ثبت شد', okLine: 'همکاران ما برای تأیید زمان نوبت با شما تماس می‌گیرن.', icon: '🩺' },
      callback: { title: 'درخواست تماس / مشاوره', btn: 'ثبت درخواست', ok: 'درخواست شما ثبت شد', okLine: 'در اولین فرصت با شما تماس می‌گیریم.', icon: '📞' }
    }[kind];
    modal(T.title, function (ctx) {
      var name = inp('text', 'نام و نام‌خانوادگی', { maxlength: 60, autocomplete: 'name' });
      var phone = inp('tel', '۰۹۱۲۳۴۵۶۷۸۹', { maxlength: 20, inputmode: 'tel', autocomplete: 'tel' });
      var date = inp('date', '', { min: todayIso() });
      var time = inp('time', '');
      var note = el('textarea', { class: 'in', placeholder: 'توضیحات (اختیاری)', maxlength: 300 });
      var service = inp('text', kind === 'callback' ? 'موضوع (اختیاری)' : 'خدمت یا پزشک مورد نظر', { maxlength: 80 });
      var guests = stepper(1, 40, 2);
      var period = el('select', { class: 'in' }, [
        el('option', { value: '', text: 'هر زمان' }), el('option', { value: 'morning', text: 'صبح' }),
        el('option', { value: 'noon', text: 'ظهر' }), el('option', { value: 'evening', text: 'عصر' })
      ]);
      var hp = el('input', { class: 'hp', type: 'text', name: 'website', tabindex: '-1', autocomplete: 'off', 'aria-hidden': 'true' });
      var err = el('p', { class: 'err' });

      ctx.body.appendChild(el('div', { class: 'row' }, [field('نام', name), field('تلفن', phone)]));
      if (kind === 'reserve') {
        ctx.body.appendChild(el('div', { class: 'row' }, [field('تاریخ', date), field('ساعت', time)]));
        ctx.body.appendChild(field('تعداد نفرات', guests.node));
      } else if (kind === 'appointment') {
        ctx.body.appendChild(field('خدمت / پزشک', service));
        ctx.body.appendChild(el('div', { class: 'row' }, [field('تاریخ دلخواه', date), field('زمان روز', period)]));
      } else {
        ctx.body.appendChild(field('موضوع', service));
      }
      ctx.body.appendChild(field('توضیحات', note));
      ctx.body.appendChild(hp); ctx.body.appendChild(err);

      var go = el('button', { class: 'btn', type: 'button', text: T.btn });
      ctx.foot.appendChild(go);
      go.addEventListener('click', function () {
        err.textContent = '';
        if (name.value.trim().length < 2) { err.textContent = 'اسمت رو بنویس.'; return; }
        if (!validPhone(phone.value)) { err.textContent = 'شماره‌ی تماس معتبر نیست.'; return; }
        if (kind === 'reserve' && (!date.value || !time.value)) { err.textContent = 'تاریخ و ساعت رو انتخاب کن.'; return; }
        if (kind === 'appointment' && !service.value.trim()) { err.textContent = 'خدمت یا پزشک مورد نظر رو بنویس.'; return; }
        var payload = { kind: kind, name: name.value.trim(), phone: toEn(phone.value).trim(), website: hp.value, note: note.value.trim(), date: date.value || '', time: time.value || '', guests: kind === 'reserve' ? guests.get() : 0, service: service.value.trim(), period: period.value };
        var fb = 'سلام، ' + T.title + ' از سایت ' + C.brand + '\nنام: ' + payload.name + '\nتلفن: ' + payload.phone +
          (payload.date ? '\nتاریخ: ' + payload.date : '') + (payload.time ? '\nساعت: ' + payload.time : '') +
          (payload.guests ? '\nتعداد: ' + payload.guests : '') + (payload.service ? '\n' + payload.service : '');
        submitWith(ctx, go, err, payload, fb, function (res) {
          successView(ctx, T.icon, T.ok, [T.okLine], res.code);
        });
      });
    });
  }

  // =====================  QR MENU  =====================
  function openQr() {
    modal('منوی دیجیتال', function (ctx) {
      var box = el('div', { class: 'qrb' });
      box.innerHTML = C.qrSvg || '';
      ctx.body.appendChild(box);
      ctx.body.appendChild(el('p', { class: 'ok', style: 'padding:0', text: 'بارکد رو با دوربین گوشی اسکن کن تا منو باز بشه.' }));
      ctx.foot.appendChild(el('a', { class: 'btn lnk', href: C.menuUrl, target: '_blank', rel: 'noopener', text: 'مشاهده‌ی منو' }));
    });
  }

  // ---- floating button ----
  var ACTIONS = [];
  if (has('order')) ACTIONS.push({ id: 'order', icon: '🛒', label: 'سفارش آنلاین', run: openOrder });
  if (has('reserve')) ACTIONS.push({ id: 'reserve', icon: '📅', label: 'رزرو میز', run: function () { openForm('reserve'); } });
  if (has('appointment')) ACTIONS.push({ id: 'appointment', icon: '🩺', label: 'نوبت‌دهی آنلاین', run: function () { openForm('appointment'); } });
  if (has('callback')) ACTIONS.push({ id: 'callback', icon: '📞', label: 'درخواست تماس', run: function () { openForm('callback'); } });
  if (has('qrmenu') && C.menuUrl) ACTIONS.push({ id: 'qrmenu', icon: '📱', label: 'منوی QR', run: openQr });

  function open(id) {
    for (var i = 0; i < ACTIONS.length; i++) if (ACTIONS[i].id === id) { ACTIONS[i].run(); return true; }
    return false;
  }

  if (ACTIONS.length) {
    var fabs = el('div', { class: 'fabs' });
    var list = el('div', { style: 'display:flex;flex-direction:column;gap:10px;align-items:flex-start' });
    var main = null, expanded = false;
    function pill(a, solo) {
      return el('button', { class: 'pill' + (solo ? ' solo' : ''), type: 'button', onclick: function () { if (!solo) toggle(false); a.run(); } },
        [el('b', { text: a.icon }), a.label]);
    }
    function toggle(v) {
      expanded = v;
      list.innerHTML = '';
      if (v) ACTIONS.forEach(function (a) { list.appendChild(pill(a, false)); });
      if (main) { main.textContent = v ? '✕' : '🛎️'; main.setAttribute('aria-expanded', v ? 'true' : 'false'); }
    }
    if (ACTIONS.length === 1) {
      fabs.appendChild(pill(ACTIONS[0], true));
    } else {
      main = el('button', { class: 'main', type: 'button', 'aria-label': 'قابلیت‌های سایت', 'aria-expanded': 'false', text: '🛎️', onclick: function () { toggle(!expanded); } });
      fabs.appendChild(list); fabs.appendChild(main);
    }
    wrap.appendChild(fabs);
  }

  // links / buttons of the template itself can open a feature:
  //   <a href="#sa-order">  or  <button data-sa-open="reserve">
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target.closest('[data-sa-open],a[href^="#sa-"]') : null;
    if (!t) return;
    var id = t.getAttribute('data-sa-open') || (t.getAttribute('href') || '').replace('#sa-', '');
    if (open(id)) e.preventDefault();
  });
  function fromHash() {
    var h = (location.hash || '').replace('#sa-', '');
    if (h && h !== location.hash) open(h);
  }
  window.addEventListener('hashchange', fromHash);
  window.SiteAddon = { open: open };

  function mount() { document.body.appendChild(host); setTimeout(fromHash, 350); }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
`;

/** The add-on block (with markers) for a site, or "" when nothing is switched on. */
export function buildAddon(cfg: AddonConfig): string {
  if (cfg.features.length === 0) return "";
  // Never trust stored data: re-validate (https / base64 photos only, capped strings).
  let menu: MenuCategory[] = [];
  if (cfg.features.includes("order") && cfg.menu && cfg.menu.length) {
    const checked = sanitizeMenu(cfg.menu, { allowData: true });
    if (checked.ok) menu = checked.menu;
  }
  let qr = "";
  if (cfg.features.includes("qrmenu") && cfg.menuUrl) {
    try {
      qr = qrSvg(cfg.menuUrl, { size: 260, dark: "#111", light: "#fff", margin: 2 });
    } catch {
      qr = "";
    }
  }
  const data = {
    token: cfg.token,
    features: cfg.features,
    brand: cfg.brand,
    phone: (cfg.phone ?? "").replace(/[^\d+]/g, ""),
    whatsapp: (cfg.whatsapp ?? "").replace(/\D/g, ""),
    color: cfg.color && HEX.test(cfg.color) && cfg.color.length === 7 ? cfg.color : "",
    api: cfg.api.replace(/\/$/, ""),
    menu,
    menuUrl: cfg.menuUrl ?? "",
    qrSvg: qr,
  };
  return `<!--SA--><script>window.__SA=${safeJson(data)};</script><script>${ADDON_JS}</script><!--SA_END-->`;
}

/** Splices the add-on in just before </body>, replacing any earlier copy.
 *  Passing "" removes it (features switched off). */
export function injectAddon(html: string, addon: string): string {
  const cleaned = html.replace(ADDON_MARK, "");
  if (!addon) return cleaned;
  const i = cleaned.search(/<\/body\s*>(?![\s\S]*<\/body\s*>)/i);
  return i === -1 ? cleaned + addon : cleaned.slice(0, i) + addon + cleaned.slice(i);
}
