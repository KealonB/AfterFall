/* AFTERMATH — mobile-only text RPG. No frameworks, server, tracking, or external dependencies. */
(()=>{'use strict';
const VERSION='0.1.0';
const SAVE_KEY='aftermath.mobile.save.v1';
const $=s=>document.querySelector(s);
const h=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
const scenarioData={
 blackout:{name:'THE BLACKOUT',tag:'The power is gone. The clock is running.',intro:'At 7:14 AM, transmission systems fail across the region. Emergency generators catch part of the load. Nobody has a reliable explanation. Fuel, water pressure, and information may soon become more valuable than money.',events:[
 [480,'Traffic lights remain dark. Sirens multiply across the city.'],[690,'Unconfirmed radio reports suggest failures beyond the Kansas City metro.'],[1050,'Water pressure is weakening in several neighborhoods.'],[1950,'Backup generators have started running out of fuel.'],[2580,'Shelters report shortages as fuel distribution stalls.'],[3310,'People are forming queues outside stores that can still open.'],[4320,'Three days without grid power. Temporary arrangements are becoming permanent.']]},
 infection:{name:'THE INFECTION',tag:'Something is spreading.',intro:'Emergency departments fill with patients showing unusual symptoms. Public guidance is contradictory. Some sick people become violent, and rumors spread faster than any verified reports.',events:[[480,'Hospitals are restricting entrances as patient numbers surge.'],[690,'Ambulance crews report escalating violence.'],[1050,'Officials advise avoiding unnecessary contact.'],[1950,'Several neighborhoods have established informal barricades.'],[2580,'Medical supplies are running dangerously low.'],[3310,'Large sections of the city are being abandoned.'],[4320,'Three days in, survivors have begun organizing local safe zones.']]},
 fallout:{name:'THE FALLOUT',tag:'The horizon flashes. The radios fall silent.',intro:'A distant flash shakes windows. Emergency sirens sound, then reports of strikes arrive in fragments. The immediate question is where to shelter and whether the air outside is safe.',events:[[480,'Emergency warnings urge residents to shelter indoors.'],[690,'Visible haze moves across the region; its composition is unknown.'],[1050,'Outside activity is decreasing as people seek shelter.'],[1950,'Scattered radio signals report overwhelmed aid stations.'],[2580,'Shelter supplies are running low.'],[3310,'Travelers report some roads are blocked by checkpoints.'],[4320,'Three days since the strikes. Reliable information remains scarce.']]},
 fracture:{name:'THE FRACTURE',tag:'The institutions were weaker than anyone knew.',intro:'An escalating political and economic crisis disrupts payment systems, transport, and essential services. Coordinated work stoppages and localized violence spread; authority becomes uncertain.',events:[[480,'Banking and transaction outages cause long store lines.'],[690,'Police request that residents avoid several downtown corridors.'],[1050,'Neighborhood groups begin forming patrols.'],[1950,'Regional deliveries have nearly stopped.'],[2580,'An armed group has occupied a freight yard.'],[3310,'Local communities argue over access to scarce resources.'],[4320,'Three days later, different groups claim authority over different streets.']]},
 winter:{name:'THE LONG WINTER',tag:'The cold is outlasting the forecasts.',intro:'A brutal storm overwhelms transport and power infrastructure. Temperatures plunge and daylight is obscured by snow. Shelter, heat and food are immediate concerns.',events:[[480,'Schools announce indefinite closures; roads begin icing over.'],[690,'Multiple neighborhoods have lost power and heat.'],[1050,'Shelter capacity is nearly full.'],[1950,'Snowplows cannot reach several residential districts.'],[2580,'Fuel and warming centers become the focus of local relief.'],[3310,'Food deliveries are suspended across much of the metro.'],[4320,'Three days of cold have reshaped where people can live.']]}
};
const backgrounds={
 technician:{name:'Electrical / Facilities Technician',skill:'Power systems, generators, electrical troubleshooting.',gear:{multitool:1,flashlight:1,meter:1,battery:2},desc:'You recognize dangerous equipment and are useful wherever infrastructure fails.'},
 paramedic:{name:'Paramedic',skill:'Triage, first aid, emergency care.',gear:{medkit:1,bandage:2,flashlight:1},desc:'You can stabilize injuries, but people will depend on you.'},
 mechanic:{name:'Automotive Mechanic',skill:'Vehicle repairs, engines, fuel systems.',gear:{toolkit:1,flashlight:1,parts:2},desc:'You can keep transport running while others are stranded.'},
 teacher:{name:'School Teacher',skill:'Negotiation, organizing groups, calming panic.',gear:{notebook:1,flashlight:1,bandage:1},desc:'You build trust and keep groups organized under strain.'},
 logistics:{name:'Warehouse Supervisor',skill:'Inventory, storage, rationing, planning.',gear:{notebook:1,radio:1,flashlight:1},desc:'You can coordinate scarce resources and supply networks.'},
 civilian:{name:'Everyday Civilian',skill:'Flexible generalist; develops skills through use.',gear:{flashlight:1,bandage:1,food:1},desc:'You start without a specialty, but learn by surviving.'}
};
const traits={
 calm:{name:'Calm Under Pressure',desc:'Handles crises steadily; hidden stress can build unnoticed.'},
 methodical:{name:'Methodical',desc:'Careful searches and repairs have fewer mishaps, but take longer.'},
 persuasive:{name:'Persuasive',desc:'Negotiation succeeds more often; some survivors distrust smooth talkers.'},
 vigilant:{name:'Vigilant',desc:'Spots trouble early, but resting away from home is harder.'},
 resourceful:{name:'Resourceful',desc:'Improves scavenging and crafting efficiency.'},
 stubborn:{name:'Strong-Willed',desc:'Resists intimidation, but makes compromise harder.'}
};
const itemData={
 multitool:{name:'Multitool',weight:.3},flashlight:{name:'Flashlight',weight:.3},meter:{name:'Electrical meter',weight:.6},battery:{name:'Spare batteries',weight:.12},
 water:{name:'Bottled water',weight:.6},food:{name:'Food ration',weight:.35},bandage:{name:'Bandages',weight:.08},medkit:{name:'Medical kit',weight:1},
 scrap:{name:'Scrap components',weight:.7},parts:{name:'Mechanical parts',weight:1.2},wood:{name:'Lumber',weight:2},fuel:{name:'Fuel canister',weight:3},
 toolkit:{name:'Tool kit',weight:3},radio:{name:'Portable radio',weight:.4},notebook:{name:'Notebook',weight:.15},filter:{name:'Water filter',weight:.4},
 phone:{name:'Phone (no service)',weight:.2},rope:{name:'Utility rope',weight:1},medicine:{name:'Antibiotics',weight:.1},coat:{name:'Warm coat',weight:1.3}
};
const locationData={
 hospital:{name:'St. Alden Medical Center',area:'MIDTOWN',danger:2,dist:'Emergency generators, crowded corridors, urgent choices.',desc:{blackout:'The corridors are lit by strips of emergency lighting. From behind a closed door, an alarm sounds steadily.',infection:'The waiting room is packed. Staff wear improvised protective gear, and a guard blocks the main entrance.',fallout:'Staff gather patients away from exterior windows. Emergency warnings echo from battery radios.',fracture:'Hospital security is closing entrances as displaced patients arrive.',winter:'Cold air enters through a damaged loading-bay door. Staff are moving patients toward heated rooms.'},stock:{water:2,bandage:3,battery:1,medicine:1,scrap:2},lootChance:.85},
 home:{name:'Maple Street Neighborhood',area:'WEST SIDE',danger:1,dist:'Residential streets, nearby houses, possible shelter.',desc:{blackout:'Refrigerators have gone silent. Outside, several neighbors stand beside cars checking their phones.',infection:'Curtains move behind closed windows. Someone has taped a handwritten quarantine sign to a door.',fallout:'Houses are closed up and windows covered. A distant column of smoke rises beyond the rooftops.',fracture:'Neighbors gather in small groups to discuss whether the disturbances will reach their street.',winter:'Snow pushes against the front steps. With the heat out, indoor temperatures are dropping.'},stock:{water:4,food:3,wood:2,bandage:1,radio:1},lootChance:.92},
 highway:{name:'I-35 Service Road',area:'SOUTH CORRIDOR',danger:3,dist:'Abandoned vehicles, backed-up traffic, exposed roadway.',desc:{blackout:'Signal lights are dark. Cars crowd the shoulder around a stalled delivery truck.',infection:'Traffic sits motionless. A driver pounds on a locked bus door as people keep their distance.',fallout:'The highway is almost empty, apart from stranded cars and people taking shelter beneath an overpass.',fracture:'A roadblock separates traffic into lines. Nobody seems sure who put it there.',winter:'Vehicles sit half-buried beneath drifting snow. Wind erases footsteps within minutes.'},stock:{fuel:1,parts:2,water:1,rope:1},lootChance:.8},
 factory:{name:'North River Industrial Plant',area:'RIVER DISTRICT',danger:3,dist:'Machine rooms, stores, skilled workers, safety hazards.',desc:{blackout:'Production lines have stopped in mid-cycle. A supervisor is trying to account for the maintenance crew.',infection:'Workers gather near a locked gate while management debates whether to shut down.',fallout:'Workers shelter in concrete maintenance rooms as the security shutters descend.',fracture:'The main gates are chained, and a small group of workers controls access.',winter:'Wind rattles the roof panels. The heating plant is struggling against the cold.'},stock:{scrap:4,parts:3,battery:2,fuel:1},lootChance:.9},
 hardware:{name:'Westside Hardware',area:'MARKET DISTRICT',danger:2,dist:'Practical supplies, anxious customers, nervous manager.',desc:{blackout:'The registers are dead. A clerk is handwriting prices as an argument grows near the checkout.',infection:'The store has taped off the entrance. Customers ask about masks, filters, and medicine.',fallout:'Shelves of batteries and water containers are nearly empty. Customers cluster near the radio aisle.',fracture:'A guard watches the front door while shoppers debate whether electronic payments are coming back.',winter:'Boot prints cover the floor. People are competing for batteries, heaters, and insulation.'},stock:{wood:3,scrap:3,battery:4,rope:2,filter:1},lootChance:.88},
 station:{name:'Hawthorne Fuel Stop',area:'OUTER LOOP',danger:3,dist:'Fuel pumps, convenience store, anxious travelers.',desc:{blackout:'The pumps are silent. A hand-written sign reads: CASH ONLY — PUMPS DOWN.',infection:'A small queue of drivers waits outside the shuttered shop. People avoid standing close together.',fallout:'Most fuel pumps are taped off. Travelers watch the horizon instead of the road.',fracture:'A security volunteer stands in front of the pumps. Fuel is being rationed.',winter:'The pumps are iced over. A few stranded motorists have gathered inside the store.'},stock:{fuel:3,food:2,water:2,battery:1},lootChance:.82},
 shelter:{name:'Lincoln Community School',area:'CIVIC DISTRICT',danger:1,dist:'Cots, volunteers, basic supplies, displaced families.',desc:{blackout:'Families sit along the gym wall beneath battery lanterns. Volunteers make lists on clipboards.',infection:'A sign at the entrance announces symptom screening. Tired volunteers direct families into separate rooms.',fallout:'People sit on cots beneath taped windows while a portable radio hisses.',fracture:'Community volunteers are registering displaced residents; arguments erupt over who can stay.',winter:'The gym is warm but crowded. Steam rises from wet coats hung along the railing.'},stock:{water:3,food:2,bandage:2},lootChance:.58},
 waterworks:{name:'Riverside Water Works',area:'EAST BANK',danger:3,dist:'Pumps, chemical stores, maintenance bays and city water.',desc:{blackout:'Control panels are dark. An operator watches pressure gauges that are sinking slowly.',infection:'Utility operators are understaffed and worried about keeping water service running.',fallout:'Staff are testing incoming water and restricting access to the treatment building.',fracture:'Workers guard the gate; the entire district needs their pumps kept online.',winter:'Ice forms near exposed pipes. Operators fear pressure failures overnight.'},stock:{filter:2,water:3,parts:2,scrap:2},lootChance:.78},
 farm:{name:'Hollow Creek Farm',area:'RURAL OUTSKIRTS',danger:1,dist:'A modest farm, stored food, well water and quiet fields.',desc:{blackout:'A windmill turns beside a barn. Somebody has already begun covering the fuel tank.',infection:'The front gate is chained and a family watches the road from the porch.',fallout:'The family has sealed its root cellar and set out buckets beneath a covered porch.',fracture:'A hand-painted sign warns visitors to stop at the gate and call out.',winter:'The barns are drifted in. Smoke from a stove chimney promises heat.'},stock:{food:5,water:3,wood:4,rope:1},lootChance:.75}
};
const locations=Object.keys(locationData);
const locationCoords={hospital:[2,2],home:[0,2],highway:[3,5],factory:[3,0],hardware:[1,3],station:[5,3],shelter:[3,2],waterworks:[5,1],farm:[0,6]};
const npcData={
 mara:{name:'Mara Chen',role:'Charge nurse',place:'hospital',skill:'medicine',intro:'Mara Chen moves briskly between patient rooms, keeping her voice steady despite the commotion.',aim:'Keep vulnerable patients safe.',talk:'"We can work with bad news," Mara says. "We cannot work with people hiding things."'},
 ben:{name:'Ben Ortiz',role:'Maintenance operator',place:'hospital',skill:'mechanical',intro:'Ben Ortiz is kneeling beside a maintenance binder with a pencil between his teeth.',aim:'Keep the emergency generator running.',talk:'"If that generator quits, we lose more than the lights," Ben says.'},
 jae:{name:'Jae Park',role:'Neighbor and volunteer',place:'home',skill:'organization',intro:'Jae Park carries bottled water between two houses and looks relieved to see someone calm.',aim:'Account for neighbors who need help.',talk:'"I have three houses to check," Jae says. "Nobody seems to know what is going on."'},
 robert:{name:'Robert Vale',role:'Plant supervisor',place:'factory',skill:'operations',intro:'Robert Vale is trying to organize a head count at the production floor entrance.',aim:'Make sure the shift goes home safely.',talk:'"We secure the site before we touch a thing," Robert says.'},
 nina:{name:'Nina Patel',role:'Hardware store manager',place:'hardware',skill:'trade',intro:'Nina Patel stands behind the counter, writing purchases in a spiral notebook.',aim:'Keep the store orderly and serve regular customers.',talk:'"I don’t know when card payments will return," Nina says. "I can still make a fair trade."'},
 eli:{name:'Eli Ward',role:'Station attendant',place:'station',skill:'navigation',intro:'Eli Ward is watching the silent pumps from behind the shop window.',aim:'Protect the small remaining fuel supply.',talk:'"Nobody gets fuel they haven’t paid for," Eli says. "Unless this really is the end."'},
 rosa:{name:'Rosa Alvarez',role:'Farmer',place:'farm',skill:'farming',intro:'Rosa Alvarez stands beside a garden cart, studying your approach.',aim:'Protect her family and maintain food supplies.',talk:'"I can grow food," Rosa says. "But I can’t feed every stranger that comes up this road."'},
 darius:{name:'Darius Cole',role:'Shelter coordinator',place:'shelter',skill:'organization',intro:'Darius Cole checks names on a clipboard beside the gymnasium entrance.',aim:'Keep shelter residents fed and safe.',talk:'"We need hands, not rumors," Darius says.'},
 priya:{name:'Priya Shah',role:'Water plant operator',place:'waterworks',skill:'engineering',intro:'Priya Shah is calling out gauge readings to a coworker.',aim:'Keep municipal water safe and flowing.',talk:'"We can lose electricity," Priya says. "We cannot afford to lose clean water."'},
 tom:{name:'Tom Mercer',role:'Stranded delivery driver',place:'highway',skill:'transport',intro:'Tom Mercer is checking a damaged wheel on a delivery truck.',aim:'Get home to his partner.',talk:'"There are people stuck in their cars up ahead," Tom says. "They’ll need help."'}
};
const setupDefault={scenario:'blackout',name:'Alex Morgan',background:'technician',trait:'calm',location:'hospital'};
let draft={...setupDefault},setupStep=2,setupPage=0;
let state=null;
let ui={tab:'story',actionPage:0,narrativePage:0,listPage:0,moreSub:'journal',person:null,modal:null,command:''};
let toastTimer;
function save(){if(state){try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));}catch(e){showToast('Save failed: phone storage is unavailable.');}}}
function load(){try{const o=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(o&&o.version===VERSION&&o.player&&o.world&&o.scene&&o.time>=434)return o;}catch(e){}return null;}
function showToast(msg){let n=$('#toast');if(!n){n=document.createElement('div');n.id='toast';document.body.appendChild(n);}n.textContent=msg;clearTimeout(toastTimer);toastTimer=setTimeout(()=>n.remove(),2300);}
function rng(){let x=state.rng|0;x^=x<<13;x^=x>>>17;x^=x<<5;state.rng=x|0;return (x>>>0)/4294967296;}
function roll(p){return rng()<p;}
function timeLabel(t=state.time){let d=Math.floor((t-434)/1440),m=t%1440,hr=Math.floor(m/60);return `DAY ${d} · ${String(hr%12||12).padStart(2,'0')}:${String(m%60).padStart(2,'0')} ${hr>=12?'PM':'AM'}`;}
function day(){return Math.max(0,Math.floor((state.time-434)/1440));}
function narr(title,text,kind='STORY'){state.scene={title,text:Array.isArray(text)?text:[text],kind};ui.narrativePage=0;ui.actionPage=0;ui.tab='story';}
function entry(text,includeJournal=true){const e={time:state.time,text};state.ledger.unshift(e);state.ledger=state.ledger.slice(0,100);if(includeJournal){state.journal.unshift(e);state.journal=state.journal.slice(0,110);}}
function changeTrust(id,amount,why){const n=state.world.npcs[id];if(!n)return;n.trust=clamp(n.trust+amount,-100,100);if(why)n.memories.unshift(`${timeLabel()}: ${why}`);n.memories=n.memories.slice(0,8);}
function has(item,num=1){return (state.player.items[item]||0)>=num;}
function add(item,num=1){state.player.items[item]=(state.player.items[item]||0)+num;}
function take(item,num=1){if(!has(item,num))return false;state.player.items[item]-=num;if(state.player.items[item]<=0)delete state.player.items[item];return true;}
function weight(){return Object.entries(state.player.items).reduce((a,[k,v])=>a+(itemData[k]?.weight||0)*v,0);}
function netCondition(){const p=state.player;if(p.hydration<=0||p.hunger<=0)p.health=clamp(p.health-2);if(p.energy<=0)p.health=clamp(p.health-1);if(p.health<=0){state.dead=true;entry(`${p.name} succumbed to injuries and exhaustion.`);narr('The End',"You fought for every hour. The world continues without you. Your decisions remain part of its history.",'LEGACY');}}
function advance(min,exertion=0){if(state.dead)return;const old=state.time;state.time+=min;const p=state.player;
 p.energy=clamp(p.energy-min*.008-exertion);
 p.hydration=clamp(p.hydration-min*.021);
 p.hunger=clamp(p.hunger-min*.011);
 if(p.hydration<=0)p.health=clamp(p.health-min*.021);
 if(p.hunger<=0)p.health=clamp(p.health-min*.004);
 if(p.energy<=0)p.health=clamp(p.health-min*.008);
 if(p.hydration<22)p.stress=clamp(p.stress+min*.008);
 if(p.energy<20)p.stress=clamp(p.stress+min*.008);
 const milestones=scenarioData[state.scenario].events;
 for(let i=0;i<milestones.length;i++){
  const [mark,msg]=milestones[i];const stamp=434+mark;if(old<stamp&&state.time>=stamp&&!state.world.events[i]){
   state.world.events[i]=true;state.world.unrest=clamp(state.world.unrest+9);
   if(i===0||i===2&&(state.location==='home'||state.location==='waterworks')||i===6)entry(msg);
   state.world.reports.push({time:stamp,text:msg});state.world.reports=state.world.reports.slice(-12);
   if(i>=2)state.world.waterPressure=clamp(state.world.waterPressure-24);
   if(i===3&&!state.flags.hospitalPower)state.world.npcs.mara.trust=clamp(state.world.npcs.mara.trust-3,-100,100);
   if(i===6){state.flags.first72=true;entry('You survived the first 72 hours. The world remains open.');}
  }
 }
 if(day()>=1&&old%1440>state.time%1440){
   const r=state.world.npcs;
   if(r.jae&&!r.jae.companion&&r.jae.place==='home')r.jae.memories.unshift('Checked nearby households as the outage continued.');
   if(r.nina&&!r.nina.companion)r.nina.memories.unshift('Kept a written record of the store inventory.');
 }
 netCondition();
}
function createGame(){const g={version:VERSION,seed:Date.now(),rng:(Date.now()^(Math.random()*0xffffffff))|0,scenario:draft.scenario,time:434,location:draft.location,
 player:{name:(draft.name||'Alex Morgan').trim().slice(0,38)||'Alex Morgan',background:draft.background,trait:draft.trait,health:100,energy:100,hydration:100,hunger:100,stress:8,exposure:0,injuries:[],items:{phone:1,water:1,food:1,...backgrounds[draft.background].gear},reputation:0},
 world:{unrest:4,waterPressure:100,events:{},reports:[],sites:{},npcs:{},base:{formed:false,fortifications:0,residents:1,stores:{food:0,water:0},name:'Maple Street Safehouse'}},flags:{},dead:false,
 discovered:[draft.location,'hospital','home','hardware','shelter','station'],visits:{[draft.location]:1},ledger:[],journal:[],scene:{title:'',text:[],kind:'STORY'}};
 locations.forEach(id=>{g.world.sites[id]={stocks:{...locationData[id].stock},searched:0,secured:false};});
 Object.entries(npcData).forEach(([id,n])=>{g.world.npcs[id]={place:n.place,trust:id==='jae'?24:10,met:false,companion:false,resident:false,tradeStock:3,memories:[],helped:false};});
 if(draft.location==='highway'){g.player.items.fuel=1;g.flags.vehicle=true;}
 state=g;entry(`Crisis begins: ${scenarioData[state.scenario].name}. Extent and cause unknown.`);entry(`Started at ${locationData[state.location].name}.`);
 const desc=locationData[state.location].desc[state.scenario];
 const starts={
 blackout:{hospital:'The overhead lights cut out mid-shift. A heartbeat later, a generator catches in the distance. A nurse calls down the hall: “Can anyone check the building systems?”',home:'The kitchen clock goes blank. Outside, two cars stop at an unlit intersection. A neighbor calls across the street, asking if your power is out too.',highway:'Every traffic signal ahead has turned black. Brake lights ripple across the road. A delivery truck sits at an odd angle on the shoulder.',factory:'The production line stops abruptly. Without the motors, a sharp alarm can be heard from the far end of the plant.',hardware:'The store falls suddenly quiet as its lights and registers shut off. The manager calls for everyone to remain calm.'},
 infection:{hospital:'Two paramedics arrive with another violently ill patient. The charge nurse asks staff to clear a room, but every available bed is already full.',home:'Your phone vibrates with conflicting alerts about a spreading illness. Across the street, an ambulance arrives without its siren.',highway:'Traffic slows around an ambulance stopped on the shoulder. A cluster of frightened motorists backs away from a coughing driver.',factory:'A worker collapses near the time clock. The supervisor tells everyone to keep their distance until medical staff arrive.',hardware:'Customers argue over masks, gloves and bottled water. A cashier suddenly leaves the register, looking pale and unsteady.'},
 fallout:{hospital:'A distant flash washes through the windows. Seconds later, a low rumble reaches the hospital and alarms begin to sound.',home:'The sky flashes beyond the rooftops. Several seconds later, the windows rattle. Your phone displays an emergency shelter warning.',highway:'A distant flash lights the overpass. Cars brake hard, and people begin abandoning vehicles to look for shelter.',factory:'A violent flash illuminates the factory windows. Supervisors order everyone away from exterior walls as emergency alerts begin.',hardware:'The front windows turn stark white for an instant. Someone shouts that there has been an explosion far beyond the city.'},
 fracture:{hospital:'The hospital payment terminals fail as a protest outside swells. Security begins restricting public access to the lobby.',home:'A message from your bank says transfers are temporarily unavailable. Across the street, neighbors argue about reports of unrest downtown.',highway:'Traffic stalls behind an improvised checkpoint. Angry drivers leave their cars to ask who has the authority to block the road.',factory:'The morning shift refuses to start until management explains whether wages will be paid. Security closes the loading gate.',hardware:'The register declines every bank card. A customer shouts that the banks have frozen accounts, and another accuses the cashier of lying.'},
 winter:{hospital:'Snow batters the windows. A maintenance warning announces a heating fault as staff begin moving patients away from a cold wing.',home:'Wind-driven snow erases the sidewalk. The house heater cuts out, and an emergency alert warns against unnecessary travel.',highway:'A sudden wall of snow wipes out visibility. Vehicles slide into the shoulder as the temperature plummets.',factory:'The loading dock doors have frozen partly open. A supervisor reports that the heating plant cannot maintain indoor temperatures.',hardware:'A crowd demands batteries and insulation while snow piles against the doors. The forecast has worsened again.'}
 };
 narr(state.scenario==='blackout'?'The Moment Everything Stopped':'The First Signs',[starts[state.scenario][state.location],desc,'You cannot yet know how widespread this is. Your next decision is yours.'],'DAY ZERO');
 ui={tab:'story',actionPage:0,narrativePage:0,listPage:0,moreSub:'journal',person:null,modal:null,command:''};save();render();
}
function paragraphsToPages(lines){const pages=[];for(const s of lines){let remainder=s.trim();while(remainder.length){if(remainder.length<=195){pages.push(remainder);break;}let cut=remainder.lastIndexOf(' ',195);if(cut<90)cut=195;pages.push(remainder.slice(0,cut).trim());remainder=remainder.slice(cut).trim();}}return pages.length?pages:['...'];}
function locationPresentNPCs(){return Object.keys(npcData).filter(id=>state.world.npcs[id].place===state.location);}
function nearbyFriends(){return Object.keys(npcData).filter(id=>state.world.npcs[id].companion);}
function listAction(label,code,detail='',tier=''){return {label,code,detail,tier};}
function getActions(){if(!state||state.dead)return [listAction('Begin a new survival story','new')];
 if(state.encounter){const e=state.encounter;return [listAction('Observe and look for a safe exit','encObserve'),listAction('Try talking them down','encTalk'),listAction('Retreat without engaging','encRetreat'),listAction('Take cover and defend yourself','encFight')];}
 let a=[listAction('Look around carefully','look'),listAction('Search this location for supplies','scavenge')];
 const id=state.location;
 if(id==='hospital'&&['blackout','winter','fallout'].includes(state.scenario)&&!state.flags.hospitalPower)a.push(listAction('Investigate the emergency generator','repairHospital'));
 if(id==='hospital'&&!state.flags.patientsHelped)a.push(listAction('Help organize the overwhelmed patients','helpPatients'));
 if(id==='home'&&!state.world.base.formed)a.push(listAction('Establish your house as a safehouse','establish'));
 if(id==='home'&&state.world.base.formed)a.push(listAction('Improve the safehouse defenses','fortify'));
 if(id==='factory'&&!state.flags.factorySafe)a.push(listAction('Help shut down unsafe equipment','secureFactory'));
 if(id==='highway'&&!state.flags.driverHelped)a.push(listAction('Help the stranded delivery driver','helpDriver'));
 if(id==='waterworks'&&!state.flags.pumpsStable)a.push(listAction('Offer help stabilizing the water pumps','fixWater'));
 if(id==='shelter')a.push(listAction('Volunteer for a shelter shift','volunteer'));
 if(id==='farm')a.push(listAction('Offer a hand with farm work','farmWork'));
 if(id==='hardware')a.push(listAction('Ask the manager about useful supplies','shop'));
 if(id==='station')a.push(listAction('Ask about fuel availability','fuelTalk'));
 if(has('radio')||state.location==='home'||state.location==='shelter')a.push(listAction('Check for any credible news','radio'));
 if(state.location==='home'||state.location==='shelter'||state.location==='farm')a.push(listAction('Rest in relative safety (2 hours)','rest'));
 if(id==='home'||id==='shelter'||id==='farm'||id==='factory')a.push(listAction('Sleep for six hours','sleep'));
 a.push(listAction('Wait and observe (30 minutes)','wait'));
 a.push(listAction('Attempt a custom action','command'));
 return a;
}
function sceneAction(code){if(!state)return;let p=state.player,loc=state.location,ld=locationData[loc];
 if(code==='command'){ui.modal='command';render();return;}
 if(code==='new'){ui.modal='reset';render();return;}
 if(state.dead)return;
 if(state.encounter){encounterAction(code);return;}
 switch(code){
 case 'look':{
  advance(p.trait==='vigilant'?5:8,1);const people=locationPresentNPCs().map(id=>npcData[id].name);
  const stock=Object.entries(state.world.sites[loc].stocks).filter(([,n])=>n>0).map(([k])=>itemData[k].name.toLowerCase());
  const details=[ld.desc[state.scenario],people.length?`You can see ${people.join(', ')} nearby.`:'There is no one immediately willing to speak.',stock.length?'There may still be recoverable supplies here, but searching takes time.':'Anything useful here has likely already been taken.'];
  if(state.scenario==='fallout'&&loc==='highway')details.push('You cannot judge airborne contamination without appropriate instruments.');
  narr('Taking Stock',details,'OBSERVATION');break;}
 case 'scavenge':{
  advance(p.trait==='methodical'?34:25,5);const stock=state.world.sites[loc].stocks;const pool=Object.keys(stock).filter(k=>stock[k]>0&&weight()+(itemData[k]?.weight||0)<=18);
  state.world.sites[loc].searched++;
  if(pool.length===0){narr('Nothing Left','You check cabinets, corners, and storage bins. There is nothing safe and useful left to carry here.','SCAVENGE');break;}
  const gainCount=(p.trait==='resourceful'||p.background==='logistics')&&roll(.35)?2:1;
  const gathered=[];
  for(let i=0;i<gainCount;i++){const avail=Object.keys(stock).filter(k=>stock[k]>0&&weight()+(itemData[k]?.weight||0)<=18);if(!avail.length)break;const it=avail[Math.floor(rng()*avail.length)];stock[it]--;add(it);gathered.push(itemData[it].name);}
  const noticed=(loc==='hospital'||loc==='hardware'||loc==='farm'||loc==='station')&&locationPresentNPCs().length>0;
  if(noticed){let owner={hospital:'mara',hardware:'nina',farm:'rosa',station:'eli'}[loc];changeTrust(owner,-4,'Saw Alex searching for supplies without first discussing it.');}
  entry(`Scavenged ${gathered.join(' and ')} at ${ld.name}.`,false);
  const txt=[`You find ${gathered.join(' and ')} and add it to your pack. These supplies are now gone from this location.`,noticed?'Someone nearby notices you gathering supplies. They may not consider the items yours to take.':'You find no one immediately challenging your claim.'];
  if((day()>=1||locationData[loc].danger>=3)&&roll(.11+state.world.unrest/550)){state.encounter={type:state.scenario==='infection'?'infected':'strangers',round:0};txt.push('Before you can leave, movement at the entrance makes you stop. You are not alone.');}
  narr('Scavenging',txt,'SUPPLIES');break;}
 case 'repairHospital':{
  advance(55,10);
  if(p.background==='technician'||p.background==='mechanic'||has('meter')){
   state.flags.hospitalPower=true;changeTrust('mara',23,'Alex helped restore stable local emergency power.');changeTrust('ben',25,'Alex helped troubleshoot the generator safely.');p.reputation=clamp(p.reputation+7,-100,100);entry('Hospital emergency generation stabilized; staff gained valuable time.');
   narr('A Second Chance',["After a careful inspection with Ben, you identify an issue in the generator’s monitoring system. You isolate the fault using site safety procedures and help him restore steady emergency output.",'Several patient rooms regain reliable emergency power. Mara grips your shoulder. “You just bought us time.”'],'INFRASTRUCTURE');
  }else{p.energy=clamp(p.energy-6);p.stress=clamp(p.stress+5);narr('Beyond Your Tools','The problem is more involved than you can safely diagnose. You choose not to guess with live critical equipment. Ben asks whether you can find someone with the right experience.','INFRASTRUCTURE');}break;}
 case 'helpPatients':{
  advance(55,7);state.flags.patientsHelped=true;changeTrust('mara',p.background==='paramedic'?24:15,'Alex helped care for frightened patients during the failure.');
  entry('Helped the hospital staff organize and reassure patients.');narr('The Human Part',p.background==='paramedic'?'You assist with triage and support the nursing staff, conserving scarce equipment. Several patients finally receive attention.':'You move chairs, fetch supplies, and help move vulnerable patients safely while nurses handle the medical decisions. It is not glamorous work, but it matters.','COMMUNITY');break;}
 case 'establish':{
  advance(70,10);state.world.base.formed=true;state.world.base.fortifications=1;entry('Designated the Maple Street house as a safehouse.');narr('A Place to Return To',['You check access points, set aside emergency supplies, and designate a room for sleeping and one for storage. It is an ordinary house, but now it is a defensible place to return to.','The safehouse is small. Water, food, and trust will determine whether it can grow.'],'SETTLEMENT');break;}
 case 'fortify':{
  if(!has('wood')&&!has('scrap')){narr('Materials Needed','You have ideas for securing the house, but you need lumber or useful salvage. The improvements will have to wait.','SETTLEMENT');break;}
  take(has('wood')?'wood':'scrap');advance(95,13);state.world.base.fortifications=Math.min(5,state.world.base.fortifications+1);
  entry(`Improved safehouse defenses to tier ${state.world.base.fortifications}.`,false);narr('Stronger Boundaries',`You improve doors, vulnerable windows, and sightlines without blocking essential exits. The safehouse is now security tier ${state.world.base.fortifications}/5. Neighbors begin asking whether they could shelter here.`, 'SETTLEMENT');break;}
 case 'secureFactory':{
  advance(70,12);state.flags.factorySafe=true;changeTrust('robert',22,'Alex helped make the stopped machinery safe.');entry('Helped plant workers secure hazardous equipment.');narr('Safely Shut Down','You work with Robert to secure areas around stalled equipment and account for nearby staff. Two workers who had been unaccounted for are found in a maintenance bay.','INFRASTRUCTURE');break;}
 case 'helpDriver':{
  advance(45,9);state.flags.driverHelped=true;changeTrust('tom',24,'Alex helped Tom and stranded motorists on the service road.');add('water',1);entry('Helped stranded motorists; Tom shared a bottle of water.');narr('The Service Road','You help Tom check his vehicle and direct several people away from dangerous traffic. Before you part, he insists you take a bottle of water.','ENCOUNTER');break;}
 case 'fixWater':{
  advance(95,13);if(p.background==='technician'||p.background==='mechanic'||has('parts')){state.flags.pumpsStable=true;state.world.waterPressure=clamp(state.world.waterPressure+25);changeTrust('priya',28,'Alex helped keep treatment pumps operational.');entry('Helped the municipal water crew stabilize essential pumps.');narr('Pressure Returns','You work under Priya’s direction to diagnose a failing backup system. The crew gets a reliable local supply running, buying the district more time for safe drinking water.','INFRASTRUCTURE');}
  else{changeTrust('priya',7,'Alex assisted with worksite safety at the water plant.');narr('Hands Needed','You help the operators move materials and clear access routes. The pump problems remain, but Priya appreciates the help.','INFRASTRUCTURE');}break;}
 case 'volunteer':{
  advance(120,17);changeTrust('darius',18,'Alex volunteered for a busy shelter shift.');
  const remain=state.world.sites.shelter.stocks.food;
  if(remain>0){state.world.sites.shelter.stocks.food--;add('food');}
  entry('Worked a volunteer shift at the community shelter.');
  narr('Another Pair of Hands',remain>0?'You organize blankets, register arrivals and carry supplies. Darius provides one food ration for your shift.':'You spend the shift helping with blankets and registration. The shelter has run out of spare food rations, but Darius remembers your contribution.','COMMUNITY');break;}
 case 'farmWork':{
  if(state.flags.lastFarmWorkDay===day()){narr('Work Already Done','Rosa thanks you for today’s help, but there is no more paid work until tomorrow. Food cannot be produced as quickly as it can be eaten.','COMMUNITY');break;}
  advance(135,19);state.flags.lastFarmWorkDay=day();changeTrust('rosa',16,'Alex contributed useful work to the farm.');
  const stock=state.world.sites.farm.stocks;const paid=Math.min(2,stock.food);stock.food-=paid;if(paid)add('food',paid);
  entry('Contributed several hours of work on the farm.');narr('Earned, Not Taken',paid?`You spend a long stretch helping Rosa secure supplies and handle chores. She gives you ${paid} food ration(s) from her limited stores.`:'You help Rosa with farm chores. She is grateful, but the food stores are empty and she cannot pay you in provisions.','COMMUNITY');break;}
 case 'shop':{
  advance(9,1);narr('The Counter',['Nina keeps a list of everything leaving the store. “Useful goods aren’t free just because the card machine is down,” she says.','She offers to trade a spare battery for one food ration. You can use the People panel to negotiate with her.'],'TRADE');break;}
 case 'fuelTalk':{
  advance(8,1);narr('The Dry Pumps',['Eli glances toward the powerless pumps. “I have a few sealed canisters put away. Cash doesn’t mean much if this keeps going.”','He might trade one canister for useful supplies, but he will not hand fuel to a stranger.'],'TRADE');break;}
 case 'radio':{
  advance(18,1);const latest=state.world.reports.slice(-2).map(x=>x.text);
  if(!latest.length){narr('Nothing Confirmed',['Static dominates the bands. Brief voices come and go, but no coherent explanation emerges.','You know the outage is affecting more than your immediate building. Beyond that, reports are unreliable.'],'INTELLIGENCE');}
  else{narr('Fragments of News',['You work through the available frequencies. Voices are broken, sometimes contradictory.',...latest,'No station can establish the full cause or scope with certainty.'],'INTELLIGENCE');}
  entry('Checked radio and local reports.',false);break;}
 case 'rest':{
  advance(120);p.energy=clamp(p.energy+29);p.stress=clamp(p.stress-7);narr('A Short Respite','You find a place out of the way, set your equipment within reach, and get two hours of uneasy rest. You wake feeling a little more capable.','REST');break;}
 case 'sleep':{
  advance(360);p.energy=clamp(p.energy+73);p.stress=clamp(p.stress-(p.trait==='vigilant'&&loc!=='home'?3:13));
  if(has('water')){take('water');p.hydration=clamp(p.hydration+45);}if(has('food')){take('food');p.hunger=clamp(p.hunger+45);}
  narr('Six Hours Later',['You sleep in short stretches, waking to unfamiliar sounds. When you finally sit up, the wider crisis has not disappeared.','You use a ration and a bottle of water if they are available. The world has continued changing while you slept.'],'REST');break;}
 case 'wait':{advance(30,1);narr('Waiting','Thirty minutes pass. You listen for announcements, footsteps, and distant engines. The world offers no clear answer, only more questions.','TIME');break;}
 default:showToast('That action is not available.');return;
 }
 save();render();
}
function encounterAction(code){const e=state.encounter,p=state.player;const infected=e.type==='infected';let title='',lines=[],resolved=false;
 switch(code){
 case 'encObserve':advance(6,2);e.round++;title='A Closer Look';lines=[infected?'Two feverish figures are moving erratically beyond a doorway. They have not yet closed the distance.':'Three strangers have stopped at the far end of the lot. One carries a length of metal pipe. Their intentions are unclear.','There is still room to avoid a confrontation, but the window is narrowing.'];break;
 case 'encTalk':advance(8,2);title='Words Before Violence';
  if(!infected&&roll(.52+(p.trait==='persuasive'?.23:0))){p.stress=clamp(p.stress-2);lines=['You keep your hands visible and explain that you only want to pass. After a tense exchange, the strangers step aside.'];resolved=true;entry('Avoided a confrontation through negotiation.');}
  else{p.stress=clamp(p.stress+6);lines=[infected?'The figures do not respond to your words. One lurches toward the sound.':'Your words fail to reassure the group. One of the strangers advances a few steps.','You need to make another choice quickly.'];e.round++;}break;
 case 'encRetreat':advance(16,8);title='Retreat';
  if(roll(.80+(p.trait==='vigilant'?.1:0)-e.round*.12)){lines=['You put distance between yourself and the threat without turning it into a fight. You leave the immediate area shaken but unhurt.'];resolved=true;entry('Retreated from an encounter without fighting.');}
  else{p.health=clamp(p.health-8);p.stress=clamp(p.stress+14);p.injuries.push('Bruised shoulder');lines=['As you pull back, you stumble hard against debris. You escape, but your shoulder aches and your hands are shaking.'];resolved=true;entry('Escaped an encounter with a minor injury.');}break;
 case 'encFight':advance(17,15);title='A Dangerous Choice';
  if(roll(.48+(p.trait==='calm'?.12:0))){p.stress=clamp(p.stress+18);lines=['You take cover and use the surroundings to prevent anyone from closing the distance. The threat withdraws when continuing becomes too risky.','You survived, but it was neither clean nor certain.'];resolved=true;entry('Defended against a hostile encounter.');}
  else{const injury=12+Math.floor(rng()*17);p.health=clamp(p.health-injury);p.stress=clamp(p.stress+22);p.injuries.push('Painful impact injury');lines=[`The confrontation goes badly. You escape the immediate danger, but suffer an injury (${injury} health lost). The pain makes it harder to move.`, 'You need medical attention and rest.'];resolved=true;entry(`Injured during a hostile encounter (-${injury} health).`);}break;
 }
 if(resolved)state.encounter=null;
 netCondition();if(!state.dead)narr(title,lines,'ENCOUNTER');save();render();
}
function travelTime(from,to){const a=locationCoords[from],b=locationCoords[to];return Math.max(16,Math.round((Math.hypot(a[0]-b[0],a[1]-b[1])*20+9)/5)*5);}
function travelTo(dest){if(!locationData[dest]||dest===state.location||state.dead)return;
 const prev=state.location,min=travelTime(prev,dest),p=state.player;
 if(p.energy<8){narr('Too Exhausted','Your legs tremble and you cannot safely attempt that trip without resting first.','TRAVEL');render();return;}
 advance(min,Math.round(min*.035));if(state.dead){save();render();return;}
 const night=(state.time%1440<360||state.time%1440>1200);state.location=dest;state.visits[dest]=(state.visits[dest]||0)+1;
 state.discovered=[...new Set([...state.discovered,dest])];
 for(const n of Object.values(state.world.npcs))if(n.companion)n.place=dest;
 const e=[`You travel from ${locationData[prev].name} to ${locationData[dest].name}. The journey takes ${min} minutes.`,locationData[dest].desc[state.scenario]];
 if(night)e.push('It is dark, and moving safely demands additional caution.');
 if(day()>=1&&roll(.07+state.world.unrest/550+(night?.07:0))){state.encounter={type:state.scenario==='infection'?'infected':'strangers',round:0};e.push('Near your destination, figures appear where you expected the path to be clear.');}
 if(state.scenario==='fallout'&&dest==='highway'){p.exposure=clamp(p.exposure+9);e.push('You avoid visible dust, but cannot confirm whether the air is safe.');}
 if(state.scenario==='winter'&&dest!=='hospital'&&dest!=='shelter'){p.energy=clamp(p.energy-5);e.push('The cold leaves your hands stiff even through your gloves.');}
 entry(`Traveled to ${locationData[dest].name} (${min} min).`,false);narr(locationData[dest].name,e,'TRAVEL');save();render();
}
function useItem(id){const p=state.player;if(!has(id))return;let msg='',cost=2;
 switch(id){
 case 'water':take('water');p.hydration=clamp(p.hydration+49);msg='You drink clean bottled water. The empty bottle is discarded.';break;
 case 'food':take('food');p.hunger=clamp(p.hunger+46);msg='You eat a portion of food and save the remainder of your energy.';break;
 case 'bandage':{if(p.health>=100&&p.injuries.length===0){showToast('No injury currently needs bandaging.');return;}take('bandage');p.health=clamp(p.health+7);p.injuries.shift();msg='You clean and dress an injury as well as you can. A bandage cannot cure serious trauma.';cost=12;break;}
 case 'medkit':{if(p.health>=100&&p.injuries.length===0){showToast('Save the kit for an actual injury.');return;}take('medkit');p.health=clamp(p.health+(p.background==='paramedic'?28:17));p.injuries.shift();msg='You use medical supplies to stabilize and dress your injuries. Recovery will still take time.';cost=22;break;}
 case 'battery':{if(!has('flashlight')&&!has('radio')){showToast('You do not have a device that needs these batteries.');return;}take('battery');msg='You replace depleted batteries and keep your light or radio usable.';cost=3;break;}
 default:showToast('Keep that item for trading, repair, or building.');return;
 }
 advance(cost);if(!state.dead)narr('Inventory',msg,'GEAR');entry(`Used ${itemData[id].name}.`,false);save();render();
}
function craft(id){const p=state.player;
 if(id==='filter'){
  if(!has('scrap',2)||!has('parts')){showToast('Requires 2 scrap components and 1 mechanical part.');return;}
  take('scrap',2);take('parts');advance(75,9);add('filter');narr('Improvised Equipment','Using salvaged material, you assemble a simple filtration assembly. It can help remove particles, but cannot by itself guarantee drinking water is biologically or chemically safe.','CRAFTING');
 }else if(id==='bandage'){
  if(!has('medkit')){showToast('Requires a medical kit to portion out.');return;}
  take('medkit');add('bandage',3);advance(16,2);narr('Divide Medical Supplies','You sort a medical kit into three small wound-dressing packs. They are easier to share, but no longer form a complete kit.','CRAFTING');
 }else if(id==='water'){
  if(state.location!=='farm'&&state.location!=='waterworks'){showToast('You need access to a suitable water source.');return;}
  if(!has('filter')){showToast('A filter is required, plus safe treatment before drinking.');return;}
  advance(45,5);add('water');narr('Water for the Road','After filtering and treating a limited amount of collected water, you fill one clean container. You avoid any source with signs of chemical contamination.','CRAFTING');
 }else return;
 save();render();
}
function doPerson(id,act){const n=state.world.npcs[id],d=npcData[id],p=state.player;if(!n||!(n.met||n.place===state.location))return;
 if(n.place!==state.location&&!n.companion){showToast(`${d.name} is not here.`);return;}
 n.met=true;let out='',cost=8;
 switch(act){
 case 'talk':n.trust=clamp(n.trust+1,-100,100);out=`${d.intro}\n\n${d.talk}\n\nKnown priority: ${d.aim}`;break;
 case 'ask':out=n.trust>=35?`"People who are prepared are keeping others alive," ${d.name.split(' ')[0]} says. "If you’re building something safe, I want to hear about it."`:`${d.name.split(' ')[0]} shares only what can be verified nearby. "Too many stories are circulating. Don’t gamble your life on rumors."`;cost=11;break;
 case 'help':{
  if(n.helped){out=`${d.name.split(' ')[0]} remembers that you already helped. "I appreciate it. I may need to return the favor."`;cost=5;break;}
  n.helped=true;changeTrust(id,23,'Alex took time to help with a pressing problem.');p.reputation=clamp(p.reputation+2,-100,100);cost=45;
  out=`You spend time helping ${d.name} with an immediate concern: ${d.aim.toLowerCase()} Their guarded expression softens as you work together.`;
  entry(`Helped ${d.name} with their immediate priority.`);break;}
 case 'trade':{
  const offers={nina:{pay:'food',gain:'battery'},eli:{pay:'parts',gain:'fuel'},rosa:{pay:'scrap',gain:'food'},darius:{pay:'bandage',gain:'water'},mara:{pay:'water',gain:'bandage'},priya:{pay:'scrap',gain:'filter'},tom:{pay:'water',gain:'parts'},robert:{pay:'food',gain:'parts'},jae:{pay:'food',gain:'water'},ben:{pay:'water',gain:'battery'}};
  const o=offers[id];if((n.tradeStock||0)<=0){out=`${d.name.split(' ')[0]} has nothing left to trade right now.`;cost=3;}
  else if(!has(o.pay)){out=`${d.name.split(' ')[0]} offers ${itemData[o.gain].name.toLowerCase()} in exchange for ${itemData[o.pay].name.toLowerCase()}, but you do not have the requested item.`;cost=4;}
  else if(weight()+(itemData[o.gain].weight-itemData[o.pay].weight)>18){out='You cannot safely carry another heavy item. Make room in your pack.';cost=2;}
  else{take(o.pay);add(o.gain);n.tradeStock--;changeTrust(id,3,'Completed a fair exchange with Alex.');out=`You trade 1 ${itemData[o.pay].name.toLowerCase()} for 1 ${itemData[o.gain].name.toLowerCase()}. ${d.name.split(' ')[0]} records the exchange.`;entry(`Traded with ${d.name}.`,false);cost=12;}
  break;}
 case 'recruit':{
  if(n.companion){out=`${d.name} is already traveling with you.`;cost=2;break;}
  if(n.trust<50){out=`${d.name} shakes their head. "I don’t know you well enough yet. And I have people here depending on me."`;cost=5;}
  else if(nearbyFriends().length>=2){out='Your current travel group is full. This alpha supports up to two companions.';cost=2;}
  else{n.companion=true;changeTrust(id,7,'Alex invited them to travel together.');out=`After a long pause, ${d.name} agrees to travel with you for now. "We watch out for each other," they say.`;entry(`${d.name} joined your traveling group.`);cost=13;}break;}
 case 'inviteBase':{
  if(!state.world.base.formed){out='You have not established a safehouse yet.';cost=3;}
  else if(n.resident){out=`${d.name} already lives at your safehouse.`;cost=3;}
  else if(n.companion){out=`${d.name} is traveling with you. Ask them to stay behind at the safehouse once you get home.`;cost=3;}
  else if(n.trust<35){out=`${d.name} declines. They need more reason to trust you before moving into your settlement.`;cost=8;}
  else{n.resident=true;n.place='home';state.world.base.residents++;changeTrust(id,4,'Alex offered a place in the safehouse community.');out=`${d.name} accepts your offer to join the Maple Street safehouse and plans to help protect its residents.`;entry(`${d.name} joined the Maple Street settlement.`);cost=28;}break;}
 case 'dismiss':{
  if(!n.companion)return;n.companion=false;n.place=state.location;changeTrust(id,-3,'Alex asked them to stay behind.');out=`You ask ${d.name} to remain at ${locationData[state.location].name}. They agree, though the separation is uneasy.`;cost=9;entry(`${d.name} left the traveling group.`);break;}
 default:return;
 }
 advance(cost,act==='help'?5:0);if(!state.dead)narr(d.name,out,'RELATIONSHIP');save();render();
}
function runCommand(command){const raw=(command||'').trim(),s=raw.toLowerCase();ui.modal=null;if(!raw){render();return;}
 const easy={look:'look',search:'scavenge',scavenge:'scavenge',rest:'rest',sleep:'sleep',wait:'wait',radio:'radio',listen:'radio',build:'establish',fortify:'fortify',generator:'repairHospital',repair:'repairHospital',help:'helpPatients'};
 if(s==='inventory'||s==='pack'){ui.tab='pack';render();return;}
 if(s==='map'||s==='travel'){ui.tab='travel';render();return;}
 if(s==='people'||s==='companions'){ui.tab='people';render();return;}
 if(s==='journal'||s==='log'){ui.tab='more';ui.moreSub='journal';render();return;}
 if(/^(drink|use water)/.test(s)){useItem('water');return;}
 if(/^(eat|use food)/.test(s)){useItem('food');return;}
 if(s.startsWith('go ')||s.startsWith('travel ')){
  const name=s.replace(/^(go|travel)( to)? /,'');const id=locations.find(k=>locationData[k].name.toLowerCase().includes(name)||k.includes(name));if(id){travelTo(id);return;}
 }
 if(s.startsWith('talk ')){const name=s.replace(/^talk (to )?/,'');const id=Object.keys(npcData).find(k=>npcData[k].name.toLowerCase().includes(name)||k===name);if(id&&(state.world.npcs[id].met||state.world.npcs[id].place===state.location)){ui.tab='people';ui.person=id;render();return;}}
 const key=Object.keys(easy).find(k=>s===k||s.startsWith(k+' '));if(key){sceneAction(easy[key]);return;}
 narr('Action Not Understood',[`“${raw.slice(0,110)}” is not a supported freeform action in this early offline alpha. No time has passed.`, 'Try: look, search, sleep, rest, drink, eat, radio, go to [place], talk to [person], or use the action menus.'], 'COMMAND');render();
}
function paging(p,total,kind){if(total<=1)return `<div class="pager"><span class="pager-center">${total?`PAGE ${p+1} / ${total}`:'NO ENTRIES'}</span></div>`;
 return `<div class="pager"><button class="small-action" data-pager="${kind}" data-direction="-1" ${p<=0?'disabled':''}>← PREVIOUS</button><span class="pager-center">${p+1} / ${total}</span><button class="small-action" data-pager="${kind}" data-direction="1" ${p>=total-1?'disabled':''}>NEXT →</button></div>`;}
