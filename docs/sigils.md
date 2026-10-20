# Sigils

*A watcher for your city's monoliths and flame sigils: which rooms are running out, and what renewing them will cost.*

<!-- loom:version sigils -->
*This page describes sigils 0.2.8.*
<!-- /loom:version -->

## What it is

A city's monolith sigils, and the flame sigils attached to them, wear out over the months. Sigils keeps track of them as you walk:

- With `SIGILS WATCH ON`, every room you enter is probed (`PROBE MONOLITH HERE`): how many months of usefulness the monolith has left, and whether its flame sigil is attached and for how long.
- A room whose monolith or flame has **fewer months left than your threshold** (10 by default), or is missing one, is **flagged**, with a line in the main window: "[sigils] Moon Square (12345) -- monolith 6 months, no flame sigil". When a flagged room reads well again, it says "all good now" and unflags it.
- `SIGILS REPORT` lists the flagged rooms, monoliths and flames separately, with an **estimated cost** to renew them.

A sigil month is an Achaean month (25 Achaean days, about a day of real time).

## Commands

<!-- loom:commands sigils -->
| Command | What it does |
|---|---|
| `SIGILS` | status |
| `SIGILS WATCH [ON\|OFF]` | probe the monolith in every room you enter |
| `SIGILS REPORT` | rooms under the threshold, with estimated cost |
| `SIGILS CHECK` | probe this room once |
| `SIGILS IGNORE [HERE\|id]` | skip a room (no argument: list ignored rooms) |
| `SIGILS UNIGNORE HERE\|id` | watch a room again |
| `SIGILS THRESHOLD [n]` | flag sigils with fewer than n months left |
| `SIGILS COST [MONOLITH\|FLAME n]` | prices used in the report |
| `SIGILS CLEAR` | wipe the flagged list |
| `SIGILS RESET` | clear the queue, restore missing defaults |
| `SIGILS DEBUG` | internal state |
<!-- /loom:commands -->

### Thresholds and prices

`SIGILS THRESHOLD 15` flags anything with fewer than 15 months left. The report's cost estimate uses your prices for one monolith (1,500 by default) and one flame (500): `SIGILS COST MONOLITH 1800`, `SIGILS COST FLAME 600`.

### Rooms to leave alone

Some rooms have no monolith on purpose, or don't concern you. `SIGILS IGNORE HERE` (or `SIGILS IGNORE <room number>`) skips a room: it's never flagged, and the Here tab doesn't warn about it. `SIGILS IGNORE` lists them; `SIGILS UNIGNORE HERE` watches it again.

`SIGILS CLEAR` wipes the flagged list, to start a survey fresh.

## Setting it up

1. **Import `sigils.nxs`** (see [Getting started](getting-started.md)).
2. **Set your threshold and prices** if the defaults don't suit your city.
3. **`SIGILS WATCH ON`** while you patrol your city, and `OFF` when you leave: every room you enter is probed while it's on.

If your city used the older Eleusis monolith watcher (`mono_*` variables), its settings and flagged rooms are copied over the first time Sigils loads.

## Daily use

Walk your city with `SIGILS WATCH ON`, then `SIGILS REPORT`:

```
ELEUSIS SIGIL REPORT
Rooms with less than 10 months of usefulness left.

EXPIRING MONOLITH SIGILS (2)
…
```

Renew what's on it. Rooms re-read as fine drop off the list by themselves as you pass them.

Nothing is sent while Loom is paused (`LOOM PAUSE ON`).

## Working with other packages

Sigils reads nothing from other packages. With others installed, Loom's integrations use what it finds. Each is a link, on as soon as both packages are installed; `LOOM LINKS` lists them, `LOOM LINK <id> OFF` switches one off.

| Link | With | What it does |
| --- | --- | --- |
| `sigils-room` | room | Monoliths marked ▮ in the Here tab. In a city (Targossas, Cyrene, Hashan, Ashtan, Mhaldor, Eleusis), a room without one gets "⚠ no monolith" in the header (unless ignored); a monolith outside a city is flagged too. |
| `sigils-ledger` | ledger | One ledger item, "Sigil patrol: N monoliths to renew (M missing), first <room> (<number>)", due on the Achaean day the first flagged monolith runs out. Flames don't count toward it. It goes when nothing is flagged. |

## Troubleshooting

- **A room isn't probed.** Check `SIGILS WATCH` is on and Loom isn't paused. `SIGILS CHECK` probes the room you're in.
- **Probes pile up in a fast walk.** A probe whose answer was lost is dropped after 15 seconds; `SIGILS RESET` clears the queue.
- **A room keeps being flagged as missing a monolith.** If that's intended, `SIGILS IGNORE HERE`.
