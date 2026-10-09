# Loom

*Weaving your Achaea client together.*

**Version 0.1**: everything as it runs in game today, with source and history in one place. v0.2 is under way: see [ROADMAP.md](ROADMAP.md).

Loom is a suite of reflex packages for the [Nexus](https://play.achaea.com) client of Achaea. Each
package is self-contained: it can be dropped onto any character without
bringing the others along. The tab packages share one house style (ink panel,
serif small-caps headings, one large figure, monospace ledger rows) and give
their tab its own icon.

## Packages

| Package | Tab | What it does |
|---|---|---|
| **artificing** | — | Elemental treaties (`TF <elemental>`, pausing triggers and sipping during the communion) and `STAFFATTACK fire\|frost\|lightning` for the F1 staff cast. |
| **civic** | — | City duties for any city, one ministry at a time. Ambassador aide: `CIVIC AIDE ON/OFF`, `CIVIC GREET <name> [CT\|CLT]`, aide title and novice clan per city (pre-filled for Eleusis), lesson requests accepted except from enemies. `CIVIC HELP`. Replaces **eleusis**. |
| **coffers** | Coffers | Gold tracker: fortune (purse + bank), income and spending per session and per day, wealth ranks, records, a goal, charts. Gold and bank come from GMCP; the books are kept on each prompt (one that starts `<n>h, <n>m,`). `COFFERS HELP`. Reads nothing from other packages. |
| **conjuration** | — | `CONJURE <sigil>`: runs the full creation ritual for the sigils currently known. |
| **crystalism** | — | `CRYSTALISM REFINE [n]` levels crystal shapes evenly from stored facets; pearl pickup (`CRYSTALISM PEARLS ON/OFF`); a sonic portal for city members who ask with "Gate." (`CRYSTALISM PORTAL ON/OFF`); pauses triggers while attuning to the Master Crystal. `CRYSTALISM HELP`. Reads **social**'s city list if present. |
| **defcon** | — | Defence readiness for any class. `DEFCON 1-5` keeps the defences of that tier and above in curing (per-class tables for Druid, Magi, Sylvan and dragonform; general defences for other classes), `DEFCON UP` raises your class defences (automatically on login, `DEFCON AUTOUP OFF` to stop), `DEFCON LIST`, `DEFCON ON/OFF` (the game's defence upkeep); insomnia upkeep, pear when choking underwater, status highlights. `DEFCON HELP`. Replaces **defences**. Reads nothing from other packages. |
| **dmgchart** | DmgChart | Damage dealt and taken by type per fight, as donuts with dps (a new fight after a quiet gap, `DMGCHART GAP`), bleeding as its own type, exchange stats (hits, biggest hit, trading ratio, healing, how long your health lasts after healing). Record sessions with `DMGCHART START [name]` / `END`, then `LIST`, `SHOW <#>`, `DEL <#>`. Health comes from GMCP. `DMGCHART HELP`. Reads nothing from other packages. |
| **elementalism** | — | Illusions: `ILLUSION`, `FEEL_<environment>` (desert, forest, …), and step-by-step set pieces (`PINK_DRAGON`, `KAWHEDRAGON_F/M <target> <step>`). |
| **fishing** | — | Fishing automation: `FISHING BAIT <bait>`, then `FISHING CAST <direction>` (or the shortcut `CL <direction>`) to bait and cast; teases, jerks and reels on the game's cues, with stage markers on each line. Tells the party on a new yearly record (`FISHING DING ON/OFF`). `FISHING HELP`; any other word after FISHING still goes to the game. Statistics live in **fishingstats**. Reads nothing from other packages. |
| **fishingstats** | fishingstats, fishinglog | Casts, hooks and catches for you and everyone around you, per angler and per species with weights; sessions file themselves after an idle gap into a log. Flags catches that beat this year's rankings (type `RANKINGS FISHING` to load them). Area and your name come from GMCP. `FISHINGSTATS HELP`. Reads nothing from other packages. |
| **groves** | — | *Retired (druid).* Opens the grove gate for city members who send "Gate." while you are in your grove. |
| **harvesting** | — | Stock-aware auto-harvest on room entry: harvests and stores only the plants of the room's environment that are below their minimum rift stock. `HARVESTING ON/OFF`, `MIN <n>` (default minimum), `MIN <plant> <n\|DEFAULT>`, `STOCK`, `HELP`; bare `HARVESTING` lists what is short. Reads nothing from other packages. |
| **hunting** | — | Class F-key buttons with battlerage cooldown highlights (Druid, Magi, Sylvan, Black and Blue Dragon; other classes get the generic keys), dragon attack mode, autogold, ability and critical-hit highlights, affliction markers and combat gags. One command: `HUNTING` (`DRAGONMODE`, `AUTOGOLD`, `PARTYTARGET`, `AFTERFORM`, `HELP`). Publishes `my_rage` for partycomms; reads security's `backpack`, artificing's `staffAttack` and huntstats (for the F9 key) if present. |
| **huntstats** | Stats | Per-area hunting records: xp, gold and kills an hour, Dragonhood progress and ETA, who hunted with you, area comparison. A hunt is filed when you leave its area, and survives a refresh or disconnect. Area, players and level come from GMCP. `HUNTSTATS HELP`. Reads nothing from other packages; **loom**'s `QUIT` files the hunt under way when huntstats is installed. |
| **ledger** | Ledger | IC reminders and standing items on the Achaean calendar. `LEDGER`. |
| **levelgraph** | Level | Level progress graphs per minute and per day, rates and time to the next level. Level and percent come from GMCP, sampled once per prompt whatever the prompt looks like. `LEVELGRAPH HELP`. Reads nothing from other packages. |
| **loom** | — | The suite package (replaces **common**). `LOOM` lists the packages loaded with their versions; `LOOM PAUSE ON/OFF` and `LOOM DEBUG ON/OFF` set the shared flags; `LOOM ROOM` shows the current room. Also the `QUIT`/`QQ` wrapper, `REFILLVIAL`, pausing during sleep, meditation and the Mnemosyne, and assorted highlights and gags. From v0.4 it holds the integrations between packages. |
| **numpad_movement** | — | Movement and quick commands on the number pad. |
| **partycomms** | Party | Shares party vitals and targets over party tell, shown as bars in a Party tab. `PARTYNAME`, `PARTYON`/`PARTYOFF`. |
| **patrolling** | — | Checks each room's plants against what its environment should hold and flags shrines and totems (`PATROLLING ON/OFF/HERE/LEARN`), suggests areas to patrol (`SUGGEST`, `STAMP`), and, with a clan set, reports fires (`FIRE`) and lightning strikes and logs replantings to the clan log. `PATROLLING CLAN`, `PATROLLING GOD`, `HELP`. Reads **ledger**'s Achaean date if present. |
| **reclamation** | — | *Retired (druid).* Records where enemies are seen in Eleusis and can alert the party (`REPORTENEMIES ON/OFF`, `WHEREIS <name>`, `VINESREPORT [days]`). |
| **roleplay** | — | A large set of custom emotes, step-by-step rituals (including the Saiha `GRADUATION <name> <step>` ceremony), and the ambient emote system (`AEM ON/OFF/NOW/RELOAD`). |
| **security** | — | Antitheft (`SECURITY ANTITHEFT ON/OFF`: puts back watched worn items, the backpack and gold taken out of it), `GG`/`PG` to move gold out of and into the backpack, your backpack and watched items as settings (`SECURITY BACKPACK`, `SECURITY ITEM ADD/DEL`, `SECURITY ITEMS`), house state commands (`SECURITY HOUSE IN/OUT`), and give, sell, drop and offer wrappers that lift selfishness around the action (selfishness followed from GMCP). `SECURITY HELP`. Publishes the backpack id at `client.loom.security.backpack`. |
| **self** | Self | Replacement for the stock character panel (see below). `SELF HELP`. Your name, class and level come from GMCP. Reads nothing from other packages. |
| **sigils** | — | Monolith and flame sigil watcher for any city: probes the monolith in every room you enter and flags sigils running out; the report lists them with an estimated cost. `SIGILS HELP`. |
| **social** | — | Name highlighting by group (family, enemies, order, house, city, allies, friends, and your own name), and online/offline notices for the groups you watch. `SOCIAL ADD/DEL <group> <name>`, `LIST`, `COLOR`, `WATCH/UNWATCH`, `POLL ON/OFF/NOW`, `HELP`; your city's enemies list reloads itself from the game's list. Publishes the lists at `client.loom.social` (`groups`, `lists[group]`, `color[group]`), and still at `client.hl` for packages not yet updated. |
| **standings** | Standings | EVE-style standings with adventurers and organisations, kept per character. `STANDINGS HELP`. Reads **social**'s lists (chips on a person) and **ledger**'s Achaean date if present. Other packages can suggest a dealing for review through `client.loom.standings.sug` + `standings_suggest`. |
| **talpieces** | Talismans | Dragon talisman piece tracker: pieces counted as you find, trade and list them, still-needed table, progress history with a projected finish. Can queue `TALISMAN COMBINE` for each row of your listing (`TALPIECES COMBINE ON/OFF`). `TALPIECES HELP`. Replaces **talismans** (same Talismans tab; the TalGraph tab is gone, close it). Reads nothing from other packages. |
| **vision** | — | Alertness filter: hides reports about city members and, for enemies, colours the line and alerts the party. `VISION ON/OFF`, `HIDE ON/OFF`, `ALERT ON/OFF`, `CHANNEL <channel>`, `HELP`. Reads **social**'s city and enemies lists if present. |

### Dependencies between packages

The v0.2 work (see [ROADMAP.md](ROADMAP.md)) is removing these one package at a time. What remains:

- **loom** still sets the legacy variables `currentRoomId`, `currentRoomName`, `currentArea`, `currentEnvironment` and `activeClass` for packages that haven't had their v0.2 pass. **harvesting**, **sigils**, **civic**, **hunting** and **defcon** already follow GMCP themselves (hunting and defcon still borrow `activeClass` until the first class message of a session); **civic** checks the enemies list of **social**, and adds new citizens to its city list, only when it's installed.
- **artificing** and **roleplay** read `activeClass`.
- **crystalism**, **vision** and **standings** read the lists of **social** at `client.loom.social`.
- **patrolling** reads the Achaean date from **ledger** when it logs a replanting, and **standings** when it dates an entry.
- **hunting** puts autogold into **security**'s backpack when it is set, uses **artificing**'s `staffAttack` for the magi staff key, and shows a Stats key only when **huntstats** is installed. **partycomms** reads the `my_rage` that hunting publishes.
- **groves** and **reclamation** read the lists of **social**; both are exported disabled, since they belong to the druid days.
- Many triggers respect the `pauseTriggers` flag, which **loom** toggles. Packages treat an unset flag as off.

### Installing a package

1. Import `dist/<package>.nxs` in Nexus (Settings → Reflexes → Import).
2. If the package has a tab, create a custom UI tab with exactly the name in the table above. If it doesn't appear, reset the UI layout.
3. Reload the page.

Data (gold history, ledger items, standings, …) lives in Nexus variables, not in the package, so reimporting a newer version keeps it.

### Self

A replacement for the stock character panel: name, race, class and level in the title, then

- **Character**: age, XP rank (with its change since the page loaded), explorer rank, city and house rank, soldier, and rest, hunger and sobriety, colour-coded.
- **Condition**: bleeding (red from 50), rage (yellow from 14, green from 36), channels, resistances.
- **Afflictions**: unwanted afflictions as red chips in a fixed row; a yellow **diag** chip when a venom's effects are unknown.
- **Defences**: what's up; watched defences green when up and red under "missing" when not; stripped ones linger for two minutes.

After importing: `DEF`, `DIAG` and `SCORE` once.

| Command | |
|---|---|
| `SELF` | Name, class, afflictions, and watched defences that are missing. `SELF HELP` for the commands. |
| `SELF WANT <def> [...]` / `SELF UNWANT <def> [...]` | Watch defences. Each class keeps its own list, dragonform included. |
| `SELF WANTS` | List watched defences for the current class. |
| `SELF KEEP <aff> [...]` / `SELF UNKEEP <aff> [...]` | Hide afflictions kept on purpose (deafness, blindness, insomnia by default). `SELF KEEPS` lists them. |
| `SELF NAME [<name>\|CLEAR]` | Show another name in the title; by default it's the game's. |

## Working on the packages

Source lives in `packages/<name>/`: one `.js` file per function and per alias or trigger script, and a `package.json` with everything else (names, patterns, options, order), pointing at those files with `@file:` references. The `.nxs` files in `dist/` are built from them.

```sh
python tools/build.py              # rebuild every package into dist/
python tools/build.py self ledger  # rebuild only these
python tools/extract.py Export.nxs --name self   # bring an in-game export back into packages/self/
```

After changing a package in Nexus, export it, run `extract.py` over it and commit: the diff shows exactly what changed. After changing source files, run `build.py` and import the result.

### Nexus scripting rules these packages follow

- No anonymous `function () {}` expressions, no top-level `return`, no `setTimeout`.
- `run_function(name, [], "package")` takes no arguments; data passes through `client.*` or `set_variable`.
- Trigger option "Match whole words only" must be off.
- Tab content is static HTML/SVG; injected `<script>` does not run.
- Tab icons are pure CSS keyed on the tab button's `title`, injected from each package's `onLoad`.
