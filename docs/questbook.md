# Questbook

*Your own repeatable quests, written down as steps in a tab, ticked as you play.*

<!-- loom:version questbook -->
*This page describes questbook 0.5.1.*
<!-- /loom:version -->

## What it is

Questbook (the Questing Companion) keeps the quests you do again and again (most daily, a few yearly) as lists of steps you write yourself, and walks you through them every time. They're listed in a custom tab named **Quests**. (The command is `QUESTBOOK`: `QUESTS` is the game's own.)

- **Yours, kept per character** like every Nexus setting. You build your quests as you play. To keep a copy or move one to another character, `QUESTBOOK EXPORT` turns a quest into a short code and `QUESTBOOK IMPORT` adds it back (see [Backing up a quest](#backing-up-a-quest)).
- **A guide, never a bot.** A step can be one click (walk there, send the line), but nothing runs by itself.
- **By area.** The list groups quests by the area they start in (the area you were in at `QUESTBOOK NEW`; `QUESTBOOK AREA [name]` moves the open quest), the area you're in first; areas fold (remembered), and a folded area shows how many are ready and waiting. Each quest takes two lines: its name with a status chip on the right (`STEP 3 OF 7` while under way, `READY`, or `✓ AGAIN IN 5 H`), then its rewards, how it repeats and how many times you've done it. **ALL · READY · WAITING** filters the list (kept).
- **Following one.** Click a quest to open it: its rewards, a progress bar, and its steps two lines each, done ones ticked, the current one highlighted with its button. A quest you can do now is *followed*: its current step ticks by itself as you play. A quest that's waiting is only shown (START OVER follows it anyway).
- **Repeats, in Achaean time.** An Achaean day is a real hour, a month a real day and a year 12 real days. **Daily** quests are ready again at the top of every hour; **monthly** ones every day at the game's midnight (`QUESTBOOK MIDNIGHT <hh:mm>` on your own clock, default 02:00, which is the game's midnight seen from Central Europe); **yearly** ones on 1st Sarapin, every 12 days. Questbook learns when 1st Sarapin falls from the game's date line, so type `DATE` once (until then a yearly quest is ready 12 days after you finished it). **None**: a quest done once stays done (`✓ DONE`).

### Steps

Most steps are commands: anything after `QUESTBOOK STEP` that isn't GO, KILL or NOTE is sent exactly as you typed it (greet, ask, give, get, buy, drop, pull, turn, put, kneel…), and its button in the tab sends it. It's sent as if you'd typed it, so your own aliases work in a step (one of yours can send several commands; the command separator itself can't go in a step, since Nexus splits your QUESTBOOK line on it before Questbook sees it). A command whose first word is a step word goes after `DO`: `QUESTBOOK STEP DO kill rat` sends `kill rat` instead of counting kills.

| Kind | What it holds | Ticks when | Its button |
|---|---|---|---|
| GO | the room you were in when you added it (or a room number) | you arrive there (or are already there) | WALK: `PATH FIND <number>` |
| any command | the command, as you'd type it (`GREET miller`, `GIVE sack to miller`, `PULL lever`) | you send it with the button | its first word: GREET, GIVE, PULL… |
| KILL | a mob and how many | that many `You have slain …` lines naming it | DONE |
| NOTE | free text | by hand | DONE |

In the tab each step shows a small icon; hover it for what it is. Commands starting with GREET, TALK, ASK, SAY, GET, BUY, GIVE or DROP have their own icons, the rest a prompt. Click any step to make it the current one (the steps before it count as done). `QUESTBOOK NEXT` ticks the current step by hand, `QUESTBOOK BACK` steps back.

When the last step ticks, the quest is done: its count goes up, it's stamped with the time and it waits for its next reset.

*Recording a quest as you play it (● RECORD NEW) is the next step of the package; for now quests are written with commands.*

### Backing up a quest

