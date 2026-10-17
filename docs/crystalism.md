# Crystalism

*For Crystalism users: refine stored facets evenly across your crystal shapes, pick up pearls, and open sonic portals for your city.*

<!-- loom:version crystalism -->
*This page describes crystalism 0.3.1.*
<!-- /loom:version -->

## What it is

Crystalism helps with the chores of the Crystalism skill:

- **Even refining.** `CRYSTALISM REFINE` reads your rift (`IR CRYSTAL`) and your stored facets (`TOUCH CRYSTAL`), then refines the facets into the shapes you have **fewest** of, so your stock levels out instead of piling up in one shape. It sends one `REFINE` every 1.5 seconds, at most 200 crystals a run (or fewer: `CRYSTALISM REFINE 50`), and `CRYSTALISM STOP` cancels it.
- **Pearls.** When a pearl tumbles out of a corpse, it's picked up (`CRYSTALISM PEARLS`, on by default).
- **Sonic portals.** With `CRYSTALISM PORTAL ON`, a city member who tells you "Gate." gets a sonic portal (`EMBED SONICPORTAL <name>`). Anyone not in your city gets a polite refusal. Off by default.
- **Attuning.** While you attune to your Master Crystal, anything sent would break it, so Loom's packages are paused until the crystal calls you back.

## Commands

<!-- loom:commands crystalism -->
| Command | What it does |
|---|---|
| `CRYSTALISM` | status |
| `CRYSTALISM REFINE [n]` | refine stored facets into the shapes you have fewest of (at most n crystals, 200 a run) |
| `CRYSTALISM STOP` | cancel a refine run |
| `CRYSTALISM MIN [<n> \| <shape> <n\|DEFAULT>]` | minimum stock per shape (default for all, or one shape) |
| `CRYSTALISM PEARLS ON\|OFF` | pick up pearls that drop from corpses |
| `CRYSTALISM PORTAL ON\|OFF` | open a sonic portal for city members who tell you "Gate." (needs social's city list) |
| `CRYSTALISM DEBUG` | internal state |
| **Triggers pause while you attune to the Master Crystal and resume when it calls you.** | |
<!-- /loom:commands -->

### Minimum stock

Every shape has a minimum: 50 by default. `CRYSTALISM MIN 80` sets the default; `CRYSTALISM MIN torus 120` one shape's; `CRYSTALISM MIN torus DEFAULT` puts it back. The minimums don't change how refining works (it always levels the lowest shapes first); they decide when the ledger reminds you to collect pearls (see below).

## Setting it up

1. **Import `crystalism.nxs`** (see [Getting started](getting-started.md)).
2. **For portals**, install **social** too and let it learn your city: the portal answers only names on social's city list. Then `CRYSTALISM PORTAL ON`.
3. **Run `CRYSTALISM REFINE` once** so the rift counts are known.

If you used the older autorefine reflex, Crystalism takes its place.

## Daily use

When facets have piled up, `CRYSTALISM REFINE` and let it work through them; `CRYSTALISM` shows how far it's got. Leave pearl pickup on while hunting.

## Working with other packages

| Package | How |
| --- | --- |
| social | Its city list decides who gets a sonic portal. Without social, nobody does. |
| ledger | Link `crystalism-ledger`: when a shape falls below 90% of its minimum, the ledger gets "Collect N pearls" (one pearl per 9 crystals short). It goes once every shape is back at its minimum. `LOOM LINK crystalism-ledger OFF` stops it. |
| room | Link `crystalism-room`: in the Here tab, barnacle encrusted oysters (the denizens that drop pearls) and glistening iridescent pearls lying in the room show with a green name and a green ◉. Corpses stay grey, and your target's glow still wins. `LOOM LINK crystalism-room OFF` stops it. |

## Troubleshooting

- **A refine run stalls.** It waits while Loom is paused (attuning pauses it until the Master Crystal calls). `CRYSTALISM STOP` and start again if needed.
- **The portal refuses a city member.** They aren't on social's city list yet: `SOCIAL LIST city`.
