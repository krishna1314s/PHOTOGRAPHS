// Reads the album data from data.js, builds the page and runs the scroll effects.
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
const cl=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),ss=t=>t*t*(3-2*t);
const T={morning:['#060608','#ecebf3','255,200,150'],midday:['#03060a','#e8f0f8','110,170,255'],golden:['#0a0503','#f7e4c8','255,125,40'],night:['#010102','#d8dcec','120,140,220']};
const LENS=[.706,.449]; // phone camera position inside the selfie (fraction of width, height)
const I=D.imgs,all=[],total=D.chapters.reduce((n,c)=>n+c.photos.length,0);

/* content */
$$('[data-name]').forEach(e=>e.textContent=D.name);document.title=D.name+' | Photography';
$('#lead').textContent=D.lead;$('#about-p').textContent=D.about;
$('#intro-h').textContent=D.introTitle;$('#intro-p').textContent=D.intro;
$('#count').textContent=`${total} photographs in ${D.chapters.length} chapters`;
$('#rv').style.setProperty('--hero',`url("${I[D.hero].src}")`);$('#rv').setAttribute('aria-label',I[D.hero].alt);
$('#me').src=I[D.me].src;
$('#nav').innerHTML=D.chapters.map(c=>`<a href="#${c.id}">${c.name}</a>`).join('');
$('#fnav').innerHTML=$('#nav').innerHTML;
$('#toc').innerHTML=D.chapters.map(c=>`<a href="#${c.id}"><span>${c.name}</span><span>${c.photos.length} photographs</span></a>`).join('');
$('#main').innerHTML=D.chapters.map(c=>{
 const cards=c.photos.map((id,k)=>{const m=I[id];all.push({src:m.src,alt:m.alt});
  return `<button class="card" data-i="${all.length-1}" data-r="${((k*37)%7-3)*.8}" data-x="${((k*53)%9-4)*1.2}" style="aspect-ratio:${m.w}/${m.h}" aria-label="Open photo: ${m.alt}"><img src="${m.src}" width="${m.w}" height="${m.h}" alt="${m.alt}" loading="lazy"></button>`}).join('');
 return `<section class="chap" id="${c.id}" data-t="${c.id}" data-n="${c.name}" style="--n:${c.photos.length}"><div class="stick"><div class="chap-h"><h2>${c.name}</h2><p>${c.line}</p><div class="prog"><span class="cnt">1 / ${c.photos.length}</span><i class="bar"></i></div></div><div class="deck">${cards}</div></div></section>`}).join('');

/* chapter title entrance */
const hio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');hio.unobserve(e.target)}}),{threshold:.3});
$$('.chap-h').forEach(h=>hio.observe(h));
/* photos arrive one by one while the chapter is pinned */
const chaps=$$('.chap').map(el=>({el,cards:[...el.querySelectorAll('.card')],cnt:el.querySelector('.cnt'),bar:el.querySelector('.bar')}));
function chapters(){const vh=innerHeight;chaps.forEach(C=>{const r=C.el.getBoundingClientRect();if(r.bottom<-50||r.top>vh+50)return;
 const p=cl(-r.top/(r.height-vh)),n=C.cards.length,seg=.92/n,E=C.cards.map((_,i)=>ss(cl((p-.02-i*seg)/(seg*.7))));let cur=0;
 C.cards.forEach((b,i)=>{let d=0;for(let j=i+1;j<n;j++)d+=E[j];d=Math.min(d,3);const e=E[i];
  b.style.opacity=e;b.style.setProperty('--d',(.16*d).toFixed(2));
  b.style.transform=`translate(-50%,-50%) translate(${(b.dataset.x*e).toFixed(2)}%,${((1-e)*24).toFixed(2)}vh) rotate(${(b.dataset.r*e+(1-e)*5).toFixed(2)}deg) scale(${((.93+.07*e)*(1-.03*d)).toFixed(3)})`;
  if(e>.5)cur=i});
 C.cards.forEach((b,i)=>b.style.pointerEvents=i===cur?'auto':'none');
 C.cnt.textContent=`${cur+1} / ${n}`;C.bar.style.setProperty('--p',(p*100).toFixed(1)+'%')})}