`QUESTBOOK EXPORT [name|number]` (or **EXPORT** under an open quest) turns one quest into a code like `QB1zTZA9TsNAF…`: its name, area, repeat, rewards and steps, written small and compressed. Where you are in it and how often you've done it stay behind. The code shows below the notice (click it once to select all of it) and goes to your clipboard when the browser allows it. Keep it wherever you keep notes.

`QUESTBOOK IMPORT <code>` (or **IMPORT** above the list, which takes the code in a paste box) adds the quest back at once as a new quest, open in the tab and not followed. Its name gets a number when yours is taken. One quest per code; there's no bulk export.

The code holds only letters, digits, `-` and `_`, so quotes, accents, `|` or line breaks in your steps can't break it, and spaces or line breaks a paste picks up are ignored. It ends with a checksum: a code cut short or changed on the way is refused, never half-imported. If your command separator is `-` or `_`, use IMPORT in the tab (the typed line would be split).

**What you do with a code is up to you.** It's a backup tool: Loom doesn't send, share or fetch codes. A code you got from someone else can say anything, so every import ends with a warning. A command step is sent exactly as written, through your aliases, when you click its button: read every step before you use it, and fix or drop the ones you don't want with EDIT STEPS.

## Commands

<!-- loom:commands questbook -->
| Command | What it does |
|---|---|
| `QUESTBOOK` | status: how many under way, ready and waiting, and the one you follow |
| `QUESTBOOK LIST` | every quest, with where you are in it or when it's ready again |
| `QUESTBOOK NEW <name>` | start writing a quest down (in this area, repeating daily); it opens in the tab |
| `QUESTBOOK OPEN <name\|number>` | show a quest in the tab; one you can do now is followed |
| `QUESTBOOK CLOSE` | back to the list (also ← quests in the tab) |
| **Writing steps (on the quest open in the tab):** | |
| `QUESTBOOK STEP GO [room]` | go to the room you're in, or that room number (ticks when you arrive; click walks) |
| `QUESTBOOK STEP <any command>` | a command, as you'd type it: GREET miller, ASK miller about sack, GIVE sack to miller, PULL lever (its button sends it, which ticks it) |
| `QUESTBOOK STEP DO <command>` | the same, for a command starting with a step word (DO kill rat) |
| `QUESTBOOK STEP KILL [count] <mob>` | ticks after that many "You have slain" lines naming it |
| `QUESTBOOK STEP NOTE <text>` | a reminder, ticked by hand |
| `QUESTBOOK STEP EDIT <n> <step> …` | rewrite step n, as you'd add it (✎ in EDIT STEPS puts it in your input line) |
| `QUESTBOOK STEP INSERT <n> <step> …` | a new step before step n |
| `QUESTBOOK STEP REMOVE <n>` | drop a step (also × in EDIT STEPS) |
| `QUESTBOOK REPEAT DAILY\|MONTHLY\|YEARLY\|NONE` | in Achaean time: daily on the hour, monthly at the game's midnight, yearly on 1st Sarapin; NONE: once |
| `QUESTBOOK REWARD` | the open quest's rewards |
| `QUESTBOOK REWARD RENOWN\|XP\|GOLD <n>` | what it gives (0 takes it off) |
| `QUESTBOOK REWARD ITEM <text> \| CLEAR` | an item it gives, or clear the rewards |
| `QUESTBOOK RENAME <new name>` | rename the open quest |
| `QUESTBOOK AREA [name]` | move the open quest to the area you're in, or to that area |
| `QUESTBOOK REMOVE <name\|number> CONFIRM` | forget a quest and its record |
| **Backup (one quest at a time):** | |
| `QUESTBOOK EXPORT [name\|number]` | a quest (the open one if none named) as a short code, copied to your clipboard when the browser allows (also EXPORT in the tab) |
| `QUESTBOOK IMPORT <code>` | add a quest back from its code, as a new quest, not followed (also IMPORT in the tab, which takes a paste in a box). Read every step before you use one from someone else |
| **Following:** | |
| `QUESTBOOK NEXT` | tick the current step by hand |
| `QUESTBOOK BACK` | one step back |
| `QUESTBOOK RESTART` | start the open quest over (also START OVER in the tab) |
| `QUESTBOOK DONE` | mark the open quest done now |
| **Settings:** | |
| `QUESTBOOK SHOW [ALL\|READY\|WAITING]` | which quests the tab lists (also in the tab; kept) |
| `QUESTBOOK MIDNIGHT [hh:mm]` | the game's midnight on your clock, when monthly quests reset (default 02:00) |
| **Yearly quests learn 1st Sarapin from the game's date: type DATE once.** | |
| `QUESTBOOK RESET` | reload saved quests, redraw the tab |
| `QUESTBOOK DEBUG` | internal state |
| **The tab is a custom tab named Quests. Nothing runs by itself: a step's button walks or sends only when you click it.** | |
<!-- /loom:commands -->

