# DEFCON

*Defence readiness for any class: one number from 5 (bare minimum) to 1 (full alert) decides which defences the game's curing keeps up.*

<!-- loom:version defcon -->
*This page describes defcon 0.4.5.*
<!-- /loom:version -->

## What it is

Achaea's server-side curing can keep your defences up for you: you give each defence a curing priority, and the game raises it again whenever it drops. DEFCON manages that list so you don't have to.

Every class has a **table** of defences, each with a **tier** from 1 to 5. You pick a level; DEFCON keeps every defence of that tier and above in curing and takes the rest out:

| DEFCON | Meaning |
| --- | --- |
| 5 | Bare minimum: passive and permanent defences only |
| 4 | Hunting with nothing used up: free defences once raised |
| 3 | Normal hunting, quietly: defences that use herbs, salves, elixirs and the like (the usual level) |
| 2 | Adds the noisy ones others can see, and ones that get in the way (insomnia, selfishness) |
| 1 | Full alert: everything, mana-draining upkeep included |

Going down to a lower number adds defences; going up takes them out of curing, and drops (`RELAX`) the costly ones the level no longer wants.

DEFCON also sends your class's **setup commands** on login (`DEFCON INIT`): selfishness, avoid physical and insomnia for everyone, then your class's stance, summons, weapons and form.

Every class in the game has a default table, and every dragon colour shares one. Each class keeps its own level and your own changes, as the game keeps a curing list per class, so switching class switches tables.

A few extras come with it: insomnia is put back when it clears, a pear is fetched from the rift and eaten when you choke underwater, and stuns, transfixes and webs wearing off are highlighted.

## Commands

<!-- loom:commands defcon -->
| Command | What it does |
|---|---|
| `DEFCON` | status |
| `DEFCON 1-5` | keep defences of that tier and above in curing (5 = fewest, 1 = all), for your current class |
| `DEFCON LIST` | your class's defences by tier, with curing priority; * marks your own changes |
| `DEFCON INIT` | send your class's init commands now (stance, summons, weapons...) |
| `DEFCON INIT AUTO ON\|OFF` | send them when you log in |
| **Your own table, for the class you're in:** | |
| `DEFCON ADD <def> <tier> <prio> [RELAX]` | add a defence (RELAX, or the command that turns it off, drops it below its tier) |
| `DEFCON SET <def> <tier> [prio]` | change one |
| `DEFCON REMOVE <def>` | stop keeping one, even a default |
| `DEFCON RESET <def>\|ALL` | back to the default |
| `DEFCON INIT ADD\|REMOVE <cmd>` | change the init commands (REMOVE also takes the number from DEFCON LIST) |
| `DEFCON AFTERMORPH ADD\|REMOVE <cmd>` | commands sent once the init morph completes |
| `DEFCON EXPORT` | print the whole table to share, in the class-file format |
| `DEFCON ON\|OFF` | the game's defence upkeep (CURING DEFENCES ON/OFF) |
| `DEFCON DEBUG` | internal state |
| **Each class keeps its own level and changes, as the game keeps its own curing list (dragonform counts as one class). Default fixes still reach you, except where you changed that entry.** | |
<!-- /loom:commands -->

### Levels

`DEFCON 3` sets the level for the class you're in, and sends the curing changes one every quarter second. Setting the level you're already at sends everything again, which resyncs the game's list if it got out of step. `DEFCON` alone shows the level, the class's table and whether INIT runs at login. Until you set a level in a class, it counts as 5 and nothing has been sent.

`DEFCON OFF` turns the game's defence upkeep off altogether (`CURING DEFENCES OFF`); `DEFCON ON` turns it back on.

### Your own table

The defaults are a starting point. Change your class's table with:

