// SVG motif library for the lux engine. Every motif is drawn in a 200×200
// box and coloured only through classes (see MOTIF_CSS), so a motif repaints
// itself with the template's theme — and with the admin's chosen colour.
//   p = primary, s = secondary, a = accent, i = ink, w = white, b = bg2, c = card
// Shading uses plain black/white overlays (.sh / .hl).

export const MOTIF_CSS = `.mot svg .p{fill:var(--pr)}.mot svg .s{fill:var(--pr2)}.mot svg .a{fill:var(--ac)}.mot svg .i{fill:var(--ink)}.mot svg .w{fill:#fff}.mot svg .b{fill:var(--bg2)}.mot svg .c{fill:var(--card)}
.mot svg .sh{fill:#000;opacity:.14}.mot svg .hl{fill:#fff;opacity:.35}.mot svg .kp{fill:none;stroke:var(--pr);stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
.mot svg .ki{fill:none;stroke:var(--ink);stroke-width:4;stroke-linecap:round;stroke-linejoin:round}.mot svg .ka{fill:none;stroke:var(--ac);stroke-width:4;stroke-linecap:round;stroke-linejoin:round}.mot svg .kw{fill:none;stroke:#fff;stroke-width:3;stroke-linecap:round;opacity:.6}`;

const S = (body) => `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

export const MOTIFS = {
  cup: S(`<ellipse class="sh" cx="100" cy="176" rx="70" ry="10"/><ellipse class="c" cx="100" cy="166" rx="78" ry="14"/><ellipse class="sh" cx="100" cy="164" rx="60" ry="8"/>
<path class="ki" d="M146 92c26 0 28 40 0 42"/><path class="p" d="M44 70h112l-10 82c-1 8-8 14-16 14H70c-8 0-15-6-16-14z"/><path class="sh" d="M120 70h36l-10 82c-1 8-8 14-16 14h-6z"/>
<ellipse class="s" cx="100" cy="70" rx="56" ry="11"/><ellipse class="a" cx="100" cy="70" rx="44" ry="7"/><path class="kw" d="M66 84l6 60"/>
<path class="ki" d="M80 52c-8-10 8-16 0-28M100 50c-8-10 8-16 0-30M120 52c-8-10 8-16 0-28" style="opacity:.35"/>`),
  cloche: S(`<ellipse class="sh" cx="100" cy="170" rx="86" ry="10"/><rect class="c" x="14" y="150" width="172" height="14" rx="7"/><path class="p" d="M26 150c0-46 33-80 74-80s74 34 74 80z"/><path class="sh" d="M110 72c36 6 64 38 64 78h-34c0-40-12-68-30-78z"/>
<path class="kw" d="M50 128c4-22 18-38 36-44"/><circle class="a" cx="100" cy="64" r="10"/><rect class="s" x="94" y="52" width="12" height="10" rx="3"/>
<path class="ka" d="M150 40l6-12M162 50l12-6M140 32l0-14" style="opacity:.8"/>`),
  skewer: S(`<ellipse class="sh" cx="100" cy="176" rx="74" ry="8"/><path class="ki" d="M20 168L178 30"/><circle class="i" cx="178" cy="30" r="6"/>
<g transform="rotate(-41 100 100)"><rect class="p" x="40" y="86" width="34" height="28" rx="12"/><rect class="a" x="80" y="88" width="20" height="24" rx="9"/><rect class="p" x="106" y="86" width="34" height="28" rx="12"/><rect class="s" x="146" y="88" width="20" height="24" rx="9"/>
<rect class="sh" x="40" y="102" width="34" height="12" rx="6"/><rect class="sh" x="106" y="102" width="34" height="12" rx="6"/><path class="kw" d="M48 92h14M114 92h14"/></g>
<path class="ka" d="M40 60c-6-10 6-14 0-26M64 44c-6-10 6-14 0-26" style="opacity:.7"/>`),
  lantern: S(`<path class="ki" d="M100 8v26"/><path class="i" d="M76 34h48l-6 16H82z"/><path class="p" d="M70 50h60c8 30 8 70 0 100H70c-8-30-8-70 0-100z"/><path class="sh" d="M106 50h24c8 30 8 70 0 100h-24z"/>
<path class="a" d="M86 72h28c4 18 4 38 0 56H86c-4-18-4-38 0-56z" style="opacity:.9"/><path class="kw" d="M100 50v100M78 100h44"/><path class="i" d="M76 150h48l6 14H70z"/>
<ellipse class="a" cx="100" cy="100" rx="70" ry="70" style="opacity:.10"/><circle class="a" cx="160" cy="40" r="4"/><circle class="a" cx="36" cy="70" r="3"/><circle class="a" cx="170" cy="130" r="3"/>`),
  burger: S(`<ellipse class="sh" cx="100" cy="178" rx="72" ry="9"/><path class="p" d="M32 96c0-38 30-58 68-58s68 20 68 58z"/><path class="sh" d="M112 40c32 6 56 26 56 56h-30c0-28-10-48-26-56z"/>
<g class="w"><ellipse cx="72" cy="62" rx="5" ry="3"/><ellipse cx="100" cy="54" rx="5" ry="3"/><ellipse cx="128" cy="62" rx="5" ry="3"/><ellipse cx="86" cy="78" rx="5" ry="3"/><ellipse cx="116" cy="78" rx="5" ry="3"/></g>
<path class="a" d="M26 100h148l-8 12-14-6-14 8-14-8-14 8-14-8-14 8-14-8-14 8-14-6z"/><rect class="s" x="30" y="112" width="140" height="22" rx="11"/><path class="i" d="M34 130h132l-6 10H40z" style="opacity:.35"/>
<path class="p" d="M34 140h132c0 18-12 28-30 28H64c-18 0-30-10-30-28z"/><path class="sh" d="M120 140h46c0 18-12 28-30 28h-16z"/>`),
  bread: S(`<ellipse class="sh" cx="100" cy="166" rx="84" ry="10"/><path class="p" d="M20 128c0-46 36-74 80-74s80 28 80 74c0 18-12 30-30 30H50c-18 0-30-12-30-30z"/><path class="sh" d="M112 56c40 6 68 32 68 72 0 18-12 30-30 30h-30c18-20 22-70-8-102z"/>
<path class="a" d="M58 86c10 4 16 12 18 24M86 74c10 4 16 14 18 26M116 74c10 4 16 14 18 26M144 86c8 4 12 12 14 22" style="fill:none;stroke:var(--ac);stroke-width:7;stroke-linecap:round"/><path class="kw" d="M40 120c2-20 14-36 30-44"/>
<g class="w" style="opacity:.8"><circle cx="40" cy="44" r="2"/><circle cx="160" cy="36" r="2"/><circle cx="176" cy="60" r="1.6"/><circle cx="26" cy="70" r="1.6"/></g>`),
  cake: S(`<ellipse class="sh" cx="100" cy="178" rx="80" ry="9"/><rect class="c" x="16" y="160" width="168" height="12" rx="6"/><rect class="p" x="36" y="104" width="128" height="56" rx="10"/><rect class="sh" x="120" y="104" width="44" height="56" rx="10"/>
