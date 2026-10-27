import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build import load_configs
HERE=os.path.dirname(os.path.abspath(__file__))
SRC=os.path.join(HERE,'data','original-menus.json')
d=json.load(open(SRC,encoding='utf-8')) if os.path.exists(SRC) else {}
for c in load_configs():
    if c.get('menu'): d[c['id']]=c['menu']
body=json.dumps(d,ensure_ascii=False,indent=2)
ts='''// Default (starting) menus of the templates that have an editable menu.
// Generated from the original template data — edit freely, but keep the shape
// of MenuCategory (see menu.ts). A private site starts from its template's
// default and stores its own copy once the menu is edited in the dashboard.
import type { MenuCategory } from "./menu";

export const DEFAULT_MENUS: Record<string, MenuCategory[]> = '''+body+''';
'''
open(os.path.join(HERE,'..','..','lib','siteTemplates','menus.default.ts'),'w',encoding='utf-8',newline='\n').write(ts)
print({k:sum(len(c['items']) for c in v) for k,v in d.items()})
