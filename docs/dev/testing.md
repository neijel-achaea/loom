# Testing

Test without the game first: it's faster, it can be repeated, and it catches most mistakes before a player's character is involved. Then test in game, following the checklist your pull request carries.

## 1. Build and syntax-check

```sh
python3 tools/build.py vials
python3 tools/check.py vials
```

`check.py` compiles every function and every alias and trigger script in the built package the way Nexus runs them, without running them: a top-level `return`, an unclosed brace or a stray character fails here, with the item's name, instead of failing silently in game. Run it over everything (`python3 tools/check.py`) after any change that touches several packages.

If you changed a HELP table, a version or an integration, also run `python3 tools/docs.py --check`.

## 2. Smoke-test

```sh
python3 tools/smoke.py            # every package
python3 tools/smoke.py vials      # one package (others load where a scenario needs them)
python3 tools/smoke.py -v vials   # with the first lines of each stack
```

Packages must degrade, never throw: a script that throws in Nexus stops halfway, often leaving state half-changed, and the player sees nothing. `smoke.py` runs the built packages in node (`tools/smoke.js`, on the stubbed Nexus page in `tools/sim.js`) through the situations that cause that:

- each package alone: installed fresh, fed ordinary GMCP, every command run with the usual subcommands, every tab drawn, every trigger fired; then reloaded and uninstalled;
- each package with loom only (its integrations waiting on the other side), and every package together but one, for each one;
- no GMCP at all, and commands, tabs and triggers before the first GMCP (login order shuffled);
- every package together with odd GMCP payloads: `{}`, `null`, `""`, `[]`, text, a number;
- every saved variable a package reads set to one bad value at a time: empty, broken JSON, `null`, a list, a number, a newer shape.

It lists each script that throws, with the scenarios it threw in, and two softer problems: an orange notice repeated on prompt after prompt (one notice per problem, never one per prompt), and calls into a package that isn't installed (listed only: Nexus logs those and carries on). It exits 1 if anything throws, so run it with `check.py` after building, over everything when a change touches several packages.

The usual fixes are in [Conventions](conventions.md#the-rules) (*GMCP payloads*, *Saved tables*).

## 3. Upgrade test

```sh
python3 tools/upgrade.py                 # every release since 0.2
python3 tools/upgrade.py loom-v0.7.0     # one release
python3 tools/upgrade.py -v              # also the commands typed and the settings saved
```

Players import new versions over old ones, and nothing they set up may be lost. `upgrade.py` takes each release since 0.2 from its git tag (fetching the tag into a shallow clone if needed) and runs it in node with the same stubbed Nexus page as `smoke.py` (`tools/sim.js`):

1. the release is installed and set up: every command its HELP lists that sets something is typed once, with a value that isn't the default (commands that wipe, stop, undo or act in the game are skipped);
2. the current build is imported over it, one package at a time in the same page, so new packages meet old ones mid-way;
3. the next login runs the current build in a fresh page with the same variables;
4. the release is loaded again over that (a downgrade).

All of it runs twice: alphabetically with the first of each `ON|OFF`-style choice, then in reverse order with the last one and every optional value filled in, so a setting gets changed whichever way its default goes.

It checks every saved variable against **[Saved variables](variables.md)**: a *setting* keeps its value or is migrated into the row that names it under *Was*; *data* is still there; nothing still saved is left unread by the current build (a rename without a migration); every variable the current build uses is listed, and every listed one is used; nothing in the current build throws while it's imported; and the downgraded release doesn't throw (it may start fresh). It exits 1 on any problem.

It also names the settings no release saved while being set up (the run says nothing about those) and the ones new since the last release, which it checks from the next release on.

**When packages merge** (crystalism and artificing into magi), name them in `MERGED` at the top of `tools/upgrade.js`: the old packages are set up from each release like any other, uninstalled when their successor is imported, and their settings are checked through the successor's *Was* rows.

**When you add, rename or reshape a variable**, add its row to [Saved variables](variables.md) in the same pull request: a rename keeps the old name as a *legacy* row, names it under *Was* on the new row, and the package copies it across once on load, then deletes it.

**Measuring cost.** `tools/sim.js` caches compiled scripts by default. `nexusCompile(true)` compiles every call behind a ~100-line prelude, as Nexus does, and `COMPILED` counts the scripts run and characters compiled. Use it to compare two builds of a busy session before trusting a speed-up, then confirm with `LOOM PERF` in game.

## 4. Test patterns against real lines

Before relying on a trigger, test its pattern, as built, against the game's actual lines: the ones it must match and some it must not (another player's version of the same line, say). In node:

```js
const pkg = JSON.parse(require("fs").readFileSync("dist/fishing.nxs", "utf8"));
const all = [];
(function walk(items) { for (const i of items) { all.push(i); if (i.items) walk(i.items); } })(pkg.items);
const t = all.find(i => i.type === "trigger" && /nibbling/.test(i.text));
const re = new RegExp(t.text, t.case_sensitive ? "" : "i");
console.log(re.exec("You feel a fish nibbling on your hook."));
```

