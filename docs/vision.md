# Vision

*Filters what your alertness reports: city members hidden, enemies coloured and announced to your party.*

<!-- loom:version vision -->
*This page describes vision 1.0.0.*
<!-- /loom:version -->

## What it is

With the alertness defence up, the game tells you about everyone who enters the rooms around you: "Your enhanced senses inform you that Ana has entered Moon Square, to the north." In a busy city that's a lot of lines, most of them about your own people.

Vision sorts them using **social**'s lists:

- **City members**: the line is hidden (`VISION HIDE OFF` to keep them).
- **Enemies**: the line is coloured in social's enemy colour, and your party is told: "ENEMY ALERT: Grulk is north of me, at Moon Square" (`VISION ALERT OFF` to keep it to yourself).
- **Everyone else**: the line shows as usual.

Without social installed, Vision knows nobody, and every report shows as the game sent it.

## Commands

<!-- loom:commands vision -->
| Command | What it does |
|---|---|
| `VISION` | status |
| `VISION ON\|OFF` | the whole package |
| `VISION HIDE ON\|OFF` | hide reports about your city's members |
| `VISION ALERT ON\|OFF` | tell the party when an enemy comes near |
| `VISION CHANNEL <channel>` | where alerts go: pt (default), clt3, ... |
| `VISION DEBUG` | internal state, and what the last alertness line did |
| **Recognises people through social's city and enemies lists; without social, every report shows as usual.** | |
<!-- /loom:commands -->

`VISION CHANNEL clt3` sends the alerts to a clan channel instead of party tell; any channel command that takes text works. Everything is on by default; `VISION OFF` turns the whole package off.

## Setting it up

1. **Install [social](social.md)** and fill its lists: your city members in `city`, and your city's enemies (they load themselves when you look at your city's enemies list).
2. **Import `vision.nxs`** (see [Getting started](getting-started.md)).
3. **Raise alertness** as you normally would.

## Daily use

Nothing to do: the reports you see are the ones worth seeing. Alerts aren't sent while Loom is paused (`LOOM PAUSE ON`).

## Working with other packages

Vision reads **social**'s city and enemies lists, and the enemy colour. Nothing reads Vision.

## Troubleshooting

- **City members still show.** They must be on social's `city` list (`SOCIAL LIST city`), and `VISION HIDE ON`.
- **No alert for an enemy.** They must be on social's `enemies` list, `VISION ALERT ON`, and you in a party (or the channel you set).
