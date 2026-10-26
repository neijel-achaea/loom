# Questbook

*Your own repeatable quests, written down as steps in a tab, ticked as you play.*

<!-- loom:version questbook -->
*This page describes questbook 0.2.2.*
<!-- /loom:version -->

## What it is

Questbook (the Questing Companion) keeps the quests you do again and again (most daily, a few yearly) as lists of steps you write yourself, and walks you through them every time. They're listed in a custom tab named **Quests**. (The command is `QUESTBOOK`: `QUESTS` is the game's own.)

- **Yours alone.** You build your quests as you play; there is no export, import or sharing. They're kept per character, like every Nexus setting.
- **A guide, never a bot.** A step can be one click (walk there, send the line), but nothing runs by itself.
- **By area.** The list groups quests by the area they start in, the area you're in first; areas fold (remembered), and a folded area shows how many are ready and waiting. Each quest takes two lines: its name with a status chip on the right (`STEP 3 OF 7` while under way, `READY`, or `✓ AGAIN IN 5 H`), then its rewards, how it repeats and how many times you've done it. **ALL · READY · WAITING** filters the list (kept).
- **Following one.** Click a quest to open it: its rewards, a progress bar, and its steps two lines each, done ones ticked, the current one highlighted with its button. A quest you can do now is *followed*: its current step ticks by itself as you play. A quest that's waiting is only shown (START OVER follows it anyway).
- **Repeats, in Achaean time.** An Achaean day is a real hour, a month a real day and a year 12 real days. **Daily** quests are ready again at the top of every hour; **monthly** ones every day at the game's midnight (`QUESTBOOK MIDNIGHT <hh:mm>` on your own clock, default 02:00, which is the game's midnight seen from Central Europe); **yearly** ones on 1st Sarapin, every 12 days. Questbook learns when 1st Sarapin falls from the game's date line, so type `DATE` once (until then a yearly quest is ready 12 days after you finished it). **None**: a quest done once stays done (`✓ DONE`).

### Steps

| Kind | What it holds | Ticks when | Its button |
|---|---|---|---|
| GO | the room you were in when you added it (or a room number) | you arrive there (or are already there) | WALK: `PATH FIND <number>` |
| GREET | a denizen (`GREET <denizen>`, the usual way to start talking to one) | you send it with the button | GREET |
| TALK / ASK / SAY | the command, as you'd type it | you send it with the button | SEND |
| GET / BUY | an item, and optionally a command | an item whose name holds those words comes into your inventory | SEND (the command), or DONE |
| GIVE / DROP | an item, and optionally a command | that item leaves your inventory | SEND (the command), or DONE |
| KILL | a mob and how many | that many `You have slain …` lines naming it | DONE |
| NOTE | free text | by hand | DONE |

In the tab each kind shows as a small icon; hover it for its name and what ticks it. Click any step to make it the current one (the steps before it count as done). `QUESTBOOK NEXT` ticks the current step by hand, `QUESTBOOK BACK` steps back.

When the last step ticks, the quest is done: its count goes up, it's stamped with the time and it waits for its next reset.

*Recording a quest as you play it (● RECORD NEW) is the next step of the package; for now quests are written with commands.*

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
| `QUESTBOOK STEP GREET <denizen>` | greet a denizen, the game's way to start talking to one (ticks when sent from the tab) |
| `QUESTBOOK STEP TALK\|ASK\|SAY <command>` | a line to send, as you'd type it (ticks when sent from the tab) |
| `QUESTBOOK STEP GET\|BUY <item> [/ <command>]` | ticks when the item is in your inventory; the command, if given, is its button |
| `QUESTBOOK STEP GIVE\|DROP <item> [/ <command>]` | ticks when the item leaves your inventory |
| `QUESTBOOK STEP KILL [count] <mob>` | ticks after that many "You have slain" lines naming it |
| `QUESTBOOK STEP NOTE <text>` | a reminder, ticked by hand |
| `QUESTBOOK STEP EDIT <n> <kind> …` | rewrite step n, as you'd add it (✎ in EDIT STEPS puts it in your input line) |
| `QUESTBOOK STEP INSERT <n> <kind> …` | a new step before step n |
| `QUESTBOOK STEP REMOVE <n>` | drop a step (also × in EDIT STEPS) |
| `QUESTBOOK REPEAT DAILY\|MONTHLY\|YEARLY\|NONE` | in Achaean time: daily on the hour, monthly at the game's midnight, yearly on 1st Sarapin; NONE: once |
| `QUESTBOOK REWARD RENOWN\|GOLD <n>` | what it gives (0 takes it off) |
| `QUESTBOOK REWARD ITEM <text> \| CLEAR` | an item it gives, or clear the rewards |
| `QUESTBOOK RENAME <new name>` | rename the open quest |
| `QUESTBOOK REMOVE <name\|number> CONFIRM` | forget a quest and its record |
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
QUESTBOOK STEP ASK ask miller about sack
QUESTBOOK STEP GET flour sack / get sack
QUESTBOOK STEP GIVE flour sack / give sack to miller
QUESTBOOK REWARD RENOWN 3
QUESTBOOK REWARD GOLD 1500
```

GO adds the room you're in, so walk to each place and add its GO step there (or give its number: `QUESTBOOK STEP GO 5134`). (The quest and its lines here are made up.)

**Fixing a step.** `QUESTBOOK STEP EDIT <n>` followed by the step as you'd add it rewrites step n: `QUESTBOOK STEP EDIT 2 ASK ask miller about the sack`. In the tab, **EDIT STEPS** shows a ✎ on each step that puts that command, with the step as it stands, in your input line to correct and send. `QUESTBOOK STEP INSERT <n> …` adds a step before step n.

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
- **A step doesn't tick.** Only the quest you follow ticks, and only its current step. GET/BUY/GIVE/DROP match the item's name as the game sends it to your inventory: use a few words of it (`flour sack`). `QUESTBOOK NEXT` ticks it by hand; `QUESTBOOK DEBUG` shows the current step.
- **A click doesn't walk or send.** Nothing is sent while Loom is paused (`LOOM PAUSE ON`). `PATH FIND` needs a route the game knows.
