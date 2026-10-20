# Hunting

*Your class's attacks on the F-keys, lit when they're ready, with battlerage cooldowns, attack lines tagged, dragon attacks and gold pickup.*

<!-- loom:version hunting -->
*This page describes hunting 0.4.57.*
<!-- /loom:version -->

## What it is

Hunting lays out Nexus's F-key buttons for the class you're in, and keeps them honest:

- **F1 is your main attack**, lit whenever you have balance and equilibrium. While the basher is running, F1 is its STOP key instead (ends the run, stays primed).
- **Battlerage abilities** sit on the next keys, each lit only when it's ready: off its own cooldown, the shared battlerage cooldown clear, and enough rage.
- **Extras** on F8 to F12: your class's utility (a mode, a panic key, a heal), the Stats key (with huntstats), `DIAGNOSE` and `TOUCH SHIELD`.

Every class in the game has a layout, and every dragon colour. When you change class, morph or specialisation, the keys follow.

It also:

- **tags your attack lines** in the main window with the ability's name and a colour, and starts that ability's cooldown from them;
- highlights **critical hits** by tier, and lines like shields forming and fading on mobs;
- hides a few noisy lines some classes print on every hit;
- **picks up gold** that spills from your kills (`HUNTING AUTOGOLD`), into your backpack when **security** knows it;
- for dragons, switches between **gut** and **incantation** by hand or by whichever pool is fuller.

Your class, specialisation, balance, equilibrium and rage come from the game (GMCP); the rest from the game's lines.

## Commands

<!-- loom:commands hunting -->
| Command | What it does |
|---|---|
| `HUNTING` | status |
| `HUNTING DRAGONMODE [PHY\|MAG\|AUTO]` | gut, incantation, or whichever pool is fuller (no argument: next mode) |
| `HUNTING AUTOGOLD [ON\|ALL\|OFF]` | pick up gold from your kills, from any corpse, or not at all |
| `HUNTING PARTYTARGET [name\|OFF]` | who party-aimed keys act on (the druid's Remedy key) |
| `HUNTING AFTERFORM [cmd\|OFF]` | command sent when dragonform rises or falls, e.g. DEFCON UP |
| `HUNTING MAIN [name]` | your class's main attack on F1 (no name: list them) |
| `HUNTING MAIN <name> = <command>` | add one for this class, e.g. to try an attack; empty command removes it |
| `HUNTING TOGGLE <name> [ON\|OFF]` | class toggles on the F-keys, e.g. the Serpent's SNEAK and WEAVE |
| `HUNTING BUTTONS` | lay out the F-keys again |
| `HUNTING RAGE` | rage, cooldowns and tracked keys |
| `HUNTING RESET` | clear rage cooldowns, lay out the F-keys again |
| `HUNTING DEBUG` | internal state |
| **F8 to F12 only show if Nexus is set to 12 buttons: gear icon (bottom right) > Buttons > Button Count.** | |
<!-- /loom:commands -->

### The main attack

`HUNTING MAIN` lists the main attacks your class can put on F1, marking the one in use. `HUNTING MAIN charge` switches to another; the choice is kept per class. Some classes default by specialisation or morph (a knight's F1 follows its weapon specialisation), and changing spec or morph drops your hand-picked choice so F1 follows.

`HUNTING MAIN deathblow = weave deathblow @tar` adds an attack of your own for this class, handy for trying one before it's in the class file; `HUNTING MAIN deathblow =` removes it. `@tar` is your target.

### Toggles

Some classes have something a key switches on and off, such as the Serpent's sneaking. Its key reads "Sneak ON" or "Sneak OFF"; `HUNTING TOGGLE sneak` does the same from the command line. Toggles always load OFF.

### Battlerage

`HUNTING RAGE` shows your rage, each ability's cooldown and which keys are tracked. `HUNTING RESET` clears the cooldowns and lays the keys out again, if they get out of step (after a disconnect, say).

### Dragons

`HUNTING DRAGONMODE PHY` attacks with gut, `MAG` with incantation, `AUTO` with whichever of endurance (gut) or willpower (incantation) is fuller. F8 shows and switches the mode.

`HUNTING AFTERFORM DEFCON INIT` sends a command whenever dragonform rises or falls, to raise the right defences for the new form; `OFF` sends nothing.

### Gold

| Setting | What happens when gold spills from a corpse |
| --- | --- |
| `HUNTING AUTOGOLD ON` | picked up if the kill was yours, in the last 5 seconds |
| `HUNTING AUTOGOLD ALL` | always picked up |
| `HUNTING AUTOGOLD OFF` | left where it lies |

### Party target

`HUNTING PARTYTARGET Ana` sets who party-aimed keys act on, such as a Druid's Remedy key. `OFF` clears it.

## Setting it up

1. **Import `hunting.nxs`** (see [Getting started](getting-started.md)).
2. **Turn on 12 buttons.** Nexus shows 7 F-keys by default: gear icon (bottom right) → Buttons → Button Count → 12. F1 to F7 hold the main keys; F8 to F12 the extras.
3. **Check F1.** `HUNTING MAIN` shows your main attack; pick another if you prefer.
4. **Set a target** the way you usually do (`tar` is what the keys aim at), and press F1.

## Daily use

Use the keys rather than typing: F1 on balance and equilibrium, and the rage keys as they light up. The lit key is the one you can use right now.

In the main window, your hits are tagged with the ability's name, crits stand out by tier, and "You can use Windlash again" lines keep the keys in step with the game.

### The usual layout

| Keys | What's there |
| --- | --- |
| F1 | the main attack |
| F2–F7 | battlerage: the 14-rage hit, the 36-rage hit, afflictions, the 25-rage bonus hit…, and your shieldbreak |
| F8 | a mode or class extra (dragons: the attack mode) |
| F9 | Stats: the hunt under way (with huntstats) |
| F10 | Diag (`DIAGNOSE`) |
| F11 | a panic key or heal, where the class has one (dragons: Dragonheal) |
| F12 | Shield (`TOUCH SHIELD`) |

Exact layouts differ per class; the key labels say what each does.

## Working with other packages

Hunting works on its own. It reads a few packages when they're installed:

| Package | What hunting takes from it |
| --- | --- |
| huntstats | the F9 key, which shows the hunt under way |
| [magi](magi.md) | the staff attack (`MAGI STAFF`) for the staff key |
| security | your backpack, where autogold puts the gold |

And one package builds on it:

| Package | What it takes from hunting |
| --- | --- |
| [basher](basher.md) | the main attack, battlerage costs, keys and order, the shieldbreak and attack lines, all read only. The basher needs hunting installed. |

## Adding or fixing a class

Each class's layout, rage costs and attack lines live in one file under `packages/hunting/classes/`; the [README there](../packages/hunting/classes/README.md) explains the format. When the game rewords an attack, or an ability's line is missing (its key never goes dark after use, or lights on rage alone), [report it](https://github.com/neijel-achaea/loom/issues/new/choose) with the line exactly as the game showed it.

## Troubleshooting

- **F8 to F12 are missing.** Set Nexus's Button Count to 12 (see Setting it up).
- **A rage key stays lit after use, or never lights.** Its attack line isn't known yet, so its cooldown never starts. Report the line. `HUNTING RESET` puts the keys back in step meanwhile.
- **Wrong keys after a class change.** `HUNTING BUTTONS` lays them out again.
- **"isn't one yet: you get the generic keys".** Your class has no layout file: you get Stats, Diag and Shield only.
