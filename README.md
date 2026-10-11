# AFTERMATH: A World That Remembers
## Mobile-only text survival RPG — playable alpha v0.1.0

### What is included

- **Scenario selection:** The Blackout, The Infection, The Fallout, The Fracture, and The Long Winter. Scenarios change opening narrative, location conditions, regional events, and some dangers.
- **Playable survivor:** Alex Morgan is prefilled as an Electrical / Facilities Technician with Calm Under Pressure. You can customize the name, background, trait, and starting location.
- **The first 72 hours and beyond:** In-game time, physical needs, time-triggered world events, and continued play after the 72-hour milestone.
- **9 persistent destinations,** location-specific finite loot, travel costs, scavenging, hazards, and encounters.
- **10 named NPCs** with trust, memories, local priorities, conversations, help requests, trade, and up to 2 traveling companions.
- **Inventory, consumption, crafting, injury recovery, infrastructure repairs, and safehouse upgrades.**
- **Auto-saving via localStorage, manual JSON export/import, offline PWA caching, and a built-in simulation test menu.**
- **No scrolling:** Every screen uses a fixed mobile viewport, 3-choice/page navigation, and paged journal / inventory / narrative content.
- Fully static: no build tools, hosting bills, accounts or external API keys.

### Deploy to GitHub Pages

1. Create a public GitHub repository (for example `aftermath-mobile`).
2. Upload **all the files and the `icons/` folder** from this package to the repository root. Ensure `index.html` is at the root.
3. Go to **Settings → Pages → Build and deployment → Deploy from a branch**. Choose `main` and `/(root)` and save.
4. Open the GitHub Pages URL **on an iPhone or Android phone**. Desktop-width screens with mouse pointers display a mobile-only notice.
5. Optional: In Safari, use **Share → Add to Home Screen**. In Chrome on Android, use **Install app** / **Add to Home screen** (when offered).

The web app supports offline replay **after its resources have loaded and the service worker has installed**. On iPhone, install and open it once with an active connection before relying on offline support.

### How to play

- **STORY**: Read paged text and take actions. More options appear using NEXT; you can enter defined freeform commands using *Attempt a custom action*.
- **TRAVEL**: Move around the simulated Kansas City region. Travel advances the clock and drains energy.
- **PACK**: Review supplies and use water, food, bandages, or first aid. Craft basic supplies.
- **PEOPLE**: Talk, help, trade, and invite companions.
- **MORE**: Journal, status, safehouse, settings and export/import. **Settings → Test tools** helps test time-triggered changes.

### Important alpha limitations

This is a fully playable **local, rules-based prototype**, not a trained AI storyteller. The freeform command interpreter understands a useful set of actions but cannot execute arbitrary English requests yet. World events are scheduled and condition-driven with some random encounters, **not** a complete independent NPC economy or full faction simulation. Combat and crafting are intentionally simplified. Save data stays in the same browser unless exported; there is no cloud sync or multi-device account.

### Versioning / updates

The service worker cache is named `aftermath-mobile-v0.1.0`. Change that string when shipping future versions; update `VERSION` in `app.js` thoughtfully if altering save formats. For a minor update that preserves saves, consider keeping the current save schema compatible instead of changing `VERSION`.

No real-world map APIs are used. Location names and travel times are **fictional game mechanics**, not navigation guidance or real-world travel estimates.
