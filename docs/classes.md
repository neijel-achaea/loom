# Classes

*Which classes Loom knows, and what's still missing for some.*

Two packages depend on your class: **[hunting](hunting.md)** (the F-keys, battlerage, attack lines, shieldbreak) and **[defcon](defcon.md)** (the defence table and setup commands). The **[basher](basher.md)** builds on hunting's class data.

**Every class in the game has a hunting layout and a DEFCON table**, and so does every dragon colour (all colours share one DEFCON table, as the game keeps one curing list for dragonform). Both follow your class from the game, so switching class or form switches them.

## By class

| Class | F1 main attacks | Rage abilities | Shieldbreak | Basher's rage order | DEFCON defences |
| --- | :---: | :---: | --- | --- | :---: |
| Alchemist | 1 | 7 | Caustic, **no key yet** | default | 23 |
| Apostate | 1 | 7 | Pierce | default | 23 |
| Bard | 1 | 7 | Resonance | default | 25 |
| Blademaster | 2 | 7 | Shatter | default | 23 |
| Depthswalker | 1 | 7 | Nakail | default | 21 |
| Druid | 1 | 6 | Vinecrack | default | 23 |
| Infernal | by weapon spec | 7 | Shiver | default | 23 |
| Jester | 1 | 7 | Jacks | default | 25 |
| Magi | 1 | 6 | Disintegrate | **its own** | 26 |
| Monk | 1 | 7 | Splinterkick | default | 26 |
| Occultist | 1 | 7 | Ruin | default | 23 |
| Paladin | by weapon spec | 7 | Faithrend | default | 26 |
| Pariah | 1 | 7 | Scour | default | 23 |
| Priest | 1 | 7 | Crack | default | 22 |
| Psion | 1 | 7 | Pulverise | default | 23 |
| Runewarden | by weapon spec | 7 | Fragment, **no key yet** | default | 24 |
| Sentinel | 4 | 7 | Bore | default | 24 |
| Serpent | 1 | 7 | Excoriate | default | 22 |
| Shaman | 1 | 7 | Vulnerability | default | 24 |
| Sylvan | 1 | 6 | Thornpierce | default | 22 |
| Unnamable | by weapon spec | 7 | Sunder, **no key yet** | default | 26 |
| Black Dragon | gut or incantation | 7 | Blast | **its own** | 24 |
| Blue Dragon | gut or incantation | 6 | Blast | default | 24 |
| Gold Dragon | gut or incantation | 6 | Blast | default | 24 |
| Green Dragon | gut or incantation | 6 | Blast | default | 24 |
| Red Dragon | gut or incantation | 6 | Blast | default | 24 |
| Silver Dragon | gut or incantation | 6 | Blast | default | 24 |

What the columns mean:

- **F1 main attacks**: how many main attacks `HUNTING MAIN` offers. The knight classes (Infernal, Paladin, Runewarden, Unnamable) take theirs from their weapon specialisation; dragons choose gut or incantation with `HUNTING DRAGONMODE`.
- **Shieldbreak**: the ability that breaks a mob's shield. "No key yet" means there's no F-key for it, so the basher waits for the shield to fade instead of razing. Dragons have their own shieldbreaks too, but the basher uses Blast while dragonbreath is up.
- **Basher's rage order**: "default" fires the 36-rage hit, then the 14-rage hit, then the 25-rage hit while the 36 stays affordable. "Its own" means the class has an order with conditions (Magi: Firefall on a clumsy target first).
- **DEFCON defences**: how many defences the default table holds, across all five tiers. The [DEFCON class README](../packages/defcon/classes/README.md) also lists researched defences not yet confirmed in game, each as a ready `DEFCON ADD` line.

## Known gaps

- **Empowered battlerage (++).** The game's lines for empowered abilities differ from the plain ones and aren't all captured. For each ability, hunting knows the plain line and recognises the empowered one by its first words where that's been done; for others, the ability's cooldown may not start after an empowered use. Collecting them for every class is planned ([#257](https://github.com/neijel-achaea/loom/issues/257)).
- **Battlerage beyond level 35.** Some abilities' lines haven't been seen yet ([#149](https://github.com/neijel-achaea/loom/issues/149), help wanted).
- **Shieldbreak keys** for Alchemist, Runewarden and Unnamable (see the table).
- **Some DEFCON defence names** in the Priest, Psion, Shaman and Unnamable tables aren't confirmed in game yet. If DEFCON never raises one, its name in your `DEF` list may differ: report it.

## Helping out

If you play a class and see something wrong, a missing attack line, a key that never lights, a defence that isn't raised, send it with a [bug report](https://github.com/neijel-achaea/loom/issues/new/choose): the line exactly as the game showed it, your class, and your level. A DEFCON table you've tuned can be shared with `DEFCON EXPORT`.

The class files are plain JavaScript, one per class: [hunting's](../packages/hunting/classes/README.md) and [DEFCON's](../packages/defcon/classes/README.md) READMEs explain the format.