<path class="w" d="M36 112c8 0 8 12 16 12s8-12 16-12 8 12 16 12 8-12 16-12 8 12 16 12 8-12 16-12 8 12 16 12 8-12 16-12v-6H36z" style="opacity:.9"/><rect class="s" x="52" y="66" width="96" height="40" rx="10"/>
<path class="w" d="M52 72c6 0 6 10 12 10s6-10 12-10 6 10 12 10 6-10 12-10 6 10 12 10 6-10 12-10 6 10 12 10 6-10 12-10v-4H52z" style="opacity:.9"/><rect class="a" x="96" y="38" width="8" height="28" rx="3"/>
<path class="a" d="M100 18c8 8 8 16 0 18-8-2-8-10 0-18z"/><circle class="a" cx="70" cy="132" r="5"/><circle class="a" cx="100" cy="138" r="5"/><circle class="a" cx="130" cy="132" r="5"/>`),
  cone: S(`<path class="a" d="M64 96h72l-34 92c-1 3-3 3-4 0z"/><path class="sh" d="M100 96h36l-34 92z"/><path d="M70 104l56 30M78 124l40 22M66 112l-0 0M128 104l-52 54M118 128l-30 34" style="fill:none;stroke:#000;stroke-width:2.5;opacity:.15"/>
<circle class="s" cx="76" cy="84" r="28"/><circle class="p" cx="124" cy="84" r="28"/><circle class="c" cx="100" cy="56" r="32"/><path class="sh" d="M100 24c18 0 32 14 32 32 0 6-2 12-4 16-6-24-16-40-28-48z"/>
<path class="p" d="M70 66c4 8 8 10 12 6 4 10 10 10 14 4" style="opacity:.6"/><circle class="a" cx="100" cy="20" r="9"/><path class="ki" d="M100 12c4-8 12-8 14-4" style="stroke-width:3"/>
<g><rect class="p" x="86" y="44" width="8" height="3" rx="1.5" transform="rotate(30 90 45)"/><rect class="a" x="110" y="50" width="8" height="3" rx="1.5" transform="rotate(-20 114 51)"/><rect class="s" x="96" y="66" width="8" height="3" rx="1.5" transform="rotate(60 100 67)"/></g>`),
  bag: S(`<ellipse class="sh" cx="100" cy="182" rx="66" ry="8"/><path class="ki" d="M72 70V52c0-18 12-30 28-30s28 12 28 30v18"/><path class="p" d="M38 66h124l-10 110H48z"/><path class="sh" d="M118 66h44l-10 110h-30z"/>
<rect class="s" x="38" y="66" width="124" height="18"/><circle class="i" cx="72" cy="78" r="4"/><circle class="i" cx="128" cy="78" r="4"/><path class="kw" d="M56 100l-4 60"/>
<path class="a" d="M100 112l7 14 15 2-11 10 3 15-14-7-14 7 3-15-11-10 15-2z"/>`),
  suit: S(`<path class="ki" d="M100 10q10 0 10 9 0 7-10 11v8M100 38L40 66h120z" style="stroke:#9a8a7a"/><path class="p" d="M60 62l40 18 40-18 24 30-10 92H46L36 92z"/><path class="sh" d="M100 80l40-18 24 30-10 92h-54z"/>
<path class="w" d="M84 70l16 10 16-10-16 46z"/><path class="s" d="M96 82h8l4 10-8 50-8-50z"/><path class="i" d="M60 62l40 54-14 6-34-34z" style="opacity:.25"/><path class="i" d="M140 62l-40 54 14 6 34-34z" style="opacity:.35"/>
<circle class="a" cx="100" cy="132" r="3.5"/><circle class="a" cx="100" cy="150" r="3.5"/><path class="kw" d="M128 100h16"/>`),
  ring: S(`<ellipse class="sh" cx="100" cy="182" rx="56" ry="7"/><circle cx="100" cy="122" r="52" style="fill:none;stroke:var(--pr);stroke-width:14"/><path d="M60 156a52 52 0 0 0 80 0" style="fill:none;stroke:#000;stroke-width:14;opacity:.15"/>
<path class="kw" d="M62 100a44 44 0 0 1 20-28"/><path class="a" d="M74 52h52l14 16-40 32-40-32z"/><path class="w" d="M74 52h52l-12 16H86z" style="opacity:.7"/><path class="sh" d="M100 100l40-32h-26z"/>
<path class="w" d="M86 68h28l-14 32z" style="opacity:.45"/><path class="ka" d="M46 34l-8-8M154 34l8-8M100 22V10" style="stroke-width:3"/><path class="a" d="M164 72l4 8 8 4-8 4-4 8-4-8-8-4 8-4z"/>`),
  watch: S(`<rect class="s" x="74" y="8" width="52" height="54" rx="10"/><rect class="s" x="74" y="138" width="52" height="54" rx="10"/><rect class="sh" x="74" y="8" width="52" height="54" rx="10"/>
<circle class="p" cx="100" cy="100" r="60"/><circle class="c" cx="100" cy="100" r="48"/><circle class="sh" cx="104" cy="104" r="44" style="opacity:.06"/><rect class="p" x="158" y="92" width="12" height="16" rx="3"/>
<g class="i"><rect x="98" y="58" width="4" height="10" rx="2"/><rect x="98" y="132" width="4" height="10" rx="2"/><rect x="58" y="98" width="10" height="4" rx="2"/><rect x="132" y="98" width="10" height="4" rx="2"/></g>
<path class="ki" d="M100 100V70M100 100l22 12" style="stroke-width:5"/><circle class="a" cx="100" cy="100" r="5"/><path class="kw" d="M66 78a40 40 0 0 1 22-20" style="stroke:#fff;opacity:.9"/>`),
  carpet: S(`<path class="ki" d="M28 30v-10M44 30v-10M60 30v-10M76 30v-10M92 30v-10M108 30v-10M124 30v-10M140 30v-10M156 30v-10M172 30v-10M28 180v10M44 180v10M60 180v10M76 180v10M92 180v10M108 180v10M124 180v10M140 180v10M156 180v10M172 180v10" style="stroke-width:2.5;opacity:.5"/>
<rect class="p" x="20" y="30" width="160" height="150" rx="4"/><rect x="32" y="42" width="136" height="126" style="fill:none;stroke:var(--ac);stroke-width:5"/><rect x="42" y="52" width="116" height="106" class="s"/>
<path class="a" d="M100 62l38 43-38 43-38-43z"/><path class="p" d="M100 78l24 27-24 27-24-27z"/><circle class="a" cx="100" cy="105" r="8"/>
<g class="a"><path d="M52 62l10 10-10 10zM148 62l-10 10 10 10zM52 148l10-10-10-10zM148 148l-10-10 10-10z"/></g><path class="sh" d="M110 30h70v150h-70z" style="opacity:.08"/>`),
  lipstick: S(`<ellipse class="sh" cx="100" cy="184" rx="60" ry="7"/><rect class="s" x="56" y="110" width="44" height="72" rx="6"/><rect class="sh" x="82" y="110" width="18" height="72" rx="4"/><rect class="a" x="58" y="96" width="40" height="16" rx="3"/>
<path class="p" d="M62 96V52c0-8 6-26 16-30 10 4 16 22 16 30v44z"/><path class="sh" d="M80 24c8 6 14 20 14 28v44H82z"/><path class="kw" d="M68 90V56"/>
<circle class="c" cx="142" cy="140" r="36"/><circle class="p" cx="142" cy="140" r="28" style="opacity:.85"/><circle class="hl" cx="132" cy="130" r="9"/><ellipse class="s" cx="142" cy="104" rx="36" ry="6" style="opacity:.0"/>`),
  tooth: S(`<ellipse class="sh" cx="100" cy="184" rx="50" ry="7"/><path class="c" d="M60 30c14-10 28-4 40 2 12-6 26-12 40-2 18 14 16 46 8 66-6 16-6 30-10 54-3 22-10 32-18 32-12 0-10-46-20-46s-8 46-20 46c-8 0-15-10-18-32-4-24-4-38-10-54-8-20-10-52 8-66z" style="stroke:var(--pr);stroke-width:4"/>
