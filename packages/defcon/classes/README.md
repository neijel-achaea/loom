# DEFCON class files

One file per class. Adding a class, or fixing one, means editing only its file
here and rebuilding (`python3 tools/build.py defcon`). The files are joined
after `defcon_classes.js` into one Nexus function, in name order.

The entry is named exactly as GMCP sends the class (`Magi`, `Sylvan`). Every
dragon colour uses `Dragon` through `D.alias` in `defcon_classes.js`. A class
with no file gets `D.generic` for its defences and only `D.common` on
DEFCON UP, and DEFCON says it isn't configured yet.

```js
D.classes["Magi"] = {
  up: ["queue add eq simultaneity", "wield staff"],
  defs: [
    ["alertness", 1, 10, true],
    ["stoneskin", 4, 10],
    ...
  ]
};
```

## up

Commands DEFCON UP sends for the class, before the common ones
(`selfishness`, `avoid physical`, `insomnia`). Put here what has to happen
first: a form, a stance, wielding something. Commands that need balance or
equilibrium go through the queue: `queue add eq ...`, `queue add bal ...`.

## defs

`[defence, tier, curing priority, relax?]`, one row per defence the curing
system should keep up.

- **defence**: the name as the game's `DEF` lists it, lower case, as used
  in `CURING PRIORITY DEFENCE <name>`.
- **tier**: the lowest-numbered DEFCON that still wants it. DEFCON n keeps
  every defence with tier >= n, so tier 5 is always kept and tier 1 only at
  full alert.
- **curing priority**: 1 (first) to 25.
- **relax**: `true` when the defence should be dropped (`RELAX <name>`) once
  the level no longer wants it, e.g. an upkeep that drains mana.

Start from `D.generic` (the defences every class shares) and add the class's
own. Keep the shared ones' tiers and priorities unless the class has a reason
to differ (dragonform raises rebounding and curseward to tier 1).

## Levels

| DEFCON | Meaning |
|---|---|
| 5 | Bare minimum |
| 4 | Hunting, using no resources (plants, minerals, elixirs, salves, inks) and nothing that drains endurance or willpower heavily |
| 3 | Normal hunting, silent (the default) |
| 2 | Hunting plus "noisy" defences (heldbreath, mass) |
| 1 | Full alert, including mana-draining upkeep |

## Checking a change

The four original tables were checked against their DEFCON UP commands and
the curing commands at every level before and after the split (#156). Do the
same for a fixed class: load the built `dist/defcon.nxs` in node, stub the
Nexus calls, and compare `defcon_set`'s queue at DEFCON 5 to 1.
