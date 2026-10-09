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

- `huQ` is the queue prefix for battlerage abilities: `huQ + "cast windlash at @tar"`.
- A key whose label is in `rage` lights when that ability is ready: off
  cooldown, no global battlerage cooldown, enough rage.
- Placeholders: `{stats}` the huntstats key (empty without huntstats),
  `{staff}` the staff attack, `{target}` the party target, `{dragon}` /
  `{DRAGON}` gut or incantation, `{MODE}` the dragon mode.
- `["", ""]` leaves a key empty.

## rage

`{ Ability: cost }`, named as the game names it in "You can use Windlash
again". Costs belong to the class, so two classes may share an ability name
with different costs.

## lines

One row per message you see when you hit with an attack:
`[/pattern/, "TAG", "Ability", "sound"]`. The last two are optional.

- The line is highlighted and gets `[TAG] ` in front of it.
- `"Ability"` names a battlerage ability: seeing the line starts its cooldown
  and the global battlerage cooldown. Use `null` when you only need the sound.
- `"sound"` is a Nexus sound name, played when the line shows.
- Patterns are ordinary JavaScript regular expressions: `(.*)` for the
  target, `\.` for a full stop, `^` and `$` to anchor the whole line.

Only the current class's lines are checked, so patterns can't collide across
classes.
