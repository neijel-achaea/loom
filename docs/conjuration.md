# Conjuration

*Runs a sigil's whole creation ritual one step at a time, each when the game is ready for it.*

<!-- loom:version conjuration -->
*This page describes conjuration 1.1.0.*
<!-- /loom:version -->

## What it is

Making a sigil or conjured item is a long string of commands: take the reagents out of your rift, put them in your ouroboros, begin the creation, perform the item's actions in order, end the ritual, take the item out. Each step has to wait for the one before it, and most wait for balance.

`CONJURATION flame` does the whole thing:

1. `IR COMMODITIES` (and `IR PLANTS` when the recipe crushes kola), and stops before taking anything out if the rift is short of a reagent ("not enough in the rift: dust (1 of 2)").
2. If selfishness is up, `GENEROSITY` first (reagents can't go into the ouroboros otherwise).
3. `OUTR` each reagent from the rift and `PUT` it in your ouroboros, then `SELFISHNESS` again if it was up. A recipe that crushes kola also takes one kola nut out per crush (kept in your inventory, not put in); kola is part of the rift check. A recipe that flips a coin needs a sovereign on hand per flip: whatever's short is taken out of your pack with security's `GG` after the rift check (without security's backpack set, it tells you instead and sends nothing).
4. `BEGIN CREATION OF FLAME SIGIL`, then waits for the game to say you may begin.
5. The item's actions as its AB scroll lists them: for the flame sigil, chant three times and ring the bell; for the brooch of Thoth, three different chants and three claps. Each waits for its line and for balance.
6. `END RITUAL`, then takes the item from the ouroboros.

Every step waits for its own reply from the game before the next goes out, so the game's queue only ever holds one ritual command. If a step bounces ("must regain balance"), it's sent again once you're ready. If the game stops answering for a dozen prompts, the ritual stops and says at which step and why.

Recipes so far: **brooch** (brooch of Thoth), **comprehension** (necklace of comprehension), **eye**, **fist**, **flame**, **concealment** (orb of concealment), **key**, **mushroom** and **whirlwind** (whirlwind of Vastar). `CONJURATION LIST` shows every item and which have a recipe; an item whose actions include one Loom doesn't know the game's line for yet says so. More are added as players send them in.

## Setting it up

1. **Import `conjuration.nxs`** (see [Getting started](getting-started.md)).
2. **Name your ouroboros**: `CONJURATION OUROBOROS 12345`. If the finished sigil turns up in a different ouroboros, give that one too: `CONJURATION OUROBOROS 12345 23456`.
3. **Stock the reagents** in your rift (silver, horn, ice, dust…).

## Daily use

`CONJURATION flame`, and watch it go. Nothing is sent while Loom is paused (`LOOM PAUSE ON`); the ritual waits and picks up again when it's off.

## Adding a recipe

A recipe is the item's AB scroll entry: the BEGIN CREATION syntax, the comms (reagents), and the actions field exactly as written (e.g. `chant "mortis troy tenkla", 3x6` or `3xchant "krolop escit yall", 1`). Loom also needs the game's line for each action it hasn't seen yet (all 17 are known now), and the line you get taking the item out. Send them with a [feature idea](https://github.com/neijel-achaea/loom/issues/new/choose).

## Working with other packages

Conjuration reads nothing from other packages and nothing reads it. **sigils** watches the monoliths and flames once they're placed.

## Troubleshooting

- **"set your ouroboros first".** `CONJURATION OUROBOROS <number>`.
- **The ritual stopped at a step.** The message says which and why. Check your balance, reagents and ouroboros, then start again.
- **The sigil couldn't be taken.** It may be in another ouroboros: give its number as the second one.
