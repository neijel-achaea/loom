# Chronicle

*A record of each Achaean day: where you went, what was said, what you read, and what you did.*

<!-- loom:version chronicle -->
*This page describes chronicle 0.2.0.*
<!-- /loom:version -->

> **Before you turn on summaries: cost and privacy.** The record itself stays with your character and costs nothing. Summaries are optional, and turning them on (`CHRONICLE KEY`) means:
>
> - **They cost money, on your own Anthropic API key.** Each Achaean day you play (one real hour) is one paid request, and so is each month and year. With the default model (Haiku) a busy day costs a fraction of a cent; with a larger model (`CHRONICLE MODEL`) it can be around twenty times that. Anthropic bills you directly; Loom never sees your key or your bill. `CHRONICLE` shows the tokens used so far, and `CHRONICLE SUMMARIES OFF` or `CHRONICLE KEY CLEAR` stops it.
> - **Other people's words leave the game.** Each day's record, including what other players said and emoted around you, their tells to you, and the letters, messages and news you read, is sent to Anthropic to write the summary, along with your `CHRONICLE VOICE` notes, what the game says of your character, and, with standings or ledger installed, your WHO descriptions and dealing notes for the people in it and your ledger goals and items (`LOOM LINK standings-chronicle OFF` or `ledger-chronicle OFF` keeps them out). Anthropic's terms for its API apply to that data. Other players haven't agreed to this: if someone would rather not be included, `CHRONICLE IGNORE <name>` leaves them out, and it's courteous to honour that whenever asked. What has already been sent can't be recalled.
> - **Your key is stored in this browser** (its local storage), not in your Nexus settings or any file Loom exports. Anyone with access to this browser profile could read it: don't set it on a shared computer.

## What it is

Chronicle keeps a record of what happens to your character, one Achaean day (one real hour) at a time, in a **Chronicle** tab. It's meant as the raw material for a journal: read it back, or export it and write from it.

It keeps by itself:

- **Places**: each area you spend a minute or more in, and each room you stay in for five minutes or more, with who was there.
- **IC channels**: say, tells, yell, your city, house and order, house newbie, group, clans, and the gods' emotes. Other channels (party, newbie, market…) are left out; `CHRONICLE CHANNELS` lists what you've heard this session and `CHRONICLE CHANNEL <name> ON|OFF` changes it. Anything after `//` in a line is taken as OOC and left out.
- **Your custom emotes** (`EMOTE`, and roleplay's ambient ones), from the game's "You have emoted: …". Socials ("You skip about merrily.") aren't kept.
- **Emotes** by other players in your room: lines that start with their name, except their talk (which comes with the channels) and their comings and goings. Someone with more than six such lines in a minute is fighting, not emoting: their lines are left out for two minutes. Housekeeping (curing, putting gold away, wielding, following) is left out too.
- **Repeats** of the same line within two minutes count up the first one (×10) rather than filling the record.
- **What you read**: letters, messages and news posts, up to the prompt. A news post read over several MOREs is kept as one entry; a message or post read again isn't kept twice.
- **Leaving someone out**: `CHRONICLE IGNORE <name>` keeps nothing of theirs from then on (what they say, their tells to you and yours to them, their emotes, messages and posts), leaves them off the lists of who was there, and puts "someone" where another line names them. What was already kept about them is removed at once; summaries already written stay as they are (`CHRONICLE WRITE <day>` rewrites one). `CHRONICLE IGNORE` lists them, `CHRONICLE UNIGNORE <name>` records them again. Use it for anyone who'd rather not be in your record or sent to the summariser.
- **Notes** of your own: `CHRONICLE NOTE <text>`, for whatever the record can't see.

The date comes from the game's own date lines (each new day's, or `DATE`), or from **ledger** when it's installed. From one known date, Chronicle works out any moment's day, since a new Achaean day begins at the top of every real hour. Entries from before the first date are kept under "Before the date was known" and move to their day once it's known.

The record keeps the last 30 days you played in, and is saved with your character's settings, so it follows you from one computer to another. `CHRONICLE EXPORT` downloads all of it as a Markdown file; if the browser doesn't start a download, `CHRONICLE EXPORT SHOW` prints it in the main window to copy.

## Summaries

With your own API key, Chronicle writes a short summary of each Achaean day when it ends (about a hundred words), shown in the tab above that day and in the export. It uses Anthropic's API: **it costs money on your key** (a little per day played), and **each day's record is sent to Anthropic**, including what others said around you. Without a key, Chronicle is just the record.

