
(()=>{const $=q=>document.querySelector(q),$$=q=>[...document.querySelectorAll(q)];let g="m",nick="",xp=0,hp=3,items=[],cleared=0,scene="world",pos={x:14,y:74},near=null,dir="down",frame=0,walkT;

const AudioCtx=window.AudioContext||window.webkitAudioContext;
let ac=null,bgmOn=true,bgmTimer=null,bgmStep=0;
const melody=[0,4,7,11,7,4,2,5,9,12,9,5,0,4,7,9];
const bass=[0,0,5,5,9,9,7,7];
function tone(freq,start,dur,vol,type="sine"){
  if(!ac)return;let o=ac.createOscillator(),gain=ac.createGain();
  o.type=type;o.frequency.value=freq;gain.gain.setValueAtTime(0,start);
  gain.gain.linearRampToValueAtTime(vol,start+.04);
  gain.gain.exponentialRampToValueAtTime(.0001,start+dur);
  o.connect(gain).connect(ac.destination);o.start(start);o.stop(start+dur+.05)
}
function musicTick(){
  if(!ac||!bgmOn)return;
  let now=ac.currentTime+.05, root=220, m=melody[bgmStep%melody.length], b=bass[Math.floor(bgmStep/2)%bass.length];
  tone(root*Math.pow(2,m/12),now,.75,.028,"sine");
  if(bgmStep%2===0)tone(110*Math.pow(2,b/12),now,1.45,.018,"triangle");
  if(bgmStep%4===0)tone(root*Math.pow(2,(m+7)/12),now,.9,.010,"sine");
  bgmStep++;bgmTimer=setTimeout(musicTick,520)
}
function startMusic(){try{
  if(!AudioCtx)return;
  if(!ac)ac=new AudioCtx();
  if(ac.state==="suspended")ac.resume();
  clearTimeout(bgmTimer);if(bgmOn)musicTick()
}catch(e){bgmOn=false}}
function toggleMusic(){
  bgmOn=!bgmOn;$("#musicBtn").textContent=bgmOn?"🎵 BGM":"🔇 BGM";
  if(bgmOn)startMusic();else clearTimeout(bgmTimer)
}
$("#musicBtn").addEventListener("click",toggleMusic);

const st=[["egypt","고대 이집트",20,64,"이집트 장인","npc_egypt",62,49,"🏺 황금 스카라베"],["renaissance","르네상스",39,43,"레오나르도 다빈치","npc_leo",62,50,"📜 다빈치 스케치북"],["baroque","바로크·로코코",58,38,"바로크 귀족","npc_baroque",62,49,"💎 빛의 보석"],["impression","인상주의",70,61,"클로드 모네","npc_monet",62,51,"🎨 빛의 팔레트"],["modern","팝아트·현대미술",87,55,"현대미술 큐레이터","npc_modern",62,50,"👑 ART MASTER 왕관"]];
function show(x){held.clear();$$(".screen").forEach(s=>s.classList.remove("on"));$("#"+x).classList.add("on")}$("#start").addEventListener("click",()=>{startMusic();show("choose")});$("#restart").addEventListener("click",()=>location.reload());
const goBtn=$("#go"), nickInput=$("#nick");
function enterGame(){
  nick=(nickInput?.value||"").trim()||"ART HUNTER";
  $("#pn").textContent=nick;
  show("play");
  world();
  hud();
  startMusic();
}
if(goBtn) goBtn.addEventListener("click",enterGame);
if(nickInput) nickInput.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();enterGame()}});