function renderSetup(){const step=setupStep;
 const head=`<div class="setup-banner"><div class="setup-brand">AFTERMATH</div><div class="setup-tag">A WORLD THAT REMEMBERS</div></div>`;
 let middle='',footer='';
 if(step===0){
 const arr=Object.entries(scenarioData);
 middle=`<div class="setup-heading"><h2>Choose your apocalypse</h2><span class="pill">1 / 3</span></div><div class="setup-list">${arr.map(([key,s])=>`<button class="card-option ${draft.scenario===key?'selected':''}" data-pick="scenario" data-val="${key}"><strong>${h(s.name)}</strong><p>${h(s.tag)}</p></button>`).join('')}</div>`;
 footer=`<p class="caption">Different catastrophes change the threats, news, conditions and your survival decisions. You can create another world later.</p><button class="btn accent full" data-setup="next">CONTINUE TO SURVIVOR →</button>`;
 }else if(step===1){
 middle=`<div class="setup-heading"><h2>Who were you before?</h2><span class="pill">2 / 3</span></div><div class="screen-body"><div class="field"><label for="charName">Survivor name</label><input id="charName" maxlength="38" spellcheck="false" value="${h(draft.name)}"></div><div class="field"><label for="occupation">Background</label><select id="occupation">${Object.entries(backgrounds).map(([id,v])=>`<option value="${id}" ${draft.background===id?'selected':''}>${h(v.name)}</option>`).join('')}</select></div><div class="trait-desc">${h(backgrounds[draft.background].desc)}<br>Starting gear: ${h(Object.keys(backgrounds[draft.background].gear).map(x=>itemData[x]?.name||x).join(', '))}</div><div class="field"><label for="personality">Defining trait</label><select id="personality">${Object.entries(traits).map(([id,v])=>`<option value="${id}" ${draft.trait===id?'selected':''}>${h(v.name)}</option>`).join('')}</select></div><div class="trait-desc">${h(traits[draft.trait].desc)}</div><div class="tile"><span class="eyebrow">SURVIVOR PROFILE</span><p>Healthy · No injuries · One food ration · One bottled water · Starting equipment from your background</p></div></div>`;
 footer=`<div class="button-row"><button class="btn flex" data-setup="back">← WORLD</button><button class="btn accent flex" data-setup="next">CHOOSE LOCATION →</button></div>`;
 }else{
 const opts=['hospital','home','highway','factory','hardware'];
 middle=`<div class="setup-heading"><h2>Where are you at 7:14?</h2><span class="pill">3 / 3</span></div><div class="setup-list">${opts.map(id=>`<button class="card-option ${draft.location===id?'selected':''}" data-pick="location" data-val="${id}"><strong>${h(locationData[id].name)}</strong><p>${h(locationData[id].desc[draft.scenario])}</p></button>`).join('')}</div>`;
 footer=`<div class="button-row"><button class="btn flex" data-setup="back">← SURVIVOR</button><button class="btn accent flex" data-setup="start">BEGIN DAY ZERO →</button></div><p class="caption">${h(draft.name||'Alex Morgan')} · ${h(backgrounds[draft.background].name)} · ${h(traits[draft.trait].name)} · ${h(scenarioData[draft.scenario].name)}</p>`;
 }
 return `<div class="setup-wrap">${head}<section class="setup-section">${middle}</section><div class="setup-foot">${footer}</div></div>`;
}
function header(){const p=state.player;const bad=n=>n<25?'danger':n>69?'good':'';
 return `<header class="shell-top"><div class="identity"><div><div class="brand">AFTER<b>MATH</b></div><span class="edition">${h(scenarioData[state.scenario].name)} · ALPHA ${VERSION}</span></div><div class="clock"><strong>${h(timeLabel())}</strong><small>${h(locationData[state.location].area)}</small></div></div></header><div class="hud" aria-label="Survivor status"><div class="hud-item"><span>HP</span><strong class="${bad(p.health)}">${Math.round(p.health)}</strong></div><div class="hud-item"><span>ENERGY</span><strong class="${bad(p.energy)}">${Math.round(p.energy)}</strong></div><div class="hud-item"><span>WATER</span><strong class="${bad(p.hydration)}">${Math.round(p.hydration)}</strong></div></div>`;
}
function navbar(){const nav=[['story','▤','STORY'],['travel','↗','TRAVEL'],['pack','◇','PACK'],['people','♙','PEOPLE'],['more','☷','MORE']];
 return `<nav class="bottom-nav" aria-label="Main navigation">${nav.map(([id,glyph,text])=>`<button class="nav-button ${ui.tab===id?'active':''}" data-tab="${id}" aria-label="${text}" ${ui.tab===id?'aria-current="page"':''}><span class="nav-glyph">${glyph}</span><span class="nav-label">${text}</span></button>`).join('')}</nav>`;}
