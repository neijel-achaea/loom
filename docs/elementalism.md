# Elementalism

*Ready-made illusions for roleplay: a scent drifting in, a tattoo fading, and longer set pieces cast one line at a time.*

<!-- loom:version elementalism -->
*This page describes elementalism 0.2.2.*
<!-- /loom:version -->

## What it is

Elementalism's illusions (`CAST ILLUSION <text>`) show the room a line of your choosing. This package keeps a few written ones ready, so a scene doesn't wait while you type:

- **Scents**: `FEEL_FOREST` casts "The scent of wet bark and moss drifts down the stair, as if carried from the woods above." There's one for each of desert, forest, grassland, hill, jungle, mountain, swamp, underground, valley and water.
- **A fading tattoo**: `ILLUSION MOSSTATTOO` casts "A moss tattoo fades from view and disappears."
- **Set pieces**: `PINK_DRAGON` casts a five-line transformation, two seconds apart, with your name and pronouns; `KAWHEDRAGON_F` and `KAWHEDRAGON_M` walk through the eleven steps of the kawhe dragon for someone else, one step per command.

## Commands

<!-- loom:commands elementalism -->
| Command | What it does |
|---|---|
| `ILLUSION MOSSTATTOO [target]` | a moss tattoo fading away, on you or a target |
| `FEEL_<environment>` | a scent drifting in: desert, forest, grassland, hill, jungle, mountain, swamp, underground, valley, water |
| `PINK_DRAGON` | the pink dragon transformation, five lines two seconds apart, with your name |
| `KAWHEDRAGON_F\|M <name> <1-11>` | the kawhe dragon, one step at a time, for someone else |
| `ELEMENTALISM` | the name and pronouns the set pieces use |
| `ELEMENTALISM NAME <name>` | your name, if the game hasn't sent it since you imported |
| `ELEMENTALISM PRONOUNS HE\|SHE\|THEY` | the pronouns PINK_DRAGON uses (default he) |
| `ELEMENTALISM DEBUG` | internal state |
<!-- /loom:commands -->

`KAWHEDRAGON_F Ana 1` casts step 1 with Ana as the subject (`_F` and `_M` choose the pronouns); `KAWHEDRAGON_F Ana 2` the next, and so on to 11, at the pace the scene needs.

## Setting it up

1. **Import `elementalism.nxs`** (see [Getting started](getting-started.md)).
2. **Check your name and pronouns**: `ELEMENTALISM` shows what the set pieces use. Your name comes from the game at login (`ELEMENTALISM NAME <name>` if you imported mid-session); `ELEMENTALISM PRONOUNS SHE` (or HE, THEY) for `PINK_DRAGON`, he by default.

## Daily use

Type the alias when the moment comes. They're plain illusions: each costs what casting one costs, and needs the skill.

## Working with other packages

Elementalism reads nothing from other packages and nothing reads it.

## Troubleshooting

- **"Invalid Illusion".** `ILLUSION` only knows `MOSSTATTOO` so far.
- **The set piece names the wrong person.** `ELEMENTALISM NAME <your name>`.
