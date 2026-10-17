# Numpad movement

*Walk with the number pad, and look, check your score and your inventory with one key.*

<!-- loom:version numpad_movement -->
*This page describes numpad_movement 0.2.2.*
<!-- /loom:version -->

## What it is

Keys on the number pad, laid out as a compass:

| | | |
| :---: | :---: | :---: |
| **7** northwest | **8** north | **9** northeast |
| **4** west | **5** up | **6** east |
| **1** southwest | **2** south | **3** southeast |
| **0** down | **.** look | |

And beside them:

| Key | Sends |
| :---: | --- |
| **+** | `in` |
| **-** | `out` |
| **/** | `score` |
| **\*** | `inventory` |

## Commands

None: it's only the keys.

## Setting it up

1. **Import `numpad_movement.nxs`** (see [Getting started](getting-started.md)).
2. **Turn Num Lock on**, so the number pad sends numbers.

## Working with other packages

Numpad movement reads nothing from other packages and nothing reads it.

## Troubleshooting

- **The keys type numbers into the input line.** Check the package is imported and enabled in Nexus's reflexes.
- **The keys do nothing.** Num Lock is off.
