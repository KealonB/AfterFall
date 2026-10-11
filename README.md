# AFTERFALL: THE LAST FREQUENCY

**Version 0.1.0** — a playable, original, choice-driven, open-world apocalypse survival text RPG.

A static website: HTML + CSS + JavaScript, no framework, no API keys, no paid hosting, no database, no account, no build process.

## Publish to GitHub Pages

1. Download the release ZIP and **extract it** on your computer. (Do not upload the ZIP unchanged; Pages needs the extracted files.)
2. Log in to GitHub and create a new **public repository**, e.g. `afterfall-rpg`.
3. Choose **Add file → Upload files**. Upload the extracted `index.html`, `styles.css`, `data.js`, `game.js`, `sw.js`, `favicon.svg`, `.nojekyll`, and `README.md` **directly into the root of the repository**, not inside a nested `afterfall-rpg` folder. Commit the files.
4. Open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, then `main` / `/(root)`. Save.
5. When GitHub finishes publishing, open `https://YOUR-USERNAME.github.io/afterfall-rpg/` (the exact URL is shown in the Pages settings).
6. On iPhone in Safari, choose **Share → Add to Home Screen** for an app-like shortcut.

**Already have your own repo?** Extract these files into that repo's published folder and commit. If you publish from `/docs`, place these files there instead and choose the `/docs` location in Pages settings.

> Every game save is stored separately in the browser's storage for the exact GitHub Pages URL. Do not rely on local saves when clearing browser data, switching devices, or changing repository URLs. Use **Radio → Export save** and **Import save** to back up or migrate a campaign.

## What you can do

| System | Content in v0.1.0 |
| --- | --- |
| World | 11 × 11 map (121 sectors), 7 terrains, fog of war, scouting, route plotting, 17 unique landmarks |
| Character | Name your survivor; 5 backgrounds, 3 difficulties, attribute points, levels, XP and perks |
| Needs | Health, hunger, thirst, fatigue, infection, carrying weight, time, weather, daily effects |
| Encounters | 20 procedural encounter types with multiple moral, tactical and resource-dependent solutions |
| Combat | Turn-based melee/firearms, aim, guard, first aid, escape, equipment, companion support, enemy varieties |
| Allies | 8 named companions with locations, recruitment requirements, traits, conversations and trust |
| Economy | Loot tables, 5 town marketplaces, faction-adjusted buy/sell prices, craftable weapons and supplies |
| Factions | 4 groups, persistent relationships, donating aid, diplomatic alliances, military/free-trade/community paths |
| Settlements | Establish up to 4 outposts, 8 buildings with 3 levels, assign companions, 5 policies, residents, storage, production and raids |
| Contracts | 6 repeatable job categories including deliveries, patrols and exploration |
| Main quest | Reactivate 3 relays, discover Station Zero and pick from 4 campaign endings. Free roam continues afterward. |
| Interface | Responsive computer/iPhone layouts, 4 accent themes, keyboard movement, chronicle, onscreen compass |
| Persistence | Automatic local saves, JSON export/import, offline static-asset caching after first load over HTTPS |

This is **an extensive first playable release**, not a finished commercial game. The map is authored + procedurally tiled, with 121 navigable sectors. It does not yet contain animated art, thousands of hand-written dialog lines, asynchronous multiplayer, cloud syncing, or a live server-backed economy.

## Playing

- **Explore**: click/tap a discovered sector on the map to plan a route. Routes stop for threats. Unexplored sectors can be reached with the compass and exposed by scouting.
- **Survive**: forage for food and water, scavenge up to three times per tile per day, rest in safety, and watch your health bars.
- **Meet people**: towns contain traders, contracts, and possible companions. The *Crew* screen tracks your people and abilities.
- **Found outposts**: bring 7 timber, 10 scrap, 2 rations and 2 clean water to a non-town location. Choose *Settlements*, name the settlement and select **Establish Outpost**.
- **Expand**: wells, gardens and workshops generate material each day. Population consumes water and food. Walls, watchtowers and assigned guards resist raids.
- **Advance the main quest**: seek **Northwatch Relay** (8,2), **Reservoir Relay** (2,5), and **Skyglass Observatory** (5,9). Repair them in any order. Then travel to **Station Zero** (9,9).
- **Save**: progress autosaves after actions. Export often. Keyboard arrow keys or WASD move one sector on desktop (when the Explore tab is active).

## Project structure

```text
afterfall-rpg/
├── index.html      # Game page
├── styles.css      # All appearance / mobile layout
├── data.js         # World definitions, character backgrounds, items, NPCs, recipes
├── game.js         # Mechanics, stories, views, save system and interactions
├── sw.js           # Offline cache for HTTPS deployments
├── favicon.svg     # Browser icon
├── .nojekyll       # GitHub Pages helper
└── README.md       # These directions
```

## Development / editing

You can edit text, items, professions, landmarks, NPCs, buildings and item recipes in **data.js**. Most mechanical interactions, narrative encounter choices and renderers live in **game.js**. Visual appearance and accent-color settings are in **styles.css**.

To preview locally, open `index.html` in a browser. For consistent save behavior and service-worker testing, run a basic static server in the extracted folder, for example:

```sh
python -m http.server 8000
```

Open `http://localhost:8000` afterward.

If you deploy a future version with updated scripts or styles, change the `CACHE` string in `sw.js` from `afterfall-v0.1.0` to the newer number and bump the game version in `data.js`. Reload the hosted site after GitHub Pages finishes publishing to pick up its new cache.

## Privacy and limitations

- Gameplay is entirely client-side; it does not send player choices or save data to a server.
- LocalStorage is per browser, device and origin. Private browsing or blocked site storage can prevent persistent saves. File exports continue to work when downloads are permitted.
- Importing a save replaces the current device's local campaign, after confirmation.
- This first release has one save slot per browser URL. Export files are the workaround for multiple campaigns.
- Offline mode starts **after** you first load the published site on HTTPS while online and the service worker successfully caches the game files. Some mobile browsers can evict offline caches.
- v0.1.0 has no analytics, payments or networked account system.

## Suggested next versions

- **v0.2.0:** regional story arcs, unique boss encounters, companion quests, special settlement incidents, location-specific inventories, branching faction campaigns.
- **v0.3.0:** procedural wilderness outside the starter region, vehicles, equipment durability, relationships, weather disasters, more sophisticated settlements, narrative event editor.
- **v0.4.0:** mod-friendly JSON world packs, character portraits, achievements, multiple character slots and optional cloud saves (requires authentication/backend).

Original game concept, narrative and code designed for the playable prototype.
