# Roleplay

*Ambient emotes in your own voice: small gestures sent every few minutes, written per race and per class.*

<!-- loom:version roleplay -->
*This page describes roleplay 0.3.10.*
<!-- /loom:version -->

## What it is

A character who never moves between lines reads like a statue. With ambient emotes on, roleplay sends one small emote from your own lists every 15 to 19 minutes (`ROLEPLAY AEM TIME` to change that): a glance about the room, a breath, a habit of your class.

It's flavour only. It earns nothing, and it stays quiet when an emote would be out of place.

- **Your lists, your words.** You add, reword, weigh and remove emotes with commands. A few starting emotes are there for those who'd rather not write their own; once a list is in use, it's yours.
- **One voice per body.** Lists are kept per race and per class. A normal class draws from three lists: *general* (anyone), your *race*, and your *class*. A dragon or an elemental lord is a different body, so a form draws only from its own two lists: the *form*'s (shared by every dragon, or every lord) and its *class* (the colour's, or the element's). No talk of hands or hair while you're a dragon. An elder dragon shares its colour's list (Elder Golden Dragon uses Golden Dragon's).
- **Chances you can see.** `ROLEPLAY AEM LIST` numbers every emote in use with its weight and the chance it's the next one picked.
- **Pronouns.** Emotes can say `{he}`, `{him}` and `{his}` (or `{His}` at the start of a sentence), filled in as he/him/his, she/her/her or fae/faen/faes.

## Commands

<!-- loom:commands roleplay -->
| Command | What it does |
|---|---|
| `ROLEPLAY` | who the emotes follow (race, class, gender) and the ambient emotes' state |
| `ROLEPLAY GENDER [HE\|SHE\|FAE\|AUTO]` | the pronouns {he} {him} {his} become (AUTO: your gender in SCORE) |
| `ROLEPLAY QUIET [ADD\|REMOVE <name>\|RESET]` | defences and afflictions that hold the emotes back |
| `ROLEPLAY AEM [ON\|OFF]` | an ambient emote every few minutes, or none; remembered across sessions (default OFF) |
| `ROLEPLAY AEM NOW` | one ambient emote now |
| `ROLEPLAY AEM LIST [GENERAL\|RACE\|CLASS\|FORM\|ALL]` | the emotes in use, numbered, with weight and chance |
| `ROLEPLAY AEM ADD <list> [weight] <text>` | add an emote: list GENERAL, RACE, CLASS, FORM, or CLASS:<name> |
| `ROLEPLAY AEM EDIT <n> <text>` | reword emote n |
| `ROLEPLAY AEM WEIGHT <n> <weight>` | how often emote n comes up (0 keeps it but never sends it) |
| `ROLEPLAY AEM REMOVE <n>` | remove emote n (its text is shown, to add back) |
| `ROLEPLAY AEM TEST <n>` | show emote n as it would be sent, without sending it |
| `ROLEPLAY AEM TIME [<min> <max>]` | minutes between ambient emotes (default 15 19) |
| `ROLEPLAY AEM EXPORT [ALL]` | your emotes as ADD commands, to keep or paste back |
| `ROLEPLAY AEM RESET [GENERAL\|RACE\|CLASS\|FORM\|ALL] CONFIRM` | a fresh set of starting emotes (yours in that list are lost) |
| `ROLEPLAY DEBUG` | internal state |
| **A normal class uses general + race + class lists; a dragon or elemental lord its form list (every dragon, every lord) + its own (colour, element).** | |
| **Numbers are those of the last LIST. Nothing is sent while triggers are paused, while hidden or asleep, or in a fight.** | |
<!-- /loom:commands -->

### Which list an emote goes in

`ROLEPLAY AEM ADD` takes the list first:

| List | What it's for |
| --- | --- |
| `GENERAL` | gestures anyone could make, whatever their race and class (never used in a form) |
| `RACE` | your race's body and habits: an Atavian's wings, a Grook's webbed hands (never used in a form) |
| `CLASS` | your class now: a Magi's crystals, a Druid's staff; as a dragon, your colour's own |
| `FORM` | in a form, what every dragon (or every elemental lord) shares: wings, scales, size |
| `CLASS:<name>`, `RACE:<name>`, `FORM:<name>` | another class's, race's or form's list, with underscores for spaces: `CLASS:Black_Dragon`, `FORM:Dragon` |

Then an optional weight (default 1), then the text, which is everything after `emote `. A leading `emote` is dropped if you type it:

