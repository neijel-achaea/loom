# Loom — Roadmap

**Status:** agreed · 2026-10-08
**Current release:** v0.1 (every package as it runs in game, collected in one repository)

See the README for what each package does today.

## Vision

Any Loom package can be dropped onto any character, of any class, in any city. It installs with no manual steps and is driven by one command that explains itself. Packages work alone; installed together, they feed each other.

## Principles

1. **Standalone guaranteed, together better.** Every package works fully on its own. Integrations only *add* behaviour when another package is present; nothing ever *requires* another package.
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
| **Version** | Semantic version per package, kept in `package.json` and shown by `LOOM`. |
| **Shared flag** | `pauseTriggers` stays a plain variable. Packages treat "unset" as off, so they don't need the package that toggles it. |
| **Suite package** | One package, **loom**, holds the `LOOM` command, the shared settings and all integrations. Nothing requires it. |

### Exceptions to the one-keyword rule

- **Wrappers around game commands** keep the game's word: `QUIT`/`QQ`, and `GIVE`/`SELL`/`DROP`/`OFFER` in security. Their whole point is to replace the game command.
- **Everyday shortcuts** stay short: `GG` and `PG` in security (gold out of / into the backpack) are typed too often to live under `SECURITY`.
- **Emote and illusion content** (roleplay's ~110 emote aliases, elementalism's set pieces) is content, not commands, and stays as it is for now. Revisit later if it becomes a problem for other players.

## v0.2 — Standalone

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
| `REFILLVIAL`, highlights and gags | Topical home or loom; decided case by case during the pass |

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

## v0.3 — Multiclass

**Goal:** hunting, defcon and self behave correctly for any class, and fail gracefully for classes not yet configured.

1. **Framework:** class detection from GMCP, per-class tables (abilities to highlight, rage costs, button layouts, defences, class conditions such as Magi channels), and a fallback: an unknown class gets the generic behaviour and a "not configured yet" note in `HELP`, never an error.
2. **Data from help files:** ability lists and rage costs from `AB` and `HELP` output, no alt required.
3. **Verification with alts:** for each class, log in, capture `Char.Vitals` and the `charstats` string, log out. That's the one thing help files can't tell us.
4. **Contributions:** a README section on adding your own class, so players can fill in classes and send them back.

**Done when:** every class has an entry, even if marked "generic only"; your own classes (Druid, Magi, Serpent, Infernal, dragonform) are fully configured; adding a class touches only tables.

## v0.4 — Integrations

**Goal:** packages installed together feed each other.

### The three entry points

Almost every integration ends in one of three places, so each gets one documented way in:

| Destination | Entry point | Behaviour |
|---|---|---|
| **Ledger** | add-or-update / withdraw an item, keyed by `source` + id | The `source` field finally holds more than "manual". When the condition clears, the source withdraws its item. |
| **Coffers** | propose a goal | Shown as a suggestion; the player accepts it. |
| **Standings** | suggest a nudge | Lands in the existing suggestions list; never applied automatically. |

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
| **standings** | — | — | — | Highlight colour by band; vision warns on hostile standing |

## Out of scope

- **groves** and **reclamation** stay frozen as retired druid-era packages: kept in the repo, not reworked.
- Mudlet ports.

## Tracking

GitHub issues grouped into v0.2 / v0.3 / v0.4 milestones: one issue per package in v0.2, one per integration in v0.4.
