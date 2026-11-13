# Chronicle

*A record of each Achaean day: where you went, what was said, what you read, and what you did.*

<!-- loom:version chronicle -->
*This page describes chronicle 0.1.0.*
<!-- /loom:version -->

## What it is

Chronicle keeps a record of what happens to your character, one Achaean day (one real hour) at a time, in a **Chronicle** tab. It's meant as the raw material for a journal: read it back, or export it and write from it.

It keeps by itself:

- **Places**: each area you spend a minute or more in, and each room you stay in for five minutes or more, with who was there.
- **IC channels**: say, tells, yell, your city, house and order, house newbie, group, clans, and the gods' emotes. Other channels (party, newbie, market…) are left out; `CHRONICLE CHANNELS` lists what you've heard this session and `CHRONICLE CHANNEL <name> ON|OFF` changes it. Anything after `//` in a line is taken as OOC and left out.
- **Your custom emotes** (`EMOTE`, and roleplay's ambient ones), from the game's "You have emoted: …". Socials ("You skip about merrily.") aren't kept.
- **Emotes** by other players in your room: lines that start with their name, except their talk (which comes with the channels) and their comings and goings. Someone with more than six such lines in a minute is fighting, not emoting: their lines are left out for two minutes. Housekeeping (curing, putting gold away, wielding, following) is left out too.
- **Repeats** of the same line within two minutes count up the first one (×10) rather than filling the record.
- **What you read**: letters, messages and news posts, up to the prompt. A news post read over several MOREs is kept as one entry; a message or post read again isn't kept twice.
- **Notes** of your own: `CHRONICLE NOTE <text>`, for whatever the record can't see.

The date comes from the game's own date lines (each new day's, or `DATE`), or from **ledger** when it's installed. From one known date, Chronicle works out any moment's day, since a new Achaean day begins at the top of every real hour. Entries from before the first date are kept under "Before the date was known" and move to their day once it's known.

The record keeps the last 30 days you played in, and is saved with your character's settings, so it follows you from one computer to another. `CHRONICLE EXPORT` downloads all of it as a Markdown file; if the browser doesn't start a download, `CHRONICLE EXPORT SHOW` prints it in the main window to copy.

## Summaries

With your own API key, Chronicle writes a short summary of each Achaean day when it ends (about a hundred words), shown in the tab above that day and in the export. It uses Anthropic's API: **it costs money on your key** (a little per day played), and **each day's record is sent to Anthropic**, including what others said around you. Without a key, Chronicle is just the record.

- `CHRONICLE KEY <key>` stores your key **in this browser only**, never in your Nexus settings (they're kept by IRE and travel in .nxs files). On another computer, set it again. `CHRONICLE KEY CLEAR` removes it.
- The voice has three layers: a chronicler's voice that fits Achaea (built in); what the game says of your character (race, class, age, city, house, order, from GMCP; in dragonform your race is remembered from before); and your own notes, `CHRONICLE VOICE <text>`: who they are, what they're after, the people around them, how they speak. The notes shape what the summaries notice; they aren't repeated.
- `CHRONICLE PERSON THIRD` (default) writes a chronicler's record; `PERSON FIRST` writes it as your character's own journal.
- Each summary sees the one before, for continuity. Game mechanics, numbers and out-of-character talk are left out, and nothing is invented.
- A day that ends while you're away is written at your next login. A summary that fails is tried again after 30 seconds, 2 minutes and 10 minutes, then left: `CHRONICLE WRITE <day>` tries again by hand. A rejected key or model stops and tells you.
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
| `CHRONICLE VIEW DAYS\|MONTHS\|YEARS` | what the tab shows (or click the headings) |
| `CHRONICLE MODEL [id\|DEFAULT]` | the model that writes them |
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

Chronicle works on its own. Loom's integrations add to the record; each is a link, on as soon as both packages are installed; `LOOM LINKS` lists them, `LOOM LINK <id> OFF` switches one off.

| Link | With | What it does |
| --- | --- | --- |
| `huntstats-chronicle` | huntstats | Each hunt huntstats files is a line in the day's record: the area, how long, and who hunted with you. Switching the link off takes the current day's hunts back out; earlier days are kept. |

Other packages can add to the record through its entry: `client.loom.chronicle.entry.record({ source, key, text, at })`, once per source and key.

## Troubleshooting

- **The tab is empty.** Make a custom tab named exactly `Chronicle`.
- **A channel I want isn't kept.** `CHRONICLE CHANNELS` shows its name; `CHRONICLE CHANNEL <name> ON`.
- **"date not yet known".** Type `DATE`, or wait for the next hour's date line.
- **Fighting alongside someone filled the record.** Tell us the lines (a [bug report](https://github.com/neijel-achaea/loom/issues/new/choose)): the emote check left them in.
