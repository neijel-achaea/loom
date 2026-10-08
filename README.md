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
| **coffers** | Coffers | Gold tracker: fortune (purse + bank), income and spending per session and per day, wealth ranks, records, a goal, charts. `COFFERS HELP`. |
| **conjuration** | — | `CONJURE <sigil>`: runs the full creation ritual for the sigils currently known. |
| **crystalism** | — | `AUTOREFINE [n]` levels crystal shapes evenly from stored facets; pearl pickup; a sonic portal on request for city members; pauses triggers while attuning to the Master Crystal. |
| **defcon** | — | Defence readiness for any class. `DEFCON 1-5` keeps the defences of that tier and above in curing (per-class tables for Druid, Magi, Sylvan and dragonform; general defences for other classes), `DEFCON UP` raises your class defences (automatically on login, `DEFCON AUTOUP OFF` to stop), `DEFCON LIST`, `DEFCON ON/OFF` (the game's defence upkeep); insomnia upkeep, pear when choking underwater, status highlights. `DEFCON HELP`. Replaces **defences**. Reads nothing from other packages. |
| **dmgchart** | DmgChart | Damage dealt and taken by type per fight, as donuts with dps; exchange stats; recorded sessions. `DMGCHART`. |
| **elementalism** | — | Illusions: `ILLUSION`, `FEEL_<environment>` (desert, forest, …), and step-by-step set pieces (`PINK_DRAGON`, `KAWHEDRAGON_F/M <target> <step>`). |
| **fishing** | — | Fishing automation: `BAIT <bait>`, `CL <direction>` to bait and cast, then tease, jerk and reel on the game's cues, with stage markers on each line. Statistics live in **fishingstats**. |
| **fishingstats** | fishingstats, fishinglog | Live fishing session (by angler, by species, recent catches) and a log of past sessions. |
| **groves** | — | *Retired (druid).* Opens the grove gate for city members who send "Gate." while you are in your grove. |
| **harvesting** | — | Stock-aware auto-harvest on room entry: harvests and stores only the plants of the room's environment that are below their minimum rift stock. `HARVESTING ON/OFF`, `MIN <n>` (default minimum), `MIN <plant> <n\|DEFAULT>`, `STOCK`, `HELP`; bare `HARVESTING` lists what is short. Reads nothing from other packages. |
| **hunting** | — | Class F-key buttons with battlerage cooldown highlights (Druid, Magi, Sylvan, Black and Blue Dragon; other classes get the generic keys), dragon attack mode, autogold, ability and critical-hit highlights, affliction markers and combat gags. One command: `HUNTING` (`DRAGONMODE`, `AUTOGOLD`, `PARTYTARGET`, `AFTERFORM`, `HELP`). Publishes `my_rage` for partycomms; reads security's `backpack`, artificing's `staffAttack` and huntstats (for the F9 key) if present. |
| **huntstats** | Stats | Per-area hunting sessions: xp/hr, gold/hr, kills, Dragonhood progress, area comparison. `HUNTSTATS`. |
| **ledger** | Ledger | IC reminders and standing items on the Achaean calendar. `LEDGER`. |
| **levelgraph** | Level | Level progress graphs per minute and per day, days at the current level. |
| **loom** | — | The suite package (replaces **common**). `LOOM` lists the packages loaded with their versions; `LOOM PAUSE ON/OFF` and `LOOM DEBUG ON/OFF` set the shared flags; `LOOM ROOM` shows the current room. Also the `QUIT`/`QQ` wrapper, `REFILLVIAL`, pausing during sleep, meditation and the Mnemosyne, and assorted highlights and gags. From v0.4 it holds the integrations between packages. |
| **numpad_movement** | — | Movement and quick commands on the number pad. |
| **partycomms** | Party | Shares party vitals and targets over party tell, shown as bars in a Party tab. `PARTYNAME`, `PARTYON`/`PARTYOFF`. |
| **patrolling** | — | Checks each room's plants against what its environment should hold and flags shrines (`PATROLLING ON/OFF/HERE/LEARN`), suggests areas to patrol (`PATROL_SUGGEST`), storm and fire alerts, and logs replantings to the clan log. |
| **reclamation** | — | *Retired (druid).* Records where enemies are seen in Eleusis and can alert the party (`REPORTENEMIES ON/OFF`, `WHEREIS <name>`, `VINESREPORT [days]`). |
| **roleplay** | — | A large set of custom emotes, step-by-step rituals (including the Saiha `GRADUATION <name> <step>` ceremony), and the ambient emote system (`AEM ON/OFF/NOW/RELOAD`). |
| **security** | — | Antitheft (`SECURITY ANTITHEFT ON/OFF`: puts back watched worn items, the backpack and gold taken out of it), `GG`/`PG` to move gold out of and into the backpack, your backpack and watched items as settings (`SECURITY BACKPACK`, `SECURITY ITEM ADD/DEL`, `SECURITY ITEMS`), house state commands (`SECURITY HOUSE IN/OUT`), and give, sell, drop and offer wrappers that lift selfishness around the action (selfishness followed from GMCP). `SECURITY HELP`. Publishes the backpack id at `client.loom.security.backpack`. |
| **self** | Self | Replacement for the stock character panel (see below). `SELF`. |
| **sigils** | — | Monolith and flame sigil watcher for any city: probes the monolith in every room you enter and flags sigils running out; the report lists them with an estimated cost. `SIGILS HELP`. |
| **social** | — | Name highlighting by group (family, enemies, order, house, city, allies, friends, and your own name), and online/offline notices for the groups you watch. `SOCIAL ADD/DEL <group> <name>`, `LIST`, `COLOR`, `WATCH/UNWATCH`, `POLL ON/OFF/NOW`, `HELP`; your city's enemies list reloads itself from the game's list. Publishes the lists at `client.loom.social` (`groups`, `lists[group]`, `color[group]`), and still at `client.hl` for packages not yet updated. |
| **standings** | Standings | EVE-style standings with adventurers and organisations, kept per character. `STN HELP`. |
| **talismans** | Talismans, TalGraph | Dragon talisman piece tracker with progress and projected finish. |
| **vision** | — | Alertness: hides reports about city members and alerts the party when an enemy comes near. |

### Dependencies between packages

The v0.2 work (see [ROADMAP.md](ROADMAP.md)) is removing these one package at a time. What remains:

- **loom** still sets the legacy variables `currentRoomId`, `currentRoomName`, `currentArea`, `currentEnvironment` and `activeClass` for packages that haven't had their v0.2 pass. **harvesting**, **sigils**, **civic**, **hunting** and **defcon** already follow GMCP themselves (hunting and defcon still borrow `activeClass` until the first class message of a session); **civic** checks the enemies list of **social**, and adds new citizens to its city list, only when it's installed.
- **artificing** and **roleplay** read `activeClass`; **patrolling** reads `currentRoomId`.
- **crystalism**, **vision** and **standings** read the lists of **social** (`client.hl`).
- **patrolling** reads the Achaean date from **ledger** when it logs a replanting.
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

After importing: `SETNAME <name>`, then `DEF`, `DIAG` and `SCORE` once.

| Command | |
|---|---|
| `SELF` | Short help. |
| `SELF WANT <def> [...]` / `SELF UNWANT <def> [...]` | Watch defences. Each class keeps its own list, dragonform included. |
| `SELF WANTS` | List watched defences for the current class. |
| `SELF KEEP <aff> [...]` / `SELF UNKEEP <aff> [...]` | Hide afflictions kept on purpose (deafness, blindness, insomnia by default). |
| `SETNAME <name>` | Name shown in the title. |

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
