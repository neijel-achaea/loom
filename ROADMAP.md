# Loom — Roadmap

**Status:** agreed · 2026-10-08 · extended to 1.0 on 2026-10-09
**Current release:** Loom 0.4 (Enhancements) · next: Loom 0.5 (Integrations)

See the README for what each package does today.

## Vision

Any Loom package can be dropped onto any character, of any class, in any city. It installs with no manual steps and is driven by one command that explains itself. Packages work alone; installed together, they feed each other.

## Principles

1. **Standalone guaranteed, together better.** Every package works fully on its own. Integrations only *add* behaviour when another package is present; nothing ever *requires* another package. **One exception:** the autobasher (v0.6) requires hunting. It reads hunting's class data, rage state and target, and never writes to them, so hunting behaves the same with or without it. Without hunting, the basher says so on load and sends nothing.
2. **Read what you need yourself.** Each package gets its own room, class, city and environment data from GMCP in its own `onGMCP`. No package calls into another for data.
3. **Check before you touch.** Anything shared (`pauseTriggers`, another package's state) is read defensively: used when present, skipped silently when not.
4. **One keyword per package**, normally the package name, with `HELP` as a subcommand. Old aliases are retired, not kept as shims.
5. **Suggest, don't apply.** Anything generated automatically (a reminder, a goal, a standing nudge) is tagged with its source, can be withdrawn by that source, and is never applied without the player seeing it.
6. **Data in tables, not in code.** Anything that differs per class, per city or per player (abilities, rage costs, room lists, greeting texts, item names, friends' names) lives in a configuration table, so other players can use the package by filling in their own values.

## Conventions

These apply to every package touched from v0.2 onwards.

| Topic | Convention |
|---|---|
| **Runtime state** | Everything under `client.loom.<package>`, using the full package name (`client.loom.coffers`, `client.loom.ledger`), not abbreviations. |
| **Creating the namespace** | Always `if (!client.loom) client.loom = {};` and the same for the package's own object. Never assign `client.loom` outright: one package doing that wipes every other package's state on load. |
| **Persistent variables** | Prefixed with the package name: `coffers_log`, `ledger_items`. Existing variables are migrated once on load, then the old name is cleared. |
| **Registration** | Each package's `onLoad` writes `client.loom.registry.<package> = { version, keyword }`. |
| **Command** | One alias, `^<keyword>(?:\s+(.*))?$`, case-insensitive, with `HELP` and a bare call that shows status. |
| **Help** | `<package>_help` prints a `[command, description]` table in a monospace block through `nexusclient.add_html_line`, falling back to `display_notice` when a client doesn't have it. Each package carries its own copy. |
| **Notice colours** | `display_notice` uses three colours, so the colour alone says what kind of message it is: **cyan** information (status, HELP, lists), **orange** bad (errors, usage, warnings, something lost or wiped), **lime** good (a setting saved, something done or gained). **Red** only for alarms that need acting on at once (security's potential theft). Data printed as data (CSV, report tables, DEFCON EXPORT) and highlight colours (social groups, standings bands) keep their own. |
| **Version** | Semantic version per package, set in its registry line and shown by `LOOM`. Packages move independently; only **loom** follows the suite releases. See *Versioning* in the README. |
| **Shared flag** | `pauseTriggers` stays a plain variable. Packages treat "unset" as off, so they don't need the package that toggles it. |
| **Suite package** | One package, **loom**, holds the `LOOM` command, the shared settings and all integrations. Nothing requires it. |

### Exceptions to the one-keyword rule

- **Wrappers around game commands** keep the game's word: `QUIT`/`QQ`, and `GIVE`/`SELL`/`DROP`/`OFFER` in security. Their whole point is to replace the game command.
- **Everyday shortcuts** stay short: `GG` and `PG` in security (gold out of / into the backpack) are typed too often to live under `SECURITY`.
- **Emote and illusion content** (roleplay's ~110 emote aliases, elementalism's set pieces) is content, not commands, and stays as it is for now. Revisit later if it becomes a problem for other players.

## Loom 0.2 — Standalone

**Goal:** every package installs cleanly on a fresh profile and works without any other package.

### Foundation (first)

**Split `common`**, which today does three jobs:

| What's in common today | Where it goes |
|---|---|
| `pauseTriggers` toggle, `DEBUG` | **loom** (`LOOM PAUSE ON/OFF`, `LOOM DEBUG ON/OFF`) |
| `LOOM` command: list installed packages, versions and keywords | **loom** (new) |
| GMCP room, class and environment tracking | Into each package that needs it. The shared variables (`currentRoomId`, `currentEnvironment`, `activeClass`) go away. |
| Calls into eleusis (`mono_enter`) and harvesting (`hv_room`) on each room change | Removed: sigils and harvesting listen to `Room.Info` themselves. |
| Class F-key buttons (`set_buttons`), `DRAGONMODE` | **hunting**, which already draws the battlerage highlights on those buttons |
| `QUIT`/`QQ` wrapper | **loom**. Its pre-quit housekeeping (closing a huntstats session, for example) is integration work by nature. |
| Party helpers | Personal configuration: a friends table in loom, not names in triggers |
| The Oceana group | Out of the repository: a private package kept in game only (its party-command trigger could be abused through illusions) |
| `REFILLVIAL`, highlights and gags | `REFILLVIAL` became the **vials** package; the vines highlight went to patrolling, the Eleusian Techs gag to civic; the rest stays in loom |

**Split `eleusis`** into:
- **sigils**: monolith and flame sigil watcher, with per-city room tables and the city read from GMCP. Works in every city.
- **civic**: city duties per ministry, starting with the ambassador aide (newbie greetings, on/off duty, lesson refusals). The graduation ritual moves to roleplay's rituals. Generic logic, with city-specific texts in a per-city table.

### Package pass

Order: foundation first, then by how much coupling each package removes. The keyword column is the proposal; ✓ marks names already checked in game.

| # | Package | Keyword | Main work |
|---|---|---|---|
| 1 | common → **loom** | `LOOM` | Split as above; registry; `LOOM` command |
| 2 | eleusis → **sigils** | `SIGILS` | Own `Room.Info`; city from GMCP (done in #63) |
| 3 | eleusis → **civic** | `CIVIC` | `CIVIC AIDE ON/OFF/TITLE/CLAN`, `CIVIC GREET`; per-city defaults; enemy check reads `client.hl` defensively |
| 4 | **hunting** | `HUNTING` ✓ | Takes buttons and `DRAGONMODE`; reads class itself; `AUTOGOLD` moves under the keyword |
| 5 | defences → **defcon** | `DEFCON` | Reads class itself; `INITDEF` becomes `DEFCON UP`, tiers become `DEFCON 1-5` under the same alias |
| 6 | **harvesting** | `HARVESTING` ✓ | Own `Room.Info` and environment |
| 7 | **security** | `SECURITY` ✓ | Item names to a config table; owns the `backpack` variable (hunting reads it defensively) |
| 8 | **social** | `SOCIAL` ✓ | Merge `HL*`/`WL*` aliases under one keyword; publish lists at `client.loom.social` |
| 9 | **crystalism** | `CRYSTALISM` ✓ | `AUTOREFINE` under the keyword; defensive social read |
| 10 | **vision** | `VISION` ✓ | Gains a keyword (none today); defensive social read |
| 11 | **standings** | `STANDINGS` ✓ | `STN` becomes `STANDINGS`; namespace |
| 12 | **patrolling** | `PATROLLING` ✓ | Reads the Achaean date from ledger defensively; namespace |
| 13 | talismans → **talpieces** | `TALPIECES` | Namespace (16 loose `client.tal*` keys today) |
| 14 | **coffers** | `COFFERS` ✓ | Namespace only (23 loose `client.gc*` keys); already the model for the command |
| 15 | **fishingstats**, **fishing** | `FISHINGSTATS`, `FISHING` ✓ | Namespace; merge aliases |
| 16 | **levelgraph**, **huntstats**, **dmgchart**, **ledger**, **self**, **partycomms** | own names ✓ | Namespace; merge aliases |
| 17 | **artificing**, **conjuration**, **elementalism**, **roleplay**, **numpad_movement** | own names ✓ | Light pass; roleplay/elementalism per the exception above |

### Definition of done (per package)

- [ ] Imports into a fresh profile and works with no manual steps and no other Loom package installed
- [ ] Gets its own GMCP data; no `run_function` into another package
- [ ] Shared data read defensively; nothing breaks when it's missing
- [ ] State under `client.loom.<package>`; persistent variables prefixed and migrated
- [ ] One keyword with `HELP`; registers itself in `client.loom.registry`
- [ ] Personal names and items moved to configuration
- [ ] Known bugs closed; README entry updated (including a "publishes / reads if present" line)
- [ ] Version bumped, built, tested in game

### Names still to check in game

`LOOM`, `SIGILS`, `CIVIC`, `TALPIECES`, `DEFCON`

## Loom 0.3 — Multiclass

**Goal:** hunting, defcon and self behave correctly for any class, and fail gracefully for classes not yet configured.

1. **Framework:** class detection from GMCP, per-class tables (abilities to highlight, rage costs, button layouts, defences, class conditions such as Magi channels), and a fallback: an unknown class gets the generic behaviour and a "not configured yet" note in `HELP`, never an error.
2. **Data from help files:** ability lists and rage costs from `AB` and `HELP` output, no alt required.
3. **Verification with alts:** for each class, log in, capture `Char.Vitals` and the `charstats` string, log out. That's the one thing help files can't tell us.
4. **Contributions:** a README section on adding your own class, so players can fill in classes and send them back.

**Done when:** every class has an entry, even if marked "generic only"; your own classes (Druid, Magi, Serpent, Infernal, dragonform) are fully configured; adding a class touches only tables.

## Loom 0.4 — Enhancements

**Goal:** the feature and enhancement ideas raised during v0.2 and v0.3, kept out of those milestones so they could stay focused on fixing and tidying, plus custom tabs that replace the stock Nexus windows: **Comms** (#157) for the communication window and **Room** (#158) for the Room tab.

Comes before Integrations on purpose: the new tabs are the biggest new consumers of other packages' state, so building them first lets the integration layer be designed against more real cases. Every tab ships standalone; any integration idea found along the way is filed straight into Loom 0.5 as its own `integration` issue.

## Loom 0.5 — Integrations

**Goal:** packages installed together feed each other.

### The entry points

Almost every integration ends in one of three places, so each gets one documented way in:

| Destination | Entry point | Behaviour |
|---|---|---|
| **Ledger** | add-or-update / withdraw an item, keyed by `source` + id | The `source` field finally holds more than "manual". When the condition clears, the source withdraws its item. |
| **Coffers** | propose a goal | Shown as a suggestion; the player accepts it. |
| **Standings** | suggest a nudge | Lands in the existing suggestions list; never applied automatically. |

A fourth kind arrived with the v0.4 tabs: a tab that **displays** another package's state (a highlight colour, the current target, a flagged shrine) rather than feeding one of the three. It gets its own read-only **display entry point** (#159): the tab asks loom, loom answers only when the source package is installed and the link is on, and otherwise the tab renders plainly.

How the display entry point works (#159):

- **Sources publish a read-only `look`** on their own namespace, e.g. `client.loom.social.look.colour(name)`. It reports the package's own state and knows nothing of loom or any tab; nothing outside the package reads its variables.
- **Links answer questions.** Each display link in `loom_links` maps question names to functions over its source's `look`: `answers: { "person.colour": function (n) { … } }`.
- **Tabs ask by need, not by source, as their own package:** `client.loom.loom.answer("room", q, arg)` gives the first answer, `answers("room", q, arg)` all of them as `[{link, value}]`. Only links into the asking package that are on answer, so switching off `social-room` takes the colours out of Here but not out of Comms. With no answer (or no loom) the tab renders plainly. Tabs guard the call: `var LL = client.loom.loom; var c = LL && LL.answer ? LL.answer("room", "person.colour", name) : undefined;`
- **Question names are dotted** and named for what the tab needs (`person.colour`, `person.band`, `item.flags`, `room.plants`, `target`), so a later source can answer the same question without the tab changing.
- **Redraws without polling.** A source calls `if (client.loom.notify) client.loom.notify("<pkg>")` when state its `look` reports changes; loom redraws the destination of every link from it that is on, debounced (50 ms). Switching a link on or off redraws its destination too. Destinations say how to redraw in their registry entry (`redraw: function () { … }`); room, comms and social have one.

Each destination publishes its entry point as an **`entry`** object on its own namespace, the write-side counterpart of a source's read-only `look` (#159). Loom's integrations call it only while their link is on, and pass their link's source name, so whatever they create can be told apart and taken back:

- **Standings** (#36): `client.loom.standings.entry.suggest({ who, step, why, source })` queues a dealing for review (one pending item per source and person: a newer suggestion replaces the older); `entry.withdraw(source[, who])` takes them back. Nothing is recorded until the player says `STANDINGS OK`.
- **Ledger** (#34): `client.loom.ledger.entry.upsert({ source, key, text, due | dueIn })` adds or updates the source's item for that key; it appears at once, marked with its source; `entry.withdraw(source[, key])` takes it back when the condition clears. If the player `DONE`s or `DROP`s a generated item it stays away until its source withdraws it, then can come back.
- **Coffers** (#35): `client.loom.coffers.entry.propose({ source, key, amount, why })` queues a proposed goal (one per source and key, newer replaces older); the player takes it with `COFFERS ACCEPT [n]` (it becomes the goal, remembering its source) or `COFFERS DISMISS [n]` (it stays away until its source withdraws it); `entry.withdraw(source[, key])` takes proposals back.
- Integrations that write give their link an `update` function: loom runs it, debounced, when the source notifies, when the link is switched on, and once at load. It reads the source's `look` and calls the destination's `entry` (ledger also offers `entry.get(source, key)` to see whether its item stands).
- Switching a link off makes loom call its destination's `entry.withdraw(<source>)`, so a link's creations go with it.

The integration code itself lives in the **loom** package, so neither side knows about the other.

### Switching integrations on and off

- Every integration is **on by default** as soon as both of its packages are installed.
- Each has a short id (`sigils-coffers`, `huntstats-standings`, …) and can be switched off on its own: `LOOM LINKS` lists them with their state, `LOOM LINK <id> OFF/ON` changes one.
- Only the switched-off ones are stored (`loom_links_off`), so an integration added in a later version starts on.

### Integrations

★ = Ricardo's ideas. Each one becomes its own issue.

| Source | Ledger | Coffers | Standings | Flavour |
|---|---|---|---|---|
| **huntstats** | Return to your best area after a while away | ★ Goal from the area's gold/hr history when you start hunting there | ★ Nudge for people you hunted with for a while | Tired emotes after long sessions |
| **sigils** | Dated item: re-sigil room X before day N | ★ Budget for sigils expiring in the coming months | — | — |
| **crystalism** | ★ Collect pearls when rift crystals run low | Cost of the pearls you're short | — | — |
| **harvesting** | ★ Harvest run when stock is below the minimum | — | — | — |
| **self** | ★ Catch up after an XP rank drop; explore when explorer rank stalls | — | — | Tipsy emotes when sobriety is low |
| **social** | Adventurer-linked items when they log in (planned) | — | Standing band in the login notice | — |
| **partycomms** | — | — | Party time as a second nudge source | — |
| **coffers** | Reminder as a goal's deadline nears | — | Gold received from someone → suggested note | — |
| **talpieces** | Trade-in reminder when a set of commons is complete | — | — | — |
| **fishingstats** | Fish for missing species | Fish sales as an income source | — | Proud emote on a new world record |
| **patrolling** | Replant task for exterminated rooms | — | — | — |
| **dmgchart** | — | — | — | Feeds huntstats an area-danger figure |
| **standings** | — | — | — | Highlight colour by band; vision warns on hostile standing; band on hover in Comms |

**Display integrations** (via the display entry point):

| Source | Comms | Room |
|---|---|---|
| **social** | Talker names in their highlight colours | Players in their highlight colours |
| **standings** | Standing band on hover | — |
| **hunting** | — | Current target marked in the mobs list |
| **patrolling** | — | Shrines flagged |
| **sigils** | — | Monoliths and sigil state flagged |
| **harvesting** | — | The environment's plants, low stock marked |

## Loom 0.6 — Autobasher

**Goal:** effective, attended bashing. A new package that reacts to what happens in the current room.

- **Attended by design.** No auto-walking, ever. It pauses when another player enters or sends a tell, and resumes only on the player's command.
- **Requires hunting** (see Principle 1). The attack command, raze command and rage priorities live in hunting's class-data files from v0.3.
- **Safety from day one.** Kill switch, pause below a health threshold, stop when the target dies or leaves. Full wimpy comes later in the milestone.

Steps, in order: package and core attack loop on balance/equilibrium → shield detection, presence checks, curing check → rage abilities → wimpy and the enemy-list integration → per-area target priorities, then learning them from huntstats → raze or swap → attacking the party leader's target → (maybe) defensive abilities in parties.

## Loom 0.7 — Docs & Feedback

**Goal:** other players can install Loom, understand it, and tell us what's wrong.

- **Player docs**: getting started, one page per package, integrations, classes, troubleshooting.
- **Contributor docs**: repo layout and build, conventions, Nexus scripting gotchas, adding a class, the PR test-checklist rule.
- **Public beta release**, with issue templates for bugs and ideas (labelled `from-users`).
- **A feedback window**, time-boxed: every report gets a decision (this milestone, a later one, or wontfix), and bugs in what exists outrank new features.

## Loom 0.8 — Hardening

**Goal:** make what players actually use solid. Comes after feedback, so it hardens the right things.

- Fresh-install test of every package, alone and all together, on clean profiles.
- Upgrades keep settings: a one-time migration for every renamed or reshaped variable.
- Fail quietly on missing GMCP data, partial integrations, changed game text, corrupt variables.
- Performance of everything that runs per prompt or per GMCP message.
- Consistency sweep (colours, HELP, tabs, wording) and a docs accuracy pass.
- One end-to-end regression run, built from every PR's in-game checklist, kept for future releases.

## Loom 1.0

**Commands and settings are stable.** Keywords and subcommands, persistent variable names, integration entry points and the class-data format only change in a breaking way in 2.0. Tab layout and notice wording are not covered.

## Out of scope

- **groves** and **reclamation** stay frozen as retired druid-era packages: kept in the repo, not reworked.
- Mudlet ports.

## Tracking

GitHub issues grouped into milestones Loom 0.2 to Loom 0.8: one issue per package in v0.2, one per integration in v0.5, one per step in v0.6. Player reports carry the `from-users` label.
