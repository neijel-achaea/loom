# Magi

*For Magi: refine crystals evenly, pick up pearls, open sonic portals for your city, choose your staff attack and form elemental treaties without anything breaking them.*

<!-- loom:version magi -->
*This page describes magi 0.1.0.*
<!-- /loom:version -->

## What it is

Magi gathers the helpers for the Magi's skills in one package. Until 0.1.0 they were two packages, **crystalism** and **artificing**; magi replaces both (see [Upgrading from crystalism and artificing](#upgrading-from-crystalism-and-artificing)). It's also where the class's PvP help will live ([Loom 2.x](https://github.com/neijel-achaea/loom/milestones)).

**Crystalism**

- **Even refining.** `MAGI REFINE` reads your rift (`IR CRYSTAL`) and your stored facets (`TOUCH CRYSTAL`), then refines the facets into the shapes you have **fewest** of, so your stock levels out instead of piling up in one shape. It sends one `REFINE` every 1.5 seconds, at most 200 crystals a run (or fewer: `MAGI REFINE 50`), and `MAGI REFINE STOP` cancels it.
- **Pearls.** When a pearl tumbles out of a corpse, it's picked up (`MAGI PEARLS`, on by default).
- **Sonic portals.** With `MAGI PORTAL ON`, a city member who tells you "Gate." gets a sonic portal (`EMBED SONICPORTAL <name>`). Anyone not in your city gets a polite refusal. Off by default.
- **Attuning.** While you attune to your Master Crystal, anything sent would break it, so Loom's packages are paused until the crystal calls you back.

**Artificing**

- **The staff attack.** `STAFF CAST` uses one of three attacks: scintilla (fire), horripilation (frost) or lightning. `MAGI STAFF FROST` chooses which, and **hunting**'s staff key and the **basher** follow it.
- **Elemental treaties.** Forming a treaty takes a while, and anything sent in the meantime breaks it, your curing's sipping included. `MAGI TREATY djinn` (or `MAGI TF djinn`) pauses Loom's packages, turns sipping off (`CURING SIPPING OFF`) and starts the treaty. When the game says "Thus is our treaty written", packages resume and sipping goes back on.

**Elementalism**

- **Floods.** "This area is unnaturally flooded with water." is highlighted in cyan, so a flooded room stands out (useful against fires).

## Commands

<!-- loom:commands magi -->
| Command | What it does |
|---|---|
| `MAGI` | status |
| `MAGI REFINE [n]` | refine stored facets into the shapes you have fewest of (at most n crystals, 200 a run) |
| `MAGI REFINE STOP` | cancel a refine run |
| `MAGI MIN [<n> \| <shape> <n\|DEFAULT>]` | minimum stock per shape (default for all, or one shape) |
| `MAGI PEARLS ON\|OFF` | pick up pearls that drop from corpses |
| `MAGI PORTAL ON\|OFF` | open a sonic portal for city members who tell you "Gate." (needs social's city list) |
| `MAGI STAFF FIRE\|FROST\|LIGHTNING` | the attack STAFF CAST uses (scintilla, horripilation, lightning) |
| `MAGI TREATY <elemental>` | form a treaty (also MAGI TF): pauses triggers and sipping until it's written |
| `MAGI RESUME` | unpause triggers and turn sipping back on, if a treaty was interrupted |
| `MAGI DEBUG` | internal state |
| **Elementals: waterweird, djinn, sandling, efreeti, stoneback, breath, mistfiend, ashbeast.** | |
| **Triggers pause while you attune to the Master Crystal and resume when it calls you.** | |
<!-- /loom:commands -->

### Minimum stock

Every crystal shape has a minimum: 50 by default. `MAGI MIN 80` sets the default; `MAGI MIN torus 120` one shape's; `MAGI MIN torus DEFAULT` puts it back. The minimums don't change how refining works (it always levels the lowest shapes first); they decide when the ledger reminds you to collect pearls (see below).

### Treaties

If a treaty is interrupted (you're attacked, you move), nothing comes back on by itself: `MAGI RESUME` unpauses Loom and turns sipping back on.

## Setting it up

1. **Import `magi.nxs`** (see [Getting started](getting-started.md)).
2. **`MAGI STAFF FIRE`** (or FROST, or LIGHTNING) for your staff attack.
3. **For portals**, install **social** too and let it learn your city: the portal answers only names on social's city list. Then `MAGI PORTAL ON`.
4. **Run `MAGI REFINE` once** so the rift counts are known.

### Upgrading from crystalism and artificing

1. Import `magi.nxs`.
2. **Uninstall crystalism and artificing.** Until you do, magi warns at every load and leaves pearl pickup and portals to the old crystalism, so nothing is done twice.
3. Reload. Your settings (staff attack, pearls, portal, minimums, rift counts) have been copied to magi's own names, and the old ones are deleted once the old packages are gone.

The commands change from `CRYSTALISM …` and `ARTIFICING …` to `MAGI …`; `CRYSTALISM STOP` is now `MAGI REFINE STOP`. The integrations are now called `magi-ledger` and `magi-room`; one you had switched off stays off. A pearls reminder already in the ledger from crystalism is replaced by magi's.

The **elementalism** package is retired: its illusions and set pieces were one player's roleplay content. Keep your copy installed if you use them. Its flood highlight is in magi.

## Daily use

When facets have piled up, `MAGI REFINE` and let it work through them; `MAGI` shows how far it's got, the staff attack, and any treaty under way. Leave pearl pickup on while hunting. Set the staff attack for the area you're hunting (what the mobs are weak to), and form treaties with `MAGI TREATY` instead of the game's command, so nothing breaks them.

## Working with other packages

| Package | How |
| --- | --- |
| hunting | Reads the staff attack for its staff key, and redraws the keys when it changes. |
| basher | Reads the staff attack for its staff casts. |
| social | Its city list decides who gets a sonic portal. Without social, nobody does. |
| ledger | Link `magi-ledger`: when a crystal shape falls below 90% of its minimum, the ledger gets "Collect N pearls" (one pearl per 9 crystals short). It goes once every shape is back at its minimum. `LOOM LINK magi-ledger OFF` stops it. |
| room | Link `magi-room`: in the Here tab, barnacle encrusted oysters (the denizens that drop pearls) and glistening iridescent pearls lying in the room show with a green name and a green ◉. Corpses stay grey, and your target's glow still wins. `LOOM LINK magi-room OFF` stops it. |

## Troubleshooting

- **A refine run stalls.** It waits while Loom is paused (attuning pauses it until the Master Crystal calls). `MAGI REFINE STOP` and start again if needed.
- **The portal refuses a city member.** They aren't on social's city list yet: `SOCIAL LIST city`.
- **Pearls aren't picked up.** `MAGI` shows whether pickup is on. If magi warns that crystalism is still installed, it leaves pearls to it: uninstall crystalism.
- **Everything stopped after a treaty.** It was interrupted before the closing line: `MAGI RESUME`.
- **The staff key casts the wrong attack.** `MAGI` shows the attack set; change it with `MAGI STAFF`.
