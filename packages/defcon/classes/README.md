# DEFCON class files

The class files hold **defaults**: the generic defences, what was confirmed
in game, and clear low-hanging fruit (gripping for a class that has it).
Anything researched but not yet confirmed is listed under
[Suggestions](#suggestions) instead, ready to add by hand once player-editable
tables land (#175). A confirmed suggestion moves into its class file.

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

Commands DEFCON UP sends for the class, after the common ones
(`selfishness`, `avoid physical`, `insomnia`), so they're the last thing
sent. Put here what has to happen first: a form, a stance, wielding
something. Commands that need balance or equilibrium go through the queue:
`queue add eq ...`, `queue add bal ...`. Something interrupted by any
command (a morph) goes last of all.

## aftermorph

Optional. Commands that must wait until the morph in `up` has completed
(embrace spirit, for instance): DEFCON holds them back and sends them when
the game says the metamorphosis is done, or when the Morph charstat
changes. If you're already in that form, they're sent straight away.

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
  the level no longer wants it, e.g. an upkeep that drains mana. A string
  instead is the defence's own off command, for one that `RELAX` doesn't
  take down: `["distortaura", 1, 14, "normalaura"]`.

Start from `D.generic` (the defences every class shares) and add the class's
own. Keep the shared ones' tiers and priorities unless the class has a reason
to differ.

To take a defence out of every table, delete its rows and add it to
`D.retired` in `defcon_classes.js`, so its curing priority is reset once.
Retired so far: rebounding and curseward (both need constant recasting).

## Levels

| DEFCON | Meaning |
|---|---|
| 5 | Bare minimum |
| 4 | Hunting, using no resources (plants, minerals, elixirs, salves, inks) and nothing that drains endurance or willpower heavily |
| 3 | Normal hunting, silent (the default) |
| 2 | Hunting plus "noisy" defences (heldbreath, mass) |
| 1 | Full alert, including mana-draining upkeep |

## Choosing a defence's tier

Ask these in order; the first yes sets the tier.

1. Does it **drain mana continuously** while up, or does it **only help
   against adventurers** and cost something to keep up? → **1**. A free one
   that guards against adventurers (lifevision, against thieves) stays at 4.
2. Is it **noisy** (others in the room see it), or does it **get in the way
   of ordinary actions** if it's always kept up? → **2**. Insomnia stops you
   sleeping and selfishness blocks generosity, and curing would raise them
   again straight away, so both sit at 2.
3. Does it **use something up** (a herb, salve, elixir, mineral or ink), or
   drain a lot of endurance or willpower? → **3**
4. Is it **free once up** and useful while hunting? → **4**
5. Is it passive or permanent: the **bare minimum**? → **5**

**Exception:** mindseye stays at 5 although it comes from a tattoo: without
it you log in blind and deaf.

Curing priority is separate from the tier: 1 is cured first. Most defences
sit between 8 and 15; keep a defence's priority the same across classes
unless the class has a reason to differ.

## Checking a change

The four original tables were checked against their DEFCON UP commands and
the curing commands at every level before and after the split (#156). Do the
same for a fixed class: load the built `dist/defcon.nxs` in node, stub the
Nexus calls, and compare `defcon_set`'s queue at DEFCON 5 to 1.

## Suggestions

Researched from the wiki, not confirmed in game. Each line is the command to
add it to your own table (#175); tier and priority follow the questions
above. Report back what works, and it becomes a default.

### Blademaster
```
DEFCON ADD constitution 4 13       "stomach of steel"
DEFCON ADD consciousness 4 12      harder to knock unconscious
DEFCON ADD clarity 4 13            sees hidden people and illusions (650 mana once)
DEFCON ADD binding 4 11            spare Shin energy heals you (needs shin trance)
DEFCON ADD projectiles 1 14 RELAX  avoids missiles (mana drain)
DEFCON ADD dodging 1 15 RELAX      dodges attacks from the air (mana drain)
DEFCON ADD mindnet 1 15 RELAX      warns when people approach (mana drain)
```

### Depthswalker (Terminus, after embracing; DEF names unconfirmed)
```
DEFCON ADD tsuura 4 10             less damage from denizens
DEFCON ADD mainaas 4 11            cutting and blunt resistance (Augmentation item)
DEFCON ADD tahmaal 4 12            fire resistance (over the shadow cloak)
DEFCON ADD trusad 4 13             more critical hits on denizens
```
Still open: the mainaad and balateth weapon buffs (init commands, if they
last until logout), and veil.

### Infernal
```
DEFCON INIT ADD queue add bal hellforge activate relentless   fear immunity (hellforged armour)
DEFCON INIT ADD queue add bal hellforge channel conqueror     heals on kills (hellforged armour)
```
Untested whether the hellforge activation and channel persist across logins.

### Pariah (Charnel, after embracing)
```
DEFCON ADD resolve 4 11            halves bleeding damage; bleeding can't kill you
```

### Priest (Zeal, after embracing; DEF names unconfirmed)
```
DEFCON ADD protection 4 10         less damage from physical blows (RECITE PROTECTION ME)
DEFCON ADD fire 4 12               fire protection (RECITE FIRE ME)
DEFCON ADD void 4 12               cold resistance (RECITE VOID ME)
DEFCON ADD will 4 14               faster willpower regeneration (RECITE WILL ME)
DEFCON ADD endurance 4 14          faster endurance regeneration (RECITE ENDURANCE ME)
```

### Jester
```
DEFCON ADD arrowcatch 1 15 RELAX   catches arrows (mana drain)
```
