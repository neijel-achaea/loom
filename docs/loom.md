# Loom

*The suite package: lists what's installed, checks for updates, holds every integration between packages, and a few shared helpers.*

<!-- loom:version loom -->
*This page describes loom 0.7.12.*
<!-- /loom:version -->

## What it is

Every other package works on its own. The **loom** package is what ties them together, and it's the first one to import:

- **`LOOM`** lists the packages installed, with their versions and the command each answers to. A package you uninstalled drops off at once (LOOM checks Nexus's own package list), and a retired package still installed (crystalism, artificing, elementalism, roleplay) is named in orange, with what replaces it.
- **Updates.** `LOOM UPDATES` compares your packages with the newest builds on GitHub and lists the ones that are behind. The same check runs once at login, silently unless something is out of date or a retired package is still installed.
- **Integrations.** Every link between two packages lives here: social's colours in the Here tab, ledger reminders from harvesting, coffers goals from huntstats, and the rest (the full list is below). `LOOM LINKS` shows each one's state; `LOOM LINK <id> OFF` switches one off.
- **Pause.** `LOOM PAUSE ON` stops every package from sending commands to the game, for anything that something sent would interrupt. Loom also pauses by itself while you sleep, meditate or wade into the Mnemosyne, and resumes when you're done.
- **Quitting.** `QUIT` (or `QQ`) files the hunt under way in huntstats, puts your herbs in the rift (`INR ALL`) and your gold in your backpack (`PG`, with security), then quits.
- **Small helpers.** It agrees on its own to converting up to 100 bound credits into lessons, and highlights a few lines (a new level reached by someone, renown gained).

## Commands

<!-- loom:commands loom -->
| Command | What it does |
|---|---|
| `LOOM` | packages loaded, with version and command |
| `LOOM UPDATES` | packages here that are older than on GitHub |
| `LOOM UPDATES AUTO ON\|OFF` | the same check once at login, silent when all is current |
| `LOOM PAUSE ON\|OFF` | stop packages sending commands (interruptible actions) |
| `LOOM DEBUG ON\|OFF` | debug notices |
| `LOOM ROOM` | current room id, name, area and environment |
| `LOOM LINKS` | integrations between packages, on, off or waiting for a package |
| `LOOM LINK <id> ON\|OFF` | switch one integration |
| `LOOM THEME` | the tabs' colour theme and the cities to choose from |
| `LOOM THEME <city>\|AUTO\|OFF` | one city's colours, your own city's (default) or each tab's own |
| `LOOM PERF [seconds]` | measure what each package costs while you play (default 60 s), then report |
| `LOOM PERF STOP` | end the sample now and report |
| `LOOM PERF DATA` | how much saved data each package keeps |
<!-- /loom:commands -->

`LOOM DEBUG ON` shows the debug notices packages print about what they send. `LOOM ROOM` prints the current room's number, name, area and environment, handy for reports.

## Integrations

Since Loom 0.5, packages installed together feed each other. Neither package knows about the other: loom reads what one publishes and either answers a question the other's tab asks (a colour, a standing, a flag), or writes through its entry point (a ledger reminder, a proposed coffers goal, a suggested standing).

How they behave:

- A link is **on as soon as both its packages are installed**. `LOOM LINKS` lists every link: on, off, or waiting for a package you don't have.
- **They only suggest.** Ledger reminders can be marked done or dropped, coffers goals wait for `COFFERS ACCEPT`, standings dealings for `STANDINGS OK`.
- **`LOOM LINK <id> OFF`** switches one off and takes back whatever it added; it stays off across reloads until you switch it on again.

Every link:

<!-- loom:links all -->
| Link | From | To | What it does |
|---|---|---|---|
| `social-room` | [social](social.md) | [room](room.md) | Players in the Here tab in their highlight colours |
| `social-comms` | [social](social.md) | [comms](comms.md) | Names in the Comms tab in their highlight colours |
| `standings-online` | [standings](standings.md) | [social](social.md) | Your standing with each person in the Online tab |
| `standings-comms` | [standings](standings.md) | [comms](comms.md) | Your standing with a talker, on hover in the Comms tab |
| `standings-login` | [standings](standings.md) | [social](social.md) | Your standing's icon in the 'has awoken' notice |
| `patrolling-room` | [patrolling](patrolling.md) | [room](room.md) | Shrines and totems in Here coloured by their god's stance |
| `harvesting-ledger` | [harvesting](harvesting.md) | [ledger](ledger.md) | A harvest run reminder in the ledger when plant stock runs low |
| `talpieces-ledger` | [talpieces](talpieces.md) | [ledger](ledger.md) | Ledger reminders for complete talisman sets and spare pieces |
| `magi-ledger` | [magi](magi.md) | [ledger](ledger.md) | A collect pearls reminder in the ledger when crystals run low |
| `sigils-room` | [sigils](sigils.md) | [room](room.md) | Monoliths in Here; warns of a city room without one, or one outside the city |
| `sigils-ledger` | [sigils](sigils.md) | [ledger](ledger.md) | A sigil patrol in the ledger, due when the first flagged monolith runs out |
| `standings-social` | [standings](standings.md) | [social](social.md) | Names coloured by standing band, when SOCIAL COLOURS STANDINGS is chosen |
| `harvesting-room` | [harvesting](harvesting.md) | [room](room.md) | The environment's plants in Here: stocked, low or missing (needs PATROLLING ON) |
| `huntstats-coffers` | [huntstats](huntstats.md) | [coffers](coffers.md) | A gold goal 10% over your average hunt in an area, when you start hunting there |
| `self-ledger` | [self](self.md) | [ledger](ledger.md) | Explore a new area, when your explorer rank drops while you play |
| `dmgchart-huntstats` | [dmgchart](dmgchart.md) | [huntstats](huntstats.md) | Damage taken per combat second and the biggest hit, per hunt and per area |
| `ledger-online` | [ledger](ledger.md) | [social](social.md) | A quill in the Online tab on people your open ledger items name |
| `ledger-login` | [ledger](ledger.md) | [social](social.md) | Your open ledger items about someone in their 'has awoken' notice |
| `huntstats-standings` | [huntstats](huntstats.md) | [standings](standings.md) | A small friendly dealing to review with people you hunted with for 30 minutes or more |
| `defcon-self` | [defcon](defcon.md) | [self](self.md) | The Self tab watches the defences DEFCON keeps up at its level |
| `coffers-standings` | [coffers](coffers.md) | [standings](standings.md) | A small friendly dealing to review with whoever gives you 5,000 gold or more (party skipped, via huntstats) |
| `room-social` | [room](room.md) | [social](social.md) | A green leaf in the Online tab on people last seen with a newbie title |
| `room-comms` | [room](room.md) | [comms](comms.md) | A green leaf on newbies' names in the Comms tab |
| `social-basher` | [social](social.md) | [basher](basher.md) | An enemy arriving ends the basher's run after the current fight |
| `basher-room` | [basher](basher.md) | [room](room.md) | Here shows the basher's kill order and state |
| `magi-room` | [magi](magi.md) | [room](room.md) | Pearl-dropping oysters and pearls shown green in Here |
| `partycomms-room` | [partycomms](partycomms.md) | [room](room.md) | Party members' targets shown on the mobs in Here |
| `room-basher` | [room](room.md) | [basher](basher.md) | The basher skips mobs that are someone's loyal (found by Here's probe) |
<!-- /loom:links -->

