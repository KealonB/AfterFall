/* AFTERFALL — dependency-free game engine. Works on HTTPS GitHub Pages and offline when cached. */
(() => {
'use strict';
const D = window.AF_DATA;
const ROOT = document.getElementById('app');
const STORAGE = 'afterfall-last-frequency-save-v1';
const $ = (id) => document.getElementById(id);
const r = (n) => Math.floor(Math.random() * n);
const chance = (n) => Math.random() < n;
const clamp = (v,min=0,max=100) => Math.max(min,Math.min(max,v));
const pos = (x,y) => `${x},${y}`;
const text = (t) => String(t ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = (n) => Number(n||0).toLocaleString();
const icon = (id) => D.items[id]?.icon||'◈';
const label = (id) => D.items[id]?.name||id;
const qtyText = (obj) => Object.entries(obj).map(([id,n])=>`${icon(id)} ${n} ${label(id)}`).join(' · ');
const fHour = (n) => `${String(n).padStart(2,'0')}:00`;
function locationAt(x,y){return D.landmarks.find(v=>v.x===x&&v.y===y)||null;}
function tileType(x,y){
  if ((x===5&&y===5)||(x===6&&y===5)) return 'road';
  let h=((x*73856093)^(y*19349663)^(x*y*83492791))>>>0;
  return ['road','forest','suburb','farmland','hills','industrial','marsh','forest','road','farmland','suburb'][h%11];
}
function randomFrom(a){return a[r(a.length)];}
function nameOf(p){return (p?.name||'Wanderer').split(' ')[0];}
let s = null;
let pre = {profession:'scout',difficulty:'survivor'};
let expandedLog = false;
let activeSettlementId = null;
let toastTimer = null;
let cachedSave = null;
const navTabs = [['explore','🧭','Explore'],['crew','👥','Crew'],['settlements','🏘️','Settlements'],['inventory','🎒','Inventory'],['journal','📜','Journal'],['radio','📻','Radio']];
function fresh(name,profession,difficulty){
  const bg=D.professions[profession];
  const inv={credits:65,...bg.gear};
  let hp=profession==='veteran'?115:100;
  const world={day:1,hour:8,weather:'Clear',discovered:{},visited:{},searched:{},talked:{},camped:{}};
  const state={version:1,player:{name,profession,difficulty,x:5,y:5,level:1,xp:0,statPoints:0,hp,maxHp:hp,hunger:88,thirst:90,energy:92,infection:0,stats:{...bg.stats},inv,weapon:inv.pistol?'pistol':inv.wrench?'wrench':inv.knife?'knife':null,armor:null,kills:0,turns:0},world,tab:'explore',reputation:{union:5,verdant:0,choir:0,vultures:-35},companions:{},followers:[],settlements:[],quests:[],encounter:null,combat:null,route:[],story:{relays:[],ending:null,choices:[],pacts:[],heard:false},journal:[],ui:{campTarget:null,filter:'all',theme:'amber',tips:true},stats:{steps:0,scavenges:0,daysSurvived:1,trade:0,battles:0,assists:0},nextId:1,dead:false};
  s=state;
  reveal(5,5,2);
  for(const n of [pos(5,5)]) s.world.visited[n]=1;
  addJournal('The Beginning',`Day 1. ${name} woke beneath a collapsing roof at Crossroads Shelter. A solar radio repeated a coded warning: "THREE LIGHTS. ONE VOICE. FIND STATION ZERO."`,`story`);
  addJournal('Find the source','Northwatch Relay (8,2), Reservoir Relay (2,5) and Skyglass Observatory (5,9) hold the keys to the Last Frequency. The whole region is open to you.','quest');
  return s;
}
function addJournal(title,body,type='event'){
  if(!s)return;
  s.journal.unshift({id:s.nextId++,day:s.world.day,hour:s.world.hour,title,body,type});
  if(s.journal.length>160)s.journal.length=160;
}
function log(title,body,type='event'){addJournal(title,body,type);notify(title);}
function notify(message){
  const n=$('toast'); if(!n) return;
  n.textContent=message; n.classList.add('visible');
  if(toastTimer)clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>n.classList.remove('visible'),2600);
}
function show(){ if(!s) renderStart(); else renderGame(); }
function save(){if(!s)return;try{localStorage.setItem(STORAGE,JSON.stringify(s));}catch(e){notify('Browser storage blocked; export a save file.');}}
function tryLoad(){try{const raw=localStorage.getItem(STORAGE);return raw?JSON.parse(raw):null;}catch(e){return null;}}
function isSave(x){return x&&x.version===1&&x.player&&x.world&&Array.isArray(x.settlements)&&Array.isArray(x.journal)&&Array.isArray(x.followers);}
function load(x){if(!isSave(x))throw new Error('This save file is incompatible.');s=x;s.route||=[];s.ui||={campTarget:null,filter:'all',theme:'amber',tips:true};s.stats||={steps:0,scavenges:0,daysSurvived:1,trade:0,battles:0,assists:0};s.companions||={};s.quests||=[];s.story.choices||=[];s.story.pacts||=[];s.world.camped||={};if(s.player.hp<=0)s.dead=true;show();save();}
function mutate(fn){try{fn();save();show();}catch(e){console.error(e);notify(`Action error: ${e.message}`);}}
function bag(id){return s.player.inv[id]||0;}
function has(cost){return Object.entries(cost).every(([id,n])=>bag(id)>=n);}
function pay(cost){if(!has(cost))return false;for(const [id,n] of Object.entries(cost))addItem(id,-n);return true;}
function addItem(id,n){s.player.inv[id]=Math.max(0,bag(id)+n); if(n>0)questEvent('collect',{item:id,qty:n});}
function gainXp(n){const p=s.player;p.xp+=n;let steps=0;while(p.xp>=p.level*85){p.xp-=p.level*85;p.level++;p.statPoints+=1;p.maxHp+=6;p.hp=clamp(p.hp+14,0,p.maxHp);steps++;}if(steps) log('Level up!',`Level ${p.level}. You gained ${steps} attribute point${steps>1?'s':''}. Open Crew to improve your abilities.`,'achievement');}
function rep(f,n){s.reputation[f]=clamp((s.reputation[f]||0)+n,-100,100);}
function burden(){return Object.entries(s.player.inv).reduce((sum,[id,q])=>sum+q*(D.items[id]?.weight||0),0);}
function capacity(){return 65+(bag('backpack')?35:0)+s.player.stats.grit*4;}
function danger(){const l=currentLandmark(),t=tileType(s.player.x,s.player.y);return l?.kind==='town'||l?.kind==='shelter'?1:D.terrain[t].danger;}
function currentLandmark(){return locationAt(s.player.x,s.player.y);}
function atTown(){return currentLandmark()?.kind==='town';}
function nearbyCamp(){return s.settlements.find(c=>c.x===s.player.x&&c.y===s.player.y);}
function recruitHere(){return D.companions.filter(c=>c.place===currentLandmark()?.id&&!s.companions[c.id]);}
function partyMembers(){return s.followers.map(id=>D.companions.find(c=>c.id===id)).filter(Boolean);}
function rosterCount(){return Object.keys(s.companions).length;}
function reveal(x,y,rad=1){for(let xx=Math.max(0,x-rad);xx<=Math.min(D.width-1,x+rad);xx++)for(let yy=Math.max(0,y-rad);yy<=Math.min(D.height-1,y+rad);yy++)s.world.discovered[pos(xx,yy)]=true;}
function time(hours,noise=0){
 const w=s.world,p=s.player,d=D.difficulties[p.difficulty];
 for(let i=0;i<hours;i++){
   w.hour++;
   p.hunger=clamp(p.hunger-(1.35+noise*.4)*d.needs);
   p.thirst=clamp(p.thirst-(1.7+noise*.65)*d.needs);
   p.energy=clamp(p.energy-(.55+noise*1.1));
   if(p.hunger===0)p.hp=Math.max(0,p.hp-1.6*d.needs);
   if(p.thirst===0)p.hp=Math.max(0,p.hp-3*d.needs);
   if(p.energy===0)p.hp=Math.max(0,p.hp-0.7);
   if(p.infection>55 && chance(.12))p.hp=Math.max(0,p.hp-1.5);
   if(w.hour>=24){w.hour=0;w.day++;newDay();}
 }
 p.hp=Math.round(p.hp*10)/10;
 if(p.hp<=0){p.hp=0;s.dead=true;s.route=[];s.encounter=null;s.combat=null;addJournal('Your story ends',`You survived ${w.day} day${w.day===1?'':'s'}. The wasteland remembers.`,`ending`);}
}
function newDay(){
 const weathers=['Clear','Overcast','Dust Storm','Drizzle','Heatwave','Cold Wind','Clear','Overcast'];
 s.world.weather=randomFrom(weathers);
 for(const c of s.settlements){
   const b=c.buildings;
   const farmer=Object.entries(s.companions).filter(([id,v])=>v.campId===c.id && D.companions.find(a=>a.id===id)?.skill==='farmer').length;
   c.stock.food=(c.stock.food||0)+ (b.garden||0)*3+farmer*2;
   c.stock.water=(c.stock.water||0)+(b.well||0)*3;
   c.stock.scrap=(c.stock.scrap||0)+(b.workshop||0)*2;
   if(c.policy==='harvest')c.stock.food+=2;
   if(c.policy==='trade')c.stock.scrap+=2;
   if(c.policy==='trade'&&s.story.pacts?.includes('union'))c.stock.scrap+=1;
   if((b.workshop||0)>1&&chance(.35))c.stock.circuit=(c.stock.circuit||0)+1;
   const need=Math.ceil(c.population/3);
   for(const id of ['food','water']){if((c.stock[id]||0)>=need)c.stock[id]-=need;else{c.stock[id]=0;c.morale-=5;}}
   c.morale=clamp(c.morale+(b.garden?1:0)+(b.clinic?1:0)+(b.antenna?1:0)+(c.policy==='open'?2:0)-(c.policy==='fortress'?1:0)-((c.population>2+(b.barracks||0)*5)?3:0),0,100);
   if(s.story.pacts?.includes('verdant'))c.stock.food+=1;
   if(s.world.day>=c.nextRaid){
     c.nextRaid=s.world.day+5+r(4);
     if(chance(.65*D.difficulties[s.player.difficulty].raid*(c.policy==='open'?1.2:c.policy==='fortress'?.7:1))){
       const power=campDefense(c),damage=Math.max(0,12+r(18)-power);
       c.morale=clamp(c.morale-damage,0,100);
       c.stock.scrap=Math.max(0,(c.stock.scrap||0)-Math.ceil(damage/3));
       addJournal('Raid at '+c.name,damage?`Raiders struck while you were away. Defenses held, but morale fell by ${damage}.`:'Raiders tested the perimeter but your defenses held without losses.','settlement');
       if(damage>=22&&c.population>1)c.population--;
     }
   }
 }
 s.stats.daysSurvived=s.world.day;
 if(s.world.day%7===0)addJournal('Another week',`Day ${s.world.day}. The roads change; settlements rise or fall; old grudges endure.`,'world');
}
function campDefense(c){
 const g=Object.entries(s.companions).filter(([id,v])=>v.campId===c.id&&['guard','fighter'].includes(D.companions.find(a=>a.id===id)?.skill)).length;
 return (c.buildings.watch||0)*5+(c.buildings.walls||0)*8+g*5+Math.floor(c.population/2)+(c.policy==='fortress'?7:0)+(s.story.pacts?.includes('choir')?3:0);
}
function useItem(id){
 if(!bag(id))return notify('None in your pack.');
 if(s.combat&&id!=='medkit')return notify('Only medkits can be used during combat.');
 let effect='';
 const p=s.player;
 if(id==='food'){if(p.hunger>=98)return notify('You are not hungry.');p.hunger=clamp(p.hunger+32);effect='A small meal keeps the darkness away.';}
 else if(id==='water'){if(p.thirst>=98)return notify('You are not thirsty.');p.thirst=clamp(p.thirst+38);effect='The water tastes almost like hope.';}
 else if(id==='medkit'){if(p.hp>=p.maxHp&&p.infection===0)return notify('You are already healthy.');const heal=p.profession==='medic'?65:46;p.hp=clamp(p.hp+heal,0,p.maxHp);p.infection=clamp(p.infection-5);effect=`Applied a field dressing. Restored up to ${heal} health.`;}
 else if(id==='medicine'){if(p.infection<=0)return notify('No infection to treat.');p.infection=clamp(p.infection-(p.profession==='medic'?65:42));effect='The fever finally begins to break.';}
 else if(D.items[id]?.type==='weapon'){p.weapon=id;notify('Equipped '+label(id));return;}
 else if(D.items[id]?.type==='armor'){p.armor=id;notify('Equipped '+label(id));return;}
 else{return notify('Use this material in Crafting or Construction.');}
 addItem(id,-1);addJournal('Supplies used',effect,'survival');
 if(s.combat){endCombatRound('You treat your wounds under fire.');}
}
function modifyHp(v){s.player.hp=clamp(s.player.hp+v,0,s.player.maxHp);if(s.player.hp<=0){s.dead=true;s.encounter=null;s.combat=null;s.route=[];addJournal('Silence',`Day ${s.world.day}. ${s.player.name}'s journey ended.`, 'ending');}}
function movementCost(x,y){const t=D.terrain[tileType(x,y)],p=s.player;let cost=t.cost;
 if(p.profession==='scout')cost=Math.max(1,cost-1);
 if(burden()>capacity())cost+=1;
 if(s.world.weather==='Dust Storm')cost+=1;
 return cost;
}
function move(x,y){
 if(s.encounter||s.combat||s.dead)return;
 if(x<0||x>=D.width||y<0||y>=D.height)return notify('Nothing but wilderness beyond the chart.');
 if(Math.abs(x-s.player.x)+Math.abs(y-s.player.y)!==1)return notify('Choose an adjacent tile or plot a route.');
 let p=s.player;
 const oldX=p.x,oldY=p.y;
 time(movementCost(x,y),1);
 if(s.dead)return;
 p.x=x;p.y=y;s.stats.steps++;p.turns++;
 const key=pos(x,y),first=!s.world.visited[key];
 s.world.visited[key]=(s.world.visited[key]||0)+1;
 reveal(x,y,p.profession==='scout'?2:1);
 const loc=currentLandmark();
 if(first){gainXp(loc?26:7);questEvent('discover',{x,y});if(loc){addJournal('Discovered: '+loc.name,loc.lore,'discovery');}}
 if(loc?.kind==='town'&&s.reputation[loc.faction]<-35){
   startChoice('Closed Gates',`The guards of ${loc.name} recognize you. Their faction considers you hostile.`,[
    {label:'Offer 35 scrip as restitution',hint:'A costly truce',action:'gatebribe',faction:loc.faction},
    {label:'Leave before they fire',hint:'Retreat to the outskirts',action:'gateleave'}]);
   s.encounter.from=[oldX,oldY];
   return;
 }
 let eventChance=(loc?.kind==='town'||loc?.kind==='shelter') ? .06 : Math.min(.38,.14+danger()*.045);
 if(chance(eventChance))randomEncounter('travel');
}
function plotRoute(x,y){
 if(s.dead||s.encounter||s.combat)return;
 if(!s.world.discovered[pos(x,y)])return notify('Scout the region before plotting a route.');
 if(x===s.player.x&&y===s.player.y)return notify('You are already there.');
 const start=pos(s.player.x,s.player.y),goal=pos(x,y),q=[[s.player.x,s.player.y]],prev={[start]:null};
 while(q.length){let [cx,cy]=q.shift();for(let [dx,dy] of [[0,-1],[1,0],[0,1],[-1,0]]){
   let nx=cx+dx,ny=cy+dy,k=pos(nx,ny);
   if(nx<0||ny<0||nx>=D.width||ny>=D.height||prev[k]!==undefined||!s.world.discovered[k])continue;
   prev[k]=pos(cx,cy);q.push([nx,ny]);
 }}
 if(prev[goal]===undefined)return notify('No revealed route. Scout or explore toward that destination.');
 let path=[],at=goal;while(at!==start){const [px,py]=at.split(',').map(Number);path.unshift([px,py]);at=prev[at];}
 s.route=path;
 continueRoute();
}
function continueRoute(){
 if(s.encounter||s.combat||s.dead)return;
 let count=0;
 while(s.route.length&&count++<130){const [x,y]=s.route.shift();move(x,y);if(s.encounter||s.combat||s.dead)break;}
 if(!s.route.length&&!s.encounter&&!s.combat)notify('Destination reached.');
}
function scavenge(){
 if(s.dead||s.encounter||s.combat)return;
 let p=s.player,key=pos(p.x,p.y),already=s.world.searched[key]||{day:0,count:0};
 if(already.day!==s.world.day)already={day:s.world.day,count:0};
 if(already.count>=3)return notify('Nothing more of value here today.');
 already.count++;s.world.searched[key]=already;
 time(3,1);if(s.dead)return;
 s.stats.scavenges++;
 const t=D.terrain[tileType(p.x,p.y)],difficulty=D.difficulties[p.difficulty];
 let n=Math.max(1,Math.round((2+r(4))*difficulty.loot*(already.count===3?.75:1)));
 let found={};for(let i=0;i<n;i++){let id=randomFrom(t.scavenge);found[id]=(found[id]||0)+1;}
 if(chance(.13))found.credits=(found.credits||0)+8+r(18);
 if(chance(.045+danger()*.014)){let bonus=randomFrom(['circuit','medicine','fuel','medkit','ammo']);found[bonus]=(found[bonus]||0)+1;}
 for(const [id,q] of Object.entries(found))addItem(id,q);
 gainXp(5);
 addJournal('Scavenged '+(currentLandmark()?.name||t.name),`You recovered ${qtyText(found)} from the wreckage.`,'scavenge');
 if(chance(.16+.025*danger()))randomEncounter('scavenge');
}
function scout(){
 if(s.encounter||s.combat||s.dead)return;
 time(2,0);if(s.dead)return;
 reveal(s.player.x,s.player.y,s.player.profession==='scout'||partyMembers().some(c=>c.skill==='scout')?3:2);
 gainXp(4);addJournal('Scouted the horizon','New ground marked on your map. Movement routes are now available through revealed tiles.','explore');
 if(chance(.19))randomEncounter('scout');
}
function forage(){
 if(s.encounter||s.combat||s.dead)return;
 time(3,.35);if(s.dead)return;
 const t=tileType(s.player.x,s.player.y),natural=['forest','farmland','marsh','hills'].includes(t);
 let found=natural?{food:1+r(2),water:1+r(2),herbs:1+r(2)}:{food:1,water:chance(.5)?1:0};
 for(const [id,q] of Object.entries(found))if(q)addItem(id,q);
 gainXp(3);addJournal('Foraging',`You gathered ${qtyText(found)}.`,'survival');
 if(chance(natural?.12:.24))randomEncounter('forage');
}
function rest(){
 if(s.encounter||s.combat||s.dead)return;
 const safe=Boolean(atTown()||nearbyCamp()||currentLandmark()?.kind==='shelter');
 time(7);if(s.dead)return;
 s.player.energy=clamp(s.player.energy+(safe?80:55));
 modifyHp(safe?20+(nearbyCamp()?.buildings.clinic||0)*10:8);
 if(partyMembers().some(c=>c.skill==='medic'))modifyHp(3);
 if(!safe&&chance(.13+.04*danger())){addJournal('Interrupted rest','Footsteps circle your makeshift sleeping place.','combat');startCombat(randomFrom(['infected','bandits']));return;}
 addJournal(safe?'A night of shelter':'A restless night',safe?'You slept behind sturdy walls and woke feeling restored.':'You slept with one ear open and a hand on your weapon.','survival');
}
function craft(id){
 if(s.encounter||s.combat||s.dead)return;
 const recipe=D.recipes.find(a=>a.id===id);if(!recipe)return;
 let cost={...recipe.needs};if(s.player.profession==='mechanic'&&cost.scrap)cost.scrap=Math.max(1,cost.scrap-1);
 if(!pay(cost))return notify('You need more materials.');
 time(recipe.hours);if(s.dead)return;
 addItem(id,recipe.qty);gainXp(9);log('Crafted '+label(id),`Made ${recipe.qty} × ${label(id)} with improvised equipment.`,'craft');
}
function barter(mode,id){
 const loc=currentLandmark();if(!loc||loc.kind!=='town'||s.reputation[loc.faction]<-35)return;
 const item=D.items[id];if(!item||id==='credits')return;
 const base=item.value;
 const bonus=s.reputation[loc.faction]/300+(s.player.profession==='envoy'?.15:0)+partyMembers().some(c=>c.skill==='trader')*.08;
 const price=mode==='buy'?Math.max(1,Math.ceil(base*(1.2-bonus))):Math.max(1,Math.floor(base*(.52+bonus)));
 if(mode==='buy'){if(!pay({credits:price}))return notify('Not enough trade scrip.');addItem(id,1);}
 else{if(!pay({[id]:1}))return notify('You do not have that item.');addItem('credits',price);}
 s.stats.trade++;if(s.stats.trade%5===0)rep(loc.faction,1);
 addJournal('Traded in '+loc.name,`${mode==='buy'?'Bought':'Sold'} ${label(id)} for ${price} scrip.`,'trade');
}
function priceFor(id,mode){const l=currentLandmark();const bonus=(s.reputation[l?.faction]||0)/300+(s.player.profession==='envoy'?.15:0)+(partyMembers().some(c=>c.skill==='trader')?.08:0);return mode==='buy'?Math.max(1,Math.ceil(D.items[id].value*(1.2-bonus))):Math.max(1,Math.floor(D.items[id].value*(.52+bonus)));}
function startChoice(title,body,choices,kind='event'){
 s.encounter={type:'choice',title,body,choices,kind};
}
function startCombat(kind='infected',count){
 const pools={infected:[['Shambler',28,7,0],['Rotted Runner',22,10,0],['Howler',38,9,1]],bandits:[['Road Bandit',36,11,1],['Vulture Scout',30,12,1],['Vulture Bruiser',52,13,2]],wildlife:[['Feral Hound',28,10,0],['Ash Wolf',35,12,1],['Starving Bear',65,17,2]],elite:[['Vulture Captain',65,16,3],['Raider Enforcer',59,16,2],['Vulture Scout',30,12,1]]};
 const arr=pools[kind]||pools.infected,n=count||Math.min(3,1+r(danger()>=4?3:2));
 const mult=D.difficulties[s.player.difficulty].combat;
 const foes=Array.from({length:n},()=>{const a=randomFrom(arr);return{id:s.nextId++,name:a[0],hp:Math.round(a[1]*mult),maxHp:Math.round(a[1]*mult),damage:Math.round(a[2]*mult),armor:a[3]};});
 s.combat={kind,foes,round:1,guard:false,history:['The threat closes in.']};s.encounter=null;
 addJournal('Danger!','Hostiles approach: '+foes.map(a=>a.name).join(', ')+'.','combat');
}
function weaponDamage(){const p=s.player,id=p.weapon||'knife',wp=D.items[id]||D.items.knife;
 if(wp.ammo&&bag('ammo')<wp.ammo)return Math.max(4,5+p.stats.grit);
 return wp.damage+Math.floor(p.stats.grit*1.8)+(p.profession==='veteran'?4:0)+p.level;
}
function combatAction(action,target=0){
 const c=s.combat;if(!c||s.dead)return;
 const p=s.player,foe=c.foes[Math.max(0,Math.min(c.foes.length-1,target))]||c.foes[0];
 let narrative='';c.guard=false;
 if(action==='retreat'){
   const odds=clamp(0.38+p.stats.wits*.065+(p.profession==='scout'?.2:0)-(.06*(c.foes.length-1)),0.15,.92);
   time(1,1);if(chance(odds)){s.combat=null;log('You escaped','You slip away while the enemy is distracted.','combat');return;}
   narrative='You tried to retreat, but they cut you off.';
 }else if(action==='guard'){c.guard=true;p.energy=clamp(p.energy+4);narrative='You brace for the next attack.';}
 else if(action==='strike'||action==='aim'){
   const id=p.weapon||'knife',wp=D.items[id]||D.items.knife;
   let ranged=wp.ammo&&bag('ammo')>=wp.ammo;
   const base=weaponDamage();
   if(ranged)addItem('ammo',-wp.ammo);
   const accuracy=(action==='aim'?.78:.94)+(p.stats.wits*.007);
   if(chance(accuracy)){
     const damage=Math.max(1,Math.round(base*(action==='aim'?1.6:1)*(0.84+Math.random()*.4))-foe.armor);
     foe.hp=Math.max(0,foe.hp-damage);narrative=`You hit ${foe.name} for ${damage} damage${ranged?' (shots fired)':''}.`;
   }else narrative=`Your attack misses ${foe.name}.`;
   p.energy=clamp(p.energy-(action==='aim'?7:3));
 }else if(action==='heal'){
   if(!bag('medkit'))return notify('No medkits left.');
   addItem('medkit',-1);modifyHp(p.profession==='medic'?65:46);narrative='You desperately patch your wounds.';
 }
 c.foes=c.foes.filter(f=>f.hp>0);
 if(!c.foes.length){winBattle(c,narrative);return;}
 endCombatRound(narrative);
}
function endCombatRound(narrative){
 const c=s.combat;if(!c)return;
 let lines=[narrative];
 for(const comp of partyMembers()){
   const info=s.companions[comp.id];if(!info||info.hp<=0)continue;
   const foe=c.foes[0];if(!foe)break;
   const hit=Math.max(1,Math.floor(comp.attack*(.8+Math.random()*.6)));
   foe.hp=Math.max(0,foe.hp-hit);
   lines.push(`${comp.name} hits ${foe.name} for ${hit}.`);
   c.foes=c.foes.filter(e=>e.hp>0);
 }
 if(!c.foes.length){winBattle(c,lines.join(' '));return;}
 for(const foe of c.foes){
   const alive=s.followers.filter(id=>s.companions[id]?.hp>0);
   if(alive.length&&chance(.28)){
     const id=randomFrom(alive),record=s.companions[id],dmg=Math.max(1,Math.round(foe.damage*(.7+Math.random()*.4))-1);
     record.hp=Math.max(0,record.hp-dmg);lines.push(`${foe.name} wounds ${D.companions.find(o=>o.id===id).name} for ${dmg}.`);
     if(record.hp===0){s.followers=s.followers.filter(a=>a!==id);record.status='recovering';lines.push('Your companion is down and must recover at a safe location.');}
   } else {
     let armor=D.items[s.player.armor]?.armor||0;
     const dmg=Math.max(1,Math.round(foe.damage*(.85+Math.random()*.3))-armor-(c.guard?7:0));
     modifyHp(-dmg);lines.push(`${foe.name} strikes you for ${dmg}.`);
     if(s.dead)break;
   }
 }
 if(!s.dead){c.round++;c.history=lines.concat(c.history).slice(0,11);time(1,.5);}
}
function winBattle(c,narrative){
 s.combat=null;s.stats.battles++;
 const kills=c.foes.length||1;
 // Foes were filtered out; reward by original encounter class and round count.
 let reward={credits:8+r(20),scrap:1+r(3)};
 if(c.kind==='bandits'||c.kind==='elite'){reward.ammo=2+r(5);rep('vultures',-2);questEvent('kill',{kind:'bandits',qty:1});}
 if(c.kind==='infected'&&chance(.3))reward.medicine=1;
 if(c.kind==='wildlife')reward.food=2+r(3);
 for(const [id,q] of Object.entries(reward))addItem(id,q);
 s.player.kills+=1+r(2);
 gainXp(c.kind==='elite'?48:23);
 addJournal('You survived',`${narrative} The ground falls quiet. Recovered ${qtyText(reward)}.`,'combat');
}
function companionRecruit(id){
 const c=D.companions.find(a=>a.id===id);if(!c||s.companions[id]||currentLandmark()?.id!==c.place)return;
 let cost={...c.cost};
 if(id==='gideon'&&s.player.stats.heart>=4)cost={};
 if(id==='rooks'&&s.player.kills>=2)cost={};
 if(!pay(cost))return notify(`Recruitment needs: ${qtyText(cost)}.`);
 s.companions[id]={status:'reserve',hp:c.maxHp,trust:52,campId:null};
 if(s.followers.length<2){s.followers.push(id);s.companions[id].status='following';}
 gainXp(30);log(`${c.name} joined you`,`${c.name}, ${c.role}, agreed to travel with you. ${c.trait}`,'companion');
}
function healCompanion(id){const v=s.companions[id],c=D.companions.find(x=>x.id===id);if(!v||!c)return;
 if(!bag('medkit'))return notify('You need a medkit.');
 addItem('medkit',-1);v.hp=clamp(v.hp+48,0,c.maxHp);if(v.hp>0&&v.status==='recovering')v.status='reserve';
 log('Care for '+c.name,'Your companion recovered after treatment.','companion');
}
function setCompanionStatus(id,mode,siteId){
 const v=s.companions[id];if(!v||v.hp<=0)return;
 if(mode==='follow'){if(s.followers.includes(id))return;if(s.followers.length>=2)return notify('Party full. Only two companions can travel with you.');
 if(v.campId){const site=s.settlements.find(c=>c.id===v.campId);if(!site||site.x!==s.player.x||site.y!==s.player.y)return notify('Travel to the assigned settlement to regroup.');}
 s.followers.push(id);v.status='following';v.campId=null;
 }else if(mode==='reserve'){s.followers=s.followers.filter(a=>a!==id);v.status='reserve';v.campId=null;}
 else if(mode==='assign'){
   const site=s.settlements.find(c=>c.id===siteId);if(!site||site.x!==s.player.x||site.y!==s.player.y)return notify('You must visit the settlement to assign a companion.');
   s.followers=s.followers.filter(a=>a!==id);v.status='camp';v.campId=site.id;
 }
 notify('Companion assignment updated.');
}
function beginSettlement(){
 if(s.dead||s.encounter||s.combat||nearbyCamp()||atTown())return;
 if(s.settlements.length>=4)return notify('Your network has reached its limit of four settlements.');
 const cost={wood:7,scrap:10,food:2,water:2};
 if(!has(cost))return notify('A new outpost needs '+qtyText(cost));
 const input=$('settlement-name');const name=String(input?.value||'Outpost '+(s.settlements.length+1)).trim().slice(0,28);
 pay(cost);
 const c={id:s.nextId++,name:name||'New Outpost',x:s.player.x,y:s.player.y,population:2,morale:72,buildings:{},policy:'balanced',stock:{food:5,water:6,scrap:1},nextRaid:s.world.day+5+r(3)};
 s.settlements.push(c);activeSettlementId=c.id;
 gainXp(50);log('Founded '+c.name,`Two survivors have agreed to begin again here. The first campfire glows in the ruins.`,'settlement');
}
function upgradeBuilding(siteId,building){
 const c=s.settlements.find(a=>a.id===siteId),b=D.buildings[building];
 if(!c||!b||c.x!==s.player.x||c.y!==s.player.y)return notify('Travel to that settlement to build.');
 const lv=c.buildings[building]||0;if(lv>=3)return notify('This building is fully upgraded.');
 let cost={};for(const [id,n] of Object.entries(b.base))cost[id]=n*(lv+1);
 if(s.player.profession==='mechanic'&&cost.scrap)cost.scrap=Math.max(1,cost.scrap-2);
 if(Object.entries(s.companions).some(([id,v])=>v.campId===siteId&&D.companions.find(a=>a.id===id)?.skill==='engineer')&&cost.scrap)cost.scrap=Math.max(1,cost.scrap-2);
 if(!pay(cost))return notify('Construction requires '+qtyText(cost));
 time(5);if(s.dead)return;
 c.buildings[building]=lv+1;c.morale=clamp(c.morale+3);gainXp(15);
 log('Built '+b.name,`${c.name} now has a level ${lv+1} ${b.name}. ${b.effect}.`,'settlement');
}
function collectStock(id,item){
 const c=s.settlements.find(a=>a.id===id);if(!c||c.x!==s.player.x||c.y!==s.player.y)return;
 const q=Math.min(c.stock[item]||0,20);if(!q)return notify('Storage is empty.');
 c.stock[item]-=q;addItem(item,q);notify(`Claimed ${q} ${label(item)}.`);
}
function depositStock(id,item){
 const c=s.settlements.find(a=>a.id===id);if(!c||c.x!==s.player.x||c.y!==s.player.y)return;
 const q=Math.min(bag(item),5);if(!q)return notify('Nothing to deposit.');
 addItem(item,-q);c.stock[item]=(c.stock[item]||0)+q;notify(`Deposited ${q} ${label(item)}.`);
}
function campPolicy(id,policy){
 const c=s.settlements.find(a=>a.id===id);
 if(!c||c.x!==s.player.x||c.y!==s.player.y)return notify('Visit this outpost to change its laws.');
 if(!['balanced','open','fortress','harvest','trade'].includes(policy)||c.policy===policy)return;
 c.policy=policy;c.morale=clamp(c.morale-2);
 log('New policy at '+c.name,`The council adopted the ${policy} policy. There will be consequences for how people live here.`,'settlement');
}
function giveFactionAid(){
 const l=currentLandmark();if(!l||l.kind!=='town')return;
 const cost={food:3,water:3};if(!pay(cost))return notify('You need 3 rations and 3 clean water.');
 rep(l.faction,10);gainXp(15);
 log('Mutual aid in '+l.name,`You supplied the community and improved your standing with ${D.factions[l.faction].name}.`,'faction');
}
function pledgeAlliance(){
 const l=currentLandmark();if(!l||l.kind!=='town')return;
 const faction=l.faction;s.story.pacts||=[];
 if(s.story.pacts.includes(faction))return notify('You already have an alliance.');
 if(s.reputation[faction]<45)return notify('An alliance requires +45 reputation.');
 if(!pay({credits:90}))return notify('Supporting a permanent embassy requires 90 scrip.');
 s.story.pacts.push(faction);rep(faction,15);gainXp(90);
 log('Alliance: '+D.factions[faction].name,`A signed mutual-aid pact connects your communities. Its benefits extend to every settlement you operate.`,'story');
}
function welcomeSurvivors(id){
 const c=s.settlements.find(a=>a.id===id);if(!c||c.x!==s.player.x||c.y!==s.player.y)return;
 const capacity=2+(c.buildings.barracks||0)*5;if(c.population>=capacity)return notify('Build barracks to house more people.');
 const cost={food:3,water:3};if(!pay(cost))return notify('Welcoming people requires food and water.');
 time(4);c.population++;c.morale=clamp(c.morale+5);gainXp(10);log('A new resident',`A weary traveler found a home in ${c.name}. Population is now ${c.population}.`,'settlement');
}
function repairRelay(method){
 const l=currentLandmark();if(!l||l.kind!=='relay'||s.story.relays.includes(l.id))return;
 const count=s.story.relays.length;
 let cost,detail;
 if(method==='parts'){cost={scrap:4,circuit:s.player.profession==='mechanic'||partyMembers().some(c=>c.skill==='researcher')?1:2};detail='Precision repairs stabilize the signal.';}
 else if(method==='improvise'){cost={scrap:7,wood:2};detail='You reroute power through a fragile makeshift junction. Sparks leap across the controls.';}
 else if(method==='favor'){
   const f=l.id==='northrelay'?'choir':l.id==='waterrelay'?'union':'verdant';
   if(s.reputation[f]<25)return notify('You need 25 reputation with '+D.factions[f].name+' to request support.');
   rep(f,-12);cost={scrap:1};detail=`Engineers loyal to ${D.factions[f].name} discreetly complete the repairs.`;
 }else return;
 if(!pay(cost))return notify('You need '+qtyText(cost));
 time(5);if(s.dead)return;
 if(method==='improvise')modifyHp(-8);
 s.story.relays.push(l.id);s.story.choices.push('Activated '+l.name+' via '+method);gainXp(100+count*30);
 const remaining=D.landmarks.filter(o=>o.kind==='relay'&&!s.story.relays.includes(o.id));
 log('Relay activated: '+l.name,remaining.length?`A column of green light rises into the sky. ${remaining.length} relay${remaining.length>1?'s remain':' remains'}: ${remaining.map(q=>q.name).join(', ')}.`:'All three stations are online. A voice names the final destination: STATION ZERO (9,9).','story');
}
function finale(method){
 if(currentLandmark()?.id!=='blacksite'||s.story.relays.length!==3||s.story.ending)return;
 const endings={
 truth:{title:'THE OPEN SIGNAL',desc:'You broadcast the records of the fall to every listening settlement. The truth wounds old alliances, but people are finally free to choose what comes next. Some call you a liberator. Others call you a fool.',rep:{union:18,verdant:15,choir:-18}},
 unity:{title:'THE COMMON FREQUENCY',desc:'You turn Station Zero into an open emergency network, placing its controls under representatives of the settlements. There is no single ruler. Roads reopen; for the first time, the region speaks with one voice.',rep:{union:20,verdant:20,choir:7}},
 order:{title:'THE IRON BROADCAST',desc:'You use Station Zero to coordinate an armed federation. Bandits vanish from the roads and trade resumes behind armed checkpoints. People are safer. The question of freedom is harder.',rep:{choir:35,union:-7,verdant:-12}},
 silence:{title:'THE QUIET WORLD',desc:'You destroy the main transmitter. No faction will wield its power. Communities grow in isolation, with no command signal left to unite or control them. You choose an uncertain freedom.',rep:{verdant:10,union:4,choir:-18}}
 };
 const e=endings[method];if(!e)return;
 time(8);if(s.dead)return;
 s.story.ending=method;
 Object.entries(e.rep).forEach(([f,n])=>rep(f,n));
 gainXp(400);addJournal(e.title,e.desc+' Your story continues in free-roam mode.','ending');
 notify('ENDING UNLOCKED: '+e.title);
}
function randomEncounter(source='travel'){
  if(s.encounter||s.combat||s.dead)return;
  const loc=currentLandmark(),wild=['forest','marsh','hills'].includes(tileType(s.player.x,s.player.y));
  const pool=['traveler','toll','trader','infected','cache','static','storm','wounded','caravan','stranger','fire','dispute','generator','hounds','grave','drifter','doctor','collapsed','footprints','lost'];
  if(wild)pool.push('hounds','lost','grave','footprints','wounded');
  if(danger()>=4)pool.push('infected','toll','hounds','collapsed');
  if(loc?.kind==='town')pool.splice(0,pool.length,'trader','traveler','doctor','drifter','dispute','static');
  const id=randomFrom(pool);
  const event={
    traveler:['The Last Hitchhiker','A dusty stranger waves from beside a wrecked minibus. "I just need enough clean water to make it to Riverhold."',[
      ['Give one clean water','Gain goodwill','traveler-help',{water:1}],['Ask what they know','Learn a secret','traveler-talk'],['Take their supplies','Risk a fight','traveler-rob']]],
    toll:['Toll at Gunpoint','A Vulture lookout steps onto the road. A second gun barrel gleams from the ditch. "Twenty scrip. Road tax."',[
      ['Pay 20 scrip','Avoid bloodshed','toll-pay',{credits:20}],['Talk them down','Heart skill check','toll-talk'],['Draw your weapon','Enter combat','toll-fight'],['Try slipping away','Wits skill check','toll-hide']]],
    trader:['The Traveling Merchant','A trader has spread wares across the tailgate of a battered pickup. "I have what you need. Maybe."',[
      ['Buy 2 water and 2 food','Costs 27 scrip','trader-buy',{credits:27}],['Trade 5 scrap for a medkit','A useful exchange','trader-swap',{scrap:5}],['Share road rumors','Discover nearby terrain','trader-talk'],['Keep moving','No consequences','leave']]],
    infected:['The Quiet Ones','A sickening scraping sound comes from beneath a bus. Three shapes drag themselves toward the road.',[
      ['Fight through','Combat','infected-fight'],['Toss rations as a distraction','Costs 1 ration','infected-bait',{food:1}],['Creep around the wreck','Wits skill check','infected-hide']]],
    cache:['Something Buried','A rusted ammunition can is half-buried beneath an old telephone pole. The clasp is jammed.',[
      ['Force it open','Grit check; risk injury','cache-force'],['Examine the mechanism','Wits check','cache-pick'],['Leave it','Avoid trouble','leave']]],
    static:['An Impossible Broadcast','Your radio spits out three knocks, then a whisper: "The signal is not dead. It is waiting."',[
      ['Trace the signal','Reveal more terrain','static-trace'],['Transmit your name','Unknown consequence','static-answer'],['Turn the radio off','Remain silent','leave']]],
    storm:['The Sky Goes Black','A wall of brown dust races over the ridge. You have minutes before the storm hits.',[
      ['Find cover','Spend four hours','storm-cover'],['Push through','Save time; risk health','storm-push'],['Use spare cloth as a mask','Costs cloth','storm-mask',{cloth:1}]]],
    wounded:['A Voice in the Ditch','A badly wounded survivor whispers for help. Blood has soaked through their coat.',[
      ['Use a medkit','Gain reputation and experience','wounded-heal',{medkit:1}],['Offer water and comfort','Small reward','wounded-water',{water:1}],['Search their pack and leave','Loot, lose compassion','wounded-rob'],['Leave','No cost','leave']]],
    caravan:['Caravan Under Fire','A Union supply wagon sits trapped between two abandoned trucks. Someone is shooting from an overpass.',[
      ['Defend the caravan','Combat, Union favor','caravan-help'],['Sneak supplies from the wagon','Risk a reputation loss','caravan-steal'],['Take a side road','Escape danger','leave']]],
    stranger:['The Stranger in Yellow','A masked wanderer knows your name and hands you a note: "Station Zero was not built for what they told us."',[
      ['Ask who sent them','Learn more','stranger-ask'],['Give food for further directions','Costs 2 rations','stranger-pay',{food:2}],['Refuse the message','Keep moving','leave']]],
    fire:['A Light Through the Trees','Warm light spills from a tiny fire. Two travelers invite you to share their supper.',[
      ['Sit and share a ration','Recover energy, gain a rumor','fire-share',{food:1}],['Keep watch instead','Increase scouting range','fire-watch'],['Move on','No cost','leave']]],
    dispute:['The Water Argument','Two groups accuse each other of stealing water from a community cistern. Both turn to you.',[
      ['Mediate fairly','Heart check, Verdant favor','dispute-peace'],['Side with the traders','Union favor, Verdant loss','dispute-union'],['Side with the growers','Verdant favor, Union loss','dispute-verdant'],['Walk away','Keep neutrality','leave']]],
    generator:['The Forgotten Generator','A portable generator sits under a tarp. Nearby is a crude note: "DO NOT START."',[
      ['Strip it for parts','Recover scrap and electronics','generator-strip'],['Repair and return it','Needs electronics, earns trust','generator-repair',{circuit:1}],['Ignore the warning and start it','Could draw attention','generator-start']]],
    hounds:['Eyes in the Brush','Several feral hounds stalk you between the trees. Their ribs show through their coats.',[
      ['Stand and fight','Wildlife combat','hounds-fight'],['Throw food and retreat','Costs 2 rations','hounds-food',{food:2}],['Climb for high ground','Grit check','hounds-climb']]],
    grave:['The Roadside Memorial','A line of stones marks a dozen graves. Someone has placed fresh flowers on the smallest one.',[
      ['Leave a ration for mourners','Verdant favor','grave-give',{food:1}],['Search the nearby abandoned bags','Scavenged materials','grave-search'],['Pay your respects','Gain morale and insight','grave-respect']]],
    drifter:['People Looking for Home','A little band of survivors shelters beneath a billboard. They ask whether you know somewhere safe.',[
      ['Give them food and directions','Gain community goodwill','drifter-help',{food:2}],['Invite them to your settlement','Needs active local outpost and 3 rations','drifter-join',{food:3}],['Send them to the Iron Choir','Choir favor','drifter-choir'],['Wish them luck','No cost','leave']]],
    doctor:['The Medicine Run','A volunteer doctor is trying to reach Saint Mercy. "I cannot leave these patients without supplies."',[
      ['Donate antibiotics','Gain Verdant reputation','doctor-meds',{medicine:1}],['Donate clean water','Earn scrip and gratitude','doctor-water',{water:2}],['Ask for field treatment','Costs 18 scrip','doctor-treat',{credits:18}],['Let them pass','No cost','leave']]],
    collapsed:['The Unstable Stairwell','A ruined office tower offers a promising supply locker, but the only stairs are barely standing.',[
      ['Climb carefully','Wits check','collapsed-climb'],['Rush the locker','Higher reward, guaranteed injury','collapsed-rush'],['Leave the building','Safe choice','leave']]],
    footprints:['Fresh Boot Prints','A line of fresh military boot prints crosses the mud. They lead into dense brush.',[
      ['Follow them','Risk confrontation; find a cache','footprints-follow'],['Erase your tracks and hide','Scouting and stealth','footprints-hide'],['Ignore them','Keep moving','leave']]],
    lost:['The Broken Bridge','A washed-out bridge blocks an old county road. A fallen maintenance sign points toward an unmarked path.',[
      ['Explore the hidden path','Reveal terrain and recover supplies','lost-path'],['Build a makeshift crossing','Costs 3 timber','lost-build',{wood:3}],['Turn back','No cost','leave']]]
  }[id];
  if(!event)return;
  startChoice(event[0],event[1],event[2].map(([label,hint,action,req])=>({label,hint,action,req})),source);
}
function requirementMessage(req){if(!req)return '';return Object.entries(req).filter(([id,n])=>bag(id)<n).map(([id,n])=>`${label(id)} ×${n}`).join(', ');}
function resolveChoice(n){
 const e=s.encounter;if(!e)return;
 const choice=e.choices[n];if(!choice)return;
 const missing=requirementMessage(choice.req);if(missing)return notify('Missing: '+missing);
 if(choice.req)pay(choice.req);
 s.encounter=null;
 const p=s.player,a=choice.action;
 let result='';let xp=5;
 const bonus=(goods)=>{Object.entries(goods).forEach(([id,n])=>addItem(id,n));return ` Found: ${qtyText(goods)}.`;};
 const test=(stat,base=9)=>r(12)+p.stats[stat]>=base;
 switch(a){
 case 'leave':result='You carry on. Not every encounter needs to become a story.';xp=1;break;
 case 'gatebribe':if(!pay({credits:35})){result='You cannot afford their terms.';break;}rep(choice.faction,28);result='The guards reluctantly allow passage after recording your payment.';break;
 case 'gateleave':rep(currentLandmark()?.faction||'choir',-1);if(e.from){p.x=e.from[0];p.y=e.from[1];}result='You back away from the gate. The sentries keep watching.';break;
 case 'traveler-help':rep('union',4);result='The survivor thanks you, pressing an old map into your palm.';reveal(p.x,p.y,2);xp=12;break;
 case 'traveler-talk':result='"Bastion Gate trades safety for obedience. The Observatory is different. It talks back."';break;
 case 'traveler-rob':rep('union',-12);result='Your choice echoes down the road.'+bonus({credits:14,food:2});if(chance(.35))startCombat('bandits',1);break;
 case 'toll-pay':result='The Vultures step aside, laughing at the easy money.';rep('vultures',2);break;
 case 'toll-talk':if(test('heart',10)){result='You convince them that robbing you would cost more than it earns.';rep('vultures',2);xp=13;}else{result='The leader smiles. "Wrong answer."';startCombat('bandits');}break;
 case 'toll-fight':result='You reach for your weapon.';startCombat('bandits');break;
 case 'toll-hide':if(test('wits',10)){result='You slip into the drainage ditch and circle around the blockade.';xp=11;}else{result='A lookout spots you in the ditch.';startCombat('bandits');}break;
 case 'trader-buy':result='The merchant fills your pack.';addItem('water',2);addItem('food',2);break;
 case 'trader-swap':result='The merchant grins at the deal.';addItem('medkit',1);break;
 case 'trader-talk':result='You swap road stories as the stranger points out little-known trails.';reveal(p.x,p.y,3);break;
 case 'infected-fight':result='You face the rotting shapes.';startCombat('infected');break;
 case 'infected-bait':result='The shapes follow the noise of the thrown tin as you retreat.';break;
 case 'infected-hide':if(test('wits',11)){result='You hold your breath until the last one passes.';xp=12;}else{result='A dry growl gives you away.';startCombat('infected');}break;
 case 'cache-force':if(test('grit',10)){result='The old metal gives way.'+bonus({ammo:5,scrap:3,credits:12});}else{result='The latch cuts into your palm, but the can opens.'+bonus({ammo:3,scrap:2});modifyHp(-9);}break;
 case 'cache-pick':if(test('wits',11)){result='The lock clicks open and an old supply list falls out.'+bonus({circuit:1,medicine:1,ammo:4});xp=14;}else{result='The mechanism breaks. Only some of the contents survive.'+bonus({scrap:2});}break;
 case 'static-trace':result='You triangulate the sound. The markers on your map shift.';reveal(p.x,p.y,3);s.story.heard=true;xp=13;break;
 case 'static-answer':result='A dead voice repeats your name in your own tone. The transmitter clicks off.';s.story.heard=true;p.energy=clamp(p.energy-7);xp=16;break;
 case 'storm-cover':time(4);result='The storm tears past while you shelter beneath a concrete culvert.';p.energy=clamp(p.energy+7);break;
 case 'storm-push':modifyHp(-8-r(9));p.infection=clamp(p.infection+7);result='Sand lashes your face. You emerge on the far side coughing.';break;
 case 'storm-mask':result='A makeshift mask protects your lungs, but you still lose a few hours.';time(2);break;
 case 'wounded-heal':rep('verdant',8);result='The stranger survives. "If you reach Saint Mercy, tell Eli someone still believes in mercy."'+bonus({credits:12});xp=22;break;
 case 'wounded-water':rep('verdant',3);result='You sit with the stranger until their breathing calms.';xp=10;break;
 case 'wounded-rob':rep('verdant',-16);result='You leave without looking back.'+bonus({credits:30,medicine:1});xp=0;break;
 case 'caravan-help':rep('union',9);result='You rush to defend the wagon.';startCombat('bandits',2);xp=20;break;
 case 'caravan-steal':rep('union',-15);result='While both sides are distracted you make a grim choice.'+bonus({food:4,water:3,credits:20});break;
 case 'stranger-ask':result='"Three relays once coordinated a secret evacuation. Station Zero changed the orders. Someone is still down there."';s.story.heard=true;xp=12;break;
 case 'stranger-pay':result='A penciled route leads toward Station Zero.';reveal(p.x,p.y,3);s.story.heard=true;xp=15;break;
 case 'fire-share':p.energy=clamp(p.energy+30);result='The travelers speak of gardens returning to life beyond the northern hills.';rep('verdant',2);break;
 case 'fire-watch':reveal(p.x,p.y,2);result='You keep a careful watch until dawn hints over the rooftops.';xp=10;break;
 case 'dispute-peace':if(test('heart',10)){rep('union',6);rep('verdant',6);result='You convince both sides to share the cistern and post a joint watch.';xp=20;}else{result='Neither side is satisfied, but at least nobody draws a gun.';xp=6;}break;
 case 'dispute-union':rep('union',8);rep('verdant',-5);result='The traders cheer your ruling. The growers turn away.';break;
 case 'dispute-verdant':rep('verdant',8);rep('union',-5);result='The growers promise to remember you. The traders do too, for different reasons.';break;
 case 'generator-strip':result='You recover the useful parts before anything catches fire.'+bonus({scrap:6,circuit:chance(.6)?2:1});break;
 case 'generator-repair':rep('union',7);result='The generator sputters to life. Nearby families cheer as lights blink on.';gainXp(12);break;
 case 'generator-start':if(chance(.5)){result='The generator runs. It also attracts raiders.';startCombat('bandits',1);}else{result='A burst of smoke, then silence.'+bonus({scrap:3});modifyHp(-6);}break;
 case 'hounds-fight':result='The hounds charge.';startCombat('wildlife');break;
 case 'hounds-food':result='The hounds follow the rations while you escape quietly.';break;
 case 'hounds-climb':if(test('grit',10)){result='You scramble up an old retaining wall and wait for the animals to leave.';xp=12;}else{result='You slip on the wet rocks. The pack closes in.';modifyHp(-7);startCombat('wildlife',1);}break;
 case 'grave-give':rep('verdant',5);result='You leave a meal for whoever still comes here.';xp=11;break;
 case 'grave-search':result='Under a loose floorboard in a nearby shed: forgotten supplies.'+bonus({cloth:4,ammo:2,credits:6});break;
 case 'grave-respect':p.energy=clamp(p.energy+9);result='You stand in silence, then go on carrying more than your pack.';xp=10;break;
 case 'drifter-help':rep('union',5);result='The survivors follow your directions toward safety.';xp=12;break;
 case 'drifter-join':{const c=nearbyCamp();if(c&&c.population<2+(c.buildings.barracks||0)*5){c.population++;c.morale=clamp(c.morale+9);result='One wanderer chooses to stay and help build your community.';xp=20;}else{result='They thank you, but there is not enough room here. Your supplies are returned.';addItem('food',3);}break;}
 case 'drifter-choir':rep('choir',5);result='A Choir patrol promises to collect the travelers. You hope they are treated fairly.';break;
 case 'doctor-meds':rep('verdant',9);result='The doctor takes the antibiotics and promises to make each dose count.';xp=18;break;
 case 'doctor-water':rep('verdant',5);result='The doctor trades a handful of old scrip for your generosity.'+bonus({credits:22});break;
 case 'doctor-treat':modifyHp(40);p.infection=clamp(p.infection-25);result='The doctor treats you as the dust settles.';break;
 case 'collapsed-climb':if(test('wits',10)){result='You navigate the broken stairwell and find a maintenance locker.'+bonus({scrap:5,circuit:2,medkit:1});xp=15;}else{modifyHp(-12);result='The staircase gives way beneath you, but you emerge with a few components.'+bonus({scrap:3});}break;
 case 'collapsed-rush':modifyHp(-18);result='Falling concrete tears through your coat.'+bonus({circuit:3,scrap:8,credits:16});break;
 case 'footprints-follow':if(chance(.5)){result='You discover an unattended supply pack near an empty camp.'+bonus({ammo:6,food:2,scrap:2});}else{result='The prints lead into a Vulture ambush.';startCombat('bandits');}break;
 case 'footprints-hide':result='You cover your tracks and discover a better vantage point.';reveal(p.x,p.y,2);xp=11;break;
 case 'lost-path':result='The trail leads to a forgotten roadside cache.'+bonus({herbs:3,wood:4,scrap:2});reveal(p.x,p.y,2);break;
 case 'lost-build':result='You build a safer crossing for those who come after you.';rep('union',4);xp=14;break;
 default:result='The road goes quiet.';
 }
 if(!s.dead){gainXp(xp);addJournal(e.title,result||'The encounter passes.','encounter');}
}
function questEvent(kind,v){
 if(!s)return;
 for(const q of s.quests){if(q.completed||q.claimed)continue;
  if(q.kind==='patrol'&&kind==='kill'&&v.kind==='bandits')q.progress=Math.min(q.amount,q.progress+(v.qty||1));
  if(q.kind==='survey'&&kind==='discover')q.progress=Math.min(q.amount,q.progress+1);
  if(q.kind==='collect'&&kind==='collect'&&v.item===q.item)q.progress=Math.min(q.amount,q.progress+(v.qty||1));
  if(q.progress>=q.amount&&q.kind!=='delivery'&&q.kind!=='collect')q.completed=true;
 }
}
function addJob(kind){
 const town=currentLandmark();if(!town||town.kind!=='town'||s.quests.filter(q=>!q.claimed).length>=5)return notify('No open contract slots (limit five).');
 const templates={
   supplies:{title:'Emergency Food Run',kind:'delivery',item:'food',amount:5,reward:72,rep:8,desc:'Bring five ration packs to those sheltering in the market.'},
   water:{title:'The Clean Water Promise',kind:'delivery',item:'water',amount:5,reward:82,rep:9,desc:'Deliver clean water to the settlement infirmary.'},
   medicine:{title:'Antibiotics Request',kind:'delivery',item:'medicine',amount:2,reward:105,rep:11,desc:'The settlement needs life-saving antibiotics.'},
   patrol:{title:'Clear the Highways',kind:'patrol',amount:2,reward:94,rep:12,desc:'Defeat two hostile bandit groups and report back.'},
   survey:{title:'Chart the Unknown',kind:'survey',amount:5,reward:80,rep:9,desc:'Discover five new map tiles, then return with your report.'},
   salvage:{title:'Circuit Salvage',kind:'delivery',item:'circuit',amount:3,reward:120,rep:10,desc:'Recover three pieces of working electronics for the radio technicians.'}
 };
 const t=templates[kind];if(!t)return;
 const q={id:s.nextId++,...t,progress:0,completed:false,claimed:false,townId:town.id,faction:town.faction,acceptedDay:s.world.day};
 s.quests.push(q);log('Contract accepted: '+q.title,q.desc+' Return to '+town.name+' to collect payment.','quest');
}
function claimJob(id){
 const q=s.quests.find(o=>o.id===Number(id));if(!q||q.claimed)return;
 if(currentLandmark()?.id!==q.townId)return notify('Return to the settlement that issued this contract.');
 if(q.kind==='delivery'){
   if(!has({[q.item]:q.amount}))return notify('Contract requires '+q.amount+' '+label(q.item)+'.');
   pay({[q.item]:q.amount});
 }else if(q.progress<q.amount)return notify(`Progress ${q.progress}/${q.amount}.`);
 q.completed=true;q.claimed=true;
 addItem('credits',q.reward+(partyMembers().some(c=>c.skill==='trader')?15:0));rep(q.faction,q.rep);gainXp(32);
 log('Contract complete: '+q.title,`Collected ${q.reward} trade scrip and ${q.rep} reputation with ${D.factions[q.faction].name}.`,'quest');
}
function meter(title,value,max=100,iconText='',tone=''){const percent=clamp(value/max*100);return `<div class="meter-wrap"><div class="meter-label"><span>${iconText} ${title}</span><strong>${Math.floor(value)}${max!==100?` / ${max}`:''}</strong></div><div class="meter-track"><span class="meter-fill ${tone}" style="width:${percent}%"></span></div></div>`;}
function btn(a,caption,extra='',attrs=''){return `<button class="btn ${extra}" data-a="${a}" ${attrs}>${caption}</button>`;}
function pill(sv,txt=''){return `<span class="pill">${sv}${txt}</span>`;}
function titleRow(eyebrow,head,desc=''){return `<div class="section-head"><span class="eyebrow">${text(eyebrow)}</span><h2>${text(head)}</h2>${desc?`<p>${text(desc)}</p>`:''}</div>`;}
function renderStart(){
 const old=tryLoad();
 ROOT.innerHTML=`<div class="intro-wrap"><div class="intro-glow"></div><main class="intro-panel">
 <div class="eyebrow">⟁ AN INTERACTIVE SURVIVAL CHRONICLE <span class="version">v${D.version}</span></div>
 <h1>AFTER<span>FALL</span></h1><div class="intro-sub">THE LAST FREQUENCY</div>
 <p class="intro-story">Twelve years after civilization went silent, a transmission breaks through the static. Three forgotten towers. One buried secret. A continent of strangers, monsters and people trying to start again.</p>
 <div class="intro-features"><span>◈ Open-world exploration</span><span>◈ Choice-driven encounters</span><span>◈ Rebuild civilization</span><span>◈ Persistent saves</span></div>
 ${old?`<div class="continue-card"><div><div class="eyebrow">EXISTING TRANSMISSION</div><strong>${text(old.player?.name||'Survivor')}</strong><span class="muted"> · Day ${old.world?.day||1} · Level ${old.player?.level||1}</span></div>${btn('continue','▶ Continue game','primary')}<small>Starting a new game replaces the current local save. Export it first if you want to keep both.</small>${btn('export-old','↓ Export existing save','ghost small')}</div>`:''}
 <div class="field"><label for="player-name">SURVIVOR CALLSIGN</label><input id="player-name" maxlength="24" placeholder="Enter your name" value="Wanderer" autocomplete="off" /></div>
 <div class="eyebrow choose-label">CHOOSE YOUR PAST</div><div class="background-grid">${Object.entries(D.professions).map(([id,b])=>`<button class="origin-card ${pre.profession===id?'selected':''}" data-a="choose-prof" data-id="${id}"><span class="origin-icon">${b.icon}</span><strong>${b.name}</strong><span>${b.desc}</span><small>${b.perk}</small></button>`).join('')}</div>
 <div class="eyebrow choose-label">HOW UNFORGIVING IS YOUR WORLD?</div><div class="difficulty-grid">${Object.entries(D.difficulties).map(([id,d])=>`<button class="diff-card ${pre.difficulty===id?'selected':''}" data-a="choose-difficulty" data-id="${id}"><strong>${d.name}</strong><small>${d.desc}</small></button>`).join('')}</div>
 ${btn('new','BEGIN YOUR STORY →','primary start-btn')}
 <p class="fine-print">Runs entirely in your browser. No account, no servers, no tracking. Export a save to move between devices.</p>
 </main><footer class="intro-footer">AFTERFALL // THE WORLD REMEMBERS THE CHOICES YOU MAKE</footer></div>`;
}
function mainQuest(){
 const relay=D.landmarks.filter(x=>x.kind==='relay'&&!s.story.relays.includes(x.id));
 if(s.story.ending)return {label:'THE FREQUENCY HAS CHANGED',desc:`Ending reached: ${s.story.ending.toUpperCase()}. Continue exploring, building and surviving.`};
 if(relay.length)return {label:`THE LAST FREQUENCY · ${s.story.relays.length}/3 RELAYS`,desc:`Activate ${relay.map(v=>`${v.name} (${v.x},${v.y})`).join(' · ')}. Repair with electronics or jury-rig them.`};
 return {label:'STATION ZERO IS WAITING',desc:'All three relay stations are active. Reach Station Zero (9,9) and decide the fate of the signal.'};
}
function renderGame(){
 const p=s.player,w=s.world,region=currentLandmark(),m=mainQuest();
 const fatal=s.dead;
 ROOT.innerHTML=`<div class="app-shell theme-${text(s.ui.theme)}">
 <header class="topbar"><div class="brand" data-a="goto-explore" role="button" tabindex="0"><span class="brand-symbol">⟁</span><div><strong>AFTERFALL</strong><small>THE LAST FREQUENCY <i>v${D.version}</i></small></div></div>
 <div class="clock-cluster"><span class="clock-label">DAY ${w.day}</span><strong>${fHour(w.hour)}</strong><span>${text(w.weather)}</span></div>
 <div class="header-actions">${btn('save','<span aria-hidden="true">↧</span> Save','ghost small')}${btn('export','↓ Export','ghost small')}${btn('radio-tab','⚙','icon-only','aria-label="Settings and radio"')}</div></header>
 <nav class="navstrip" aria-label="Game sections">${navTabs.map(([id,em,name])=>`<button class="navtab ${s.tab===id?'active':''}" data-a="tab" data-id="${id}"><span>${em}</span><b>${name}</b></button>`).join('')}</nav>
 <div class="mobile-hud"><span>❤ ${Math.round(p.hp)}/${p.maxHp}</span><span>🥫 ${Math.round(p.hunger)}%</span><span>💧 ${Math.round(p.thirst)}%</span><span>⚡ ${Math.round(p.energy)}%</span><span>◈ ${bag('credits')}</span></div>
 <div class="game-grid"><aside class="status-panel">
 <div class="panel character"><div class="eyebrow">SURVIVOR PROFILE</div><div class="char-head"><div class="char-avatar">${D.professions[p.profession].icon}</div><div><h3>${text(p.name)}</h3><span class="muted">Level ${p.level} · ${D.professions[p.profession].name}</span></div></div>
 ${meter('Health',p.hp,p.maxHp,'❤','health')}${meter('Hunger',p.hunger,100,'◉','hunger')}${meter('Hydration',p.thirst,100,'💧','water')}${meter('Energy',p.energy,100,'✦','energy')}${p.infection?meter('Infection',p.infection,100,'☣','infection'):''}
 <div class="xp-label"><span>LEVEL PROGRESS</span><b>${p.xp}/${p.level*85} XP</b></div><div class="meter-track tiny"><span class="meter-fill xp" style="width:${p.xp/(p.level*85)*100}%"></span></div>
 <div class="carry"><span>🎒 Load ${burden().toFixed(1)} / ${capacity()} lb</span><span>${burden()>capacity()?'⚠ Overloaded':'✓'}</span></div></div>
 <div class="panel quick-status"><div class="eyebrow">FIELD INTELLIGENCE</div><div class="info-line"><span>LOCATION</span><b>${text(region?.name||D.terrain[tileType(p.x,p.y)].name)}</b></div><div class="info-line"><span>SECTOR</span><b>${p.x} / ${p.y}</b></div><div class="info-line"><span>THREAT</span><b class="threat">${'◆'.repeat(danger())}${'◇'.repeat(5-danger())}</b></div><div class="info-line"><span>COMPANIONS</span><b>${s.followers.length} / 2</b></div><div class="info-line"><span>SETTLEMENTS</span><b>${s.settlements.length}</b></div><div class="info-line"><span>TRADE SCRIP</span><b>${fmt(bag('credits'))} ◈</b></div></div>
 <div class="panel objective"><div class="eyebrow">CURRENT TRANSMISSION</div><strong>${text(m.label)}</strong><p>${text(m.desc)}</p>${btn('tab','Read field journal →','link small','data-id="journal"')}</div>
 </aside>
 <main class="main-panel" id="main-content">${fatal?renderDeath():s.tab==='explore'?renderExplore():s.tab==='inventory'?renderInventory():s.tab==='crew'?renderCrew():s.tab==='settlements'?renderSettlements():s.tab==='journal'?renderJournal():renderRadio()}</main>
 <aside class="intel-panel"><div class="panel world-log"><div class="panel-title"><span class="eyebrow">FIELD RECORDS</span>${btn('log-expand',expandedLog?'Less':'All','ghost small')}</div><div class="log-list">${s.journal.slice(0,expandedLog?20:7).map(j=>`<article class="log-entry"><div class="log-day">D${j.day} · ${fHour(j.hour)} · ${text(j.type.toUpperCase())}</div><strong>${text(j.title)}</strong><p>${text(j.body)}</p></article>`).join('')}</div></div>
 <div class="panel sidebar-info"><div class="eyebrow">SURVIVAL NOTE</div><p>${text(randomTip())}</p><div class="separator"></div><span class="eyebrow">REGION STATUS</span><p>World explored: <strong>${Math.round(Object.keys(w.discovered).length/(D.width*D.height)*100)}%</strong> · ${Object.keys(w.visited).length} sectors visited</p></div></aside>
 </div><footer class="app-footer"><span>⟁ AFTERFALL · V${D.version} · LOCALLY SAVED</span><span>Every decision writes a new history.</span></footer></div>`;
}
function randomTip(){return D.tips[(s.world.day+s.player.x*2+s.player.y+s.player.turns)%D.tips.length];}
function renderDeath(){const w=s.world,p=s.player;return `<div class="death-screen"><span class="eyebrow">TRANSMISSION TERMINATED</span><h1>THE WORLD<br>GOES QUIET.</h1><p>${text(p.name)} survived ${w.day} days, explored ${Object.keys(w.visited).length} sectors, and made ${rosterCount()} allies.</p><div class="death-actions">${btn('export','Export final journal','primary')}${btn('restart','Begin a new story','secondary')}</div><div class="story-quote">"The end was never the end of the world. Only the end of one story."</div></div>`;}
function renderExplore(){
 const l=currentLandmark(),terrain=D.terrain[tileType(s.player.x,s.player.y)];
 const camp=nearbyCamp();
 return `<div class="screen-pad">${titleRow('WASTELAND // LIVE FEED',l?.name||terrain.name,l?.description||terrain.text)}
 ${s.encounter?renderEncounter():s.combat?renderCombat():`<div class="scene-card"><div class="scene-illustration">${l?.icon||terrain.icon}</div><div class="scene-copy"><div class="eyebrow">SECTOR ${s.player.x}.${s.player.y} · ${terrain.name.toUpperCase()}</div><p>${text(l?.lore||terrain.text)}</p>${camp?`<p class="camp-banner">🏘️ You stand inside <b>${text(camp.name)}</b>. Your people are waiting.</p>`:''}</div></div>
 <div class="action-section"><div class="eyebrow">FIELD ACTIONS</div><div class="action-grid">${btn('scavenge','🔍 Scavenge <small>3 hours</small>','action')}${btn('scout','👁️ Scout <small>2 hours</small>','action')}${btn('forage','🌿 Forage <small>3 hours</small>','action')}${btn('rest','🌙 Rest <small>7 hours</small>','action')}</div></div>
 ${renderLocationActions(l,camp)}
 ${s.route.length?`<div class="route-note"><span>🧭 Route paused · ${s.route.length} sectors remain</span>${btn('continue-route','▶ Resume route','secondary small')}${btn('cancel-route','✕','ghost small')}</div>`:''}`}
 ${renderMap()}
 <div class="controls-footer"><span>Travel: ${s.player.profession==='scout'?'1–2':'1–3'} h per sector + terrain modifiers</span><span>Touch a mapped sector to plot a route. Encounters interrupt travel.</span></div></div>`;
}
function renderLocationActions(l,camp){
 let pieces=[];
 if(l?.kind==='town')pieces.push(`<section class="local-section"><div class="local-heading"><span>${D.factions[l.faction].icon} ${l.name} · ${D.factions[l.faction].name}</span><span class="muted">Standing: ${s.reputation[l.faction]>=0?'+':''}${s.reputation[l.faction]}</span></div><p>${text(l.description)}</p><div class="action-grid">${btn('tab','🛒 Open market','secondary','data-id="inventory"')}${btn('tab','📋 Job board','secondary','data-id="journal"')}${btn('tab','🤝 Local residents','secondary','data-id="crew"')}${btn('rest','🏕️ Stay overnight','secondary')}${btn('aid','💛 Donate food & water','secondary',`${has({food:3,water:3})?'':'disabled'}`)}${s.story.pacts?.includes(l.faction)?'<span class="allied-label">✓ MUTUAL-AID PACT SIGNED</span>':btn('pact',`📜 Form permanent alliance <small>Standing +45 · 90 scrip</small>`,'secondary',`${s.reputation[l.faction]>=45&&bag('credits')>=90?'':'disabled'}`)}</div></section>`);
 if(l?.kind==='relay'&&!s.story.relays.includes(l.id)){
   const parts={scrap:4,circuit:s.player.profession==='mechanic'||partyMembers().some(x=>x.skill==='researcher')?1:2};
   pieces.push(`<section class="local-section mission"><div class="eyebrow">SIGNAL REPAIR OPPORTUNITY</div><h3>Reactivate ${text(l.name)}</h3><p>The receiver is dormant but repairable. You can restore the tower using parts, jury-rig a dangerous workaround, or persuade a faction to send help.</p><div class="choice-stack">${btn('relay','🔌 Repair circuitry <span>${qtyText(parts)}</span>','choice','data-id="parts"')}${btn('relay','⚠ Improvise bypass <span>${qtyText({scrap:7,wood:2})} · -8 HP</span>','choice','data-id="improvise"')}${btn('relay','🤝 Request faction engineers <span>Reputation 25+ · costs favor and 1 scrap</span>','choice','data-id="favor"')}</div></section>`);
 }
 if(l?.kind==='relay'&&s.story.relays.includes(l.id))pieces.push(`<div class="local-section restored">✓ REPEATER ONLINE · This relay transmits a steady green signal.</div>`);
 if(l?.kind==='finale'&&!s.story.ending){
  pieces.push(`<section class="local-section mission"><div class="eyebrow">THE FINAL DECISION</div><h3>Station Zero</h3>${s.story.relays.length<3?`<p>The hardened bunker will not accept your credentials until all three relay stations are restored. (${s.story.relays.length}/3 online)</p>`:`<p>Below your feet is the final working broadcast network. Station Zero contains evacuation orders, records of deliberate betrayals, and the means to govern a shattered region. Four paths lie before you.</p><div class="choice-stack">${btn('ending','📢 Reveal the truth to everyone <span>Transparency, no matter the cost</span>','choice','data-id="truth"')}${btn('ending','🤝 Build an open settlement network <span>Shared governance and cooperation</span>','choice','data-id="unity"')}${btn('ending','⚔️ Impose an iron peace <span>Security through a unified command</span>','choice','data-id="order"')}${btn('ending','🔇 Destroy the central transmitter <span>No one should have this power</span>','choice','data-id="silence"')}</div>`}</section>`);
 }
 if(l?.kind==='finale'&&s.story.ending)pieces.push(`<div class="local-section restored">◈ Station Zero has been changed forever. Your legacy: ${text(s.story.ending).toUpperCase()}.</div>`);
 if(l?.kind==='ruin')pieces.push(`<section class="local-section"><div class="local-heading">🏚️ Ruin exploration</div><p>Places like ${text(l.name)} may hide valuable salvage, supplies, and danger.</p>${btn('deep-search','⚒ Deep search (risky, 5 hours)','secondary')}</section>`);
 if(recruitHere().length){pieces.push(`<section class="local-section"><div class="eyebrow">SURVIVORS NEARBY</div>${recruitHere().map(c=>`<div class="npc-mini"><b>${c.icon} ${text(c.name)} · ${text(c.role)}</b><p>${text(c.intro)}</p><span>${text(c.request)}</span>${btn('recruit',`Invite ${text(c.name)} →`,'secondary small',`data-id="${c.id}"`)}</div>`).join('')}</section>`);}
 if(camp)pieces.push(`<section class="local-section"><div class="local-heading">🏘️ ${text(camp.name)}</div><p>Population ${camp.population} · Morale ${camp.morale}/100 · Defenses ${campDefense(camp)}</p>${btn('tab','Manage settlement →','secondary','data-id="settlements"')}</section>`);
 return pieces.join('');
}
function renderMap(){const p=s.player;
 let tiles='';
 for(let y=0;y<D.height;y++)for(let x=0;x<D.width;x++){
  const seen=!!s.world.discovered[pos(x,y)],visited=!!s.world.visited[pos(x,y)],here=x===p.x&&y===p.y;
  const l=locationAt(x,y),terrain=D.terrain[tileType(x,y)];
  const symbol=here?'🧍':seen?(l?.icon||terrain.icon):'·';
  const title=seen?(l?.name||terrain.name)+` [${x},${y}]`:'Undiscovered sector';
  tiles+=`<button class="map-tile ${seen?'':'fog'} ${here?'current':''} ${visited?'visited':''} ${seen&&l?'landmark':''}" data-a="map" data-x="${x}" data-y="${y}" ${seen?'':'disabled'} title="${text(title)}" aria-label="${text(title)}">${symbol}</button>`;
 }
 return `<section class="map-section"><div class="map-title"><div><span class="eyebrow">SECTOR MAP</span><h3>THE ASHEN REACHES</h3></div><div class="map-counters">${Object.keys(s.world.visited).length}/${D.width*D.height} explored</div></div><div class="map-frame"><div class="map-viewport"><div class="map-grid" role="group" aria-label="World map with selectable discovered locations">${tiles}</div></div><div class="map-help"><span>🧍 You</span><span>🏘️ Safe town</span><span>📡 Relay</span><span>· Uncharted</span></div></div><div class="move-grid"><span class="eyebrow">MOVE ONE SECTOR</span><div class="compass"><div></div>${btn('move','↑','move-btn',`data-dx="0" data-dy="-1" aria-label="Go north" ${p.y===0?'disabled':''}`)}<div></div>${btn('move','←','move-btn',`data-dx="-1" data-dy="0" aria-label="Go west" ${p.x===0?'disabled':''}`)}<span class="compass-center">✦</span>${btn('move','→','move-btn',`data-dx="1" data-dy="0" aria-label="Go east" ${p.x===D.width-1?'disabled':''}`)}<div></div>${btn('move','↓','move-btn',`data-dx="0" data-dy="1" aria-label="Go south" ${p.y===D.height-1?'disabled':''}`)}<div></div></div></div></section>`;
}
function renderEncounter(){const e=s.encounter;
 return `<section class="narrative-encounter"><span class="eyebrow">⚠ A MOMENT OF CONSEQUENCE</span><h3>${text(e.title)}</h3><p class="narrative-body">${text(e.body)}</p><div class="choice-stack">${e.choices.map((c,i)=>{const missing=requirementMessage(c.req);return btn('choose',`${text(c.label)} <span>${text(c.hint||'')}${missing?' · Missing: '+text(missing):''}</span>`,'choice',`data-i="${i}" ${missing?'disabled':''}`);}).join('')}</div><p class="hint">There may be no perfect answer. Choices can change health, supplies, faction trust, or the people you meet.</p></section>`;
}
function renderCombat(){const c=s.combat;
 return `<section class="combat-panel"><div class="combat-heading"><span class="eyebrow">⚔ ACTIVE ENGAGEMENT · ROUND ${c.round}</span><h3>Survive the encounter</h3></div><div class="enemy-list">${c.foes.map((e,i)=>`<div class="enemy"><div><strong>☠ ${text(e.name)}</strong><small>DMG ${e.damage} · ARMOR ${e.armor}</small></div><div class="enemy-meter">${meter('HP',e.hp,e.maxHp,'','health')}</div><div class="enemy-actions">${btn('fight','⚔ Strike','danger small',`data-id="strike" data-i="${i}"`)}${btn('fight','🎯 Aim','secondary small',`data-id="aim" data-i="${i}"`)}</div></div>`).join('')}</div><div class="combat-utility">${btn('fight','🛡 Guard','secondary','data-id="guard"')}${btn('fight','🩹 Medkit ('+bag('medkit')+')','secondary',`data-id="heal" ${bag('medkit')?'':'disabled'}`)}${btn('fight','🏃 Flee','secondary','data-id="retreat"')}</div><div class="battle-log">${c.history.map(line=>`<p>${text(line)}</p>`).join('')}</div><p class="hint">Party members attack automatically. Firearms consume ammunition. Failed retreats cost a combat round.</p></section>`;
}
function renderInventory(){
 const p=s.player,items=Object.entries(p.inv).filter(([,n])=>n>0).sort((a,b)=>{const aa=D.items[a[0]]?.type||'',bb=D.items[b[0]]?.type||'';return aa.localeCompare(bb)||a[0].localeCompare(b[0]);});
 return `<div class="screen-pad">${titleRow('SUPPLIES & SURVIVAL','YOUR PACK','Every scrap of metal, every clean drop, every piece of equipment can change the outcome of a journey.')}
 <div class="inventory-header"><div><span class="eyebrow">CARRY WEIGHT</span><strong>${burden().toFixed(1)} / ${capacity()} lb</strong></div><div><span class="eyebrow">TRADE SCRIP</span><strong>${fmt(bag('credits'))} ◈</strong></div><div><span class="eyebrow">WEAPON / ARMOR</span><strong>${text(label(p.weapon||'knife'))} / ${p.armor?text(label(p.armor)):'None'}</strong></div></div>
 <div class="eyebrow section-spaced">YOUR POSSESSIONS</div><div class="item-grid">${items.filter(([id])=>id!=='credits').map(([id,count])=>{let d=D.items[id],canUse=['food','water','medicine','medkit'].includes(id),canEquip=['weapon','armor'].includes(d?.type);return `<div class="item-card"><div class="item-icon">${d?.icon||'◈'}</div><div class="item-detail"><strong>${text(d?.name||id)} <span>×${count}</span></strong><small>${text(d?.desc||'')}</small><span>${text(d?.type||'unknown')} · ${d?.weight||0} lb each</span></div>${canUse?btn('use','Use','secondary small',`data-id="${id}"`):canEquip?btn('use',p.weapon===id||p.armor===id?'Equipped':'Equip','secondary small',`data-id="${id}" ${p.weapon===id||p.armor===id?'disabled':''}`):''}</div>`;}).join('')||'<p>No supplies left. Search the ruins, travel, or trade.</p>'}</div>
 <section class="craft-section">${titleRow('WORKBENCH','CRAFTING','Use salvaged materials to make what the wasteland will not give you. The mechanic background saves scrap.')}
 <div class="recipe-grid">${D.recipes.map(z=>{let cost={...z.needs};if(p.profession==='mechanic'&&cost.scrap)cost.scrap=Math.max(1,cost.scrap-1);return `<div class="recipe-card"><div class="recipe-title"><span>${icon(z.id)}</span><strong>${text(label(z.id))}${z.qty>1?' ×'+z.qty:''}</strong></div><p>${text(z.desc)}</p><small>${qtyText(cost)} · ${z.hours} hours</small>${btn('craft','Craft item','secondary small',`data-id="${z.id}" ${has(cost)?'':'disabled'}`)}</div>`;}).join('')}</div></section>
 ${atTown()?renderMarket():`<div class="helper-text">🛒 To trade goods, travel to a friendly town and open Inventory.</div>`}</div>`;
}
function renderMarket(){
 const l=currentLandmark(),stock={hearth:['food','water','medkit','scrap','ammo','cloth','circuit','fuel','backpack','pistol'],orchard:['food','water','herbs','wood','cloth','medicine','medkit','hatchet'],bastion:['ammo','pistol','rifle','plate','vest','fuel','medkit','water'],riverhold:['water','food','scrap','circuit','fuel','cloth','backpack','knife'],clinic:['medicine','medkit','water','food','herbs','cloth']};
 const options=stock[l.id]||stock.hearth;
 if(s.reputation[l.faction]<-35)return `<div class="helper-text">The market guards refuse to trade with you due to your hostile faction standing.</div>`;
 return `<section class="market-section">${titleRow(`${D.factions[l.faction].name.toUpperCase()} TRADE POST`,`${l.name} Market`,'Buy and sell items using trade scrip. Your reputation and character background change prices.')}<div class="market-grid">${options.map(id=>`<div class="market-row"><span class="market-item">${icon(id)} ${label(id)}</span><span>◈ ${priceFor(id,'buy')} / ${priceFor(id,'sell')}</span><div>${btn('buy','Buy','secondary small',`data-id="${id}" ${bag('credits')<priceFor(id,'buy')?'disabled':''}`)}${btn('sell','Sell','ghost small',`data-id="${id}" ${bag(id)<1?'disabled':''}`)}</div></div>`).join('')}</div><small class="muted">Prices shown: buy / sell · Inventory is not globally synchronized between towns.</small></section>`;
}
function renderCrew(){
 const p=s.player;
 return `<div class="screen-pad">${titleRow('PEOPLE WORTH SAVING','COMPANIONS & CHARACTER','The people you travel with have skills, histories, loyalties and limits. A community is more than a collection of numbers.')}
 <section class="skill-panel"><div class="skill-top"><div><span class="eyebrow">LEVEL ${p.level} · ${D.professions[p.profession].name.toUpperCase()}</span><h3>${text(p.name)}</h3><p>${D.professions[p.profession].perk}</p></div><div class="skill-points">${p.statPoints} <small>unspent points</small></div></div><div class="skills-grid">${[['grit','💪','GRIT','Physical resilience, damage and some risky actions.'],['wits','🧠','WITS','Observation, stealth and technical problem-solving.'],['heart','🫀','HEART','Negotiation, trust and peaceful resolutions.']].map(([id,em,name,desc])=>`<div class="skill-stat"><div class="skill-line"><strong>${em} ${name}</strong><span>${p.stats[id]}</span></div><p>${desc}</p>${btn('stat','+ Improve','secondary small',`data-id="${id}" ${p.statPoints?'':'disabled'}`)}</div>`).join('')}</div></section>
 <div class="section-label-row"><span class="eyebrow">YOUR PEOPLE · ${rosterCount()} RECRUITED</span><span class="muted">${s.followers.length}/2 in traveling party</span></div>
 ${!rosterCount()?`<div class="empty-card">No one travels with you yet. Visit Hearth Market, Orchard Commons, Saint Mercy, Riverhold, Bastion Gate, Bone Rail Depot, Greywater Hospital or Northwatch Relay to meet named survivors.</div>`:''}
 <div class="companion-grid">${D.companions.filter(c=>s.companions[c.id]).map(c=>{
  const v=s.companions[c.id],following=s.followers.includes(c.id),site=s.settlements.find(u=>u.id===v.campId);
  return `<article class="companion-card"><div class="companion-head"><span class="companion-face">${c.icon}</span><div><h3>${text(c.name)}</h3><small>${text(c.role)} · ${text(v.status)}${site?' @ '+text(site.name):''}</small></div></div>${meter('Health',v.hp,c.maxHp,'❤','health')}${meter('Trust',v.trust,100,'◇','energy')}<p>${text(c.trait)}</p><div class="companion-buttons">
 ${following?btn('comp-state','Stay behind','ghost small',`data-id="${c.id}" data-mode="reserve"`):btn('comp-state','Join party','secondary small',`data-id="${c.id}" data-mode="follow" ${s.followers.length>=2||v.hp<=0?'disabled':''}`)}
 ${btn('comp-talk','Talk','secondary small',`data-id="${c.id}"`)}
 ${v.hp<c.maxHp?btn('comp-heal','Heal (1 medkit)','secondary small',`data-id="${c.id}" ${bag('medkit')?'':'disabled'}`):''}
 ${nearbyCamp()&&!site?btn('comp-state','Assign to camp','secondary small',`data-id="${c.id}" data-mode="assign" data-site="${nearbyCamp().id}"`):''}
 </div></article>`;}).join('')}</div>
 <section class="recruit-section">${titleRow('PEOPLE IN THE WORLD','SURVIVOR LEADS','These people have distinct talents, personal reasons to leave, and requests to earn their trust.')}
 <div class="leads-grid">${D.companions.filter(c=>!s.companions[c.id]).map(c=>`<div class="lead-card"><span class="lead-face">${c.icon}</span><div><strong>${text(c.name)} · ${text(c.role)}</strong><small>Last seen: ${text(D.landmarks.find(l=>l.id===c.place)?.name||'Unknown')}</small><p>${text(c.request)}</p></div></div>`).join('')}</div></section></div>`;
}
function renderSettlements(){
 const current=nearbyCamp();
 let target=s.settlements.find(c=>c.id===activeSettlementId)||current||s.settlements[0];
 if(current)target=current;
 return `<div class="screen-pad">${titleRow('RECLAIM THE WORLD','SETTLEMENTS','Turn ruins into communities. Build defenses, make water, grow food, organize your people, and create a connected network of outposts.')}
 <div class="settlement-summary"><div><span class="eyebrow">YOUR OUTPOSTS</span><strong>${s.settlements.length} / 4</strong></div><div><span class="eyebrow">TOTAL RESIDENTS</span><strong>${s.settlements.reduce((a,c)=>a+c.population,0)}</strong></div><div><span class="eyebrow">RAID PROTECTION</span><strong>${s.settlements.length?Math.round(s.settlements.reduce((a,c)=>a+campDefense(c),0)/s.settlements.length):0}</strong></div></div>
 ${s.settlements.length?`<div class="camp-cards">${s.settlements.map(c=>`<button class="camp-summary ${target?.id===c.id?'selected':''}" data-a="camp-select" data-id="${c.id}"><span>🏘️</span><strong>${text(c.name)}</strong><small>Sector ${c.x},${c.y} · ${c.population} residents</small><small>Morale ${c.morale} · Defenses ${campDefense(c)}</small>${current?.id===c.id?'<em>YOU ARE HERE</em>':''}</button>`).join('')}</div>`:'<div class="empty-card">There are no settlements under your leadership yet. Choose a sector, gather supplies, and lay your first foundation.</div>'}
 ${target?renderCampDetail(target):''}
 ${!current&&!atTown()&&s.settlements.length<4?`<section class="found-card">${titleRow('START FROM NOTHING','FOUND A NEW OUTPOST','Any non-town sector can become your home. Settlement buildings produce resources every day, and your people can defend it while you travel.')}<div class="found-flex"><div class="field"><label for="settlement-name">SETTLEMENT NAME</label><input id="settlement-name" maxlength="28" placeholder="e.g. New Dawn" value="New Dawn ${s.settlements.length+1}"/></div>${btn('found','⚑ Establish Outpost','primary',`${has({wood:7,scrap:10,food:2,water:2})?'':'disabled'}`)}</div><p class="recipe-cost">Requires ${qtyText({wood:7,scrap:10,food:2,water:2})}. Max four outposts.</p></section>`:''}</div>`;
}
function renderCampDetail(c){
 const here=c.x===s.player.x&&c.y===s.player.y;
 const assignments=Object.entries(s.companions).filter(([,a])=>a.campId===c.id).map(([id])=>D.companions.find(z=>z.id===id)).filter(Boolean);
 return `<section class="camp-detail"><div class="camp-detail-head"><div><span class="eyebrow">OUTPOST OPERATIONS</span><h3>${text(c.name)}</h3><p>Population ${c.population}/${2+(c.buildings.barracks||0)*5} · Morale ${c.morale}/100 · Defense ${campDefense(c)} · Next threat estimated after day ${c.nextRaid}</p></div>${here?pill('✓ On site'):btn('plot-camp','Plot route','secondary small',`data-id="${c.id}"`)}</div>
 <div class="storage-head"><span class="eyebrow">COMMUNITY STORES</span><span class="muted">Buildings produce supplies each day. Residents consume food and water.</span></div>
 <div class="camp-storage">${['food','water','scrap','circuit'].map(id=>`<div class="storage-row"><strong>${icon(id)} ${label(id)}</strong><span>×${c.stock[id]||0}</span><div>${btn('claim','Take 20','secondary small',`data-id="${c.id}" data-item="${id}" ${!here||!(c.stock[id]||0)?'disabled':''}`)}${btn('deposit','Give 5','ghost small',`data-id="${c.id}" data-item="${id}" ${!here||!bag(id)?'disabled':''}`)}</div></div>`).join('')}</div>
 <div class="policy-area"><div class="eyebrow">COMMUNITY POLICY · ${text((c.policy||'balanced').toUpperCase())}</div><p>Decide what kind of home this becomes. Policies change production, security and morale. Changing course costs a little trust.</p><div class="policy-options">${[['balanced','⚖️ Balanced','No special bonuses'],['open','🚪 Open Doors','+2 morale / day, more raids'],['fortress','🛡️ Fortress','+7 defense, -1 morale / day'],['harvest','🌱 Harvest First','+2 food / day'],['trade','🪙 Trading Post','+2 scrap / day']].map(([id,head,detail])=>btn('policy',`${head}<small>${detail}</small>`,c.policy===id?'primary':'secondary',`data-id="${id}" data-site="${c.id}" ${!here||c.policy===id?'disabled':''}`)).join('')}</div></div>
 <div class="eyebrow section-spaced">BUILD & UPGRADE · THREE TIERS</div><div class="build-grid">${Object.entries(D.buildings).map(([id,b])=>{const lv=c.buildings[id]||0,cost={};for(const [item,n] of Object.entries(b.base))cost[item]=n*(lv+1);if(s.player.profession==='mechanic'&&cost.scrap)cost.scrap=Math.max(1,cost.scrap-2);if(assignments.some(o=>o.skill==='engineer')&&cost.scrap)cost.scrap=Math.max(1,cost.scrap-2);return `<div class="building"><div class="building-title"><span>${b.icon}</span><strong>${b.name}</strong><em>LV ${lv}/3</em></div><p>${text(b.desc)}</p><small>${b.effect}</small><div class="building-footer"><span>${lv===3?'MAX TIER':qtyText(cost)}</span>${btn('build',lv===3?'Fully built':lv?'Upgrade':'Build','secondary small',`data-id="${id}" data-site="${c.id}" ${!here||lv===3||!has(cost)?'disabled':''}`)}</div></div>`;}).join('')}</div>
 <div class="camp-footer"><div><strong>Assigned specialists:</strong> ${assignments.length?assignments.map(x=>x.name).join(', '):'None'} <small>(manage assignments under Crew while visiting)</small></div>${btn('welcome','Invite new resident (3 rations + 3 water)','secondary',`data-id="${c.id}" ${!here||c.population>=2+(c.buildings.barracks||0)*5||!has({food:3,water:3})?'disabled':''}`)}</div></section>`;
}
function jobProgress(q){if(q.kind==='delivery')return `${Math.min(bag(q.item),q.amount)}/${q.amount} ${label(q.item)} available`;return `${q.progress}/${q.amount}`;}
function renderJournal(){
 const m=mainQuest(),town=currentLandmark(),active=s.quests.filter(q=>!q.claimed),done=s.quests.filter(q=>q.claimed).slice(-5);
 return `<div class="screen-pad">${titleRow('LET THE RECORD SHOW','FIELD JOURNAL','The things you discover, the promises you make, and the messages you decide the world should hear.')}
 <section class="quest-highlight"><div class="eyebrow">PRIMARY STORY // THE LAST FREQUENCY</div><h3>${text(m.label)}</h3><p>${text(m.desc)}</p><div class="relay-progress">${D.landmarks.filter(a=>a.kind==='relay').map(v=>`<div class="relay-item ${s.story.relays.includes(v.id)?'done':''}"><span>${s.story.relays.includes(v.id)?'✓':'◌'}</span><div><strong>${text(v.name)}</strong><small>${v.x}, ${v.y}</small></div></div>`).join('')}</div></section>
 ${town?.kind==='town'?`<section class="board-section">${titleRow('OPPORTUNITY KNOCKS',`${town.name} Job Board`,'Complete work for scrip, experience, and local faction reputation. Choose the kinds of work you believe in.')}<div class="job-offers">${[['supplies','🥫 Food delivery'],['water','💧 Water relief'],['medicine','💊 Antibiotics'],['patrol','⚔️ Bandit patrol'],['survey','🗺️ Map new sectors'],['salvage','🔌 Electronics']].map(([id,title])=>btn('job',title,'secondary small',`data-id="${id}" ${active.length>=5?'disabled':''}`)).join('')}</div></section>`:''}
 <section class="contract-section"><div class="section-label-row"><span class="eyebrow">ACTIVE CONTRACTS</span><span class="muted">${active.length}/5 slots</span></div>${active.length?active.map(q=>`<div class="contract"><div><span class="eyebrow">${text(D.factions[q.faction].name)} · DAY ${q.acceptedDay}</span><h3>${text(q.title)}</h3><p>${text(q.desc)}</p><small>Progress: ${jobProgress(q)} · Return to ${text(D.landmarks.find(x=>x.id===q.townId)?.name)}</small></div><div class="contract-end"><strong>◈ ${q.reward}</strong>${btn('claim-job','Turn in','secondary small',`data-id="${q.id}" ${town?.id===q.townId&&(q.kind==='delivery'?bag(q.item)>=q.amount:q.progress>=q.amount)?'':'disabled'}`)}</div></div>`).join(''):'<div class="empty-card">No active contracts. Visit a friendly settlement to take on meaningful work.</div>'}</section>
 ${done.length?`<div class="eyebrow section-spaced">COMPLETED CONTRACTS</div><p class="muted">${done.map(q=>text(q.title)).join(' · ')}</p>`:''}
 <section class="chronicle-section">${titleRow('THE WORLD REMEMBERS','YOUR CHRONICLE','A permanent record of discoveries, battles, victories, mercy and mistakes.')}
 <div class="filter-row">${[['all','All'],['story','Story'],['companion','People'],['settlement','Settlements'],['combat','Combat']].map(([id,name])=>btn('filter',name,s.ui.filter===id?'primary small':'ghost small',`data-id="${id}"`)).join('')}</div>
 <div class="chronicle">${s.journal.filter(j=>s.ui.filter==='all'||j.type===s.ui.filter||s.ui.filter==='story'&&['quest','ending'].includes(j.type)).slice(0,60).map(j=>`<article class="chronicle-item"><span class="eyebrow">DAY ${j.day} · ${fHour(j.hour)} · ${text(j.type)}</span><h4>${text(j.title)}</h4><p>${text(j.body)}</p></article>`).join('')||'<p>No entries in this category yet.</p>'}</div></section></div>`;
}
function renderRadio(){
 return `<div class="screen-pad">${titleRow('THE WORLD BETWEEN STATIONS','RADIO & SETTINGS','Who has earned your trust? What should survive? Keep a record you can return to on any device.')}
 <div class="radio-display"><div class="radio-led">● SIGNAL ${s.story.relays.length? 'ACTIVE':'WEAK'}</div><div class="radio-spectrum">${Array.from({length:35},(_,i)=>`<span style="height:${12+((i*i*7+s.world.day*11)%71)}%"></span>`).join('')}</div><h3>99.7 FM — THE LAST FREQUENCY</h3><p>${s.story.ending?'"THE SIGNAL IS YOURS. LET THE WORLD REMEMBER."':s.story.relays.length===3?'"STATION ZERO. THREE LIGHTS. THE DOOR IS OPEN."':'"THREE LIGHTS. ONE VOICE. FIND STATION ZERO."'}</p></div>
 <div class="eyebrow section-spaced">FACTION RELATIONSHIPS</div><div class="faction-grid">${Object.entries(D.factions).map(([id,f])=>`<div class="faction-card"><div class="faction-title"><span>${f.icon}</span><strong>${f.name}</strong><b>${s.reputation[id]>0?'+':''}${s.reputation[id]}</b></div><p>${f.desc}</p><div class="reputation-bar"><span style="width:${(s.reputation[id]+100)/2}%;background:${f.color}"></span></div><small>${s.reputation[id]>=50?'Allied':s.reputation[id]>=20?'Friendly':s.reputation[id]>-25?'Neutral':s.reputation[id]>-50?'Distrustful':'Hostile'}</small></div>`).join('')}</div>
 <section class="settings-section">${titleRow('CONFIGURATION','WORLD SETTINGS & SAVE FILES','Game progress is stored automatically on this device. Export a file regularly to protect long campaigns or move to another device.')}
 <div class="settings-row"><div><strong>Visual theme</strong><small>Choose the terminal accent.</small></div><div class="theme-options">${[['amber','Amber'],['mint','Mint'],['violet','Violet'],['ice','Ice']].map(([id,n])=>btn('theme',n,s.ui.theme===id?'primary small':'secondary small',`data-id="${id}"`)).join('')}</div></div>
 <div class="settings-row"><div><strong>Game data</strong><small>Export/import transfers the full world, companions, buildings and journal.</small></div><div class="setting-actions">${btn('save','Save now','secondary small')}${btn('export','↓ Export save','secondary small')}${btn('import','↑ Import save','secondary small')}</div></div>
 <div class="settings-row"><div><strong>Fresh beginning</strong><small>Reset wipes your local campaign. Export it first if needed.</small></div>${btn('restart','Reset campaign','danger small')}</div>
 <div class="helper-text"><strong>GITHUB PAGES / OFFLINE:</strong> No backend required. Saves use this browser's localStorage and do not sync between devices. Export and import JSON files to transfer progress. Private browsing or clearing site data may erase local saves.</div>
 <input id="import-file" type="file" accept=".json,application/json" class="hidden-file" aria-label="Import saved game" />
 </section><section class="settings-section"><div class="eyebrow">HOW TO SURVIVE</div><div class="guide-grid">${D.tips.map(t=>`<div>◈ ${text(t)}</div>`).join('')}</div></section>
 <div class="stats-board"><span>Days: <b>${s.world.day}</b></span><span>Tiles crossed: <b>${s.stats.steps}</b></span><span>Scavenges: <b>${s.stats.scavenges}</b></span><span>Battles survived: <b>${s.stats.battles}</b></span><span>Trade deals: <b>${s.stats.trade}</b></span><span>Allies: <b>${rosterCount()}</b></span></div>
 </div>`;
}
function deepSearch(){
 const l=currentLandmark();if(l?.kind!=='ruin')return;
 const key='deep-'+l.id;if(s.world.searched[key]===s.world.day)return notify('You already searched these depths today.');
 s.world.searched[key]=s.world.day;time(5,1);if(s.dead)return;
 const loot={scrap:4+r(5),circuit:1+r(2),ammo:2+r(5)};
 if(l.id==='hospital'){loot.medicine=2;loot.medkit=1;}if(l.id==='farmstead'){loot.food=5;loot.wood=3;}if(l.id==='quarry'){loot.stone=7;}
 Object.entries(loot).forEach(([id,q])=>addItem(id,q));gainXp(18);
 addJournal('Secrets of '+l.name,`In the depths you found: ${qtyText(loot)}.`,'scavenge');
 if(chance(.42))startCombat(l.id==='quarry'||l.id==='railyard'?'bandits':'infected');
}
function talkCompanion(id){const c=D.companions.find(v=>v.id===id),v=s.companions[id];if(!c||!v)return;
 if(v.lastTalk===s.world.day)return notify(`${c.name} has already had a long conversation with you today.`);
 if(v.campId){const camp=s.settlements.find(a=>a.id===v.campId);if(camp&&(camp.x!==s.player.x||camp.y!==s.player.y))return notify('Visit their settlement to talk in person.');}
 v.lastTalk=s.world.day;v.trust=clamp(v.trust+3);const quote=randomFrom(c.voice);
 addJournal('A conversation with '+c.name,quote+` Trust increased to ${v.trust}.`,'companion');
 if(v.trust>=75&&!v.bonded){v.bonded=true;gainXp(35);addJournal('A bond forged',`${c.name} has come to trust you deeply. Their faith is earned, not assumed.`,'companion');}
}
function exportSave(data){
 const state=data||s;if(!state)return;
 const json=JSON.stringify(state,null,2);
 const blob=new Blob([json],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=`afterfall-${String(state.player.name||'survivor').toLowerCase().replace(/[^a-z0-9-]/g,'-')}-day-${state.world.day}.json`;
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('Save file exported.');
}
function endFlow(){if(!s.dead)mutate(()=>{});else{save();show();}}
ROOT.addEventListener('click',ev=>{
 const b=ev.target.closest('[data-a]');if(!b||b.disabled)return;
 const a=b.dataset.a,id=b.dataset.id,idx=Number(b.dataset.i||0);
 if(a==='choose-prof'){pre.profession=id;const n=$('player-name')?.value;renderStart();if(n)$('player-name').value=n;return;}
 if(a==='choose-difficulty'){pre.difficulty=id;const n=$('player-name')?.value;renderStart();if(n)$('player-name').value=n;return;}
 if(a==='new'){
  if(tryLoad()&&!confirm('Start a new game? This replaces the current local save. You may want to export it first.'))return;
  const n=String($('player-name')?.value||'Wanderer').trim().slice(0,24)||'Wanderer';mutate(()=>fresh(n,pre.profession,pre.difficulty));return;
 }
 if(a==='continue'){const data=tryLoad();if(data)try{load(data);}catch(e){notify(e.message);}return;}
 if(a==='export-old'){const data=tryLoad();if(data)exportSave(data);return;}
 if(a==='restart'){
  if(confirm('Erase this local campaign and return to character creation? Export your save first if you want to keep it.')){s=null;localStorage.removeItem(STORAGE);activeSettlementId=null;renderStart();}return;
 }
 if(a==='goto-explore'){s.tab='explore';show();return;}
 if(a==='tab'){s.tab=id;mutate(()=>{});return;}
 if(a==='radio-tab'){s.tab='radio';mutate(()=>{});return;}
 if(a==='export'){exportSave();return;}
 if(a==='save'){save();notify('Game saved on this device.');return;}
 if(a==='import'){if(!$('import-file')){s.tab='radio';show();}const input=$('import-file');if(input)input.click();return;}
 if(a==='log-expand'){expandedLog=!expandedLog;show();return;}
 if(a==='theme'){s.ui.theme=id;mutate(()=>{});return;}
 if(a==='filter'){s.ui.filter=id;mutate(()=>{});return;}
 if(!s||s.dead)return;
 mutate(()=>{
  if(a==='map'){const x=Number(b.dataset.x),y=Number(b.dataset.y);if(Math.abs(x-s.player.x)+Math.abs(y-s.player.y)===1){s.route=[];move(x,y);}else plotRoute(x,y);}
  else if(a==='move'){s.route=[];move(s.player.x+Number(b.dataset.dx),s.player.y+Number(b.dataset.dy));}
  else if(a==='continue-route')continueRoute();
  else if(a==='cancel-route')s.route=[];
  else if(a==='scout')scout();
  else if(a==='scavenge')scavenge();
  else if(a==='forage')forage();
  else if(a==='rest')rest();
  else if(a==='deep-search')deepSearch();
  else if(a==='choose')resolveChoice(idx);
  else if(a==='fight')combatAction(id,idx);
  else if(a==='use')useItem(id);
  else if(a==='craft')craft(id);
  else if(a==='buy')barter('buy',id);
  else if(a==='sell')barter('sell',id);
  else if(a==='relay')repairRelay(id);
  else if(a==='ending')finale(id);
  else if(a==='recruit')companionRecruit(id);
  else if(a==='comp-heal')healCompanion(id);
  else if(a==='comp-talk')talkCompanion(id);
  else if(a==='comp-state')setCompanionStatus(id,b.dataset.mode,Number(b.dataset.site));
  else if(a==='stat'){if(s.player.statPoints&&s.player.stats[id]<10){s.player.statPoints--;s.player.stats[id]++;if(id==='grit'){s.player.maxHp+=5;s.player.hp+=5;}}}
  else if(a==='found')beginSettlement();
  else if(a==='camp-select')activeSettlementId=Number(id);
  else if(a==='build')upgradeBuilding(Number(b.dataset.site),id);
  else if(a==='policy')campPolicy(Number(b.dataset.site),id);
  else if(a==='aid')giveFactionAid();
  else if(a==='pact')pledgeAlliance();
  else if(a==='claim')collectStock(Number(id),b.dataset.item);
  else if(a==='deposit')depositStock(Number(id),b.dataset.item);
  else if(a==='welcome')welcomeSurvivors(Number(id));
  else if(a==='plot-camp'){const c=s.settlements.find(q=>q.id===Number(id));if(c){s.tab='explore';plotRoute(c.x,c.y);}}
  else if(a==='job')addJob(id);
  else if(a==='claim-job')claimJob(id);
 });
});
ROOT.addEventListener('change',ev=>{
 if(ev.target.id==='import-file'){
  const file=ev.target.files?.[0];if(!file)return;
  if(file.size>10_000_000)return notify('Save file exceeds 10MB limit.');
  const reader=new FileReader();reader.onload=()=>{
   try{const data=JSON.parse(String(reader.result));if(!isSave(data))throw new Error('Not an AFTERFALL save file.');
    if(confirm(`Load ${data.player.name}'s Day ${data.world.day} campaign? This will replace your current local save.`)){load(data);notify('Saved campaign imported.');}
   }catch(e){notify(`Import failed: ${e.message}`);}
  };reader.onerror=()=>notify('Unable to read this save file.');reader.readAsText(file);
 }
});
document.addEventListener('keydown',ev=>{
 const tag=document.activeElement?.tagName||'';if(['INPUT','TEXTAREA','SELECT'].includes(tag)||!s||s.tab!=='explore'||s.dead||s.encounter||s.combat)return;
 const v={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]}[ev.key];
 if(v){ev.preventDefault();mutate(()=>{s.route=[];move(s.player.x+v[0],s.player.y+v[1]);});}
});
// Install a scoped, versioned offline cache on GitHub Pages (HTTPS).
if('serviceWorker' in navigator && location.protocol==='https:'){
 window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').then(reg=>reg.update()).catch(()=>{}));
}
// Autosaved every meaningful action. The first render is the title screen.
try{cachedSave=tryLoad();}catch(e){cachedSave=null;}
show();
// Non-destructive inspection hook for automated browser tests and local debugging.
window.AF_DEBUG={getState:()=>s?structuredClone(s):null, getDefinitions:()=>D, loadState:(v)=>load(v)};
})();
