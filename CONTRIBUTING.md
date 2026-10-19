# Contributing to Loom

Thanks for wanting to help. Loom is a suite of reflex packages for Achaea's Nexus client, kept as readable source in this repository and built into `.nxs` files players import.

There are many ways to help, and most don't need code:

- **Report a bug or a missed game line** with the [bug report form](https://github.com/neijel-achaea/loom/issues/new/choose). The exact line the game showed is often all that's needed.
- **Share class data**: attack lines, rage costs, a tuned `DEFCON EXPORT`. See [Adding or fixing a class](docs/dev/adding-a-class.md).
- **Suggest a feature or a new package** with the feature idea form.
- **Change a package** and open a pull request. The rest of this page is for that.

## Before you start

- Read the [contributor docs](docs/dev/README.md): how the repository is laid out, the conventions every package follows, and the Nexus scripting quirks that will otherwise cost you an evening.
- **Loom is reflexes, not a bot.** Every package answers something the player started, finishes it and stops. Changes that add recast loops, walking routes, or runs that restart themselves won't be accepted: see [Safety and fair play](docs/safety.md#where-loom-stops-and-why).
- For anything bigger than a fix, open an issue first, so the design can be agreed before you write it.

## The workflow

1. **Branch from `main`.** One change per branch.
2. **Edit the source** in `packages/<name>/`, not the built file in `dist/`. If you changed a package inside Nexus, export it and bring it back with `python3 tools/extract.py Export.nxs --name <name>` (see [Layout and build](docs/dev/layout-and-build.md)).
3. **Bump the package's version** once per pull request: the last number for a fix, the middle one for new behaviour ([Conventions](docs/dev/conventions.md#versions)).
4. **Build it**: `python3 tools/build.py <name>`. Commit the rebuilt `dist/<name>.nxs` with your source changes.
5. **Refresh the docs** if you changed a HELP table, a version or an integration: `python3 tools/docs.py`, and update the package's page in `docs/` by hand where the behaviour changed.
6. **Test it**: without the game first (`python3 tools/check.py <name>` and `python3 tools/smoke.py <name>`, then whatever else [Testing](docs/dev/testing.md) suggests), then in game.
7. **Open a pull request** against `main`.

## What a pull request carries

Every pull request description has:

- **A table of the changes**, package by package.
- **The version** each package moves to.
- **What was tested without the game** (syntax check, simulations, previews).
- **An in-game test checklist**: the steps someone should take in Nexus to see that it works, as checkboxes.
- **A download link for testing**: the raw link to `dist/<name>.nxs` at your branch's commit.

And it doesn't touch `dist/versions.json`: a workflow rewrites that on `main` after every merge.

Pull requests that change different packages can be merged in any order. Two that change the same package conflict on its `.nxs`, so the second is opened against the first's branch and merged after it.

## Code of conduct

Everyone taking part is expected to follow the [code of conduct](CODE_OF_CONDUCT.md).

## Security issues

Security issues (anything that could make a package act for someone else, leak private data or bypass the security package) go through the private reporting described in [SECURITY.md](SECURITY.md), not public issues.

## Licence

Loom is MIT-licensed ([LICENSE](LICENSE)); by contributing, you agree that your contribution is licensed the same way.
