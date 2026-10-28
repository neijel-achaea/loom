# Remedies

*Tops up the elixirs and salves in your rift: brews each one in your pot, pours it into the rift, and stops when they're all at their targets.*

<!-- loom:version remedies -->
*This page describes remedies 0.1.1.*
<!-- /loom:version -->

## What it is

Remedies is for the Remedies trade skill. `REMEDIES BREW` reads your rift (`IR ELIXIR`, then `IR SALVE`, both hidden), works out how far each elixir and salve is below its **target**, and brews what's missing in your pot, one remedy after another: `BREW 20 HEALTH IN POT123456`, then `POUR POT123456 IN RIFT`, and on to the next. Each step waits for the game's answer to the one before, and for your balance. When everything is done it says what it brewed, and stops.

- A unit is 50 sips; at most 20 units (1,000 sips) go into the pot at once, so a big shortfall is brewed in rounds.
- It never goes over a target: a remedy less than 50 sips short is left alone.
- Targets: health and mana 2,000, every other remedy 1,000, unless you set your own.
- Ingredients come from your rift. A remedy whose ingredients are missing is skipped and named at the end.
- If the pot isn't empty when a run starts, its contents are poured into the rift first (and count towards that remedy).
- Your rift holds only so much of each remedy. When a pour comes up short ("bringing the total stored sips to 1000" after fewer sips than were brewed) or the rift is already full, Remedies learns that limit, stops, and says how many sips are still in the pot. From then on that remedy is never topped up beyond its limit.

It sends nothing while Loom is paused (`LOOM PAUSE ON`), and waits while another package has a command out. A run is something you start, and it ends by itself: nothing repeats or restarts on its own, and a reload ends it.

## Commands

<!-- loom:commands remedies -->
| Command | What it does |
|---|---|
| `REMEDIES` | your pot, and each remedy's stock against its target (as last read) |
| `REMEDIES POT <pot>` | the pot you brew in, as the game names it (e.g. pot123456) |
| `REMEDIES CHECK` | read your rift (IR ELIXIR, IR SALVE) and say what would be brewed |
| `REMEDIES BREW` | read your rift, then brew and pour each one up to its target, 20 units (1,000 sips) at a time; stops when done |
| `REMEDIES STOP` | end a run now |
| `REMEDIES TARGET <name> <n\|DEFAULT>` | the level to top one up to (defaults: health and mana 2,000, the rest 1,000) |
| `REMEDIES CAPS [CLEAR]` | the most your rift took of each, learnt when a pour came up short; CLEAR forgets them |
| `REMEDIES DEBUG` | internal state |
| **A unit is 50 sips; a remedy less than 50 sips short is left alone, so nothing goes over its target.** | |
<!-- /loom:commands -->

`REMEDIES` shows each remedy as `stock/target` from the last reading, with the units a brew would add. `REMEDIES CHECK` reads the rift again and says what `REMEDIES BREW` would brew, without brewing.

## Setting it up

1. **Import `remedies.nxs`** (see [Getting started](getting-started.md)). It needs the Remedies skill.
2. **Tell it your pot**: `REMEDIES POT pot123456`, with your pot's id (it's in your inventory, `II`).
3. **Set any targets you want different**: `REMEDIES TARGET venom 1500`, `REMEDIES TARGET venom DEFAULT` to go back.
4. **`REMEDIES CHECK`** to see what it would brew.

## Daily use

Hold your pot, `REMEDIES BREW`, and let it work through the list; `REMEDIES STOP` ends it early. The closing line says what went in: "brewed health 550 sips, mana 200 sips…; skipped venom (no ingredients)".

## Working with other packages

Remedies reads nothing from other packages yet. A reminder when a remedy runs low, through the [ledger](ledger.md), is planned for later.

## Troubleshooting

- **"Loom is paused"**: something (you, `LOOM PAUSE ON`, or a package waiting on the game) paused Loom; `LOOM PAUSE OFF` and try again. A run that gets paused says so and waits.
- **"set your pot first"** or **"is not a pot"**: `REMEDIES POT <pot>` with the id your inventory shows.
- **"the rift took only N of M sips"**: your rift is full of that remedy. The rest is still in the pot; use it or empty the pot before the next run. `REMEDIES CAPS` lists the limits learnt; `REMEDIES CAPS CLEAR` forgets them (if your rift has grown).
- **"no answer to BREW after 8 s: stopped."**: the game said something Remedies doesn't know. Paste the line in a [bug report](https://github.com/neijel-achaea/loom/issues/new/choose).
