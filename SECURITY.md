# Security policy

Loom runs inside your Achaea client. Many of its triggers react to game text, and some of that text comes from other players. A flaw can therefore let someone else make your client act for you. Please report flaws privately so they can be fixed before anyone hears about them.

## Supported versions

Only the latest release gets security fixes. Fixes also land on `main` as soon as they are merged. If you are on an older release, update to the newest one (`LOOM UPDATES` lists what is out of date).

| Version          | Supported |
| ---------------- | --------- |
| Latest release   | ✅        |
| `main`           | ✅        |
| Older releases   | ❌        |

## What counts as a security issue

- **Commands sent on someone else's behalf.** A trigger or alias that another player can set off with a say, tell, emote, channel message, name or item description, and that makes your client send commands. Anything that could move gold or items, change settings or put your character at risk is the most serious.
- **Injection into tabs.** Text from the game (names, channel lines, item names, room titles) that ends up as HTML or script in a Loom tab (Here, Comms, Online, Stats and the others) instead of plain text.
- **Bypassing the security package.** Ways to steal from, or act against, a player that the `security` package should catch but doesn't.
- **Leaking private data.** Saved variables, tells or notes that end up somewhere another player can see, such as a channel, a party message or a public emote.

Bugs that only affect you (a wrong number, a missed line, a tab that looks off) are ordinary bugs. Please open a normal issue for those.

## How to report

Use GitHub's private reporting at **[Report a vulnerability](https://github.com/neijel-achaea/loom/security/advisories/new)**, or the *Security* tab → *Report a vulnerability*.

Please include:

- the package and its version (shown by `LOOM UPDATES` or the package's `HELP`),
- the exact game line(s) involved, copied from your client,
- what happened, and what you expected to happen,
- whether another player can cause it, and how.

Please don't post it in a public issue, on a game channel or on the forums until a fix is out.

## What to expect

Loom is a hobby project with one maintainer, so please allow some time for a reply. A reply usually comes within a week. You'll be told whether the report is accepted, and you can follow the fix in the private advisory. Once the fix is released, the advisory is published, with credit to you if you'd like it.
