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
  bed: S(`<ellipse class="sh" cx="100" cy="180" rx="88" ry="8"/><rect class="s" x="14" y="56" width="22" height="120" rx="6"/><rect class="i" x="164" y="120" width="10" height="56" rx="3"/><rect class="p" x="30" y="112" width="148" height="44" rx="10"/>
<rect class="c" x="34" y="94" width="144" height="28" rx="12"/><rect class="w" x="40" y="80" width="46" height="26" rx="12" style="opacity:.95"/><path class="sh" d="M30 140h148v6c0 6-4 10-10 10H40c-6 0-10-4-10-10z"/>
<path class="a" d="M92 98h86v20c-30 4-58 2-86-6z" style="opacity:.75"/><g class="a"><path d="M146 30l4 8 8 4-8 4-4 8-4-8-8-4 8-4z"/><circle cx="176" cy="60" r="3"/><circle cx="118" cy="46" r="2.5"/></g>`),
};

/** Motif SVG wrapped for placement (hero, about, gallery, loader). */
export function motif(name) {
  if (!MOTIFS[name]) throw new Error(`unknown motif ${name}`);
  return `<div class="mot">${MOTIFS[name]}</div>`;
}