- `CHRONICLE KEY <key>` stores your key **in this browser only**, never in your Nexus settings (they're kept by IRE and travel in .nxs files). On another computer, set it again. `CHRONICLE KEY CLEAR` removes it.
- The voice has three layers: a chronicler's voice that fits Achaea (built in); what the game says of your character (race, class, age, city, house, order, from GMCP; in dragonform your race is remembered from before); and your own notes, `CHRONICLE VOICE <text>`: who they are, what they're after, the people around them, how they speak. The notes shape what the summaries notice; they aren't repeated.
- `CHRONICLE PERSON THIRD` (default) writes a chronicler's record; `PERSON FIRST` writes it as your character's own journal.
- Each summary sees the one before, for continuity. Game mechanics, numbers and out-of-character talk are left out, and nothing is invented.
- A day that ends while you're away is written at your next login. A summary that fails is tried again after 30 seconds, 2 minutes and 10 minutes, then left: `CHRONICLE WRITE <day>` tries one again by hand, `CHRONICLE RETRY` all of them. A rejected key or model stops and tells you.
- `CHRONICLE WRITE TODAY` writes the day so far (marked "so far"; rewritten when the day ends). `CHRONICLE SUMMARIES OFF` stops the automatic ones; `CHRONICLE MODEL <id>` changes the model (default `claude-haiku-5-5`). `CHRONICLE` shows how many have been written and the tokens used.

### Months and years

The tab has three views, **Days**, **Months** and **Years** (click them, or `CHRONICLE VIEW DAYS|MONTHS|YEARS`). When an Achaean month ends (about a day of real time), its summary is written from the summaries of the days you played in it, and your notes; when a year ends (about twelve days), from its months. Each is about two hundred words, and sees the one before it. `CHRONICLE WRITE MONTH` writes this month so far (or `WRITE MONTH <name>` a past one), `CHRONICLE WRITE YEAR [number]` the same for years. Months shows this year's and last year's; Years shows them all. The export starts with the years and months, then the days.

The lines of a day are kept while it's among the last 30 played (or until the record is too big); its summary is kept longer, and once its month has a summary the day's own can go when space runs short. Months and years are kept for good.

## Commands

<!-- loom:commands chronicle -->
| Command | What it does |
|---|---|
| `CHRONICLE` | today's date and what has been recorded |
| `CHRONICLE NOTE <text>` | add a note of your own to today's record |
| `CHRONICLE CHANNELS` | the channels heard this session, and which are kept |
| `CHRONICLE CHANNEL <name> ON\|OFF` | keep or leave out a channel (TELLS for all tells) |
| `CHRONICLE CHANNEL <name> DEFAULT` | back to the default for that channel |
| `CHRONICLE KEY <key>\|CLEAR` | your Anthropic API key, kept in this browser only (summaries need it) |
| `CHRONICLE VOICE [text\|CLEAR]` | your notes on the character, for the summaries |
| `CHRONICLE PERSON FIRST\|THIRD` | a chronicler's record (third, default) or the character's journal |
| `CHRONICLE SUMMARIES ON\|OFF` | a summary at the end of each Achaean day (on) |
| `CHRONICLE WRITE [day]` | write a day's summary now: today, yesterday, or e.g. 8 Scarlatan |
| `CHRONICLE WRITE MONTH\|YEAR [which]` | write a month's or year's now (this one so far if none named) |
| `CHRONICLE RETRY` | try again every summary that failed, and write what's due |
| `CHRONICLE VIEW DAYS\|MONTHS\|YEARS` | what the tab shows (or click the headings) |
| `CHRONICLE MODEL [id\|DEFAULT]` | the model that writes them |
| `CHRONICLE IGNORE\|UNIGNORE [name]` | leave someone out of the record (and its summaries) entirely |
| `CHRONICLE EXPORT` | download the whole record as a Markdown file |
| `CHRONICLE EXPORT SHOW` | print the last export here, if no download started |
| `CHRONICLE DEBUG` | internal state |
| `CHRONICLE RESET` | rebuild from the saved variables (the record is kept) |
| `CHRONICLE CLEAR CONFIRM` | throw the whole record away |
| **Kept by itself: areas you spend a minute in, rooms you stay five minutes in (and who was** | |
| **there), IC channels (say, tells, yell, city, house, order, clans, the gods' emotes), emotes** | |
| **in your room, and letters, messages and news you read. Anything after // is taken as OOC.** | |
| **The record keeps the lines of the last 30 Achaean days you played in (one Achaean day is one** | |
| **real hour), and summaries for longer, saved with your character's settings. Summaries need** | |
| **your own Anthropic API key (CHRONICLE KEY): each day's record is sent to write them, at a cost.** | |
<!-- /loom:commands -->

## Setting it up

1. **Import `chronicle.nxs`** (see [Getting started](getting-started.md)).
2. **Make a custom tab called `Chronicle`** to see the record.
3. **Check the channels** after a while: `CHRONICLE CHANNELS` lists the ones you've heard, and which are kept.

## Daily use

Nothing: it records as you play. Add a `CHRONICLE NOTE` when something happens it can't see (a conversation in a room you didn't stay in, a decision). Export now and then to keep a copy.

## Working with other packages

Chronicle works on its own. Loom's integrations add to the record and give the summaries context: who the people in a day are to you, and what you're working towards; each is a link, on as soon as both packages are installed; `LOOM LINKS` lists them, `LOOM LINK <id> OFF` switches one off.

| Link | With | What it does |
| --- | --- | --- |
| `standings-chronicle` | standings | For each person named in a day (or month) being summarised: their pronouns and who they are to you (`STANDINGS <name> PRONOUNS`, `WHO`), their band and the notes of your last few dealings. |
| `ledger-chronicle` | ledger | Your goals (`LEDGER GOAL`): those open, those achieved in the stretch being written (so the summary marks them) and before; and the open ledger items that name the day's people. |
| `huntstats-chronicle` | huntstats | Each hunt huntstats files is a line in the day's record: the area, how long, and who hunted with you. Switching the link off takes the current day's hunts back out; earlier days are kept. |

Other packages can add to the record through its entry: `client.loom.chronicle.entry.record({ source, key, text, at })`, once per source and key.

## Troubleshooting

- **The tab is empty.** Make a custom tab named exactly `Chronicle`.
- **A channel I want isn't kept.** `CHRONICLE CHANNELS` shows its name; `CHRONICLE CHANNEL <name> ON`.
- **"date not yet known".** Type `DATE`, or wait for the next hour's date line.
- **Fighting alongside someone filled the record.** Tell us the lines (a [bug report](https://github.com/neijel-achaea/loom/issues/new/choose)): the emote check left them in.
