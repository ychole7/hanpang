/* ══════════════════════════════════════════
   낱글자 팡팡! — 스테이지 진입 오류(least 변수 선언 누락) 완벽 수정 버전
   ══════════════════════════════════════════ */

const SAVE_KEY='pangpop_save_v1';
function loadSave(){ try{ const raw=localStorage.getItem(SAVE_KEY); if(!raw) return null; const d=JSON.parse(raw); if(!d.free) d.free={stage:1,score:0,bestScore:0,bestStage:1}; if(!d.theme) d.theme={stage:1,score:0,bestScore:0,bestStage:1,levelStars:{}}; if(typeof d.coins!=='number') d.coins=0; if(typeof d.revives!=='number') d.revives=0; if(typeof d.totalStars!=='number') d.totalStars=0; if(!d.lives) d.lives={count:6,lastUpdate:Date.now()}; return d; }catch(e){ return null; } }
let SAVE = loadSave() || { free:{stage:1,score:0,bestScore:0,bestStage:1}, theme:{stage:1,score:0,bestScore:0,bestStage:1,levelStars:{}}, lastMode:'theme', coins:0, revives:0, totalStars:0, lives:{count:6,lastUpdate:Date.now()} };

if(typeof SAVE.vibeOn === 'undefined') SAVE.vibeOn = true;

const MAX_LIVES=6, LIFE_REGEN_MS=60000;
function computeLives(){ let s=SAVE.lives; if(!s){ s=SAVE.lives={count:MAX_LIVES,lastUpdate:Date.now()}; } if(s.count<MAX_LIVES){ const regen=Math.floor((Date.now()-s.lastUpdate)/LIFE_REGEN_MS); if(regen>0){ s.count=Math.min(MAX_LIVES, s.count+regen); s.lastUpdate+=regen*LIFE_REGEN_MS; if(s.count>=MAX_LIVES) s.lastUpdate=Date.now(); } }else{ s.lastUpdate=Date.now(); } return s; }
function secToNextLife(){ const s=computeLives(); return s.count>=MAX_LIVES ? 0 : Math.max(0, LIFE_REGEN_MS - (Date.now()-s.lastUpdate)) / 1000; }
function spendLife(){ const s=computeLives(); if(s.count<=0){ const sec=Math.ceil(secToNextLife()); show(`<h2>하트가 없어요 ❤️</h2><p>다음 하트까지 <b>${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}</b></p><p style="font-size:13px;opacity:.75;margin-top:6px">1분마다 하트가 하나씩 채워져요 (최대 ${MAX_LIVES}개)</p><button class="btn" id="livesOk">확인</button>`); document.getElementById('livesOk').onclick=()=>{ SFX.click(); hide(); }; return false; } s.count--; saveGame(true); return true; }
let _saveTimer=null; function saveGame(immediate){ const write=()=>{ try{ const slot=SAVE[G.mode]||(SAVE[G.mode]={stage:1,score:0,bestScore:0,bestStage:1}); slot.stage=G.stage; slot.score=G.score; slot.bestScore=Math.max(slot.bestScore||0, G.score); slot.bestStage=Math.max(slot.bestStage||1, G.stage); SAVE.lastMode=G.mode; localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); }catch(e){} }; if(immediate){ clearTimeout(_saveTimer); write(); } else{ clearTimeout(_saveTimer); _saveTimer=setTimeout(write,500); } }

const DICT_BY_CAT = {
  '과일': ['사과','포도','딸기','수박','참외','자두','바나나','오렌지','레몬','복숭아','체리','망고','멜론','키위','앵두','살구','자몽','석류','토마토','대추','모과','매실','앵도','귤','감','배','밤','파인애플','블루베리','무화과','한라봉','청포도','머루','다래'],
  '동물': ['사자','호랑이','코끼리','토끼','다람쥐','거북이','고양이','강아지','원숭이','기린','하마','얼룩말','여우','늑대','사슴','너구리','개구리','병아리','오리','돼지','판다','펭귄','악어','고래','두더지','고슴도치','치타','표범','물개','바다표범','부엉이','까치','참새','비둘기','수달','청설모','두루미'],
  '먹거리': ['김밥','라면','김치','만두','피자','치킨','우유','국수','초밥','카레','계란','감자','고구마','두부','도넛','사탕','과자','주스','떡볶이','케이크','빙수','호빵','비빔밥','불고기','갈비','냉면','짜장면','짬뽕','순대','어묵','호떡','붕어빵','식혜','미역국','된장국','유부초밥','주먹밥'],
  '탈것': ['자동차','기차','비행기','자전거','버스','택시','트럭','로켓','소방차','구급차','경찰차','지하철','헬기','요트','유모차','오토바이','포클레인','트랙터','케이블카','잠수함','여객선','우주선','열기구','썰매','기관차','전동차','화물차'],
  '자연': ['나무','바다','하늘','구름','바람','무지개','태양','호수','파도','번개','안개','이슬','모래','폭포','언덕','계곡','노을','새벽','폭우','서리','우박','고드름','들판','절벽','동굴','갯벌','습지','오아시스','메아리','아지랑이','물결','샛별']
};
const BONUS_WORDS = ['사과나무','바나나우유','포도나무','감나무','밤나무','대추나무','솔방울','도토리','다람쥐집','고양이집','비빔국수','볶음밥','김치찌개','된장찌개','고구마빵','바나나맛','딸기우유','초코우유','자동차길','소방관차'];
const GENERIC_WORDS = ['감기','안녕','사람','친구','생일','가족','학교','교실','책상','의자','창문','거울','지갑','열쇠','우산','신발','양말','모자','장갑','안경','시계','달력','편지','소포','병원','약국','은행','경찰','소방','공원','풍선','비누','수건','칫솔','치약','침대','이불','베개','냄비','접시','컵','그릇','전화','사진','영화','음악','노래','그림','숫자','하나','둘','셋','넷','다섯'];
const CATS = Object.keys(DICT_BY_CAT);
const MAX_STAGE = 100, MILESTONE_EVERY = 30, MAXW = 5;
const DICT = new Map();
for (const c of CATS) for (const w of DICT_BY_CAT[c]) if (w.length>=2) DICT.set(w,c);
for (const w of BONUS_WORDS) DICT.set(w,'보너스');
for (const w of GENERIC_WORDS) if (w.length>=2 && !DICT.has(w)) DICT.set(w,'생활');

const PALETTE = [
  ['#ffda44','#f9a400'], ['#69d845','#36a61d'], ['#45a1ff','#1f68e0'], ['#b852ff','#7b26e0'], ['#ff629c','#e02660'],
  ['#ff9436','#e0540d'], ['#42dbd8','#1da6a4'], ['#ff4242','#d61c1c'], ['#6042ff','#261cd6'], ['#b4ff42','#7ed61c']
];
function colByIdx(i){ return PALETTE[((i%10)+10)%10]; }
function colorOf(b){ if(b&&typeof b==='object'&&typeof b.col==='number') return colByIdx(b.col); return PALETTE[0]; }
function randCol(){ return Math.floor(Math.random()*10); }

let cv, ctx;
let W=0,H=0,R=0,ROWH=0,DPR=1, BX=0,BY=0,BW=0,BH=0;
const COLS=7;

function initCanvas() {
  cv = document.getElementById('cv');
  if(!cv) return false;
  ctx = cv.getContext('2d');
  return true;
}

function resize(){
  if(!cv && !initCanvas()) return;
  const gameArea = document.getElementById('gameArea');
  if(!gameArea) return;
  
  const box = gameArea.getBoundingClientRect();
  if(box.width === 0 || box.height === 0) return;
  
  DPR = Math.min(window.devicePixelRatio||1,2.5);
  W = box.width; H = box.height;
  cv.width = W * DPR; cv.height = H * DPR;
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
  ctx.setTransform(DPR,0,0,DPR,0,0);

  BX = W * 0.05; 
  BW = W * 0.90; 
  R = BW / (COLS * 2);
  
  const topUI = document.getElementById('topUI');
  const bottomUI = document.getElementById('bottomUI');
  
  const topH = topUI ? topUI.getBoundingClientRect().bottom : 140;
  BY = topH - 1; 
  
  const botTop = bottomUI ? bottomUI.getBoundingClientRect().top : H - 100;
  G.shooterY = botTop - (R * 3.9); 
  
  BH = G.shooterY - BY;
  ROWH = R * 1.72;
  G.maxRows = Math.max(6, Math.floor((BH - R*2) / ROWH) + 1);
  
  SPR.clear(); G.trajA=null;
}

let _rz; window.addEventListener('resize',()=>{ clearTimeout(_rz); _rz=setTimeout(resize,120); });
window.addEventListener('orientationchange',()=>{ clearTimeout(_rz); _rz=setTimeout(resize,120); });

const MAP_PATTERNS = {
  'basic': [ [1,1,1,1,1,1,1], [1,1,1,1,1,1] ],
  'wave': [ [1,1,0,0,1,1,1], [0,1,1,0,0,1], [1,0,0,1,1,1,0], [0,0,1,1,0,1] ],
  'heart': [ [0,1,1,0,1,1,0], [1,1,1,1,1,1], [0,1,1,1,1,1,0], [0,1,1,1,1,0], [0,0,1,1,1,0,0], [0,0,1,1,0,0] ],
  'pillars': [ [1,1,0,0,0,1,1], [1,1,0,0,1,1], [1,1,0,0,0,1,1], [1,1,0,0,1,1] ],
  'diamond': [ [0,0,0,1,0,0,0], [0,0,1,1,0,0], [0,0,1,1,1,0,0], [0,1,1,1,1,0], [0,0,1,1,1,0,0], [0,0,1,1,0,0] ]
};

const G={ grid:[],parity:0,stage:1,score:0,combo:0,started:false,mode:'theme',goal:'과일',pool:[],words:[],targets:[],done:{},cur:null,queue:[],fly:null,aim:null,dragging:false,toasts:[],waves:[],pops:[],shake:0,flash:0,shooterY:0,maxRows:10,dryShots:0, allowedMisses:5, swaps:3,hints:3,hintCells:null,bombs:2,rainbows:2,activeItem:null,wordsCompleted:0,freeGoal:8,locked:true,shots:0,trajA:null,trajPts:[],banner:null };
const PARTICLE_POOL=Array.from({length:200},()=>({active:false,x:0,y:0,vx:0,vy:0,life:0,col:'#000',r:0,shape:'circle',rot:0,vr:0}));
function getParticle(){ for(let p of PARTICLE_POOL) if(!p.active) return p; return null; }

