/* AFTERFALL — game definitions. Add items, stories, regions and recipes here. */
'use strict';
window.AF_DATA = {
  title: 'AFTERFALL: THE LAST FREQUENCY',
  version: '0.1.0',
  width: 11, height: 11,
  professions: {
    scout: {name:'The Pathfinder', icon:'🧭', desc:'You read roads, ruins, and danger before anyone else.', stats:{grit:2,wits:4,heart:2}, gear:{knife:1,water:4,food:4,cloth:3,wood:4,scrap:5}, perk:'Scouting is more effective; retreat is easier.'},
    mechanic: {name:'The Tinkerer', icon:'🔧', desc:'Before the fall, you kept impossible machines alive.', stats:{grit:2,wits:5,heart:1}, gear:{wrench:1,water:3,food:4,scrap:10,wood:6,circuit:2}, perk:'Crafting and relay repair cost fewer materials.'},
    medic: {name:'The Field Medic', icon:'🩺', desc:'You learned to save lives when supplies ran out.', stats:{grit:2,wits:3,heart:4}, gear:{knife:1,water:3,food:4,medkit:3,herbs:4,cloth:4}, perk:'Medkits heal more; treating infection is easier.'},
    envoy: {name:'The Negotiator', icon:'🤝', desc:'You survived by making enemies listen.', stats:{grit:1,wits:3,heart:5}, gear:{pistol:1,ammo:8,water:3,food:4,medicine:2,scrap:7}, perk:'Better trade prices and peaceful encounter outcomes.'},
    veteran: {name:'The Survivor', icon:'🛡️', desc:'The world ended. You refused to follow.', stats:{grit:5,wits:2,heart:1}, gear:{pistol:1,ammo:14,water:3,food:4,medkit:1,scrap:6,wood:4}, perk:'More combat damage and extra starting health.'}
  },
  difficulties: {
    wanderer:{name:'Story',desc:'Gentle survival, easier fights, a world made for exploring.',combat:0.75,needs:0.65,loot:1.4,raid:0.6},
    survivor:{name:'Survivor',desc:'A balanced and dangerous wasteland.',combat:1,needs:1,loot:1,raid:1},
    nightmare:{name:'Nightmare',desc:'Scarce resources, hard choices, and brutal enemies.',combat:1.3,needs:1.28,loot:0.75,raid:1.3}
  },
  terrain: {
    road:{name:'Cracked Highway',icon:'🛣️',cost:1,danger:2,scavenge:['scrap','cloth','ammo','food'],text:'The asphalt has split open. Empty cars sit like fossils.'},
    forest:{name:'Whisperwood',icon:'🌲',cost:2,danger:2,scavenge:['wood','herbs','food','cloth'],text:'Tall pines swallow the light. Something moves beyond your vision.'},
    suburb:{name:'Dead Suburb',icon:'🏚️',cost:2,danger:3,scavenge:['food','cloth','scrap','medicine'],text:'Every front door is a question. Every window might be watching.'},
    industrial:{name:'Rust District',icon:'🏭',cost:3,danger:4,scavenge:['scrap','circuit','fuel','ammo'],text:'Rusting machinery grinds in the wind. Old warnings peel off the walls.'},
    farmland:{name:'Overgrown Fields',icon:'🌾',cost:2,danger:1,scavenge:['food','wood','herbs','water'],text:'A sea of weeds conceals old rows and forgotten paths.'},
    hills:{name:'Broken Highlands',icon:'⛰️',cost:3,danger:3,scavenge:['stone','wood','scrap','herbs'],text:'The road is gone. From the ridgeline, the horizon seems endless.'},
    marsh:{name:'Floodplain',icon:'🌫️',cost:3,danger:4,scavenge:['water','herbs','food','cloth'],text:'Dark water swallows the road. Mosquitoes hum around sunken cars.'}
  },
  items: {
    food:{name:'Rations',icon:'🥫',type:'supply',value:9,weight:1,desc:'Restores 32 hunger.'},
    water:{name:'Clean Water',icon:'💧',type:'supply',value:12,weight:1,desc:'Restores 38 hydration.'},
    medkit:{name:'Field Medkit',icon:'🩹',type:'medical',value:38,weight:1,desc:'Restores health and treats wounds.'},
    medicine:{name:'Antibiotics',icon:'💊',type:'medical',value:50,weight:1,desc:'Reduces infection.'},
    herbs:{name:'Medicinal Herbs',icon:'🌿',type:'material',value:6,weight:1,desc:'Useful in treatment and cooking.'},
    cloth:{name:'Cloth',icon:'🧵',type:'material',value:4,weight:1,desc:'Bandages, shelter and repairs.'},
    scrap:{name:'Scrap Metal',icon:'⚙️',type:'material',value:5,weight:1,desc:'Construction and improvised tools.'},
    wood:{name:'Timber',icon:'🪵',type:'material',value:4,weight:1,desc:'A foundation for rebuilding.'},
    stone:{name:'Masonry',icon:'🪨',type:'material',value:3,weight:1,desc:'Fortifications and structures.'},
    circuit:{name:'Electronics',icon:'🔌',type:'material',value:23,weight:1,desc:'Radios, relays and electronics.'},
    fuel:{name:'Fuel',icon:'🛢️',type:'material',value:17,weight:1,desc:'Power and transport.'},
    ammo:{name:'Ammunition',icon:'🔸',type:'material',value:8,weight:0.2,desc:'Needed for firearms.'},
    credits:{name:'Trade Scrip',icon:'🪙',type:'currency',value:1,weight:0,desc:'Accepted by most of the surviving towns.'},
    knife:{name:'Field Knife',icon:'🔪',type:'weapon',damage:7,value:24,weight:2,desc:'Reliable. Quiet. Too close for comfort.'},
    wrench:{name:'Heavy Wrench',icon:'🔧',type:'weapon',damage:9,value:30,weight:3,desc:'An ugly but effective weapon.'},
    hatchet:{name:'Hatchet',icon:'🪓',type:'weapon',damage:11,value:43,weight:3,desc:'Useful in a fight and the forest.'},
    pistol:{name:'9mm Sidearm',icon:'🔫',type:'weapon',damage:16,value:100,weight:3,ammo:1,desc:'Powerful, loud, and hungry for ammunition.'},
    rifle:{name:'Hunting Rifle',icon:'🎯',type:'weapon',damage:24,value:190,weight:5,ammo:2,desc:'Long reach and devastating precision.'},
    vest:{name:'Patchwork Armor',icon:'🦺',type:'armor',armor:3,value:72,weight:4,desc:'A little metal between you and the end.'},
    plate:{name:'Ballistic Vest',icon:'🛡️',type:'armor',armor:6,value:180,weight:7,desc:'Heavy, but worth carrying.'},
    backpack:{name:'Hiking Pack',icon:'🎒',type:'equipment',value:65,weight:1,desc:'Increases carrying capacity by 35.'},
    radio:{name:'Shortwave Radio',icon:'📻',type:'equipment',value:85,weight:2,desc:'A lifeline to the growing network.'}
  },
  recipes: [
    {id:'medkit',qty:1,needs:{cloth:3,herbs:2},hours:2,desc:'Sterilize and stitch together a field dressing.'},
    {id:'food',qty:3,needs:{herbs:2,wood:1},hours:2,desc:'Stretch foraged roots into travel rations.'},
    {id:'water',qty:3,needs:{wood:2,cloth:1},hours:2,desc:'Filter and boil doubtful water.'},
    {id:'knife',qty:1,needs:{scrap:4,cloth:2},hours:2,desc:'Forge an improvised blade.'},
    {id:'hatchet',qty:1,needs:{scrap:8,wood:4},hours:3,desc:'A serviceable tool and weapon.'},
    {id:'ammo',qty:8,needs:{scrap:5,circuit:1},hours:3,desc:'Reload spent cases with scavenged components.'},
    {id:'vest',qty:1,needs:{scrap:10,cloth:6},hours:4,desc:'Reinforce your jacket with metal plates.'},
    {id:'radio',qty:1,needs:{circuit:3,scrap:6},hours:4,desc:'Repair a battered shortwave transceiver.'},
    {id:'backpack',qty:1,needs:{cloth:8,wood:3},hours:3,desc:'Sew a rugged load-bearing pack.'}
  ],
  factions: {
    union:{name:'Roadward Union',icon:'🚚',color:'#a4cce2',desc:'Caravans, repair crews and free traders linking isolated towns.'},
    verdant:{name:'Verdant Assembly',icon:'🌱',color:'#8fd09d',desc:'Farmers and medics who believe survival must be shared.'},
    choir:{name:'Iron Choir',icon:'⚔️',color:'#dfb087',desc:'Disciplined soldiers promising security at the price of freedom.'},
    vultures:{name:'Ash Vultures',icon:'☠️',color:'#da8493',desc:'Raiders who have built a society around taking from others.'}
  },
  landmarks: [
    {x:5,y:5,id:'crossroads',name:'Crossroads Shelter',icon:'🏠',kind:'shelter',description:'An abandoned highway service station. The solar-powered terminal hums against all odds.',lore:'Your story begins where two ruined roads meet. Somewhere beyond the horizon, a radio repeats coordinates no one recognizes.'},
    {x:6,y:5,id:'hearth',name:'Hearth Market',icon:'🏘️',kind:'town',faction:'union',description:'A bustling walled truck stop where caravans swap everything from salt to secrets.',lore:'A woman on the wall calls down: "Keep your hands where we can see them, and we will have no trouble."'},
    {x:2,y:2,id:'orchard',name:'Orchard Commons',icon:'🍎',kind:'town',faction:'verdant',description:'A survivor collective among apple orchards and jury-rigged greenhouses.',lore:'Children run between water barrels. For a moment, the old world seems imaginable.'},
    {x:9,y:5,id:'bastion',name:'Bastion Gate',icon:'🏰',kind:'town',faction:'choir',description:'An old national guard armory operating under a strict military code.',lore:'A sentry records your name in a battered ledger and asks what you are willing to sacrifice for order.'},
    {x:1,y:7,id:'riverhold',name:'Riverhold',icon:'🚣',kind:'town',faction:'union',description:'A floating market moored beneath the remains of an interstate bridge.',lore:'A hundred cables creak in the wind. Boats move between the floating shops.'},
    {x:7,y:7,id:'clinic',name:'Saint Mercy Clinic',icon:'🏥',kind:'town',faction:'verdant',description:'A former trauma center maintained by volunteers and surgical scavengers.',lore:'The lobby smells of antiseptic. You can hear generators through the walls.'},
    {x:8,y:2,id:'northrelay',name:'Northwatch Relay',icon:'📡',kind:'relay',description:'An elevated radio tower overlooking the industrial dead zone.',lore:'A weak blue LED flashes in a control room supposedly abandoned for twelve years.'},
    {x:2,y:5,id:'waterrelay',name:'Reservoir Relay',icon:'📡',kind:'relay',description:'A transmission station straddling a damaged flood-control dam.',lore:'The reservoir lies still, dotted with drowned rooftops.'},
    {x:5,y:9,id:'skyrelay',name:'Skyglass Observatory',icon:'🔭',kind:'relay',description:'An observatory repurposed as a remote relay station.',lore:'The dome is broken, but its receiver is pointed toward the black hills.'},
    {x:9,y:9,id:'blacksite',name:'Station Zero',icon:'⚫',kind:'finale',description:'A secret, hardened broadcast site beneath an unmarked research complex.',lore:'Below the facility, a machine whispers the names of places that no longer exist.'},
    {x:4,y:4,id:'hospital',name:'Greywater Hospital',icon:'🏨',kind:'ruin',description:'Quarantined wards, emergency supplies and a basement nobody talks about.',lore:'Handwritten triage lists still hang on the walls. Some names have been crossed out twice.'},
    {x:5,y:2,id:'foundry',name:'Coalspur Foundry',icon:'🏭',kind:'ruin',description:'Heavy industry, abandoned machinery and an untouched maintenance cage.',lore:'A lone red light spins across a production floor strewn with abandoned tools.'},
    {x:3,y:8,id:'railyard',name:'Bone Rail Depot',icon:'🚂',kind:'ruin',description:'Freight cars stuffed with forgotten goods and unsavory occupants.',lore:'Someone painted the words "EVERYTHING HAS A PRICE" across the roundhouse.'},
    {x:1,y:9,id:'prison',name:'Hollow Penitentiary',icon:'⛓️',kind:'ruin',description:'A prison reclaimed by opportunists, shadows and half-told legends.',lore:'A watchtower tilts over the chain-link fence. A light burns in cell block D.'},
    {x:9,y:1,id:'quarry',name:'Redstone Quarry',icon:'🪨',kind:'ruin',description:'An old mining camp now controlled by the Ash Vultures.',lore:'A line of smoke rises from a barricade. The raiders have been here recently.'},
    {x:1,y:3,id:'farmstead',name:'The Last Farmstead',icon:'🚜',kind:'ruin',description:'Silos, abandoned tractors, and crates hidden under the barn.',lore:'A weather vane still turns over a collapsed farmhouse.'},
    {x:7,y:3,id:'substation',name:'Edison Substation',icon:'⚡',kind:'ruin',description:'A damaged electrical yard with valuable salvage.',lore:'An arc snaps across an open transformer. Everything here has sharp edges.'}
  ],
  companions: [
    {id:'mara',name:'Mara Voss',icon:'🧑🏽‍🔧',role:'Mechanic',place:'hearth',skill:'engineer',attack:7,maxHp:64,trait:'Repairs settlement structures at reduced cost.',intro:'Mara sits beside a disassembled generator. "Tell me you know the difference between a fuse and a wish."',request:'Bring 5 scrap to help repair her caravan generator.',cost:{scrap:5},voice:['"Give me a problem I can actually fix."','"There is always another way to wire it."','"I miss the noise of an ordinary city."']},
    {id:'eli',name:'Eli Park',icon:'👨🏻‍⚕️',role:'Medic',place:'clinic',skill:'medic',attack:4,maxHp:56,trait:'Restores 3 party health after safe rests.',intro:'Eli finishes wrapping a stranger’s wrist. "If you are leaving the walls, you need someone who can keep you alive."',request:'Contribute 2 medkits to Saint Mercy.',cost:{medkit:2},voice:['"Not every wound leaves a scar."','"We have to protect the people who cannot fight."','"I am counting bandages again."']},
    {id:'jun',name:'Jun Calder',icon:'👩🏾‍🌾',role:'Grower',place:'orchard',skill:'farmer',attack:5,maxHp:60,trait:'Boosts food production if assigned to a settlement.',intro:'Jun is repairing an irrigation pump. "There is a future, but it has to be planted."',request:'Bring 4 timber to reinforce the greenhouse.',cost:{wood:4},voice:['"Every seed is a dare against the end."','"Those clouds look good for rain."','"Have you ever seen an apple tree in bloom?"']},
    {id:'rooks',name:'Rook Salazar',icon:'🧔🏽‍♂️',role:'Former Ranger',place:'railyard',skill:'fighter',attack:11,maxHp:85,trait:'Adds heavy combat damage to the party.',intro:'A scarred figure cleans a rifle on an overturned crate. "Nobody leaves that rail yard alone. Not anymore."',request:'Clear a Vulture ambush or pay 30 trade scrip to earn his trust.',cost:{credits:30},voice:['"Check your corners."','"People are not born monsters."','"I have seen enough last stands."']},
    {id:'nyx',name:'Nyx Vale',icon:'👩🏻‍💻',role:'Signal Hunter',place:'northrelay',skill:'scout',attack:7,maxHp:57,trait:'Reveals nearby points of interest while traveling.',intro:'A young radio operator leans over a crackling receiver. "Someone is broadcasting from Station Zero. And they are listening back."',request:'Supply 2 electronics to repair her antenna.',cost:{circuit:2},voice:['"Nothing is ever really off the air."','"That frequency was not supposed to exist."','"I keep hearing three knocks in the static."']},
    {id:'sable',name:'Sable Quinn',icon:'👩🏽‍🎤',role:'Smuggler',place:'riverhold',skill:'trader',attack:8,maxHp:60,trait:'Earns better scrip from odd jobs and events.',intro:'Sable flips a coin across her knuckles. "Rules are for people who can afford them."',request:'Bring 3 fuel for a river crossing.',cost:{fuel:3},voice:['"Nobody owns the roads."','"Never show how much you can pay."','"I know a shortcut. Usually."']},
    {id:'gideon',name:'Gideon Cross',icon:'🧔🏻',role:'Deserter',place:'bastion',skill:'guard',attack:10,maxHp:80,trait:'Improves defenses if assigned to a settlement.',intro:'A soldier with his insignia torn off watches the gate. "You want to survive? Start by deciding what you will not do."',request:'Convince him you value mercy (Heart 4) or offer 40 scrip.',cost:{credits:40},voice:['"Discipline should serve people, not rule them."','"There is a storm coming."','"I swore an oath before the world broke."']},
    {id:'tamsin',name:'Tamsin Grey',icon:'👩🏼‍🔬',role:'Researcher',place:'hospital',skill:'researcher',attack:4,maxHp:53,trait:'Reduces electronics costs for relay repair.',intro:'A scientist peers out from behind a respirator. "I have data they burned an entire ward to hide."',request:'Give 2 medicine to treat quarantined patients.',cost:{medicine:2},voice:['"Truth is not always a cure."','"The old protocols made everything worse."','"We can learn from what happened."']}
  ],
  buildings: {
    well:{name:'Purification Well',icon:'💧',desc:'Produces clean water each new day.',base:{scrap:6,wood:5,cloth:2},effect:'water +3/day'},
    garden:{name:'Community Garden',icon:'🌱',desc:'Produces rations and improves morale.',base:{wood:8,scrap:4,herbs:2},effect:'food +3/day'},
    workshop:{name:'Salvage Workshop',icon:'🛠️',desc:'Recovers scrap and electronics as you work.',base:{scrap:10,wood:7,circuit:1},effect:'scrap +2/day'},
    watch:{name:'Watchtower',icon:'🔭',desc:'Makes settlement raids less dangerous.',base:{wood:10,scrap:8,stone:3},effect:'defense +5/level'},
    clinic:{name:'Field Infirmary',icon:'🏥',desc:'Increases health recovery and morale.',base:{wood:7,scrap:7,cloth:5,medicine:1},effect:'morale and healing'},
    barracks:{name:'Survivor Barracks',icon:'🏘️',desc:'Raises the population capacity of your settlement.',base:{wood:11,scrap:6,cloth:4},effect:'capacity +5/level'},
    antenna:{name:'Radio Mast',icon:'📻',desc:'Connects your settlement to the wider world.',base:{scrap:9,circuit:3,wood:5},effect:'influence and morale'},
    walls:{name:'Reinforced Perimeter',icon:'🧱',desc:'A costly but effective defense against raids.',base:{stone:10,scrap:12,wood:6},effect:'defense +8/level'}
  },
  tips: [
    'Water is harder to find than food. Keep at least three clean bottles.',
    'Bandits can sometimes be reasoned with, bribed, or avoided entirely.',
    'Your companions are people, not equipment. Their loyalty matters.',
    'Safe towns provide work, new allies, medical care and trade.',
    'A settlement can thrive without you, but a poorly defended one attracts raids.',
    'Use the route planner by tapping a discovered tile beyond your current location.',
    'Repair all three relays to uncover the source of the Last Frequency.',
    'Even after the central story ends, the wasteland remains open to explore.'
  ]
};
