# Security

*Puts back what thieves take, keeps your gold in your backpack, and lets selfishness stay up without getting in the way of giving and selling.*

<!-- loom:version security -->
*This page describes security 0.2.4.*
<!-- /loom:version -->

## What it is

Security does three things:

- **Antitheft.** With `SECURITY ANTITHEFT ON`, a watched item that comes off ("You remove a silver ring.") is worn again at once, with a red "WARNING: potential theft" in the main window, and gold taken out of your backpack is put straight back in.
- **Gold in the backpack.** `GG` takes all your gold out of the backpack, `GG 500` just 500 sovereigns. Antitheft stays on: it knows that withdrawal is yours and lets it through. `PG` puts the gold back in and turns antitheft on. Hunting's autogold puts the gold it picks up into the backpack too.
- **Selfishness without the hassle.** Selfishness stops others taking your things, but it also stops you giving them. `GIVE`, `SELL`, `DROP` and `OFFER` go through Security: when selfishness is up, it's lowered (generosity), the action is done, and selfishness is raised again, all queued on equilibrium.

## Commands

<!-- loom:commands security -->
| Command | What it does |
|---|---|
| `SECURITY` | status |
| `SECURITY ANTITHEFT ON\|OFF` | put back worn items and gold that get taken |
| `GG [amount]` | get gold out of the backpack: all of it, or that many sovereigns |
| `PG` | put gold back into the backpack and turn antitheft on |
| `SECURITY BACKPACK <id> = <desc>` | your backpack: its id, and how it reads in "You remove ..." |
| `SECURITY ITEMS` | worn items antitheft watches |
| `SECURITY ITEM ADD <wear> = <desc>` | watch an item, e.g. wear ring123 = a silver ring |
| `SECURITY ITEM DEL <n>` | stop watching item n |
| `SECURITY HOUSE IN\|OUT` | send your house state command |
| `SECURITY HOUSE SET IN\|OUT <cmd>` | set it |
| `GIVE / SELL / DROP / OFFER` | lift selfishness around the action when it is up |
| `SECURITY DEBUG` | internal state |
<!-- /loom:commands -->

### Your backpack

`SECURITY BACKPACK 123456 = a leather backpack` tells Security which container is your backpack: its number, and how the game names it in "You remove…" lines, so removing the backpack itself is caught too.

### Watched items

`SECURITY ITEM ADD wear ring123 = a silver ring` watches an item: the first part is the command that puts it back on, the second how the game names it when it comes off. `SECURITY ITEMS` lists them, numbered; `SECURITY ITEM DEL 2` stops watching one.

### Your house

`SECURITY HOUSE SET IN <command>` and `SET OUT <command>` store the two commands you use to set your house state (whatever your house uses); `SECURITY HOUSE IN` and `OUT` send them.

### Giving and selling

Use the commands as you would in the game: `GIVE 100 gold to Ana`, `SELL sword`, `DROP rat`, `OFFER corpse`. With selfishness down, they go straight through.

## Setting it up

1. **Import `security.nxs`** (see [Getting started](getting-started.md)).
2. **Set your backpack**: `SECURITY BACKPACK <number> = <how it reads>`.
3. **Watch your valuable worn items**: `SECURITY ITEM ADD <wear command> = <how it reads>` for each.
4. **`PG`** to put your gold away and turn antitheft on.

If you used the older antitheft reflexes, Security carries their settings over the first time it loads.

## Daily use

Keep antitheft on and your gold in the backpack. Before buying something, `GG` (or `GG 2000` for just what you need); afterwards, `PG` for the change. Give, sell, drop and offer as usual.

## Working with other packages

| Package | How |
| --- | --- |
| hunting | Autogold puts gold into the backpack Security knows. |
| self | After a mid-session import, Security borrows Self's defence list to know whether selfishness is up (the game only sends defences at login or on `DEF`). |

## Troubleshooting

- **A watched item isn't put back.** The text after "You remove " must match what you gave as its description, exactly. Check the game's line.
- **`GIVE` doesn't lower selfishness.** Security doesn't know selfishness is up yet: `DEF` tells it.
- **Gold keeps going back into the pack.** Antitheft is on and the gold came out some other way than `GG` (typing the game's `GET` yourself, say). Use `GG`, or `SECURITY ANTITHEFT OFF` while you sort things out.
