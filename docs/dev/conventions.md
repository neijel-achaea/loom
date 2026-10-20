# Conventions

The rules every package follows, and why. They're what lets a player drop any one package onto any character, and lets packages that have never heard of each other work together.

## Principles

1. **Standalone guaranteed, together better.** Every package works fully on its own; another package being installed only *adds* behaviour. *Why:* players pick what they want, and a missing package must never break one they have. The one exception is the basher, which needs hunting's class data (it reads it and never writes to it).
2. **Read what you need yourself.** Each package gets its own room, class, city and environment from GMCP in its own `onGMCP`. *Why:* no package can depend on another being loaded first, or at all.
3. **Check before you touch.** Anything shared (`pauseTriggers`, another package's `look`) is read defensively: used when present, skipped silently when not.
4. **One command per package**, normally its name, with `HELP` and a bare call that shows status. Old aliases are retired, not kept alongside. *Why:* a player can always find a package's commands with one word.
5. **Suggest, don't apply.** Anything generated (a ledger reminder, a coffers goal, a standing) is tagged with its source, can be withdrawn by it, and is never applied without the player seeing it. *Why:* these are the player's judgements, not the package's.
6. **Data in tables, not in code.** Anything that differs per class, city or player (abilities, rage costs, plant lists, greetings, names) lives in a table. *Why:* another player can use the package by filling in their own values.
7. **Reflexes, not a bot.** A package answers something the player started, finishes it and stops: no loops, no walking, nothing that keeps a character earning while the player is away. *Why:* the game forbids it ([Safety and fair play](../safety.md)), and players trust Loom not to put their characters at risk.

## The rules

| Topic | Convention | Why |
| --- | --- | --- |
| **Runtime state** | Everything under `client.loom.<package>`, with the full package name | One place per package; nothing collides |
| **Creating the namespace** | `if (!client.loom) client.loom = {};`, then the same for the package's own object. Never assign `client.loom` outright | One package assigning it wipes every other package's state |
| **Variables** | Prefixed with the package name (`coffers_days`, `ledger_items`), and listed in [Saved variables](variables.md). Old names are migrated once on load, then deleted | Nexus variables are one flat list per character |
| **Setup** | Data is kept across a rerun of setup; helper functions and tables are rebuilt every time | A reimport brings in changed code at once, without a page reload, and without losing the player's data |
| **Registration** | `client.loom.registry.<package> = { version, keyword, desc }` in setup | `LOOM` and `LOOM UPDATES` list what they find there |
| **Command** | One alias, `^<keyword>(?:\s+(.*))?$`, case-insensitive | See principle 4 |
| **Help** | `<package>_help` prints a `[command, description]` table in a monospace block; one-element rows are notes. Each package carries its own copy of the printing code | Packages are standalone; the player docs read the same table |
| **Notice colours** | **cyan** information (status, HELP, lists); **orange** bad (errors, usage, warnings, something lost); **lime** good (a setting saved, something done or gained); **red** only for alarms to act on at once (security's theft warning). Data printed as data (CSV, tables) and highlight colours keep their own | The colour alone tells a player what kind of message it is |
| **The pause** | `pauseTriggers` is a plain variable; "unset" counts as off. Nothing that sends commands does so while it's on | Any package or reflex can pause all the others without depending on them |
| **Sending** | Only what the player started; check the pause first | See principle 7 |
| **Toggles** | Switches that make a package act (basher, harvesting) load **off** | A reload never leaves something running unnoticed |
| **Other packages** | Never read another package's variables or call its functions. What one offers another goes through its `look` (read) or `entry` (write), and the integration lives in **loom** ([Integrations](integrations.md)) | Packages can change their insides freely |
| **Tabs** | A custom tab with the package's own name (never one of Nexus's own names), house style (ink panel, serif small-caps headings, monospace rows), an icon as CSS keyed on the tab button's title | Players recognise a Loom tab, and nothing clashes with Nexus's tabs |
| **Captures** | Capturing game output (a listing, `QW`) ends on the output's own last line, never on a timer; a long safety timeout only for a reply that never comes. Captures run only when the package asked for the output | A typed command's output is never eaten, and lag never cuts a capture short |
| **GMCP payloads** | Read each message's arguments through a local that is an object whatever came: `var xG = (args.gmcp_args && typeof args.gmcp_args == "object") ? args.gmcp_args : {};` | A message that comes empty, or as text, changes nothing instead of stopping the handler |
| **Saved tables** | A saved table or list is checked for its shape after reading (`typeof`, `Array.isArray`), and anything else starts afresh; `JSON.parse` is always inside `try` | A broken or newer-format variable never stops setup, which would break every reflex of the package |
| **Room state** | Anything read from a check of the room belongs to that room: clear it on the next `Room.Info` | A tab never shows one room's results in another |
| **Patterns** | Lines starting "You …" are anchored at `^You`; weapons, pronouns and names left open (`(.*)`, `(\w+)`) | Other people's versions of the line never match, and every weapon and pronoun does |

### Exceptions to one command per package

- **Wrappers around game commands** keep the game's word: `QUIT`/`QQ`, and `GIVE`/`SELL`/`DROP`/`OFFER` in security. Their whole point is to replace the game command.
- **Everyday shortcuts** stay short: `GG` and `PG` (security), `CL` (fishing).
- **Illusion content** (elementalism's set pieces) is content, not commands.

## Versions

Each package keeps its own [semantic version](https://semver.org), in the registry line of its setup, shown by `LOOM`:

- a fix bumps the last number: 0.2.1 → 0.2.2;
- new behaviour (a new command family, a new tab) bumps the middle one: 0.2.2 → 0.3.0;
- before 1.0, a change that breaks existing use (a renamed command, a changed variable) also bumps the middle one;
- a new package starts at 0.1.0.

Every pull request that changes a package bumps its version once. Packages move independently of each other and of Loom's releases.

**The loom package is the exception:** it carries the suite's version. Between releases it takes patch bumps; when Loom X.Y is released it becomes X.Y.0.

## Definition of done

A package (or a change to one) is done when:

- [ ] it imports into a fresh profile and works with no manual steps and no other Loom package installed;
- [ ] it gets its own GMCP data, and reads anything shared defensively;
- [ ] its state is under `client.loom.<package>`, its variables prefixed and listed in [Saved variables](variables.md), old ones migrated;
- [ ] it has one command with `HELP`, and registers itself;
- [ ] names and items specific to a player are in configuration, not code;
- [ ] its version is bumped, it's built, `check.py`, `smoke.py` and `upgrade.py` pass, and it's tested in the game;
- [ ] its page in `docs/` describes what it does now.
