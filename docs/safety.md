# Safety and fair play

*What the game allows, what Loom does on its own, and how to stay on the right side of the rules.*

## The game's rules come first

Achaea's rules on triggers and automation are in its help file **[15.8 Triggers, Automation, and Auto](https://achaea.com/game/helpview?id=490)** (`HELP 15.8` in game). Read it before using any package that acts for you. In short:

- Triggers are allowed in most cases.
- **Automating anything you use to gain gold or experience is not**: the help file names auto ratting, fishing, questing, prospecting and hunting among its examples.
- Triggered actions that **someone else can call on you to perform** are not allowed either.
- Summary: if your character can carry on after you walk away from the computer, there's a problem.
- Breaking these rules is treated as a very serious violation, and can cost you your character for good.

Loom can't decide for you what the game allows. The help file is the authority, and the game's administrators are the ones to ask when you're unsure. **You are responsible for how you use these packages.**

## Where Loom stops, and why

Loom is reflexes, not a bot. Every package answers something **you** started, finishes that one thing, and stops. Nothing in Loom keeps you earning gold or experience while you're away from the keyboard, and that's deliberate: it's the line the game draws, and Loom is built to stay on the right side of it.

What that means in practice:

| Loom does | Loom never does |
| --- | --- |
| Reels in the fish you cast for, then stops | Cast again on its own, or fish on in a loop |
| Keeps attacking in the room where **you** started the fight, then stops | Start a fight, walk to the next room, or clear an area on its own |
| Takes one step back when you're badly hurt | Walk anywhere else |
| Harvests in the rooms **you** walk into | Walk a route for you |
| Runs a ritual or a refine you asked for, then stops | Start one again on its own |

On top of that:

- The basher finishes the fight in progress and starts no new one when another player arrives, tells you something, or names you on your city channel: someone may want your attention.
- Everything that sends commands stops at once with `LOOM PAUSE ON`; the basher has its own kill switch, `BASHER STOP`.
- The basher and harvesting always load **off**, so a reload never leaves them running.

### Don't take it further

**Please don't extend Loom past these limits**: no recasting loop for fishing, no walking route for the basher or harvesting, no restart that keeps a run going on its own, no trigger that turns a single action into an endless one. Each of those turns a reflex into a bot, which is exactly what the game forbids and what Loom is built not to be. A modified package that does any of this is no longer Loom, and the risk to your character is yours alone.

The same goes for using the packages as they are: stay at the keyboard while the basher, fishing or harvesting is on, and switch them off when you step away.

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

The two marked in bold answer **other people's requests** (a portal for someone who asks, a lesson someone requests), much like the "tap me" requests city channels already share. They do one thing per request and nothing more.

## Good habits

- **Stay at the keyboard** whenever the basher, fishing or harvesting is on.
- **Switch them off** before you step away: `BASHER STOP`, `HARVESTING OFF`, or simply `LOOM PAUSE ON`.
- **When unsure, ask** the game's administration rather than assuming.
- Curing is not part of Loom: use the game's own server-side curing (`CURING ON`).