Each package's page explains its links in more detail.

## Tab themes

Every custom tab can take one city's colours, so the tabs read as one family. By default the theme follows your city: Loom notes it at login, and a cityless character keeps each tab's own colours.

| City | Colours |
| --- | --- |
| Ashtan | purples |
| Cyrene | blues |
| Eleusis | forest greens |
| Hashan | steel greys |
| Mhaldor | oxblood reds |
| Targossas | golds |

- `LOOM THEME <city>` uses that city's colours whatever your city is.
- `LOOM THEME AUTO` goes back to following your city.
- `LOOM THEME OFF` gives each tab its own colours, as before themes existed.

A theme changes each tab's accent, headings, text, rules, bar tracks and background. Colours that mean something never change: good, warning and bad states, standings bands, social group colours, the target glow, gold, damage dealt and taken, dragon colours. The tabs redraw as soon as the theme changes.

## Measuring what packages cost

If the client ever feels slow, `LOOM PERF` shows where the time goes. It measures for a minute (`LOOM PERF 120` for longer, `LOOM PERF STOP` to end early) while you play as usual, hunting or walking, then prints a report:

- **The totals:** game lines and GMCP messages seen, and how much of the time package scripts and trigger patterns took. A game line's time is split into the patterns tried, the trigger scripts they ran and the client's own work.
- **Per package:** time in its scripts, how many ran, time its trigger patterns took to test against every line, and its slowest single call.
- **The costliest scripts:** function, trigger or alias, with count, total, average and worst.
- **GMCP:** the costliest message types, counting the client's own handling and every package's `onGMCP`.
- **Saved data:** how much each package keeps, and its largest variable. `LOOM PERF DATA` shows just this, at once.

A call over 16 ms (one frame at 60 fps) shows in yellow. Times count each script on its own: a function called from another counts under its own name. Nothing is measured outside a sample, so `LOOM PERF` costs nothing the rest of the time; during one, measuring adds a little to every figure.

## Setting it up

1. **Import `loom.nxs`** first (see [Getting started](getting-started.md)).
2. **Type `LOOM`** to see what's installed, and `LOOM LINKS` to see what's connected.

## Daily use

Mostly nothing: Loom works in the background. Use `LOOM PAUSE ON` before anything that mustn't be interrupted and isn't already handled, `QUIT` to log off tidily, and `LOOM UPDATES` now and then (or watch for its login notice).

## Troubleshooting

- **A package is missing from `LOOM`.** It may predate the registry: the retired **groves** and **reclamation** don't register, so `LOOM` and `LOOM UPDATES` don't see them.
- **`LOOM` says a package is retired.** It has been replaced or removed (crystalism and artificing by **magi**, elementalism and roleplay with nothing); uninstall it in Nexus's package manager. Its settings have already moved to the package that replaced it.
- **Nothing is being sent.** Loom may be paused: `LOOM PAUSE OFF`. It pauses itself while you sleep or meditate.
- **An integration does nothing.** `LOOM LINKS` shows whether it's on, off or waiting for a package.
- **The client feels slow.** `LOOM PERF` while it happens, then report the package at the top with a [bug report](https://github.com/neijel-achaea/loom/issues/new/choose).
- **The tab theme isn't your city's.** Loom learns your city at login, so log in again once after installing it, or choose one by hand with `LOOM THEME <city>`. `LOOM THEME` says which theme is in use and why.