const po=r=>(r+G.parity)&1, cellsIn=r=>po(r)===0?COLS:COLS-1, cx=(c,r)=>BX+R+c*2*R+(po(r)?R:0), cy=r=>BY+R+r*ROWH;
function nbrs(c,r){const o=po(r); return [[c-1,r],[c+1,r],[c-1+o,r-1],[c+o,r-1],[c-1+o,r+1],[c+o,r+1]];}
function at(c,r){ if(r<0||r>=G.grid.length||c<0||c>=cellsIn(r))return null; return G.grid[r][c]; }
const AXES=[ {fwd:(c,r)=>[c+1,r],back:(c,r)=>[c-1,r]}, {fwd:(c,r)=>[c+po(r),r+1],back:(c,r)=>[c-1+po(r),r-1]}, {fwd:(c,r)=>[c-1+po(r),r+1],back:(c,r)=>[c+po(r),r-1]} ];

function pick(a){return a[Math.floor(Math.random()*a.length)];}
let _fillCount={}; function resetFillCount(){ _fillCount={}; }

// ✨ 버그 수정: least 변수 대신 leastUsed 배열을 정상 참조하도록 수정 완료
function fillSyllable(c,r){ 
  const avoid=new Set(); 
  if(c>0 && G.grid[r] && G.grid[r][c-1]) avoid.add(G.grid[r][c-1].s); 
  if(r>0){ for(const [nc,nr] of nbrs(c,r)){ if(nr<r && G.grid[nr] && G.grid[nr][nc]) avoid.add(G.grid[nr][nc].s); } } 
  let candidates=G.pool.filter(s=>!avoid.has(s)); 
  if(!candidates.length) candidates=[...G.pool]; 
  let minUse=Infinity; 
  for(const s of candidates) minUse=Math.min(minUse,_fillCount[s]||0); 
  const leastUsed=candidates.filter(s=>(_fillCount[s]||0)<=minUse+1); 
  const chosen=pick(leastUsed.length?leastUsed:candidates); 
  _fillCount[chosen]=(_fillCount[chosen]||0)+1; 
  return chosen; 
}

function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

function buildStage(){
  G.waves=[]; G.pops=[]; G.shake=0; G.flash=0; PARTICLE_POOL.forEach(p=>p.active=false);
  if(G.mode==='free'){ buildFreeStage(); return; }
  
  const diffLevel = Math.min(100, G.stage);
  G.goal=CATS[(G.stage-1)%CATS.length];
  const nTarget = Math.min(6, 2 + Math.floor(diffLevel / 15));
  
  const short=shuffle(DICT_BY_CAT[G.goal].filter(w=>w.length===2)), long=shuffle(DICT_BY_CAT[G.goal].filter(w=>w.length>=3));
  let pickPool=[...short]; if(G.stage>=3) pickPool=[...short.slice(0,3),...long];
  G.targets=shuffle(pickPool).slice(0,nTarget);
  if(G.targets.length<nTarget) G.targets=[...G.targets,...shuffle(DICT_BY_CAT[G.goal]).slice(0,nTarget-G.targets.length)];
  G.done={}; G.targets.forEach(w=>G.done[w]=false);
  
  const main=shuffle(DICT_BY_CAT[G.goal]).slice(0,7), others=shuffle(CATS.filter(c=>c!==G.goal)).slice(0,2).flatMap(c=>shuffle(DICT_BY_CAT[c]).slice(0,3));
  G.words=[...new Set([...G.targets,...main,...others])];
  const syl=new Set(); for(const w of G.words) for(const ch of w) syl.add(ch); G.pool=[...syl];
  
  const rows = Math.min(G.maxRows, 3 + Math.floor(diffLevel / 20));
  G.allowedMisses = Math.max(2, 5 - Math.floor(diffLevel / 25));
  
  let availablePatterns = ['basic'];
  if(diffLevel > 5) availablePatterns.push('wave');
  if(diffLevel > 15) availablePatterns.push('pillars');
  if(diffLevel > 25) availablePatterns.push('heart');
  if(diffLevel > 40) availablePatterns.push('diamond');
  
  const patternKey = pick(availablePatterns);
  const pattern = MAP_PATTERNS[patternKey];
  
  G.parity=0; G.grid=[]; resetFillCount();
  for(let r=0;r<rows;r++){ 
    const row=[]; G.grid.push(row); const patRow = pattern[r % pattern.length];
    for(let c=0;c<cellsIn(r);c++) {
      if(patRow && patRow[c] === 1) row.push({s:fillSyllable(c,r),col:randCol()});
      else row.push(null);
    }
  }
  
  const seeds=shuffle(G.targets.filter(w=>w.length<=3));
  for(let i=0;i<Math.min(2,seeds.length);i++) plantWord(seeds[i],rows);
  plantWord(pick(main),rows);
  
  const all=[]; for(let r=0;r<G.grid.length;r++) for(let c=0;c<cellsIn(r);c++) if(at(c,r)) all.push([c,r]);
  shuffle(all); const nGold=1+Math.floor(Math.random()*2), nBomb=Math.random()<0.6?1:0; let idx=0;
  for(let i=0;i<nGold && idx<all.length;i++,idx++) G.grid[all[idx][1]][all[idx][0]].special='gold';
  for(let i=0;i<nBomb && idx<all.length;i++,idx++) G.grid[all[idx][1]][all[idx][0]].special='bomb';
  
  G.cur=newCur(); G.queue=[newCur(),newCur()];
  G.combo=0;G.dryShots=0;G.shots=0;G.hintCells=null;G.swaps=3;G.hints=3;G.bombs=2;G.rainbows=2;G.activeItem=null; syncUI();
}

function buildFreeStage(){
  G.waves=[]; G.pops=[]; G.shake=0; G.flash=0; PARTICLE_POOL.forEach(p=>p.active=false);
  G.goal='자유'; const cats=shuffle([...CATS]);
  G.words=cats.flatMap(c=>shuffle(DICT_BY_CAT[c]).slice(0,14));
  if(Math.random()<0.6){ const b=shuffle(BONUS_WORDS); G.words.push(...b.slice(0,3)); }
  G.words.push(...shuffle(GENERIC_WORDS).slice(0,16));
  const syl=new Set(); for(const w of G.words) for(const ch of w) syl.add(ch); G.pool=[...syl];
  G.targets=[]; G.done={}; G.wordsCompleted=0; G.freeGoal=6+Math.floor((G.stage-1)*1.5);
  const rows=Math.min(G.maxRows,4); G.parity=0; G.grid=[]; resetFillCount();
  G.allowedMisses = 4;
  for(let r=0;r<rows;r++){ const row=[]; G.grid.push(row); for(let c=0;c<cellsIn(r);c++) row.push({s:fillSyllable(c,r),col:randCol()}); }
  for(let i=0;i<3;i++) plantWord(pick(G.words.filter(w=>w.length<=3)),rows);
  
  const all=[]; for(let r=0;r<G.grid.length;r++) for(let c=0;c<cellsIn(r);c++) if(at(c,r)) all.push([c,r]);
  shuffle(all); const nGold=1+Math.floor(Math.random()*2), nBomb=Math.random()<0.6?1:0; let idx=0;
  for(let i=0;i<nGold && idx<all.length;i++,idx++) G.grid[all[idx][1]][all[idx][0]].special='gold';
  for(let i=0;i<nBomb && idx<all.length;i++,idx++) G.grid[all[idx][1]][all[idx][0]].special='bomb';
  
  G.cur=newCur(); G.queue=[newCur(),newCur()];
  G.combo=0;G.dryShots=0;G.shots=0;G.hintCells=null;G.swaps=3;G.hints=3;G.bombs=2;G.rainbows=2;G.activeItem=null; syncUI();
}

function plantWord(w,rows){
  for(let t=0;t<40;t++){
    const ax=AXES[Math.floor(Math.random()*3)]; let c=Math.floor(Math.random()*COLS),r=Math.floor(Math.random()*rows);
    if(!at(c,r))continue; const cells=[[c,r]]; let ok=true;
    for(let i=1;i<w.length;i++){ [c,r]=ax.fwd(c,r); if(!at(c,r)){ok=false;break;} cells.push([c,r]); }
    if(!ok)continue; cells.forEach(([cc,rr],i)=>{G.grid[rr][cc].s=w[i];});
    const gap=Math.floor(Math.random()*w.length); const alt=G.pool.filter(s=>s!==w[gap]);
    if(alt.length) G.grid[cells[gap][1]][cells[gap][0]].s=pick(alt); return;
  }
}

function lineOf(c0,r0,ax){
  const cells=[[c0,r0]]; let c=c0,r=r0;
  for(;;){[c,r]=ax.back(c,r); if(!at(c,r))break; cells.unshift([c,r]);}
  c=c0;r=r0; for(;;){[c,r]=ax.fwd(c,r); if(!at(c,r))break; cells.push([c,r]);}
  return cells;
}
function findWord(c0,r0,s){
  const cands=[];
  for(const ax of AXES){
    const cells=lineOf(c0,r0,ax), str=cells.map(([c,r])=>(c===c0&&r===r0)?s:at(c,r).s).join('');
    const idx=cells.findIndex(([c,r])=>c===c0&&r===r0);
    for(let len=Math.min(MAXW,str.length);len>=2;len--){
      for(let st=Math.max(0,idx-len+1);st<=Math.min(idx,str.length-len);st++){
        const w=str.substr(st,len);
        if(DICT.has(w)){ cands.push({word:w,cells:cells.slice(st,st+len)}); }
        else{ const rw=[...w].reverse().join(''); if(rw!==w && DICT.has(rw)) cands.push({word:rw,cells:cells.slice(st,st+len)}); }
      }
    }
  }
  if(!cands.length) return null;
  const targetHit=cands.filter(c=>c.word in G.done && !G.done[c.word]);
  if(targetHit.length){ targetHit.sort((a,b)=>b.word.length-a.word.length); return targetHit[0]; }
  cands.sort((a,b)=>b.word.length-a.word.length); return cands[0];
}
function openCells(){
  const out=[],seen=new Set();
  for(let r=0;r<G.grid.length;r++) for(let c=0;c<cellsIn(r);c++){
    if(!at(c,r))continue;
    for(const [nc,nr] of nbrs(c,r)){ if(nr<0||nr>=G.maxRows||nc<0||nc>=cellsIn(nr)||(nr<G.grid.length&&G.grid[nr][nc]))continue;
      const k=nc+','+nr; if(!seen.has(k)){ seen.add(k); out.push([nc,nr]); } }
  } return out;
}
function completionsFor(s){ const res=[]; for(const [c,r] of openCells()){ const w=findWord(c,r,s); if(w)res.push({c,r,...w}); } return res; }
let _recentSyl=[];
function newCur(){
  let chosen=null, pool2=[];
  if(Math.random()<0.78){
    const targetC=[], anyC=[];
    for(const s of G.pool){ const hit=completionsFor(s); if(!hit.length) continue; anyC.push(s); if(hit.some(h=>h.word in G.done && !G.done[h.word])) targetC.push(s); }
    pool2 = targetC.length ? (Math.random()<0.66 ? targetC : anyC) : anyC;
    const fresh=pool2.filter(s=>!_recentSyl.includes(s)); if(fresh.length) chosen=pick(fresh); else if(pool2.length) chosen=pick(pool2);
  }
  if(!chosen){ const f=G.pool.filter(s=>!_recentSyl.includes(s)); chosen=pick(f.length?f:G.pool); }
  _recentSyl.push(chosen); if(_recentSyl.length>3) _recentSyl.shift(); return {s:chosen, col:randCol()};
}

