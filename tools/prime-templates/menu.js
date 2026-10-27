
/* ---------- full menu: editable from the dashboard (SM = canonical menu) ---------- */
const SM = {{menu_json}}; /* [{title, emoji, items:[{name, desc, price, emoji, image, badge}]}] */
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const MXC=[['var(--pr)','var(--on)'],['var(--ac)','#1a130d'],['var(--pr2)','#ffffff']];
const mxStyle=i=>`--c:${MXC[i%3][0]};--cc:${MXC[i%3][1]}`;
function mxPrice(p){ const m=String(p).match(/^([\d۰-۹,٬،.\s]+)\s*(.*)$/); return m&&m[2]? `${esc(m[1].trim())}<small>${esc(m[2])}</small>` : esc(p); }
if(Array.isArray(SM)&&SM.length){
  $('#mxChips').innerHTML=SM.map((c,i)=>`<button class="mxchip" type="button" data-k="${i}" style="${mxStyle(i)}"><span>${esc(c.emoji||'')}</span>${esc(c.title)}</button>`).join('');
  $('#mxCats').innerHTML=SM.map((c,ci)=>`<section class="mxcat" id="mxcat-${ci}" style="${mxStyle(ci)}"><div class="mxh"><div class="mxic">${esc(c.emoji||'🍽️')}</div><div><h3>${esc(c.title)}</h3><small>${c.items.length.toLocaleString('fa-IR')} مورد</small></div></div><div class="mxit">${c.items.map((it,ii)=>`<button class="mxi" type="button" data-c="${ci}" data-i="${ii}"><div class="mxt">${it.image?`<img src="${esc(it.image)}" alt="${esc(it.name)}" loading="lazy">`:esc(it.emoji||c.emoji||'🍽️')}</div><div class="mxx"><h4>${esc(it.name)}</h4>${it.desc?`<p>${esc(it.desc)}</p>`:''}${it.badge?`<span class="mxb">${esc(it.badge)}</span>`:''}</div>${it.price?`<div class="mxp">${mxPrice(it.price)}</div>`:''}</button>`).join('')}</div></section>`).join('');

  const chipBar=$('#mxChips'), chips=$$('.mxchip');
  const setChip=k=>{ chips.forEach(c=>c.classList.toggle('on',c.dataset.k===String(k))); const el=chips.find(c=>c.dataset.k===String(k)); if(!el) return; const d=(el.getBoundingClientRect().left+el.offsetWidth/2)-(chipBar.getBoundingClientRect().left+chipBar.clientWidth/2); chipBar.scrollBy({left:d,behavior:'smooth'}); };
  chips.forEach(c=>c.addEventListener('click',()=>{ const t=$('#mxcat-'+c.dataset.k); if(window.__lenis) window.__lenis.scrollTo(t,{offset:-130,duration:1.2}); else t.scrollIntoView({behavior:'smooth',block:'start'}); }));
  let mxTick=false, mxCur=-1;
  addEventListener('scroll',()=>{ if(mxTick) return; mxTick=true; requestAnimationFrame(()=>{ mxTick=false;
    const line=innerHeight*.34; let k=-1; $$('.mxcat').forEach((c,i)=>{ if(c.style.display!=='none'&&c.getBoundingClientRect().top<=line) k=i; });
    const r=$('#menu').getBoundingClientRect(); if(r.top>innerHeight*.5||r.bottom<innerHeight*.3) k=-1;
    if(k>=0&&k!==mxCur){ mxCur=k; setChip(k); } }); },{passive:true});
  $('#mxq').addEventListener('input',e=>{ const q=e.target.value.trim().toLowerCase(); let any=false;
    $$('.mxcat').forEach((cat,ci)=>{ let n=0; $$('.mxi',cat).forEach(b=>{ const it=SM[ci].items[+b.dataset.i]; const hit=!q||((it.name||'')+' '+(it.desc||'')).toLowerCase().includes(q); b.style.display=hit?'':'none'; if(hit) n++; }); cat.style.display=n?'':'none'; if(n) any=true; });
    $('#mxNo').classList.toggle('on',!any); });
  $('#mxCats').addEventListener('click',e=>{ const b=e.target.closest('.mxi'); if(!b) return; const c=SM[+b.dataset.c], it=c.items[+b.dataset.i];
    $('#sh-i').innerHTML=it.image?`<img src="${esc(it.image)}" alt="${esc(it.name)}">`:esc(it.emoji||c.emoji||'🍽️');
    $('#sh-t').textContent=it.name; $('#sh-d').textContent=it.desc||''; $('#sh-p').textContent=it.price||''; $('#sh-b').textContent=it.badge||'';
    $('#sh-b').style.display=it.badge?'inline-block':'none';
    sheet.classList.add('on'); sheet.setAttribute('aria-hidden','false'); document.body.classList.add('lock'); if(window.__lenis) window.__lenis.stop(); });
} else { const m=$('#menu'); if(m) m.style.display='none'; }
