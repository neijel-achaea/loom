# Loom

*Weaving your Achaea client together.*

**Version 0.4** (enhancements): custom tabs replacing the stock Nexus windows (**Online**, **Here** for the room, **Comms**), plus the enhancements gathered during 0.2 and 0.3: notice colours across the suite, dmgchart crits and a health warning, huntstats party, gold split and hunting suggestions, vials learned from ELIXLIST, and more. Built on 0.3 (every class) and 0.2 (every package standalone). See the [releases](https://github.com/neijel-achaea/loom/releases). v0.5 (integrations: packages installed together feed each other) is next: see [ROADMAP.md](ROADMAP.md).

Loom is a suite of reflex packages for the [Nexus](https://play.achaea.com) client of Achaea. Each
package is self-contained: it can be dropped onto any character without
bringing the others along. The tab packages share one house style (ink panel,
serif small-caps headings, one large figure, monospace ledger rows) and give
their tab its own icon.

## Packages

| Package | Tab | What it does |
|---|---|---|
| **artificing** | — | `ARTIFICING STAFF FIRE\|FROST\|LIGHTNING` sets the attack STAFF CAST uses; `ARTIFICING TREATY <elemental>` (or `TF`) forms an elemental treaty with triggers paused and sipping off until it's written, and `ARTIFICING RESUME` undoes that if it was interrupted. `ARTIFICING HELP`. Publishes the staff attack (`client.loom.artificing.staff`, `artificing_staff`) for **hunting**'s staff key. Reads nothing from other packages. |
| **civic** | — | City duties for any city, one ministry at a time. Ambassador aide: `CIVIC AIDE ON/OFF`, `CIVIC GREET <name> [CT\|CLT]`, aide title and novice clan per city (pre-filled for Eleusis), lesson requests accepted except from enemies. `CIVIC HELP`. Replaces **eleusis**. Hides the `(Eleusian Techs):` clan channel. |
| **coffers** | Coffers | Gold tracker: fortune (purse + bank), income and spending per session and per day, wealth ranks, records, a goal, charts. Gold and bank come from GMCP; the books are kept once per prompt, whatever the prompt looks like. `COFFERS HELP`. Reads nothing from other packages. |
| **comms** | Comms | Replaces the stock communication window, fed by GMCP: every channel, tell and say in the game's own colours, timestamped, newest at the bottom. Filters across the top (All, Tells, Say, Party, then each channel heard) with unread counts; tells grouped by person; your own lines dimmed, lines naming you marked; click a name to start a tell. `COMMS MUTE/UNMUTE <channel>` (or the tab's mute link) leaves a channel out of All; `VIEW`, `CAP`, `CLEAR`, `DEBUG`, `HELP`. The latest lines survive a reload. |
| **conjuration** | — | `CONJURATION <sigil>` runs the full creation ritual (reagents from the rift into your ouroboros, the chant, the bell) one step at a time, each when the game is ready for it, for the sigils with a recipe: fist and flame so far. `CONJURATION OUROBOROS <number> [<number>]` once (the second is where the sigil is taken from, if not the same ouroboros), `STOP`, `LIST`, `HELP`; bare `CONJURATION` shows how far a ritual has got. Reads nothing from other packages. |
| **crystalism** | — | `CRYSTALISM REFINE [n]` levels crystal shapes evenly from stored facets; pearl pickup (`CRYSTALISM PEARLS ON/OFF`); a sonic portal for city members who ask with "Gate." (`CRYSTALISM PORTAL ON/OFF`); pauses triggers while attuning to the Master Crystal. `CRYSTALISM HELP`. Reads **social**'s city list if present. |
| **defcon** | — | Defence readiness for any class. `DEFCON 1-5` keeps the defences of that tier and above in curing, from a default table per class (general defences for a class without one), `DEFCON INIT` sends your class's setup commands (stance, summons, morph; automatically on login, `DEFCON INIT AUTO OFF` to stop), `DEFCON LIST`, `DEFCON ON/OFF` (the game's defence upkeep). Each player can change their own table per class (`DEFCON ADD/SET/REMOVE/RESET`, `DEFCON INIT ADD/REMOVE`) and share it with `DEFCON EXPORT`; default fixes still arrive. Insomnia upkeep, pear when choking underwater, status highlights. `DEFCON HELP`. Replaces **defences**. Reads nothing from other packages. |
| **dmgchart** | DmgChart | Damage dealt and taken by type per fight, as donuts with dps (a new fight after a quiet gap, `DMGCHART GAP`), bleeding as its own type, your hits as a table of normal hits and each critical tier (count, share, average), biggest hit, hits a minute, and, while your health is falling, how long it lasts at the rate it fell over the last few seconds (`DMGCHART WINDOW`), with a warning in the main window when that drops below a threshold (`DMGCHART WARN <seconds> | OFF`, default 10s). Record sessions with `DMGCHART START [name]` / `END`, then `LIST`, `SHOW <#>`, `DEL <#>`. Health comes from GMCP. `DMGCHART HELP`. Reads nothing from other packages. |
| **elementalism** | — | Illusions: `ILLUSION`, `FEEL_<environment>` (desert, forest, …), and set pieces (`PINK_DRAGON`, with your name and pronouns; `KAWHEDRAGON_F/M <target> <step>`). `ELEMENTALISM` shows the name and pronouns used, `NAME`, `PRONOUNS HE\|SHE\|THEY`, `HELP`. Your name comes from GMCP. Reads nothing from other packages. |
| **fishing** | — | Fishing automation: `FISHING BAIT <bait>`, then `FISHING CAST <direction>` (or the shortcut `CL <direction>`) to bait and cast; teases, jerks and reels on the game's cues, with stage markers on each line. Tells the party on a new yearly record (`FISHING DING ON/OFF`). `FISHING HELP`; any other word after FISHING still goes to the game. Statistics live in **fishingstats**. Reads nothing from other packages. |
| **fishingstats** | fishingstats, fishinglog | Casts, hooks and catches for you and everyone around you, per angler and per species with weights; sessions file themselves after an idle gap into a log. Flags catches that beat this year's rankings (type `RANKINGS FISHING` to load them). Area and your name come from GMCP. `FISHINGSTATS HELP`. Reads nothing from other packages. |
| **groves** | — | *Retired (druid).* Opens the grove gate for city members who send "Gate." while you are in your grove. |
| **harvesting** | — | Stock-aware auto-harvest on room entry: harvests and stores only the plants of the room's environment that are below their minimum rift stock. `HARVESTING ON/OFF`, `MIN <n>` (default minimum), `MIN <plant> <n\|DEFAULT>`, `STOCK`, `HELP`; bare `HARVESTING` lists what is short. Reads nothing from other packages. |
| **hunting** | — | Class F-key buttons with battlerage cooldown highlights (Druid, Magi, Sylvan, Black and Blue Dragon; other classes get the generic keys), dragon attack mode, autogold, ability and critical-hit highlights, affliction markers and combat gags. One command: `HUNTING` (`DRAGONMODE`, `AUTOGOLD`, `PARTYTARGET`, `AFTERFORM`, `HELP`). Reads security's `backpack`, artificing's staff attack and huntstats (for the F9 key) if present. F8–F12 need Nexus's Button Count set to 12 (Settings → Buttons); F1–F7 hold the main keys. |
| **huntstats** | Stats | Per-area hunting records: xp, gold and kills an hour, Dragonhood progress and ETA, who hunted with you (a party you keep by hand with `HUNTSTATS PARTY ADD/DEL <name>` / `CLEAR`), where to hunt next (`HUNTSTATS SUGGEST`, by xp/hr, gold/hr and variety, with adjustable `WEIGHTS`), the party's gold split at the end of a party hunt with the transfers that even it out (`HUNTSTATS SPLIT`, `SPLIT REPORT` to party tell, `SPLIT TELL ON/OFF`), area comparison. A hunt is filed when you leave its area, and survives a refresh or disconnect. Area and level come from GMCP. `HUNTSTATS HELP`. Reads nothing from other packages; **loom**'s `QUIT` files the hunt under way when huntstats is installed. |
| **ledger** | Ledger | IC reminders and standing items on the Achaean calendar: `LEDGER ADD <text> [@ 15th Miraman 1015 \| @ +4 months] [repeat]`, `DONE`, `DROP`, `TOUCH <#>`; bare `LEDGER` prints the digest. The date comes from the game's daily rollover line and a DATE asked (and hidden) on login. `LEDGER HELP`. Publishes the Achaean day number at `client.loom.ledger.day` for **patrolling** and **standings**. Reads nothing from other packages. |
| **levelgraph** | Level | Level progress graphs per minute and per day, rates and time to the next level. Level and percent come from GMCP, sampled once per prompt whatever the prompt looks like. `LEVELGRAPH HELP`. Reads nothing from other packages. |
| **loom** | — | The suite package (replaces **common**). `LOOM` lists the packages loaded with their versions and descriptions; `LOOM UPDATES` lists the ones older than on GitHub (checked once at login too, silent when all is current; `LOOM UPDATES AUTO OFF` to stop); `LOOM PAUSE ON/OFF` and `LOOM DEBUG ON/OFF` set the shared flags; `LOOM ROOM` shows the current room. `LOOM LINKS` lists the integrations between packages (each on once both its packages are installed) and `LOOM LINK <id> ON/OFF` switches one. Also the `QUIT`/`QQ` wrapper, pausing during sleep, meditation and the Mnemosyne, agreeing to small bound-credit conversions, and a few highlights and gags. From v0.5 it holds the integrations between packages. |
| **numpad_movement** | — | Movement on the number pad: 1-9 the eight directions with 5 for up, 0 down, `+` in, `-` out; `.` looks, `/` shows your score and `*` your inventory. No command. Reads nothing from other packages. |
| **partycomms** | Party | Shares your vitals, rage and target over party tell, and shows the party as chips in the Party tab: name and class, health, mana, endurance and willpower, rage, and each member's target (green when it's yours too). `PARTYCOMMS ON/OFF`, `CLEAR`, `TEST`, `HELP`. Name, class, vitals, rage and target come from GMCP (the `tar` variable and an IH lookup when the game sends no target info). Everyone in the party needs the same version. Reads nothing from other packages. |
| **patrolling** | — | Checks each room's plants against what its environment should hold and flags shrines and totems (`PATROLLING ON/OFF/HERE/LEARN`), suggests areas to patrol (`SUGGEST`, `STAMP`), and, with a clan set, reports fires (`FIRE`) and lightning strikes and logs replantings to the clan log. `PATROLLING CLAN`, `PATROLLING GOD`, `HELP`. Reads **ledger**'s Achaean date if present. Highlights "Vines have overtaken this location." |
| **reclamation** | — | *Retired (druid).* Records where enemies are seen in Eleusis and can alert the party (`REPORTENEMIES ON/OFF`, `WHEREIS <name>`, `VINESREPORT [days]`). |
| **room** | Here | A replacement for the stock Room tab, fed only by GMCP: the room's name, area and environment, details, exits and number; the description folded to two lines (click to unfold, or `ROOM DESC OPEN/FOLDED`); the players here (you left off, full title on hover), mobs (duplicates merged, dead ones greyed) and items (duplicates merged, things you can take stand out). `ROOM`, `ROOM DEBUG`, `ROOM HELP`. Reads nothing from other packages. |
| **roleplay** | — | A large set of custom emotes worded for your class (`custom_emotes` lists them; emotes, rituals and verses are lowercase), step-by-step rituals (including the Saiha `graduation <name> <step>` ceremony), the cairn verses, and ambient emotes (`ROLEPLAY AEM ON/OFF/NOW/RELOAD`), which follow class changes and keep running after a reload. `ROLEPLAY HELP`. The class comes from GMCP. Reads nothing from other packages. |
| **security** | — | Antitheft (`SECURITY ANTITHEFT ON/OFF`: puts back watched worn items, the backpack and gold taken out of it), `GG`/`PG` to move gold out of and into the backpack, your backpack and watched items as settings (`SECURITY BACKPACK`, `SECURITY ITEM ADD/DEL`, `SECURITY ITEMS`), house state commands (`SECURITY HOUSE IN/OUT`), and give, sell, drop and offer wrappers that lift selfishness around the action (selfishness followed from GMCP). `SECURITY HELP`. Publishes the backpack id at `client.loom.security.backpack`. |
| **self** | Self | Replacement for the stock character panel (see below). `SELF HELP`. Your name, class and level come from GMCP. Reads nothing from other packages. |
| **sigils** | — | Monolith and flame sigil watcher for any city: probes the monolith in every room you enter and flags sigils running out; the report lists them with an estimated cost. `SIGILS HELP`. |
| **social** | Online | Name highlighting by group (family, enemies, order, house, city, allies, friends, and your own name), and online/offline notices for the groups you watch. The **Online** tab lists the watched people who are online, one row each, alphabetical, in their group's colour (the group on hover), with how long they've been on; arrivals glow and departures grey out for a few seconds. Below, the watched people who are offline and when they were last seen, folded with a click on its heading or `SOCIAL OFFLINE ON/OFF`. `SOCIAL ADD/DEL <group> <name>`, `LIST`, `COLOR`, `WATCH/UNWATCH`, `POLL ON/OFF/NOW`, `HELP`; your city's enemies list reloads itself from the game's list. Publishes the lists at `client.loom.social` (`groups`, `lists[group]`, `color[group]`), and still at `client.hl` for packages not yet updated. |
| **standings** | Standings | Standings with adventurers and organisations, kept per character. `STANDINGS HELP`. Reads **social**'s lists (chips on a person) and **ledger**'s Achaean date if present. Other packages can suggest a dealing for review through `client.loom.standings.sug` + `standings_suggest`. |
| **talpieces** | Talismans | Dragon talisman piece tracker: pieces counted as you find, trade and list them, still-needed table, progress history with a projected finish. Can queue `TALISMAN COMBINE` for each row of your listing (`TALPIECES COMBINE ON/OFF`). `TALPIECES HELP`. Replaces **talismans** (same Talismans tab; the TalGraph tab is gone, close it). Reads nothing from other packages. |
| **vials** | — | Refill your vials from the rift: `VIALS REFILL <elixir\|ALL>`, with the vial for each elixir read from ELIXLIST (`VIALS LEARN`) or set by hand (`VIALS SET <elixir> <vial> [...]`, several pairs on one line), `VIALS` lists them with sips and decay, `FORGET`, `HELP`. Replaces loom's `REFILLVIAL`. Reads nothing from other packages. |
| **vision** | — | Alertness filter: hides reports about city members and, for enemies, colours the line and alerts the party. `VISION ON/OFF`, `HIDE ON/OFF`, `ALERT ON/OFF`, `CHANNEL <channel>`, `HELP`. Reads **social**'s city and enemies lists if present. |

