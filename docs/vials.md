# Vials

*Refill your vials from the rift by elixir name, without remembering which vial holds what.*

<!-- loom:version vials -->
*This page describes vials 0.2.3.*
<!-- /loom:version -->

## What it is

Refilling from the rift needs the vial's number: `FILL VIAL12345 WITH HEALTH FROM RIFT`. Vials remembers which vial holds which elixir (or salve), so you only name the elixir:

- `VIALS REFILL health` fills your health vial from the rift.
- `VIALS REFILL ALL` fills every vial it knows.

It learns your vials from the game's `ELIXLIST` (`VIALS LEARN`), or you tell it by hand. `VIALS` lists them, with sips left and months before they decay when they were learnt.

## Commands

<!-- loom:commands vials -->
| Command | What it does |
|---|---|
| `VIALS` | which vial holds which elixir, with sips and decay after a LEARN |
| `VIALS LEARN` | read your vials from ELIXLIST and set them all |
| `VIALS REFILL <elixir>` | fill that elixir's vial from the rift |
| `VIALS REFILL ALL` | fill every vial set |
| `VIALS SET <elixir> <vial> [...]` | which vial holds an elixir; several pairs on one line |
| `VIALS FORGET <elixir>` | stop tracking that vial |
| `VIALS DEBUG` | internal state |
| **VIALS LEARN replaces the list with what ELIXLIST shows. Nothing is sent while triggers are paused.** | |
<!-- /loom:commands -->

### Learning your vials

`VIALS LEARN` sends `ELIXLIST`, reads the table (hiding it), and **replaces** the list with what it shows: "an elixir of health" and "a salve of mending" are filed under health and mending, "an epidermal salve" under epidermal. Empty vials are skipped; if you carry two vials of one elixir, the fuller one is kept. A fluid it can't name is reported, so you can set it by hand.

### Setting vials by hand

`VIALS SET health 12345 mana 23456` sets several at once (elixir, then vial number). `VIALS FORGET health` stops tracking one.

## Setting it up

1. **Import `vials.nxs`** (see [Getting started](getting-started.md)).
2. **`VIALS LEARN`** with your vials on you.

Vials replaces loom's old `REFILLVIAL` command.

## Daily use

At a rift, `VIALS REFILL ALL`. After buying or reshuffling vials, `VIALS LEARN` again. Nothing is sent while Loom is paused (`LOOM PAUSE ON`).

## Working with other packages

Vials reads nothing from other packages and nothing reads it.

## Troubleshooting

- **A vial isn't filled.** It must be on the list (`VIALS`) and the elixir in your rift.
- **`LEARN` missed a vial.** Empty ones are skipped on purpose; for a fluid it couldn't name, `VIALS SET <elixir> <vial>`.
