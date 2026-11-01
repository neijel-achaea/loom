# Atlas

*A map of the area you're in, from the community crowdmap, with the rooms you've explored as fog of war.*

<!-- loom:version atlas -->
*This page describes atlas 0.1.2.*
<!-- /loom:version -->

## What it is

Atlas draws the area you're in, one level at a time, in a custom tab named **Atlas**, as a replacement for the stock Map tab. The map comes from the **Achaea crowdmap**, the map players keep up to date for Mudlet's IRE mapper ([IRE-Mudlet-Mapping/AchaeaCrowdmap](https://github.com/IRE-Mudlet-Mapping/AchaeaCrowdmap)): over 30,000 rooms in some 500 areas, more complete than the game's own map. Room and area numbers are the game's, so Atlas knows where you are from the game's room information.

- **The area you're in**, on your level. Rooms are squares in their environment's colour (the game's own, as on the stock map; hover a room for its name, number and environment), exits are lines between them, for the eight compass directions only. An exit into another area ends in an amber arrowhead (hover it for the area's name). Up, down, in and out are arrows inside the room: ▲ up, ▼ down, ◀ in, ▶ out (hover a room for its exits by name).
- **Where you are.** The room you're in is ringed, and the map follows you as you move. Line 2 gives the room's name and number.
- **Fog of war.** When you enter an area, the game tells Nexus which of its rooms you've ever explored, and Atlas shows only those, like the stock map. A short dotted line marks an exit to somewhere you haven't been. Turn fog off (**FOG** on the title line, or `ATLAS FOG OFF`) to see every room on the map, the ones you haven't explored faint.
- **How much you've explored.** Line 2 reads *132 of 147 explored*: the game's count of rooms you've explored in this area, against the rooms the crowdmap knows there. The two don't always match the game's own idea of the area exactly (the crowdmap has rooms that don't count for exploration, and the other way round), so read it as close, not exact.
- **Levels.** In an area with several levels, the arrows by *level* look at the one above or below. Moving brings the view back to you.
- **Moving the map.** Drag to pan; the mouse wheel or **− +** zoom; **⌖** brings you back to the room you're in.
- **Walking.** Click a room to walk there with the game's `PATH FIND <number>`. Atlas sends it once and does nothing else.

### Where the map comes from

The first time, Atlas downloads the crowdmap (about 1 MB) from the project's own site on GitHub and keeps it in your browser. At every load after that it only checks the map's version number, and downloads it again when the crowdmap has changed. The copy in your browser is shared by every character you play on it. The game's environment names and colours come from each area's official map file on achaea.com, the same file the stock map loads when you enter an area; Atlas reads it once per area and remembers what it learns. Until it has, an environment is drawn in the crowdmap's colour, muted. Atlas downloads and never sends anything: nothing about you or your play leaves the game.

Corrections to the map go to the crowdmap project itself (its issues and pull requests), so every player using it gets them.

## Commands

<!-- loom:commands atlas -->
| Command | What it does |
|---|---|
| `ATLAS` | status: the map's version, fog of war, where you are and how much of the area you've explored |
| `ATLAS FOG [ON\|OFF]` | fog of war: only the rooms you've explored (default ON); OFF shows every room, unexplored ones faint |
| `ATLAS GO <room number>` | walk there (PATH FIND), as a click on a room in the tab |
| `ATLAS RELOAD` | download the community map again (it's otherwise kept in this browser and updated when it changes) |
| `ATLAS DEBUG` | internal state |
| **The tab is a custom tab named Atlas. Drag to pan, mouse wheel or - + to zoom, the arrows by 'level' look up and down.** | |
| **The map is the Achaea crowdmap, kept by players at github.com/IRE-Mudlet-Mapping/AchaeaCrowdmap.** | |
<!-- /loom:commands -->

## Setting it up

1. **Import `atlas.nxs`** (see [Getting started](getting-started.md)). The community map downloads at once; a lime notice says when it's in.
2. **Create a custom tab named `Atlas`** (exactly that name), and close the stock Map tab if you like.
3. Move, or `LOOK`: the map shows where you are.

## Daily use

Leave the tab open and it follows you. When you want to go somewhere in the area, drag the map to it and click the room. Turn fog off now and then to see what's left to explore.

## Working with other packages

Atlas reads nothing from other packages yet. Its integrations (waypoints and quest steps on the map, Here's alerts) come in later versions.

## Troubleshooting

- **The tab says it couldn't load the community map.** Your browser couldn't reach the crowdmap's site. **RELOAD** in the tab (or `ATLAS RELOAD`) tries again; once one download has worked, Atlas keeps working from the copy in your browser.
- **Everything shows, no fog.** The game sends an area's explored rooms when you enter it. For the area you were in when Atlas loaded, that may have come before Atlas could read it: walk into another area and back.
- **This room isn't on the community map.** New or hidden rooms can be missing from the crowdmap. Atlas still shows the rest of the area.
- **A click doesn't walk.** `PATH FIND` needs a route the game knows (and stops at 100 rooms); try `PATH FIND <number>` yourself to see the game's answer. Nothing walks while Loom is paused (`LOOM PAUSE ON`).