function renderStory(){const sc=state.scene,pages=paragraphsToPages(sc.text),np=clamp(ui.narrativePage,0,pages.length-1);ui.narrativePage=np;
 const actions=getActions(),total=Math.ceil(actions.length/3),ap=clamp(ui.actionPage,0,Math.max(total-1,0));ui.actionPage=ap;
 return `<main class="main"><div class="scene-head"><span class="eyebrow">${h(sc.kind)} · ${h(locationData[state.location].area)}</span><h1 class="panel-title">${h(sc.title)}</h1><div class="subline">${h(locationData[state.location].name)} · ${h(scenarioData[state.scenario].tag)}</div></div><div class="story-card"><div class="story-copy">${h(pages[np])}</div><div class="story-counter"><span class="micro">STORY ${np+1} / ${pages.length}</span>${paging(np,pages.length,'narrative')}</div></div><div class="actions-area"><div class="row-between"><span class="section-title">WHAT WILL YOU DO?</span><span class="micro">${actions.length} OPTIONS</span></div><div class="choice-grid">${actions.slice(ap*3,ap*3+3).map((a,i)=>`<button class="choice ${i===0&&ap===0?'primary':''}" data-scene="${a.code}"><span>${h(a.label)}</span><span>›</span></button>`).join('')}</div>${paging(ap,total,'action')}</div></main>`;}
