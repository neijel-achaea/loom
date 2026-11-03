# Atlas

*A map of the area you're in, from the community crowdmap, with the rooms you've explored as fog of war; and how much of each area you've explored.*

<!-- loom:version atlas -->
*This page describes atlas 0.10.0.*
<!-- /loom:version -->

## What it is

Atlas draws the area you're in, one level at a time, in a custom tab named **Atlas**, as a replacement for the stock Map tab. The map comes from the **Achaea crowdmap**, the map players keep up to date for Mudlet's IRE mapper ([IRE-Mudlet-Mapping/AchaeaCrowdmap](https://github.com/IRE-Mudlet-Mapping/AchaeaCrowdmap)): over 30,000 rooms in some 500 areas, more complete than the game's own map. Room and area numbers are the game's, so Atlas knows where you are from the game's room information.

- **The area you're in**, on your level. Rooms are squares in their environment's colour (the game's own, as on the stock map; hover a room for its name, number and environment), exits are lines between them, for the eight compass directions only. An exit into another area ends in an amber arrowhead (hover it for the area's name). Up, down, in and out are an arrow in the middle of the room, as on the stock map: ▲ up, ▼ down, ▶ in, ◀ out; up and down together make an hourglass, in and out the same on its side; a room with both kinds shows up/down on its left half and in/out on its right (hover a room for its exits by name).
- **Where you are.** The room you're in is ringed, and the map follows you as you move. Line 2 gives the room's name and number.
- **Fog of war.** When you enter an area, the game tells Nexus which of its rooms you've ever explored, and Atlas shows only those, like the stock map. The crowdmap doesn't always cut areas where the game does (a crowdmap area can hold rooms the game files under another area), so Atlas keeps every list the game sends and puts them together: walking from one part into the other changes nothing. An explored room shows the exits the game itself lists for it (the official map of the area, which Atlas reads when you enter it, and the room you're standing in): a short dotted line marks one that leads somewhere you haven't been. Exits only the crowdmap knows (hidden ones among them) show only when they lead to a room you've explored, so fog gives nothing away. Turn fog off (**FOG** on the title line, or `ATLAS FOG OFF`) to see every room on the map, the ones you haven't explored faint.
- **How much you've explored.** Line 2 reads *132 of 147 explored*: the game's count of rooms you've explored in this area, against the rooms the crowdmap knows there. The two don't always match the game's own idea of the area exactly (the crowdmap has rooms that don't count for exploration, and the other way round), so read it as close, not exact.
- **Levels.** In an area with several levels, the arrows by *level* look at the one above or below. Moving brings the view back to you.
- **Moving the map.** Drag to pan; the mouse wheel or **− +** zoom; **⌖** brings you back to the room you're in.
- **Your own marks.** Mark a room with an icon from a short list: `ATLAS MARK fishing` marks the room you're in, `ATLAS MARK 14001 bank` any room by number, and anything after the icon is a note (`ATLAS MARK sleep the inn upstairs`). The icon sits in a light circle at the room's bottom left corner, the note on hover; one mark per room, `ATLAS UNMARK [number]` takes it off and `ATLAS MARKS` lists them. Icons: fishing, shrine, sleep, bank, shop, craft, harvest, hunt, danger, star (a favourite) and secret; a few other words work too (inn, forge, herbs, key…). Marks are kept per character.
- **Places on no map.** Some places are on no map at all: the Mnemosyne, where every wade is your own instance and every ripple a fresh layout, or a brand-new spot the game has just added. There the game still tells which room you're in and its exits, so Atlas sketches the place as you walk: the title reads *off the map*, each room you enter is placed a step from the last in the direction you took, walked exits are lines and the others dotted. A fresh sketch starts when a ripple ends (at the boon screen), when you arrive somewhere no exit led to (back at a ripple's first room, a portal), or when a room comes back under another name (a new ripple reusing the same room numbers); stepping back onto the map forgets it. Clicks don't walk there: `PATH FIND` can't route through places the game keeps off its map. (The idea follows the Dementia Mapper in LEVI-Achaea, a Mudlet system.)
- **The wilderness.** The wilderness (ENTER WILDERNESS at its entry points) is millions of rooms on no map; the game draws its own map of it as you walk. In the wilderness Atlas shows that map in place of its own and takes it out of the main window. It's drawn as tiles: each spot a square in its colour (muted like Atlas's rooms), small pictures for the terrains Atlas knows (sea and rivers, plains, desert, hills, mountains, fields, woods, beaches, reefs, cities, bridges, ships; roads drawn as lines) and the game's other letters faint on top where they tell terrains apart, you ringed in amber and the ways out of the wilderness (the game's `?`) marked; `ATLAS WILDERNESS TEXT` shows the game's letters as sent instead (`TILES` to go back); the line under the title gives the room and its environment. Atlas asks Nexus for the same treatment its stock Map tab gets, so this works whichever tab is showing. The game publishes no legend for this map, so Atlas learns one as you walk: `ATLAS WILDERNESS LEGEND` lists every character seen this session with its colours and the environment of the rooms you stood on (send it in a bug report to get a picture for a terrain that has none). `ATLAS WILDERNESS OFF` leaves the map in the main window.
- **Walking.** Click a room to walk there with the game's `PATH FIND <number>`. Atlas sends it once and does nothing else.

