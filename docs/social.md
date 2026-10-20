# Social

*Names coloured by who they are to you, notices when the people you watch come and go, and the Online tab.*

<!-- loom:version social -->
*This page describes social 0.4.9.*
<!-- /loom:version -->

## What it is

Social keeps your lists of people (family, enemies, order, house, city, allies, friends) and does three things with them:

- **Colours their names** wherever they appear in the game's text, each group in its own colour, and your own name in yellow.
- **Tells you when they log in or out**: "Ana has awoken." and "Ana has drifted into slumber.", in their group's colour.
- **Draws the Online tab**: the people you watch who are online, how long they've been on, and below, the ones who are offline with when you last saw them.

It finds out who's online by asking the game's `QW` every 5 seconds (`SOCIAL POLL EVERY` changes that) and hiding the reply, so the main window stays clean. Your city's enemies list fills itself from the game's own list (`SOCIAL SYNC` switches that).

## Commands

<!-- loom:commands social -->
| Command | What it does |
|---|---|
| `SOCIAL` | status: list sizes, polling, watched groups |
| `SOCIAL ADD <group> <name>` | add a name to a group |
| `SOCIAL DEL <group> <name>` | remove it |
| `SOCIAL CLEAR <group> CONFIRM` | remove every name from a group |
| `SOCIAL LIST [group]` | names in a group (no group: counts) |
| `SOCIAL COLOR <group\|self> [#rrggbb]` | highlight colour (no colour: back to the default) |
| `SOCIAL COLOURS [GROUPS\|STANDINGS]` | colour names by group (default) or by standing band |
| `SOCIAL WATCH [group]` | announce when that group's names log in or out (no group: show) |
| `SOCIAL OFFLINE [ON\|OFF]` | show or fold the Online tab's offline section (clicking its heading flips it too) |
| `SOCIAL UNWATCH <group>` | stop announcing it |
| `SOCIAL POLL ON\|OFF\|NOW` | the QW poll behind the announcements |
| `SOCIAL POLL EVERY [seconds]` | time between polls, 3 to 600 (default 5; no number: show) |
| `SOCIAL SYNC [ON\|OFF]` | load the enemies group from your city's enemies list (default on; no word: show) |
| `SOCIAL RESET` | reload the lists, re-prime the watchlist |
| `SOCIAL DEBUG [ON\|OFF]` | internal state; ON shows each poll |
| **Groups, highest priority first: family, enemies, order, house, city, allies, friends.** | |
| **With SYNC on, your city's enemies list replaces the enemies group whenever the game shows it (e.g. CITY ENEMIES).** | |
<!-- /loom:commands -->

### Lists

Names go in a group with `SOCIAL ADD <group> <name>`, for example `SOCIAL ADD friends Ana`. Case doesn't matter. Someone in two groups takes the colour of the first in priority order (family before enemies before order, and so on), as the game's own highlights do.

`SOCIAL LIST` gives the size of each group; `SOCIAL LIST friends` lists its names.

**The enemies list** is reloaded from the game whenever it shows your city's enemies (`CITY ENEMIES`, for instance): the list is replaced with what the game sent, and Social says how many it loaded. Only your own city's list counts; house, order and other cities' lists are left alone. `SOCIAL SYNC OFF` stops this, so the enemies group holds only the names you add yourself (`SOCIAL SYNC ON` brings it back; the setting is saved).

**Emptying a group.** `SOCIAL CLEAR <group> CONFIRM` removes every name from it at once; without `CONFIRM` it only says how many names would go. Clearing enemies while sync is on lasts until the game next shows your city's list.

### Colours

| Group | Default |
| --- | --- |
| family | `#30c4ff` |
| enemies | `#ff5f5f` |
| order | `#e0b8ff` |
| house | `#b8ff29` |
| city | `#27f5c5` |
| allies | `#ff9f4f` |
| friends | `#ffd77f` |
| self (your own name) | `#fdff4d` |

`SOCIAL COLOR friends #88ccff` changes one; `SOCIAL COLOR friends` puts the default back.