```
ROLEPLAY AEM ADD CLASS 5 turns a small crystal over in {his} fingers, watching the light fold within it.
ROLEPLAY AEM ADD CLASS:Black_Dragon 10 shifts {his} weight, and the ground notices.
```

### Weights and chances

An emote with weight 4 comes up twice as often as one with weight 2. `LIST` shows each emote's share of the total as a percentage. Weight 0 keeps an emote in the list but never sends it. The same emote is never sent twice in a row when there's another to choose.

### Numbers

`EDIT`, `WEIGHT`, `REMOVE` and `TEST` take the number an emote has in the last `LIST` you asked for: the emotes in use (bare `LIST`), one list (`LIST CLASS`, `LIST CLASS:Magi`), or every list (`LIST ALL`). `REMOVE` shows the command that adds the emote back.

### Keeping a copy

`ROLEPLAY AEM EXPORT` prints the lists in use as `ADD` commands; `EXPORT ALL` prints every list you have. Keep them somewhere, and paste them back after a `RESET` or on another character.

### Starting emotes

Each list takes its starting emotes once, the first time it's in use: general and your race's at install, a class's the first time you're that class. They're a random handful from larger pools, so two characters seldom start with the same set: 10 general emotes (from 50), 5 for your race (from 20, weight 3) and 5 for your class (from 20, weight 4). A form gets 15 from its shared pool and 5 from its colour's or element's, all at weight 4. Twenty in all, with the class, which defines a character best, coming up most often. After that the list is yours: emptying it keeps it empty. `ROLEPLAY AEM RESET GENERAL CONFIRM` (or `RACE`, `CLASS`, `ALL`) deals a fresh set and removes yours from that list.

The starting emotes keep to a few rules, worth following in your own too: only what others can see (no "as if", nothing that tells the room what you think), nothing that invites a question, nothing that depends on the room or the moment, nothing that says how you feel (hungry, cold), and nothing rude.

## Setting it up

1. **Import `roleplay.nxs`** (see [Getting started](getting-started.md)). Log in once (or `QUIT` and back) so it learns your name, race and class from the game.
2. **Type `SCORE` once.** The game doesn't send your gender with the rest, so roleplay reads it from SCORE's "Gender :" line and keeps it (male he/him/his, female she/her/her). `ROLEPLAY GENDER HE`, `SHE` or `FAE` overrides it; `AUTO` goes back to SCORE's. Emotes with pronouns wait until one of the two is known.
3. **`ROLEPLAY`** shows what it knows: name, race, class and pronouns.
4. **`ROLEPLAY AEM LIST`** to see the emotes in use, then add your own.
5. **`ROLEPLAY AEM ON`.**

## Daily use

`ROLEPLAY AEM ON` when you settle somewhere to roleplay. The switch stays as you left it across sessions: when it loads ON, a notice says so (`ROLEPLAY AEM OFF` to stop).

It holds back on its own, and tries again a minute later:

- while Loom is paused (`LOOM PAUSE ON`);
- while you're hidden, shrouded, cloaked or phased, or asleep, prone, stunned or in aeon (`ROLEPLAY QUIET` lists them, by the names the game gives them; `QUIET ADD|REMOVE <name>` changes the list);
- in a fight: you lost health in the last 30 seconds.

When you speak or yell (in any voice or accent: it's read from the game's GMCP, not the line) or emote yourself, the next ambient emote waits a minute longer, up to the longest wait from now. In the middle of a conversation it steps aside instead of talking over you.

`ROLEPLAY AEM NOW` sends one at once (unless Loom is paused). `ROLEPLAY AEM TEST <n>` shows one as it would be sent, without sending it.

## Working with other packages

Roleplay reads nothing from other packages and nothing reads it.

## Troubleshooting

- **No emotes in use.** `ROLEPLAY` shows the race and class it knows: an empty or wrong one means it hasn't seen your login yet. Log in again. A form with empty lists sends nothing: `ROLEPLAY AEM ADD FORM ...` or `ADD CLASS ...` while you're in it.
- **Nothing is sent.** `ROLEPLAY AEM` shows the next time and what's holding it back. `ROLEPLAY QUIET` shows which of its defences and afflictions are up.
- **`{his}` appears as written, or token emotes never come up.** Your pronouns aren't known: type `SCORE`, or `ROLEPLAY GENDER`.
- **A bug?** [Report it](https://github.com/neijel-achaea/loom/issues/new/choose) with `ROLEPLAY DEBUG`'s output.
