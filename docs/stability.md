# What 1.0 keeps stable

*From Loom 1.0 on, what you type and what you've saved keep working through every 1.x release. Anything that would break them waits for 2.0.*

## The promise

Through every Loom 1.x release:

- **Your commands keep working.** Every package's keyword, and every command in its `HELP`, does what it did, with the same words and the same arguments. A release can add commands and options, and give a command more to say, but never removes or renames one.
- **Your settings and data survive.** Every saved variable on the [Saved variables](dev/variables.md) page keeps its name and meaning, or is moved to a new name once, on its own, the first time the new version loads. Updating never asks you to set anything up again, and never loses your books, logs, lists or records.
- **Other code that talks to Loom keeps working.** Your own aliases, triggers and scripts can rely on the parts listed under [For scripts](#for-scripts).
- **Hunting's class files keep their format.** A class file written for 1.0 still loads in every 1.x.

Any change that would break one of these is held back for **Loom 2.0**, and the 2.0 release notes will list each one.

## What isn't covered

These can change in any release, so don't build on them:

- **How things look**: tab layout, colours, icons, themes, column order, what a tab shows where.
- **Wording**: the text of notices, HELP descriptions, status lines and DEBUG output. The colour of a notice keeps its meaning (cyan information, lime done, orange wrong, red alarm), not its words.
- **Internal state**: anything under `client.loom.<package>` that isn't listed under [For scripts](#for-scripts), helper functions, function names inside a package, the order things happen in.
- **Old spellings**: commands renamed before 1.0 that still answer with a notice (`COFFERS`, `STANDINGS`, `LEDGER` and `DMGCHART REBUILD`, now `RESET`). They stop working in Loom 1.1.
- **Retired packages**: groves and reclamation are kept in the repository as they are, without any promise.
- **Packages still at 0.x**: a package added during 1.x starts at 0.1.0 and is outside the promise until it reaches 1.0.0 in a Loom release; its page says so.
- **The game itself**: when Achaea rewords a line or changes an ability, Loom follows the game, even if a key or a notice changes with it.
- **Debug and development commands**: `DEBUG`, `LOOM PERF` output, `FISHINGSTATS DEMO`, `PARTYCOMMS TEST` and the tools in `tools/`.

## For scripts

What your own aliases, triggers and packages can use:

| Part | What's stable | Where it's described |
| --- | --- | --- |
| Commands | Each package's keyword and the commands in its `HELP` (send them with `send_command` like any typed command) | each package's page |
| `pauseTriggers` | A plain variable; "on" stops every Loom package sending commands, and "unset" counts as off | [Conventions](dev/conventions.md) |
| `tar` | Your target, shared with your own aliases | [Saved variables](dev/variables.md) |
| `client.loom.registry` | One entry per installed package: `{ version, keyword, desc }` | [Conventions](dev/conventions.md) |
| `client.loom.notify(source)` | Tell loom a source's state changed, so its links' tabs redraw | [Integrations](dev/integrations.md#redraws-announcing-changes) |
| `client.loom.gone(pkg)` | Called from a package's `onUninstall` | [Integrations](dev/integrations.md#redraws-announcing-changes) |
| Writing entry points | `client.loom.ledger.entry` (`upsert`, `withdraw`, `get`), `client.loom.coffers.entry` (`propose`, `withdraw`), `client.loom.standings.entry` (`suggest`, `withdraw`) | [Integrations](dev/integrations.md#the-entry-points) |
| social's `look` | `client.loom.social.look.groups(name)` and `look.inGroup(name, group)` | [Integrations](dev/integrations.md) |
| Hunting class files | The fields in `packages/hunting/classes/README.md` | [Adding a class](dev/adding-a-class.md) |
| Saved variables | Their names and what they hold | [Saved variables](dev/variables.md) |

## Versions

Each package carries its own [semantic version](https://semver.org), shown by `LOOM`. Every package is 1.0.0 in Loom 1.0. From there:

- a fix bumps the last number (1.0.0 → 1.0.1);
- something new (a command, an option, a tab section) bumps the middle one (1.0.1 → 1.1.0);
- the first number only moves with Loom 2.0.

The **loom** package carries the suite's version: 1.1.0 is Loom 1.1.

## If something breaks

If an update breaks something this page promises, it's a bug: report it as one ([Troubleshooting](troubleshooting.md#reporting-a-bug)), naming the version you came from.