function shoot(angle){
  if(G.fly||G.locked)return; const sp=R*0.62, item=G.activeItem;
  if(item==='bomb') G.bombs--; if(item==='rainbow') G.rainbows--; G.activeItem=null;
  G.fly={x:W/2, y:G.shooterY, vx:Math.cos(angle)*sp, vy:Math.sin(angle)*sp, s:G.cur.s, col:G.cur.col, item};
  G.cur=G.queue.shift(); G.queue.push(newCur()); G.hintCells=null; G.trajA=null; G.shots++; syncUI();
}
function hitsBubble(x,y){
  for(let r=0;r<G.grid.length;r++) for(let c=0;c<cellsIn(r);c++){ if(!at(c,r))continue; const dx=x-cx(c,r),dy=y-cy(r); if(dx*dx+dy*dy<(R*1.82)*(R*1.82))return true; }
  return false;
}
function stepFly(){
  const f=G.fly; if(!f)return;
  for(let i=0;i<6;i++){
    f.x+=f.vx/6; f.y+=f.vy/6;
    if(f.y<BY+BH){ if(f.x<BX+R){f.x=BX+R;f.vx*=-1;} if(f.x>BX+BW-R){f.x=BX+BW-R;f.vx*=-1;} }
    
    if(Math.random()<0.5) {
      const p = getParticle();
      if(p) {
        p.active=true; p.x=f.x + (Math.random()-0.5)*15; p.y=f.y + (Math.random()-0.5)*15;
        p.vx=0; p.vy=0; p.life=0.5; p.col=f.col ? colorOf({col:f.col})[0] : '#fff'; 
        p.r=R*0.25; p.shape='circle';
      }
    }

    if(f.y<=BY+R){settle(f);return;}
    for(let r=0;r<G.grid.length;r++) for(let c=0;c<cellsIn(r);c++) if(at(c,r) && (f.x-cx(c,r))**2+(f.y-cy(r))**2<(R*1.82)**2){ settle(f);return; }
  }
}
function doVibe(ms){ if(SAVE && SAVE.vibeOn!==false && navigator.vibrate){ try{ navigator.vibrate(ms); }catch(e){} } }

function explodeAt(c,r){
  const cells=[[c,r],...nbrs(c,r).filter(([nc,nr])=>at(nc,nr))]; G.locked=true; const t0=performance.now();
  cells.forEach(([cc,rr])=>{ if(G.grid[rr]&&G.grid[rr][cc]) G.grid[rr][cc].glow=t0; });
  setTimeout(()=>{
    let n=0; for(const [cc,rr] of cells){ if(!G.grid[rr]||!G.grid[rr][cc])continue; burst(cx(cc,rr),cy(rr),'#ff9a5c'); addWave(cx(cc,rr),cy(rr),'#ff9a5c',R*4); G.grid[rr][cc]=null; n++; }
    
    addShake(20); flash(0.5); doVibe(80); 
    
    G.score+=n*80; G.combo=0; G.dryShots=0; toast('펑! +'+(n*80)); dropFloaters(); G.locked=false; checkState(); syncUI();
  },260);
}
function settle(f){
  let best=null,bd=1e9;
  for(const [c,r] of openCells()){ const d=(f.x-cx(c,r))**2+(f.y-cy(r))**2; if(d<bd){bd=d;best=[c,r];} }
  if(!best){ while(G.grid.length<=0) G.grid.push(new Array(cellsIn(G.grid.length)).fill(null)); for(let c=0;c<cellsIn(0);c++){ if(G.grid[0][c])continue; const d=(f.x-cx(c,0))**2+(f.y-cy(0))**2; if(d<bd){bd=d;best=[c,0];} } }
  G.fly=null; if(!best)return; const [c,r]=best; while(G.grid.length<=r) G.grid.push(new Array(cellsIn(G.grid.length)).fill(null));
  if(f.item==='bomb'){ G.grid[r][c]={s:f.s,col:f.col,born:performance.now()}; SFX.stageClear(); explodeAt(c,r); return; }
  let s=f.s; if(f.item==='rainbow'){ let bSyl=null; for(const ss of G.pool){ const hit=findWord(c,r,ss); if(hit && (!bSyl || hit.word.length>bSyl.word.length)) bSyl={s:ss,...hit}; } if(bSyl) s=bSyl.s; }
  G.grid[r][c]={s,col:f.col,born:performance.now()}; addShake(1.5); addWave(cx(c,r),cy(r),'#fff',R*1.4); resolve(c,r);
}

function findWordAt(c0,r0){
  const b0=at(c0,r0); if(!b0)return null; let best=null;
  const dfs=(c,r,str,path,visited)=>{
    if(str.length>=2){ const rev=[...str].reverse().join(''); let hit=DICT.has(str)?str:(DICT.has(rev)?rev:null); if(hit && (!best||hit.length>best.word.length)) best={word:hit,cells:path.slice()}; }
    if(str.length>=MAXW)return;
    for(const [nc,nr] of nbrs(c,r)){ const k=nc+','+nr; if(visited.has(k))continue; const b=at(nc,nr); if(!b)continue; visited.add(k); path.push([nc,nr]); dfs(nc,nr,str+b.s,path,visited); path.pop(); visited.delete(k); }
  };
  dfs(c0,r0,b0.s,[[c0,r0]],new Set([c0+','+r0])); return best;
}
function floodMatch(c0,r0,key){
  const b0=at(c0,r0); if(!b0)return []; const target=key==='col'?b0.col:b0.s; const seen=new Set(),stack=[[c0,r0]],out=[];
  while(stack.length){ const [c,r]=stack.pop(); const k=c+','+r; if(seen.has(k))continue; seen.add(k); const b=at(c,r); if(!b)continue; const v=key==='col'?b.col:b.s; if(v!==target)continue; out.push([c,r]); for(const [nc,nr] of nbrs(c,r)) stack.push([nc,nr]); } return out;
}
function clearCells(cells){ const t0=performance.now(); for(const [cc,rr] of cells) if(G.grid[rr]&&G.grid[rr][cc]) G.grid[rr][cc].glow=t0; }

function starBurst(x, y, col) {
  for(let i=0; i<25; i++) {
    const p = getParticle(); if(!p) continue;
    const a = Math.random() * Math.PI * 2, sp = 2 + Math.random() * 6;
    p.active = true; p.x = x; p.y = y; 
    p.vx = Math.cos(a) * sp; p.vy = Math.sin(a) * sp - 4; 
    p.life = 1.2 + Math.random() * 0.6; 
    p.col = Math.random() < 0.4 ? '#ffffff' : col;
    p.r = 4 + Math.random() * 6;
    p.shape = Math.random() < 0.6 ? 'star' : 'circle';
    p.rot = Math.random() * Math.PI; 
    p.vr = (Math.random() - 0.5) * 0.2; 
  }
}