function renderTravel(){const place=state.location;const all=locations.filter(id=>id!==place);const limit=3,pages=Math.ceil(all.length/limit),page=clamp(ui.listPage,0,pages-1);ui.listPage=page;
 return `<main class="main"><div class="screen"><div class="screen-header"><div class="eyebrow">OPEN WORLD · ON FOOT</div><h1 class="panel-title">Travel & Explore</h1><div class="subline">From ${h(locationData[place].name)}. Destinations remain accessible; travel costs time and energy.</div></div><div class="screen-body"><div class="list-items">${all.slice(page*limit,page*limit+limit).map(id=>{const l=locationData[id];return `<article class="tile"><div class="row-between"><h3>${h(l.name)}</h3><span class="pill">${travelTime(place,id)} MIN</span></div><p>${h(l.dist)}</p><div class="row-between"><span class="tile-meta">${(state.visits[id]||0)?'PREVIOUSLY VISITED':'UNVISITED'} · RISK ${l.danger}/3</span><button class="small-action" data-travel="${id}">TRAVEL →</button></div></article>`;}).join('')}</div>${paging(page,pages,'list')}</div></div></main>`;}
function renderPack(){const tab=ui.packSub||'items';const items=Object.entries(state.player.items).filter(([,n])=>n>0).sort((a,b)=>a[0].localeCompare(b[0]));const per=3,pages= Math.max(1,Math.ceil((tab==='items'?items.length:3)/per));const pg=clamp(ui.listPage,0,pages-1);ui.listPage=pg;
 const inventory=tab==='items'?`<div class="list-items">${items.slice(pg*per,pg*per+per).map(([id,n])=>`<article class="tile"><div class="row-between"><h3>${h(itemData[id]?.name||id)}</h3><span class="pill">× ${n}</span></div><p>${h((itemData[id]?.weight||0)*n===0?'Portable supplies':`Estimated load ${((itemData[id]?.weight||0)*n).toFixed(1)} kg`)}</p><div class="row-between"><span class="tile-meta">${['food','water','bandage','medkit','battery'].includes(id)?'CONSUMABLE':'EQUIPMENT / MATERIAL'}</span>${['food','water','bandage','medkit','battery'].includes(id)?`<button class="small-action" data-use="${id}">USE →</button>`:'<span class="micro">KEEP / TRADE</span>'}</div></article>`).join('')}</div>${paging(pg,pages,'list')}`
 :`<div class="list-items"><article class="tile"><h3>Improvised water filter</h3><p>Requires 2 scrap components and 1 mechanical part. Filtering alone does not make contaminated water safe.</p><button class="small-action" data-craft="filter">CRAFT (75 MIN)</button></article><article class="tile"><h3>Divide medical supplies</h3><p>Convert 1 medical kit into 3 basic bandage packs.</p><button class="small-action" data-craft="bandage">CRAFT (16 MIN)</button></article><article class="tile"><h3>Treat collected water</h3><p>Requires a filter and a suitable water source at the farm or treatment plant.</p><button class="small-action" data-craft="water">COLLECT (45 MIN)</button></article></div>`;
 return `<main class="main"><div class="screen"><div class="screen-header"><div class="eyebrow">SUPPLIES & EQUIPMENT</div><h1 class="panel-title">Your Pack</h1><div class="subline">${weight().toFixed(1)} / 18.0 kg carried · Water ${Math.round(state.player.hydration)} · Food ${Math.round(state.player.hunger)}</div></div><div class="tabs"><button class="tab ${tab==='items'?'active':''}" data-pack="items">INVENTORY</button><button class="tab ${tab==='craft'?'active':''}" data-pack="craft">CRAFTING</button></div><div class="screen-body">${inventory}</div></div></main>`;}
