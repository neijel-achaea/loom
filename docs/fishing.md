# Fishing

*Baits and casts with one command, then teases, jerks and reels on the game's cues until the fish is landed.*

<!-- loom:version fishing -->
*This page describes fishing 1.0.0.*
<!-- /loom:version -->

## What it is

Fishing in Achaea is a sequence of answers to the game's cues: tease the line when a fish nibbles, jerk the pole when it strikes, reel when it's hooked. Fishing does those answers for you:

1. `CL east` (or `FISHING CAST east`) baits the hook with your bait and casts the line east.
2. **A nibble** ("You feel a fish nibbling on your hook."): it teases the line after a short wait.
3. **A strike**, small, medium or large: it jerks the pole.
4. **Hooked** ("…feel the line go taut."): it reels, and reels again whenever the tension lets it.
5. **Landed** (either "…and land <fish>!" or "…your struggle is over. You've landed <fish>."): done. Cast again. With `FISHING REBAIT ON`, the hook is baited again as soon as you have balance, so the next `CL` only casts. A **snapped line** ("…it snaps suddenly, costing you your fish and bait.") leaves the hook bare too, and is re-baited the same way.

After each catch or snapped line it says whether it re-baits ("hook bare (fish landed); re-baiting with crab on balance."). With `LOOM DEBUG ON`, `CL` also says whether it baits or only casts.

`CL` baits only a bare hook: it follows the game's own lines, so after you reel in by hand ("You reel your line in completely.") the bait stays on and the next `CL` just casts. Bait and cast both wait for balance, since baiting takes it. Reeling in by hand also drops any tease or jerk still waiting.

Each cue line is marked with its stage, **[1/4]** to **[4/4]**, so you can follow the fight at a glance. If the hook pulls free, it teases again and waits for the next bite.

When you land a new yearly record ("You've just set a new record for this year for that catch!"), it tells your party "Ding fish!" (`FISHING DING OFF` to keep quiet).

Nothing is sent while Loom is paused (`LOOM PAUSE ON`).

## Commands

<!-- loom:commands fishing -->
| Command | What it does |
|---|---|
| `FISHING` | bait, ding, rebait and pause state |
| `FISHING BAIT <bait>` | the bait to put on the hook |
| `FISHING CAST <direction>` | bait the hook (unless it already is) and cast, both on balance |
| `CL <direction>` | the same, shorter |
| `FISHING REBAIT ON\|OFF` | bait the hook again after a catch, so CL only casts |
| `FISHING DING ON\|OFF` | tell the party "Ding fish!" on a new yearly record |
| **After each catch or a snapped line it says whether it re-baits. LOOM DEBUG ON also shows whether CL baits or only casts.** | |
| **Without a pole in hand, the game's "You must be wielding a pole" line makes it wield one; cast again.** | |
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

Common bait decaying in your inventory ("You are dismayed as a shrimp turns to dust in your hands.") is hidden: shrimp, worm, octopus, minnow, clam, sand flea, crab and mudsucker. Anything else that turns to dust still shows.

## Working with other packages

Fishing reads nothing from other packages. For statistics (catches, weights, landing rates, records, for you and everyone around you), install **[fishingstats](fishingstats.md)**: Fishing does the work, FishingStats keeps the score.

## Troubleshooting

- **"no bait set".** `FISHING BAIT <bait>` first.
- **It stops answering cues.** Check `LOOM PAUSE` is off. If the game worded a cue differently, report the line with a [bug report](https://github.com/neijel-achaea/loom/issues/new/choose).
