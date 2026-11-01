# Atlas

*A map of the area you're in, from the community crowdmap, with the rooms you've explored as fog of war; and how much of each area you've explored.*

<!-- loom:version atlas -->
*This page describes atlas 0.2.1.*
<!-- /loom:version -->

## What it is

Atlas draws the area you're in, one level at a time, in a custom tab named **Atlas**, as a replacement for the stock Map tab. The map comes from the **Achaea crowdmap**, the map players keep up to date for Mudlet's IRE mapper ([IRE-Mudlet-Mapping/AchaeaCrowdmap](https://github.com/IRE-Mudlet-Mapping/AchaeaCrowdmap)): over 30,000 rooms in some 500 areas, more complete than the game's own map. Room and area numbers are the game's, so Atlas knows where you are from the game's room information.

- **The area you're in**, on your level. Rooms are squares in their environment's colour (the game's own, as on the stock map; hover a room for its name, number and environment), exits are lines between them, for the eight compass directions only. An exit into another area ends in an amber arrowhead (hover it for the area's name). Up, down, in and out are an arrow in the middle of the room, as on the stock map: ▲ up, ▼ down, ◀ in, ▶ out; up and down together make an hourglass, in and out the same on its side (hover a room for its exits by name).
- **Where you are.** The room you're in is ringed, and the map follows you as you move. Line 2 gives the room's name and number.
- **Fog of war.** When you enter an area, the game tells Nexus which of its rooms you've ever explored, and Atlas shows only those, like the stock map. A short dotted line marks an exit to somewhere you haven't been. Turn fog off (**FOG** on the title line, or `ATLAS FOG OFF`) to see every room on the map, the ones you haven't explored faint.
- **How much you've explored.** Line 2 reads *132 of 147 explored*: the game's count of rooms you've explored in this area, against the rooms the crowdmap knows there. The two don't always match the game's own idea of the area exactly (the crowdmap has rooms that don't count for exploration, and the other way round), so read it as close, not exact.
- **Levels.** In an area with several levels, the arrows by *level* look at the one above or below. Moving brings the view back to you.
- **Moving the map.** Drag to pan; the mouse wheel or **− +** zoom; **⌖** brings you back to the room you're in.
- **Walking.** Click a room to walk there with the game's `PATH FIND <number>`. Atlas sends it once and does nothing else.

### The Areas tab

A second custom tab, **Areas**, lists every area you've visited with how much of it you've explored: *132 / 147 · 89%*, with a thin bar under each.

- **Totals on top.** *In the areas you've visited*: the rooms you've explored in them, of the rooms the crowdmap has there. *Of the whole map*: the same rooms, of every room on the map.
- **Your own groups.** Areas carry no continent or region, so you group them yourself with tags: `ATLAS TAG HERE sapience` tags the area you're in, `ATLAS TAG granite hills sapience` one by name (the crowdmap's name or the game's, with or without "the", any case) and `ATLAS TAG 85 sapience` one by number. An area can have several tags and shows under each; the untagged ones come last. Each group heading gives the group's own totals and folds with a click. Tags are kept per character.
- **Not visited yet.** The game sends an area's explored rooms only when you enter it, so an area you haven't entered since installing Atlas has no figure yet. Those are listed, folded, under *not visited yet*, never as 0%. Walk through an area once and its figure stays, saved for your character.
- **No exploration record.** Some places aren't counted for exploration by the game (inns and the like): when you walk into one, the game sends no explored rooms with it. Atlas notices, and lists those areas, folded, under *no exploration record*, out of the totals; the Atlas tab says so on line 2, and shows all their rooms. Should the game ever send a list for one, it moves back among the others.
- **Hidden areas.** Some of the crowdmap's areas aren't places to explore (player houses, manses). `ATLAS HIDE <area>` keeps one out of the list and the totals; it's listed, folded, under *hidden*, and `ATLAS UNHIDE` brings it back.
- **A click on an area** shows it in the Atlas tab, centred on its main level, without going there; ⌖ or your next step brings the map back to you.

The figures count the rooms on the crowdmap you've explored, by the game's own record, so a percentage never passes 100%. The game's exploration ranking counts rooms in its own way (some of the crowdmap's rooms don't count for it, and it has a few the crowdmap lacks), so read them as close, not as the game's figure.

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

Atlas reads nothing from other packages yet. Its integrations (waypoints and quest steps on the map, Here's alerts) come in later versions.

## Troubleshooting

- **The tab says it couldn't load the community map.** Your browser couldn't reach the crowdmap's site. **RELOAD** in the tab (or `ATLAS RELOAD`) tries again; once one download has worked, Atlas keeps working from the copy in your browser.
- **Everything shows, no fog.** The game sends an area's explored rooms when you enter it. For the area you were in when Atlas loaded, that may have come before Atlas could read it: walk into another area and back.
- **This room isn't on the community map.** New or hidden rooms can be missing from the crowdmap. Atlas still shows the rest of the area.
- **A click doesn't walk.** `PATH FIND` needs a route the game knows (and stops at 100 rooms); try `PATH FIND <number>` yourself to see the game's answer. Nothing walks while Loom is paused (`LOOM PAUSE ON`).
