# Safety and fair play

*What the game allows, what Loom does on its own, and how to stay on the right side of the rules.*

## The game's rules come first

Achaea's rules on triggers and automation are in its help file **[15.8 Triggers, Automation, and Auto](https://achaea.com/game/helpview?id=490)** (`HELP 15.8` in game). Read it before using any package that acts for you. In short:

- Triggers are allowed in most cases.
- **Automating anything you use to gain gold or experience is not**: the help file names auto ratting, fishing, questing, prospecting and hunting among its examples.
- Triggered actions that **someone else can call on you to perform** are not allowed either.
- Its test: if your character can carry on after you walk away from the computer, there's a problem.
- Breaking these rules is treated as a very serious violation, and can cost you your character for good.

Loom can't decide for you what the game allows. The help file is the authority, and the game's administrators are the ones to ask when you're unsure. **You are responsible for how you use these packages.**

## How Loom is built

Loom's packages are meant for a player at the keyboard:

- Nothing walks for you. No package moves your character, except the basher's single step back when you're hurt.
- Nothing starts a fight for you. The basher waits for your own first attack.
- Things that run on their own stop: the basher when the room has no more targets or someone arrives, fishing when the fish is landed, a ritual when it's done.
- Everything that sends commands stops at once with `LOOM PAUSE ON`; the basher has its own kill switch, `BASHER STOP`.
- The basher and harvesting always load **off**.

Being designed this way doesn't make every use of a package allowed. Weigh each one against the help file.

## What acts on its own

The packages below send commands without you typing each one. Check them against the rules before relying on them, and never leave them on while you're away.

| Package | What it does by itself | When it stops |
| --- | --- | --- |
| [basher](basher.md) | After your first attack: attacks on each recovery, fires battlerage, razes shields, picks the next target in the room, flees one step when hurt, asks for `DIAGNOSE` | room empty of targets; after the current fight when someone arrives, tells you or names you; at once with `BASHER STOP` |
| [fishing](fishing.md) | After your cast: teases, jerks and reels on the game's cues | the fish is landed or lost |
| [harvesting](harvesting.md) | While on: harvests and stores what's short in each room you enter | `HARVESTING OFF` |
| [hunting](hunting.md) | Autogold picks up gold from your kills (if set) | `HUNTING AUTOGOLD OFF` |
| [crystalism](crystalism.md) | Picks up pearls; a refine run sends `REFINE` until done; **opens a sonic portal when a city member tells you "Gate."** (off by default) | `CRYSTALISM PEARLS OFF`, `STOP`, `PORTAL OFF` |
| [civic](civic.md) | **Accepts lesson requests** from others (not enemies) | `LOOM PAUSE ON` |
| [conjuration](conjuration.md) | A ritual's steps, one after another | the ritual ends, `CONJURATION STOP` |
| [talpieces](talpieces.md) | Queues `TALISMAN COMBINE` for each row of your listing (on by default) | `TALPIECES COMBINE OFF` |
| [defcon](defcon.md) | Sets curing priorities; raises insomnia when it clears; a pear when you choke underwater; setup commands at login | `DEFCON INIT AUTO OFF` for the login part |
| [security](security.md) | Puts back watched items and backpack gold that are taken | `SECURITY ANTITHEFT OFF` |
| [social](social.md) | Polls `QW` every 5 seconds (hidden) | `SOCIAL POLL OFF` |
| [sigils](sigils.md), [patrolling](patrolling.md) | Probe or check each room you enter; patrolling reports lightning to your clan | `SIGILS WATCH OFF`, `PATROLLING OFF` |
| [vision](vision.md), [partycomms](partycomms.md) | Tell your party about enemies nearby; share your vitals | `VISION ALERT OFF`, `PARTYCOMMS OFF` |
| [loom](loom.md) | Agrees to convert up to 100 bound credits into lessons when you ask the game to | — |

The two marked in bold respond to **other people's requests**, which is what the help file's rule on triggered actions others can call on you is about. Read it before turning them on.

## Good habits

- **Stay at the keyboard** whenever the basher, fishing or harvesting is on.
- **Switch them off** before you step away: `BASHER STOP`, `HARVESTING OFF`, or simply `LOOM PAUSE ON`.
- **When unsure, ask** the game's administration rather than assuming.
- Curing is not part of Loom: use the game's own server-side curing (`CURING ON`).
