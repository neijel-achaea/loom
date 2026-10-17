# Standings

*How you stand with people and organisations, kept as a ledger of dealings, from Nemesis to Soulmate.*

<!-- loom:version standings -->
*This page describes standings 0.3.2.*
<!-- /loom:version -->

## What it is

Standings keeps a book of the people you deal with. Each time something happens between you (a favour, a slight, a gift, a betrayal) you **nudge** your standing with them up or down, with a note. Their standing is worked out from those dealings, on a scale from -10 to +10, and falls in one of seven **bands**:

| Band | From | To | Icon |
| --- | ---: | ---: | :---: |
| Nemesis | -10 | -6 | ☠ |
| Hostile | -6 | -2.5 | ⚔ |
| Strained | -2.5 | -0.5 | ⚠ |
| Neutral | -0.5 | 0.5 | ○ |
| Acquaintance | 0.5 | 2.5 | ☺ |
| Friend | 2.5 | 6 | ♥ |
| Soulmate | 6 | 10 | ❦ |

**Trust is slow to earn and quick to lose.** A nudge counts for less the closer the standing already is to the end it pushes toward: the tenth kindness to a friend moves them less than the first, while a slight to a friend costs more than the same slight to a stranger.

People can carry **tags** for the organisations they belong to (`city:eleusis`, `house:sentaari`, `order:gaia`), and an organisation's standing is the average of its people, each counting by how many dealings you've had with them.

The **Standings** tab shows the overview (everyone on the books, the tags, and suggestions waiting for review) or one person's page: their band on the -10..+10 scale, a line of their standing over time, and every dealing with its date on the Achaean calendar.

Each of your characters keeps its own book.

## Commands

<!-- loom:commands standings -->
| Command | What it does |
|---|---|
| `STANDINGS` | overview in the Standings tab |
| `STANDINGS <name>` | show them in the tab |
| `STANDINGS @<tag>` | an organisation (everyone tagged with it) |
| `STANDINGS <name> + \| ++ \| +++` | nudge up, small to large [note] |
| `STANDINGS <name> - \| -- \| ---` | nudge down, small to large [note] |
| `STANDINGS <name> SET <-10..10> [note]` | place a standing outright, to catch up on the past |
| `STANDINGS <name> NOTE <text>` | a note without a nudge |
| `STANDINGS <name> UNDO` | remove the last entry |
| `STANDINGS <name> TAG <t> [t2..]` | tags: plain or typed (city:eleusis, house:sentaari, order:gaia) |
| `STANDINGS <name> UNTAG <t>` | remove a tag |
| `STANDINGS <name> FORGET CONFIRM` | erase their whole history |
| `STANDINGS LIST [n]` | people on the books, highest first (15 unless n) |
| `STANDINGS TAGS` | tags in use, with their averages |
| `STANDINGS REVIEW` | suggested dealings waiting for you |
| `STANDINGS OK [nudge] [note]` | record the first suggestion (optionally another size) |
| `STANDINGS SKIP` | dismiss it |
| `STANDINGS DEBUG / REBUILD` | counts and links / reload the rules and recompute |
<!-- /loom:commands -->

### Nudges

| You type | Step | From neutral |
| --- | --- | --- |
| `STANDINGS Ana + helped me find the grove` | small | +0.5 |
| `STANDINGS Ana ++ covered my dues` | medium | +1.5 |
| `STANDINGS Ana +++ saved my life` | large | +4 |
| `STANDINGS Grulk - rude in the market` | small | -0.5 |
| `STANDINGS Grulk --- stole from me` | large | -4 |

The note is optional but it's what makes the book worth reading later. `STANDINGS Ana NOTE likes riddles` adds a note with no nudge; `STANDINGS Ana UNDO` takes back the last entry.

### Catching up on the past

For someone you've known a long time, `STANDINGS Ana SET 5 old friend from the war` places their standing outright; later nudges build on it.

### Organisations

`STANDINGS Ana TAG city:eleusis order:gaia` tags someone; `UNTAG` removes one. `STANDINGS @eleusis` shows everyone tagged with it and the average; `STANDINGS TAGS` lists every tag in use with its average. A plain tag `eleusis` and a typed one `city:eleusis` both match `@eleusis`.

### Looking

`STANDINGS` shows the overview in the tab, `STANDINGS Ana` someone's page, `STANDINGS LIST` the people on the books, highest first.

## Setting it up

1. **Import `standings.nxs`** (see [Getting started](getting-started.md)).
2. **Create the tab.** Add a custom tab named exactly **`Standings`**. If it doesn't appear, reset the UI layout. The balance icon shows after a page reload.
3. **Start the book** with the people who matter: `SET` for old acquaintances, nudges from here on.

With **ledger** installed, dealings are dated on the Achaean calendar. With **social**, a person's page shows chips for the social groups they're in.

If you used the older standings (`st_*` variables), the book moves over the first time it loads.

## Daily use

- **After something happens, nudge.** It takes one line, and the note is the memory.
- **Review suggestions** (see below) when the tab says some are waiting: `STANDINGS REVIEW`, then `OK` or `SKIP` each.
- **Before dealing with someone**, `STANDINGS Ana` reminds you how it went last time.

### Suggestions

Some dealings are suggested rather than recorded: by other packages through Loom's integrations, or by triggers you write yourself. A suggestion waits in **Awaiting review**, with its reason and where it came from:

> [standings] review: Ana — hunted together in Annwyn for 45m (suggested +, from huntstats). STANDINGS OK to record, STANDINGS SKIP to dismiss.

`STANDINGS OK` records the first one as suggested; `STANDINGS OK ++ a great hunt` records it with another size and your own note. `STANDINGS SKIP` dismisses it. Nothing goes in the book until you say OK.

## Working with other packages

Standings works on its own. It reads **ledger**'s date and **social**'s lists when they're installed. Through Loom's integrations, it shows elsewhere and takes suggestions. Each is a link, on as soon as both packages are installed; `LOOM LINKS` lists them, `LOOM LINK <id> OFF` switches one off.

Where your standings show:

| Link | With | What it does |
| --- | --- | --- |
| `standings-online` | social | A column in the Online tab: the band's icon in its colour, an arrow when it moved in the last 3 days; band, score and recent dealings on hover. |
| `standings-login` | social | The icon in the login notice: "Ana ♥ has awoken." |
| `standings-social` | social | With `SOCIAL COLOURS STANDINGS`, names everywhere take their band's colour. |
| `standings-comms` | comms | Your standing on hover over a talker's name. |

Where suggestions come from:

| Link | With | The suggestion |
| --- | --- | --- |
| `huntstats-standings` | huntstats | After a filed hunt of 30 minutes or more with a party, a small + with each member. |
| `coffers-standings` | coffers | When someone gives you 5,000 gold or more (not a party member settling the split), a small + with them. |

Switching a link off takes back its pending suggestions.

### Writing your own suggestions

A trigger can queue a suggestion: set `client.loom.standings.sug = { who: "Grulk", step: -3, why: "tried to steal from you" }` and run `standings_suggest`. The same reason for the same person within two minutes queues once.

## Troubleshooting

- **Someone's band looks wrong.** `STANDINGS <name>` shows every dealing and the standing after each. `UNDO` removes the last one; `SET` places it outright.
- **`FORGET CONFIRM`** erases someone's whole history. There's no undo.
- **No dates on dealings.** Dates come from **ledger**; without it Standings estimates from the last date it saw.