function resolve(c,r){
  const word=findWordAt(c,r);
  if(word){
    doVibe([20,40,20]);
    G.combo++; G.dryShots=0; G.wordsCompleted++;
    if(word.word in G.done && !G.done[word.word]) { G.done[word.word]=true; syncUI(); }
    const combo=Math.min(G.combo,5), pts=([0,0,200,600,1600,3200][Math.min(word.word.length,5)]||3200)*Math.max(1,combo); G.score+=pts;
    SAVE.coins=(SAVE.coins||0)+Math.max(3,word.word.length*2); G.banner={text:word.word,life:1,bonus:true}; SFX.wordComplete(G.combo,true);
    flash(0.3+Math.min(word.word.length,4)*0.05); addShake(8+word.word.length*2);
    let px=word.cells.reduce((a,[c,r])=>a+cx(c,r),0)/word.cells.length, py=word.cells.reduce((a,[c,r])=>a+cy(r),0)/word.cells.length;
    addPop(px,py,'✨ +'+pts,'#ffe08c'); if(combo>=2) addPop(px,py-R*0.9,'콤보 x'+combo,'#ff9fd6');
    G.locked=true; const t0=performance.now(); for(const [cc,rr] of word.cells) if(G.grid[rr]&&G.grid[rr][cc]) G.grid[rr][cc].glow=t0;
    
    word.cells.forEach(([cc,rr],i)=>{ 
      setTimeout(()=>{ 
        addWave(cx(cc,rr),cy(rr),'#ffe08c',R*3); 
        starBurst(cx(cc,rr), cy(rr), colorOf(G.grid[rr][cc])[0]);
        if(i>0)SFX.pop(); 
      }, i*80); 
    });

    if(word.word.length>=4){ for(let i=0;i<20;i++){ const p=getParticle(); if(p){ const ang=Math.random()*Math.PI*2, sp=1+Math.random()*4; p.active=true; p.x=W/2; p.y=H*0.4; p.vx=Math.cos(ang)*sp; p.vy=Math.sin(ang)*sp; p.life=1.4; p.col='#ffe08c'; p.r=2+Math.random()*3; p.shape='star'; } } G.banner={text:word.word,life:1.6,bonus:true,big:true}; }
    setTimeout(()=>{
      let goldHit=0; const bombCells=[];
      for(const [cc,rr] of word.cells){ if(!G.grid[rr]||!G.grid[rr][cc])continue; const sp=G.grid[rr][cc].special; if(sp==='gold')goldHit++; if(sp==='bomb')bombCells.push([cc,rr]); burst(cx(cc,rr),cy(rr),colorOf(G.grid[rr][cc])[0]); G.grid[rr][cc]=null; }
      let chain=0; for(const [wc,wr] of word.cells) for(const [nc,nr] of nbrs(wc,wr)) if(G.grid[nr]&&G.grid[nr][nc]){ burst(cx(nc,nr),cy(nr),colorOf(G.grid[nr][nc])[0]); G.grid[nr][nc]=null; chain++; } G.score+=chain*30;
      if(goldHit){ const gb=goldHit*300; G.score+=gb; SAVE.coins=(SAVE.coins||0)+goldHit*10; addPop(px,py-R*1.6,'✨ 황금 +'+gb,'#ffe08c'); flash(0.2); }
      for(const [bc,br] of bombCells){ for(const [nc,nr] of nbrs(bc,br)) if(G.grid[nr]&&G.grid[nr][nc]){ burst(cx(nc,nr),cy(nr),colorOf(G.grid[nr][nc])[0]); G.grid[nr][nc]=null; G.score+=60; } addWave(cx(bc,br),cy(br),'#ff9a5c',R*3); addShake(8); }
      dropFloaters(); G.locked=false; checkState(); syncUI();
    },420); return;
  }
  const colGroup=floodMatch(c,r,'col'), sylGroup=floodMatch(c,r,'syl'); let group=[], mtype='';
  if(colGroup.length>=3 && colGroup.length>=sylGroup.length){ group=colGroup; mtype='col'; } else if(sylGroup.length>=3){ group=sylGroup; mtype='syl'; }
  if(group.length>=3){
    doVibe(20);
    G.combo++; G.dryShots=0; const combo=Math.min(G.combo,5), pts=Math.round(group.length*12*combo*(mtype==='syl'?1.5:1));
    G.score+=pts; SAVE.coins=(SAVE.coins||0)+Math.floor(group.length/2); SFX.pop();
    if(mtype==='syl'){ G.banner={text:'"'+at(c,r).s+'" ×'+group.length,life:1}; flash(0.15); addShake(6); } else{ addShake(3+combo); if(combo>=3)flash(0.12); }
    let px=group.reduce((a,[c,r])=>a+cx(c,r),0)/group.length, py=group.reduce((a,[c,r])=>a+cy(r),0)/group.length;
    addPop(px,py,'+'+pts,'#fff6d0'); if(combo>=2) addPop(px,py-R*0.9,'콤보 x'+combo,'#ff9fd6');
    G.locked=true; const t0=performance.now(); for(const [cc,rr] of group) if(G.grid[rr]&&G.grid[rr][cc]) G.grid[rr][cc].glow=t0;
    setTimeout(()=>{ for(const [cc,rr] of group){ if(!G.grid[rr]||!G.grid[rr][cc])continue; burst(cx(cc,rr),cy(rr),colorOf(G.grid[rr][cc])[0]); addWave(cx(cc,rr),cy(rr),colorOf(G.grid[rr][cc])[0]); G.grid[rr][cc]=null; } dropFloaters(); G.locked=false; checkState(); syncUI(); },300); return;
  }
  
  G.combo=0; G.dryShots++; SFX.miss(); if(G.grid[r]&&G.grid[r][c]) G.grid[r][c].nope=performance.now(); addShake(2);
  const left = G.allowedMisses - G.dryShots; 
  if(left > 0 && left <= 2) addPop(cx(c,r), cy(r)+R*0.7, left+'번 더 실패 시 새 줄', '#ffb15c');
  if(G.dryShots >= G.allowedMisses){
    G.dryShots=0; SFX.rowAdd(); G.parity^=1; const row=[]; 
    for(let cc=0;cc<cellsIn(0);cc++){ const avoid=cc>0?row[cc-1].s:null; let cand=G.pool.filter(x=>x!==avoid); if(!cand.length)cand=[...G.pool]; let mn=Infinity; for(const x of cand) mn=Math.min(mn,_fillCount[x]||0); const least=cand.filter(x=>(_fillCount[x]||0)<=mn+1); const ch=pick(least.length?least:cand); _fillCount[ch]=(_fillCount[ch]||0)+1; row.push({s:ch,col:randCol()}); } 
    G.grid.unshift(row); toast('새 줄이 내려왔어요!');
  } 
  checkState(); syncUI();
}
function dropFloaters(){
  const keep=new Set(),stack=[]; if(G.grid[0])for(let c=0;c<cellsIn(0);c++) if(G.grid[0][c]){keep.add('0,'+c);stack.push([c,0]);}
  while(stack.length){ const [c,r]=stack.pop(); for(const [nc,nr] of nbrs(c,r)){ if(!at(nc,nr))continue; const k=nr+','+nc; if(keep.has(k))continue; keep.add(k); stack.push([nc,nr]); } }
  for(let r=0;r<G.grid.length;r++) for(let c=0;c<cellsIn(r);c++){ if(!at(c,r))continue; if(!keep.has(r+','+c)){ burst(cx(c,r),cy(r),colorOf(G.grid[r][c])[0]); G.score+=50; G.grid[r][c]=null; } }
}
function checkState(){
  let count=0,lowest=-1; for(let r=0;r<G.grid.length;r++) for(let c=0;c<cellsIn(r);c++) if(at(c,r)){count++;lowest=Math.max(lowest,r);}
  if(count===0){win();return;} if(G.targets.length && G.targets.every(w=>G.done[w])){win();return;} if(cy(lowest)+R>BY+BH) lose();
}

function addShake(amt){ G.shake=Math.min(G.shake+amt, 14); } function addWave(x,y,col,maxR){ G.waves.push({x,y,col,r:R*0.3,maxR:maxR||R*2.4,life:1}); } function addPop(x,y,text,col){ G.pops.push({x,y,text,col:col||'#fff6d0',life:1,vy:-1.2}); } function flash(a){ G.flash=Math.max(G.flash,a); }
function burst(x,y,col){ for(let i=0;i<14;i++){ const p=getParticle(); if(!p) continue; const a=Math.random()*Math.PI*2,sp=1+Math.random()*4.5; p.active=true; p.x=x; p.y=y; p.vx=Math.cos(a)*sp; p.vy=Math.sin(a)*sp-1; p.life=1; p.col=col; p.r=2+Math.random()*4; p.shape='circle'; } SFX.pop(); }
function toast(text,cells){ let x=W/2,y=H*0.34; if(cells&&cells.length){ x=cells.reduce((a,[c,r])=>a+cx(c,r),0)/cells.length; y=cells.reduce((a,[c,r])=>a+cy(r),0)/cells.length; } G.toasts.push({text,x,y,life:1}); }

let actx=null; function getActx(){ try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); return actx; }catch(e){ return null; } }
function soundOn(){ return SAVE && SAVE.soundOn!==false; }
function tone(freq0,freq1,dur,gain,type,delay){ if(!soundOn())return; const ax=getActx(); if(!ax)return; try{ const t0=ax.currentTime+(delay||0); const o=ax.createOscillator(),g=ax.createGain(); o.type=type||'triangle'; o.frequency.setValueAtTime(freq0,t0); if(freq1) o.frequency.exponentialRampToValueAtTime(freq1,t0+dur*0.55); g.gain.setValueAtTime(0.0001,t0); g.gain.exponentialRampToValueAtTime(gain,t0+0.015); g.gain.exponentialRampToValueAtTime(0.0001,t0+dur); o.connect(g); g.connect(ax.destination); o.start(t0); o.stop(t0+dur+0.02); }catch(e){} }
const SFX={ pop(){ tone(520+Math.random()*260,880,0.17,0.07,'triangle'); }, click(){ tone(700,900,0.06,0.05,'square'); }, wordComplete(combo,bonus){ const base=440+Math.min(combo,5)*40; const ratios=bonus?[1,1.26,1.5,2]:[1,1.26,1.5]; ratios.forEach((r,i)=>tone(base*r,base*r*1.15,0.22,0.09,'triangle',i*0.045)); }, miss(){ tone(260,180,0.14,0.045,'sine'); }, rowAdd(){ tone(180,120,0.3,0.06,'sawtooth'); }, stageClear(){ [0,1,2,3].forEach(i=>tone(523.25*Math.pow(2,i/12*4), null, 0.28,0.08,'triangle',i*0.11)); }, gameOver(){ tone(300,90,0.6,0.08,'sawtooth'); }, buy(){ tone(700,1100,0.14,0.07,'triangle'); tone(1050,1400,0.16,0.06,'triangle',0.06); } };

const ASSET_SRC={ 
  cannon:'assets/cannon.png', 
  ball_0:'assets/ball_0.png', ball_1:'assets/ball_1.png', ball_2:'assets/ball_2.png', ball_3:'assets/ball_3.png', ball_4:'assets/ball_4.png',
  ball_5:'assets/ball_5.png', ball_6:'assets/ball_6.png', ball_7:'assets/ball_7.png', ball_8:'assets/ball_8.png', ball_9:'assets/ball_9.png'
};
const ASSETS={}; function loadAssets(){ return Promise.all(Object.entries(ASSET_SRC).map(([k,src])=>new Promise(res=>{ const i=new Image(); i.onload=()=>{ASSETS[k]=i;res();}; i.onerror=()=>{res();}; i.src=src; }))); }

function lighten(hex,amt){ const n=parseInt(hex.slice(1),16); return `rgb(${Math.min(255,((n>>16)&255)+amt*2)|0},${Math.min(255,((n>>8)&255)+amt*2)|0},${Math.min(255,(n&255)+amt*2)|0})`; }

