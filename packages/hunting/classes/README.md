# Hunting class files

One file per class. Adding a class, or fixing one after the game rewords an
attack, means editing only these files and rebuilding.

The entry is named exactly as GMCP sends the class (`Magi`, `Black Dragon`).
A class with no file gets the generic keys (Stats, Diag, Shield) and HUNTING
HELP says it isn't configured yet.

```js
HU.classes["Magi"] = {
  keys: [ ... ],    // F1 to F12
  rage: { ... },    // battlerage costs
  razes: [ ... ],   // the shieldbreak: no cooldown, no global cooldown
  lines: [ ... ]    // your attack lines: highlighted, tagged, and cooldowns
};
```

## keys

Twelve rows, F1 first: `[label, command]`, or `[label, command, "main"]` for a
key that lights whenever you have balance and equilibrium (your basic attack).
When the label is an abbreviation, put the ability's name third so its rage
highlight still works: `["SBP", huQ + "sbp @tar", "Spinningbackfist"]`.

- `huQ` is the queue prefix for battlerage abilities: `huQ + "cast windlash at @tar"`.
- A key whose label is in `rage` lights when that ability is ready: off
  cooldown, no global battlerage cooldown, enough rage.
- Placeholders: `{stats}` the huntstats key (empty without huntstats),
  `{staff}` the staff attack, `{target}` the party target, `{dragon}` /
  `{DRAGON}` gut or incantation, `{MODE}` the dragon mode.
- `["", ""]` leaves a key empty.

## mains

The main attacks F1 can use, by name. Put `["{main}", ""]` as F1: it shows
the one in use, lit on balance and equilibrium.

```js
mains: {
  overhand: ["Overhand", "queue add b!wu!t!p weave overhand @tar"],
  charge: ["Charge", "queue add b!wu!t!p weave charge @tar"]
},
specMain: { "Two Handed": "slaughter" },  // optional: default per spec
morphMain: { "Wolf": "bite" }             // optional: default per morph
```

In game, `HUNTING MAIN` lists them, `HUNTING MAIN CHARGE` switches (kept per
class), and `HUNTING MAIN DEATHBLOW = weave deathblow @tar` adds one without
editing this file, handy while testing. The default is the one picked, else
the spec's or morph's, else the first. Changing spec or morph drops the
hand-picked one, so F1 follows.

## toggles (optional)

Things a key switches on and off, such as the Serpent's sneaking:

```js
toggles: {
  sneak: { label: "Sneak", on: ["hide", "conjure cloak"], off: ["emerge", "dispel self"],
           renew: [/^Your shroud dissipates/, "conjure cloak"] }
}
```

Put `["{toggle:sneak}", ""]` in `keys`: the key reads "Sneak ON" or "Sneak
OFF" (not lit, so it isn't mistaken for a ready ability) and runs `HUNTING TOGGLE SNEAK`. `renew` is optional:
while the toggle is on, seeing that line sends the command again. `seen` is
optional too: `[/now on/, /now off/]`, the game's lines for each state, so the
key follows however it was switched (typed, or dropped on its own).

## pauses (optional)

Abilities that break if anything is sent while they happen, such as a
Sentinel's morph: `[/starts/, /finishes/]`. The first line sets
`pauseTriggers` on, so other packages hold back; the second sets it off.

```js
pauses: [
  [/^You begin to morph/, /^You have finished morphing/]
]
```

For a morph, the second pattern is optional: the `Morph:` change in
charstats also ends the pause. A third field is a command sent once paused:
the Monk's Tekura grading answers the tutor with `"ok"`.

## gags (optional)

Lines to hide: `gags: [/^You connect!$/]` (the Monk's combo prints it after
every hit).

## weapons (optional)

`weapons: true` for the knight classes (Infernal, Paladin, Runewarden,
Unnamable). Their main attacks depend on the Weaponmastery specialisation, and
a spec's attacks print the same lines whichever class uses it, so they live
once in `hunting_weapons.js`: per spec, its main attacks, its default for F1
and its lines. Every weapons class gets all of them after its own `mains` and
`lines`, and F1 follows `Spec:` from charstats. A class's own first main stays
the default while it has no spec (Paladin's Doubleslash).

## specKeys (optional)

For classes whose attacks depend on the specialisation in `charstats`
(`Spec: Two Handed`): keys that replace the defaults for that spec, by F-key.

```js
specKeys: {
  "Two Handed": { 1: ["Slaughter", "queue add b!wu!t!p slaughter @tar", "main"] }
}
```

Hunting redraws the keys when the spec changes. Lines don't need this: put
every spec's attack lines in `lines`, only the one you use will ever show.
For the main attack, `specMain` (above) is simpler.

## rage

`{ Ability: cost }`, named as the game names it in "You can use Windlash
again", which is always the skill's own name (Temperance, not TEMPER). Costs belong to the class, so two classes may share an ability name
with different costs.

## razes

The class's shieldbreak, which costs rage but has no cooldown of its own and
doesn't start the global battlerage cooldown: `razes: ["Disintegrate"]`. The
game never says it is ready again, so its attack line only tags and
highlights, and its key lights whenever the global cooldown is clear and you
have the rage. Without this, using it would leave every rage key dark.

## lines

One row per message you see when you hit with an attack:
`[/pattern/, "TAG", "Ability"]`. The ability is optional.

- The line is highlighted and gets `[TAG] ` in front of it.
- `"Ability"` names a battlerage ability: seeing the line starts its cooldown
  and the global battlerage cooldown (unless it is in `razes`).
- Patterns are ordinary JavaScript regular expressions: `(.*)` for the
  target, `\.` for a full stop, `^` and `$` to anchor the whole line.

**The ++ versions** (an ability's stronger effect when the target already
has certain afflictions) mostly can't be captured. So an ability with a ++
version gets two rows: its plain line, then a pattern matching only the
line's opening, which tags any other ending (the ++ one) with the same tag
and starts the same cooldown. Rows are checked in order and the first match
wins:

```js
[/^You quickly combine and throw the virulent pathogen at (.*)\. The chemical seeps through (\w+) skin but (\w+) is able to fight off the worst of its effects\.$/, "PATHOGEN", "Pathogen"],
[/^You quickly combine and throw the virulent pathogen at /, "PATHOGEN", "Pathogen"]
```

Only the current class's lines are checked, so patterns can't collide across
classes. Lines that are the same for every class (Provoke) live once in
`HU.sharedLines`, at the end of `hunting_classes.js`, and are checked after the
class's own.
