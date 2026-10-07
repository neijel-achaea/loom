# Achaea Nexus packages

**Version 0.1**: everything as it runs in game today, with source and history in one place. Tidying the dependencies between packages comes next.

Reflex packages for the [Nexus](https://play.achaea.com) client of Achaea. Each
package is self-contained: it can be dropped onto any character without
bringing the others along. The tab packages share one house style (ink panel,
serif small-caps headings, one large figure, monospace ledger rows) and give
their tab its own icon.

## Packages

| Package | Tab | What it does |
|---|---|---|
| **artificing** | — | Elemental treaties (`TF <elemental>`, pausing triggers and sipping during the communion) and `STAFFATTACK fire\|frost\|lightning` for the F1 staff cast. |
| **coffers** | Coffers | Gold tracker: fortune (purse + bank), income and spending per session and per day, wealth ranks, records, a goal, charts. `COFFERS HELP`. |
| **common** | — | Shared foundation: the `pauseTriggers` flag (`PAUSETRIGGERS ON/OFF`), `DEBUG ON/OFF`, room and class tracking from GMCP, class-based F-key buttons, dragon attack mode (`DRAGONMODE`), party helpers, the `QUIT`/`QQ` wrapper, `REFILLVIAL`, assorted highlights and gags. |
| **conjuration** | — | `CONJURE <sigil>`: runs the full creation ritual for the sigils currently known. |
| **crystalism** | — | `AUTOREFINE [n]` levels crystal shapes evenly from stored facets; pearl pickup; a sonic portal on request for city members; pauses triggers while attuning to the Master Crystal. |
| **defences** | — | `INITDEF` raises class defences; `DEFCON 1-5` sets curing defence priorities per class; insomnia upkeep and status highlights. |
| **dmgchart** | DmgChart | Damage dealt and taken by type per fight, as donuts with dps; exchange stats; recorded sessions. `DMGCHART`. |
| **elementalism** | — | Illusions: `ILLUSION`, `FEEL_<environment>` (desert, forest, …), and step-by-step set pieces (`PINK_DRAGON`, `KAWHEDRAGON_F/M <target> <step>`). |
| **eleusis** | — | Ambassador aide (`NEWBIECT`/`NEWBIECLT`/`NEWBIEBOTH`, `VEON`/`VEOFF`, lesson requests refused for enemies), monolith and flame sigil watcher (`MONOWATCH`, `MONOREPORT`, `MONOIGNORE`, …), and the Saiha `GRADUATION <name> <step>` ritual. |
| **fishing** | — | Fishing automation: `BAIT <bait>`, `CL <direction>` to bait and cast, then tease, jerk and reel on the game's cues, with stage markers on each line. Statistics live in **fishingstats**. |
| **fishingstats** | fishingstats, fishinglog | Live fishing session (by angler, by species, recent catches) and a log of past sessions. |
| **harvesting** | — | Stock-aware auto-harvest on room entry: harvests and stores only plants below their minimum rift stock. `HARVESTING ON/OFF/MIN/RESET`. |
| **hunting** | — | Battlerage cooldown tracking with highlighted F-key buttons, ability highlights per class, affliction markers, critical-hit and status highlights, `AUTOGOLD ON/OFF/ALL`, and combat gags. |
| **huntstats** | Stats | Per-area hunting sessions: xp/hr, gold/hr, kills, Dragonhood progress, area comparison. `HUNTSTATS`. |
| **ledger** | Ledger | IC reminders and standing items on the Achaean calendar. `LEDGER`. |
| **levelgraph** | Level | Level progress graphs per minute and per day, days at the current level. |
| **numpad_movement** | — | Movement and quick commands on the number pad. |
| **partycomms** | Party | Shares party vitals and targets over party tell, shown as bars in a Party tab. `PARTYNAME`, `PARTYON`/`PARTYOFF`. |
| **patrolling** | — | Checks each room's plants against what its environment should hold and flags shrines (`PATROLLING ON/OFF/HERE/LEARN`), suggests areas to patrol (`PATROL_SUGGEST`), storm and fire alerts, and logs replantings to the clan log. |
| **roleplay** | — | A large set of custom emotes, step-by-step rituals, and the ambient emote system (`AEM ON/OFF/NOW/RELOAD`). |
| **security** | — | Antitheft (`ANTITHEFT ON/OFF`, re-wears or re-stores what gets taken), `GG`/`PG` to move gold in and out of the backpack, and give, sell, drop and offer wrappers that lift selfishness around the action. |
| **self** | Self | Replacement for the stock character panel (see below). `SELF`. |
| **social** | — | Name highlighting by group (family, enemies, order, house, city, allies, friends) and an online watchlist. Shared by other packages. |
| **standings** | Standings | EVE-style standings with adventurers and organisations, kept per character. `STN HELP`. |
| **talismans** | Talismans, TalGraph | Dragon talisman piece tracker with progress and projected finish. |
| **vision** | — | Alertness: hides reports about city members and alerts the party when an enemy comes near. |

### Dependencies between packages

Most packages stand alone. The exceptions:

- **common** feeds the others: its onGMCP sets `currentRoomId`, `currentArea`, `currentEnvironment` and `activeClass`, and calls `mono_enter` (**eleusis**) and `hv_room` (**harvesting**) on every room change; `set_buttons` calls `hl_buttons` (**hunting**).
- **defences**, **artificing** and the button setup read `activeClass`, set by **common**.
- **eleusis**, **crystalism**, **vision** and **standings** read the lists of **social** (`client.hl`).
- **hunting** draws the battlerage highlights on the buttons that **common** lays out.
- **patrolling** reads the Achaean date from **ledger** when it logs a replanting.
- **security** and **hunting** share the `backpack` variable.
- Many triggers respect the `pauseTriggers` flag from **common**.

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