### Dependencies between packages

The v0.2 work (see [ROADMAP.md](ROADMAP.md)) is removing these one package at a time. What remains:

- **loom** no longer sets shared variables. hunting, defcon and roleplay each keep the class they last saw (seeded once from the old `activeClass`). **harvesting**, **sigils**, **civic**, **hunting** and **defcon** already follow GMCP themselves (hunting and defcon still borrow `activeClass` until the first class message of a session); **civic** checks the enemies list of **social**, and adds new citizens to its city list, only when it's installed.
- **crystalism**, **vision** and **standings** read the lists of **social** at `client.loom.social`.
- **patrolling** reads the Achaean date from **ledger** when it logs a replanting, and **standings** when it dates an entry.
- **hunting** puts autogold into **security**'s backpack when it is set, uses **artificing**'s staff attack for the magi staff key, and shows a Stats key only when **huntstats** is installed.
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

### Versioning

`dist/versions.json` lists every built package's version on main. A workflow rewrites it on every push to main, so branches leave it alone; `python3 tools/versions.py` regenerates it locally and `--check` tests it.

Two kinds of version live in this repository.

- **Loom releases** follow the milestones: Loom 0.3 is milestone *Loom 0.3 · Multiclass*, released on GitHub with the tag `loom-v0.3.0`. The release notes list every package's version at that point. A release is cut when its milestone closes; if main has already moved on, it is cut from the commit where the milestone ended, on a `release/X.Y` branch.
- **Packages** each keep their own [semantic version](https://semver.org), set in the registry line of their setup code and shown by `LOOM`. They move independently of each other and of the milestones:
  - a fix bumps the last number: 0.2.1 → 0.2.2
  - new behaviour bumps the middle one: 0.2.2 → 0.3.0
  - before 1.0, a change that breaks existing use (a renamed command, a changed variable) also bumps the middle one

  So during Loom 0.3 a package that only got fixes can stay at 0.2.x, while one that gained features moves to 0.3.0 or beyond.
- **The loom package is the exception:** it carries the suite's version. Between releases it takes patch bumps like any other package; when Loom X.Y is released it becomes X.Y.0.

Every PR that changes a package bumps that package's version once.

### Nexus scripting rules these packages follow

- No anonymous `function () {}` expressions, no top-level `return`, no `setTimeout`.
- `run_function(name, [], "package")` takes no arguments; data passes through `client.*` or `set_variable`.
- Trigger option "Match whole words only" must be off.
- Tab content is static HTML/SVG; injected `<script>` does not run.
- Tab icons are pure CSS keyed on the tab button's `title`, injected from each package's `onLoad`.
