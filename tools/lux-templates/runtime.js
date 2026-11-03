(function(){
"use strict";
/* lux engine runtime — shared by every *-lux template. Reads the per-template
   config C (items, quiz, mode…), the uploaded photos SI and, for food
   templates, the editable menu SM. Everything works without GSAP/Motion;
   those only add the animation layer in window.__luxFx. */
var FA="۰۱۲۳۴۵۶۷۸۹";
function fa(n){return String(n).replace(/\d/g,function(d){return FA[d]})}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function img(k){return SI&&typeof SI[k]==="string"&&/^https?:|^data:image\//.test(SI[k])?SI[k]:""}
function waLink(t){return /^https:\/\/wa\.me\//.test(WA)?WA.split("?")[0]+"?text="+encodeURIComponent(t):(WA||"#")}
var $=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var M=null,root=document.documentElement,css=getComputedStyle(root);
function cv(n,f){return css.getPropertyValue(n).trim()||f}

/* ---------- photos ---------- */
if(img("hero")){var hv=$("#heroVis");if(hv)hv.innerHTML='<div class="hph"><img src="'+esc(img("hero"))+'" alt=""></div>'}
if(img("about")){var av=$("#aboutVis");if(av)av.innerHTML='<img src="'+esc(img("about"))+'" alt="">'}
$$(".gi[data-k]").forEach(function(g){var u=img(g.dataset.k);if(u){var p=g.querySelector(".ph");if(p)p.outerHTML='<img src="'+esc(u)+'" alt="">'}});

/* ---------- items: food templates read the editable menu ---------- */
var ITEMS=C.items.slice();
var useMenu=C.menu&&Array.isArray(SM)&&SM.length&&SM.some(function(c){return c&&c.items&&c.items.length});
function itemCard(it,i){
  var vis=it.image?'<img src="'+esc(it.image)+'" alt="">':'<span class="em">'+esc(it.e||C.emoji)+'</span>';
  return '<article class="card" style="--tone:'+esc(it.tone||"var(--pr)")+'">'+(it.tag?'<span class="tag">'+esc(it.tag)+'</span>':'')+
    '<div class="vis">'+vis+'</div><h3>'+esc(it.t)+'</h3>'+(it.d?'<p>'+esc(it.d)+'</p>':'')+
    '<div class="ft"><span class="pr">'+esc(it.p||C.priceHint||"")+'</span>'+(C.bag?'<button class="add" data-i="'+i+'">'+esc(C.addLabel)+'</button>':'<a class="add" target="_blank" rel="noopener" href="'+esc(waLink(C.askText+" «"+it.t+"»"))+'">'+esc(C.askLabel)+'</a>')+'</div></article>';
}
var TONES=["var(--pr)","var(--pr2)","var(--ac)"];
if(useMenu){
  ITEMS=[];
  SM.forEach(function(c){(c.items||[]).forEach(function(m){ITEMS.push({t:m.name,d:m.desc,p:m.price,e:m.emoji||c.emoji,tag:m.badge,image:/^https:|^data:image\//.test(m.image||"")?m.image:"",cat:c.title,tone:TONES[ITEMS.length%3]})})});
}
function renderTrack(list){var tr=$("#track");if(tr)tr.innerHTML=list.map(function(it){return itemCard(it,ITEMS.indexOf(it))}).join("")}
if(useMenu){
  var cats=[];SM.forEach(function(c){if(c.items&&c.items.length)cats.push(c.title)});
  var tabs=$("#tabs");
  if(tabs&&cats.length>1){
    tabs.innerHTML='<button class="on" data-c="">همه</button>'+cats.map(function(c){return '<button data-c="'+esc(c)+'">'+esc(c)+'</button>'}).join("");
    tabs.addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;$$("#tabs button").forEach(function(x){x.classList.toggle("on",x===b)});
      var list=b.dataset.c?ITEMS.filter(function(it){return it.cat===b.dataset.c}):ITEMS;
      var go=function(){renderTrack(list);if(M)M.animate("#track .card",{opacity:[0,1],y:[40,0],scale:[.95,1]},{delay:M.stagger(.05),duration:.6,ease:[.16,1,.3,1]});if(window.ScrollTrigger)window.ScrollTrigger.refresh()};
      if(M)M.animate("#track .card",{opacity:0,y:-20},{duration:.2}).then(go);else go()});
  }
  renderTrack(ITEMS);
}

/* ---------- bag (WhatsApp order / inquiry) ---------- */
var bag={},tT;
function toast(m){var t=$(".toast");if(!t)return;t.textContent=m;if(M)M.animate(t,{opacity:[0,1],y:[20,0]},{duration:.4});else t.style.opacity=1;clearTimeout(tT);tT=setTimeout(function(){if(M)M.animate(t,{opacity:0},{duration:.4});else t.style.opacity=0},1800)}
function renderBag(){
  var ids=Object.keys(bag),n=ids.reduce(function(a,k){return a+bag[k]},0);
  $$(".bag-n").forEach(function(b){b.textContent=fa(n);b.classList.toggle("on",n>0)});
  var ul=$(".bag-list");if(!ul)return;
  ul.innerHTML=ids.length?ids.map(function(k){var it=ITEMS[k];return '<li><span class="em">'+esc(it.e||C.emoji)+'</span><div>'+esc(it.t)+'<small>'+esc(it.p||"")+'</small></div><div class="qt"><button data-q="'+k+'" data-d="1">+</button><span>'+fa(bag[k])+'</span><button data-q="'+k+'" data-d="-1">−</button></div></li>'}).join(""):'<li class="empty">'+esc(C.emptyBag)+'</li>';
  var s=$(".send");if(s){s.style.display=ids.length?"":"none";s.href=waLink(C.bagText+"\n"+ids.map(function(k){return "• "+ITEMS[k].t+" × "+bag[k]}).join("\n"))}
}
function flyTo(from){
  var tg=$(innerWidth<=900?".mbar [data-open-bag]":".nav .bag");if(!M||!tg)return;
  var a=from.getBoundingClientRect(),b=tg.getBoundingClientRect(),d=document.createElement("div");d.className="fly";
  d.style.left=(a.left+a.width/2-7)+"px";d.style.top=(a.top+a.height/2-7)+"px";document.body.appendChild(d);
  var dx=b.left+b.width/2-(a.left+a.width/2),dy=b.top+b.height/2-(a.top+a.height/2);
  M.animate(d,{x:[0,dx*.5,dx],y:[0,dy-120,dy],scale:[1,1.4,.3]},{duration:.85,ease:"easeInOut"}).then(function(){d.remove();M.animate(tg,{scale:[1,1.25,1]},{type:"spring",bounce:.6,duration:.6})});
}
document.addEventListener("click",function(e){
  var a=e.target.closest("button.add");
  if(a&&a.dataset.i!=null){var i=a.dataset.i;bag[i]=(bag[i]||0)+1;renderBag();flyTo(a);toast("«"+ITEMS[i].t+"» "+C.addedMsg);a.classList.add("done");setTimeout(function(){a.classList.remove("done")},1200);return}
  var q=e.target.closest("[data-q]");if(q){var k=q.dataset.q;bag[k]=(bag[k]||0)+Number(q.dataset.d);if(bag[k]<=0)delete bag[k];renderBag();return}
  if(e.target.closest("[data-open-bag]")){var dr=$(".dr");if(dr)dr.classList.add("on");return}
  if(e.target.closest("[data-close-bag]")){$(".dr").classList.remove("on");return}
  if(e.target.closest(".burger")){document.body.classList.toggle("menu-open");return}
  if(e.target.closest(".mm a"))document.body.classList.remove("menu-open");
});
addEventListener("keydown",function(e){if(e.key==="Escape"){var dr=$(".dr");if(dr)dr.classList.remove("on");document.body.classList.remove("menu-open")}});
renderBag();

/* ---------- finder quiz ---------- */
var qb=$("#quiz .qbody"),ans=[],step=0;
function drawQuiz(){
  if(!qb||!C.quiz)return;var Q=C.quiz.qs;
  $("#quiz .qbar i").style.width=(step/Q.length*100)+"%";
  var html;
  if(step<Q.length){var s=Q[step];
    html='<div class="qstep"><h3>'+fa(step+1)+'. '+esc(s.q)+'</h3><div class="qopts">'+s.o.map(function(o,j){return '<button class="qo" data-j="'+j+'"><i>'+o[0]+'</i><span>'+esc(o[1])+(o[2]?'<small>'+esc(o[2])+'</small>':'')+'</span></button>'}).join("")+'</div></div>';
  } else {
    var R=C.quiz.results,sc=R.map(function(){return 0});
    ans.forEach(function(a){(a||[]).forEach(function(v,i){sc[i]+=v})});
    var best=sc.indexOf(Math.max.apply(null,sc)),r=R[best];
    html='<div class="qstep qres"><div class="qem">'+r[0]+'</div><div><span class="kick">'+esc(C.quiz.resKick)+'</span><h3>'+esc(r[1])+'</h3><p class="sub">'+esc(r[2])+'</p><div class="acts"><a class="btn p" target="_blank" rel="noopener" href="'+esc(waLink(C.quiz.waText+" «"+r[1]+"»"))+'">'+esc(C.quiz.cta)+'</a><button class="btn g qr">از اول</button></div></div></div>';
  }
  var go=function(){qb.innerHTML=html;if(M)M.animate(qb.querySelectorAll(".qstep h3, .qo, .qres > *, .acts > *"),{opacity:[0,1],y:[30,0]},{delay:M.stagger(.06),duration:.6,ease:[.16,1,.3,1]});if(M&&step>=C.quiz.qs.length)M.animate(qb.querySelector(".qem"),{scale:[0,1],rotate:[-30,0]},{type:"spring",bounce:.55,duration:1})};
  if(M&&qb.firstChild)M.animate(qb.firstChild,{opacity:0,x:[0,60]},{duration:.3}).then(go);else go();
}
if(qb)qb.addEventListener("click",function(e){var o=e.target.closest(".qo");if(o){ans[step]=C.quiz.qs[step].o[o.dataset.j][3];step++;drawQuiz();return}if(e.target.closest(".qr")){ans=[];step=0;drawQuiz()}});
drawQuiz();

/* ---------- request form → WhatsApp ---------- */
var fm=$("#rform");
if(fm){
  var ch=$("#rtype");if(ch)ch.addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;$$("#rtype button").forEach(function(x){x.classList.toggle("on",x===b)});if(M)M.animate(b,{scale:[.9,1]},{type:"spring",bounce:.6})});
  fm.addEventListener("submit",function(e){e.preventDefault();
    var n=$("#rn").value.trim(),p=$("#rp").value.trim();
    if(!n||!p){var f=!n?$("#rn"):$("#rp");f.focus();if(M)M.animate(f.parentNode,{x:[0,-10,10,-6,6,0]},{duration:.45});toast("لطفاً نام و شماره رو وارد کن");return}
    var t=C.form.waIntro+"\nنام: "+n+"\nتماس: "+p+(ch?"\n"+C.form.typeLabel+": "+$("#rtype .on").textContent:"")+($("#rw")?"\n"+C.form.whenLabel+": "+$("#rw").value:"")+($("#rx")&&$("#rx").value.trim()?"\nتوضیح: "+$("#rx").value.trim():"");
    window.open(waLink(t),"_blank","noopener");toast(C.form.done);
  });
}

/* ---------- testimonials ---------- */
var tq=$$("#tq blockquote"),ti=0,tTm;
function showT(i){if(!tq.length)return;ti=i;tq.forEach(function(b,j){b.style.opacity=j===i?1:0;b.style.visibility=j===i?"visible":"hidden"});$$("#tdots button").forEach(function(b,j){b.classList.toggle("on",j===i)});
  if(M)M.animate(tq[i],{opacity:[0,1],y:[24,0],filter:["blur(8px)","blur(0px)"]},{duration:.8,ease:[.16,1,.3,1]});clearTimeout(tTm);tTm=setTimeout(function(){showT((ti+1)%tq.length)},5600)}
var td=$("#tdots");if(td){td.innerHTML=tq.map(function(_,i){return '<button aria-label="نظر '+fa(i+1)+'"></button>'}).join("");td.addEventListener("click",function(e){var b=e.target.closest("button");if(b)showT($$("#tdots button").indexOf(b))})}
showT(0);

/* ---------- nav state ---------- */
var lastY=0;addEventListener("scroll",function(){var y=scrollY,n=$(".nav");n.classList.toggle("sc",y>30);n.classList.toggle("hide",y>lastY&&y>500&&!document.body.classList.contains("menu-open"));lastY=y},{passive:true});

/* ---------- particles ---------- */
(function(){
  var c=$("#fx");if(!c||!root.classList.contains("motion")||!C.particles)return;
  var x=c.getContext("2d"),W,H,ps=[],dpr=Math.min(devicePixelRatio||1,2),kind=C.particles;
  var cols=[cv("--pr","#c90"),cv("--pr2","#555"),cv("--ac","#fc0"),cv("--ink","#222")];
  var glyphs=(C.glyphs||"♪♫").split("");
  function rs(){W=c.clientWidth;H=c.clientHeight;c.width=W*dpr;c.height=H*dpr;x.setTransform(dpr,0,0,dpr,0,0)}rs();addEventListener("resize",rs);
  var src=$("#heroVis"),mx=-999,my=-999;
  c.parentNode.addEventListener("pointermove",function(e){var r=c.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top});
  var rise={steam:1,sparks:1,bubbles:1,glyphs:1,twinkle:0,fall:-1,sprinkles:-1,leaves:-1,confetti:-1,streaks:2};
  function spawn(init){
    var p={l:0,L:180+Math.random()*240,r:1+Math.random()*2.6,a:0,rot:Math.random()*6,vr:(Math.random()-.5)*.06,c:cols[(Math.random()*3)|0],g:glyphs[(Math.random()*glyphs.length)|0]};
    var dir=rise[kind];
    if(kind==="steam"||kind==="sparks"){var s=src?src.getBoundingClientRect():null,r=c.getBoundingClientRect();
      p.x=s?s.left-r.left+s.width*(.3+Math.random()*.4):Math.random()*W;p.y=s?s.top-r.top+s.height*(kind==="steam"?.15:.5):H;
      p.vx=(Math.random()-.5)*.6;p.vy=-(.5+Math.random()*(kind==="sparks"?1.6:.8));if(kind==="steam")p.r=8+Math.random()*14;}
    else if(dir===2){p.x=init?Math.random()*W:W+60+Math.random()*200;p.y=Math.random()*H;p.vx=-(5+Math.random()*10);p.vy=0;p.r=40+Math.random()*110;p.L=9e9;p.vr=0;p.rot=0}
    else if(dir===1){p.x=Math.random()*W;p.y=init?Math.random()*H:H+20;p.vx=(Math.random()-.5)*.4;p.vy=-(.3+Math.random()*.7);if(kind==="glyphs")p.r=12+Math.random()*16;if(kind==="bubbles")p.r=3+Math.random()*9}
    else if(dir===-1){p.x=Math.random()*W;p.y=init?Math.random()*H:-20;p.vx=(Math.random()-.5)*.5;p.vy=.3+Math.random()*.8;if(kind==="leaves"||kind==="confetti")p.r=4+Math.random()*6;p.L=9e9}
    else {p.x=Math.random()*W;p.y=Math.random()*H;p.vx=0;p.vy=0;p.L=80+Math.random()*120}
    return p;
  }
  var N=kind==="steam"?40:kind==="sparks"?90:kind==="twinkle"?50:60;
  for(var i=0;i<N;i++)ps.push(spawn(true));
  var vis=true;new IntersectionObserver(function(e){vis=e[0].isIntersecting}).observe(c);
  (function loop(t){requestAnimationFrame(loop);if(!vis)return;x.clearRect(0,0,W,H);
    for(var i=0;i<ps.length;i++){var p=ps[i];p.l++;
      if(kind!=="streaks")p.vx+=Math.sin((p.l+i*7)*.03)*.012;var dx=p.x-mx,dy=p.y-my,dd=dx*dx+dy*dy;if(dd<10000&&dd>1){p.vx+=dx/dd*5;p.vy+=dy/dd*5}
      p.x+=p.vx;p.y+=p.vy;p.rot+=p.vr;
      var life=p.L>1e8?1:Math.min(1,p.l/30)*(1-p.l/p.L);
      if(p.l>p.L||p.y<-60||p.y>H+60||p.x<-260){ps[i]=spawn(false);continue}
      x.save();x.translate(p.x,p.y);x.rotate(p.rot);
      if(kind==="steam"){var rr=p.r+p.l*.09,gr=x.createRadialGradient(0,0,0,0,0,rr);gr.addColorStop(0,"rgba(255,255,255,"+(life*.22)+")");gr.addColorStop(1,"rgba(255,255,255,0)");x.fillStyle=gr;x.beginPath();x.arc(0,0,rr,0,6.283);x.fill()}
      else if(kind==="sparks"){x.globalAlpha=life;x.fillStyle=p.l%9<5?cols[2]:cols[0];x.beginPath();x.arc(0,0,p.r*.8,0,6.283);x.fill()}
      else if(kind==="bubbles"){x.globalAlpha=life*.5;x.strokeStyle=cols[0];x.lineWidth=1.2;x.beginPath();x.arc(0,0,p.r,0,6.283);x.stroke()}
      else if(kind==="glyphs"){x.globalAlpha=life*.35;x.fillStyle=cols[0];x.font=p.r+"px serif";x.fillText(p.g,0,0)}
      else if(kind==="twinkle"){var tw=Math.sin(p.l/p.L*Math.PI);x.globalAlpha=tw;x.fillStyle=cols[2];x.beginPath();for(var k=0;k<4;k++){x.rotate(Math.PI/2);x.moveTo(0,0);x.quadraticCurveTo(p.r*.4,p.r*.4,0,p.r*3)}x.fill()}
      else if(kind==="fall"){x.globalAlpha=.5;x.fillStyle=cols[3];x.beginPath();x.arc(0,0,p.r*.8,0,6.283);x.fill()}
      else if(kind==="sprinkles"||kind==="confetti"){x.globalAlpha=.85;x.fillStyle=p.c;x.fillRect(-p.r/2,-p.r*1.4,p.r,p.r*2.8)}
      else if(kind==="streaks"){x.globalAlpha=.35;x.strokeStyle=p.c;x.lineWidth=1.6;x.beginPath();x.moveTo(0,0);x.lineTo(p.r,0);x.stroke()}
      else if(kind==="leaves"){x.globalAlpha=.6;x.fillStyle=p.c;x.beginPath();x.ellipse(0,0,p.r*1.6,p.r*.7,0,0,6.283);x.fill()}
      x.restore()}
  })(0);
})();

/* ---------- GSAP + Motion layer (optional) ---------- */
window.__luxFx=function(){
  M=window.Motion||null;
  var G=window.gsap,ST=window.ScrollTrigger;
  if(!root.classList.contains("motion")||!G){var l=$(".ld");if(l)l.style.display="none";$$(".stx .w").forEach(function(w){w.style.opacity=1});$$("[data-count]").forEach(function(b){b.textContent=fa(b.dataset.count)+(b.dataset.suf||"")});return}
  G.registerPlugin(ST);
  /* CSS smooth scrolling fights ScrollTrigger's refresh; scroll anchors in JS instead */
  root.style.scrollBehavior="auto";
  document.addEventListener("click",function(e){var a=e.target.closest('a[href^="#"]');if(!a)return;var id=a.getAttribute("href");var t=id.length>1?$(id):null;if(!t&&id!=="#top")return;e.preventDefault();
    var y=id==="#top"?0:t.getBoundingClientRect().top+scrollY-70;window.scrollTo({top:y,behavior:"smooth"})});
  var stx=$(".stx");if(stx)stx.innerHTML=stx.textContent.trim().split(/\s+/).map(function(w){return '<span class="w">'+w+'</span>'}).join(" ");

  var heroTl=G.timeline({paused:true,defaults:{ease:"expo.out"}})
    .from(".nav",{yPercent:-100,duration:1,clearProps:"transform"})
    .from(".h1 .ln > span",{yPercent:115,rotate:3,duration:1.25,stagger:.1},.1)
    .from("#heroVis",{scale:.55,opacity:0,y:90,rotate:-12,duration:1.7},.15)
    .from(".h-in",{y:30,opacity:0,duration:1,stagger:.1,clearProps:"transform,opacity"},.5)
    .from(".chip",{scale:0,opacity:0,duration:.9,stagger:.08,ease:"back.out(2)",clearProps:"transform,opacity"},.8)
    .from(".ghost",{opacity:0,yPercent:30,duration:1.8},.2);
  var ld=$(".ld");
  if(root.classList.contains("seen")||!ld)heroTl.play();
  else{
    root.style.overflow="hidden";var cnt={v:0};
    var tl=G.timeline();
    tl.fromTo(".ld .mk",{clipPath:"inset(100% 0 0 0)"},{clipPath:"inset(0% 0 0 0)",duration:1.5,ease:"power2.inOut"})
      .from(".ld .mk",{scale:.8,rotate:-10,duration:1.5,ease:"expo.out"},0)
      .to(cnt,{v:100,duration:1.5,ease:"power2.inOut",onUpdate:function(){var n=$(".ld .n");if(n)n.textContent=fa(Math.round(cnt.v))}},0)
      .from(".ld .bn span",{yPercent:115,duration:1,ease:"expo.out"},.35)
      .to(".ld .mk",{scale:1.25,rotate:8,duration:.5,ease:"back.in(2)"},1.7)
      .to(".ld .in",{opacity:0,y:-30,duration:.45,ease:"power2.in"},1.9)
      .to(".ld .wp",{scaleY:1,duration:.7,stagger:.06,ease:"expo.inOut"},1.95)
      .set(".ld",{background:"transparent"},2.6)
      .set(".ld .in",{display:"none"},2.6)
      .to(".ld .wp",{scaleY:0,transformOrigin:"50% 0%",duration:.7,stagger:.06,ease:"expo.inOut"},2.65)
      .add(function(){heroTl.play()},2.75)
      .add(function(){ld.style.display="none";root.style.overflow="";try{sessionStorage.setItem("seen:"+location.pathname,"1")}catch(e){}},3.5);
    ld.addEventListener("click",function(){tl.timeScale(4)});
  }

  /* hero motif: idle float + mouse tilt (Motion) + scroll exit */
  G.to("#heroVis .mot",{y:-14,rotate:2,duration:3.2,repeat:-1,yoyo:true,ease:"sine.inOut"});
  G.to(".orb",{rotate:360,duration:40,repeat:-1,ease:"none"});
  if(M&&matchMedia("(hover:hover)").matches){
    var hero=$(".hero");hero.addEventListener("pointermove",function(e){var r=hero.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
      M.animate("#heroVis",{rotateY:px*26,rotateX:-py*18},{type:"spring",stiffness:110,damping:14});
      M.animate(".chips",{x:px*-24,y:py*-16},{type:"spring",stiffness:80,damping:16})});
  }
  G.to(".hvwrap",{yPercent:28,scale:.86,ease:"none",scrollTrigger:{trigger:".hero",start:"top top",end:"bottom top",scrub:true}});
  G.to(".htx",{yPercent:-18,opacity:.2,ease:"none",scrollTrigger:{trigger:".hero",start:"35% top",end:"bottom top",scrub:true}});
  G.to(".ghost",{xPercent:-22,ease:"none",scrollTrigger:{trigger:".hero",start:"top top",end:"bottom top",scrub:true}});

  /* marquee skew with scroll velocity */
  var rows=$$(".mq .row"),sk=rows.map(function(r){return G.quickTo(r,"skewX",{duration:.5,ease:"power3"})});
  ST.create({onUpdate:function(s){var v=G.utils.clamp(-12,12,s.getVelocity()/-150);sk.forEach(function(f){f(v)})}});

  /* statement: words light up */
  if(stx)G.to(".stx .w",{opacity:1,stagger:.1,ease:"none",scrollTrigger:{trigger:".st",start:"top 70%",end:"bottom 60%",scrub:true}});
  G.from("#aboutVis",{clipPath:"inset(30% 30% 30% 30% round 40px)",duration:1.6,ease:"expo.out",scrollTrigger:{trigger:"#aboutVis",start:"top 85%",once:true}});
  G.to("#aboutVis img, #aboutVis .mot",{yPercent:-10,ease:"none",scrollTrigger:{trigger:"#aboutVis",start:"top bottom",end:"bottom top",scrub:true}});

  /* reveals */
  $$(".rv").forEach(function(el){G.from(el,{y:60,opacity:0,duration:1.2,ease:"expo.out",clearProps:"transform,opacity",scrollTrigger:{trigger:el,start:"top 88%",once:true}})});
  $$(".h2").forEach(function(h){G.from(h,{clipPath:"inset(0 0 100% 0)",y:40,duration:1.3,ease:"expo.out",clearProps:"clipPath,transform",scrollTrigger:{trigger:h,start:"top 88%",once:true}})});

  /* showcase: pinned horizontal on desktop */
  var mm=G.matchMedia();
  mm.add("(min-width:901px)",function(){
    var tr=$("#track");if(!tr)return;var dist=function(){return Math.max(0,tr.scrollWidth-innerWidth)};
    if(dist()<40){G.from("#track .card",{y:80,opacity:0,duration:1,stagger:.08,ease:"expo.out",clearProps:"transform,opacity",scrollTrigger:{trigger:tr,start:"top 85%",once:true}});return}
    G.to(tr,{x:function(){return dist()},ease:"none",scrollTrigger:{trigger:".pin",start:"center center",end:function(){return "+="+dist()},pin:true,scrub:1,invalidateOnRefresh:true,anticipatePin:1}});
    G.from("#track .card",{y:120,opacity:0,rotate:4,duration:1.2,stagger:.08,ease:"expo.out",scrollTrigger:{trigger:".pin",start:"top 75%",once:true}});
  });
  mm.add("(max-width:900px)",function(){$$("#track .card").forEach(function(c){G.from(c,{y:70,opacity:0,duration:1,ease:"expo.out",clearProps:"transform,opacity",scrollTrigger:{trigger:c,start:"top 92%",once:true}})})});
  if(M&&matchMedia("(hover:hover)").matches){
    document.addEventListener("pointermove",function(e){var c=e.target.closest&&e.target.closest(".card, .sv");if(!c)return;var r=c.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
      c.style.setProperty("--x",(e.clientX-r.left)+"px");c.style.setProperty("--y",(e.clientY-r.top)+"px");
      if(c.classList.contains("card"))M.animate(c,{rotateY:px*12,rotateX:-py*12,transformPerspective:900},{type:"spring",stiffness:200,damping:18})});
    document.addEventListener("pointerout",function(e){var c=e.target.closest&&e.target.closest(".card");if(c&&!c.contains(e.relatedTarget))M.animate(c,{rotateY:0,rotateX:0},{type:"spring",stiffness:120,damping:12})});
  }

  /* steps: path draws with scroll, icons pop */
  var sp=$(".spath");if(sp)G.fromTo(sp,{clipPath:"inset(0 0 0 100%)"},{clipPath:"inset(0 0 0 0%)",ease:"none",scrollTrigger:{trigger:".steps",start:"top 80%",end:"bottom 55%",scrub:true}});
  G.from(".step .ic",{scale:0,rotate:-40,duration:.8,stagger:.15,ease:"back.out(2.2)",scrollTrigger:{trigger:".steps",start:"top 78%",once:true}});

  /* counters */
  $$("[data-count]").forEach(function(b){var o={v:0},to=+b.dataset.count,suf=b.dataset.suf||"";
    G.to(o,{v:to,duration:2,ease:"power3.out",scrollTrigger:{trigger:b,start:"top 92%",once:true},onUpdate:function(){b.textContent=fa(Math.round(o.v))+suf}})});
  G.from(".stat",{y:50,opacity:0,duration:1,stagger:.1,ease:"expo.out",clearProps:"transform,opacity",scrollTrigger:{trigger:".stats",start:"top 88%",once:true}});

  /* services, gallery, cta */
  G.from(".sv",{y:80,opacity:0,rotate:-3,duration:1.1,stagger:.08,ease:"expo.out",clearProps:"transform,opacity",scrollTrigger:{trigger:".svg",start:"top 86%",once:true}});
  $$(".gi").forEach(function(g,i){G.from(g,{clipPath:"inset(100% 0 0 0 round 24px)",duration:1.4,ease:"expo.out",delay:(i%4)*.08,scrollTrigger:{trigger:g,start:"top 92%",once:true}});G.to(g.querySelector("img, .ph"),{yPercent:9,ease:"none",scrollTrigger:{trigger:g,start:"top bottom",end:"bottom top",scrub:true}})});
  G.fromTo(".cta",{scale:.88,borderRadius:"90px"},{scale:1,borderRadius:"32px",ease:"none",scrollTrigger:{trigger:".cta",start:"top bottom",end:"top 45%",scrub:true}});
  G.from(".form > *",{y:40,opacity:0,duration:1,stagger:.07,ease:"expo.out",clearProps:"transform,opacity",scrollTrigger:{trigger:".form",start:"top 88%",once:true}});
  G.from("footer .big",{yPercent:70,opacity:0,duration:1.4,ease:"expo.out",scrollTrigger:{trigger:"footer",start:"top 92%",once:true}});

  /* cursor + magnetic (Motion) */
  if(M&&matchMedia("(hover:hover)").matches){
    var cur=$(".cur");
    addEventListener("pointermove",function(e){cur.classList.add("on");M.animate(cur,{x:e.clientX,y:e.clientY},{type:"spring",stiffness:500,damping:35,mass:.4})});
    document.addEventListener("pointerover",function(e){var h=e.target.closest("a,button,.card");M.animate(cur,{scale:h?1.9:1},{duration:.3})});
    $$(".mag").forEach(function(b){b.addEventListener("pointermove",function(e){var r=b.getBoundingClientRect();M.animate(b,{x:(e.clientX-r.left-r.width/2)*.25,y:(e.clientY-r.top-r.height/2)*.35},{type:"spring",stiffness:250,damping:15})});b.addEventListener("pointerleave",function(){M.animate(b,{x:0,y:0},{type:"spring",stiffness:180,damping:10})})});
  }
  addEventListener("load",function(){ST.refresh()});
};
})();
