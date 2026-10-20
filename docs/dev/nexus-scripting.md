# Nexus scripting

Nexus runs package code as JavaScript in the page, but with quirks. These are the ones the packages are built around; each cost someone an evening once.

## Scripts and functions

- **No top-level `return`.** A function's code or a trigger's script is run as a body without a function around it, so a bare `return` is a syntax error. Use an `if` block, or put a helper on the package's namespace and call it.
- **Function expressions, arrow functions, local `function` declarations and `setTimeout` all work.** (Older advice said otherwise; it's out of date.)
- **`run_function(name, args, "package")` needs the package name**, and the called function receives `args` only as Nexus passes them, which in practice isn't a reliable way to hand over data. Packages pass data through their namespace instead: set `client.loom.<pkg>.args = …`, then `run_function("<pkg>_cmd", [], "<pkg>")`.
- **Each function is its own scope.** A `var` in one function isn't visible in another; share through `client.loom.<pkg>`.
- **Every script is compiled on every run.** Nexus's `exec_script` builds a prelude declaring each API function (`var send_command = NexusAPI.send_command; …`, about a hundred of them), then compiles that prelude plus the script with `new Function`, every single time, with no cache. Measured in game: about 0.09 ms per run, plus 0.06 ms per 1,000 characters of script, comments included. It only matters for scripts that run very often (`onGMCP`, triggers that fire on every line, renders): keep those short and put the work in helpers made once at setup on the package's namespace. Each `run_function` pays the price again. A build step that would do this for every long script is shelved in #328.
- **`client` is Nexus's own `nexusclient`**, the object behind the whole client. Its internals (`_reflexes`, `_datahandler`, `_variables`) aren't a published API; only `LOOM PERF` reaches into them, and only while a sample runs.
- **Rerunning setup is normal.** Reimporting a package runs `onInstall`/`onLoad` again in the same page: timers from the last run are still alive. Keep their handles on the namespace and clear them before setting new ones (`if (R.timer) clearInterval(R.timer);`).

## Triggers and aliases

- **"Match whole words only" must be off** on every trigger: the packages' patterns are written to match on their own.
- **In a regex trigger, `args[0]` is the whole match**, `args[1]` the first group, and so on.
- **Escaping in `package.json`:** patterns are JSON strings, so a regex `\.` is written `\\.`. Test the built pattern against real game lines, not the source text.
- **Unnamed triggers are common**, and several can share a name. When simulating, key triggers and aliases by their position, not by name.
- **`gag_current_line()`** hides the line; **`colorize_current_line(start, length, fg, bg)`** colours part of it.

## Variables

- **Nexus variables are per character.** `get_variable`/`set_variable` read and write the logged-in character's list, so per-character records need no extra key.
- **Values may come back as strings or objects** depending on how they were saved. Parse defensively: `try { x = JSON.parse(get_variable("pkg_x") || "{}") || {}; } catch (e) { x = {}; }`.
- **`client.*` is wiped on a page reload**; variables survive. Anything that must survive a refresh mid-activity is checkpointed to a variable (huntstats saves the hunt under way every few seconds).

## GMCP

- **`onGMCP` receives every message**: check `args.gmcp_method` and return early for the rest. Payloads arrive in `args.gmcp_args`, sometimes as a string to parse.
- **Your name comes only at login** (`Char.Name`, `Char.Status`). A package that needs it keeps it in its own variable, for a reload mid-session.
- **The class comes only at login and on a change.** Packages that follow it keep the last one seen.
- **Defences arrive at login or on `DEF`.** After a mid-session import, a package that needs them may have to wait, or borrow them from another package's `look`.
- **The order of GMCP messages and game lines isn't guaranteed.** Don't compute something from "vitals plus the hits seen since"; measure from the readings themselves.

## Custom tabs

- **`set_custom_tab_html(name, html)`** fills a custom tab the player created with exactly that name. Never use a name Nexus already has (that's why the room tab is called Here).
- **Injected `<script>` doesn't run.** Tabs are static HTML and inline SVG; Canvas and chart libraries don't work.
- **A tab's page shares `window` and `document`** with package scripts, **but can't reach `client.*`.** Clicks reach the package through closures the setup puts on `window` (`onclick="window.loomComms.tell('Ana')"`), or by toggling a class on `document.body`.
- **Keep UI state out of the tab's HTML.** Each render rewrites it, so something like "the offline section is folded" lives as a class on `document.body`, with a `<style>` element (injected once by id, its text refreshed on each draw) that acts on it. Toggling inline styles that the next render rewrites makes the tab flicker.
- **Filling the tab**: give the panel `min-height:100%; box-sizing:border-box`, and style `.flexlayout__tab:has(#<panel id>)` so the tab's background matches.
- **Tab icons** are CSS keyed on the tab button's `title`, injected once per page from `onLoad`, so a changed icon needs a page reload.
- **Redraw after clearing.** A tab showing state that a function clears must be redrawn after the clear, not before.

## Output

- **`display_notice(text, colour)`** prints a line. For the HELP table, `nexusclient.add_html_line` prints a monospace block when the client has it; packages fall back to `display_notice` when it doesn't.
- **`send_command(cmd)`** sends to the game. Nexus splits a command on `|` and can expand `@name` as a variable, so a message meant to carry either needs another character (partycomms uses `~`).
