/* Shahkar — vanilla runtime for the single-file static export */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var WA = "https://wa.me/989353030519";
  var html = document.documentElement;

  /* ---------- images (de-duplicated data URIs) ---------- */
  $$("img[data-img]").forEach(function (img) { img.src = window.__IMG[img.getAttribute("data-img")]; });

  /* ---------- loader → ready ---------- */
  var loader = $(".loader");
  var quick = false;
  try { quick = sessionStorage.getItem("shahkar-intro") === "1"; sessionStorage.setItem("shahkar-intro", "1"); } catch (e) {}
  var wait = reduce ? 0 : quick ? 2100 : 4000;
  if (loader && quick) loader.classList.add("quick");
  html.classList.add("is-loading");
  setTimeout(function () {
    html.classList.remove("is-loading");
    if (loader) loader.remove();
    document.body.classList.add("ready");
  }, wait);
  setTimeout(function () { document.body.classList.add("ready"); }, wait - (reduce ? 0 : 900));

  /* ---------- lanterns ---------- */
  var lamps = $$(".lamp");
  lamps.forEach(function (l, i) {
    l.style.setProperty("--sw", (2.4 + (i % 4) * 0.45) + "s");
    l.style.animationDelay = (i * -0.37) + "s";
  });
  var lastX = 0, leanT;
  addEventListener("pointermove", function (e) {
    var v = Math.max(-14, Math.min(14, (e.clientX - lastX) * 0.6));
    lastX = e.clientX;
    lamps.forEach(function (l, i) { $(".lamp-body", l).style.rotate = v * (0.6 + (i % 3) * 0.2) + "deg"; });
    clearTimeout(leanT);
    leanT = setTimeout(function () { lamps.forEach(function (l) { $(".lamp-body", l).style.rotate = "0deg"; }); }, 160);
  }, { passive: true });

  /* ---------- nav / scroll effects ---------- */
  var nav = $(".nav"), prevY = 0, drawer = $(".drawer"), burger = $(".burger");
  var heroImg = $(".hero-media img"), heroContent = $(".hero-content"), heroShade = $(".hero-shade");
  var bar = $(".progress-bar"), fab = $(".fab"), hero = $(".hero");
  function onScroll() {
    var y = scrollY, h = hero.offsetHeight;
    nav.classList.toggle("is-solid", y > 40);
    nav.classList.toggle("is-hidden", y > prevY && y > 320 && !drawer.classList.contains("open"));
    prevY = y;
    var max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
    fab.classList.toggle("show", y > max * 0.05);
    if (!reduce && y < h && document.body.classList.contains("ready")) {
      var p = y / h;
      heroImg.style.transform = "translateY(" + p * 18 + "%) scale(" + (1 + p * 0.08) + ")";
      heroImg.style.transition = "none";
      var q = Math.max(0, Math.min(1, (p - 0.2) / 0.6));
      heroContent.style.transform = "translateY(" + -q * 30 + "%)";
      heroContent.style.opacity = 1 - q;
      heroShade.style.opacity = p;
    }
    spaces();
  }
  addEventListener("scroll", onScroll, { passive: true });
  function toggleMenu(open) {
    drawer.classList.toggle("open", open);
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open);
    html.classList.toggle("menu-open", open);
  }
  burger.addEventListener("click", function () { toggleMenu(!drawer.classList.contains("open")); });
  $$(".drawer a").forEach(function (a) { a.addEventListener("click", function () { toggleMenu(false); }); });

  /* ---------- reveals ---------- */
  var groups = [
    "[data-reveal]", ".feature", ".events-list li", ".g-item", ".parking-photo",
    ".events-photo", ".music-copy", ".music-visual", ".gate", ".map"
  ];
  groups.forEach(function (sel) {
    $$(sel).forEach(function (el, i) {
      if (sel !== ".map") el.classList.add("rv");
      if (sel !== "[data-reveal]") el.classList.add("rv-d" + Math.min(6, i % 7));
    });
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -10% 0px" });
  $$(".rv, .map").forEach(function (el) { io.observe(el); });

  /* ---------- feature tilt ---------- */
  $$(".feature").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width * 100, py = (e.clientY - r.top) / r.height * 100;
      card.style.setProperty("--mx", px + "%");
      card.style.setProperty("--my", py + "%");
      card.style.transform = "perspective(1200px) rotateX(" + -(py - 50) / 9 + "deg) rotateY(" + (px - 50) / 9 + "deg)";
    });
    card.addEventListener("pointerleave", function () { card.style.transform = ""; });
  });

  /* ---------- spaces: sticky horizontal (desktop) ---------- */
  var sp = $(".spaces"), track = $(".spaces-track"), panels = $$(".space-panel");
  var spBar = $(".spaces-progress span");
  var wrap = document.createElement("div");
  wrap.className = "spaces-sticky";
  sp.insertBefore(wrap, track);
  wrap.appendChild(track);
  wrap.appendChild($(".spaces-progress"));
  var dist = 0, hz = false;
  function layoutSpaces() {
    hz = !reduce && innerWidth >= 900;
    sp.classList.toggle("hz", hz);
    if (!hz) { sp.style.height = ""; track.style.transform = ""; return; }
    dist = track.scrollWidth - innerWidth;
    sp.style.height = innerHeight + dist + "px";
    spaces();
  }
  function spaces() {
    if (!hz) return;
    var top = sp.getBoundingClientRect().top;
    var p = Math.max(0, Math.min(1, -top / dist));
    track.style.transform = "translateX(" + p * dist + "px)";
    spBar.style.transform = "scaleX(" + p + ")";
    var vw = innerWidth;
    panels.forEach(function (pn) {
      var r = pn.getBoundingClientRect();
      var t = Math.max(-1, Math.min(1, (r.left + r.width / 2 - vw / 2) / vw));
      $("img", pn).style.transform = "translateX(" + t * 10 + "%)";
      pn.classList.toggle("is-in", r.left < vw * 0.8 && r.right > vw * 0.2);
    });
  }
  addEventListener("resize", layoutSpaces);
  addEventListener("load", layoutSpaces);
  layoutSpaces();

  /* ---------- menu tabs ---------- */
  var tabs = $$(".menu-tab"), menuPanels = $$(".menu-panel");
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () {
      tabs.forEach(function (x, j) { x.classList.toggle("is-active", i === j); x.setAttribute("aria-selected", i === j); });
      menuPanels.forEach(function (p, j) { p.classList.toggle("on", i === j); });
    });
  });

  /* ---------- gallery lightbox ---------- */
  var items = $$(".g-item"), lb = $(".lightbox"), lbImg = $("img", lb), lbCap = $(".lb-caption", lb), cur = 0;
  function show(i) {
    cur = (i + items.length) % items.length;
    var img = $("img", items[cur]);
    lbImg.src = img.src; lbImg.alt = img.alt; lbCap.textContent = img.alt;
  }
  function openLb(i) { show(i); lb.classList.add("open"); document.body.style.overflow = "hidden"; }
  function closeLb() { lb.classList.remove("open"); document.body.style.overflow = ""; }
  items.forEach(function (it, i) { it.addEventListener("click", function () { openLb(i); }); });
  lb.addEventListener("click", closeLb);
  lbImg.addEventListener("click", function (e) { e.stopPropagation(); });
  $(".lb-close", lb).addEventListener("click", closeLb);
  $(".lb-prev", lb).addEventListener("click", function (e) { e.stopPropagation(); show(cur - 1); });
  $(".lb-next", lb).addEventListener("click", function (e) { e.stopPropagation(); show(cur + 1); });
  addEventListener("keydown", function (e) {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") show(cur + 1);
    if (e.key === "ArrowRight") show(cur - 1);
  });

  /* ---------- reservation → WhatsApp ---------- */
  var card = $(".reserve-card"), form = $("form", card);
  function toEn(s) { return s.replace(/[۰-۹]/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹".indexOf(d); }).replace(/[٠-٩]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩".indexOf(d); }); }
  function err(name, msg) {
    var f = form.elements[name]; if (!f) return;
    var field = f.closest ? f.closest(".f-field") : null;
    if (!field) return;
    var s = $(".f-err", field);
    if (msg) { if (!s) { s = document.createElement("span"); s.className = "f-err"; field.appendChild(s); } s.textContent = msg; f.setAttribute("aria-invalid", "true"); }
    else { if (s) s.remove(); f.removeAttribute("aria-invalid"); }
  }
  var lastMsg = "";
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var d = {}; new FormData(form).forEach(function (v, k) { d[k] = String(v).trim(); });
    var phone = toEn(d.phone || "").replace(/[\s\-()]/g, "").replace(/^\+98|^0098/, "0");
    var guests = parseInt(toEn(d.guests || ""), 10);
    var ok = true;
    function chk(c, k, m) { err(k, c ? "" : m); if (!c) ok = false; }
    chk((d.name || "").length >= 2, "name", "نام را وارد کنید.");
    chk(/^09\d{9}$/.test(phone), "phone", "شماره موبایل معتبر نیست.");
    chk(!!d.event_type, "event_type", "نوع مراسم را انتخاب کنید.");
    chk(guests > 0 && guests < 2000, "guests", "تعداد مهمانان را وارد کنید.");
    chk((d.date_text || "").length >= 2, "date_text", "تاریخ را وارد کنید.");
    if (!ok) return;
    lastMsg = "سلام، درخواست رزرو باغچه رستوران شاهکار:\n" +
      "نام: " + d.name + "\nموبایل: " + phone + "\nمراسم: " + d.event_type + "\nتعداد: " + guests + " نفر\n" +
      "تاریخ: " + d.date_text + (d.time_text ? " — " + d.time_text : "") + (d.area ? "\nفضا: " + d.area : "") +
      (d.notes ? "\nتوضیحات: " + d.notes : "");
    var url = WA + "?text=" + encodeURIComponent(lastMsg);
    $(".reserve-done .btn-gold", card).href = url;
    card.classList.add("done");
    window.open(url, "_blank", "noopener");
  });
  $(".reserve-done .btn-ghost", card).addEventListener("click", function () { form.reset(); card.classList.remove("done"); });

  /* ---------- cursor glow ---------- */
  var glow = $(".cursor-glow");
  if (glow && matchMedia("(pointer: fine)").matches) {
    addEventListener("pointermove", function (e) { glow.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px)"; }, { passive: true });
  } else if (glow) glow.remove();

  /* ---------- canvases ---------- */
  function loop(canvas, init, frame) {
    var ctx = canvas.getContext("2d"), dpr = Math.min(devicePixelRatio || 1, 2), w = 0, h = 0, raf = 0, vis = false, t = 0, st;
    function resize() {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      st = init(w, h); frame(ctx, w, h, t, st);
    }
    function tick() { raf = 0; if (!vis) return; t += 0.016; frame(ctx, w, h, t, st); raf = requestAnimationFrame(tick); }
    new ResizeObserver(resize).observe(canvas);
    new IntersectionObserver(function (e) { vis = e[0].isIntersecting && !reduce; if (vis && !raf) raf = requestAnimationFrame(tick); }).observe(canvas);
  }

  // fireflies
  var sprite = document.createElement("canvas"); sprite.width = sprite.height = 64;
  var sc = sprite.getContext("2d"), g = sc.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,244,200,1)"); g.addColorStop(.2, "rgba(243,205,110,.85)");
  g.addColorStop(.5, "rgba(217,170,70,.25)"); g.addColorStop(1, "rgba(217,170,70,0)");
  sc.fillStyle = g; sc.fillRect(0, 0, 64, 64);
  var flies = [];
  for (var i = 0; i < 55; i++) flies.push({ x: Math.random(), y: Math.random(), r: 6 + Math.random() * 14, vx: (Math.random() - .5) * .00025, vy: -.00008 - Math.random() * .0002, ph: Math.random() * 6.28, sp: .6 + Math.random() * 1.6, wob: .5 + Math.random() });
  var ff = $(".fireflies");
  if (ff) loop(ff, function () { return null; }, function (ctx, w, h, t) {
    ctx.clearRect(0, 0, w, h); ctx.globalCompositeOperation = "lighter";
    flies.forEach(function (f) {
      f.x += f.vx + Math.sin(t * f.wob + f.ph) * .00025; f.y += f.vy;
      if (f.y < -.05) { f.y = 1.05; f.x = Math.random(); }
      if (f.x < -.05) f.x = 1.05; if (f.x > 1.05) f.x = -.05;
      ctx.globalAlpha = .25 + .75 * Math.max(0, Math.sin(t * f.sp + f.ph));
      ctx.drawImage(sprite, f.x * w - f.r, f.y * h - f.r, f.r * 2, f.r * 2);
    });
  });

  // LED curtain
  var led = $(".led"), mx = -9999, my = -9999;
  var COLORS = ["#f3d98b", "#d9b45a", "#ffb347", "#f3d98b", "#ff6b6b", "#6bc5ff", "#8dff9e", "#d9b45a"], GAP = 22;
  if (led) {
    led.parentElement.addEventListener("pointermove", function (e) { var r = led.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    led.parentElement.addEventListener("pointerleave", function () { mx = my = -9999; });
    loop(led, function (w, h) {
      var cols = Math.ceil(w / GAP) + 1, rows = Math.ceil(h / GAP) + 1, seeds = [];
      for (var k = 0; k < cols * rows; k++) seeds.push(Math.random());
      return { cols: cols, rows: rows, seeds: seeds };
    }, function (ctx, w, h, t, s) {
      ctx.clearRect(0, 0, w, h);
      for (var y = 0; y < s.rows; y++) for (var x = 0; x < s.cols; x++) {
        var sd = s.seeds[y * s.cols + x], px = x * GAP + (y % 2 ? GAP / 2 : 0), py = y * GAP;
        var wave = Math.sin(x * .35 + t * 1.6) * Math.cos(y * .28 - t * 1.1);
        var near = Math.max(0, 1 - Math.hypot(px - mx, py - my) / 180);
        var a = .08 + Math.max(0, wave) * .5 + near * .8;
        if (sd > .985) a = Math.max(a, .5 + .5 * Math.sin(t * 6 + sd * 100));
        ctx.globalAlpha = Math.min(1, a);
        ctx.fillStyle = sd > .9 ? COLORS[Math.floor(sd * 1000) % COLORS.length] : "#d9b45a";
        ctx.beginPath(); ctx.arc(px, py, 2.2 + near * 1.6, 0, 6.283); ctx.fill();
      }
    });
  }

  onScroll();
})();