function renderPeople(){const all=Object.keys(npcData).filter(id=>state.world.npcs[id].met||state.world.npcs[id].place===state.location);if(ui.person&&!all.includes(ui.person))ui.person=null;
 let body='';if(ui.person){const id=ui.person,d=npcData[id],n=state.world.npcs[id],near=n.place===state.location;
 body=`<div class="screen-header"><div class="eyebrow">KNOWN SURVIVOR</div><h1 class="panel-title">${h(d.name)}</h1><div class="subline">${h(d.role)} · ${h(near?'Here with you':`At ${locationData[n.place].name}`)} · Trust ${n.trust}/100</div></div><div class="story-card"><div class="story-copy">${h(d.intro)}\n\nKnown priority: ${h(d.aim)}${n.memories.length?'\n\nMemory: '+h(n.memories[0]):''}</div><div class="micro">${n.companion?'TRAVELING COMPANION':'INDEPENDENT SURVIVOR'}</div></div><div class="actions-area"><div class="choice-grid"><button class="choice" data-person-action="talk" data-person="${id}">Talk openly <span>›</span></button><button class="choice" data-person-action="help" data-person="${id}">Offer practical help <span>›</span></button><button class="choice" data-person-action="trade" data-person="${id}">Negotiate a trade <span>›</span></button><button class="choice" data-person-action="${n.companion?'dismiss':'recruit'}" data-person="${id}">${n.companion?'Ask them to stay here':'Invite them to travel'} <span>›</span></button></div><div class="button-row"><button class="btn flex" data-person-action="${state.world.base.formed?'inviteBase':'ask'}" data-person="${id}">${state.world.base.formed?'INVITE TO BASE':'ASK FOR INFORMATION'}</button><button class="btn flex" data-person-back="1">← ALL PEOPLE</button></div></div>`;
 }else{const per=2,pages=Math.max(1,Math.ceil(all.length/per)),pg=clamp(ui.listPage,0,pages-1);ui.listPage=pg;
 body=`<div class="screen-header"><div class="eyebrow">RELATIONSHIPS · ${nearbyFriends().length} COMPANIONS</div><h1 class="panel-title">People & Trust</h1><div class="subline">Significant survivors remember what you do, not merely what you say.</div></div><div class="screen-body"><div class="list-items">${all.length?all.slice(pg*per,pg*per+per).map(id=>{const d=npcData[id],n=state.world.npcs[id];return `<article class="tile"><div class="row-between"><h3>${h(d.name)}</h3><span class="pill">TRUST ${n.trust}</span></div><p>${h(d.role)} · ${h(n.companion?'With you':locationData[n.place].name)}</p><p>${h(d.aim)}</p><button class="small-action" data-person-select="${id}">SPEAK / INTERACT →</button></article>`;}).join(''):'<div class="empty">You have not met anyone here yet. Travel to populated locations or look around.</div>'}</div>${paging(pg,pages,'list')}</div>`;
 }
 return `<main class="main"><div class="screen">${body}</div></main>`;}
