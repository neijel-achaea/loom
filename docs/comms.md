# Comms

*The Comms tab: every channel, tell and say in one place, in the game's own colours, with unread counts.*

<!-- loom:version comms -->
*This page describes comms 0.1.10.*
<!-- /loom:version -->

## What it is

Comms draws a tab called **Comms** that replaces Nexus's stock communication window. Every line the game sends on a channel (says, tells, party, your city, clan, house, order, newbie…) lands there, timestamped, newest at the bottom, in the colours your game uses for that channel (so your `CONFIG COLOUR` choices carry over).

Across the top, a row of **filters**: All, Tells, Say, Party, then every other channel in the order you first heard it, each with its count of unread lines. Click one to show only that channel.

Everything comes from the game (GMCP): there are no triggers, and the main window is left exactly as it was.

## Commands

<!-- loom:commands comms -->
| Command | What it does |
|---|---|
| `COMMS` | the channels heard, what's muted, how many lines are kept |
| `COMMS VIEW <channel\|name\|ALL>` | what the tab shows: a channel (TELLS, SAY, PARTY...), a tell conversation, or All |
| `COMMS MUTE\|UNMUTE <channel>` | leave a channel out of All and its unread count (still kept); the tab's mute link too |
| `COMMS CAP <50-2000>` | lines kept per channel (default 300) |
| `COMMS CLEAR [channel]` | forget every line, or one channel's |
| `COMMS DEBUG` | the last comms GMCP payloads, and the input line tells go to |
| **In the tab: click a filter to show it, a line's channel tag to open that channel, a name to start a tell to them.** | |
| **The Comms tab replaces the stock communication window: create a custom tab named Comms, then close the stock one from the layout if you like.** | |
<!-- /loom:commands -->

Channel names can be shortened: `COMMS VIEW cl` finds the first channel heard whose name starts with "cl". `COMMS VIEW Ana` opens your tells with Ana; `COMMS VIEW ALL` goes back to everything.

**Muting** a channel keeps its lines (you can still open it) but leaves it out of All and stops its unread count. The tab has a mute link next to the filters for the channel you're looking at.

## Setting it up

1. **Import `comms.nxs`** (see [Getting started](getting-started.md)).
2. **Create the tab.** Add a custom tab named exactly **`Comms`**. If it doesn't appear, reset the UI layout. The speech-bubble icon shows after a page reload. You can then close the stock communication window from the layout, if you like.
3. **Talk, or wait.** The tab fills with the first line you hear.

## Daily use

- **All** shows every channel that isn't muted, each line tagged with its channel. Click a tag to open that channel.
- **Tells** lists the people you've been telling, most recent first, with unread counts. Click one to open the conversation, both sides of it.
- **Lines that name you** are marked with a violet bar, so they stand out when you scroll back.
- **Click a name** to start a tell: `t Ana ` appears in the input line, ready for your message.
- **Unread counts** go up for lines from others on channels you aren't looking at, and clear when you open the channel.
- **Scrolling.** If you're at the bottom, the tab follows new lines. If you've scrolled up to read back, it leaves you there.

Comms keeps 300 lines per channel (`COMMS CAP` to change it). The latest few lines of each channel (up to 40, and 300 in all) are saved, so the tab isn't empty after a page reload.

## Working with other packages

Comms reads nothing from other packages on its own. With others installed, Loom's integrations add to the tab. Each is a link, on as soon as both packages are installed; `LOOM LINKS` lists them, `LOOM LINK <id> OFF` switches one off.

| Link | With | What it does |
| --- | --- | --- |
| `social-comms` | social | Talkers' names, the people in Tells and the open conversation's header in their social group colour (or their standing's colour, with `SOCIAL COLOURS STANDINGS`). |
| `standings-comms` | standings | Your standing with a talker on hover over their name: icon, band and score ("☠ Nemesis -7.0"). |
| `room-comms` | room | A green leaf after the names of people last seen with a newbie title (Uaithne, Ithin, Tuqad). |

## Troubleshooting

- **Clicking a name doesn't put a tell in the input line.** `COMMS DEBUG` shows whether Comms found Nexus's input line. Report it with that output.
- **A channel shows under a strange name.** Comms names a channel from the prefix on its lines ("(Party): ") or the game's channel list. Report the line if it gets it wrong.
- **Old lines are gone.** Only the newest 300 per channel are kept, and fewer survive a page reload. `COMMS CAP 1000` keeps more.
