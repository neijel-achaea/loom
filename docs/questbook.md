# Questbook

*Your own repeatable quests, written down as steps in a tab, ticked as you play.*

<!-- loom:version questbook -->
*This page describes questbook 0.1.0.*
<!-- /loom:version -->

## What it is

Questbook (the Questing Companion) keeps the quests you do again and again (most daily, a few yearly) as lists of steps you write yourself, and walks you through them every time. They're listed in a custom tab named **Quests**. (The command is `QUESTBOOK`: `QUESTS` is the game's own.)

- **Yours alone.** You build your quests as you play; there is no export, import or sharing. They're kept per character, like every Nexus setting.
- **A guide, never a bot.** A step can be one click (walk there, send the line), but nothing runs by itself.
- **By area.** The list groups quests by the area they start in, the area you're in first; areas fold (remembered), and a folded area shows how many are ready and waiting. Each quest takes two lines: its name with a status chip on the right (`STEP 3 OF 7` while under way, `READY`, or `✓ AGAIN IN 5 H`), then its rewards, how it repeats and how many times you've done it. **ALL · READY · WAITING** filters the list (kept).
- **Following one.** Click a quest to open it: its rewards, a progress bar, and its steps two lines each, done ones ticked, the current one highlighted with its button. A quest you can do now is *followed*: its current step ticks by itself as you play. A quest that's waiting is only shown (START OVER follows it anyway).
- **Repeats.** **Daily** quests are ready again at the daily reset, a time you set on your own clock (`QUESTBOOK DAILY <hh:mm>`, default midnight). **Yearly** quests are ready again an Achaean year after you last finished them: 12 months of 25 Achaean days, one real hour each, so 300 hours (12.5 real days).

### Steps

| Kind | What it holds | Ticks when | Its button |
|---|---|---|---|
| GO | the room you were in when you added it | you arrive there (or are already there) | WALK: `PATH FIND <number>` |
| TALK / ASK / SAY | the command, as you'd type it | you send it with the button | SEND |
| GET / BUY | an item, and optionally a command | an item whose name holds those words comes into your inventory | SEND (the command), or DONE |
| GIVE | an item, and optionally a command | that item leaves your inventory | SEND (the command), or DONE |
| KILL | a mob and how many | that many `You have slain …` lines naming it | DONE |
| NOTE | free text | by hand | DONE |

Click any step to make it the current one (the steps before it count as done). `QUESTBOOK NEXT` ticks the current step by hand, `QUESTBOOK BACK` steps back.

When the last step ticks, the quest is done: its count goes up, it's stamped with the time and it waits for its next reset.

*Recording a quest as you play it (● RECORD NEW) is the next step of the package; for now quests are written with commands.*

## Commands

<!-- loom:commands questbook -->
| Command | What it does |
|---|---|
| `QUESTBOOK` | status: how many under way, ready and waiting, and the one you follow |
| `QUESTBOOK LIST` | every quest, with where you are in it or when it's ready again |
| `QUESTBOOK NEW <name>` | start writing a quest down (in this area, daily); it opens in the tab |
| `QUESTBOOK OPEN <name\|number>` | show a quest in the tab; one you can do now is followed |
| `QUESTBOOK CLOSE` | back to the list (also ← quests in the tab) |
| **Writing steps (on the quest open in the tab):** | |
| `QUESTBOOK STEP GO` | go to the room you're in (ticks when you arrive; click walks) |
| `QUESTBOOK STEP TALK\|ASK\|SAY <command>` | a line to send, as you'd type it (ticks when sent from the tab) |
| `QUESTBOOK STEP GET\|BUY <item> [/ <command>]` | ticks when the item is in your inventory; the command, if given, is its button |
| `QUESTBOOK STEP GIVE <item> [/ <command>]` | ticks when the item leaves your inventory |
| `QUESTBOOK STEP KILL [count] <mob>` | ticks after that many "You have slain" lines naming it |
| `QUESTBOOK STEP NOTE <text>` | a reminder, ticked by hand |
| `QUESTBOOK STEP REMOVE <n>` | drop a step (also EDIT STEPS in the tab) |
| `QUESTBOOK REPEAT DAILY\|YEARLY` | daily: at the daily reset; yearly: an Achaean year (300 hours) after you did it |
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
| `QUESTBOOK DAILY [hh:mm]` | when daily quests reset, on your own clock (default 00:00) |
| `QUESTBOOK RESET` | reload saved quests, redraw the tab |
| `QUESTBOOK DEBUG` | internal state |
| **The tab is a custom tab named Quests. Nothing runs by itself: a step's button walks or sends only when you click it.** | |
<!-- /loom:commands -->

Most commands work on the quest open in the tab. Writing one down, standing at the mill where it starts:

```
QUESTBOOK NEW The miller's lost sack
QUESTBOOK STEP GO
QUESTBOOK STEP ASK ask miller about sack
QUESTBOOK STEP GET flour sack / get sack
QUESTBOOK STEP GIVE flour sack / give sack to miller
QUESTBOOK REWARD RENOWN 3
QUESTBOOK REWARD GOLD 1500
```

GO adds the room you're in, so walk to each place and add its GO step there. (The quest and its lines here are made up.)

## Setting it up

1. **Import `questbook.nxs`** (see [Getting started](getting-started.md)).
2. **Create a custom tab named `Quests`** (exactly that name); it fills in at once.
3. Next time you do a quest you'll want to repeat, write it down with `QUESTBOOK NEW <name>` and `QUESTBOOK STEP …` as you go.
4. If daily quests reset at another time than midnight on your clock, set it: `QUESTBOOK DAILY 02:00`.

## Daily use

Open the Quests tab, show **READY**, and click a quest. Follow the highlighted step: WALK to its room, SEND its line, pick up or hand over what it asks. Steps tick as you go; when the last one does, the quest moves to waiting until it's ready again.

## Working with other packages

Questbook reads nothing from other packages. With **waypoints** installed, Loom's integration joins the two. It's a link, on as soon as both packages are installed; `LOOM LINKS` lists them, `LOOM LINK <id> OFF` switches one off.

| Link | With | What it does |
| --- | --- | --- |
| `waypoints-questbook` | waypoints | A GO step whose room is a saved waypoint shows the waypoint's name (⚑ name). |

## Troubleshooting

- **The tab stays empty.** Check the custom tab is named exactly `Quests`, then `QUESTBOOK RESET`.
- **A step doesn't tick.** Only the quest you follow ticks, and only its current step. GET/BUY/GIVE match the item's name as the game sends it to your inventory: use a few words of it (`flour sack`). `QUESTBOOK NEXT` ticks it by hand; `QUESTBOOK DEBUG` shows the current step.
- **A click doesn't walk or send.** Nothing is sent while Loom is paused (`LOOM PAUSE ON`). `PATH FIND` needs a route the game knows.