<path class="sh" d="M140 30c18 14 16 46 8 66-6 16-6 30-10 54-3 22-10 32-18 32-6 0-8-12-10-24 10 2 14-30 18-56 4-28 22-52 12-72z" style="opacity:.08"/><path class="kw" d="M70 50c6-8 16-8 22-4" style="stroke:var(--pr);opacity:.6"/>
<path class="a" d="M150 22l4 9 9 4-9 4-4 9-4-9-9-4 9-4z"/><path class="a" d="M38 70l3 6 6 3-6 3-3 6-3-6-6-3 6-3z"/>`),
  heart: S(`<path class="p" d="M100 176C40 136 18 104 18 72c0-26 20-46 44-46 16 0 30 8 38 22 8-14 22-22 38-22 24 0 44 20 44 46 0 32-22 64-82 104z"/><path class="sh" d="M138 26c24 0 44 20 44 46 0 32-22 64-82 104 30-36 52-74 48-112-2-20-6-30-10-38z"/>
<path d="M30 98h40l12-24 16 48 14-34 10 10h48" style="fill:none;stroke:#fff;stroke-width:7;stroke-linecap:round;stroke-linejoin:round"/><path class="kw" d="M44 52c6-10 16-14 26-12" style="opacity:.8"/><rect class="w" x="140" y="36" width="10" height="30" rx="2"/><rect class="w" x="130" y="46" width="30" height="10" rx="2"/>`),
  dumbbell: S(`<ellipse class="sh" cx="100" cy="176" rx="80" ry="8"/><rect class="i" x="44" y="94" width="112" height="14" rx="7"/><rect class="p" x="24" y="56" width="26" height="90" rx="8"/><rect class="p" x="150" y="56" width="26" height="90" rx="8"/>
<rect class="s" x="8" y="70" width="18" height="62" rx="6"/><rect class="s" x="174" y="70" width="18" height="62" rx="6"/><rect class="sh" x="38" y="56" width="12" height="90" rx="6"/><rect class="sh" x="164" y="56" width="12" height="90" rx="6"/>
<rect class="a" x="56" y="96" width="10" height="10" rx="2"/><rect class="a" x="134" y="96" width="10" height="10" rx="2"/><path class="ka" d="M86 60l8-18h10l-6 14h12l-20 26 4-22z" style="fill:var(--ac);stroke-width:2"/>`),
  sofa: S(`<ellipse class="sh" cx="100" cy="176" rx="86" ry="8"/><rect class="i" x="28" y="150" width="8" height="22" rx="3"/><rect class="i" x="164" y="150" width="8" height="22" rx="3"/><path class="p" d="M34 70c0-12 10-20 22-20h88c12 0 22 8 22 20v40H34z"/>
<rect class="s" x="12" y="88" width="34" height="68" rx="14"/><rect class="s" x="154" y="88" width="34" height="68" rx="14"/><rect class="p" x="38" y="108" width="124" height="48" rx="10"/><rect class="sh" x="38" y="138" width="124" height="18" rx="8"/>
<path class="kw" d="M100 56v52M60 120h30M110 120h30"/><g class="a" style="opacity:.85"><circle cx="160" cy="40" r="7"/><circle cx="176" cy="54" r="4"/><circle cx="148" cy="24" r="4"/></g>`),
  truck: S(`<ellipse class="sh" cx="100" cy="178" rx="90" ry="8"/><rect class="p" x="8" y="52" width="118" height="96" rx="8"/><rect class="sh" x="8" y="122" width="118" height="26" rx="6"/><path class="s" d="M126 82h36l26 30v36h-62z"/>
<path class="c" d="M136 90h22l18 22h-40z"/><rect class="i" x="8" y="140" width="184" height="12" rx="6"/><circle class="i" cx="48" cy="156" r="18"/><circle class="c" cx="48" cy="156" r="7"/><circle class="i" cx="154" cy="156" r="18"/><circle class="c" cx="154" cy="156" r="7"/>
<path class="w" d="M30 76h60M30 92h40" style="stroke:#fff;stroke-width:6;stroke-linecap:round;opacity:.7"/><rect class="a" x="180" y="120" width="10" height="8" rx="2"/>`),
  house: S(`<ellipse class="sh" cx="100" cy="180" rx="84" ry="8"/><path class="s" d="M28 92L100 34l72 58v84H28z"/><path class="sh" d="M100 34l72 58v84h-72z"/><path class="p" d="M14 98L100 26l86 72-10 12-76-62-76 62z"/>
<rect class="i" x="86" y="124" width="30" height="52" rx="3" style="opacity:.85"/><circle class="a" cx="110" cy="152" r="3"/><rect class="c" x="42" y="110" width="28" height="26" rx="3"/><rect class="c" x="132" y="110" width="28" height="26" rx="3"/>
<path class="kp" d="M56 110v26M42 123h28M146 110v26M132 123h28" style="stroke-width:3"/><rect class="p" x="136" y="40" width="16" height="30"/>
<g transform="translate(150 150) rotate(-35)"><circle cx="0" cy="0" r="12" style="fill:none;stroke:var(--ac);stroke-width:5"/><path class="ka" d="M10 6l30 0M30 6v8M38 6v6" style="stroke-width:5"/></g>`),
  scales: S(`<ellipse class="sh" cx="100" cy="184" rx="60" ry="7"/><rect class="p" x="64" y="168" width="72" height="12" rx="4"/><rect class="p" x="94" y="40" width="12" height="130"/><rect class="sh" x="100" y="40" width="6" height="130"/>
<circle class="a" cx="100" cy="34" r="12"/><path class="ki" d="M24 62h152" style="stroke:var(--pr);stroke-width:7"/><path class="ki" d="M36 62l-22 58M36 62l22 58M164 62l-22 58M164 62l22 58" style="stroke-width:2.5;opacity:.7"/>
<path class="s" d="M8 120h56c0 16-12 26-28 26S8 136 8 120z"/><path class="s" d="M136 120h56c0 16-12 26-28 26s-28-10-28-26z"/><path class="sh" d="M36 120h28c0 16-12 26-28 26z"/><path class="sh" d="M164 120h28c0 16-12 26-28 26z"/>`),
  speech: S(`<path class="p" d="M20 40c0-12 8-20 20-20h84c12 0 20 8 20 20v48c0 12-8 20-20 20H72l-30 24 6-24h-8c-12 0-20-8-20-20z"/><path class="sh" d="M100 20h24c12 0 20 8 20 20v48c0 12-8 20-20 20h-24z"/>
<path class="s" d="M80 92c0-12 8-20 20-20h60c12 0 20 8 20 20v42c0 12-8 20-20 20h-4l4 22-28-22h-32c-12 0-20-8-20-20z"/>
<text x="62" y="76" text-anchor="middle" style="font:700 34px Georgia,serif;fill:#fff">Aa</text><text x="130" y="126" text-anchor="middle" style="font:700 30px Tahoma,sans-serif;fill:#fff">الف</text><circle class="a" cx="176" cy="34" r="10"/><circle class="a" cx="20" cy="164" r="6"/>`),
  guitar: S(`<rect class="i" x="124" y="8" width="26" height="30" rx="6" transform="rotate(35 137 23)"/><path class="i" d="M118 44l18 12-36 52-18-12z"/>