/* reveal, theme and nav state */
function theme(el){const t=T[el.dataset.t],r=document.documentElement.style;
 if(t){r.setProperty('--bg',t[0]);r.setProperty('--fg',t[1]);r.setProperty('--sun',t[2])}
 if(el.dataset.n)$('#lbl').textContent=el.dataset.n;
 $$('#nav a').forEach(a=>a.toggleAttribute('aria-current',a.getAttribute('href')==='#'+el.id))}
const tio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)theme(e.target)}),{rootMargin:'-50% 0px -50% 0px'});
$$('[data-t]').forEach(s=>tio.observe(s));

/* opening: fit the selfie to any screen so the phone lens stays in view */
const open=$('#top'),stage=$('#stage'),sel=$('#sel'),sw=$('#sw'),rv=$('#rv'),rvi=$('#rvi'),st=$('#st'),cue=$('#cue'),ring=$('#ring'),me=$('#me'),sun=$('#sun'),lbl=$('#lbl');
let lx=0,ly=0,maxR=0;
function fit(){
 const W=sel.clientWidth,H=sel.clientHeight,m=I[D.me],s=Math.max(W/m.w,H/m.h),w=m.w*s,h=m.h*s,land=W>H;
 const l=cl(W*(land?.66:.58)-LENS[0]*w,W-w,0),t=cl(H*(land?.42:.36)-LENS[1]*h,H-h,0);
 me.style.cssText=`width:${w}px;height:${h}px;left:${l}px;top:${t}px`;
 lx=l+LENS[0]*w;ly=t+LENS[1]*h;maxR=Math.hypot(Math.max(lx,W-lx),Math.max(ly,H-ly))+4;
 sw.style.transformOrigin=`${lx}px ${ly}px`;
 ring.style.left=lx+'px';ring.style.top=ly+'px';ring.style.width=ring.style.height=Math.max(34,s*80)+'px'}

/* scroll: lens opens into the first photo, sun path, photo parallax */
let tick=false;
function frame(){
 tick=false;const vh=innerHeight,vw=innerWidth,max=document.documentElement.scrollHeight-vh,sp=max>0?Math.min(scrollY/max,1):0;
 const y=60-45*Math.sin(sp*Math.PI*.85),x=78-sp*52;
 sun.style.transform=`translate(${x*vw/100-sun.offsetWidth/2}px,${y*vh/100-sun.offsetHeight/2}px)`;
 if(rm)return;
 const span=open.offsetHeight-stage.clientHeight,p=span>0?cl(scrollY/span):1;
 if(scrollY<open.offsetHeight)lbl.textContent=p>.55?'Portfolio':'Behind the camera';
 sw.style.transform=`scale(${1+1.4*ss(cl(p/.85))})`;
 rv.style.clipPath=`circle(${(maxR*ss(cl((p-.12)/.75))).toFixed(1)}px at ${lx}px ${ly}px)`;
 st.style.opacity=1-cl(p/.22);cue.style.opacity=1-cl(p/.12);ring.style.opacity=1-cl(p/.3);rvi.style.opacity=cl((p-.72)/.22);
 chapters()}
function req(){if(!tick){tick=true;requestAnimationFrame(frame)}}
function relayout(){fit();req()}
addEventListener('scroll',req,{passive:true});addEventListener('resize',relayout);addEventListener('orientationchange',relayout);
me.addEventListener('load',relayout);fit();frame();

/* full-screen viewer */
const lb=$('#lb'),li=lb.querySelector('img');let cur=0;
function show(i){cur=(i+all.length)%all.length;li.src=all[cur].src;li.alt=all[cur].alt;$('#ct').textContent=`${cur+1} / ${all.length}`;$('#cap').textContent=all[cur].alt}
$('#main').addEventListener('click',e=>{const b=e.target.closest('button[data-i]');if(b){show(+b.dataset.i);lb.showModal()}});
lb.querySelector('.x').onclick=()=>lb.close();
lb.querySelector('.pv').onclick=()=>show(cur-1);lb.querySelector('.nx').onclick=()=>show(cur+1);
lb.addEventListener('click',e=>{if(e.target===lb)lb.close()});
lb.addEventListener('keydown',e=>{if(e.key==='ArrowRight')show(cur+1);if(e.key==='ArrowLeft')show(cur-1)});
