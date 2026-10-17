# Fishing

*Baits and casts with one command, then teases, jerks and reels on the game's cues until the fish is landed.*

<!-- loom:version fishing -->
*This page describes fishing 0.2.2.*
<!-- /loom:version -->

## What it is

Fishing in Achaea is a sequence of answers to the game's cues: tease the line when a fish nibbles, jerk the pole when it strikes, reel when it's hooked. Fishing does those answers for you:

1. `CL east` (or `FISHING CAST east`) baits the hook with your bait and casts the line east.
2. **A nibble** ("You feel a fish nibbling on your hook."): it teases the line after a short wait.
3. **A strike**, small, medium or large: it jerks the pole.
4. **Hooked** ("…feel the line go taut."): it reels, and reels again whenever the tension lets it.
5. **Landed**: done. Cast again.

Each cue line is marked with its stage, **[1/4]** to **[4/4]**, so you can follow the fight at a glance. If the hook pulls free, it teases again and waits for the next bite.

When you land a new yearly record ("You've just set a new record for this year for that catch!"), it tells your party "Ding fish!" (`FISHING DING OFF` to keep quiet).

Nothing is sent while Loom is paused (`LOOM PAUSE ON`).

## Commands

<!-- loom:commands fishing -->
| Command | What it does |
|---|---|
| `FISHING` | bait, ding and pause state |
| `FISHING BAIT <bait>` | the bait to put on the hook |
| `FISHING CAST <direction>` | bait the hook and cast |
| `CL <direction>` | the same, shorter |
| `FISHING DING ON\|OFF` | tell the party "Ding fish!" on a new yearly record |
| **Then it teases, jerks and reels on the game's cues, marking the stages [1/4] to [4/4]. LOOM PAUSE stops it.** | |
<!-- /loom:commands -->

`FISHING BAIT shrimp` sets the bait, kept until you change it. `CL` is the short form for playing: `CL n`, `CL sw`. Any other word after `FISHING` goes to the game as you typed it, so the game's own fishing commands still work.

## Setting it up

1. **Import `fishing.nxs`** (see [Getting started](getting-started.md)).
2. **Set your bait**: `FISHING BAIT <bait>`, with the bait in your inventory.
3. **Stand at the water, wield your pole, `CL <direction>`.**

If you used the older fishing reflex (`bait` variable), the bait moves over the first time it loads.

## Daily use

`CL <direction>`, watch the stages tick through, `CL` again. The lines about how plentiful the fish are here stand out, so you know when to move on.

## Working with other packages

Fishing reads nothing from other packages. For statistics (catches, weights, landing rates, records, for you and everyone around you), install **[fishingstats](fishingstats.md)**: Fishing does the work, FishingStats keeps the score.

## Troubleshooting

- **"no bait set".** `FISHING BAIT <bait>` first.
- **It stops answering cues.** Check `LOOM PAUSE` is off. If the game worded a cue differently, report the line with a [bug report](https://github.com/neijel-achaea/loom/issues/new/choose).