function drawBubbleRaw(x,y,r,s,col,glow,special){
  const rr = r * 0.94;
  const cIdx = (col || 0) % 10;
  const img = ASSETS['ball_' + cIdx];
  
  if(img && !special) {
    const ratio = img.height / img.width;
    let dw = rr * 2.1, dh = rr * 2.1;
    if(img.width > img.height) { dh = dw * ratio; } else { dw = dh / ratio; }
    ctx.drawImage(img, x - dw/2, y - dh/2, dw, dh);
  } else {
    let [c1,c2]=colByIdx(cIdx); if(special==='gold'){ c1='#ffe9a8'; c2='#c8962f'; } else if(special==='bomb'){ c1='#e8a878'; c2='#a85f2f'; }
    ctx.save(); ctx.beginPath(); ctx.arc(x,y,rr,0,7); ctx.clip(); const g=ctx.createRadialGradient(x-rr*.32,y-rr*.38,rr*.12, x,y,rr*1.15); g.addColorStop(0, lighten(c1,18)); g.addColorStop(.45, c1); g.addColorStop(1, c2); ctx.fillStyle=g; ctx.fillRect(x-rr,y-rr,rr*2,rr*2); ctx.restore();
  }

  ctx.save(); ctx.beginPath(); ctx.arc(x,y,rr,0,7); ctx.strokeStyle= glow ? '#fff0c0' : 'rgba(0,0,0,0.1)'; ctx.lineWidth=Math.max(1.2,r*.055); ctx.globalAlpha=.85; ctx.stroke(); ctx.restore();
  if(glow){ ctx.save(); ctx.beginPath(); ctx.arc(x,y,rr,0,7); ctx.strokeStyle='#ffe9a0'; ctx.shadowColor='#ffd86f'; ctx.shadowBlur=r*.5; ctx.lineWidth=Math.max(1.2,r*.04); ctx.stroke(); ctx.restore(); }
  
  ctx.save(); ctx.font=`700 ${r*0.95}px 'Pretendard', sans-serif`; ctx.textAlign='center';ctx.textBaseline='middle'; 
  const ty=y+r*.06; 
  
  const brightBalls = [0, 1, 5, 9]; 
  const isBright = brightBalls.includes(cIdx) || special === 'gold';

  if(isBright) {
    ctx.shadowColor='rgba(255,255,255,0.5)'; ctx.shadowBlur=r*.1; ctx.shadowOffsetY=r*.02; 
    ctx.fillStyle='#3a2a1a'; 
  } else {
    ctx.shadowColor='rgba(0,0,0,0.7)'; ctx.shadowBlur=r*.12; ctx.shadowOffsetY=r*.04; 
    ctx.fillStyle='#ffffff'; 
  }
  
  ctx.fillText(s,x,ty); ctx.restore();

  if(special==='gold'){ ctx.save(); ctx.strokeStyle='#fff3b0'; ctx.lineWidth=r*.09; ctx.shadowColor='#ffe08c'; ctx.shadowBlur=r*.6; ctx.beginPath(); ctx.arc(x,y,rr,0,7); ctx.stroke(); ctx.shadowBlur=0; ctx.fillStyle='#fff8d8'; [[0.5,-0.7],[-0.6,0.4],[0.7,0.5],[-0.4,-0.5]].forEach(([dx,dy],i)=>{ const s2=r*0.10*(0.7+0.5*Math.sin(performance.now()/200+i)); ctx.beginPath(); ctx.arc(x+dx*r*.7,y+dy*r*.7,s2,0,7); ctx.fill(); }); ctx.restore(); }
  else if(special==='bomb'){ ctx.save(); ctx.font=`600 ${r*.55}px sans-serif`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('💣', x+r*.5, y-r*.5); ctx.restore(); }
}

const SPR=new Map(); let FONTS_READY=false;
function sprite(s,r,glow,col){ const key=s+'|'+r+'|'+(glow?1:0)+'|'+(col||0); let c=SPR.get(key); if(c)return c; const pad=Math.ceil(r*(glow?2.0:1.55)), size=pad*2; c=document.createElement('canvas'); c.width=Math.ceil(size*DPR); c.height=Math.ceil(size*DPR); const g2=c.getContext('2d'); g2.setTransform(DPR,0,0,DPR,0,0); const keep=ctx; ctx=g2; drawBubbleRaw(pad,pad,r,s,col,glow); ctx=keep; c._pad=pad; if(FONTS_READY){ if(SPR.size>320)SPR.clear(); SPR.set(key,c); } return c; }
function bubble(x,y,r,s,col,glow,special){ if(special){ drawBubbleRaw(x,y,r,s,col,glow,special); return; } r=Math.round(r*2)/2; const c=sprite(s,r,glow,col); ctx.drawImage(c,x-c._pad,y-c._pad,c._pad*2,c._pad*2); }

function drawShooter(now){
  const cx0 = W / 2;
  const img = ASSETS.cannon;
  
  if(img) {
    const w = R * 6.5; 
    const h = w * (img.height / img.width);
    ctx.drawImage(img, cx0 - w/2, G.shooterY - h * 0.25, w, h); 
  }
  
  if(!G.fly && G.cur) { 
    const bob = Math.sin(now/420) * R * 0.05; 
    bubble(cx0, G.shooterY - R*0.6 + bob, R*0.94, G.cur.s, G.cur.col, true); 
    
    if(G.activeItem){ ctx.save(); ctx.font=`600 ${R*.62}px sans-serif`; ctx.textAlign='center';ctx.textBaseline='middle'; ctx.fillText(G.activeItem==='bomb'?'💣':'🌈', cx0+R*0.78, G.shooterY+bob-R*0.78); ctx.restore(); } 
  }
}
function drawQueue(){
  if(!G.queue.length)return; 
  const x = W/2 + R*3.4, y = G.shooterY + R*0.8, r = R*0.9;
  ctx.save(); ctx.font=`700 ${R*.42}px 'Pretendard', sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle'; ctx.fillStyle='#ffffff';ctx.shadowColor='rgba(0,0,0,.8)';ctx.shadowBlur=4; 
  ctx.fillText('다음: '+G.queue[0].s, x, y-r*1.4); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.arc(x,y,r*1.0,0,7); ctx.fillStyle='rgba(0,0,0,0.4)'; ctx.fill(); ctx.restore();
  bubble(x,y,r*0.92,G.queue[0].s,G.queue[0].col);
}

function draw(now){
  ctx.clearRect(0,0,W,H); ctx.save(); if(G.shake>0.3){ ctx.translate((Math.random()-0.5)*G.shake, (Math.random()-0.5)*G.shake); }
  
  if(G.aim!=null&&!G.fly&&!G.locked){
    if(G.trajA!==G.aim){
      G.trajA=G.aim; let x=W/2,y=G.shooterY,vx=Math.cos(G.aim)*R*.62,vy=Math.sin(G.aim)*R*.62; G.trajPts=[]; 
      for(let i=0;i<200;i++){ 
        x+=vx;y+=vy; 
        if(y<BY+BH){ if(x<BX+R){x=BX+R;vx*=-1;} if(x>BX+BW-R){x=BX+BW-R;vx*=-1;} } 
        if(y<=BY+R)break; 
        if(y<BY+BH&&hitsBubble(x,y))break; 
        if(i%2===0)G.trajPts.push([x,y]); 
      } 
    }
    const pts=G.trajPts; 
    ctx.save(); 
    pts.forEach((p,i)=>{ 
      const sz = 1 - (i / pts.length) * 0.3; 
      const dotR = R * 0.12 * sz; 
      
      ctx.beginPath();
      ctx.arc(p[0],p[1],dotR,0,7);
      ctx.fillStyle='#ffb1c8'; 
      ctx.shadowColor='#ff3385'; 
      ctx.shadowBlur=dotR*4;
      ctx.fill();
      ctx.shadowBlur=0;
      
      ctx.beginPath();
      ctx.arc(p[0],p[1],dotR*0.45,0,7);
      ctx.fillStyle='#ffffff';
      ctx.fill(); 
    }); 
    ctx.restore();
  }
  
  if(G.hintCells){ ctx.save(); const pulse=.5+.5*Math.sin(now/180); ctx.strokeStyle=`rgba(255,232,140,${.5+pulse*.5})`;ctx.shadowColor='#ffe08c';ctx.shadowBlur=14; ctx.lineWidth=4;ctx.setLineDash([7,7]); for(const [c,r] of G.hintCells){ctx.beginPath();ctx.arc(cx(c,r),cy(r),R*1.05,0,7);ctx.stroke();} ctx.restore(); }
  for(let r=0;r<G.grid.length;r++) for(let c=0;c<cellsIn(r);c++){ const b=at(c,r); if(!b)continue; let rr=R*.94, bx=cx(c,r), by=cy(r); if(b.born){const t=Math.min(1,(now-b.born)/220);rr*=(.62+.38*t+.12*Math.sin(t*Math.PI));} if(b.nope){ const dt=now-b.nope; if(dt<400) bx+=Math.sin(dt/28)*Math.max(0,4-dt/100); else b.nope=0; } bubble(bx,by,rr,b.s,b.col,!!b.glow,b.special); }
  if(G.fly)bubble(G.fly.x,G.fly.y,R*.94,G.fly.s,G.fly.col);
  
  for(let p of PARTICLE_POOL) if(p.active){ 
    ctx.save();
    ctx.globalAlpha=Math.max(0, Math.min(1, p.life)); 
    ctx.translate(p.x, p.y);
    if(p.shape === 'star') ctx.rotate(p.rot || 0);
    
    ctx.fillStyle=p.col; ctx.shadowColor=p.col; ctx.shadowBlur=12; 
    ctx.beginPath();
    
    if(p.shape === 'star') {
      for(let j=0; j<10; j++){ 
        const rad = j % 2 === 0 ? p.r : p.r * 0.4;
        ctx.lineTo(Math.cos(j * Math.PI * 0.2) * rad, Math.sin(j * Math.PI * 0.2) * rad);
      }
      ctx.closePath();
    } else {
      ctx.arc(0,0,p.r,0,7);
    }
    ctx.fill();
    ctx.restore();
  } 
  ctx.globalAlpha=1;
  
  drawShooter(now); drawQueue();
  if(G.banner){ const b=G.banner, t=1-b.life/(b.big?1.6:1), pop=t<.18?(t/.18):1, fs=Math.min(R*(b.big?3:2),BW/(b.text.length+0.45)*(b.big?1.5:1))*(0.72+0.28*pop)*(1+(1-b.life)*0.06), col=b.bonus?'#ffd86f':'#ff8fdc'; ctx.save(); ctx.globalAlpha=Math.min(1,b.life*2.2); ctx.translate(W/2,BY+R*1.25-(1-b.life)*R*.8); if(b.big) ctx.rotate(Math.sin(performance.now()/90)*0.04); ctx.font=`800 ${fs}px 'Pretendard', sans-serif`; ctx.textAlign='center';ctx.textBaseline='middle'; ctx.shadowColor=col;ctx.shadowBlur=fs*(b.big?0.8:0.55); ctx.fillStyle=col;ctx.fillText(b.text,0,0);ctx.fillText(b.text,0,0); if(b.big) ctx.fillText(b.text,0,0); ctx.shadowBlur=0; ctx.fillStyle='#ffffff';ctx.fillText(b.text,0,0); ctx.restore(); }
  for(const w of G.waves){ ctx.save(); ctx.globalAlpha=Math.max(0,w.life)*0.6; ctx.strokeStyle=w.col; ctx.shadowColor=w.col; ctx.shadowBlur=14; ctx.lineWidth=Math.max(1.5,3*w.life); ctx.beginPath(); ctx.arc(w.x,w.y,w.r,0,7); ctx.stroke(); ctx.restore(); }
  for(const p of G.pops){ ctx.save(); ctx.globalAlpha=Math.min(1,p.life*1.5); ctx.translate(p.x, p.y+(1-p.life)*-30); const fs=R*0.7*(0.85+(1-p.life)*0.35); ctx.font=`800 ${fs}px 'Pretendard', sans-serif`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle=p.col; ctx.shadowColor=p.col; ctx.shadowBlur=fs*0.6; ctx.fillText(p.text,0,0); ctx.restore(); }
  for(const t of G.toasts){ ctx.save(); ctx.globalAlpha=Math.min(1,t.life*1.6); ctx.translate(t.x,t.y-(1-t.life)*62); const fs=R*.74*(1+(1-t.life)*.25); ctx.font=`800 ${fs}px 'Pretendard', sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle'; ctx.fillStyle='#fff6d0';ctx.shadowColor='#ffd86f';ctx.shadowBlur=fs*.7; ctx.fillText(t.text,0,0);ctx.fillText(t.text,0,0); ctx.restore(); }
  ctx.restore();
  if(G.flash>0.01){ ctx.save(); ctx.globalAlpha=G.flash; ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,W,H); ctx.restore(); }
  if (G.combo >= 3) { ctx.save(); const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 150); ctx.lineWidth = 14; ctx.strokeStyle = `rgba(255, 177, 92, ${pulse * 0.7})`; ctx.strokeRect(0, 0, W, H); ctx.restore(); }
}