### The Areas tab

A second custom tab, **Areas**, shows every area you've visited as a chip, as many to a row as the tab's width allows (two in a narrow tab): the area's name (two lines at most, the full name on hover), how much of it you've explored as a percentage, its area number (*#14*) and *132 / 147*, with a thin bar along the bottom (amber when complete). The area you're in is outlined and marked HERE.

- **Order.** **NAME · % · LEFT** on the title line orders the chips within each group: by name; by the percentage explored, least first (click **%** again for most first); or by rooms left to explore, most first, the quickest way to see where your explorer ranking has the most to gain. `ATLAS SORT NAME|LEAST|MOST|LEFT` does the same; the choice is kept.

- **Totals on top.** *In the areas you've visited*: the rooms you've explored in them, of the rooms the crowdmap has there. *Of the whole map*: the same rooms, of every room on the map.
- **Your own groups.** Areas carry no continent or region, so you group them yourself with tags: `ATLAS TAG HERE sapience` tags the area you're in, `ATLAS TAG granite hills sapience` one by name (the crowdmap's name or the game's, with or without "the", any case) and `ATLAS TAG 85 sapience` one by number. An area can have several tags and shows under each; the untagged ones come last. Each group heading gives the group's own totals and folds with a click. Tags are kept per character.
- **Not visited yet.** The game sends an area's explored rooms only when you enter it, so an area you haven't entered since installing Atlas has no figure yet. Those are listed, folded, under *not visited yet* (a plain list, with each area's number and rooms), never as 0%. Walk through an area once and its figure stays, saved for your character.
- **No exploration record.** Some places aren't counted for exploration by the game (inns and the like): when you walk into one, the game sends no explored rooms with it. Atlas notices, and such an area stays in its groups like any other, with a crossed-out map after its name and only its room count: no percentage, and it counts for no total. The Atlas tab says so on line 2, and shows all its rooms. Should the game ever send a list for one, it gets its figures like the rest.
- **Hidden areas.** Some of the crowdmap's areas aren't places to explore (player houses, manses). `ATLAS HIDE <area>` keeps one out of the list and the totals; it's listed, folded, under *hidden*, and `ATLAS UNHIDE` brings it back.
- **A click on an area** shows it in the Atlas tab, centred on its main level, without going there; ⌖ or your next step brings the map back to you.

The figures count the rooms on the crowdmap you've explored, by the game's own record, so a percentage never passes 100%. The game's exploration ranking counts rooms in its own way (some of the crowdmap's rooms don't count for it, and it has a few the crowdmap lacks), so read them as close, not as the game's figure.

### Where the map comes from

The first time, Atlas downloads the crowdmap (about 1 MB) from the project's own site on GitHub and keeps it in your browser. At every load after that it only checks the map's version number, and downloads it again when the crowdmap has changed. The copy in your browser is shared by every character you play on it. The game's environment names and colours come from each area's official map file on achaea.com, the same file the stock map loads when you enter an area; Atlas reads it once per area and remembers what it learns. Until it has, an environment is drawn in the crowdmap's colour, muted. Atlas downloads and never sends anything: nothing about you or your play leaves the game.

**The game's own map fills the gaps.** The crowdmap can lag behind changes to the game: a street rebuilt, a room added. The game's own map file for an area (the one Atlas reads for colours) is always current, though it lacks hidden exits and special paths. So when you enter an area, Atlas lays the game's file over the crowdmap: a room the crowdmap lacks is added (placed to line up with the crowdmap's rooms around it), and an exit the game lists replaces the crowdmap's in that direction; exits only the crowdmap knows are kept. What the game's files add is remembered in your browser, so the corrections stay after a reload. An area you haven't entered since installing shows the crowdmap as it is.

Corrections to the map go to the crowdmap project itself (its issues and pull requests), so every player using it gets them.

## Commands

<!-- loom:commands atlas -->
| Command | What it does |
|---|---|
| `ATLAS` | status: the map's version, fog of war, where you are and how much of the area you've explored |
| `ATLAS FOG [ON\|OFF]` | fog of war: only the rooms you've explored (default ON); OFF shows every room, unexplored ones faint |
| `ATLAS WILDERNESS [ON\|OFF]` | in the wilderness, the game's own map in the Atlas tab instead of the main window (default ON) |
| `ATLAS WILDERNESS TILES\|TEXT` | the wilderness map as tiles in Atlas's colours (default) or as the game's letters |
| `ATLAS WILDERNESS LEGEND` | the wilderness map's characters seen this session, with the environment of the rooms you stood on |
| `ATLAS WILDERNESS DUMP` | copy the last 8 wilderness maps as the game sent them, for a bug report |
| `ATLAS GO <room number>` | walk there (PATH FIND), as a click on a room in the tab |
| `ATLAS SORT [NAME\|LEAST\|MOST\|LEFT]` | order the Areas tab's chips: by name, least or most explored first, or most rooms left first (also NAME · % · LEFT in the tab; kept) |
| `ATLAS MARK [room number] <icon> [note]` | your own icon on a room (no number: the room you're in), bottom left corner; note on hover |
| `ATLAS UNMARK [room number]` | take a room's mark off |
| `ATLAS MARKS` | the icons (fishing, shrine, sleep, bank, shop, craft, harvest, hunt, danger, star, secret) and your marked rooms |
| `ATLAS AREAS` | how many areas you've visited and how much of them you've explored (the Areas tab lists them) |
| `ATLAS TAG <area\|number\|HERE> <tag> [tag…]` | group an area under your own tags in the Areas tab (one word each; e.g. sapience, meropis) |
| `ATLAS UNTAG <area\|number\|HERE> <tag>\|ALL` | take a tag off an area, or all of them |
| `ATLAS TAGS` | every tag in use, with how many areas carry it |
| `ATLAS HIDE <area\|number\|HERE>` | keep an area out of the Areas list and the totals (houses, manses…); UNHIDE brings it back |
| `ATLAS SHOW <area\|number>` | show an area in the Atlas tab without going there (as a click in the Areas tab) |
| `ATLAS RELOAD` | download the community map again (it's otherwise kept in this browser and updated when it changes) |
| `ATLAS DEBUG` | internal state |
| **The tabs are custom tabs named Atlas (the map) and Areas (exploration per area). Atlas: drag to pan, mouse wheel or - + to zoom, the arrows by 'level' look up and down.** | |
| **An area's name can be the community map's or the game's, with or without 'the', in any case: ATLAS TAG granite hills sapience.** | |
| **The map is the Achaea crowdmap, kept by players at github.com/IRE-Mudlet-Mapping/AchaeaCrowdmap.** | |
<!-- /loom:commands -->

## Setting it up

1. **Import `atlas.nxs`** (see [Getting started](getting-started.md)). The community map downloads at once; a lime notice says when it's in.
2. **Create custom tabs named `Atlas` and `Areas`** (exactly those names), and close the stock Map tab if you like.
3. Move, or `LOOK`: the map shows where you are.

## Daily use

Leave the tab open and it follows you. When you want to go somewhere in the area, drag the map to it and click the room. Turn fog off now and then to see what's left to explore. As you travel, tag each new area (`ATLAS TAG HERE <tag>`) and the Areas tab sorts itself out.

## Working with other packages

With other Loom packages installed, Loom's integrations put what they know on the map. Each is a link, on as soon as both packages are installed; `LOOM LINKS` lists them, `LOOM LINK <id> OFF` switches one off.

| Link | With | What it does |
| --- | --- | --- |
| `waypoints-atlas` | waypoints | A saved waypoint shows as a ⚑ (a red pennant on a light circle) at its room's top right corner; its name and note on hover. |
| `partycomms-atlas` | partycomms | Party members not in your room: a ring around their room like yours, the same size, in their own colour (several in one room share the ring, an arc each; names on hover). Members in another area, on another level or in a room you haven't explored are listed under the map, **Party elsewhere**, each with a dot in their colour and where they are; a click shows that room. Their colour is also on their Party chip. Needs partycomms 1.1.0 on their side, which sends the room. |
| `questbook-atlas` | questbook | The quest you're following: each GO step numbered at its room's top left corner, the step you're on in amber, the others in blue. Every quest you can start now: a gold **!** where its first GO step is. Hover for the quest's name. |

Markers show on the area and level drawn, on rooms the map shows (with fog of war, rooms you've explored). Clicking one walks there, as a click on its room.

## Troubleshooting

- **The tab says it couldn't load the community map.** Your browser couldn't reach the crowdmap's site. **RELOAD** in the tab (or `ATLAS RELOAD`) tries again; once one download has worked, Atlas keeps working from the copy in your browser.
- **Everything shows, no fog.** The game sends an area's explored rooms when you enter it. For the area you were in when Atlas loaded, that may have come before Atlas could read it: walk into another area and back.
- **This room isn't on the community map.** New or hidden rooms can be missing from the crowdmap. Atlas still shows the rest of the area.
- **A click doesn't walk.** `PATH FIND` needs a route the game knows (and stops at 100 rooms); try `PATH FIND <number>` yourself to see the game's answer. Nothing walks while Loom is paused (`LOOM PAUSE ON`).
