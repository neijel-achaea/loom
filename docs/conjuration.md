# Conjuration

*Runs a sigil's whole creation ritual one step at a time, each when the game is ready for it.*

<!-- loom:version conjuration -->
*This page describes conjuration 0.2.3.*
<!-- /loom:version -->

## What it is

Making a sigil is a long string of commands: take the reagents out of your rift, put them in your ouroboros, begin the creation, chant three times, ring the bell, end the ritual, take the sigil out. Each step has to wait for the one before it, and some wait for balance.

`CONJURATION flame` does the whole thing:

1. `OUTR` each reagent from the rift and `PUT` it in your ouroboros.
2. `BEGIN CREATION OF FLAME SIGIL`, then waits for the game to say you may begin.
3. Chants three times, waiting for balance between chants.
4. `RING BELL`, waiting for balance.
5. `END RITUAL`, then takes the sigil from the ouroboros.

Every step waits for its own reply from the game before the next goes out, so the game's queue only ever holds one ritual command. If a step bounces ("must regain balance"), it's sent again once you're ready. If the game stops answering for a dozen prompts, the ritual stops and says at which step and why.

Recipes so far: **fist** and **flame**. `CONJURATION LIST` shows every sigil and which have a recipe; more are added as players send them in.

## Commands

<!-- loom:commands conjuration -->
| Command | What it does |
|---|---|
| `CONJURATION` | your ouroboros and the recipes known |
| `CONJURATION <sigil>` | run its creation ritual (also CONJURATION MAKE <sigil>) |
| `CONJURATION OUROBOROS <number> [<number>]` | the ouroboros the reagents go into, and the one the sigil is taken from if it's another |
| `CONJURATION STOP` | abandon the ritual under way |
| `CONJURATION LIST` | every sigil, and which have a recipe |
| `CONJURATION DEBUG` | internal state |
| **The ritual goes one step at a time, each when the game is ready for it; CONJURATION shows how far it has got. Nothing is sent while triggers are paused.** | |
<!-- /loom:commands -->

`CONJURATION` on its own shows your ouroboros, the recipes known, and, during a ritual, how far it has got ("step 6 of 10 (chant…, chant 2 of 3)"). `CONJURATION STOP` abandons the ritual under way.

## Setting it up

1. **Import `conjuration.nxs`** (see [Getting started](getting-started.md)).
2. **Name your ouroboros**: `CONJURATION OUROBOROS 12345`. If the finished sigil turns up in a different ouroboros, give that one too: `CONJURATION OUROBOROS 12345 23456`.
3. **Stock the reagents** in your rift (silver, horn…).

## Daily use

`CONJURATION flame`, and watch it go. Nothing is sent while Loom is paused (`LOOM PAUSE ON`); the ritual waits and picks up again when it's off.

## Adding a recipe

A recipe is the reagents (how many of each) and the chant. If you know one that isn't in yet, send it with a [feature idea](https://github.com/neijel-achaea/loom/issues/new/choose): the sigil, its reagents, and the chant exactly as you speak it.

## Working with other packages

Conjuration reads nothing from other packages and nothing reads it. **sigils** watches the monoliths and flames once they're placed.

## Troubleshooting

- **"set your ouroboros first".** `CONJURATION OUROBOROS <number>`.
- **The ritual stopped at a step.** The message says which and why. Check your balance, reagents and ouroboros, then start again.
- **The sigil couldn't be taken.** It may be in another ouroboros: give its number as the second one.