function tick(now){
  stepFly();
  for(let p of PARTICLE_POOL) if(p.active) { 
    p.x+=p.vx; p.y+=p.vy; 
    if(p.shape === 'star') {
      p.vy += 0.1; 
      if(p.rot !== undefined) p.rot += p.vr; 
      p.life -= 0.018; 
    } else {
      p.vy += 0.22; 
      p.life -= 0.028; 
    }
    if(p.life<=0) p.active=false; 
  }
  if(G.banner){G.banner.life-=.0085;if(G.banner.life<=0)G.banner=null;}
  for(const t of G.toasts)t.life-=.012; G.toasts=G.toasts.filter(t=>t.life>0);
  G.shake*=0.82; if(G.shake<0.3)G.shake=0; G.flash*=0.86; if(G.flash<0.01)G.flash=0;
  for(const w of G.waves){ w.r+=(w.maxR-w.r)*0.18; w.life-=0.05; } G.waves=G.waves.filter(w=>w.life>0);
  for(const p of G.pops){ p.y+=p.vy; p.vy*=0.94; p.life-=0.022; } G.pops=G.pops.filter(p=>p.life>0);
  draw(now); requestAnimationFrame(tick);
}

function aimAt(px,py){ const dx=px-W/2,dy=py-G.shooterY; let a=Math.atan2(dy,dx); const lim=.22; if(a>-lim)a=-lim; if(a<-Math.PI+lim)a=-Math.PI+lim; G.aim=a; }
function localPt(e){ if(!cv)return [0,0]; const rect=cv.getBoundingClientRect(); const scaleX = cv.width / rect.width / DPR; const scaleY = cv.height / rect.height / DPR; return [(e.clientX-rect.left)*scaleX, (e.clientY-rect.top)*scaleY]; }

// ✨ 모달 설정창 (맵 화면과 인게임 통합 관리)
function openSettings(isMap) {
  if (veil.classList.contains('on')) return;
  G.locked = true;
  SFX.click();

  const sOn = soundOn() ? '🔊' : '🔇';
  const vOn = (SAVE.vibeOn !== false) ? '📳' : '📴';

  let extraBtns = '';
  if(isMap) {
    extraBtns = `<button class="btn" id="modalCloseBtn" style="width:100%; background:linear-gradient(180deg,#8ebf63,#4a822b); border-color:#2c5215; color:#fff;">닫기</button>`;
  } else {
    extraBtns = `
      <button class="btn" id="goBtn" style="width:100%;">이어서 하기</button>
      <div style="margin-top:16px; display:flex; gap:10px;">
        <button class="btn" id="restartBtn" style="flex:1; padding:10px; font-size:15px; background:linear-gradient(180deg,#ffb15c,#e55a2b); border-color:#8a2f12; color:#fff;">새로 시작</button>
        <button class="btn" id="switchBtn" style="flex:1; padding:10px; font-size:15px; background:linear-gradient(180deg,#8ebf63,#4a822b); border-color:#2c5215; color:#fff;">메인 화면</button>
      </div>
    `;
  }

  show(`
    <h2>⚙️ 설정</h2>
    <div style="display:flex; justify-content:center; gap:20px; margin: 20px 0;">
      <div style="text-align:center;">
        <button class="icon-btn" id="modalSound" style="width:54px; height:54px; font-size:24px;">${sOn}</button>
        <div style="font-size:12px; margin-top:6px; color:#dcc9a0;">소리</div>
      </div>
      <div style="text-align:center;">
        <button class="icon-btn" id="modalVibe" style="width:54px; height:54px; font-size:24px;">${vOn}</button>
        <div style="font-size:12px; margin-top:6px; color:#dcc9a0;">진동</div>
      </div>
    </div>
    ${extraBtns}
  `);

  document.getElementById('modalSound').onclick = function() {
    SAVE.soundOn = !soundOn(); saveGame(true);
    this.textContent = soundOn() ? '🔊' : '🔇';
    if(soundOn()) SFX.click();
  };
  document.getElementById('modalVibe').onclick = function() {
    SAVE.vibeOn = SAVE.vibeOn === false ? true : false; saveGame(true);
    this.textContent = SAVE.vibeOn !== false ? '📳' : '📴';
    if(soundOn()) SFX.click();
    if(SAVE.vibeOn !== false && navigator.vibrate) navigator.vibrate(20);
  };
  
  if(isMap) {
    document.getElementById('modalCloseBtn').onclick = () => { hide(); G.locked = false; };
  } else {
    document.getElementById('goBtn').onclick = () => { hide(); G.locked = false; };
    document.getElementById('restartBtn').onclick = (ev) => { ev.preventDefault(); if (!spendLife()) return; hide(); startGame(false, G.stage); };
    
    document.getElementById('switchBtn').onclick = (ev) => { 
      ev.preventDefault(); 
      show(`
        <h2>그만하기</h2>
        <div style="font-size:40px; margin:10px 0;">😿</div>
        <p style="margin:10px 0; line-height:1.4;">
          타이틀로 나가시겠어요?<br>
          <span style="font-size:13px; color:#ff9a5c;">이번 플레이에서 얻은 점수가 사라집니다.</span>
        </p>
        <div style="display:flex; gap:10px; margin-top:16px;">
          <button class="btn" id="cancelQuitBtn" style="flex:1; padding:10px; font-size:15px; background:linear-gradient(180deg,#8ebf63,#4a822b); border-color:#2c5215; color:#fff;">취소</button>
          <button class="btn" id="confirmQuitBtn" style="flex:1; padding:10px; font-size:15px; background:linear-gradient(180deg,#ffb15c,#e55a2b); border-color:#8a2f12; color:#fff;">나가기</button>
        </div>
      `);
      
      document.getElementById('cancelQuitBtn').onclick = () => {
        SFX.click();
        hide();
        G.locked = false; 
      };
      
      document.getElementById('confirmQuitBtn').onclick = () => {
        SFX.click();
        hide();
        openMap(); 
      };
    };
  }
}

window.addEventListener('load', () => {
  const btnSettings = document.getElementById('btnSettings');
  if (btnSettings) btnSettings.onclick = () => openSettings(false);
  
  const btnMapSettings = document.getElementById('btnMapSettings');
  if (btnMapSettings) btnMapSettings.onclick = () => openSettings(true);

  const btnShop=document.getElementById('btnShop'); if(btnShop) btnShop.onclick=()=>{ if(veil.classList.contains('on'))return; G.locked=true; SFX.click(); openShop(); };
  
  const navHome = document.getElementById('navHome');
  const navShop = document.getElementById('navShop');
  const navRank = document.getElementById('navRank');

  if(navHome) navHome.onclick = () => {
    SFX.click();
    const scrollEl = document.getElementById('mapScroll');
    if(scrollEl) scrollEl.scrollTo({top: 0, behavior:'smooth'});
  };

  if(navShop) navShop.onclick = () => {
    SFX.click();
    openShop();
  };

  if(navRank) navRank.onclick = () => {
    SFX.click();
    show(`
      <h2>🏆 랭킹</h2>
      <div style="display:flex; justify-content:center; gap:8px; margin-bottom:12px;">
        <button class="btn" style="padding:6px 14px; font-size:13px; margin:0;" onclick="SFX.click()">일간</button>
        <button class="btn" style="padding:6px 14px; font-size:13px; margin:0; opacity:0.6;" onclick="SFX.click()">주간</button>
        <button class="btn" style="padding:6px 14px; font-size:13px; margin:0; opacity:0.6;" onclick="SFX.click()">전체</button>
      </div>
      <div style="max-height:40vh; overflow-y:auto; background:rgba(0,0,0,0.3); border-radius:12px; padding:10px; text-align:left; font-size:14px; color:#eafcff;">
        <div style="padding:8px; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between;"><span>🥇 1위. 세종대왕</span><b style="color:#ffe08c">98,500점</b></div>
        <div style="padding:8px; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between;"><span>🥈 2위. 훈민정음</span><b style="color:#ffe08c">85,200점</b></div>
        <div style="padding:8px; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between;"><span>🥉 3위. 기획자님</span><b style="color:#ffe08c">77,700점</b></div>
        <div style="padding:8px; display:flex; justify-content:space-between; opacity:0.7;"><span>4위. 훈민정음</span><span>65,100점</span></div>
      </div>
      <button class="btn" id="rankCloseBtn" style="margin-top:14px; padding:8px 24px; font-size:15px;">닫기</button>
    `);
    document.getElementById('rankCloseBtn').onclick = () => { SFX.click(); hide(); };
  };

  const btnSwap=document.getElementById('btnSwap'); if(btnSwap) btnSwap.onclick=()=>{ if(G.swaps<=0||G.fly||G.locked)return; SFX.click(); G.swaps--; const t=G.cur; G.cur=G.queue[0]; G.queue[0]=t; syncUI(); };
  const btnHint=document.getElementById('btnHint'); if(btnHint) btnHint.onclick=()=>{ if(G.hints<=0||G.fly||G.locked)return; SFX.click(); const hit=completionsFor(G.cur.s); if(!hit.length){toast('이 글자로는 만들 단어가 없어요');return;} hit.sort((a,b)=>(b.cat===G.goal)-(a.cat===G.goal)||b.word.length-a.word.length); G.hints--; G.hintCells=[[hit[0].c,hit[0].r]]; toast(hit[0].word,[[hit[0].c,hit[0].r]]); syncUI(); };
  const btnBomb=document.getElementById('btnBomb'); if(btnBomb) btnBomb.onclick=()=>{ if(G.bombs<=0||G.fly||G.locked)return; SFX.click(); G.activeItem = G.activeItem==='bomb' ? null : 'bomb'; syncUI(); };
  const btnRainbow=document.getElementById('btnRainbow'); if(btnRainbow) btnRainbow.onclick=()=>{ if(G.rainbows<=0||G.fly||G.locked)return; SFX.click(); G.activeItem = G.activeItem==='rainbow' ? null : 'rainbow'; syncUI(); };
  
  if(cv) { cv.addEventListener('pointerdown',e=>{G.dragging=true;aimAt(...localPt(e));}); cv.addEventListener('pointermove',e=>{if(G.dragging)aimAt(...localPt(e));}); cv.addEventListener('pointerup',()=>{ if(!G.dragging)return; G.dragging=false; if(G.aim!=null)shoot(G.aim); G.aim=null; }); cv.addEventListener('pointercancel',()=>{G.dragging=false;G.aim=null;}); }
});