Most commands work on the quest open in the tab. Writing one down, standing at the mill where it starts:

```
QUESTBOOK NEW The miller's lost sack
QUESTBOOK STEP GO
QUESTBOOK STEP GREET miller
QUESTBOOK STEP ASK miller about sack
QUESTBOOK STEP GET sack
QUESTBOOK STEP GIVE sack to miller
QUESTBOOK REWARD RENOWN 3
QUESTBOOK REWARD XP 12000
QUESTBOOK REWARD GOLD 1500
```

GO adds the room you're in, so walk to each place and add its GO step there (or give its number: `QUESTBOOK STEP GO 5134`). (The quest and its lines here are made up.)

**Fixing a step.** `QUESTBOOK STEP EDIT <n>` followed by the step as you'd add it rewrites step n: `QUESTBOOK STEP EDIT 3 ASK miller about the sack`. In the tab, **EDIT STEPS** shows a ✎ on each step that puts that command, with the step as it stands, in your input line to correct and send. `QUESTBOOK STEP INSERT <n> …` adds a step before step n.

## Setting it up

1. **Import `questbook.nxs`** (see [Getting started](getting-started.md)).
2. **Create a custom tab named `Quests`** (exactly that name); it fills in at once.
3. Next time you do a quest you'll want to repeat, write it down with `QUESTBOOK NEW <name>` and `QUESTBOOK STEP …` as you go.
4. Type `DATE` once, so yearly quests know when 1st Sarapin falls. If the game's midnight isn't 02:00 on your clock, set it: `QUESTBOOK MIDNIGHT 06:00`.

## Daily use

Open the Quests tab, show **READY**, and click a quest. Follow the highlighted step: WALK to its room, SEND its line, pick up or hand over what it asks. Steps tick as you go; when the last one does, the quest moves to waiting until it's ready again.

## Working with other packages

Questbook reads nothing from other packages. With **waypoints** installed, Loom's integration joins the two. It's a link, on as soon as both packages are installed; `LOOM LINKS` lists them, `LOOM LINK <id> OFF` switches one off.

| Link | With | What it does |
| --- | --- | --- |
| `waypoints-questbook` | waypoints | A GO step whose room is a saved waypoint shows the waypoint's name (⚑ name). |

## Troubleshooting

- **The tab stays empty.** Check the custom tab is named exactly `Quests`, then `QUESTBOOK RESET`.
- **A step doesn't tick.** Only the quest you follow ticks, and only its current step. A command ticks when you send it with its button; typed by hand, tick it with `QUESTBOOK NEXT` (or click the next step). KILL matches the mob's name in the `You have slain …` line: use a few words of it (`rat`). `QUESTBOOK DEBUG` shows the current step.
- **IMPORT says the code is incomplete.** Copy the whole code again (it's long and wraps; one click selects all of it). With a command separator of `-` or `_`, paste it with IMPORT in the tab.
- **IMPORT says the browser can't unpack compressed codes.** Codes starting `QB1z` need a browser with built-in compression (any current one); update the browser, or ask for the quest again.
- **A click doesn't walk or send.** Nothing is sent while Loom is paused (`LOOM PAUSE ON`). `PATH FIND` needs a route the game knows.
