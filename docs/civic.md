# Civic

*City duties, one ministry at a time: for now, the ambassador's aide, who welcomes new citizens and teaches novices.*

<!-- loom:version civic -->
*This page describes civic 0.2.7.*
<!-- /loom:version -->

## What it is

Civic gathers the routine of city work. It works for any city and is organised by ministry; the first one is the **ambassador's aide**, who looks after novices and new citizens:

- **Going on duty** (`CIVIC AIDE ON`) makes you available as a city guide, turns on the newbie channel, and announces on your novice clan: "<your title> on duty. If you have any questions or need anything, don't hesitate to ask!" `CIVIC AIDE OFF` reverses it.
- **Lesson requests** are accepted (`OK`) as they come, on duty or not, unless the asker is on your enemies list (with **social** installed).
- **Welcoming a new citizen** (`CIVIC GREET Ana`) sends a welcome on the city channel, pointing them to `CHELP WELCOME`, and one on the novice clan, pointing them to `CLHELP WELCOME`.
- **A new citizen escaping** the novice area is added to social's `city` group, when social is installed.

## Commands

<!-- loom:commands civic -->
| Command | What it does |
|---|---|
| `CIVIC` | status |
| **Ambassador aide:** | |
| `CIVIC AIDE ON\|OFF` | go on or off duty (city guide, newbie channel, novice clan) |
| `CIVIC AIDE TITLE <title>` | your aide title, e.g. Verdant Emissary |
| `CIVIC AIDE CLAN <clan>` | the novice clan you help in, e.g. saiha |
| `CIVIC GREET <name> [CT\|CLT]` | welcome a new citizen (both channels by default) |
| `CIVIC DEBUG` | internal state |
<!-- /loom:commands -->

`CIVIC GREET Ana CT` welcomes on the city channel only, `CLT` on the clan only; both by default.

## Setting it up

1. **Import `civic.nxs`** (see [Getting started](getting-started.md)).
2. **Set your aide title and novice clan**: `CIVIC AIDE TITLE Verdant Emissary`, `CIVIC AIDE CLAN saiha`. Civic follows your city from the game and fills in the values it knows for it (only Eleusis so far); send yours with a [feature idea](https://github.com/neijel-achaea/loom/issues/new/choose) so they can be added for everyone.
3. **`CIVIC AIDE ON`** when your shift starts.

Civic replaces the older **eleusis** package.

## Daily use

On duty, answer questions, teach (Civic accepts the requests), and greet each new citizen with `CIVIC GREET <name>`. Off duty with `CIVIC AIDE OFF`.

The Eleusian Techs clan's channel lines are hidden.

## Working with other packages

With **social** installed, Civic checks its enemies list before accepting a lesson, and adds new citizens to the `city` group. Nothing reads Civic.

## Troubleshooting

- **Messages go to the wrong clan.** `CIVIC AIDE CLAN <clan>`; `CIVIC` shows the current settings.
- **A lesson wasn't accepted.** Never from someone on social's enemies list, nor while Loom is paused (`LOOM PAUSE`).
