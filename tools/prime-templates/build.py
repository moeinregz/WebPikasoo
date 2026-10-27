import re, os, json, colorsys, importlib, sys, glob
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'lib', 'siteTemplates', 'templates') + os.sep
FA = '۰۱۲۳۴۵۶۷۸۹'
fa = lambda n: ''.join(FA[int(c)] if c.isdigit() else c for c in str(n))

FONTS = {
    'Vazirmatn': ('', 900),
    'Lalezar': ('&family=Lalezar', 400),
    'Amiri': ('&family=Amiri:wght@400;700', 700),
    'Aref Ruqaa': ('&family=Aref+Ruqaa:wght@400;700', 700),
    'Noto Kufi Arabic': ('&family=Noto+Kufi+Arabic:wght@500;800', 800),
    'Markazi Text': ('&family=Markazi+Text:wght@500;700', 700),
    'Reem Kufi': ('&family=Reem+Kufi:wght@500;700', 700),
}
BANDS_LIGHT = dict(stmt='a', svc='b', menu='d', about='a', steps='c', gal='d', rev='b', contact='a')
BANDS_DARK = dict(stmt='a', svc='b', menu='d', about='a', steps='c', gal='d', rev='b', contact='d')

def lum(h):
    h = h.lstrip('#'); r, g, b = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
    return .2126 * r + .7152 * g + .0722 * b

def esc(t):
    return t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')

def build(cfg):
    s = open(os.path.join(HERE, 'engine.html'), encoding='utf-8').read()
    pal = cfg['pal']; dark = cfg['dark']
    fq, dw = FONTS[cfg['font']]
    on = '#ffffff' if lum(pal['pr']) < .5 else '#1a130d'
    bands = dict(BANDS_DARK if dark else BANDS_LIGHT); bands.update(cfg.get('bands', {}))
    hero_dark = cfg['hero_dark']

    # headline gradient must stay readable on the hero background
    if hero_dark:
        bright = max((pal['pr'], pal['pr2']), key=lum)
        g1, g2 = 'var(--ac)', ('var(--pr)' if bright == pal['pr'] else 'var(--pr2)') if lum(bright) > .38 else 'var(--ac)'
    else:
        g1, g2 = 'var(--pr)', ('var(--pr2)' if lum(pal['pr2']) < .6 else 'var(--pr)')
    chips = ''.join(f'<div class="chip c{i+1}"><b>{e}</b>{esc(t)}</div>' for i, (e, t) in enumerate(cfg['chips']))
    marquee = ''.join(f'<span>{esc(w)}</span>' for w in cfg['marquee'])
    kw = ''.join(f'<span>{esc(k)}</span>' for k in cfg['kw'])
    svc = ''.join(
        f'<div class="cd" role="button" tabindex="0" data-t="{esc(t)}" data-d="{esc(d)}" data-e="{e}">'
        f'<div class="ic">{e}</div><h3>{esc(t)}</h3><p>{esc(d)}</p><span class="go">جزئیات ‹</span></div>'
        for e, t, d in cfg['svc'])
    feats = ''.join(f'<div class="ft" data-r><b class="i">{e}</b><div><h3>{esc(t)}</h3><p>{esc(d)}</p></div></div>' for e, t, d in cfg['feats'])
    steps = ''.join(f'<div class="sp"><div class="no">{fa(i+1)}</div><div class="t"><h3>{esc(t)}</h3><p>{esc(d)}</p></div></div>' for i, (t, d) in enumerate(cfg['steps']))
    gal = ''.join(
        f'<figure class="gi" data-i="{i}"><img data-slot="g{i+1}" alt="{esc(c)}" loading="lazy" width="500" height="625"><figcaption>{esc(c)}</figcaption></figure>'
        for i, c in enumerate(cfg['gal']))
    revs = ''.join(
        f'<article class="rc"><div class="st">★★★★★</div><p>{esc(t)}</p><div class="wh"><div class="av">{esc(n[0])}</div><div><b>{esc(n)}</b><span>{esc(cfg["rev_role"])}</span></div></div></article>'
        for n, t in cfg['revs'])

    # em markers in titles: *word* -> <em>word</em>
    em = lambda t: re.sub(r'\*([^*]+)\*', r'<em>\1</em>', esc(t))

    has_menu = bool(cfg.get('menu'))
    read = lambda f: open(os.path.join(HERE, f), encoding='utf-8').read() if has_menu else ''
    rep = {
        'MENU_SECTION': read('menu_section.html'), 'MENU_CSS': read('menu.css'), 'MENU_JS': read('menu.js'),
        'SVCID': 'menu' if has_menu else 'svc', 'B_MENU': 's-' + bands['menu'],
        'MENU_T': em(cfg.get('menu_h', 'منوی *کامل*')),
        'G1': g1, 'G2': g2, 'FONTQ': fq, 'DISP': cfg['font'], 'DISPW': str(dw),
        'BG': pal['bg'], 'INK': pal['ink'], 'DEEP': pal['deep'],
        'PR': '{{t:' + pal['pr'] + '}}', 'PR2': '{{t:' + pal['pr2'] + '}}', 'AC': '{{t:' + pal['ac'] + '}}',
        'ON': on, 'RAD': str(cfg.get('rad', 22)), 'SHAPE': cfg.get('shape', 'circle'),
        'HEROV': cfg.get('hero', 'split'), 'HEROTONE': 'dk' if hero_dark else 'lt', 'HDCLS': '' if hero_dark else 'lt',
        'LOADER': cfg.get('loader', 'panels'), 'PARTICLE': cfg.get('particle', '✦'),
        'NAVSVC': cfg['nav_svc'], 'NAVSTEPS': cfg['nav_steps'], 'CTA': cfg['cta'], 'CTA2': cfg['cta2'], 'MBICON': cfg['mb_icon'],
        'TAG': esc(cfg['tag']), 'LEAD': esc(cfg['lead']), 'STMT': esc(cfg['stmt']),
        'SVC_E': esc(cfg['svc_h'][0]), 'SVC_T': em(cfg['svc_h'][1]), 'SVC_S': esc(cfg['svc_h'][2]),
        'AB_T': em(cfg['about'][0]), 'AB_P1': esc(cfg['about'][1]), 'AB_P2': esc(cfg['about'][2]),
        'ST_E': esc(cfg['steps_h'][0]), 'ST_T': em(cfg['steps_h'][1]),
        'GAL_E': esc(cfg['gal_h'][0]), 'GAL_T': em(cfg['gal_h'][1]),
        'REV_T': em(cfg['rev_h']), 'CT_T': em(cfg['ct_h'][0]), 'CT_S': esc(cfg['ct_h'][1]),
        'CHIPS': chips, 'MARQUEE': marquee, 'KW': kw, 'SVC': svc, 'FEATS': feats, 'STEPS': steps, 'GAL': gal, 'REVS': revs,
        'GALCAPS': json.dumps(cfg['gal'], ensure_ascii=False),
        'EMBLEM': cfg['emblem'].strip(),
        'B_STMT': 's-' + bands['stmt'], 'B_SVC': 's-' + bands['svc'], 'B_ABOUT': 's-' + bands['about'],
        'B_STEPS': 's-' + bands['steps'], 'B_GAL': 's-' + bands['gal'], 'B_REV': 's-' + bands['rev'], 'B_CONTACT': 's-' + bands['contact'],
    }
    # longest keys first so @@AB_P1@@ never collides
    for k in sorted(rep, key=len, reverse=True):
        s = s.replace('@@' + k + '@@', rep[k])
    left = re.findall(r'@@\w+@@', s)
    assert not left, (cfg['id'], left)
    # the head script of engine uses plain strings only; make sure no stray template braces remain
    assert '{{{' not in s
    open(OUT + cfg['id'] + '.template.html', 'w', encoding='utf-8', newline='\n').write(s)
    return len(s)