<path class="p" d="M78 82c14-6 30 0 36 14 4 10 0 18 6 26 10 12 8 32-6 44-18 16-50 14-68-4-18-18-20-50-4-68 12-14 32-16 44-6 6 6 14 0 18-8 0 0-12-4-26 2z"/><path class="sh" d="M120 122c10 12 8 32-6 44-18 16-50 14-68-4 26 6 58-2 74-40z"/>
<circle class="i" cx="80" cy="128" r="14"/><path class="kw" d="M72 160l58-92" style="stroke-width:1.6;opacity:.8"/><rect class="s" x="56" y="146" width="30" height="8" rx="3" transform="rotate(35 71 150)"/>
<text x="160" y="96" style="font:700 34px serif;fill:var(--ac)">♪</text><text x="22" y="56" style="font:700 26px serif;fill:var(--ac)">♫</text>`),
  plane: S(`<circle class="b" cx="100" cy="100" r="78" style="opacity:.0"/><path class="ki" d="M24 150c40-10 70-40 96-80" style="stroke-dasharray:4 10;opacity:.45"/>
<g transform="rotate(-30 110 90)"><path class="c" d="M40 92c0-6 6-10 14-10h96c12 0 28 4 28 10s-16 10-28 10H54c-8 0-14-4-14-10z"/><path class="p" d="M96 84l-26-48h18l46 48z"/><path class="p" d="M96 100l-26 48h18l46-48z"/><path class="s" d="M44 84l-10-24h12l20 24z"/>
<path class="sh" d="M40 92h138c0 6-16 10-28 10H54c-8 0-14-4-14-10z"/><g class="p" style="opacity:.75"><circle cx="122" cy="90" r="3"/><circle cx="134" cy="90" r="3"/><circle cx="146" cy="90" r="3"/></g></g>
<path class="c" d="M18 64c0-10 8-16 18-14 4-8 18-10 24 0 10 0 14 8 12 14z" style="opacity:.9"/><path class="c" d="M140 170c0-8 6-12 14-11 4-7 14-8 19 0 8 0 11 6 10 11z" style="opacity:.9"/>`),
  book: S(`<ellipse class="sh" cx="100" cy="176" rx="84" ry="8"/><path class="p" d="M12 60c30-8 60-6 88 8v104c-28-14-58-16-88-8z"/><path class="s" d="M188 60c-30-8-60-6-88 8v104c28-14 58-16 88-8z"/>