function renderMore(){const sub=ui.moreSub||'journal';let content='';
 if(sub==='journal'){
 const list=state.ledger,per=3,pages=Math.max(1,Math.ceil(list.length/per)),pg=clamp(ui.listPage,0,pages-1);ui.listPage=pg;
 content=`<div class="list-items">${list.slice(pg*per,pg*per+per).map(e=>`<article class="tile"><div class="journal-card"><span class="journal-time">${h(timeLabel(e.time))}</span><div class="journal-copy">${h(e.text)}</div></div></article>`).join('')}</div>${paging(pg,pages,'list')}`;
 }else if(sub==='status'){
 const p=state.player,days=day();content=`<div class="stat-list"><div class="stat-box"><div class="stat-label">Health</div><div class="stat-val">${Math.round(p.health)} / 100</div></div><div class="stat-box"><div class="stat-label">Energy</div><div class="stat-val">${Math.round(p.energy)} / 100</div></div><div class="stat-box"><div class="stat-label">Hunger</div><div class="stat-val">${Math.round(p.hunger)} / 100</div></div><div class="stat-box"><div class="stat-label">Hydration</div><div class="stat-val">${Math.round(p.hydration)} / 100</div></div><div class="stat-box"><div class="stat-label">Stress</div><div class="stat-val">${Math.round(p.stress)} / 100</div></div><div class="stat-box"><div class="stat-label">Reputation</div><div class="stat-val">${p.reputation>=0?'+':''}${p.reputation}</div></div></div><div class="tile"><span class="eyebrow">SURVIVAL RECORD</span><p>${h(p.name)} · ${h(backgrounds[p.background].name)}<br>${h(traits[p.trait].name)} · Day ${days}<br>Injuries: ${h(p.injuries.join(', ')||'None')}<br>First 72 hours: ${state.flags.first72?'SURVIVED':'IN PROGRESS'}</p></div>`;
 }else if(sub==='base'){
 const b=state.world.base;content=`<div class="tile"><span class="eyebrow">HOME TERRITORY</span><h3>${h(b.name)}</h3><p>${b.formed?'An emerging place of refuge.':'No active safehouse established. Return to Maple Street and organize the building.'}</p><div class="inline-tags"><span class="tag">DEFENSE ${b.fortifications}/5</span><span class="tag">RESIDENTS ${b.residents}</span><span class="tag">STOCKS ${b.stores.food} FOOD · ${b.stores.water} WATER</span></div></div><div class="tile"><h3>Community decisions</h3><p>Your safehouse can grow through scavenging, relationships, improving defenses and contributing supplies.</p><button class="btn full" data-base="deposit" ${!b.formed||(!has('food')&&!has('water'))?'disabled':''}>DEPOSIT 1 FOOD OR WATER</button><button class="btn full" data-base="work" ${!b.formed||state.location!=='home'?'disabled':''}>WORK ON THE SAFEHOUSE</button></div>`;
 }else if(sub==='settings'){
 content=`<div class="tile"><h3>Save & access</h3><p>Saved automatically on this device. There are no accounts, ads, trackers or cloud sync.</p><button class="btn full" data-settings="export">EXPORT SURVIVAL SAVE</button><button class="btn full" data-settings="import">IMPORT SURVIVAL SAVE</button></div><div class="tile"><h3>Testing & game controls</h3><p>Version ${VERSION} · Mobile offline alpha · No scroll navigation · Some systems remain early prototypes.</p><div class="button-row"><button class="btn flex" data-settings="help">CONTROLS</button><button class="btn flex" data-settings="debug">TEST TOOLS</button></div><button class="btn alert full" data-settings="reset">START NEW WORLD</button></div>`;
 }else if(sub==='debug'){
 content=`<div class="tile"><span class="eyebrow">ALPHA TEST TOOLS</span><h3>World simulation lab</h3><p>Fast-forward the game world to verify timed events. This permanently advances your current save, including thirst, hunger and exhaustion.</p><button class="btn full" data-debug="60">ADVANCE 1 HOUR</button><button class="btn full" data-debug="360">ADVANCE 6 HOURS</button><button class="btn full" data-debug="720">ADVANCE 12 HOURS</button></div><div class="note">These are testing controls, not normal survivor actions. Export your save first if you want a backup.</div>`;
 }
 return `<main class="main"><div class="screen"><div class="screen-header"><div class="eyebrow">YOUR WORLD · PERSISTENT RECORD</div><h1 class="panel-title">Field Journal</h1><div class="subline">${h(state.player.name)} · ${h(scenarioData[state.scenario].name)}</div></div><div class="tabs">${[['journal','LOG'],['status','STATUS'],['base','BASE'],['settings','SETTINGS']].map(([id,label])=>`<button class="tab ${sub===id||sub==='debug'&&id==='settings'?'active':''}" data-more="${id}">${label}</button>`).join('')}</div><div class="screen-body">${content}</div></div></main>`;}
