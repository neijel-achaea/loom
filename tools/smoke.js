// smoke.js -- run built packages in node against missing, late, odd and
// corrupt data, and report every script that throws (#135).
// The Nexus world lives in sim.js. Driven by tools/smoke.py; see its
// docstring. Usage:
//   node tools/smoke.js <dist dir> <json options>
// Options: { only: [pkg...], verbose: bool }
"use strict";
const fs = require("fs");
const path = require("path");

const DIST = process.argv[2];
const OPT = JSON.parse(process.argv[3] || "{}");

const S = require("./sim.js");
const { FIND, STATS, GOOD, ODD_ARGS, METHODS, finding, newWorld, flush, advance, gmcp, load, uninstall, renders, aliases, triggersBlind, promptsQuiet } = S;
const PKGS = S.loadDist(DIST);
S.use(PKGS);
const ALL = Object.keys(PKGS).sort();


// ---- Scenarios ---------------------------------------------------------
// Each runs a fresh world with the given packages and saved variables.
function standard(pkgs, vars, tag, opts) {
  opts = opts || {};
  S.scenario(tag);
  newWorld(pkgs, vars);
  load(opts.install === false ? "load" : "install");
  if (opts.blindFirst) { triggersBlind(); renders(); aliases(); }
  if (opts.gmcp !== false) {
    const order = opts.lateLogin ? GOOD.slice(2).concat(GOOD.slice(0, 2)) : GOOD;
    for (const [m, a] of order) { gmcp(m, a); flush(); }
  }
  if (opts.odd) {
    for (const m of METHODS) for (const a of ODD_ARGS) { gmcp(m, a); flush(); }
    gmcp("Some.Unknown.Message", { x: 1 });
  }
  renders();
  promptsQuiet();
  if (opts.aliases !== false) aliases();
  if (opts.triggers) triggersBlind();
  renders();
  advance(60000);
  if (opts.reload) { load("load"); renders(); }
  if (opts.uninstall) uninstall();
}

// Variables a package reads, each set to something it can't have written.
const CORRUPT = ["", "{not json", "null", "[]", "{}", "{\"a\":{\"b\":1}}", "-1", "NaN", "on", "9999999999", "\u0000", { odd: [1, 2] }, [1, "two"], 12345, true];

const only = (OPT.only && OPT.only.length) ? OPT.only : ALL;
const t0 = Date.now ? 0 : 0;

// 1. Every package alone, fresh, with ordinary GMCP; then reloaded and uninstalled.
for (const p of only) standard(p === "loom" ? ["loom"] : [p], {}, p + " alone", { reload: true, uninstall: true, triggers: true });
// 2. Every package alone with loom (integrations waiting on the other side).
for (const p of only) if (p !== "loom") standard(["loom", p], {}, p + " + loom", {});
// 3. No GMCP at all (offline, or a client with GMCP off): commands, tabs, triggers.
for (const p of only) standard(p === "loom" ? ["loom"] : ["loom", p], {}, p + " without GMCP", { gmcp: false, triggers: true });
// 4. Before anything: triggers, tabs and commands before the first GMCP.
for (const p of only) standard(["loom", p].filter((x, i, a) => a.indexOf(x) === i), {}, p + " before login", { blindFirst: true, lateLogin: true });
// 5. Odd GMCP payloads, every package together.
standard(ALL, {}, "all, odd GMCP", { odd: true, triggers: true });
// 6. Everything together, reloaded over itself (an upgrade).
standard(ALL, {}, "all, reloaded", { reload: true });
// 7. Corrupt saved variables: each package with every variable it reads set
//    to one bad value at a time.
for (const p of only) {
  const names = Array.from(PKGS[p].vars);
  for (let i = 0; i < CORRUPT.length; i++) {
    const vars = {};
    for (const n of names) vars[n] = CORRUPT[i];
    standard(["loom", p].filter((x, j, a) => a.indexOf(x) === j), vars, p + " corrupt vars #" + i, { install: false, aliases: true, triggers: true });
  }
}
// 8. Everything but one package: every integration with its other side gone.
for (const p of only) standard(ALL.filter(x => x !== p), {}, "all but " + p, {});

// ---- Report -----------------------------------------------------------
const rows = Array.from(FIND.values()).sort((a, b) => (a.pkg + a.where).localeCompare(b.pkg + b.where));
const byPkg = {};
for (const r of rows) (byPkg[r.pkg] = byPkg[r.pkg] || []).push(r);
const filter = OPT.only && OPT.only.length ? rows.filter(r => OPT.only.includes(r.pkg)) : rows;
if (OPT.json) { console.log(JSON.stringify(filter.map(r => Object.assign({}, r, { scenarios: Array.from(r.scenarios) })), null, 1)); }
else {
  let last = "";
  for (const r of filter) {
    if (r.pkg !== last) { console.log("\n" + r.pkg); last = r.pkg; }
    const sc = Array.from(r.scenarios);
    console.log("  " + r.kind.padEnd(8) + r.where + ": " + r.msg + "  [" + sc.slice(0, 3).join("; ") + (sc.length > 3 ? "; +" + (sc.length - 3) + " more" : "") + "]");
    if (OPT.verbose && r.stack) console.log("           " + r.stack);
  }
  const pk = Object.keys(byPkg).filter(p => !OPT.only || !OPT.only.length || OPT.only.includes(p));
  if (OPT.verbose) console.log("\nran " + STATS.runs + " scripts " + JSON.stringify(STATS.byKind) + "; " + STATS.sent + " commands sent; tabs drawn: " + Array.from(STATS.tabs).sort().join(", "));
  console.log("\n" + filter.length + " problem" + (filter.length === 1 ? "" : "s") + " in " + pk.length + " package" + (pk.length === 1 ? "" : "s") + " (" + only.length + " checked)");
}
process.exit(filter.some(r => r.kind !== "missing") ? 1 : 0);