| Command | Example |
| --- | --- |
| `DEFCON ADD <def> <tier> <prio> [RELAX]` | `DEFCON ADD clarity 4 13` adds clarity at tier 4, curing priority 13 |
| `DEFCON ADD <def> <tier> <prio> <off command>` | `DEFCON ADD distortaura 1 14 normalaura`: a defence `RELAX` can't drop |
| `DEFCON SET <def> <tier> [prio]` | `DEFCON SET kola 4` moves kola to tier 4 |
| `DEFCON REMOVE <def>` | stop keeping one, even a default |
| `DEFCON RESET <def>` / `RESET ALL` | back to the default for one, or all |
| `DEFCON INIT ADD <cmd>` / `INIT REMOVE <cmd or number>` | change the setup commands |
| `DEFCON AFTERMORPH ADD <cmd>` / `REMOVE …` | commands sent once a morph from INIT completes |

Defence names are as the game's `DEF` shows them, in lower case. Curing priority runs from 1 (cured first) to 25.

`DEFCON LIST` shows the table by tier with each priority; `*` marks your changes, and defaults you removed are listed too. `DEFCON EXPORT` prints your whole table in the class-file format, to share or to send in so it can become the default.

Only your changes are stored. When a default is fixed in a later version, the fix reaches you, except where you changed that entry yourself.

### Choosing a tier

Ask in order; the first yes decides:

1. Does it drain mana while up, or only help against other adventurers and cost something to keep? → **1**
2. Is it noisy, or does it get in the way of ordinary actions if always up? → **2**
3. Does it use something up (herb, salve, elixir, mineral, ink), or drain a lot of endurance or willpower? → **3**
4. Is it free once up and useful while hunting? → **4**
5. Is it passive or permanent? → **5**

## Setting it up

1. **Import `defcon.nxs`** (see [Getting started](getting-started.md)).
2. **Pick a level** in each class you play: `DEFCON 3` is a good start for hunting. DEFCON remembers it per class.
3. **Check the setup commands**: `DEFCON INIT` sends them now. They go out on their own at each login; `DEFCON INIT AUTO OFF` stops that.
4. **Make sure curing is on** (`CURING ON`): DEFCON sets the game's priorities, the game does the curing.

If you used the older defences package, your level carries over to the class you're in the first time DEFCON loads.

## Daily use

- **Log in**: `DEFCON INIT` runs by itself.
- **Going hunting**: `DEFCON 3` (or 4 to spend nothing).
- **Trouble nearby**: `DEFCON 1` raises everything; back to 3 afterwards drops the costly ones again.
- **Dragonform**: switching form switches table. `HUNTING AFTERFORM DEFCON INIT` (in hunting) sends the setup for the new form each time it rises or falls.

## Working with other packages

DEFCON reads nothing from other packages. With **self** installed, the Self tab watches what DEFCON keeps up (link `defcon-self`): the defences of your current level that are missing show as amber chips, and the Defences heading names the level ("Defences · DEFCON 3 · 18 up"). `LOOM LINK defcon-self OFF` switches it off.

## Adding or fixing a class

Each class's defaults live in one file under `packages/defcon/classes/`; the [README there](../packages/defcon/classes/README.md) explains the format and lists researched defences not yet confirmed in game, each as a ready `DEFCON ADD` line. If you've tuned a table that works, send your `DEFCON EXPORT` with a [feature idea](https://github.com/neijel-achaea/loom/issues/new/choose).

## Troubleshooting

- **"not configured yet: general defences".** Your class has no file: you get the defences every class shares, and only the common setup commands.
- **A defence keeps dropping and coming back.** It's in the table at your level and the game re-raises it. Raise its tier (`DEFCON SET <def> <higher tier>`) or remove it.
- **A defence isn't raised.** Check the name matches `DEF`, and that `DEFCON ON` (defence upkeep) and `CURING ON` are set. `DEFCON <same level>` resends everything.
- **`DEFCON UP` or `AUTOUP` says it's now called something else.** They were renamed to `DEFCON INIT` and `DEFCON INIT AUTO`.
