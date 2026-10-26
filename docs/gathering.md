# Gathering

*Gathers the materials your rift is short of as you walk, and stores them, one after another.*

<!-- loom:version gathering -->
*This page describes gathering 0.1.0.*
<!-- /loom:version -->

## What it is

Gathering is to the Gathering trade skill what [harvesting](harvesting.md) is to herbs. With it on, every room you enter is checked: of the materials this kind of environment gives, the ones whose stock in your rift is **below its minimum** are gathered (`GATHER FRUIT`, `GATHER CLAY`…), one at a time, and each is put straight into the rift (`INR`). Seeds that come with fruit, vegetables or nuts, and gold flakes found in clay, go into the rift too.

| Environment | Materials |
| --- | --- |
| Jungle | fruit, cacao |
| Garden | fruit, vegetables |
| Grasslands | grain, sugarcane |
| Valley | olives |
| Forest | nuts |
| Natural underground | lumic, dust |
| River | clay |

Saltwater, eggs and milk are left to you: they need an empty vial, and `GATHER FROM FARM` gives eggs or milk at random.

It knows your stock from your rift: `GATHERING ON` (or `GATHERING STOCK`) reads it with `IR INGREDIENTS`, and every "You store N …" and "You remove N …" line keeps it up to date. Where a material's rift name differs from the word you gather it with (vegetables are stored as "vegetable"), it learns the rift name from the first `INR`.

Every material has a minimum: 500 by default, or one you set for it.

A gather that brings nothing (the room has none left, or none suitable) moves on to the next material at the following prompt, whatever the game said. Gathering waits for balance and equilibrium, and while another package has a command out (harvesting in the same room, Here's probe…), so it never answers a line meant for someone else: in a room that gives both herbs and materials, harvesting goes first.

It sends nothing while Loom is paused (`LOOM PAUSE ON`), and it loads off: every session starts with `GATHERING ON`.

## Commands

<!-- loom:commands gathering -->
| Command | What it does |
|---|---|
| `GATHERING` | status: what is below its minimum |
| `GATHERING ON\|OFF` | ON also reads your rift (IR INGREDIENTS); loads OFF |
| `GATHERING MIN <n>` | default minimum for every material (default 500) |
| `GATHERING MIN <material> <n>` | minimum for one material (DEFAULT to go back to the default) |
| `GATHERING STOCK` | re-read your rift now |
| `GATHERING RESET` | clear the queue, reload saved state |
| `GATHERING DEBUG` | internal state |
| **Materials: fruit, cacao (jungle); fruit, vegetables (garden); grain, sugarcane (grasslands); olives (valley); nuts (forest); lumic, dust (natural underground); clay (river).** | |
| **Saltwater, eggs and milk are left to you: they need an empty vial, and GATHER FROM FARM gives either.** | |
<!-- /loom:commands -->

`GATHERING` lists what's below its minimum. `GATHERING MIN 800` sets the default minimum for every material; `GATHERING MIN olives 1000` sets one material's; `GATHERING MIN olives DEFAULT` puts it back on the default. A material can be named as you gather it or as your rift lists it (olives or olive).

`GATHERING RESET` clears the queue (after a gather that went wrong, say) and reloads the saved state.

## Setting it up

1. **Import `gathering.nxs`** (see [Getting started](getting-started.md)). It needs the Gathering skill's abilities for the materials you want.
2. **Set your minimums**: a default, and any material you need more or less of.
3. **`GATHERING ON`**: it reads your rift and starts with the next room you enter.

## Daily use

Turn it on when you go out to gather, walk through the right environments, and turn it off when you're done. Each material is tried once per visit to a room; walk out and back in to try again.

## Working with other packages

Gathering reads nothing from other packages. It waits its turn while any other package has a command out, which keeps it and **harvesting** apart: both see the same "You reach out and carefully harvest …" line, and each answers only what it sent itself.

## Troubleshooting

- **It gathers nothing.** Check it's on (`GATHERING`), your rift has been read (`GATHERING STOCK`), and the room's environment gives the material. `GATHERING DEBUG` shows the queue and, in `waitingOn`, a package it's waiting for.
- **It keeps gathering something you have plenty of.** The stock it knows may be old: `GATHERING STOCK` reads the rift again.
- **It got stuck mid-queue.** `GATHERING RESET`.
