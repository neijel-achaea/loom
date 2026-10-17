# Adding or fixing a class

Two packages hold per-class data, each in one file per class:

- **hunting**: `packages/hunting/classes/<class>.js`: the F-keys, main attacks, battlerage costs, shieldbreak, the basher's rage order, and the attack lines. Format: [hunting's class README](../../packages/hunting/classes/README.md).
- **defcon**: `packages/defcon/classes/<class>.js`: the setup commands and the defence table by tier. Format, tier questions and researched suggestions: [DEFCON's class README](../../packages/defcon/classes/README.md).

Every class in the game already has both ([Classes](../classes.md)). Most work is fixing and completing them: a line the game words differently, an ability at a higher level, a defence name. Adding a class (a new one in the game) follows the same steps.

## Fixing a line

The commonest fix: a battlerage key stays lit after use, never goes dark, or an attack isn't tagged. Its line isn't known (or the game reworded it).

1. **Capture the line exactly** as the game shows it, from the start of the line to its last character. Copy it from the main window or a log; don't retype it.
2. **Write the pattern**: replace the target's name with `(.*)` and pronouns with `(\w+)`, escape full stops (`\.`), anchor it (`^…$`). Lines that start "You …" must be anchored at `^You`, so other players' versions never match.
3. **Add the row** to the class's `lines`: `[/pattern/, "TAG", "Ability"]`, with the ability named exactly as the game names it in "You can use Windlash again".
4. **If the ability has a ++ version** (a different line when the target already has certain afflictions), add a second row after it matching only the line's opening words, with the same tag and ability. The first match wins, so the plain line comes first.
5. **Test the pattern** against the real line, and against a line that must not match ([Testing](testing.md#2-test-patterns-against-real-lines)).
6. **Bump hunting's patch version**, build, check, and test in game: use the ability and watch its key go dark, then light again.

Can't code it? Send the line with a [bug report](https://github.com/neijel-achaea/loom/issues/new/choose), with your class and level; that's the hard part done.

## Adding a class to hunting

1. **Find the class's name as GMCP sends it** (`Char.Status`'s class, e.g. `Magi`, `Black Dragon`): the entry is keyed by it exactly.
2. **Copy the closest existing class file** as a start; a similar class's layout saves most of the work.
3. **`keys`**: twelve rows, F1 first. F1 is `["{main}", ""]` (the main attack, from `mains`); battlerage abilities next, with the `huQ` prefix so they're queued; F8–F12 extras by the usual layout (F9 `{stats}`, F10 Diag, F12 Shield; F11 a panic key or heal where the class has one).
4. **`mains`**: the class's main attacks by name; `specMain` or `morphMain` when the default depends on specialisation or morph. Knight classes set `weapons: true` and get their weapon specialisations' attacks from `hunting_weapons.js`.
5. **`rage`**: each ability's rage cost, named as the game names it. The game's `AB` pages and the [Battlerage wiki page](https://wiki.achaea.com/Battlerage) give the costs.
6. **`razes`**: the shieldbreak (it has no cooldown of its own, so it's kept apart).
7. **`lines`**: one row per attack line, as in *Fixing a line* above.
8. **`bash`** only if the class needs a battlerage order other than the basher's default.
9. Build, check, and test in game: `HUNTING` shows the class, the keys light as they should, `HUNTING RAGE` follows the cooldowns.

## Adding a class to DEFCON

1. **Start from `D.generic`** (the defences every class shares) and add the class's own: `[defence, tier, priority, relax?]`, with the defence named as the game's `DEF` lists it.
2. **Choose each tier** with the questions in DEFCON's README (the first yes decides). Keep shared defences' tiers and priorities unless the class has a reason to differ.
3. **`init`**: the class's setup commands (stance, summons, wielding, form), after the common ones; anything that a command would interrupt (a morph) goes last, and what must wait for it goes in `aftermorph`.
4. **Check it at every level**: load the built `dist/defcon.nxs` in node, and compare the curing commands `defcon_set` queues at DEFCON 5 down to 1.
5. Defence names you couldn't confirm in game stay in the README's suggestions, as `DEFCON ADD` lines, until someone confirms them.

**A player's own table can become the default:** `DEFCON EXPORT` prints it in the class-file format with their changes marked. Paste it over the class file (keeping the header comment), check the marked lines, and rebuild.

## Finishing

Bump each package you changed (patch for a fix, middle number for a new class), build, run `tools/check.py`, and update [Classes](../classes.md) if a gap closed. The pull request's in-game checklist names the abilities and defences to try.
