(()=>{'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)], C=window.CONTROL_EARTH;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const homeHero=$('.hero .explore')?.closest('.hero');
const phonePage=matchMedia('(max-width: 767px)').matches&&!!homeHero;
let motionPaused=reduced.matches, logoTime=0, logoPlaying=!reduced.matches, last=0, revealPlaying=false,revealTime=0,scene=0,mode='compare',heroVisible=true;
const A=n=>'assets/'+n+'.webp';
const scenes=C?.scenes||[];
// The home hero starts in HTML. The standalone preview keeps the original master.
$$('[data-logo]').forEach(el=>{if(!el.querySelector('video'))el.innerHTML='<video class="logo-video" width="1024" height="1024" muted loop playsinline preload="metadata" src="assets/logo-motion/controlearth-logo-1024.mp4?v=5" poster="assets/logo-motion/poster.webp?v=5" aria-label="ControlEarth animated logo"></video>';});
const logoVideos=$$('.logo-video');
const resumeAt=new WeakMap();
let filmHasPriority=false,jumpPending=false;
let initialAnchor=$('.hero .explore')&&location.hash!=='#top'&&document.getElementById(location.hash.slice(1));
if(initialAnchor){
  heroVisible=false;
  // Browsers may briefly report the top visible before restoring the fragment.
  const arrival=new IntersectionObserver(([e])=>{if(e.isIntersecting)unlock();});
  const events=new AbortController();
  function unlock(){arrival.disconnect();events.abort();initialAnchor=null;}
  arrival.observe(initialAnchor);
  for(const type of ['hashchange','wheel','touchstart','keydown'])window.addEventListener(type,unlock,{signal:events.signal,passive:true});
}
logoVideos.forEach(v=>{v.muted=true;v.defaultMuted=true;v.addEventListener('loadedmetadata',()=>{
  const pos=resumeAt.get(v);if(pos>0&&Number.isFinite(v.duration))v.currentTime=Math.min(pos,v.duration-.04);
  resumeAt.delete(v);
});});
function syncLogoPlayback(){
  const play=logoPlaying&&!document.hidden&&heroVisible&&!filmHasPriority;
  logoVideos.forEach(v=>{
    if(play){
      if(!v.hasAttribute('src'))v.src=phonePage?v.dataset.mobileSrc:v.dataset.desktopSrc;
      if(v.paused)v.play().catch(()=>{});
    }else{
      v.pause();
      if(homeHero&&(!heroVisible||filmHasPriority)&&v.hasAttribute('src')){
        const b=v.buffered,complete=b.length===1&&b.start(0)<.08&&b.end(0)>=v.duration-.08;
        if(!complete){if(v.currentTime>0)resumeAt.set(v,v.currentTime);v.removeAttribute('src');v.load();}
      }
    }
  });
}
function prioritizeFilm(){if(!filmHasPriority){filmHasPriority=true;syncLogoPlayback();}}
function renderLogo(){const t=logoVideos[0]?.currentTime||0;const seek=$('#logo-seek');if(seek)seek.value=t;const time=$('#logo-time');if(time)time.textContent=t.toFixed(1)+' / 24.0 s';}
function resetLogo(){logoVideos.forEach(v=>{v.currentTime=0;});renderLogo();}
function pauseMotion(value){motionPaused=value;logoPlaying=!value;document.body.classList.toggle('motion-paused',value);const b=$('#hero-pause');if(b){b.textContent=value?'Resume motion':'Pause motion';b.setAttribute('aria-pressed',String(value));}syncLogoPlayback();}
pauseMotion(motionPaused);
$('#hero-pause')?.addEventListener('click',()=>pauseMotion(!motionPaused));
$('#logo-play')?.addEventListener('click',()=>{pauseMotion(logoPlaying);$('#logo-play').textContent=logoPlaying?'Pause':'Play';});
$('#logo-replay')?.addEventListener('click',()=>{resetLogo();pauseMotion(false);$('#logo-play').textContent='Pause';});
$('#logo-seek')?.addEventListener('input',e=>{pauseMotion(true);logoVideos.forEach(v=>{v.currentTime=+e.target.value;});$('#logo-play').textContent='Play';renderLogo();});
document.addEventListener('visibilitychange',()=>{last=0;document.body.classList.toggle('motion-paused',document.hidden||motionPaused||!heroVisible);syncLogoPlayback();});
reduced.addEventListener('change',e=>{pauseMotion(e.matches);if(e.matches)revealPlaying=false;});
if(homeHero)new IntersectionObserver(([entry])=>{const was=heroVisible;heroVisible=entry.isIntersecting&&!initialAnchor;if(heroVisible&&!was&&!jumpPending)filmHasPriority=false;document.body.classList.toggle('motion-paused',!heroVisible||motionPaused||document.hidden);syncLogoPlayback();}).observe(homeHero);
const revealSection=$('#generation');if(revealSection)new IntersectionObserver(es=>{if(!es[0].isIntersecting){revealPlaying=false;updatePlay();}}).observe(revealSection);
function tick(now){const dt=last?Math.min((now-last)/1000,.05):0;last=now;if(!document.hidden){renderLogo();if(revealPlaying){revealTime+=dt;const t=revealTime;const v=t<1.5?100:t<4.5?100-(t-1.5)/3*100:t<6.5?0:(t-6.5)/1.5*100;setDivider(v);if(t>=8){revealPlaying=false;setDivider(50);updatePlay();}}}requestAnimationFrame(tick);}requestAnimationFrame(tick);renderLogo();
if(!C||!$('#paper-title'))return;
$('#paper-title').textContent=C.title;
[C.authors.slice(0,8),C.authors.slice(8)].forEach((names,row)=>{
  const line=document.createElement('div');line.className='author-line';
  names.forEach((name,i)=>{
    const e=document.createElement('span');e.className='author';e.textContent=name;
    if(name==='Xue Yang'){const s=document.createElement('sup');s.className='corresponding';s.textContent='†';e.append(s);}
    if(!row||i<names.length-1)e.append(',');
    line.append(e,document.createTextNode(' '));
  });
  $('#authors').append(line);
});
const note=document.createElement('div');note.className='fine';note.textContent='† Corresponding author';$('#authors').append(note);
const filmPlayer=$('#demo-video');
if(filmPlayer){
  let visible=false, manualPause=false, autoPausing=false, requested=false;
  const saveData=!!navigator.connection?.saveData;
  let tried=false,startPending=false,jumpTimer=0,statusTimer=0,sourceChosen=false;
  let desktopIntent=location.hash==='#demonstration';
  const stage=$('#film-stage'),playButton=$('#film-play'),seek=$('#film-seek'),clock=$('#film-clock'),full=$('#film-full');
  const status=$('#film-status'),connection=navigator.connection;
  function useLightFilm(){
    if(saveData||['slow-2g','2g'].includes(connection?.effectiveType))return true;
    if(!connection||(connection.effectiveType!=='3g'&&!(connection.downlink>0&&connection.downlink<3.5)))return false;
    // An OS estimate can be stale (including on fast Wi-Fi). Let two recent
    // uncached transfers from this origin over 6 Mbps overrule a pessimistic hint.
    const now=performance.now();
    const fast=performance.getEntriesByType('resource').filter(e=>e.responseEnd>=now-15000
      &&e.name.startsWith(location.origin+'/')&&e.transferSize>=16384&&e.responseEnd>e.responseStart
      &&e.transferSize*.008/Math.max(1,e.responseEnd-e.responseStart)>=6);
    return location.protocol!=='file:'&&fast.length<2;
  }
  function prepare(){
    prioritizeFilm();
    if(!sourceChosen){
      sourceChosen=true;
      // HD averages 2.72 Mbps before peaks. Use the existing watermarked 720p
      // encode on known constrained links; keep the desktop HD file otherwise.
      if(!phonePage&&useLightFilm())filmPlayer.src=filmPlayer.querySelector('source').src;
    }
    if(filmPlayer.preload!=='auto')filmPlayer.preload='auto';
  }
  function hint(message=''){
    clearTimeout(statusTimer);status.hidden=!message;status.textContent=message;
  }
  function loading(){if(!statusTimer&&status.hidden){statusTimer=setTimeout(()=>{statusTimer=0;if(!filmPlayer.paused&&filmPlayer.readyState<3)hint('Loading film…');},400);}}
  function clearHint(){hint();statusTimer=0;}
  function playNow(){
    prepare();if(startPending||!filmPlayer.paused)return;
    tried=true;startPending=true;clearHint();loading();
    filmPlayer.play().then(()=>{startPending=false;},err=>{
      startPending=false;
      if(err.name==='AbortError')return;
      manualPause=true;hint(err.name==='NotAllowedError'?'Press Play to start.':'Could not start the film. Press Play to retry.');syncControls();
    });
  }
  const time=t=>Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0');
  function syncControls(){
    const t=filmPlayer.currentTime,d=Number.isFinite(filmPlayer.duration)?filmPlayer.duration:30;
    seek.max=d;seek.value=t;seek.setAttribute('aria-valuetext',time(t)+' of '+time(d));
    clock.textContent=time(t)+' / '+time(d);playButton.textContent=filmPlayer.paused?'Play':'Pause';
  }
  function toggleFilm(){
    if(filmPlayer.paused){
      const box=filmPlayer.getBoundingClientRect();
      if(Math.min(innerHeight,box.bottom)-Math.max(0,box.top)<.22*Math.min(innerHeight,box.height)){
        stage.scrollIntoView({behavior:'instant',block:'center'});
      }
      if(filmPlayer.error)filmPlayer.load();
      desktopIntent=true;requested=true;manualPause=false;playNow();
    }
    else {manualPause=true;filmPlayer.pause();}
  }
  playButton.addEventListener('click',toggleFilm);
  filmPlayer.addEventListener('click',toggleFilm);
  filmPlayer.addEventListener('contextmenu',event=>event.preventDefault()); // Only the film surface, not the page.
  seek.addEventListener('input',()=>{if(filmPlayer.readyState>=1)filmPlayer.currentTime=Number(seek.value);});
  ['loadedmetadata','play','pause','timeupdate','seeked'].forEach(e=>filmPlayer.addEventListener(e,syncControls));
  full.hidden=!(document.fullscreenEnabled&&stage.requestFullscreen)&&!filmPlayer.webkitEnterFullscreen;
  full.addEventListener('click',()=>{
    if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});
    else if(document.fullscreenEnabled&&stage.requestFullscreen)stage.requestFullscreen().catch(()=>{});
    else if(filmPlayer.webkitEnterFullscreen)filmPlayer.webkitEnterFullscreen();
  });
  document.addEventListener('fullscreenchange',()=>{full.textContent=document.fullscreenElement===stage?'Exit full screen':'Full screen';});
  filmPlayer.controls=false;$('#film-controls').hidden=false;syncControls();
  function stopFilm(){if(!filmPlayer.paused){autoPausing=true;filmPlayer.pause();}}
  function updateFilm(){
    if((!visible&&!jumpPending)||(!phonePage&&!desktopIntent&&!jumpPending)||document.hidden){stopFilm();clearHint();return;}
    if(!manualPause&&(requested||(!reduced.matches&&!saveData)))playNow();
  }
  filmPlayer.addEventListener('pause',()=>{
    if(!autoPausing&&visible&&!document.hidden&&!filmPlayer.ended)manualPause=true;
    autoPausing=false;
  });
  filmPlayer.addEventListener('play',()=>{
    manualPause=false;
    if(reduced.matches||saveData)requested=true;
    if(document.hidden)stopFilm();
  });
  filmPlayer.addEventListener('waiting',loading);
  filmPlayer.addEventListener('playing',clearHint);
  filmPlayer.addEventListener('pause',clearHint);
  filmPlayer.addEventListener('error',()=>hint('Could not load the film. Press Play to retry.'));
  $('.hero .explore').addEventListener('click',()=>{
    desktopIntent=true;requested=true;manualPause=false;jumpPending=true;
    // Start inside the click, before smooth scrolling. Do not let an old
    // offscreen observer entry immediately pause this explicit request.
    clearTimeout(jumpTimer);jumpTimer=setTimeout(()=>{jumpPending=false;updateFilm();checkApproach();},1800);
    playNow();
  });
  const logo=homeHero.querySelector('.logo-video');
  function checkApproach(){
    if(document.hidden)return;
    const box=filmPlayer.getBoundingClientRect(),g=logo.getBoundingClientRect();
    const hadIntent=desktopIntent;
    if(!jumpPending){if(scrollY>12)desktopIntent=true;else if(scrollY<4&&!document.fullscreenElement)desktopIntent=false;}
    if(!phonePage&&visible&&hadIntent!==desktopIntent)updateFilm();
    if(!jumpPending&&filmHasPriority&&(box.top>=innerHeight+280||scrollY<4)&&g.bottom>0&&g.top<innerHeight){
      if(!tried){filmPlayer.preload='none';filmPlayer.load();}
      filmHasPriority=false;syncLogoPlayback();
    }
    // On desktops, warm up only on a genuine approach after leaving the logo;
    // never request the film merely because a tall first viewport is near it.
    const gap=box.top-innerHeight;
    const approaching=(g.bottom<=0&&gap<=Math.min(600,innerHeight*.65))||(gap<=220&&g.bottom<=innerHeight*.4);
    if(!phonePage&&!filmHasPriority&&!reduced.matches&&!saveData&&!manualPause&&desktopIntent
      &&scrollY>12&&box.top>0&&approaching)prepare();
  }
  let approachFrame=0;
  addEventListener('scroll',()=>{if(!approachFrame)approachFrame=requestAnimationFrame(()=>{approachFrame=0;checkApproach();});},{passive:true});
  if('IntersectionObserver' in window){
    if(phonePage){const warmup=new IntersectionObserver(([entry])=>{
      if(entry.isIntersecting&&!(heroVisible&&entry.boundingClientRect.top>=innerHeight)){if(!saveData&&!reduced.matches&&filmPlayer.preload==='none')filmPlayer.preload='metadata';warmup.disconnect();}
    },{rootMargin:'400px 0px'});warmup.observe(filmPlayer);}
    new IntersectionObserver(([entry])=>{
      if(phonePage){if(entry.intersectionRatio>=.22)visible=true;else if(entry.intersectionRatio<=.05)visible=false;}
      else visible=entry.isIntersecting&&entry.intersectionRect.height>=1;
      if(visible){jumpPending=false;clearTimeout(jumpTimer);}
      updateFilm();
    },{threshold:phonePage?[0,.05,.22]:[0,.002]}).observe(filmPlayer);
  }
  document.addEventListener('visibilitychange',updateFilm);
  reduced.addEventListener('change',()=>{if(reduced.matches){requested=false;stopFilm();}else updateFilm();});
}
const icons={Paper:'M5 2h9l5 5v15H5z M14 2v6h5 M8 12h8 M8 16h8',Code:'M8 6l-6 6 6 6 M16 6l6 6-6 6 M14 3l-4 18',Dataset:'M3 5c0-4 18-4 18 0s-18 4-18 0v14c0 4 18 4 18 0V5 M3 12c0 4 18 4 18 0',Model:'M12 2l10 5v10l-10 5L2 17V7z M2 7l10 5 10-5 M12 12v10'};
function resource(name){const el=document.createElement(C.resources[name]?'a':'button');el.className='resource';el.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${icons[name]}"/></svg><span>${name}</span>`;if(C.resources[name]){el.href=C.resources[name];el.rel='noopener';}else el.addEventListener('click',()=>{$('#release-title').textContent=name+' · Release pending';$('#release-dialog').showModal();});return el;}
['Paper','Code','Dataset'].forEach(x=>$('#paper-buttons').append(resource(x)));Object.keys(C.resources).forEach(x=>$('#all-resources').append(resource(x)));
const film=$('#bottom-film');if(film){
  const track=document.createElement('div');track.className='film-track';
  // With a moving strip only the visible thumbnails and the next ones need the link now.
  const nearby=phonePage&&'IntersectionObserver' in window?new IntersectionObserver(entries=>{
    for(const e of entries)if(e.isIntersecting){e.target.src=e.target.dataset.thumb;nearby.unobserve(e.target);}
  },{root:film,rootMargin:'0px 110px'}):null;
  for(let group=0;group<2;group++){
    const strip=document.createElement('div');strip.className='film-group';
    for(let i=0;i<13;i++){
      const im=document.createElement('img'),url=A('film-'+String(i).padStart(2,'0'));
      im.alt='';im.width=320;im.height=320;im.decoding='async';
      if(nearby){im.fetchPriority='low';im.dataset.thumb=url;nearby.observe(im);}else im.src=url;
      strip.append(im);
    }
    track.append(strip);
  }
  film.append(track);
}
function tabs(container,items,fn){items.forEach((name,i)=>{const b=document.createElement('button');b.textContent=name;b.setAttribute('role','tab');b.setAttribute('aria-selected',String(i===0));b.tabIndex=i===0?0:-1;b.addEventListener('click',()=>{[...container.children].forEach(x=>{x.setAttribute('aria-selected',String(x===b));x.tabIndex=x===b?0:-1;});fn(i);});b.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const all=[...container.children];let next=e.key==='Home'?0:e.key==='End'?all.length-1:(i+(e.key==='ArrowRight'?1:-1)+all.length)%all.length;all[next].click();all[next].focus();}});container.append(b);});}
tabs($('#scene-tabs'),scenes.map(s=>s.name),i=>{scene=i;revealPlaying=false;updatePlay();setDivider(50);renderScene();});
let sceneLoad=0;
function renderScene(){const s=scenes[scene],type=mode==='real'?'real':'generated',ticket=++sceneLoad;
 const g=$('#generated'),l=$('#layout'),stage=$('#comparison');stage.setAttribute('aria-busy','true');
 g.src=A('scene-'+s.key+'-'+type);l.src=A('scene-'+s.key+'-layout');
 g.alt=s.name+' '+(mode==='real'?'real reference':'ControlEarth generated image');l.alt=s.name+' semantic layout';
 const compare=mode==='compare';$('#layout-overlay').hidden=!compare&&mode!=='layout';$('#divider').hidden=!compare;
 $('#compare-range').disabled=!compare;$('#left-label').hidden=!compare;$('#right-label').textContent=mode==='real'?'REAL REFERENCE':mode==='layout'?'LAYOUT':'GENERATED';
 $('#scene-caption').textContent='Paired 4K source · '+s.source;
 if(mode==='layout')$('#layout-overlay').style.clipPath='none';else setDivider(+$('#compare-range').value);
 Promise.all([g.decode(),l.decode()]).then(()=>{if(ticket===sceneLoad)stage.setAttribute('aria-busy','false');}).catch(()=>{if(ticket===sceneLoad)stage.setAttribute('aria-busy','false');});
}
function setDivider(v){v=Math.max(0,Math.min(100,v));$('#compare-range').value=v;$('#layout-overlay').style.clipPath=`inset(0 ${100-v}% 0 0)`;$('#divider').style.left=v+'%';$('#divider-handle').setAttribute('aria-valuenow',String(Math.round(v)));}
function updatePlay(){$('#reveal-play').textContent=revealPlaying?'Pause reveal':'Play reveal';}
$$('[data-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;revealPlaying=false;updatePlay();$$('[data-mode]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderScene();}));
$('#compare-range').addEventListener('input',e=>{revealPlaying=false;updatePlay();setDivider(+e.target.value);});
const handle=$('#divider-handle'),comparison=$('#comparison');let dividerDrag=null;
handle.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();revealPlaying=false;updatePlay();const r=comparison.getBoundingClientRect();dividerDrag={id:e.pointerId,offset:e.clientX-r.left-r.width*(+$('#compare-range').value/100)};handle.setPointerCapture(e.pointerId);});
handle.addEventListener('pointermove',e=>{if(!dividerDrag||dividerDrag.id!==e.pointerId)return;const r=comparison.getBoundingClientRect();setDivider((e.clientX-r.left-dividerDrag.offset)/r.width*100);});
for(const event of ['pointerup','pointercancel','lostpointercapture'])handle.addEventListener(event,()=>{dividerDrag=null;});
handle.addEventListener('keydown',e=>{let v=+$('#compare-range').value;const step=e.shiftKey?10:2;if(e.key==='ArrowLeft')v-=step;else if(e.key==='ArrowRight')v+=step;else if(e.key==='Home')v=0;else if(e.key==='End')v=100;else return;e.preventDefault();revealPlaying=false;updatePlay();setDivider(v);});

