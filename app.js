(()=>{'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)], C=window.CONTROL_EARTH;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let motionPaused=reduced.matches, logoTime=0, logoPlaying=!reduced.matches, last=0, revealPlaying=false,revealTime=0,scene=0,mode='compare',heroVisible=true;
const A=n=>'assets/'+n+'.webp';
const scenes=C?.scenes||[];
// Local 1024-square video: one 24-second rotation; the palm is a fixed layer.
$$('[data-logo]').forEach(el=>{el.innerHTML='<video class="logo-video" width="1024" height="1024" muted loop playsinline preload="metadata" poster="assets/logo-motion/poster.webp?v=5" aria-label="ControlEarth: a rotating illustrated globe transforms semantic labels into natural terrain above a stationary palm"><source src="assets/logo-motion/controlearth-logo-1024.mp4?v=5" type="video/mp4"><img src="assets/logo-motion/poster.webp?v=5" alt="ControlEarth illustrated globe above a stationary palm"></video>';});
const logoVideos=$$('.logo-video');
logoVideos.forEach(v=>{v.muted=true;v.defaultMuted=true;});
function syncLogoPlayback(){
  const play=logoPlaying&&!document.hidden&&heroVisible;
  logoVideos.forEach(v=>{if(play){v.play().catch(()=>{});}else v.pause();});
}
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
if($('.hero'))new IntersectionObserver(es=>{heroVisible=es[0].isIntersecting;document.body.classList.toggle('motion-paused',!heroVisible||motionPaused||document.hidden);syncLogoPlayback();}).observe($('.hero'));
const revealSection=$('#generation');if(revealSection)new IntersectionObserver(es=>{if(!es[0].isIntersecting){revealPlaying=false;updatePlay();}}).observe(revealSection);
function tick(now){const dt=last?Math.min((now-last)/1000,.05):0;last=now;if(!document.hidden){renderLogo();if(revealPlaying){revealTime+=dt;const t=revealTime;const v=t<1.5?100:t<4.5?100-(t-1.5)/3*100:t<6.5?0:(t-6.5)/1.5*100;setDivider(v);if(t>=8){revealPlaying=false;setDivider(50);updatePlay();}}}requestAnimationFrame(tick);}requestAnimationFrame(tick);renderLogo();
if(!C||!$('#paper-title'))return;
$('#paper-title').textContent=C.title;
C.authors.forEach(name=>{const e=document.createElement('span');e.className='author';e.textContent=name;if(name==='Xue Yang'){const s=document.createElement('span');s.className='corresponding';s.textContent='†';e.append(s);}$('#authors').append(e);});
const note=document.createElement('div');note.className='fine';note.textContent='† Corresponding author';$('#authors').append(note);
const icons={Paper:'M5 2h9l5 5v15H5z M14 2v6h5 M8 12h8 M8 16h8',Code:'M8 6l-6 6 6 6 M16 6l6 6-6 6 M14 3l-4 18',Dataset:'M3 5c0-4 18-4 18 0s-18 4-18 0v14c0 4 18 4 18 0V5 M3 12c0 4 18 4 18 0',Model:'M12 2l10 5v10l-10 5L2 17V7z M2 7l10 5 10-5 M12 12v10'};
function resource(name){const el=document.createElement(C.resources[name]?'a':'button');el.className='resource';el.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${icons[name]}"/></svg><span>${name}</span>`;if(C.resources[name]){el.href=C.resources[name];el.rel='noopener';}else el.addEventListener('click',()=>{$('#release-title').textContent=name+' · Release pending';$('#release-dialog').showModal();});return el;}
['Paper','Code','Dataset'].forEach(x=>$('#paper-buttons').append(resource(x)));Object.keys(C.resources).forEach(x=>$('#all-resources').append(resource(x)));
const film=$('#bottom-film');if(film){const track=document.createElement('div');track.className='film-track';for(let group=0;group<2;group++){const strip=document.createElement('div');strip.className='film-group';for(let i=0;i<13;i++){const im=document.createElement('img');im.src=A('film-'+String(i).padStart(2,'0'));im.alt='';im.width=320;im.height=320;im.decoding='async';strip.append(im);}track.append(strip);}film.append(track);}
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