Test the pattern from the built `.nxs`, not the source: escaping in `package.json` is where patterns usually go wrong.

## 5. Simulate in node

Package code is plain JavaScript that calls a handful of Nexus functions. Stub those, and a package runs in node: you can call its setup, send it GMCP messages, feed it game lines and look at what it sends and draws.

A minimal harness:

```js
const fs = require("fs");
const pkg = JSON.parse(fs.readFileSync("dist/vials.nxs", "utf8"));

// Every function by name, and every trigger/alias in order (many are unnamed).
const fns = {}, reflexes = [];
(function walk(items) { for (const i of items) {
  if (i.type === "function") fns[i.name] = i.code;
  if (i.type === "trigger" || i.type === "alias") reflexes.push(i);
  if (i.items) walk(i.items);
} })(pkg.items);

// The Nexus calls the code uses.
const vars = {}, sent = [], notices = [], tabs = {};
global.client = {};
global.get_variable = k => vars[k];
global.set_variable = (k, v) => { vars[k] = v; };
global.delete_variable = k => { delete vars[k]; };
global.send_command = c => sent.push(c);
global.display_notice = t => notices.push(t);
global.set_custom_tab_html = (name, html) => { tabs[name] = html; };
global.gag_current_line = () => {};
global.colorize_current_line = () => {};
global.run_function = (name, args) => new Function("args", fns[name])(args);

// Timers you flush by hand, so a test controls time.
let timers = [];
global.setTimeout = (f, ms) => { timers.push(f); return timers.length; };
global.clearTimeout = () => {};
global.setInterval = () => 0;
global.clearInterval = () => {};
const flush = (rounds = 10) => { for (let r = 0; r < rounds && timers.length; r++) { const t = timers; timers = []; t.forEach(f => f()); } };

// Run it.
run_function("vials_setup");
new Function("args", reflexes[0].actions[0].script)(["vials set health 12345", "set health 12345"]);
flush();
console.log(sent, notices);
```

Things that help:

- **Key triggers and aliases by position**, not name: several are often unnamed.
- **Replay a trigger** by running its script with the match array as `args` (`args[0]` the whole line, `args[1]` the first group…).
- **Send GMCP** by running `onGMCP` with `{ gmcp_method: "Room.Info", gmcp_args: { … } }`.
- **Flush timers in bounded rounds**: some packages re-queue a timer forever (social's poll).
- **Control time** by stubbing `Date.now` and advancing it by hand, for anything timed (hunts, sessions, cooldowns).
- **For integrations**, load loom and both packages into one harness, and test with each of the two missing too.
- **Run harnesses from a scratch folder**, not inside the repository, so files they write don't end up in a commit.

### Here's loyal probe

`node tools/probes.js` plays room's silent `PROBE` against the game on a clock, packet by packet: every packet ends with its prompt line (a standard prompt, or a custom one showing health and mana), the prompt message (Char.Vitals) comes ahead of the text or after it, and each probe is answered a round trip (150 ms) after it goes out. Eight situations: walking, walking fast and following someone (passing through: nothing may be probed), lingering in each room while someone speaks, a second session over the same rooms (remembered loyals known on arrival, never probed again), standing while mobs walk in, a mob that walks in and attacks (nothing probed while you lose health, probed once calm), and a line nobody asked for arriving between a probe and its answer (hidden, then shown again in order). A hidden line that room shows again afterwards counts as kept. It fails if a room, say, arrival, attack or prompt line is lost, a probe's answer shows, lines shown again are out of order, a mob in a calm room isn't read, a remembered loyal is probed again, or a probe goes out while passing through or within the calm time (`R.probeCalmMs`) of a blow. The cases come from real logs (Ricardo, 2026-10-24). Run it after any change to the probe in `room_setup.js` or `room_gmcp.js` (#393, #396).

## 6. Preview a tab

A tab's HTML can be checked by eye before going in game: capture it from `set_custom_tab_html` in a simulation, wrap it in a page the width of a tab, and screenshot it with a headless browser:

```js
// preview.js, with playwright installed (npm i playwright)
const { chromium } = require("playwright");
(async () => {
  const html = require("fs").readFileSync("tab.html", "utf8");
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 380, height: 800 }, deviceScaleFactor: 2 });
  await p.setContent('<body style="background:#000;width:380px;margin:0">' + html + "</body>");
  await p.screenshot({ path: "tab.png", fullPage: true });
  await b.close();
})();
```

For tabs with clicks, load the whole package into the page and click through it there.

## 7. Test in game

1. Import the built `.nxs` from your branch (the raw link to `dist/<name>.nxs` at your commit).
2. Reimporting runs the package's setup again, keeping its saved settings, so no restart is needed. A new tab registers itself; a changed tab icon needs a page reload.
3. Walk through the checklist in your pull request, ticking each step.
4. Check the package still works **alone**, and with the packages it integrates with.

Before a release, run the whole [regression checklist](regression.md). When your pull request's in-game checklist has steps worth repeating at every release, add them there in the same PR.