function startReveal(reset){if(mode!=='compare')$('[data-mode="compare"]').click();if(reset||revealTime>=8)revealTime=0;revealPlaying=reset?true:!revealPlaying;updatePlay();}
$('#reveal-play').addEventListener('click',()=>startReveal(false));$('#reveal-reset').addEventListener('click',()=>startReveal(true));const firstSceneObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){renderScene();firstSceneObserver.disconnect();}},{rootMargin:'350px'});firstSceneObserver.observe($('#generation'));
// Exact normalized source coordinates. Fixed-scale detail inspection, without zoom controls.
const detailScenes=C.details;let di=0,ri=0,panX=0,panY=0,drag=null;
tabs($('#detail-tabs'),detailScenes.map(x=>x.name),i=>{di=i;ri=0;renderDetail();});
function renderDetail(){const d=detailScenes[di];$('#detail-map').src=A('detail-'+d.key+'-overview');$('#detail-crop').src=A('detail-'+d.key);$('#detail-map').alt=d.name+' complete generated scene';$('#detail-crop').alt=d.name+' selected region';
 $$('[data-roi]').forEach((b,i)=>{const r=d.regions[i];Object.assign(b.style,{left:r[0]*100+'%',top:r[1]*100+'%',width:r[2]*100+'%',height:r[3]*100+'%'});b.classList.toggle('active',i===ri);b.setAttribute('aria-pressed',String(i===ri));b.setAttribute('aria-label','Inspect '+d.name+' region '+(i+1));});
 $('#detail-location').textContent=d.name+' · Region '+(ri+1);$('#detail-caption').textContent='Native 4096 × 4096 · '+d.source+' · Drag to pan.';resetDetail();}
