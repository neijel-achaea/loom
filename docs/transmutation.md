# Transmutation

*Extracts the minerals your rift is short of as you walk the mountains, and stores them.*

<!-- loom:version transmutation -->
*This page describes transmutation 0.1.1.*
<!-- /loom:version -->

## What it is

Transmutation is Loom's package for the Transmutation trade skill. For now it does one thing: extraction, the way [harvesting](harvesting.md) does herbs and [gathering](gathering.md) does materials. With it on, every **mountain** or **natural underground** room you enter is checked: if the area's mineral is **below its minimum** in your rift, it is extracted (`EXTRACT CALAMINE`) and put straight into the rift (`INR`).

Every area gives one mineral, and it never changes. Transmutation keeps a map of them: in an area it doesn't know yet, it sends `MINERALS` once in the room you're in, and remembers what it says (a `MINERALS` you type counts too). Rooms don't get worked out, so a `MINERALS` that lists nothing means the whole area has none, and it isn't asked again there. `TRANSMUTATION AREAS` lists what it knows; `TRANSMUTATION AREAS calamine` tells you where to go for one.

It knows your stock from your rift: `TRANSMUTATION ON` (or `TRANSMUTATION STOCK`) reads it with `IR MINERALS`, and every "You store N …" and "You remove N …" line keeps it up to date.

Every mineral has a minimum: 500 by default, or one you set for it.

A room can't be extracted from again for a while, so a room extracted this session isn't tried again for an hour. The `INR` follows only an extraction that worked (it waits in the game's queue for the balance `EXTRACT` takes); one that brings nothing moves on at the next prompts. Transmutation waits for balance and equilibrium, and while another package has a command out, so in an underground room gathering's lumic and dust come first.

It sends nothing while Loom is paused (`LOOM PAUSE ON`), and it loads off: every session starts with `TRANSMUTATION ON`.

## Commands

<!-- loom:commands transmutation -->
| Command | What it does |
|---|---|
| `TRANSMUTATION` | status: the area here and what is below its minimum |
| `TRANSMUTATION ON\|OFF` | ON also reads your rift (IR MINERALS); loads OFF |
| `TRANSMUTATION MIN <n>` | default minimum for every mineral (default 500) |
| `TRANSMUTATION MIN <mineral> <n>` | minimum for one mineral (DEFAULT to go back to the default) |
| `TRANSMUTATION AREAS [mineral]` | the areas known, by mineral (or where to find one) |
| `TRANSMUTATION FORGET HERE\|<area>` | look the area's mineral up again (CONFIRM) |
| `TRANSMUTATION STOCK` | re-read your rift now |
| `TRANSMUTATION RESET` | clear what's out and the rooms extracted this session, reload saved state |
| `TRANSMUTATION DEBUG` | internal state |
| **Extracts in mountain and natural underground rooms. Each area gives one mineral: it sends MINERALS once in an area it doesn't know (yours count too) and remembers it.** | |
<!-- /loom:commands -->

`TRANSMUTATION` shows the area you're in, its mineral, and what's below its minimum among the minerals of the areas you know. `TRANSMUTATION MIN 800` sets the default minimum; `TRANSMUTATION MIN calamine 1000` sets one mineral's; `TRANSMUTATION MIN calamine DEFAULT` puts it back on the default.

`TRANSMUTATION FORGET HERE CONFIRM` (or `FORGET <area> CONFIRM`) drops what it knows of an area, so the next room there is looked up again: for an area marked empty by mistake.

`TRANSMUTATION RESET` clears what's out, forgets the rooms extracted this session, and reloads the saved state.

## Setting it up

1. **Import `transmutation.nxs`** (see [Getting started](getting-started.md)). It needs the Extraction ability of Transmutation.
2. **Set your minimums**: a default, and any mineral you need more or less of.
3. **`TRANSMUTATION ON`**: it reads your rift and starts with the next mountain or underground room you enter.

## Daily use

Turn it on when you go out to extract, walk the areas whose mineral you need, and turn it off when you're done.

## Working with other packages

Transmutation reads nothing from other packages. It waits its turn while any other package has a command out, which keeps it apart from **gathering** and **harvesting** in the same room.

## Troubleshooting

- **It extracts nothing.** Check it's on (`TRANSMUTATION`), the room is a mountain or underground one, the area's mineral is known (`TRANSMUTATION AREAS`) and short. `TRANSMUTATION DEBUG` shows what it wants and, in `waitingOn`, a package it's waiting for.
- **An area shows "no minerals" but has some.** `TRANSMUTATION FORGET HERE CONFIRM` and walk on.
- **It keeps extracting something you have plenty of.** The stock it knows may be old: `TRANSMUTATION STOCK`.
