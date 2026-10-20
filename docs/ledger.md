# Ledger

*Reminders and standing items on the Achaean calendar, with reminders other packages add for you.*

<!-- loom:version ledger -->
*This page describes ledger 0.3.5.*
<!-- /loom:version -->

## What it is

Ledger is an in-character to-do list that lives on Achaea's own calendar. It holds two kinds of item:

- **Dated items**, due on an Achaean day: "Pay the guild dues @ 1st Sarapin 1016", or "@ +2 months". They can repeat.
- **Standing items** with no date: things to keep in mind ("Ask Ana about the grove"). The longer you leave one untouched, the warmer its colour turns.

An Achaean day is about one real hour, a month is 25 days and a year 12 months, so "+4 months" is about four real days.

What you get:

- **The Ledger tab**: today's Achaean date as the big figure, then what's approaching in due order, then the standing items, oldest first. Overdue items are in sealing-wax red.
- **A notice when an item falls due**: "[ledger] #3 due - Pay the guild dues".
- **A digest** at login, and whenever you type `LEDGER`: today's date, what's due or overdue, and the oldest standing item.

Ledger learns the date from the game itself: it asks `DATE` once at login (and hides the answer), then follows the game's line as each new day begins.

## Commands

<!-- loom:commands ledger -->
| Command | What it does |
|---|---|
| `LEDGER` | today's date, what is due or overdue, the oldest standing item |
| `LEDGER ADD <text>` | a standing item, with no date |
| `LEDGER ADD <text> @ 15th Miraman 1015` | due on that Achaean date (15 works too) |
| `LEDGER ADD <text> @ +4 months` | due in that many days or months |
| `  ... [repeat]` | add REPEAT to either date to make it recur |
| `LEDGER DONE <#>` | done: removed, or moved to its next date if it repeats |
| `LEDGER DROP <#>` | remove without doing it |
| `LEDGER TOUCH <#>` | mark a standing item as looked at today |
| `LEDGER DATE` | ask the game for today's date |
| `LEDGER DEBUG [ON\|OFF]` | internal state, or debug notices |
| `LEDGER REBUILD` | rebuild from the saved variables |
| **Items other packages add show their source (· harvesting); they go away by themselves when** | |
| **their condition clears. DONE or DROP one and it stays away until then.** | |
| `LEDGER DISMISSED` | those you've sent away, waiting for their condition to clear |
| `LEDGER RESTORE <source> [key]` | bring one back now (ALL for every one) |
| **One Achaean day is one real hour; the date updates itself as each day begins.** | |
<!-- /loom:commands -->

### Adding items

| You type | You get |
| --- | --- |
| `LEDGER ADD Ask Ana about the grove` | a standing item |
| `LEDGER ADD Guild dues @ 1st Sarapin 1016` | due on that day (`@ 1 Sarapin 1016` works too) |
| `LEDGER ADD Renew the lease @ +4 months` | due four Achaean months from today |
| `LEDGER ADD Water the garden @ +3 days repeat` | due in three days, then again three days after each `DONE` |
| `LEDGER ADD Festival @ 10th Ero 1015 repeat` | due on that day every year |

Each item gets a number (#3), shown in the tab and the digest.

### Dealing with items

- `LEDGER DONE 3`: done. A repeating item moves on to its next date; any other is removed.
- `LEDGER DROP 3`: removed without doing it.
- `LEDGER TOUCH 3`: a standing item you've looked at today. Its colour cools again and it goes to the back of the standing list.

## Setting it up

1. **Import `ledger.nxs`** (see [Getting started](getting-started.md)).
2. **Create the tab.** Add a custom tab named exactly **`Ledger`**. If it doesn't appear, reset the UI layout. The quill icon shows after a page reload.
3. **Log in, or type `LEDGER DATE`**, so it learns today's date. Until then dated items can't be added ("date not known yet").

If you used the older ledger (`lg_*` variables), its items move over the first time it loads.

## Daily use

- **At login**, read the digest: what's due, what's overdue, which standing item you've neglected longest.
- **Add things as they come up** in play: promises, debts, events, errands.
- **Keep the tab open** if you like a calendar in view; overdue items stand out in red, items due within 5 days in amber.

## Reminders from other packages

Installed together, other packages add items to your ledger through Loom's integrations. They show their source ("· harvesting") and look after themselves:

- they appear when there's something to do and **go away by themselves** when it's done (your stock is back up, the monolith is renewed);
- if you `DONE` or `DROP` one, it stays away **until its condition clears**; if the condition comes back later, so does the item;
- `LEDGER DISMISSED` lists the ones you've sent away that are still waiting to clear; `LEDGER RESTORE harvesting` brings one back now (`RESTORE ALL` for every one).

| Link | From | The item |
| --- | --- | --- |
| `harvesting-ledger` | harvesting | "Harvest run", when any plant falls below 90% of its minimum stock; gone once all are back at their minimum. |
| `talpieces-ledger` | talpieces | One when a colour's set is complete, and one listing spare pieces to trade once you hold 16 or more. |
| `magi-ledger` | [magi](magi.md) | "Collect N pearls", when a crystal shape falls below 90% of its minimum. |
| `sigils-ledger` | sigils | "Sigil patrol: N monoliths to renew (M missing), first …", due on the day the first flagged monolith runs out. |
| `self-ledger` | self | "Explore a new area", when your explorer rank drops while you play. Stays until you mark it done. |

Each is on as soon as both packages are installed; `LOOM LINKS` lists them, and `LOOM LINK <id> OFF` switches one off and takes its item back.

## Working with other packages

Besides the reminders above, Ledger shares what it knows:

| Package | What it gets |
| --- | --- |
| patrolling, standings | today's Achaean day, for their own dates |
| social (link `ledger-online`) | a quill ✎ in the Online tab on people your open items name (as a capitalised word: "pay back Ana" names Ana), red when one is overdue, amber when one is due within 5 days, the items on hover |
| social (link `ledger-login`) | those items after the person's login notice: "Ana has awoken. · ledger: #1 Return the book (in 1d)" |

## Troubleshooting

- **"cannot read …" when adding.** Dates are `15th Miraman 1015` (or `15 Miraman 1015`) or `+N days|months`, optionally followed by `repeat`. Month names are the game's.
- **The date is wrong or missing.** `LEDGER DATE` asks the game again.
- **A reminder from another package keeps coming back.** That's its condition still holding (stock still low, say). `DONE`/`DROP` keeps it away until the condition clears; `LOOM LINK <id> OFF` stops that kind altogether.