<path class="c" d="M20 56c28-6 54-4 80 10v100c-26-14-52-16-80-10z"/><path class="c" d="M180 56c-28-6-54-4-80 10v100c26-14 52-16 80-10z"/><path class="sh" d="M100 66c26-14 52-16 80-10v100c-28-6-54-4-80 10z" style="opacity:.06"/>
<path class="ki" d="M36 82c18-3 34-2 50 4M36 98c18-3 34-2 50 4M36 114c18-3 34-2 50 4M36 130c18-3 34-2 40 2M114 86c16-6 32-7 50-4M114 102c16-6 32-7 50-4M114 118c16-6 32-7 50-4" style="stroke-width:2.5;opacity:.25"/>
<path class="kp" d="M100 66v100" style="stroke-width:3"/><path class="a" d="M140 40h14v40l-7-6-7 6z"/><g class="a"><path d="M40 28l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/><circle cx="168" cy="26" r="3"/></g>`),
  glasses: S(`<ellipse class="sh" cx="100" cy="182" rx="76" ry="7"/>
<path class="s" d="M58 112c-6-30 6-52 42-52s48 22 42 52l-6 52c-1 8-8 14-16 14H80c-8 0-15-6-16-14z"/><path class="sh" d="M112 62c26 6 34 26 30 50l-6 52c-1 8-8 14-16 14h-8z"/>
<path class="ki" d="M78 66c0-22 10-34 22-34s22 12 22 34" style="stroke:var(--ac);stroke-width:6"/><rect class="a" x="88" y="96" width="24" height="14" rx="4"/><path class="kw" d="M70 120l-4 40"/>
<g transform="translate(0 6)"><circle cx="58" cy="54" r="26" class="p"/><circle cx="142" cy="54" r="26" class="p"/><path class="ki" d="M84 50c8-6 24-6 32 0M32 50L12 40M168 50l20-10" style="stroke-width:5"/>
<circle class="hl" cx="48" cy="46" r="8"/><circle class="hl" cx="132" cy="46" r="8"/></g>
<g class="a"><circle cx="30" cy="120" r="6"/><path d="M30 126l-6 14h12z"/><circle cx="172" cy="120" r="6"/><path d="M172 126l-6 14h12z"/></g>`),
  sneaker: S(`<ellipse class="sh" cx="100" cy="176" rx="88" ry="8"/>
<path class="s" d="M128 40h40l6 70h-52z"/><path class="ki" d="M136 40c0-18 24-18 24 0" style="stroke:var(--pr2);stroke-width:5"/><rect class="a" x="140" y="58" width="16" height="10" rx="3"/><path class="sh" d="M150 40h18l6 70h-24z"/>
<path class="c" d="M14 150c0-10 8-16 18-16h34c18 0 30-12 40-30l6-12c4-6 12-8 18-4l26 18c10 6 20 10 30 12 6 2 10 6 10 12v20z"/>
<path class="p" d="M60 134c18 0 30-12 40-30l6-12c4-6 12-8 18-4l26 18c-10 2-20 10-26 22-10 18-30 26-50 26z"/>
<path class="i" d="M10 150h182v10c0 6-4 10-10 10H22c-8 0-12-4-12-10z"/><path class="w" d="M14 160h176" style="stroke:#fff;stroke-width:3;stroke-dasharray:6 6;fill:none;opacity:.5"/>
<path class="ki" d="M98 112l14 6M104 102l14 6M110 92l14 6" style="stroke-width:3"/><path class="a" d="M150 132c10 2 20 4 30 6v8h-34z"/><path class="kw" d="M30 142h30"/>`),
  pencil: S(`<ellipse class="sh" cx="100" cy="182" rx="80" ry="7"/>
<rect class="c" x="26" y="58" width="108" height="122" rx="6" transform="rotate(-6 80 120)"/><g transform="rotate(-6 80 120)"><rect class="s" x="26" y="58" width="16" height="122" rx="4"/><g class="ki" style="stroke-width:2;opacity:.25"><path d="M52 86h70M52 104h70M52 122h70M52 140h50M52 158h60"/></g><g class="w"><circle cx="34" cy="76" r="3"/><circle cx="34" cy="100" r="3"/><circle cx="34" cy="124" r="3"/><circle cx="34" cy="148" r="3"/></g></g>
<g transform="rotate(38 140 100)"><rect class="p" x="128" y="20" width="24" height="120" rx="3"/><rect class="sh" x="140" y="20" width="12" height="120"/><rect class="a" x="128" y="14" width="24" height="12" rx="3"/><path class="b" d="M128 140h24l-12 28z" style="fill:#f1d3a6"/><path class="i" d="M136 158h8l-4 10z"/></g>
<g transform="rotate(-62 60 60)"><rect class="a" x="20" y="48" width="96" height="20" rx="3" style="opacity:.9"/><path class="ki" d="M30 48v8M42 48v12M54 48v8M66 48v12M78 48v8M90 48v12M102 48v8" style="stroke-width:2"/></g>`),
  tools: S(`<ellipse class="sh" cx="100" cy="182" rx="80" ry="7"/>
<g transform="rotate(45 100 100)"><rect class="s" x="92" y="54" width="16" height="122" rx="6"/><rect class="sh" x="100" y="54" width="8" height="122" rx="4"/><path class="p" d="M70 34h60v22c0 8-6 14-14 14H84c-8 0-14-6-14-14z"/><path class="sh" d="M100 34h30v22c0 8-6 14-14 14h-16z"/><path class="kw" d="M78 40v14"/></g>
<g transform="rotate(-45 100 100)"><rect class="i" x="93" y="60" width="14" height="118" rx="5"/><path class="a" d="M100 18c-18 0-30 12-30 26 0 8 4 14 10 18l8 4h24l8-4c6-4 10-10 10-18 0-14-12-26-30-26zm0 16a10 10 0 1 1 0 20 10 10 0 0 1 0-20z"/><path class="sh" d="M100 18c18 0 30 12 30 26 0 8-4 14-10 18l-8 4h-12v-12a10 10 0 0 0 0-20z"/></g>
<g class="a"><path d="M30 40l4 8 8 4-8 4-4 8-4-8-8-4 8-4z"/><circle cx="170" cy="150" r="4"/><circle cx="160" cy="34" r="3"/></g>`),
  autopart: S(`<ellipse class="sh" cx="100" cy="182" rx="80" ry="7"/>
<circle class="i" cx="88" cy="104" r="70"/><circle class="s" cx="88" cy="104" r="62"/><circle cx="88" cy="104" r="50" style="fill:none;stroke:#000;stroke-opacity:.18;stroke-width:2;stroke-dasharray:3 6"/>
<g class="i" style="opacity:.6"><circle cx="88" cy="58" r="5"/><circle cx="128" cy="86" r="5"/><circle cx="114" cy="138" r="5"/><circle cx="62" cy="138" r="5"/><circle cx="48" cy="86" r="5"/></g>
<circle class="c" cx="88" cy="104" r="22"/><circle class="i" cx="88" cy="104" r="8"/><path class="kw" d="M42 74a58 58 0 0 1 30-30"/>
<path class="p" d="M112 40c0-6 6-10 12-10h20c6 0 12 4 12 10v60h-44z"/><path class="sh" d="M134 30h10c6 0 12 4 12 10v60h-22z"/><rect class="a" x="120" y="100" width="28" height="22" rx="3"/>
<rect class="c" x="126" y="122" width="16" height="26"/><path class="i" d="M128 148h12l-6 16z"/><path class="kw" d="M118 46v44" style="stroke:#fff"/>
<path class="ka" d="M164 160l12 6M170 146l14 0M160 172l8 10" style="stroke-width:3"/>`),
  pot: S(`<ellipse class="sh" cx="100" cy="178" rx="84" ry="8"/>
<path class="ki" d="M30 92h-14M170 92h14" style="stroke-width:9"/><path class="p" d="M28 86h144v52c0 22-18 36-40 36H68c-22 0-40-14-40-36z"/><path class="sh" d="M112 86h60v52c0 22-18 36-40 36h-20z"/>
<rect class="s" x="22" y="78" width="156" height="14" rx="7"/><path class="c" d="M44 78c4-24 28-36 56-36s52 12 56 36z"/><rect class="a" x="92" y="30" width="16" height="14" rx="6"/><path class="kw" d="M44 108v40"/>
<path class="ki" d="M78 30c-6-8 6-12 0-22M122 30c-6-8 6-12 0-22" style="opacity:.3"/><g class="a"><circle cx="70" cy="126" r="5"/><circle cx="100" cy="132" r="5"/><circle cx="130" cy="126" r="5"/></g>`),
  plates: S(`<ellipse class="sh" cx="100" cy="182" rx="80" ry="8"/>
<ellipse class="s" cx="100" cy="164" rx="80" ry="16"/><ellipse class="p" cx="100" cy="150" rx="80" ry="16"/><ellipse class="s" cx="100" cy="136" rx="80" ry="16"/><ellipse class="p" cx="100" cy="122" rx="80" ry="16"/>
<ellipse class="c" cx="100" cy="98" rx="84" ry="36"/><ellipse cx="100" cy="98" rx="62" ry="25" style="fill:none;stroke:var(--pr);stroke-width:3;stroke-dasharray:2 7"/><ellipse class="b" cx="100" cy="98" rx="44" ry="17"/>
<g class="a"><path d="M100 84l4 7 8 2-6 5 1 8-7-4-7 4 1-8-6-5 8-2z"/><circle cx="56" cy="98" r="4"/><circle cx="144" cy="98" r="4"/></g><path class="kw" d="M40 88c10-12 26-18 40-20" style="stroke:var(--pr)"/>`),
  basket: S(`<ellipse class="sh" cx="100" cy="182" rx="82" ry="8"/>
<path class="ki" d="M56 72c0-34 88-34 88 0" style="stroke:var(--pr2);stroke-width:8"/><path class="p" d="M18 72h164l-16 104H34z"/><path class="sh" d="M112 72h70l-16 104h-54z"/>
<g class="c" style="opacity:.55"><rect x="36" y="88" width="20" height="10" rx="5"/><rect x="66" y="88" width="20" height="10" rx="5"/><rect x="96" y="88" width="20" height="10" rx="5"/><rect x="126" y="88" width="20" height="10" rx="5"/><rect x="156" y="88" width="12" height="10" rx="5"/>
<rect x="40" y="112" width="20" height="10" rx="5"/><rect x="70" y="112" width="20" height="10" rx="5"/><rect x="100" y="112" width="20" height="10" rx="5"/><rect x="130" y="112" width="20" height="10" rx="5"/>
<rect x="44" y="136" width="20" height="10" rx="5"/><rect x="74" y="136" width="20" height="10" rx="5"/><rect x="104" y="136" width="20" height="10" rx="5"/><rect x="134" y="136" width="20" height="10" rx="5"/></g>
<rect class="s" x="12" y="64" width="176" height="14" rx="7"/><rect class="a" x="128" y="24" width="40" height="34" rx="6"/><rect class="c" x="132" y="18" width="32" height="10" rx="4"/>`),
  pillow: S(`<ellipse class="sh" cx="100" cy="182" rx="86" ry="8"/>
<rect class="s" x="10" y="132" width="180" height="40" rx="14"/><rect class="sh" x="10" y="156" width="180" height="16" rx="8"/><path class="kw" d="M24 146h152" style="stroke-dasharray:6 8"/>
<path class="p" d="M22 96c0-16 8-22 22-24 36-6 76-6 112 0 14 2 22 8 22 24s-8 22-22 24c-36 6-76 6-112 0-14-2-22-8-22-24z"/><path class="sh" d="M100 70c20 0 40 1 56 4 14 2 22 8 22 22s-8 22-22 24c-16 3-36 4-56 4z"/>
<path class="c" d="M44 64c0-12 6-16 16-18 28-4 52-4 80 0 10 2 16 6 16 18s-6 16-16 18c-28 4-52 4-80 0-10-2-16-6-16-18z"/><path class="ki" d="M80 64c10 6 30 6 40 0" style="stroke:var(--pr);stroke-width:3;opacity:.6"/>
<g class="a"><path d="M160 22l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/><circle cx="30" cy="40" r="3"/></g><text x="164" y="58" style="font:700 20px serif;fill:var(--ac)">z</text>`),
  grill: S(`<ellipse class="sh" cx="100" cy="184" rx="80" ry="7"/>
<path class="ki" d="M48 150l-12 30M152 150l12 30" style="stroke-width:6"/><path class="i" d="M22 112h156l-12 40H34z"/><rect class="s" x="16" y="104" width="168" height="12" rx="4"/>
<g class="a"><circle cx="50" cy="104" r="7"/><circle cx="78" cy="102" r="8"/><circle cx="108" cy="104" r="7"/><circle cx="136" cy="102" r="8"/><circle cx="160" cy="104" r="6"/></g>
<g><path class="ki" d="M24 80h152M24 60h152M24 40h152" style="stroke:#9a8a7a;stroke-width:3"/>
<rect class="p" x="46" y="72" width="18" height="16" rx="6"/><rect class="s" x="70" y="72" width="14" height="16" rx="5"/><rect class="p" x="90" y="72" width="18" height="16" rx="6"/><rect class="c" x="114" y="73" width="12" height="14" rx="5"/><rect class="p" x="132" y="72" width="18" height="16" rx="6"/>
<rect class="p" x="56" y="52" width="18" height="16" rx="6"/><rect class="s" x="80" y="52" width="14" height="16" rx="5"/><rect class="p" x="100" y="52" width="18" height="16" rx="6"/><rect class="c" x="124" y="53" width="12" height="14" rx="5"/>
<rect class="p" x="66" y="32" width="18" height="16" rx="6"/><rect class="s" x="90" y="32" width="14" height="16" rx="5"/><rect class="p" x="110" y="32" width="18" height="16" rx="6"/></g>
<path class="ka" d="M60 98c-4-8 4-10 0-18M140 98c-4-8 4-10 0-18" style="stroke-width:3;opacity:.7"/>`),
  school: S(`<ellipse class="sh" cx="100" cy="184" rx="86" ry="7"/>
<rect class="c" x="26" y="80" width="148" height="98" rx="4"/><rect class="sh" x="100" y="80" width="74" height="98" style="opacity:.06"/><path class="p" d="M16 84L100 36l84 48z"/>
<rect class="s" x="86" y="130" width="28" height="48" rx="3"/><g class="b"><rect x="40" y="96" width="26" height="22" rx="3"/><rect x="134" y="96" width="26" height="22" rx="3"/><rect x="40" y="134" width="26" height="22" rx="3"/><rect x="134" y="134" width="26" height="22" rx="3"/></g>
<circle class="a" cx="100" cy="98" r="14"/><path class="ki" d="M100 88v10l7 4" style="stroke-width:3"/><path class="ki" d="M100 36V12" style="stroke-width:3"/><path class="a" d="M100 12h26l-6 7 6 7h-26z"/>
<g transform="translate(150 22) rotate(12)"><path class="i" d="M-24 8L0 -2l24 10L0 18z"/><path class="i" d="M-12 12v10c8 6 16 6 24 0V12"/><path class="ka" d="M24 8v14" style="stroke-width:2"/></g>`),
  slip: S(`<ellipse class="sh" cx="100" cy="184" rx="60" ry="7"/>
<path class="ki" d="M100 8q9 0 9 9 0 7-9 11v8" style="stroke:#9a8a7a;stroke-width:2.5"/><path class="ki" d="M100 36L46 62h108z" style="stroke:#9a8a7a;stroke-width:2.5"/>
<path class="ki" d="M76 62l6 26M124 62l-6 26" style="stroke:var(--pr);stroke-width:2.5"/>
<path class="p" d="M80 88c6 10 34 10 40 0l6 16c-4 4-8 6-8 8l30 64c-30 10-66 10-96 0l30-64c0-2-4-4-8-8z"/><path class="sh" d="M100 96c10 0 18-2 20-8l6 16c-4 4-8 6-8 8l30 64c-15 5-31 8-48 8z"/>
<path d="M50 170c16 6 84 6 100 0" style="fill:none;stroke:#fff;stroke-width:3;stroke-dasharray:2 5;opacity:.7"/><path d="M84 100c10 6 22 6 32 0" style="fill:none;stroke:#fff;stroke-width:2;opacity:.55"/>
<g class="a"><path d="M100 112c-8-8-18-4-14 2 4 6 14 2 14-2zm0 0c8-8 18-4 14 2-4 6-14 2-14-2z"/><circle cx="100" cy="112" r="3"/></g><g class="a"><path d="M158 40l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/><circle cx="40" cy="96" r="3"/></g>`),
  handbag: S(`<ellipse class="sh" cx="100" cy="182" rx="76" ry="8"/>
<path class="ki" d="M66 82V60c0-20 14-32 34-32s34 12 34 32v22" style="stroke:var(--pr2);stroke-width:9"/>
<path class="p" d="M30 80h140l-8 92c-1 6-6 10-12 10H50c-6 0-11-4-12-10z"/><path class="sh" d="M112 80h58l-8 92c-1 6-6 10-12 10h-38z"/>
<path class="s" d="M30 80h140v28c-40 14-100 14-140 0z"/><rect class="a" x="88" y="98" width="24" height="20" rx="4"/><rect class="i" x="96" y="104" width="8" height="8" rx="2" style="opacity:.5"/>
<path d="M44 124c8 30 8 40 6 50M156 124c-8 30-8 40-6 50" style="fill:none;stroke:#fff;stroke-width:2;stroke-dasharray:3 6;opacity:.5"/><path class="kw" d="M44 92h20"/>`),
  heel: S(`<ellipse class="sh" cx="100" cy="182" rx="84" ry="7"/>
<path class="p" d="M22 126c0-10 6-16 16-16 18 0 28-30 44-46 10-10 26-10 34 2 10 14 18 32 30 46 10 12 24 16 34 18v20H96c-20 0-32-10-40-22-6 8-14 14-24 16z"/>
<path class="sh" d="M116 66c10 14 18 32 30 46 10 12 24 16 34 18v20h-48c4-30-4-60-16-84z"/><path class="s" d="M22 126c0-10 6-16 16-16 8 0 14-4 20-10l12 14c-8 12-18 22-30 26-10 2-18-4-18-14z"/>
<path class="i" d="M30 140l4 40h10l-2-40z"/><path class="i" d="M96 166h84v14H96z" style="opacity:.85"/><path class="kw" d="M70 92c6-10 14-18 22-22"/>
<g class="a"><circle cx="130" cy="150" r="4"/><path d="M164 30l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/></g>`),
  tank: S(`<ellipse class="sh" cx="100" cy="184" rx="70" ry="7"/>
<path class="c" d="M70 20c0 22 8 34 30 34s30-12 30-34h14c0 26 4 38 16 48v108H40V68c12-10 16-22 16-48z" style="stroke:var(--pr);stroke-width:3"/>
<path class="sh" d="M100 54c22 0 30-12 30-34h14c0 26 4 38 16 48v108h-60z" style="opacity:.06"/><path d="M70 20c0 22 8 34 30 34s30-12 30-34" style="fill:none;stroke:var(--pr);stroke-width:6"/>
<path d="M40 166h120" style="fill:none;stroke:var(--pr);stroke-width:5"/><path d="M56 74v84M144 74v84" style="fill:none;stroke:var(--pr);stroke-width:1.5;stroke-dasharray:2 6;opacity:.6"/>
<rect class="p" x="120" y="118" width="62" height="46" rx="6" transform="rotate(-8 151 141)"/><path d="M122 132l58-8" transform="rotate(0)" style="fill:none;stroke:#fff;stroke-width:4;opacity:.7"/><g class="a"><circle cx="40" cy="40" r="3"/><path d="M168 46l3 6 6 3-6 3-3 6-3-6-6-3 6-3z"/></g>`),
  bed: S(`<ellipse class="sh" cx="100" cy="180" rx="88" ry="8"/><rect class="s" x="14" y="56" width="22" height="120" rx="6"/><rect class="i" x="164" y="120" width="10" height="56" rx="3"/><rect class="p" x="30" y="112" width="148" height="44" rx="10"/>
<rect class="c" x="34" y="94" width="144" height="28" rx="12"/><rect class="w" x="40" y="80" width="46" height="26" rx="12" style="opacity:.95"/><path class="sh" d="M30 140h148v6c0 6-4 10-10 10H40c-6 0-10-4-10-10z"/>
<path class="a" d="M92 98h86v20c-30 4-58 2-86-6z" style="opacity:.75"/><g class="a"><path d="M146 30l4 8 8 4-8 4-4 8-4-8-8-4 8-4z"/><circle cx="176" cy="60" r="3"/><circle cx="118" cy="46" r="2.5"/></g>`),
  beans: S(`<ellipse class="sh" cx="100" cy="184" rx="84" ry="7"/>
<path class="p" d="M44 60c-6-22 10-36 22-30 10-10 58-10 68 0 12-6 28 8 22 30 10 26 12 70 4 104-2 10-10 16-20 16H60c-10 0-18-6-20-16-8-34-6-78 4-104z"/><path class="sh" d="M112 30c10 0 18 2 22 0 12-6 28 8 22 30 10 26 12 70 4 104-2 10-10 16-20 16h-28z"/>
<path class="ki" d="M52 58c30 8 66 8 96 0" style="stroke:var(--pr2);stroke-width:6"/><path d="M70 34c10 8 50 8 60 0" style="fill:none;stroke:#000;stroke-opacity:.18;stroke-width:3"/>
<rect class="c" x="62" y="84" width="76" height="62" rx="8"/><g transform="translate(100 115) rotate(-30)"><ellipse class="s" rx="17" ry="24"/><path d="M0 -22c-8 10 8 34 0 44" style="fill:none;stroke:var(--card);stroke-width:3.5"/></g>
<g class="s"><g transform="translate(30 172) rotate(40)"><ellipse rx="9" ry="12"/></g><g transform="translate(170 168) rotate(-25)"><ellipse rx="9" ry="12"/></g><g transform="translate(152 182) rotate(70)"><ellipse rx="7" ry="10"/></g></g>
<path class="kw" d="M54 100c-4 20-2 44 2 60"/><path class="ka" d="M86 22c-6-8 6-12 0-20M114 22c-6-8 6-12 0-20" style="stroke-width:3;opacity:.7"/>`),
  fridge: S(`<ellipse class="sh" cx="100" cy="184" rx="88" ry="7"/>
<rect class="p" x="18" y="14" width="82" height="164" rx="12"/><rect class="sh" x="62" y="14" width="38" height="164" rx="12" style="opacity:.1"/><path d="M18 74h82" style="stroke:var(--card);stroke-width:4"/>
<rect class="c" x="84" y="30" width="7" height="30" rx="3.5"/><rect class="c" x="84" y="88" width="7" height="48" rx="3.5"/><path class="kw" d="M30 28v34M30 88v70"/>
<rect class="c" x="106" y="72" width="80" height="106" rx="10"/><rect class="sh" x="106" y="160" width="80" height="18" rx="9" style="opacity:.08"/><rect class="s" x="106" y="72" width="80" height="20" rx="10"/>
<circle class="a" cx="122" cy="82" r="4"/><rect class="b" x="134" y="78" width="40" height="8" rx="4"/>
<circle class="i" cx="146" cy="134" r="30"/><circle class="s" cx="146" cy="134" r="24"/><path class="hl" d="M128 124c4-10 14-16 24-16-12 4-20 12-24 22z"/><path d="M128 140c12 8 24 8 36 0" style="fill:none;stroke:#fff;stroke-width:3;opacity:.45"/>
<g class="a"><circle cx="34" cy="190" r="0"/><path d="M178 20l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/></g>`),
  headphones: S(`<ellipse class="sh" cx="100" cy="184" rx="70" ry="7"/>
<path class="ki" d="M40 112V96c0-36 26-64 60-64s60 28 60 64v16" style="stroke:var(--pr2);stroke-width:12"/><path class="ki" d="M48 100c0-30 22-56 52-56" style="stroke:#fff;stroke-width:3;opacity:.35"/>
<rect class="p" x="22" y="100" width="40" height="66" rx="18"/><rect class="p" x="138" y="100" width="40" height="66" rx="18"/><rect class="sh" x="42" y="100" width="20" height="66" rx="10"/><rect class="sh" x="158" y="100" width="20" height="66" rx="10"/>
<rect class="i" x="56" y="110" width="12" height="46" rx="6"/><rect class="i" x="132" y="110" width="12" height="46" rx="6"/><path class="kw" d="M32 114v36M148 114v36"/>
<path class="ka" d="M86 120c6 6 6 16 0 22M98 112c10 10 10 30 0 40M110 104c14 14 14 42 0 56" style="stroke-width:4"/>
<g class="a"><path d="M170 30l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/><circle cx="28" cy="46" r="3"/><circle cx="182" cy="76" r="2.5"/></g>`),
  devices: S(`<ellipse class="sh" cx="100" cy="182" rx="90" ry="7"/>
<rect class="i" x="18" y="40" width="132" height="90" rx="8"/><rect class="s" x="25" y="47" width="118" height="76" rx="4"/><path class="hl" d="M25 47h60l-34 76H25z" style="opacity:.18"/>
<g class="c" style="opacity:.8"><rect x="34" y="58" width="44" height="6" rx="3"/><rect x="34" y="70" width="70" height="4" rx="2" style="opacity:.6"/><rect x="34" y="96" width="30" height="18" rx="4"/><rect x="70" y="96" width="30" height="18" rx="4"/></g>
<path class="c" d="M6 132h156l-10 14H16z"/><path class="sh" d="M6 132h156l-2 4H8z"/><rect class="b" x="70" y="134" width="28" height="4" rx="2"/>
<rect class="p" x="128" y="64" width="58" height="112" rx="12"/><rect class="i" x="134" y="72" width="46" height="94" rx="7"/><rect class="p" x="134" y="72" width="46" height="94" rx="7" style="opacity:.35"/>
<rect class="p" x="150" y="68" width="14" height="4" rx="2"/><circle class="c" cx="157" cy="118" r="12" style="opacity:.85"/><path d="M152 118l4 4 7-8" style="fill:none;stroke:var(--pr);stroke-width:3;stroke-linecap:round"/>
<path class="kw" d="M140 82v30"/><g class="a"><path d="M172 22l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/><circle cx="14" cy="24" r="3"/></g>`),
  onesie: S(`<ellipse class="sh" cx="100" cy="184" rx="70" ry="7"/>
<path class="p" d="M70 24c4 14 16 20 30 20s26-6 30-20l40 22-14 34-20-8v54c0 10-6 18-14 22l-6 30H84l-6-30c-8-4-14-12-14-22V72l-20 8-14-34z"/><path class="sh" d="M100 44c14 0 26-6 30-20l40 22-14 34-20-8v54c0 10-6 18-14 22l-6 30h-16z"/>
<path d="M70 24c4 14 16 20 30 20s26-6 30-20" style="fill:none;stroke:var(--card);stroke-width:6;stroke-linecap:round"/><path d="M30 46l14 34M170 46l-14 34" style="fill:none;stroke:var(--ac);stroke-width:5;stroke-linecap:round"/>
<g class="c"><circle cx="100" cy="74" r="4"/><circle cx="100" cy="92" r="4"/><circle cx="100" cy="110" r="4"/><circle cx="92" cy="170" r="3.5"/><circle cx="108" cy="170" r="3.5"/></g>
<g transform="translate(124 120)"><path class="a" d="M0 -12l3.5 7 7.5 1.2-5.5 5.3 1.3 7.5L0 5.4l-6.8 3.6 1.3-7.5-5.5-5.3 7.5-1.2z"/></g><path class="kw" d="M74 82v40"/>
<g transform="translate(36 150) rotate(-30)"><circle class="s" cx="0" cy="0" r="12"/><rect class="s" x="-3" y="10" width="6" height="22" rx="3"/><circle class="a" cx="0" cy="0" r="5"/></g>
<g class="a"><path d="M170 120l3 6 6 3-6 3-3 6-3-6-6-3 6-3z"/><circle cx="160" cy="160" r="3"/></g>`),
  breakfast: S(`<ellipse class="sh" cx="100" cy="184" rx="88" ry="7"/>
<circle class="a" cx="150" cy="40" r="22" style="opacity:.35"/><circle class="a" cx="150" cy="40" r="14"/>
<g class="ka" style="stroke-width:3"><path d="M150 10v-6M178 40h6M170 20l5-5M130 20l-5-5"/></g>
<ellipse class="s" cx="92" cy="146" rx="80" ry="30"/><ellipse class="c" cx="92" cy="140" rx="80" ry="30"/><ellipse cx="92" cy="140" rx="62" ry="22" style="fill:none;stroke:var(--pr);stroke-width:2;stroke-dasharray:2 6;opacity:.6"/>
<path class="w" d="M56 136c-10-12 4-26 18-22 6-12 26-12 32 0 14-4 26 10 18 22 8 10-2 22-16 20-8 8-28 8-36 0-14 2-24-10-16-20z"/><circle class="a" cx="84" cy="136" r="13"/><path class="hl" d="M78 130c3-3 7-4 10-3" style="opacity:.6"/>
<path class="p" d="M110 118c0-10 8-16 18-16h14c10 0 18 6 18 16v8c0 4-2 6-6 6v18h-38v-18c-4 0-6-2-6-6z" transform="rotate(10 135 130)"/><path class="b" d="M118 126h30v18h-30z" transform="rotate(10 135 130)" style="opacity:.5"/>
<path class="i" d="M30 92h24l-3 30c0 4-3 6-6 6h-6c-3 0-6-2-6-6z" style="opacity:.85"/><path class="p" d="M32 100h20l-2 21c0 3-2 4-4 4h-8c-2 0-4-1-4-4z"/><path class="kw" d="M36 102v16"/>
<path class="ki" d="M38 86c-4-6 4-8 0-14M46 86c-4-6 4-8 0-14" style="stroke-width:2.5;opacity:.4"/>`),
  fabric: S(`<ellipse class="sh" cx="100" cy="186" rx="88" ry="7"/>
<path class="p" d="M40 150h120c10 0 16 8 16 16s-6 16-16 16H40z"/><path class="sh" d="M40 166h136c0 8-6 16-16 16H40z"/><ellipse class="s" cx="40" cy="166" rx="10" ry="16"/><ellipse class="b" cx="40" cy="166" rx="4" ry="7"/>
<path class="a" d="M52 116h104c10 0 16 8 16 16s-6 16-16 16H52z"/><path class="sh" d="M52 132h120c0 8-6 16-16 16H52z"/><ellipse class="p" cx="52" cy="132" rx="10" ry="16"/><ellipse class="b" cx="52" cy="132" rx="4" ry="7"/>
<path class="s" d="M64 82h84c10 0 16 8 16 16s-6 16-16 16H64z"/><path class="sh" d="M64 98h100c0 8-6 16-16 16H64z"/><ellipse class="a" cx="64" cy="98" rx="10" ry="16"/><ellipse class="b" cx="64" cy="98" rx="4" ry="7"/>
<g style="fill:none;stroke:#fff;stroke-width:2;opacity:.35"><path d="M70 124h80M80 140h70M76 92h66M86 106h56M60 158h96M70 174h80"/></g>
<path class="c" d="M100 22h70v58c-12-6-24 4-35-2s-24 4-35-2z"/><g class="p" style="opacity:.75"><circle cx="114" cy="36" r="4"/><circle cx="134" cy="36" r="4"/><circle cx="154" cy="36" r="4"/><circle cx="124" cy="52" r="4"/><circle cx="144" cy="52" r="4"/><circle cx="114" cy="66" r="3.5"/><circle cx="154" cy="66" r="3.5"/></g>
<rect class="a" x="96" y="18" width="78" height="8" rx="4"/><path class="ka" d="M20 60c20-24 50-30 74-20" style="stroke-width:5"/><g style="stroke:var(--ink);stroke-width:1.5;opacity:.6"><path d="M30 50l3 4M40 44l3 4M50 40l2 5M60 37l2 5M70 36l1 5M80 37l1 5"/></g>`),
  ferris: S(`<ellipse class="sh" cx="100" cy="186" rx="82" ry="7"/>
<path class="ki" d="M100 86L58 180M100 86l42 94" style="stroke:var(--pr2);stroke-width:8"/><path class="ki" d="M70 160h60" style="stroke:var(--pr2);stroke-width:5"/>
<circle cx="100" cy="86" r="66" style="fill:none;stroke:var(--pr);stroke-width:7"/><circle cx="100" cy="86" r="52" style="fill:none;stroke:var(--pr);stroke-width:2;opacity:.5"/>
<g style="stroke:var(--pr);stroke-width:2.5;opacity:.7"><path d="M100 20v132M34 86h132M53 39l94 94M147 39l-94 94"/></g><circle class="a" cx="100" cy="86" r="12"/><circle class="i" cx="100" cy="86" r="4"/>
<g><rect class="a" x="91" y="14" width="18" height="16" rx="5"/><rect class="s" x="157" y="78" width="18" height="16" rx="5"/><rect class="a" x="91" y="144" width="18" height="16" rx="5"/><rect class="s" x="25" y="78" width="18" height="16" rx="5"/>
<rect class="p" x="138" y="32" width="18" height="16" rx="5"/><rect class="p" x="138" y="126" width="18" height="16" rx="5"/><rect class="p" x="44" y="126" width="18" height="16" rx="5"/><rect class="p" x="44" y="32" width="18" height="16" rx="5"/></g>
<g class="a"><path d="M180 20l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/><circle cx="16" cy="30" r="3"/><circle cx="186" cy="150" r="2.5"/></g>`),
};

/** Motif SVG wrapped for placement (hero, about, gallery, loader). */
export function motif(name) {
  if (!MOTIFS[name]) throw new Error(`unknown motif ${name}`);
  return `<div class="mot">${MOTIFS[name]}</div>`;
}
