# Achaea Nexus packages

Reflex packages for the [Nexus](https://play.achaea.com) client of Achaea. Each
package is self-contained: it can be dropped onto any character without
bringing the others along. The tab packages share one house style (ink panel,
serif small-caps headings, one large figure, monospace ledger rows) and give
their tab its own icon.

## Packages

| Package | Tab | What it does |
|---|---|---|
| **coffers** | Coffers | Gold tracker: fortune (purse + bank), income and spending per session and per day, wealth ranks, records, a goal, charts. `COFFERS HELP`. |
| **dmgchart** | DmgChart | Damage dealt and taken by type per fight, as donuts with dps; exchange stats; recorded sessions. `DMGCHART`. |
| **fishingstats** | fishingstats, fishinglog | Live fishing session (by angler, by species, recent catches) and a log of past sessions. |
| **huntstats** | Stats | Per-area hunting sessions: xp/hr, gold/hr, kills, Dragonhood progress, area comparison. `HUNTSTATS`. |
| **ledger** | Ledger | IC reminders and standing items on the Achaean calendar. `LEDGER`. |
| **levelgraph** | Level | Level progress graphs per minute and per day, days at the current level. |
| **self** | Self | Replacement for the stock character panel (see below). `SELF`. |
| **social** | — | Name highlighting by group (family, enemies, order, house, city, allies, friends) and an online watchlist. Shared by other packages. |
| **standings** | Standings | EVE-style standings with adventurers and organisations, kept per character. `STN HELP`. |
| **talismans** | Talismans, TalGraph | Dragon talisman piece tracker with progress and projected finish. |

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
