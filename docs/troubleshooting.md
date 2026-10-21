# Troubleshooting

*Problems that aren't about one package, and how to report a bug.*

Each package's page ends with its own troubleshooting. Start here when the trouble is with Loom as a whole: tabs, pausing, updates, data.

## Tabs

**A tab doesn't appear.** A package's tab only shows in a custom tab created with **exactly** its name, capitals included: `Here`, `Online`, `Comms`, `Self`, `Stats`, `Coffers`, `Ledger`, `Level`, `Party`, `Standings`, `Talismans`, `DmgChart`, `Basher`, `fishingstats`, `fishinglog`. If it's named right and still blank, reset Nexus's UI layout and add it again.

**A tab's icon is missing.** Icons are added once per page load: reload the page after importing.

**A tab is empty.** Most tabs fill from what the game sends: move or `LOOK` (Here), wait for a prompt (Coffers, Level), type `DIAG` and `DEF` (Self). Each page's setup section says what its tab needs first.

**Here or Comms replaced the stock windows.** That's the idea: you can close Nexus's own Room tab and communication window from the layout. Loom's tabs don't need them.

## Nothing is being sent

**Check the pause.** `LOOM PAUSE OFF`. Loom pauses itself while you sleep, meditate or wade into the Mnemosyne, and a treaty or Master Crystal attunement (magi) pauses it until they finish. If one of those was interrupted, the pause may still be on: `LOOM PAUSE OFF`, or `ARTIFICING RESUME` after a treaty.

The pause is the Nexus variable `pauseTriggers`; your own reflexes can use it too.

**Check the package is on.** Several packages have their own switch: `BASHER ON`, `HARVESTING ON`, `PATROLLING ON`, `SIGILS WATCH ON`, `VISION ON`, `PARTYCOMMS ON`. Typing the package's name alone shows its state.

## The F-keys

**F8 to F12 are missing.** Nexus shows 7 buttons by default: gear icon (bottom right) → Buttons → Button Count → 12.

**Keys are wrong after changing class.** `HUNTING BUTTONS` lays them out again.

## Updates and versions

**Is my package up to date?** `LOOM UPDATES` lists the packages here that are older than the newest build. To update, import the newer `.nxs` over the old one: your data and settings stay.

**A package doesn't show in `LOOM`.** Only packages that register themselves are listed; the retired **groves** and **reclamation** don't. Any other missing package: reimport it.

**Old command names.** A few commands were renamed (`DEFCON UP` → `DEFCON INIT`); the old names still work for a while and say what to use instead.

## Your data

**Where is it kept?** In Nexus variables, per character, apart from the packages. Reimporting or updating a package keeps it; each character has its own books, ledger, standings and settings.

**Starting over.** Most packages that keep records have a `WIPE CONFIRM` (or `FORGET CONFIRM`) command. They don't ask twice and can't be undone.

## Integrations

**An integration does nothing.** `LOOM LINKS` shows each link as on, off, or waiting for a package you don't have. Both packages must be installed, and loom too. The full list is on the [loom page](loom.md#integrations).

**A reminder or suggestion keeps coming back.** Its reason still holds (stock still low, a monolith still expiring). Deal with the reason, or `LOOM LINK <id> OFF`.

## Reporting a bug

Use the **[bug report form](https://github.com/neijel-achaea/loom/issues/new/choose)**. It helps to include:

1. **The package and version**: `LOOM` shows them.
2. **What you did and what happened**, and what you expected instead.
3. **The game's lines** around the problem, exactly as shown. Many bugs are a wording the package hasn't seen.
4. **The package's `DEBUG` output**, if it has one (`ROOM DEBUG`, `COMMS DEBUG`, `COFFERS DEBUG`…).

Ideas and requests for new packages go in the same place, with the feature idea form.