function modal(){if(!ui.modal)return '';const m=ui.modal;let inside='';
 if(m==='command')inside=`<div class="eyebrow">FREEFORM ACTION (ALPHA)</div><h2>What do you attempt?</h2><div class="modal-copy">Use plain commands: look, search, go to hardware, talk to Mara, repair, rest, sleep, drink, eat, or radio. This offline alpha recognizes defined actions; it does not generate AI responses.</div><input id="commandInput" placeholder="Type an action..." autocomplete="off" maxlength="160" value="${h(ui.command||'')}"><div class="button-row"><button class="btn flex" data-modal="close">CANCEL</button><button class="btn accent flex" data-modal="submit">ATTEMPT →</button></div>`;
 else if(m==='reset')inside=`<div class="eyebrow">IRREVERSIBLE ACTION</div><h2>Begin a new world?</h2><div class="modal-copy">This will replace your current on-device game and its world history. Export your save first if you want to preserve it.</div><div class="button-row"><button class="btn flex" data-modal="close">KEEP SURVIVING</button><button class="btn alert flex" data-modal="reset">DELETE & RESTART</button></div>`;
 else if(m==='help')inside=`<div class="eyebrow">HOW TO PLAY</div><h2>One choice at a time</h2><div class="modal-copy">Choose one of the three visible actions, then NEXT for more choices. Story paragraphs have their own page controls. TRAVEL moves between persistent locations. PACK uses supplies and crafts. PEOPLE opens conversations and trades. MORE shows events, conditions, base and save controls.<br><br>There is no page scrolling. Time only advances through actions or testing tools. Your world saves automatically on this phone.</div><button class="btn accent full" data-modal="close">GOT IT</button>`;
 return `<div class="modal-wrap" role="dialog" aria-modal="true"><div class="modal">${inside}</div></div>`;
}
function render(){if(!$('#app'))return;document.title='AFTERMATH — Mobile Survival RPG';
 if(!state){$('#app').innerHTML=renderSetup();return;}
 const screens={story:renderStory,travel:renderTravel,pack:renderPack,people:renderPeople,more:renderMore};
 $('#app').innerHTML=header()+screens[ui.tab]()+navbar()+modal();
 if(ui.modal==='command'){const c=$('#commandInput');if(c){c.focus({preventScroll:true});c.setSelectionRange(c.value.length,c.value.length);}}
}
function updateNav(tab){if(!state)return;ui.tab=tab;ui.listPage=0;ui.person=null;render();}
function handlePress(e){const b=e.target.closest('button');if(!b)return;
 const d=b.dataset;
 if(d.setup){if(d.setup==='next')setupStep=Math.min(2,setupStep+1);if(d.setup==='back')setupStep=Math.max(0,setupStep-1);if(d.setup==='start'){createGame();return;}render();return;}
 if(d.pick){if(d.val in (d.pick==='scenario'?scenarioData:locationData))draft[d.pick]=d.val;render();return;}
 if(d.tab){updateNav(d.tab);return;}
 if(d.pager){const attr=d.pager==='narrative'?'narrativePage':d.pager==='action'?'actionPage':'listPage';ui[attr]=Math.max(0,ui[attr]+Number(d.direction||0));render();return;}
 if(d.scene){sceneAction(d.scene);return;}
 if(d.travel){travelTo(d.travel);return;}
 if(d.pack){ui.packSub=d.pack;ui.listPage=0;render();return;}
 if(d.use){useItem(d.use);return;}
 if(d.craft){craft(d.craft);return;}
 if(d.personSelect){ui.person=d.personSelect;state.world.npcs[d.personSelect].met=true;render();return;}
 if(d.personBack){ui.person=null;render();return;}
 if(d.personAction){doPerson(d.person,d.personAction);return;}
 if(d.more){ui.moreSub=d.more;ui.listPage=0;render();return;}
 if(d.base){if(d.base==='deposit'){
  const it=has('water')?'water':has('food')?'food':null;if(!it)return;take(it);state.world.base.stores[it]++;advance(10,2);entry(`Added 1 ${it} to community supplies.`,false);narr('Shared Supplies',`You put one ${it==='water'?'bottle of water':'food ration'} into the marked community storage area. The next time someone is desperate, it could make a difference.`,'SETTLEMENT');
 }else if(d.base==='work'){sceneAction('fortify');return;}save();render();return;}
 if(d.settings){
  if(d.settings==='export'){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=`aftermath-${state.player.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}-day${day()}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);showToast('Save exported. Keep it somewhere safe.');return;}
  if(d.settings==='import'){let fi=$('#importSave');if(!fi){fi=document.createElement('input');fi.type='file';fi.accept='.json,application/json';fi.id='importSave';fi.style.display='none';document.body.appendChild(fi);fi.addEventListener('change',async()=>{const f=fi.files?.[0];if(!f)return;try{const o=JSON.parse(await f.text());if(o.version!==VERSION||!o.player||!o.world||!o.scene||!locationData[o.location]||!scenarioData[o.scenario])throw Error('Incompatible save data.');state=o;ui={tab:'story',actionPage:0,narrativePage:0,listPage:0,moreSub:'journal',person:null,modal:null,command:''};save();render();showToast('Survival save restored.');}catch(err){showToast(err.message||'Could not import the save.');}fi.value='';});}fi.click();return;}
  if(d.settings==='help'){ui.modal='help';render();return;}
  if(d.settings==='debug'){ui.moreSub='debug';render();return;}
  if(d.settings==='reset'){ui.modal='reset';render();return;}
 }
 if(d.debug){advance(Number(d.debug),0);if(!state.dead)narr('Time Passes',`Test tool advanced the world by ${Number(d.debug)/60} hour(s). The physical effects of elapsed time and any due world events have been applied.`, 'TEST MODE');save();render();return;}
 if(d.modal){if(d.modal==='close'){ui.modal=null;render();return;}
  if(d.modal==='submit'){const raw=$('#commandInput')?.value||ui.command||'';ui.command='';runCommand(raw);return;}
  if(d.modal==='reset'){localStorage.removeItem(SAVE_KEY);state=null;draft={...setupDefault};setupStep=0;ui.modal=null;render();return;}
 }
}
document.addEventListener('click',handlePress);
document.addEventListener('change',e=>{if(e.target.id==='occupation'){draft.background=e.target.value;render();}if(e.target.id==='personality'){draft.trait=e.target.value;render();}});
document.addEventListener('input',e=>{if(e.target.id==='charName')draft.name=e.target.value;if(e.target.id==='commandInput')ui.command=e.target.value;});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='commandInput'){e.preventDefault();runCommand(e.target.value);}if(e.key==='Escape'&&ui.modal){ui.modal=null;render();}});
window.addEventListener('pagehide',save);
window.addEventListener('beforeunload',save);
state=load();render();
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();
