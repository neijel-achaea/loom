# PartyComms

*Shares your vitals, rage and target with your party, and shows everyone's in the Party tab.*

<!-- loom:version partycomms -->
*This page describes partycomms 0.2.8.*
<!-- /loom:version -->

## What it is

When everyone in a party runs PartyComms, each of you can see how the others are doing. Your package sends a short report over party tell whenever something changes (at most once a second, and at least every ten), and hides everyone's reports from the main window. The **Party** tab turns them into one **chip** per member:

- name, class and level,
- four slim bars: health, mana, endurance and willpower,
- rage,
- their target, in green when it's the same as yours.

A member who hasn't reported for 12 seconds fades (a lost connection, or they left); after two minutes they're dropped.

Your vitals, rage, class and target come from the game (GMCP). When the game doesn't say what your target is, PartyComms looks it up quietly with `IH` and hides the reply.

## Commands

<!-- loom:commands partycomms -->
| Command | What it does |
|---|---|
| `PARTYCOMMS` | sharing on or off, your target, and who you've heard from |
| `PARTYCOMMS ON\|OFF` | start or stop sharing |
| `PARTYCOMMS NAME [<name>]` | your name, if the game hasn't sent it since you imported |
| `PARTYCOMMS CLEAR` | forget the party's reports |
| `PARTYCOMMS TEST` | two sample members, to check the tab solo |
| `PARTYCOMMS DEBUG` | internal state |
| **Sharing switches itself off when you're not in a party; PARTYCOMMS ON after joining one.** | |
| **Everyone in the party needs this version: older reports are ignored.** | |
<!-- /loom:commands -->

`PARTYCOMMS` shows whether sharing is on, your target, and who you've heard from. `PARTYCOMMS TEST` adds two sample members to the tab so you can see how it looks on your own; `PARTYCOMMS CLEAR` removes them (and any real reports).

If you imported PartyComms mid-session and the game hasn't sent your name since, `PARTYCOMMS NAME Ana` tells it.

## Setting it up

1. **Import `partycomms.nxs`** (see [Getting started](getting-started.md)). **Everyone in the party needs the same version**: reports in an older format are ignored.
2. **Create the tab.** Add a custom tab named exactly **`Party`**. If it doesn't appear, reset the UI layout. Its icon shows right away.
3. **Join a party** and `PARTYCOMMS ON`.

Sharing is on unless you switch it off, but it **switches itself off when you're not in a party** (the game answers "You are not the member of any party." to the report). After joining one, `PARTYCOMMS ON` again.

## Daily use

Keep the Party tab in view while hunting together: a member whose health bar is dropping needs help, a green target means you're on the same mob. The reports go over party tell, so the party channel itself stays readable: you never see the raw lines.

Nothing is sent while triggers are paused (`LOOM PAUSE ON`).

## Working with other packages

PartyComms reads nothing from other packages. With **room** installed, the Here tab shows each party member's target: link `partycomms-room` puts their names (◂ Filune · Ojec) after the mob they're targeting, from reports under 30 seconds old; you're left out (your own target glows). `LOOM LINK partycomms-room OFF` stops it. For the party's gold split, see [huntstats](huntstats.md#hunting-with-a-party).

## Troubleshooting

- **Nobody shows in the tab.** Everyone needs PartyComms, the same version, and sharing on (`PARTYCOMMS`). Check you're in a party.
- **Sharing keeps switching off.** You aren't in a party: the game's answer turns it off. Join one, then `PARTYCOMMS ON`.
- **Your own chip has no name.** `PARTYCOMMS NAME <your name>`, or log in again.