function applyDetail(){const r=detailScenes[di].regions[ri],w=$('#detail-window').clientWidth,scale=1/r[2];if(!w)return;const xmin=w-w*scale;
 const x=Math.max(xmin,Math.min(0,-r[0]*scale*w+panX)),y=Math.max(xmin,Math.min(0,-r[1]*scale*w+panY));
 panX=x+r[0]*scale*w;panY=y+r[1]*scale*w;
 $('#detail-crop').style.transformOrigin='0 0';$('#detail-crop').style.transform='translate('+x+'px,'+y+'px) scale('+scale+')';}
function resetDetail(){panX=panY=0;drag=null;applyDetail();}
$$('[data-roi]').forEach(b=>b.addEventListener('click',()=>{ri=+b.dataset.roi;renderDetail();}));
$('#detail-reset').addEventListener('click',resetDetail);const dw=$('#detail-window');dw.tabIndex=0;dw.setAttribute('aria-label','Selected image region. Drag or use arrow keys to pan; Home resets.');
dw.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();drag={id:e.pointerId,x:e.clientX,y:e.clientY,px:panX,py:panY};dw.setPointerCapture(e.pointerId);dw.classList.add('dragging');});
dw.addEventListener('pointermove',e=>{if(drag&&drag.id===e.pointerId){panX=drag.px+e.clientX-drag.x;panY=drag.py+e.clientY-drag.y;applyDetail();}});
for(const event of ['pointerup','pointercancel','lostpointercapture'])dw.addEventListener(event,()=>{drag=null;dw.classList.remove('dragging');});
dw.addEventListener('keydown',e=>{const step=dw.clientWidth*.08;if(e.key==='ArrowLeft')panX+=step;else if(e.key==='ArrowRight')panX-=step;else if(e.key==='ArrowUp')panY+=step;else if(e.key==='ArrowDown')panY-=step;else if(e.key==='Home'){resetDetail();e.preventDefault();return;}else return;e.preventDefault();applyDetail();});
new ResizeObserver(()=>{panX=panY=0;applyDetail();}).observe(dw);renderDetail();
scenes.forEach(s=>{const div=document.createElement('div');div.className='sample-pair';for(const type of ['real','layout']){const im=document.createElement('img');im.src=A('dataset-'+s.key+'-'+type);im.alt=s.name+' '+type+' reference';im.loading='lazy';im.width=420;im.height=420;im.className='zoomable';div.append(im);}$('#dataset-samples').append(div);});
const taskKeys=['segmentation','detection','classification','building','road','flood'];function renderTask(i){$('#task-title').textContent=C.tasks[i][0];$('#task-description').textContent=C.tasks[i][1];$('#task-image').src=A('task-'+taskKeys[i]);$('#task-image').alt=C.tasks[i][0]+' conditions and generated examples';}tabs($('#task-tabs'),C.tasks.map(x=>x[0]),renderTask);renderTask(0);
const heads=['Model','FID ↓','KID ↓','PSNR ↑','SSIM ↑','FSIM ↑','LPIPS ↓','DISTS ↓','CLIP-I ↑','mIoU ↑','TFR →1','DDR →1','SO-mIoU ↑'];const rows=window.GENERATION_RESULTS||[];const ranks=heads.map((_,j)=>{if(!j)return[];const vals=rows.map(r=>+r[j]).filter(Number.isFinite).map(v=>j===10||j===11?Math.abs(v-1):[1,2,6,7].includes(j)?v:-v);return[...new Set(vals)].sort((a,b)=>a-b).slice(0,2);});const hr=document.createElement('tr');heads.forEach(h=>{const th=document.createElement('th');th.scope='col';th.textContent=h;hr.append(th);});$('#results-table thead').append(hr);rows.forEach(r=>{const tr=document.createElement('tr');if(r[0].startsWith('ControlEarth'))tr.className='ours';r.forEach((v,j)=>{const td=document.createElement('td');td.textContent=v;if(j&&Number.isFinite(+v)){const score=j===10||j===11?Math.abs(+v-1):[1,2,6,7].includes(j)?+v:-v;if(Math.abs(score-ranks[j][0])<1e-9)td.className='best';else if(Math.abs(score-ranks[j][1])<1e-9)td.className='second';}tr.append(td);});$('#results-table tbody').append(tr);});
$('#citation').textContent=C.citation;$('#copy-citation').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(C.citation);$('#copy-status').textContent='Citation copied.';}catch{const s=getSelection(),r=document.createRange();r.selectNodeContents($('#citation'));s.removeAllRanges();s.addRange(r);$('#copy-status').textContent='Citation selected. Press Ctrl+C (or Command+C) to copy.';}});
$$('.zoomable').forEach(im=>{im.tabIndex=0;im.setAttribute('role','button');im.setAttribute('aria-label','Enlarge: '+im.alt);im.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();im.click();}});});
document.addEventListener('click',e=>{const im=e.target.closest('.zoomable');if(im){const box=$('#lightbox');box.querySelector('img').src=im.dataset.full||im.src;box.querySelector('img').alt=im.alt;box.querySelector('p').textContent=im.alt;box.showModal();}});$$('dialog').forEach(d=>{d.querySelector('.close').addEventListener('click',()=>d.close());d.querySelector('.dismiss')?.addEventListener('click',()=>d.close());d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});});
})();
