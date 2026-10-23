# Layout and build

## The repository

| Folder | What's there |
| --- | --- |
| `packages/<name>/` | The source of each package: one `.js` file per function and per alias or trigger script, and a `package.json` holding everything else |
| `dist/` | The built packages, one `<name>.nxs` each, ready to import into Nexus; and `versions.json` |
| `tools/` | The build and maintenance scripts (below) |
| `docs/` | Player documentation, one page per package; `docs/dev/` is this set |
| `research/` | Raw material collected from the game (help files, captured output) |
| `.github/` | Issue forms and the workflow that keeps `dist/versions.json` current |

## What a package is made of

A Nexus package (`.nxs`) is one JSON file: a group with items inside it (functions, aliases, triggers, keybinds). In this repository it's kept apart so the code is readable and its diffs make sense:

```
packages/vials/
  package.json          the group and its items: names, patterns, options, order
  oninstall.js          code of the onInstall function
  onload.js             onLoad
  onuninstall.js        onUninstall
  ongmcp.js             onGMCP
  vials_setup.js        a function of the package's own
  vials_help.js         the HELP table
  alias_vials.js        the script of the VIALS alias
  trigger_elixlist.js   the script of a trigger
```

In `package.json`, a value `"@file:vials_setup.js"` stands for that file's contents. A value `"@cat:head.js classes/*.js"` joins several files in order into one (hunting and DEFCON keep one file per class this way, which Nexus still receives as one function). The `description` is required: one line, at most 80 characters; it's what Nexus and `LOOM` show, and the build fills it into the registry line in place of `"{{description}}"`.

Most packages share the same skeleton:

- **`<pkg>_setup`** builds the package's state under `client.loom.<pkg>`, registers it (`client.loom.registry.<pkg> = { version, keyword, desc }`), migrates old variables once, and defines its helpers. It's safe to run again: data is kept, helpers rebuilt.
- **`onUninstall`** stops the package's timers and calls `client.loom.gone("<pkg>")` (or deletes its registry entry when loom isn't there), so `LOOM` and the integrations drop it at once.
- **`onInstall` and `onLoad`** run the setup. `onGMCP` reads what the package needs from the game, and runs the setup too if the namespace is missing (Nexus doesn't run `onInstall` when importing over an existing package).
- **One alias**, `^<pkg>(?:\s+(.*))?$`, for the package's command, with `HELP` and a bare call that shows status.
- **`<pkg>_help`** prints the HELP table. The player docs read the same table (see `tools/docs.py` below), so a command is documented once.
- **`<pkg>_render`** draws the custom tab, for packages that have one.

## The tools

All of them run from the repository's root with Python 3. `docs.py` also needs `node`.

| Command | What it does |
| --- | --- |
| `python3 tools/build.py` | Builds every package from `packages/` into `dist/` |
| `python3 tools/build.py self ledger` | Builds only those |
| `python3 tools/extract.py Export.nxs --name self` | Splits an `.nxs` exported from Nexus back into `packages/self/`, so a change made in game becomes a readable diff |
| `python3 tools/check.py` | Compiles every script of the built packages as Nexus runs them (a top-level `return` or an unclosed brace fails here) |
| `python3 tools/smoke.py` | Runs every built package in node against missing, late, odd and corrupt data, and lists every script that throws ([Testing](testing.md#2-smoke-test)) |
| `python3 tools/upgrade.py` | Imports the current build over every release since 0.2 in node, and checks no setting was lost and every saved variable is in [Saved variables](variables.md) ([Testing](testing.md#3-upgrade-test)) |
| `python3 tools/versions.py` | Writes `dist/versions.json`, the version of every built package (`--check` only tests it) |
| `python3 tools/docs.py` | Fills the generated blocks in `docs/` (`--check` only reports stale pages) |
| `python3 tools/screens.py` | Draws every tab with invented data and saves the screenshots in `docs/img/` (needs node and playwright); run it when a tab's look changes |

**Build** checks each description and resolves every `@file:` and `@cat:` reference. `extract.py` and `build.py` round-trip exactly: extracting a built package and building it again gives the same file.

**Versions.** `dist/versions.json` is what `LOOM UPDATES` reads in game to tell players which packages are out of date. A workflow (`.github/workflows/versions.yml`) rewrites it on `main` after every push that changes a built package, so branches leave it alone.

**Docs.** Pages in `docs/` carry generated blocks between markers; everything outside them is written by hand:

```
<!-- loom:commands coffers -->   the package's HELP table, as a Markdown table
<!-- loom:version coffers -->    "This page describes coffers 0.3.2."
<!-- loom:links all -->          every integration in loom_links.js
```

Run `python3 tools/docs.py` after changing a HELP table, a version or an integration, and commit the pages it updates.

## Releases

Loom's releases follow its milestones: milestone *Loom 0.6 · Autobasher* is released as tag `loom-v0.6.0` with a zip of every `.nxs` in `dist/` and release notes listing each package's version. A release is cut when its milestone closes. If `main` has already moved on by then, it's cut on a `release/X.Y` branch from the commit where the milestone ended.
