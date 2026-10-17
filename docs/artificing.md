# Artificing

*For Magi: chooses the attack your staff casts, and forms elemental treaties without anything interrupting them.*

<!-- loom:version artificing -->
*This page describes artificing 0.2.2.*
<!-- /loom:version -->

## What it is

Two small helpers for the Magi's Artificing skill:

- **The staff attack.** `STAFF CAST` uses one of three attacks: scintilla (fire), horripilation (frost) or lightning. `ARTIFICING STAFF FROST` chooses which, and **hunting**'s staff key follows it.
- **Elemental treaties.** Forming a treaty takes a while, and anything sent in the meantime breaks it, your curing's sipping included. `ARTIFICING TREATY djinn` (or `ARTIFICING TF djinn`) pauses Loom's packages, turns sipping off (`CURING SIPPING OFF`) and starts the treaty. When the game says "Thus is our treaty written", packages resume and sipping goes back on.

Elementals: waterweird, djinn, sandling, efreeti, stoneback, breath, mistfiend, ashbeast.

## Commands

<!-- loom:commands artificing -->
| Command | What it does |
|---|---|
| `ARTIFICING` | the staff attack, and any treaty under way |
| `ARTIFICING STAFF FIRE\|FROST\|LIGHTNING` | the attack STAFF CAST uses (scintilla, horripilation, lightning) |
| `ARTIFICING TREATY <elemental>` | form a treaty (also ARTIFICING TF): pauses triggers and sipping until it's written |
| `ARTIFICING RESUME` | unpause triggers and turn sipping back on, if a treaty was interrupted |
| `ARTIFICING DEBUG` | internal state |
| **Elementals: waterweird, djinn, sandling, efreeti, stoneback, breath, mistfiend, ashbeast.** | |
<!-- /loom:commands -->

If a treaty is interrupted (you're attacked, you move), nothing comes back on by itself: `ARTIFICING RESUME` unpauses Loom and turns sipping back on.

## Setting it up

1. **Import `artificing.nxs`** (see [Getting started](getting-started.md)).
2. **`ARTIFICING STAFF FIRE`** (or FROST, or LIGHTNING) for your staff attack.

If you used the older `staffAttack` variable, it moves over the first time Artificing loads.

## Daily use

Set the staff attack for the area you're hunting (what the mobs are weak to), and form treaties with `ARTIFICING TREATY` instead of the game's command, so nothing breaks them.

## Working with other packages

**hunting** reads the staff attack for its staff key (and redraws the keys when it changes). Artificing reads nothing from other packages.

## Troubleshooting

- **Everything stopped after a treaty.** It was interrupted before the closing line: `ARTIFICING RESUME`.
- **The staff key casts the wrong attack.** `ARTIFICING` shows the attack set; change it with `ARTIFICING STAFF`.
