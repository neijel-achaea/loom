# DmgChart

*Damage dealt and taken by type, per fight and per recorded session, your critical hits, and how long your health will last.*

<!-- loom:version dmgchart -->
*This page describes dmgchart 0.3.6.*
<!-- /loom:version -->

## What it is

DmgChart reads the game's damage lines ("Damage dealt: 412 (cutting)." and "Health lost: 96 (fire).") and turns them into the **DmgChart** tab:

- **Two big figures**: damage dealt and taken per second in the current fight.
- **Two donuts**, one for each, split by damage type (cutting, fire, magic…). Bleeding counts as a type of its own.
- **Your hits as a table**: normal hits and each critical tier (crushing, obliterating, world-shattering…), with count, share and average damage, plus your biggest hit and hits a minute.
- **Health lasts**: while your health is falling, how many seconds it would last at the rate it fell over the last few seconds. A warning in the main window when that drops below 10 seconds.
- **Saved sessions** below: recordings you started and stopped, to look at later.

A **fight** ends after 6 seconds with no hit either way; the next hit starts a new one. Bleeding counts in the totals but doesn't keep a fight going.

## Commands

<!-- loom:commands dmgchart -->
| Command | What it does |
|---|---|
| `DMGCHART` | the fight in the tab, any recording, gap and saved sessions |
| `DMGCHART START [name]` | start recording a session |
| `DMGCHART END` | stop recording and save the session |
| `DMGCHART SHOW [#]` | show the recording, or saved session #, in the tab |
| `DMGCHART LIVE` | back to the live fight |
| `DMGCHART LIST` | the saved sessions |
| `DMGCHART DEL <#>` | delete saved session # |
| `DMGCHART GAP <seconds>` | quiet time that ends a fight (default 6; bleeding doesn't count) |
| `DMGCHART WINDOW <seconds>` | how far back health lasts looks (default 6) |
| `DMGCHART WARN [<seconds> \| OFF]` | warn in the main window when health lasts drops below this (default 10) |
| `DMGCHART RESET` | clear the live fight |
| `DMGCHART WIPE CONFIRM` | delete all saved sessions |
| `DMGCHART REBUILD` | rebuild from the saved variables (a recording resumes from its last checkpoint) |
| `DMGCHART DEBUG` | internal state |
<!-- /loom:commands -->

### Recording sessions

The live view shows the current fight only. To see a whole hunt, or compare two areas or weapons, record it:

1. `DMGCHART START Annwyn` starts a recording (the name is optional).
2. Hunt as usual. The tab shows the recording while it runs.
3. `DMGCHART END` stops and saves it.

`DMGCHART LIST` lists saved sessions; `DMGCHART SHOW 3` puts session 3 in the tab, `DMGCHART LIVE` goes back to the live fight, `DMGCHART DEL 3` deletes one. A recording survives a page reload: it carries on from its last checkpoint.

### Health lasts and the warning

Health lasts is your current health divided by how fast it really fell over the last 6 seconds (`DMGCHART WINDOW`), from the game's health readings, so heals count too. It only shows while health is falling, after a few seconds and a couple of hits.

When it drops below 10 seconds (`DMGCHART WARN 15` to change, `OFF` to silence it), the main window says so once: "[dmgchart] health lasts ~7.5s (losing 210/s over the last 6s)". It warns again only once you've recovered well above the threshold, so a sip that merely slows the fall doesn't repeat it. The warning follows the live fight even while a saved session is on screen.

### Tuning

| Command | Default | What it changes |
| --- | --- | --- |
| `DMGCHART GAP <seconds>` | 6 | quiet time that ends a fight |
| `DMGCHART WINDOW <seconds>` | 6 | how far back health lasts looks |
| `DMGCHART WARN <seconds>\|OFF` | 10 | when the warning fires |

## Setting it up

1. **Import `dmgchart.nxs`** (see [Getting started](getting-started.md)).
2. **Create the tab.** Add a custom tab named exactly **`DmgChart`**. If it doesn't appear, reset the UI layout. The crossed-blades icon shows after a page reload.
3. **Fight something.** The tab fills with the first damage line. If no "Damage dealt" or "Health lost" lines appear in your game at all, DmgChart has nothing to read.

If you used the older damage chart (`dc_*` variables), its sessions move over the first time it loads.

## Daily use

- **Glance at the taken figure** in a new area: is it more than you can heal?
- **Watch for the health-lasts warning** in a hard fight: it's your cue to heal, flee or let the basher's wimpy do it.
- **Record a session** when trying a new area or a new weapon, and compare the dps and crit tables afterwards.

## Working with other packages

DmgChart reads nothing from other packages. With **huntstats** installed, it feeds it (link `dmgchart-huntstats`): the damage you took per second of combat and the biggest hit, for each hunt and each area, coloured against how much you can heal (see [huntstats](huntstats.md#damage-taken)). DmgChart keeps that record in memory only, from the page load on, so a hunt the page reloaded in the middle of has no damage figures. `LOOM LINK dmgchart-huntstats OFF` switches it off.

## Troubleshooting

- **The tab stays empty.** DmgChart reads the game's "Damage dealt" and "Health lost" lines. `DMGCHART DEBUG` shows what it has counted.
- **A fight splits in two.** The quiet time between hits was longer than `DMGCHART GAP`; raise it.
- **Health lasts doesn't show.** It only shows while your health is falling, after a few seconds of the fight.
- **`DMGCHART WIPE CONFIRM`** deletes every saved session. There's no undo.