`SOCIAL COLOURS STANDINGS` colours names by your standing with each person instead (see [Working with other packages](#working-with-other-packages)); `SOCIAL COLOURS GROUPS` goes back.

### Watching

Every group is watched by default. `SOCIAL UNWATCH city` stops the login and logout notices for your city (useful in a big city), and its people leave the Online tab; their names are still coloured. `SOCIAL WATCH city` brings them back; `SOCIAL WATCH` alone shows which groups are watched.

`SOCIAL POLL OFF` stops the `QW` poll altogether: no notices, no Online updates. `SOCIAL POLL NOW` polls once right away and reports what it found. `SOCIAL POLL EVERY 10` polls every 10 seconds instead of 5 (3 to 600; remembered across loads; `SOCIAL POLL EVERY 5` goes back to the default). A longer gap means arrivals and departures show up a little later.

## Setting it up

1. **Import `social.nxs`** (see [Getting started](getting-started.md)).
2. **Create the tab.** Add a custom tab named exactly **`Online`**. If it doesn't appear, reset the UI layout. Its icon shows after a page reload.
3. **Fill your lists.** `SOCIAL ADD family <name>`, `SOCIAL ADD friends <name>`… and look at your city's enemies once (`CITY ENEMIES`) to load that list.

The first poll after login only takes note of who's online ("primed with N names"); notices start with the next one, so logging in doesn't flood you with everyone already on.

If you used the older highlight and watchlist reflexes (`hl*` and `wl*` variables), Social carries their lists, colours and settings over the first time it loads.

## Daily use

- **Reading the game.** Names you know stand out in every line: says, emotes, who's in the room, channel talk.
- **Who's on.** The Online tab lists the watched people who are online, alphabetically, in their group's colour (hover a name for its group), with how long they've been on. Someone who just arrived glows for a few seconds; someone who just left stays greyed for as long. At the bottom, how many people `QW` showed, how many are hidden and the total.
- **Who isn't.** The **offline** section below lists the other watched people, most recently seen first, with when you last saw them. Click its heading to fold it (or `SOCIAL OFFLINE OFF` to keep it folded).
- **Notices.** "Ana has awoken." when a watched person logs in, "Ana has drifted into slumber." when they leave.

## Working with other packages

Social works on its own. Other packages read its lists when they're installed: **vision** (to hide city members and flag enemies), **crystalism** (whose portal answers your city) and **standings**. Through Loom's integrations it also shows what other packages know. Each is a link, on as soon as both packages are installed; `LOOM LINKS` lists them, `LOOM LINK <id> OFF` switches one off.

| Link | With | What it does |
| --- | --- | --- |
| `standings-online` | standings | A column in Online with your standing with each person: the band's icon in its colour, an arrow when it moved in the last few days; band, score and recent dealings on hover. Empty for people not on your books. |
| `standings-login` | standings | The band's icon in the login notice: "Ana ♥ has awoken." |
| `standings-social` | standings | With `SOCIAL COLOURS STANDINGS`, names take their standing band's colour everywhere (game text, Online, and Here and Comms). Groups are ignored in this mode: people not on your books stay plain. |
| `ledger-online` | ledger | A quill ✎ in Online on people your open ledger items name (as a capitalised word), with the count when there are several: red when one is overdue, amber when one is due within 5 days. The items on hover. |
| `ledger-login` | ledger | Those items after the login notice: "Ana has awoken. · ledger: #1 Return the book (in 1d)", three at most, then "+N more". |
| `room-social` | room | A green leaf on people last seen with a newbie title (Uaithne, Ithin, Tuqad). |

Social also feeds others:

| Link | With | What it does |
| --- | --- | --- |
| `social-room` | room | Players in Here in their group colour, the group on hover. |
| `social-comms` | comms | Talkers and the people in Tells in their group colour. |
| `social-basher` | basher | An enemy arriving during a basher run makes the fight in progress the last one. |

## Troubleshooting

- **No login notices.** Check that polling is on (`SOCIAL`) and the person's group is watched (`SOCIAL WATCH`). The first poll after login only primes the list.
- **`QW` output shows up in the main window.** The capture ends on `QW`'s last line ("Plus another N…"). If your game shows something else there, report it with `SOCIAL DEBUG ON` output.
- **"city enemies loaded: 40 / 42 (count mismatch)".** Some names didn't match the shape Social expects. Report the list as the game showed it.
- **Standing colours don't show.** `SOCIAL COLOURS STANDINGS` needs standings installed and the `standings-social` link on (`LOOM LINKS`). Until then names stay plain.
