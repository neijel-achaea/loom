# Room

*The Here tab: the room you're in, who and what is in it, and your target, live.*

<!-- loom:version room -->
*This page describes room 0.1.18.*
<!-- /loom:version -->

## What it is

Room draws a tab called **Here** that replaces Nexus's stock Room tab. It shows the room you stand in, the players and mobs in it, and the items on the floor, and keeps them current as people come and go and mobs die.

Everything comes from the game itself (GMCP), so there's nothing to configure. The only exceptions are a few game lines GMCP doesn't cover (someone flying up or landing, the game confirming a new target), which Room reads as well.

What you see, top to bottom:

- **The room:** its name, area and environment, the room's details as small tags (indoors, a shop, a bank…), the exits and the room number.
- **The description**, folded to two lines. Click it to unfold it, click again to fold it.
- **Players** here, yourself left out, alphabetical. Hover a name for the player's full title. Your target glows red.
- **Mobs**, one row each in the room's own order: the order the game uses when you target by name, so the next row down is the next mob `kill rat` would hit. Your target glows yellow in place, with its health. Dead ones are greyed out.
- **Items**, duplicates on one row with their count. Things you can pick up stand out; fixtures are muted.

## Commands

<!-- loom:commands room -->
| Command | What it does |
|---|---|
| `ROOM` | the room in a line, and how the description starts |
| `ROOM DESC OPEN\|FOLDED` | show the description in full, or folded to two lines (clicking it flips it too) |
| `ROOM DEBUG` | the last room GMCP payloads, as they came |
| **The Here tab replaces the stock Room tab: create a custom tab named Here, then close the stock one from the layout if you like.** | |
<!-- /loom:commands -->

`ROOM` on its own sums the room up in one line ("Grove of the Ancients (12345), Eleusis: 2 players, 3 mobs, 4 items.") and says how the description starts. `ROOM DESC OPEN` is for players who want the whole description every time; clicking the description still flips it for the moment. `ROOM DEBUG` prints the last room messages the game sent, as they came: paste them with a bug report.

## Setting it up

1. **Import `room.nxs`** (see [Getting started](getting-started.md)).
2. **Create the tab.** Add a custom tab named exactly **`Here`**. If it doesn't appear, reset the UI layout. Its amber icon shows after a page reload. You can then close Nexus's own Room tab from the layout, if you like.
3. **Move or `LOOK`.** The tab fills on the first room the game reports.

It's called Here because Nexus already has a tab called Room, and two tabs with one name don't get along.

## Daily use

Keep Here open beside the main window and glance at it instead of reading the room text.

- **Targeting.** The glow follows whatever changed last: the `tar` variable (your targeting keys and aliases), the game's own target (`ST`, `SETTARGET`), or the line "Your target is now: …". If you target a word, the glow sits on the first living mob whose name holds it, as the game would pick it, so you can see who your next attack lands on. A player whose name matches wins over a mob that merely contains the word.
- **What's next.** Because mobs keep the room's order, one row each, the row under your target is the next one a name would hit after it dies.
- **Who's here.** A player arriving or leaving updates the list at once, flying ones included.
- **Newbies.** Players carrying a newbie title (Uaithne, Ithin or Tuqad) get a small green leaf after their name; hover it for the title.

Room also remembers who it has seen with a newbie title, in rooms and in `CWHO`'s citizen list, and forgets them once it sees them without one. The Online and Comms tabs use that list for their own leaves (see below).

## Working with other packages

Room reads nothing from other packages on its own. With others installed, Loom's integrations add to the tab. Each is a link, on as soon as both packages are installed; `LOOM LINKS` lists them, `LOOM LINK <id> OFF` switches one off.

| Link | With | What it does in Here |
| --- | --- | --- |
| `social-room` | social | Players in their social group's colour, the group added to the hover. |
| `patrolling-room` | patrolling | Shrines and totems of gods you've sorted with `PATROLLING GODS` are flagged: friendly ones green, hostile ones orange with a tinted row and a "⚠ hostile shrine" warning in the header. Neutral gods get no flag. |
| `sigils-room` | sigils | Monoliths marked ▮. In a city (Targossas, Cyrene, Hashan, Ashtan, Mhaldor, Eleusis), a room without one gets "⚠ no monolith" in the header, unless you told sigils to ignore it (`SIGILS IGNORE`). A monolith outside a city is flagged too. |
| `harvesting-room` | harvesting and patrolling | A small line under the description with the plants this environment should hold: **green** here and stocked, **yellow** here but below your minimum, **red** missing, with a "⚠ N plants missing" warning. It appears once patrolling's plant check has seen the room (with `PATROLLING ON`). Hover a plant for its stock and minimum. |
| `basher-room` | basher | Each living mob's place in the basher's kill order as a numbered badge (filled on your target, outlined in gold on the next one), types the basher ignores in this area dimmed, and the basher's state beside the room name (⚔ PRIMED, RUNNING or FLEEING). |

Room also feeds two links of its own:

| Link | With | What it does |
| --- | --- | --- |
| `room-social` | social | A green leaf in the Online tab on people last seen with a newbie title. |
| `room-comms` | comms | The same leaf on talkers' names in the Comms tab. |

With a link switched off, Here simply goes without that part; nothing else changes.

## Troubleshooting

- **The tab is empty.** No room has been reported yet: move, or type `LOOK`.
- **The tab doesn't appear at all.** The custom tab must be named exactly `Here`. Reset the UI layout if it still doesn't show.
- **Someone is listed who has left (or missing who's there).** A few ways of arriving or leaving send nothing Room can see. The next room you enter puts it right; if you can name the line the game showed, report it so Room learns it.
- **The wrong mob glows.** Room glows the first living mob whose name holds your target word, as the game picks it. If the game hit a different one, report it with `ROOM DEBUG` and the line that named the target.
