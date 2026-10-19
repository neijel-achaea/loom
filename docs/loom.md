# Loom

*The suite package: lists what's installed, checks for updates, holds every integration between packages, and a few shared helpers.*

<!-- loom:version loom -->
*This page describes loom 0.7.6.*
<!-- /loom:version -->

## What it is

Every other package works on its own. The **loom** package is what ties them together, and it's the first one to import:

- **`LOOM`** lists the packages loaded, with their versions and the command each answers to.
- **Updates.** `LOOM UPDATES` compares your packages with the newest builds on GitHub and lists the ones that are behind. The same check runs once at login, silently unless something is out of date.
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
| `social-comms` | [social](social.md) | [comms](comms.md) | Talkers in the Comms tab in their highlight colours |
| `standings-online` | [standings](standings.md) | [social](social.md) | Your standing with each person in the Online tab |
| `standings-comms` | [standings](standings.md) | [comms](comms.md) | Your standing with a talker, on hover in the Comms tab |
| `standings-login` | [standings](standings.md) | [social](social.md) | Your standing's icon in the 'has awoken' notice |
| `patrolling-room` | [patrolling](patrolling.md) | [room](room.md) | Shrines and totems in Here coloured by their god's stance |
| `harvesting-ledger` | [harvesting](harvesting.md) | [ledger](ledger.md) | A harvest run reminder in the ledger when plant stock runs low |
| `talpieces-ledger` | [talpieces](talpieces.md) | [ledger](ledger.md) | Ledger reminders for complete talisman sets and spare pieces |
| `crystalism-ledger` | [crystalism](crystalism.md) | [ledger](ledger.md) | A collect pearls reminder in the ledger when crystals run low |
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
| `crystalism-room` | [crystalism](crystalism.md) | [room](room.md) | Pearl-dropping oysters and pearls shown green in Here |
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

## Setting it up

1. **Import `loom.nxs`** first (see [Getting started](getting-started.md)).
2. **Type `LOOM`** to see what's installed, and `LOOM LINKS` to see what's connected.

## Daily use

Mostly nothing: Loom works in the background. Use `LOOM PAUSE ON` before anything that mustn't be interrupted and isn't already handled, `QUIT` to log off tidily, and `LOOM UPDATES` now and then (or watch for its login notice).

## Troubleshooting

- **A package is missing from `LOOM`.** It may predate the registry: the retired **groves** and **reclamation** don't register, so `LOOM` and `LOOM UPDATES` don't see them.
- **Nothing is being sent.** Loom may be paused: `LOOM PAUSE OFF`. It pauses itself while you sleep or meditate.
- **An integration does nothing.** `LOOM LINKS` shows whether it's on, off or waiting for a package.
- **The tab theme isn't your city's.** Loom learns your city at login, so log in again once after installing it, or choose one by hand with `LOOM THEME <city>`. `LOOM THEME` says which theme is in use and why.
