import re, sys
sys.path.insert(0,'.')
from build import load_configs, ts_entry, camel
cfgs=load_configs()
import os
p=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','lib','siteTemplates','index.ts')
t=open(p,encoding='utf-8',newline='').read()
nl='\r\n' if '\r\n' in t else '\n'
# remove any earlier registration of prime templates (idempotent)
t=re.sub(r'import \w+Prime from "\./templates/[\w-]+-prime\.template\.html";\r?\n','',t)
t=re.sub(r'  \{\r?\n    id: "[\w]+-prime",.*?\r?\n  \},\r?\n','',t,flags=re.S)
anchor='import dentalNora from "./templates/dental-nora.template.html";'+nl
assert anchor in t
imps=''.join(f'import {camel(c["id"])} from "./templates/{c["id"]}.template.html";{nl}' for c in cfgs)
t=t.replace(anchor,anchor+imps,1)
end='];'+nl+nl+'export function templatesForTrade'
assert end in t
entries=''.join(ts_entry(c) for c in cfgs).replace('\n',nl)
t=t.replace(end,entries+end,1)
open(p,'w',encoding='utf-8',newline='').write(t)
print(len(cfgs),'registered')