function hud(){$("#hp").textContent="❤️".repeat(hp)+"🖤".repeat(3-hp);$("#xp").textContent=xp;$("#bar").style.width=xp+"%";$("#lv").textContent=Math.min(5,Math.floor(xp/20)+1);$("#bag").textContent=items.length;renderEquipment()}
function hero(){
 const el=$("#heroActor"),area=$("#game"),W=area.clientWidth,H=area.clientHeight;
 pos.x=Math.max(124,Math.min(W-124,pos.x*W/100))/W*100;
 pos.y=Math.max(231,Math.min(H-29,pos.y*H/100))/H*100;
 el.style.left=(pos.x*W/100-120)+'px';el.style.top=(pos.y*H/100-225-frame*2)+'px';
 renderActor(el,dir);
}
window.addEventListener('resize',()=>{if($("#play").classList.contains('on')){hero();detect()}});
function world(){scene="world";pos={x:14,y:72};$("#bg").src="assets/bg_world.jpg";$("#layer").innerHTML="";st.forEach((s,i)=>{let d=document.createElement("button");d.disabled=i>cleared;d.addEventListener("click",()=>{if(!busy())stage(i)});d.className="mapNode"+(i>cleared?" locked":"");d.style.left=s[2]+"%";d.style.top=s[3]+"%";d.textContent=(i+1)+". "+s[1];$("#layer").appendChild(d)});$("#guideAction").textContent=cleared===5?"지윤드래곤에 도전":"다음 지역 입장";hero();detect()}
function stage(i){scene=i;let s=st[i];$("#bg").src=`assets/bg_${s[0]}.jpg`;pos={x:18,y:76};$("#layer").innerHTML=`<img class="npc" src="assets/${s[5]}.png" style="left:${s[6]}%;top:${s[7]}%"><img class="quest" src="assets/quest.png" style="left:${s[6]}%;top:${s[7]-20}%"><div class="tag" style="left:${s[6]}%;top:${s[7]+11}%">${s[4]}</div><img class="obj" src="assets/sign.png" style="left:91%;top:76%;width:85px"><div class="tag" style="left:90%;top:88%">월드맵</div>`;$("#guideAction").textContent="NPC와 대화 · 미션 시작";$(".npc").style.cursor="pointer";$(".npc").addEventListener("click",()=>talk(i));hero();detect()}
function busy(){return !!$(".dialog, .mission, .battle")}
function move(k){if(busy()||typeof k!=="string")return;let d=3.35;if(k==="ArrowLeft"||k.toLowerCase()==="a"){pos.x-=d;dir="left"}if(k==="ArrowRight"||k.toLowerCase()==="d"){pos.x+=d;dir="right"}if(k==="ArrowUp"||k.toLowerCase()==="w"){pos.y-=d;dir="up"}if(k==="ArrowDown"||k.toLowerCase()==="s"){pos.y+=d;dir="down"}pos.x=Math.max(4,Math.min(96,pos.x));pos.y=Math.max(17,Math.min(91,pos.y));frame=1-frame;hero();clearTimeout(walkT);walkT=setTimeout(()=>{frame=0;hero()},170);detect()}
function detect(){near=null;if(scene==="world"){st.forEach((s,i)=>{if(i<=cleared&&Math.hypot(pos.x-s[2],pos.y-s[3])<11)near=["stage",i]})}else{let s=st[scene];if(Math.hypot(pos.x-s[6],pos.y-s[7])<12)near=["npc",scene];if(Math.hypot(pos.x-91,pos.y-76)<11)near=["exit"]}$("#prompt").style.display=near?"block":"none";if(near)$("#prompt").textContent=near[0]==="npc"?"SPACE · NPC와 대화":near[0]==="exit"?"SPACE · 월드맵":"SPACE · 지역 입장"}
function act(){if(busy())return;if(!near)return;if(near[0]==="stage")stage(near[1]);else if(near[0]==="npc")talk(near[1]);else world()}
$("#guideAction").addEventListener("click",()=>{if(busy())return;if(scene==="world"){if(cleared===5)bossIntro();else stage(cleared)}else talk(scene)});
const held=new Set();let raf=null,last=0;
function loop(t){if(!$("#play").classList.contains("on")){raf=null;return}if(t-last>75){let k=[...held].find(k=>["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","w","a","s","d","W","A","S","D"].includes(k));if(k){move(k);last=t}}raf=requestAnimationFrame(loop)}
document.addEventListener("keydown",e=>{if(!$("#play").classList.contains("on"))return;if(busy())return;if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"," ","w","a","s","d","W","A","S","D"].includes(e.key))e.preventDefault();if(e.key===" "){if(!e.repeat)act();return}held.add(e.key);if(!raf)raf=requestAnimationFrame(loop)});
document.addEventListener("keyup",e=>held.delete(e.key));window.addEventListener("blur",()=>held.clear());
$$(".controls button[data-k]").forEach(b=>b.addEventListener("click",()=>b.dataset.k===" "?act():move(b.dataset.k)));
const talks=[["어서 오게, 아트헌터여.","이집트인은 가장 완전한 정보를 보여주기 위해 여러 시점을 조합했지.","내 문제를 풀어 보겠나?"],["반갑구나. 나는 레오나르도 다빈치야.","《모나리자》가 시간의 균열 때문에 조각나 버렸어.","그림을 복원해 주겠니?"],["바로크와 로코코의 작품이 뒤섞였습니다.","극적인 장엄함과 우아한 장식성을 구별해 주세요.","미션을 시작하죠."],["빛은 매 순간 달라진단다.","《수련》을 보며 순간의 빛과 색을 표현한 방법을 생각해 보렴.","준비됐니?"],["마지막 시대입니다.","현대미술은 일상과 대중문화, 아이디어까지 예술로 확장했죠.","마지막 미션입니다."]];
function talk(i){if(busy())return;held.clear();let n=0,s=st[i],d=document.createElement("div");d.className="dialog";d.innerHTML=`<b>${s[4]}</b><div id="dt">${talks[i][0]}</div><button id="dn" class="gold">다음 ▶</button>`;$("#game").appendChild(d);$("#dn").addEventListener("click",()=>{n++;if(n<talks[i].length)$("#dt").textContent=talks[i][n];else{d.remove();mission(i)}})}
function mission(i){let c=document.createElement("div");c.className="mission panel";c.id="mission";
if(i===0)c.innerHTML=`<h2>🏺 이집트 미션</h2><p>고대 이집트 인물 표현의 특징 3가지를 선택하세요.</p><div class="opts">${["다시점","영원성","스푸마토","정면성"].map(x=>`<button class="multi">${x}</button>`).join("")}</div><button id="check" class="gold">정답 확인</button>`;
if(i===1)c.innerHTML=`<h2>🖼️ 모나리자 퍼즐</h2><p>흩어진 《모나리자》를 원래 모습으로 완성하세요.</p><div id="puzzle" class="puzzle"></div><button id="pcheck" class="gold">완성 확인</button>`;
if(i===2)c.innerHTML=`<h2>🕯 바로크·로코코</h2><p>강한 명암, 극적인 움직임, 장엄함에 해당하는 시대는?</p><div class="opts"><button class="ans" data-ok="1">바로크</button><button class="ans">로코코</button></div>`;
if(i===3)c.innerHTML=`<h2>🌻 인상주의</h2><p>모네의 《수련》처럼 순간의 빛과 색을 표현할 때 대표적으로 활용한 방법은?</p><div class="opts"><button class="ans">점묘법</button><button class="ans">스푸마토</button><button class="ans" data-ok="1">색채 분할(색채 병치)</button><button class="ans">명암법</button></div><small>※ 점묘법은 쇠라 등의 신인상주의에서 체계적으로 사용되었습니다.</small>`;
if(i===4)c.innerHTML=`<h2>💥 현대미술 미션</h2><p>현대미술에서 예술의 재료가 될 수 없는 것은?</p><div class="opts"><button class="ans">통조림</button><button class="ans">광고 이미지</button><button class="ans">아이디어 자체</button><button class="ans" data-ok="1">정답 없음</button></div>`;$("#game").appendChild(c);
if(i===0){let sel=[];$$(".multi").forEach(b=>b.addEventListener("click",()=>{b.classList.toggle("sel");sel=$$(".multi.sel").map(x=>x.textContent)}));$("#check").addEventListener("click",()=>sel.length===3&&["다시점","영원성","정면성"].every(x=>sel.includes(x))?reward(i):wrong())}else if(i===1)puzzle(i);else $$(".ans").forEach(b=>b.addEventListener("click",()=>b.dataset.ok?reward(i):wrong()))}
function wrong(){hp--;if(hp<=0)hp=3;hud();let t=document.createElement("div");t.className="toast";t.textContent=hp===3?"💡 HP 회복! 핵심 특징을 다시 떠올려 보세요.":"MISS! ❤️ -1";$("#game").appendChild(t);setTimeout(()=>t.remove(),1500)}
function puzzle(i){let a=[4,0,7,2,8,1,5,3,6],sel=null,drag=null;function r(){let p=$("#puzzle");p.innerHTML="";a.forEach((v,j)=>{let b=document.createElement("button");b.className="tile"+(v===j?" good":"");b.draggable=true;b.style.backgroundPosition=`${(v%3)*50}% ${Math.floor(v/3)*50}%`;b.addEventListener("dragstart",()=>drag=j);b.addEventListener("dragover",e=>e.preventDefault());b.addEventListener("drop",e=>{e.preventDefault();if(drag===null)return;[a[drag],a[j]]=[a[j],a[drag]];drag=null;r()});b.addEventListener("click",()=>{if(sel===null){sel=j;b.classList.add("sel")}else{[a[sel],a[j]]=[a[j],a[sel]];sel=null;r()}});p.appendChild(b)})}r();$("#pcheck").addEventListener("click",()=>a.every((v,j)=>v===j)?reward(i):wrong())}

const equipment=[
 {name:'파라오 왕관',file:'gear_crown',desc:'이집트의 지혜를 담은 왕관. 베레모 대신 착용합니다.'},
 {name:'다빈치의 마법 붓',file:'gear_brush',desc:'정답을 맞히면 색채 마법으로 드래곤을 공격합니다.'},
 {name:'황금 망토',file:'gear_cape',desc:'다섯 시대를 잇는 용기의 망토. 보스전 체력 +1!'},
 {name:'팔레트 방패',file:'gear_shield',desc:'보스전에서 첫 오답 공격을 한 번 막아 줍니다.'},
 {name:'팝아트 오라',file:'gear_aura',desc:'다섯 장비의 힘이 모였습니다. 지윤드래곤에게 도전하세요!'}
];
function renderActor(el,facing='down',count=items.length){
 const key=facing+':'+count;
 if(el.dataset.rendered===key)return;
 el.dataset.rendered=key;el.dataset.direction=facing;el.dataset.equipment=count;
 const sprite=(count>0?'crown_':'hero_')+facing,m=SPRITE_METRICS[sprite];
 el.innerHTML=`${count>=5?'<img class="equip aura" src="assets/gear_aura.png" alt="팝아트 오라">':''}${count>=3?'<img class="equip cape" src="assets/gear_cape.png" alt="황금 망토">':''}<img class="bodySprite" src="assets/${sprite}.png" alt="${count?'파라오 왕관을 쓴 ':''}탐험가" style="left:${m.x}px;top:${m.y}px;width:${m.w}px;height:${m.h}px">${count>=2?'<img class="equip brush" src="assets/gear_brush.png" alt="마법 붓">':''}${count>=4?'<img class="equip shield" src="assets/gear_shield.png" alt="팔레트 방패">':''}`;
}
function renderEquipment(){
 const bar=$("#equipmentBar");if(!bar)return;
 bar.innerHTML=equipment.map((e,i)=>`<div class="equipment-slot ${i<items.length?'owned':''}" title="${e.name} · ${i<items.length?'획득 완료':st[i][1]+' 미션 보상'}"><img src="assets/${e.file}.png" alt=""><span>${i<items.length?'✓':'🔒'} ${e.name}</span></div>`).join('');
}
function reward(i){
 $("#mission")?.remove();held.clear();
 const gear=equipment[i],c=document.createElement('div');c.className='mission panel reward';
 c.innerHTML=`<img id="ch" src="assets/chest_closed.png" alt="보물상자"><h2>MISSION CLEAR!</h2><p>${st[i][1]}의 장비를 발견했어요.</p><button id="open" class="gold">보물상자 열기</button>`;
 $("#game").appendChild(c);
 c.querySelector('#open').addEventListener('click',()=>{
  const first=!items.includes(st[i][8]);c.querySelector('#open').disabled=true;
  if(first){items.push(st[i][8]);xp=Math.min(100,xp+20)}
  cleared=Math.max(cleared,i+1);hud();hero();
  c.innerHTML=`<div class="reward-layout"><div class="reward-preview"><div class="actor" id="rewardActor"></div></div><div class="reward-copy"><small>장비 ${items.length} / 5 · 자동 장착</small><h2>${gear.name} ${first?'획득!':'착용 중'}</h2><img class="gear-icon" src="assets/${gear.file}.png" alt="${gear.name}"><p>${gear.desc}</p><p>${first?'+20 EXP':'이미 받은 보상입니다.'} · 이전 장비도 함께 유지돼요.</p><button id="back" class="gold">${i===4?'지윤드래곤에게 도전 ▶':'다음 시대로 ▶'}</button><button id="rewardWorld">월드맵에서 장비 보기</button></div></div>`;
  renderActor(c.querySelector('#rewardActor'),'down');
  c.querySelector('#back').addEventListener('click',()=>{c.remove();if(i===4)bossIntro();else stage(i+1)});
  c.querySelector('#rewardWorld').addEventListener('click',()=>{c.remove();world()});
 },{once:true});
}
const bossQuestions=[
 {era:'고대 이집트',q:'이집트 벽화에서 얼굴은 옆모습, 눈과 어깨는 정면으로 그린 이유는?',choices:['대상의 특징을 가장 잘 보여 주기 위해','멀리 있는 사람을 작게 보이게 하려고','순간의 빛을 포착하려고','붓 자국을 숨기려고'],answer:0,explain:'여러 시점에서 본 특징을 조합해 대상을 완전하게 표현하려 했어요.',skill:'파라오의 지혜'},
 {era:'르네상스',q:'다빈치의 《모나리자》에서 윤곽을 연기처럼 부드럽게 표현한 기법은?',choices:['점묘법','프로타주','스푸마토','콜라주'],answer:2,explain:'스푸마토는 경계를 흐리게 하여 형태와 명암이 부드럽게 이어지도록 하는 기법이에요.',skill:'다빈치의 색채 마법'},
 {era:'바로크·로코코',q:'강한 명암 대비, 극적인 움직임, 장엄한 분위기가 대표적인 양식은?',choices:['로코코','바로크','팝아트','인상주의'],answer:1,explain:'바로크는 극적인 명암과 움직임이 특징이고, 로코코는 우아하고 섬세한 장식이 두드러져요.',skill:'황금빛 파동'},
 {era:'인상주의',q:'모네를 비롯한 인상주의 화가들이 특히 관심을 둔 것은?',choices:['파라오의 영원한 권력','고대 신화의 정해진 인체 규칙','광고 이미지의 반복','시시각각 변하는 빛과 색'],answer:3,explain:'인상주의는 빛에 따라 달라지는 색과 순간의 인상을 표현하려 했어요.',skill:'무지개 팔레트'},
 {era:'팝아트·현대미술',q:'광고, 만화, 대량 생산 상품 등 대중문화 이미지를 적극 활용한 미술은?',choices:['팝아트','이집트 미술','르네상스 미술','로코코'],answer:0,explain:'팝아트는 일상 속 대중문화와 소비사회의 이미지를 미술에 끌어들였어요.',skill:'팝아트 피니시'}
];
let battle=null,battleTimer=null;
function bossIntro(){
 if(busy()||items.length<5)return;held.clear();
 const c=document.createElement('div');c.className='mission panel boss-intro';
 c.innerHTML=`<div><small>FINAL QUEST</small><h2>명화의 색을 훔친<br>지윤드래곤</h2><p>“크하하! 다섯 시대의 지혜로 나를 이겨 봐!”</p><p>정답마다 드래곤 체력 −20<br>오답이면 힌트를 보고 다시 도전!<br>팔레트 방패가 첫 공격을 막아 줍니다.</p><button id="fight" class="gold">⚔️ 보스전 시작</button><button id="later">월드맵으로</button></div><img src="assets/dragon_idle.png" alt="지윤드래곤">`;
 $("#game").appendChild(c);
 c.querySelector('#fight').addEventListener('click',()=>{c.remove();startBattle()});
 c.querySelector('#later').addEventListener('click',()=>{c.remove();world()});
}
function startBattle(){
 clearTimeout(battleTimer);$(".battle")?.remove();held.clear();hp=3;hud();
 battle={hp:100,heroHP:4,shield:1,index:0,locked:false};
 const b=document.createElement('div');b.className='battle';b.setAttribute('role','region');b.setAttribute('aria-label','지윤드래곤 퀴즈 전투');
 b.innerHTML=`<div class="battle-top"><div><small>FINAL BOSS</small><strong>지윤드래곤</strong></div><div class="boss-health"><span id="bossHPText">100 / 100</span><div class="health-track"><i id="bossHPBar"></i></div></div><button id="leaveBattle">월드맵으로</button></div><div class="arena"><div class="battle-name hero-name"><span id="battleNick"></span><span id="battleHearts"></span></div><div class="battle-name dragon-name">명화의 색을 돌려줘!</div><img class="battle-aura" src="assets/gear_aura.png" alt="팝아트 오라"><img id="battleHero" src="assets/battle_hero_guard.png" alt="방패를 든 탐험가"><img id="battleDragon" src="assets/dragon_idle.png" alt="지윤드래곤"><div id="magicBolt"></div><div id="damage" aria-hidden="true"></div><div id="shieldStatus"></div></div><div class="battle-question"><small id="questionEra"></small><h3 id="bossQuestion"></h3><div id="bossChoices" class="opts"></div><p id="battleFeedback" aria-live="polite"></p><button id="battleNext" class="gold" hidden>다음 문제 ▶</button></div>`;
 $("#game").appendChild(b);$("#battleNick").textContent=nick;
 $("#leaveBattle").addEventListener('click',()=>{clearTimeout(battleTimer);battle=null;b.remove();world()});
 updateBattleHUD();askBossQuestion();
}
function updateBattleHUD(){
 $("#bossHPText").textContent=battle.hp+' / 100';$("#bossHPBar").style.width=battle.hp+'%';
 $("#battleHearts").textContent='❤️'.repeat(battle.heroHP)+'🖤'.repeat(4-battle.heroHP);
 $("#shieldStatus").textContent=battle.shield?'🛡️ 방패 보호 1회':'🛡️ 방패 보호 사용 완료';
}
function askBossQuestion(){
 const q=bossQuestions[battle.index];battle.locked=false;
 $("#questionEra").textContent=`${battle.index+1} / 5 · ${q.era}`;$("#bossQuestion").textContent=q.q;
 $("#battleHero").src='assets/battle_hero_guard.png';$("#battleDragon").src='assets/dragon_idle.png';
 $("#bossChoices").innerHTML=q.choices.map((x,i)=>`<button data-choice="${i}">${x}</button>`).join('');
 $("#battleFeedback").textContent='정답을 선택하면 자동으로 공격합니다.';$("#battleNext").hidden=true;
 $$('#bossChoices button').forEach(b=>b.addEventListener('click',()=>answerBoss(Number(b.dataset.choice))));
}
function answerBoss(choice){
 if(!battle||battle.locked)return;battle.locked=true;
 const q=bossQuestions[battle.index],correct=choice===q.answer;
 $$('#bossChoices button').forEach(b=>b.disabled=true);
 const arena=$('.arena'),heroImg=$('#battleHero'),dragonImg=$('#battleDragon');
 arena.classList.remove('cast','breath');void arena.offsetWidth;
 if(correct){
  battle.hp=Math.max(0,battle.hp-20);heroImg.src='assets/battle_hero_attack.png';arena.classList.add('cast');
  $('#damage').textContent='−20';$('#battleFeedback').textContent=`${q.skill}! ${q.explain}`;
 }else{
  const blocked=battle.shield>0;if(blocked)battle.shield--;else battle.heroHP--;
  dragonImg.src='assets/dragon_attack.png';heroImg.src='assets/battle_hero_guard.png';arena.classList.add('breath');
  $('#damage').textContent=blocked?'BLOCK!':'−1 ❤️';
  $('#battleFeedback').textContent=(blocked?'팔레트 방패가 막았어요! ':'물감 브레스에 맞았어요. ')+q.explain;
 }
 updateBattleHUD();
 battleTimer=setTimeout(()=>{
  if(!battle)return;arena.classList.remove('cast','breath');
  if(battle.hp===0){winBattle();return}
  if(battle.heroHP===0){loseBattle();return}
  const next=$('#battleNext');next.hidden=false;next.textContent=correct?'다음 문제 ▶':'힌트를 보고 다시 도전';
  next.onclick=()=>{if(correct)battle.index++;askBossQuestion()};next.focus();
 },1000);
}
function loseBattle(){
 $('#battleFeedback').textContent='잠깐 쉬어 가요! 모은 장비는 그대로예요. 체력을 채워 다시 도전해 보세요.';
 const next=$('#battleNext');next.hidden=false;next.textContent='❤️ 체력 회복 · 보스전 재도전';next.onclick=startBattle;next.focus();
}
function winBattle(){
 $('#battleHero').src='assets/battle_hero_victory.png';$('#battleDragon').src='assets/dragon_defeat.png';
 $('.arena').classList.add('won');$('#questionEra').textContent='VICTORY · 다섯 시대의 힘';
 $('#bossQuestion').textContent='명화의 색을 되찾았다!';$('#bossChoices').innerHTML='';
 $('#battleFeedback').textContent='지윤드래곤: “너의 미술 지식에 졌다! 색을 모두 돌려줄게!”';
 const next=$('#battleNext');next.hidden=false;next.textContent='🏆 ART MASTER 인증 보기';
 next.onclick=()=>{clearTimeout(battleTimer);$('.battle').remove();battle=null;$('#final').textContent=nick+' 탐험가 · 다섯 장비 획득 · 지윤드래곤 격파';show('end')};next.focus();
}
// Warm up images used in movement and battle so direction switches do not flash.
['crown_down','crown_up','crown_left','crown_right','battle_hero_attack','battle_hero_guard','battle_hero_victory','dragon_idle','dragon_attack','dragon_defeat',...equipment.map(e=>e.file)].forEach(name=>{const im=new Image();im.src='assets/'+name+'.png'});

})();