def ts_entry(cfg):
    pal = cfg['pal']
    ph = cfg['photo']
    slots = [
        ('hero', ph['hero'][0], ph['hero'][1], '1:1'),
        ('about', ph['about'][0], ph['about'][1], '4:5'),
    ] + [(f'g{i+1}', f'گالری — {c}', ph['gal'][i] if i < len(ph['gal']) else 'گالری', '4:5') for i, c in enumerate(cfg['gal'])]
    menu_line = '    menu: true,\n' if cfg.get('menu') else ''
    lines = ''.join(f'      {{ key: "{k}", label: "{l}", hint: "{h}", ratio: "{r}" }},\n' for k, l, h, r in slots)
    return (f'  {{\n    id: "{cfg["id"]}",\n    trade: "{cfg["trade"]}",\n    label: "{cfg["label"]}",\n    html: {camel(cfg["id"])},\n{menu_line}'
            f'    palette: {{ primary: "{pal["pr"]}", secondary: "{pal["pr2"]}" }},\n    images: [\n{lines}    ],\n  }},\n')

def camel(i):
    p = i.split('-'); return p[0] + ''.join(x.capitalize() for x in p[1:])

def load_configs():
    cfgs = []
    for f in sorted(glob.glob(os.path.join(HERE, 'cfg_*.py'))):
        ns = {}; exec(open(f, encoding='utf-8').read(), ns); cfgs += ns['CONFIGS']
    return cfgs

if __name__ == '__main__':
    only = sys.argv[1:]
    cfgs = load_configs()
    for c in cfgs:
        if only and c['id'] not in only: continue
        print(c['id'], build(c))
