# Patrolling

*Room-by-room plant checks for patrols, an area to patrol next, and fire, lightning and replanting reports to your clan.*

<!-- loom:version patrolling -->
*This page describes patrolling 0.4.1.*
<!-- /loom:version -->

## What it is

Patrolling is for those who keep the land: checking that each room still holds the plants its environment should. Shrines and totems are marked in the Here tab, coloured by their god's stance (see Gods below).

With `PATROLLING ON`, every room you enter is checked quietly (`PLANTS`, its output hidden), and one line sums it up:

> [patrolling] Forest: missing ginseng, myrrh

Green when all is well, orange when plants are missing.

It also:

- **suggests an area to patrol** (`PATROLLING SUGGEST`), weighing how much each area is worth patrolling by how long it's been since you last did;
- with a clan set, **reports fires** you call (`PATROLLING FIRE`) and **lightning strikes** it sees to your clan, and **logs your replantings** to the clan log, dated on the Achaean calendar when ledger is installed;
- highlights "Vines have overtaken this location."

## Commands

<!-- loom:commands patrolling -->
| Command | What it does |
|---|---|
| `PATROLLING` | status |
| `PATROLLING ON\|OFF` | check every room you enter |
| `PATROLLING HERE` | check this room once |
| `PATROLLING LEARN` | print this room's plants as a table entry |
| `PATROLLING SUGGEST` | an area to patrol, weighed by worth and time since last |
| `PATROLLING STAMP [area]` | mark an area as patrolled (no area: the one you're in) |
| `PATROLLING FIRE` | tell your clan there's a fire here |
| `PATROLLING CLAN <clan\|OFF>` | clan for fire alerts, lightning reports and replanting logs |
| `PATROLLING GODS` | friendly and hostile gods; every other god is neutral |
| `PATROLLING GODS FRIENDLY <god>` | marked friendly in Here |
| `PATROLLING GODS HOSTILE <god>` | marked hostile in Here, with a warning in its header |
| `PATROLLING GODS NEUTRAL <god>` | take a god off the lists |
| `PATROLLING RESET / DEBUG` | reload the tables / internal state |
<!-- /loom:commands -->

### Checking rooms

`PATROLLING ON` checks every room you enter; `PATROLLING HERE` checks just this one. What each environment should hold comes from a table learnt from real `PLANTS` output. If Patrolling says it has "no expected list" for an environment, stand in a well-stocked room of that kind and `PATROLLING LEARN`: it prints the room's plants as a table entry to send in, so the table can grow.

### Choosing where to patrol

`PATROLLING SUGGEST` picks an area at random, weighted by how much it's worth patrolling and the hours since you last patrolled it (never patrolled counts as a week). When you finish one, `PATROLLING STAMP` marks the area you're in as patrolled; `PATROLLING STAMP <area>` marks another.

### Gods

Every god is neutral until you sort them:

- `PATROLLING GODS FRIENDLY Gaia`: Gaia's shrines and totems are marked friendly in the Here tab.
- `PATROLLING GODS HOSTILE Sartan`: marked hostile in the Here tab, with a warning (see below).
- `PATROLLING GODS NEUTRAL Sartan`: off the lists again.

`PATROLLING GODS` lists them.

### Your clan

`PATROLLING CLAN <clan>` names the clan that hears about fires and lightning and keeps the replanting log:

- `PATROLLING FIRE` sends "Fire at me! <room> (<number>) at <area>" on the clan channel.
- A lightning strike you see is reported as "Lightning strike at <area>".
- When you replant ("You reach down and dig a small hole for…"), the log gets "<date> - Replanted <plant> at <room> (<number>) in <area>".

`PATROLLING CLAN OFF` stops all three.

## Setting it up

1. **Import `patrolling.nxs`** (see [Getting started](getting-started.md)).
2. **Sort the gods** you care about: `PATROLLING GODS FRIENDLY <god>` for your own.
3. **Set your clan** if you report to one: `PATROLLING CLAN <clan>`.
4. **`PATROLLING ON`** and walk.

## Daily use

`PATROLLING SUGGEST`, walk there with Patrolling on, read the one-line report in each room, replant what's missing, and `PATROLLING STAMP` when you're done.

## Working with other packages

Patrolling reads **ledger**'s Achaean date, for the replanting log, when it's installed. With others, Loom's integrations use what it finds. Each is a link, on as soon as both packages are installed; `LOOM LINKS` lists them, `LOOM LINK <id> OFF` switches one off.

| Link | With | What it does |
| --- | --- | --- |
| `patrolling-room` | room | Shrines and totems in the Here tab coloured by their god's stance: friendly green, hostile orange with a tinted row and a "⚠ hostile shrine" warning in the header, neutral in the plain colour with the shrine icon. |
| `harvesting-room` | room and harvesting | After a check, the environment's plants on a small line under Here's description: green here and stocked, yellow here but low in your rift, red missing. Shown only for the room just checked. |

## Troubleshooting

- **"no expected list for '…'".** That environment isn't in the table yet: `PATROLLING LEARN` in a full room of that kind and send the line it prints.
- **A plant is reported missing that this environment never has.** The table is wrong for it; report it with the room's `PLANTS` output.
- **Nothing goes to the clan.** Set one with `PATROLLING CLAN`.
