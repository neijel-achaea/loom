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
specMain: { "Two Handed": "slaughter" }   // optional: default per spec
```

In game, `HUNTING MAIN` lists them, `HUNTING MAIN CHARGE` switches (kept per
class), and `HUNTING MAIN DEATHBLOW = weave deathblow @tar` adds one without
editing this file, handy while testing. The default is the one picked, else
the spec's, else the first.

## toggles (optional)

Things a key switches on and off, such as the Serpent's sneaking:

```js
toggles: {
  sneak: { label: "Sneak", on: ["hide", "conjure cloak"], off: ["emerge", "dispel self"],
           renew: [/^Your shroud dissipates/, "conjure cloak"] }
}
```

Put `["{toggle:sneak}", ""]` in `keys`: the key reads "Sneak ON" or "Sneak
OFF", is lit while on, and runs `HUNTING TOGGLE SNEAK`. `renew` is optional:
while the toggle is on, seeing that line sends the command again.

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
again". Costs belong to the class, so two classes may share an ability name
with different costs.

## lines

One row per message you see when you hit with an attack:
`[/pattern/, "TAG", "Ability"]`. The ability is optional.

- The line is highlighted and gets `[TAG] ` in front of it.
- `"Ability"` names a battlerage ability: seeing the line starts its cooldown
  and the global battlerage cooldown.
- Patterns are ordinary JavaScript regular expressions: `(.*)` for the
  target, `\.` for a full stop, `^` and `$` to anchor the whole line.

Only the current class's lines are checked, so patterns can't collide across
classes.