function renderTargetBar(){
  const bar=document.getElementById('targetBar'); if(!bar)return;
  if(G.mode==='theme'&&G.targets.length){
    bar.innerHTML = G.targets.map(w=>`<span class="tchip${G.done[w]?' done':''}">${G.done[w]?'✓ ':''}${w}</span>`).join('');
  }else if(G.mode==='free'){
    bar.innerHTML = `<span class="tchip${G.wordsCompleted>=G.freeGoal?' done':''}">단어 ${G.wordsCompleted}/${G.freeGoal}개</span>`;
  }else{ bar.innerHTML=''; }
}

function syncUI(){
  const us=document.getElementById('uiStage'); if(us) us.textContent=G.stage;
  const ul=document.getElementById('uiLives'); if(ul) ul.textContent=computeLives().count;
  const uc=document.getElementById('uiCoins'); if(uc) uc.textContent=(SAVE.coins||0).toLocaleString();
  const usb=document.getElementById('uiScoreBig'); if(usb) usb.textContent=G.score.toLocaleString();
  const uswp=document.getElementById('uiSwap'); if(uswp) uswp.textContent=G.swaps; 
  const uht=document.getElementById('uiHint'); if(uht) uht.textContent=G.hints;
  renderTargetBar(); saveGame(false);
  const bSwap=document.getElementById('btnSwap'); if(bSwap) bSwap.disabled=G.swaps<=0; 
  const bHint=document.getElementById('btnHint'); if(bHint) bHint.disabled=G.hints<=0;
  const ub=document.getElementById('uiBomb'), ur=document.getElementById('uiRainbow'); if(ub) ub.textContent=G.bombs; if(ur) ur.textContent=G.rainbows;
  const bBomb=document.getElementById('btnBomb'), bRain=document.getElementById('btnRainbow');
  if(bBomb){ bBomb.disabled=G.bombs<=0; bBomb.classList.toggle('active', G.activeItem==='bomb'); }
  if(bRain){ bRain.disabled=G.rainbows<=0; bRain.classList.toggle('active', G.activeItem==='rainbow'); }
}

const veil=document.getElementById('veil'),card=document.getElementById('card'); function show(html){if(card)card.innerHTML=html;if(veil)veil.classList.add('on');} function hide(){if(veil)veil.classList.remove('on');}
const SHOP_ITEMS=[ {id:'hint3', icon:'💡', label:'힌트 +3', desc:'막힐 때 자리를 알려줘요', price:30, apply:()=>{G.hints+=3;}}, {id:'swap3', icon:'🔄', label:'교체 +3', desc:'글자를 다른 글자로 바꿔요', price:20, apply:()=>{G.swaps+=3;}}, {id:'bomb2', icon:'💣', label:'폭탄 +2', desc:'주변까지 한번에 터뜨려요', price:50, apply:()=>{G.bombs+=2;}}, {id:'rainbow2',icon:'🌈', label:'무지개 +2', desc:'가장 좋은 글자로 자동 발사', price:60, apply:()=>{G.rainbows+=2;}}, {id:'revive1', icon:'❤️', label:'부활권 +1', desc:'게임오버 시 이어서 플레이', price:80, apply:()=>{SAVE.revives=(SAVE.revives||0)+1;}} ];
function openShop(){ show(shopHTML()); wireShop(); }
function shopHTML(){
  const coins=SAVE.coins||0;
  const rows=SHOP_ITEMS.map(it=>{
    const affordable=coins>=it.price; const owned = it.id==='revive1' ? `<span style="font-size:12px;opacity:.7">보유 ${SAVE.revives||0}</span>` : '';
    return `<div style="display:flex;align-items:center;gap:10px;padding:9px 4px;border-bottom:1px solid rgba(95,216,255,.15)"><div style="font-size:24px">${it.icon}</div><div style="flex:1;text-align:left"><div style="font-size:15px;color:#eafcff">${it.label} ${owned}</div><div style="font-size:12px;opacity:.65">${it.desc}</div></div><button class="btn" data-id="${it.id}" style="margin:0;padding:7px 14px;font-size:13px;${affordable?'':'opacity:.35'}" ${affordable?'':'disabled'}>💰${it.price}</button></div>`;
  }).join('');
  return `<h2>🛒 상점</h2><p style="font-size:14px;margin-top:-4px">보유 코인 <b style="color:#ffe08c">💰${coins.toLocaleString()}</b></p><div style="max-height:52vh;overflow-y:auto;margin-top:8px">${rows}</div><button class="btn" id="shopClose" style="margin-top:14px">닫기</button>`;
}
function wireShop(){ if(card)card.querySelectorAll('button[data-id]').forEach(btn=>{ btn.onclick=()=>{ const it=SHOP_ITEMS.find(x=>x.id===btn.dataset.id); if(!it) return; const coins=SAVE.coins||0; if(coins<it.price) return; SAVE.coins=coins-it.price; it.apply(); saveGame(true); SFX.buy(); syncUI(); show(shopHTML()); wireShop(); }; }); const sc=document.getElementById('shopClose'); if(sc)sc.onclick=()=>{ SFX.click(); hide(); G.locked=false; }; }
function calcStars(){ const goal = G.mode==='theme' ? G.targets.length : G.freeGoal; const ratio = Math.max(goal, Math.ceil(goal*1.3))/Math.max(1, G.shots); if(ratio>=0.85) return 3; if(ratio>=0.55) return 2; return 1; }
function starRow(n){ let out=''; for(let i=0;i<3;i++) out+= i<n ? '<span style="color:#ffe08c;text-shadow:0 0 12px #ffb15c">★</span>' : '<span style="color:rgba(255,255,255,.25)">★</span>'; return `<div style="font-size:34px;letter-spacing:6px;margin:8px 0">${out}</div>`; }
function win(){
  G.locked=true;G.score+=1000; const stars=calcStars(), isMilestone=G.mode==='theme'&&G.stage%MILESTONE_EVERY===0, isFinal=G.mode==='theme'&&G.stage===MAX_STAGE, milestoneBonus=isFinal?1000:(isMilestone?200:0), coinGain=30+G.stage*4+stars*15+milestoneBonus; SAVE.coins=(SAVE.coins||0)+coinGain;
  if(G.mode==='theme'){ if(!SAVE.theme.levelStars) SAVE.theme.levelStars={}; const prev=SAVE.theme.levelStars[G.stage]||0; if(stars>prev){ SAVE.totalStars=(SAVE.totalStars||0)+(stars-prev); SAVE.theme.levelStars[G.stage]=stars; } }else{ SAVE.totalStars=(SAVE.totalStars||0)+stars; } saveGame(true); SFX.stageClear(); addShake(8+stars*2); flash(0.3);
  let extra=''; if(G.mode==='theme'){ if(isFinal){ extra=`<p>🏆 100 스테이지를 모두 완주했어요!</p><p style="font-size:14px;opacity:.85">정말 대단해요. 계속해서 도전할 수 있어요.</p>`; }else if(isMilestone){ extra=`<p>🎁 마일스톤 달성! 보너스 코인 +${milestoneBonus}</p>`; }else{ extra=`<p>목표 단어를 모두 만들었어요 🎉</p><p style="margin-top:8px;font-size:14px;opacity:.85">다음 주제: <b>${CATS[(G.stage)%CATS.length]}</b></p>`; } }else{ extra=`<p>목표 단어 개수를 달성했어요 🎉</p>`; }
  const mapBtn=G.mode==='theme'?`<a href="#" id="toMap" style="display:block;margin-top:10px;color:#d9a94a;font-size:14px">🗺️ 지도로 보기</a>`:'';
  show(`<h2>스테이지 ${G.stage} 완료!</h2>${starRow(stars)}${extra}<p>점수 <b>${G.score.toLocaleString()}</b> · 💰+${coinGain}</p><button class="btn" id="go">${isFinal?'한번 더 플레이':'다음 스테이지'}</button>${mapBtn}`);
  const btnGo=document.getElementById('go'); if(btnGo) btnGo.onclick=()=>{ SFX.click(); if(G.mode==='theme'){ G.stage=Math.min(G.stage+1, MAX_STAGE); } else{ G.stage++; } hide();G.locked=false;buildStage();saveGame(true); };
  const toMapBtn=document.getElementById('toMap'); if(toMapBtn) toMapBtn.onclick=(ev)=>{ ev.preventDefault(); SFX.click(); hide(); G.locked=true; openMap(); };
}
function lose(){
  G.locked=true; SFX.gameOver(); const canRevive=(SAVE.revives||0)>0;
  show(`<h2>아쉬워요!</h2><p>버블이 바닥까지 내려왔어요.<br>스테이지 ${G.stage} · ${G.score.toLocaleString()}점</p>${canRevive?`<button class="btn" id="revive" style="border-color:#ff6b81;color:#ffe0e6;text-shadow:0 0 10px #ff6b81;box-shadow:0 0 16px rgba(255,107,129,.55),inset 0 0 14px rgba(255,107,129,.25);margin-top:14px">❤️ 부활권 사용 (보유 ${SAVE.revives})</button>`:''}<button class="btn" id="go" style="margin-top:${canRevive?10:16}px">다시 하기</button>`);
  if(canRevive){ const rev=document.getElementById('revive'); if(rev) rev.onclick=()=>{ SFX.buy(); SAVE.revives--; saveGame(true); hide(); G.locked=false; for(let i=0;i<2&&G.grid.length>0;i++)G.grid.pop(); BOARDLAYER=null; toast('❤️ 부활! 아래 두 줄이 사라졌어요'); checkState(); syncUI(); }; } const goBtn=document.getElementById('go'); if(goBtn) goBtn.onclick=()=>{if(!spendLife())return;hide();G.locked=false;G.score=0;buildStage();};
}

