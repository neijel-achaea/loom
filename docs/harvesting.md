# Harvesting

*Harvests the plants your rift is short of as you walk, and stores them, one after another.*

<!-- loom:version harvesting -->
*This page describes harvesting 0.2.6.*
<!-- /loom:version -->

## What it is

With Harvesting on, every room you enter is checked: of the plants that grow in this kind of environment (forest, grasslands, jungle, swamp…), the ones whose stock in your rift is **below its minimum** are harvested, one at a time, and each is put straight into the rift (`INR`). Then it waits for balance and harvests the next. Plants you have enough of are left alone.

It knows your stock from your rift: `HARVESTING ON` (or `HARVESTING STOCK`) reads it with `IR HERBS`, and every "You store N …" line keeps it up to date.

Every plant has a minimum: 2,000 by default, or one you set for it. So walking a forest with Harvesting on tops up exactly what's short.

It sends nothing while Loom is paused (`LOOM PAUSE ON`), and it's off until you turn it on.

## Commands

<!-- loom:commands harvesting -->
| Command | What it does |
|---|---|
| `HARVESTING` | status: what is below its minimum |
| `HARVESTING ON\|OFF` | ON also re-reads your rift (IR HERBS) |
| `HARVESTING MIN <n>` | default minimum for every plant |
| `HARVESTING MIN <plant> <n>` | minimum for one plant (DEFAULT to go back to the default) |
| `HARVESTING STOCK` | re-read your rift now |
| `HARVESTING RESET` | clear the queue, reload saved state |
| `HARVESTING DEBUG` | internal state |
<!-- /loom:commands -->

`HARVESTING` lists what's below its minimum. `HARVESTING MIN 1500` sets the default minimum for every plant; `HARVESTING MIN ginseng 4000` sets one plant's; `HARVESTING MIN ginseng DEFAULT` puts it back on the default.

`HARVESTING RESET` clears the queue (after a harvest that went wrong, say) and reloads the saved state.

## Setting it up

1. **Import `harvesting.nxs`** (see [Getting started](getting-started.md)).
2. **Set your minimums**: a default, and any plant you need more or less of.
3. **`HARVESTING ON`**: it reads your rift and starts with the next room you enter.

If you used harvesting 2.0 (`hv_*` variables), its settings move over the first time it loads.

## Daily use

Turn it on when you go out to gather, walk a route through the right environments, and turn it off when you're done. A plant being harvested in a room stops when the room's supply runs out ("That plant has been fully harvested.") and moves on to the next.

## Working with other packages

Harvesting reads nothing from other packages. With others installed, Loom's integrations use what it knows about your stock. Each is a link, on as soon as both packages are installed; `LOOM LINKS` lists them, `LOOM LINK <id> OFF` switches one off.

| Link | With | What it does |
| --- | --- | --- |
| `harvesting-ledger` | ledger | A "Harvest run" reminder in the ledger when any plant falls below 90% of its minimum. It goes once every plant is back at its minimum, so it doesn't flicker around the line. |
| `harvesting-room` | room and patrolling | The environment's plants on a small line in the Here tab: green here and stocked, yellow here but below your minimum, red missing. Needs patrolling's plant check (`PATROLLING ON`) to know what's in the room. |

## Troubleshooting

- **It harvests nothing.** Check it's on (`HARVESTING`), your rift has been read (`HARVESTING STOCK`), and the plant grows in this environment.
- **It keeps harvesting something you have plenty of.** The stock it knows may be old: `HARVESTING STOCK` reads the rift again.
- **It got stuck mid-queue.** `HARVESTING RESET`.