function intro() {
  const introSc = document.getElementById('introScreen');
  if (introSc) {
    introSc.style.display = 'flex';
    introSc.classList.remove('hidden');
  }

  const btnStartAdv = document.getElementById('btnStartAdventure');
  if (btnStartAdv) {
    btnStartAdv.onclick = () => {
      SFX.click(); 
      if (introSc) {
        introSc.classList.add('hidden'); 
        introSc.style.display = 'none';
      }
      G.mode = 'theme'; 
      openMap(); 
    };
  }
}

function startGame(resume, atStage){ 
  if(typeof atStage==='number'){ 
    G.stage=atStage; G.score=0; 
  }else if(resume){ 
    const slot=SAVE[G.mode]; G.stage=slot?Math.max(1,slot.stage):1; G.score=slot?(slot.score||0):0; 
  }else{ 
    G.stage=1; G.score=0; 
  } 
  G.started=true; buildStage(); G.locked=false; saveGame(true); 
}

let _mapLivesTimer=null;
function renderMapLives(){ 
  const s=computeLives(); 
  const uiLives = document.getElementById('uiLives'); 
  if(uiLives) uiLives.textContent = s.count;

  const mapLives = document.getElementById('mapUI_lives');
  const mapTimer = document.getElementById('mapUI_timer');
  if(mapLives) mapLives.textContent = s.count;
  
  if(mapTimer) {
    if(s.count>=MAX_LIVES){ 
      mapTimer.textContent = 'MAX'; 
    } else {
      const sec=Math.ceil(secToNextLife()); 
      mapTimer.textContent = `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`; 
    }
  }
}

const ZONES=[ {key:'forest', img:'assets/map_bg.png'} ]; 
function zoneIdx(lv){ return Math.min(4, Math.floor((lv-1)/100)); }

const PATH_POINTS={ 
  forest: [ 
    [50,95],[55,92],[60,89],[63,85],[62,80],[58,76],[52,73],[47,70],[44,65],[45,60],
    [50,55],[55,52],[60,49],[63,45],[61,40],[55,36],[48,33],[43,29],[42,24],[45,19],
    [50,15],[56,12],[62,9],[58,6],[52,4]
  ] 
};
const PATH_IMG_ASPECT={ forest: 2.16 };

function openMap(_isRetry){
  const ms=document.getElementById('mapScreen'); if(ms)ms.classList.add('on'); 
  const stars=SAVE.theme.levelStars||{}; let maxUnlocked=1; for(let i=1;i<=MAX_STAGE;i++){ if(stars[i]!=null) maxUnlocked=i+1; } maxUnlocked=Math.min(maxUnlocked, MAX_STAGE); const allCleared = maxUnlocked>=MAX_STAGE && stars[MAX_STAGE]!=null; const TOTAL = MAX_STAGE; 
  
  const elCoins = document.getElementById('mapUI_coins');
  if(elCoins) elCoins.textContent = (SAVE.coins||0).toLocaleString();

  const playBtn = document.getElementById('btnMapPlay');
  if(playBtn) {
    playBtn.onclick = () => {
      if(!spendLife()) return;
      SFX.click();
      ms.classList.remove('on');
      clearInterval(_mapLivesTimer);
      G.mode = 'theme';
      startGame(false, maxUnlocked);
    };
  }

  const scrollEl=document.getElementById('mapScroll'); const containerW=scrollEl.clientWidth||390; const curZone=zoneIdx(TOTAL);
  function xPct(lv){ return 50+Math.sin(lv*0.9)*26+((Math.sin(lv*12.9898)*43758.5453)%1 - 0.5)*10; }
  const zoneH=[]; for(let z=0; z<=curZone; z++){ const key=ZONES[z].key; zoneH[z] = PATH_POINTS[key] ? containerW*PATH_IMG_ASPECT[key] : 100*108; } const H = zoneH.reduce((a,b)=>a+b,0) + 120; const zoneTop=[], zoneBot=[]; { let bot=H-60; for(let z=0; z<=curZone; z++){ zoneBot[z]=bot; zoneTop[z]=bot-zoneH[z]; bot=zoneTop[z]; } }
  
  function nodePos(lv){ 
    const pts = PATH_POINTS.forest;
    const idx = Math.floor(((lv - 1) / (TOTAL - 1)) * (pts.length - 1));
    const raw = pts[idx] || [50, 50];
    return { x: raw[0], y: (raw[1] / 100) * H }; 
  }

  let zonesHtml=''; for(let z=0; z<=curZone; z++){ const key=ZONES[z].key; zonesHtml += `<img src="${ZONES[z].img}" style="position:absolute;left:0;top:0;width:100%;height:100%;z-index:0;pointer-events:none;object-fit:cover;">`; }
  let nodesHtml='', pathPts=[]; for(let lv=1; lv<=TOTAL; lv++){ const done = stars[lv]!=null, isNext = !done && lv===maxUnlocked, locked = !done && !isNext, isMilestone = lv%MILESTONE_EVERY===0, isFinal = lv===MAX_STAGE, cls = done?'done':(isNext?'next':'locked'), extraCls = isFinal?' mfinal':(isMilestone?' mmilestone':''), p=nodePos(lv); pathPts.push([p.x,p.y]); const starHtml = done ? [[-10,-1],[0,-5],[10,-1]].map((sp,i)=>`<span class="mstar" style="left:calc(50% + ${sp[0]}px);top:${sp[1]}px">${i<stars[lv]?'★':'<span style=\'opacity:.35\'>★</span>'}</span>`).join('') : ''; const icon = isFinal ? '👑' : (isMilestone ? '🎁' : lv); nodesHtml += `<div class="mnode ${cls}${extraCls}" data-lv="${lv}" style="left:${p.x}%;top:${p.y}px">${done?'<span class="mdone-halo"></span>':''}${locked?'<span class="mlock">🔒</span>':icon}${starHtml}</div>`; }
  let pathD=''; pathPts.forEach((p,i)=>{ if(i===0) pathD+=`M${p[0]},${p[1]}`; else pathD+=` C${pathPts[i-1][0]},${(pathPts[i-1][1]+p[1])/2} ${p[0]},${(pathPts[i-1][1]+p[1])/2} ${p[0]},${p[1]}`; });
  
  scrollEl.innerHTML=`<div id="mapInner" style="height:${Math.max(scrollEl.clientHeight, 1200)}px">${allCleared?`<div style="position:absolute;left:50%;top:20px;transform:translateX(-50%);color:#f5e3ae;text-align:center;font-size:14px;padding:6px 16px;white-space:nowrap;z-index:3">🏆 100 스테이지 완주! 대단해요</div>`:''}${zonesHtml}<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;left:0;top:0;width:100%;height:100%;z-index:1;pointer-events:none"><path d="${pathD}" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="1 2" vector-effect="non-scaling-stroke"/></svg>${nodesHtml}</div>`;
  
  if(!_isRetry){ requestAnimationFrame(()=>{ if(Math.abs(scrollEl.clientWidth - containerW) > 2){ openMap(true); return; } }); } renderMapLives(); clearInterval(_mapLivesTimer); _mapLivesTimer=setInterval(renderMapLives,1000);
  
  requestAnimationFrame(()=>{ const nextEl=scrollEl.querySelector('.mnode.next')||scrollEl.querySelector('.mnode.done:last-of-type'); if(nextEl) nextEl.scrollIntoView({block:'center'}); });
  
  scrollEl.querySelectorAll('.mnode').forEach(el=>{ 
    el.onclick=()=>{ 
      const lv=+el.dataset.lv; 
      if(el.classList.contains('locked') || !spendLife()) return; 
      SFX.click(); 
      ms.classList.remove('on'); 
      clearInterval(_mapLivesTimer); 
      G.mode='theme'; 
      startGame(false, lv); 
    }; 
  });
}

function applyDebugZones(){ const ls=SAVE.theme.levelStars||(SAVE.theme.levelStars={}); for(let i=1;i<=Math.max(1, MAX_STAGE-1);i++){ if(ls[i]==null) ls[i]=3; } }

function boot(){ 
  initCanvas();
  resize(); 
  
  applyDebugZones(); 
  
  G.grid=[]; G.targets=[]; G.cur=null; G.queue=[]; G.locked=true; 
  intro(); 
  requestAnimationFrame(tick); 
  loadAssets().catch(()=>{}); 
}

function markFontsReady(){ FONTS_READY=true; SPR.clear(); }
if(document.fonts&&document.fonts.ready){ boot(); Promise.all([document.fonts.load("800 20px 'Pretendard'"),document.fonts.load("700 20px 'Pretendard'"),document.fonts.load("600 20px 'Pretendard'"),document.fonts.load("500 20px 'Pretendard'")]).then(()=>document.fonts.ready).then(markFontsReady).catch(()=>{ setTimeout(markFontsReady,800); }); setTimeout(()=>{ if(!FONTS_READY) markFontsReady(); },2000); } else { window.addEventListener('load',()=>{ boot(); setTimeout(markFontsReady,600); }); }