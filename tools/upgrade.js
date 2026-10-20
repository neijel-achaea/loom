// upgrade.js -- import the current build over an older release and check
// that nothing the player set up was lost (#134).
// The Nexus world lives in sim.js. Driven by tools/upgrade.py; see its
// docstring. Usage:
//   node tools/upgrade.js <json options>
// Options: { current: <dist dir>, releases: [{ tag, dist }], inventory: <md>,
//            next: "<X.Y> of the next release", verbose: bool, json: bool }
"use strict";
const fs = require("fs");
const S = require("./sim.js");

const OPT = JSON.parse(process.argv[2] || "{}");
const CUR = S.loadDist(OPT.current);
const CURNAMES = Object.keys(CUR).sort();
// Packages merged into another: old name -> the package that replaced it.
// They're set up like any release package, and uninstalled when their
// successor is imported, as the player is told to; the successor migrates
// their settings (their names are *Was* rows in variables.md).
const MERGED = { crystalism: "magi", artificing: "magi" };

// ---- The inventory ------------------------------------------------------
// docs/dev/variables.md: one table row per saved variable,
//   | `name` | kind | since | what it holds | was |
// kind: setting (the player chose it), data (built up by play), state (the
// page's own bookkeeping, may change any time), legacy (an old name, read
// once to migrate, then deleted). `was` lists the old names migrated into it.
// A name with <...> in it stands for a family (`self_want_<class>`).
function readInventory(file) {
  const inv = {};
  const fam = [];
  let pkg = "";
  for (const raw of fs.readFileSync(file, "utf8").split("\n")) {
    const h = /^##\s+(\S+)/.exec(raw);
    if (h) { pkg = h[1]; continue; }
    if (!/^\|\s*`/.test(raw)) continue;
    const c = raw.split("|").slice(1, -1).map(x => x.trim());
    const name = c[0].replace(/`/g, "");
    const was = (c[4] || "").match(/`[^`]+`/g) || [];
    const row = { name, pkg, kind: c[1], since: c[2], holds: c[3], was: was.map(w => w.replace(/`/g, "")) };
    if (name.indexOf("<") >= 0) {
      row.re = new RegExp("^" + name.replace(/<[^>]+>/g, "[A-Za-z0-9_]+") + "$");
      fam.push(row);
    } else inv[name] = row;
  }
  return {
    rows: inv, fam,
    get(name) { return inv[name] || fam.find(f => f.re.test(name)); },
    // The variable an old name was migrated into, if any.
    into(old) {
      for (const r of Object.values(inv).concat(fam)) if (r.was.indexOf(old) >= 0) return r;
      return undefined;
    },
  };
}
const INV = readInventory(OPT.inventory);

// ---- Configuring a release ---------------------------------------------
// Each package's HELP lists its commands. Every command that sets something
// is run once with a value that isn't the default, so the release saves
// what a player who used it would have saved. Commands that wipe, end,
// stop or act in the game are skipped.
const SKIP = /^(WIPE|CLEAR|RESET|DEL|DELETE|REMOVE|DROP|DONE|DISMISS|DISCARD|NEW|STOP|END|REBUILD|CONFIRM|DEMO|LEARN|TEST|CAST|MAKE|REFINE|TREATY|RESUME|UNIGNORE|RESTORE|SKIP|INIT|ACCEPT|START|UP|DOWN|EXPORT|CSV|PERF|INSTALL|SEND|GREET|SYNC|PAUSE|UNWANT|UNKEEP|UNWATCH|FORGET|UNDO|UNTAG|UNSET|UNMUTE|UNFLAG)$/;
const VALUES = [
  [/^[a-z]$/, "50"], [/shape/i, "egg"], [/amount|gold|bigcoin/i, "50000"], [/percent|pct/i, "40"], [/^(n|number|count|#|num|qty)$/i, "3"],
  [/minute|min$|seconds?|secs?|hours?|days?/i, "30"], [/god/i, "Gaia"], [/name|person|who|angler|player|target|enemy/i, "Falau"],
  [/plant|herb/i, "ginseng"], [/colou?r|#rrggbb/i, "#ff8800"], [/group|list/i, "friends"], [/city/i, "eleusis"],
  [/class/i, "Druid"], [/def/i, "insomnia"], [/tier|level/i, "3"], [/prio/i, "5"], [/dir/i, "north"],
  [/channel/i, "ct"], [/text|message|title|why|note|line/i, "hello there"], [/area/i, "Eleusis"], [/bait/i, "shrimp"],
  [/clan/i, "saiha"], [/elemental/i, "djinn"], [/sigil/i, "monolith"], [/environment/i, "forest"], [/alias|cmd|command/i, "sit"],
  [/date|day|due/i, "3"], [/lb|oz|weight/i, "4"], [/species|fish/i, "bass"], [/item|thing/i, "sword"], [/key/i, "F1"],
  [/room|id/i, "1234"], [/year/i, "1000"], [/theme/i, "eleusis"], [/mode/i, "standings"],
];
// Two passes: the first takes the first of ON|OFF-style keyword choices, the
// second the last, so a setting whose default is either one gets changed.
let PICK = 0;
function value(ph) {
  const alts = ph.split("|");
  const keywords = alts.every(x => /^[A-Z][A-Z0-9_]*$/.test(x));
  const a = keywords ? (PICK ? alts[alts.length - 1] : alts[0]) : (alts.find(x => !/^OFF$/i.test(x)) || alts[0]);
  const range = /^(-?\d+)-(\d+)$/.exec(a);
  if (range) { const lo = Number(range[1]), hi = Number(range[2]); return String(Math.round(lo + (hi - lo) * 0.3)); }
  if (/^[A-Z][A-Z0-9_]*$/.test(a)) return a; // a keyword alternative
  for (const [re, v] of VALUES) if (re.test(a)) return v;
  return "xyz";
}
function tokens(s) {
  const out = []; let cur = ""; let depth = 0;
  for (const ch of s) {
    if (ch === "[" || ch === "<") depth++;
    if (ch === "]" || ch === ">") depth--;
    if (ch === " " && depth <= 0) { if (cur) out.push(cur); cur = ""; } else cur += ch;
  }
  if (cur) out.push(cur);
  return out;
}
// "COFFERS GRAPH [SESSION|LONG] [ON|OFF]" -> "COFFERS GRAPH SESSION ON"
function concrete(cmd) {
  const words = [];
  const nums = {};
  // The same placeholder twice gets two different numbers (<n> [<n>] -> 3 4).
  const put = ph => {
    const v = value(ph);
    nums[ph] = (nums[ph] || 0) + 1;
    return /^\d+$/.test(v) ? String(Number(v) + nums[ph] - 1) : v;
  };
  const fill = t => t.replace(/<([^>]+)>/g, (m, ph) => put(ph));
  for (const t of tokens(cmd)) {
    if (/^\[.*\]$/.test(t)) {
      const inner = t.slice(1, -1).trim();
      if (/^[A-Z0-9_|]+$/.test(inner)) words.push(value(inner)); // [ON|OFF] -> ON
      else if (PICK && / \| /.test(inner)) words.push(fill(inner.split(" | ").pop())); // [A | B] -> B
      else if (PICK) words.push(fill(inner).split(/\s+/).map(w => /\||^[a-z]+$/.test(w) ? value(w) : w).join(" "));
      continue; // optional values: left out on the first pass, filled in on the second
    }
    // LOOM LINK <id>: a real integration id.
    let w = words.join(" ") === "LOOM LINK" ? "social-room" : fill(t);
    if (/^[A-Za-z0-9_]+(\|[A-Za-z0-9_]+)+$/.test(w)) w = value(w);
    if (/^\d+-\d+$/.test(w)) w = value(w);
    words.push(w);
  }
  if (words.some(w => SKIP.test(w))) return null;
  return words.join(" ");
}
function helpCommands(pkgs, p) {
  const out = [];
  for (const r of pkgs[p].reflexes) {
    if (r.type !== "alias") continue;
    const kw = /^\^\(?\??:?([a-z][a-z_]*)/i.exec(String(r.text || ""));
    if (!kw) continue;
    const s = kw[1] + " help";
    const m = S.match(r, s);
    if (!m) continue;
    const html = [];
    global.nexusclient.add_html_line = h => html.push(h);
    const n0 = S.W.notices.length;
    for (const a of r.actions || []) if (a.type === "script" && a.script) S.exec(p, "alias " + s, a.script, m);
    S.flush();
    global.nexusclient.add_html_line = () => {};
    const text = html.concat(S.W.notices.slice(n0).map(x => x.t)).join("\n")
      .replace(/<br\s*\/?>/g, "\n").replace(/<[^>]+>/g, "")
      .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
    for (const ln of text.split("\n")) {
      const mm = /^\s+([A-Z][A-Z0-9_]*(?:\s\S+)*?)\s{2,}\S/.exec(ln);
      if (!mm) continue;
      const parts = mm[1].split(" / ");
      const first = parts[0].split(" ")[0];
      parts.forEach((part, i) => {
        const full = i === 0 || part.split(" ")[0] === first ? part : first + " " + part;
        const c = concrete(full);
        if (c && out.indexOf(c) < 0) out.push(c);
      });
    }
  }
  return out;
}
// A command typed in the input: every alias of every installed package
// that matches it, as Nexus would.
function type(cmd) {
  for (const p of S.W.installed) {
    for (const r of S.PKGS[p].reflexes) {
      if (r.type !== "alias") continue;
      const m = S.match(r, cmd);
      if (!m) continue;
      S.W.line = cmd;
      for (const a of r.actions || []) if (a.type === "script" && a.script) S.exec(p, "alias " + cmd, a.script, m);
      S.flush();
    }
  }
}

// ---- One release, upgraded ----------------------------------------------
function play(rounds) {
  for (const [m, a] of S.GOOD) { S.gmcp(m, a); S.flush(); }
  for (let i = 0; i < (rounds || 5); i++) { S.advance(1500); S.prompt(); }
  S.renders();
}
function snap() { return JSON.parse(JSON.stringify(S.W.vars)); }
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const empty = v => v === null || v === undefined || v === "";

const REPORT = [];
function problem(tag, kind, name, msg) { REPORT.push({ tag, kind, name, msg }); }

// Checks the variables saved under the release against what is there after.
function compare(tag, step, before, after) {
  for (const k of Object.keys(before)) {
    if (empty(before[k])) continue;
    const row = INV.get(k);
    const kind = row ? row.kind : "unlisted";
    if (kind === "state") continue; // the package's own, rewritten at will
    if (Object.prototype.hasOwnProperty.call(after, k)) {
      // Still there, but the current build never reads it: renamed without
      // a migration (the old value sits unused).
      if (kind !== "legacy" && after === LAST_AFTER && !usedNow(k)) problem(tag, "orphaned", k, step + ": still saved, but nothing in the current build reads it");
      if (kind === "setting" && !same(before[k], after[k])) { // data changes as you play
        problem(tag, "changed", k, step + ": " + JSON.stringify(before[k]).slice(0, 60) + " -> " + JSON.stringify(after[k]).slice(0, 60));
      }
      continue;
    }
    const into = INV.into(k);
    if (into) {
      const targets = into.re ? Object.keys(after).filter(n => into.re.test(n)) : [into.name];
      if (!targets.some(n => !empty(after[n]))) problem(tag, "lost", k, step + ": migrated into " + into.name + ", which is empty");
      continue;
    }
    if (kind === "legacy") continue; // read once, nothing to carry
    problem(tag, "lost", k, step + ": gone (" + kind + ")");
  }
}

const SEEN = new Set(); // variables some release saved before upgrading
const USED = {}; // variable -> Set of packages, on the current build
let LAST_AFTER = null; // the snapshot the orphan check runs on (next login)
const STATIC = new Set();
for (const p of CURNAMES) for (const v of CUR[p].vars) STATIC.add(v);
function usedNow(k) {
  if (STATIC.has(k)) return true;
  const log = S.VARLOG || {};
  if (log[k] && Object.keys(log[k]).some(p => CUR[p] && log[k][p].has("r"))) return true;
  return false;
}
function remember() {
  const log = S.VARLOG;
  for (const k of Object.keys(log || {})) for (const p of Object.keys(log[k])) {
    if (CUR[p]) (USED[k] = USED[k] || new Set()).add(p);
  }
}

function upgradeFrom(rel, pass) {
  const OLD = S.loadDist(rel.dist, rel.packages);
  const oldNames = Object.keys(OLD).filter(n => CUR[n] || CUR[MERGED[n]]).sort(); // retired ones aren't upgraded
  const tag = rel.tag + (pass ? " (second pass)" : "");
  PICK = pass;
  S.scenario(tag);
  const f0 = S.FIND.size;

  // 1. The release, installed and set up by a player.
  S.use(OLD);
  S.newWorld(oldNames, {});
  S.load("install");
  play();
  let cmds = 0;
  const typed = [];
  for (const p of oldNames) for (const c of helpCommands(OLD, p)) { type(c); cmds++; typed.push(c); }
  play(20);
  S.advance(60000);
  const v0 = snap();
  for (const k of Object.keys(v0)) if (!empty(v0[k])) SEEN.add(k);
  if (OPT.verbose) {
    console.log("== " + tag + ": typed\n  " + typed.join("\n  "));
    console.log("== " + tag + ": settings saved");
    for (const k of Object.keys(v0).sort()) { const r = INV.get(k); if (r && r.kind === "setting") console.log("  " + k + " = " + JSON.stringify(v0[k]).slice(0, 80)); }
  }
  // Throws in old code are history: only the current build's count.
  for (const k of Array.from(S.FIND.keys()).slice(f0)) S.FIND.delete(k);

  // 2. The current build imported over it, one package at a time in the
  //    same page (alphabetically, then the other way round on the second
  //    pass), so new packages meet old ones mid-way.
  const mixed = Object.assign({}, OLD);
  S.use(mixed);
  const order = pass ? CURNAMES.slice().reverse() : CURNAMES.slice();
  for (const p of order) {
    for (const o of Object.keys(MERGED)) {
      const at = S.W.installed.indexOf(o);
      if (MERGED[o] === p && at >= 0) { S.W.installed.splice(at, 1); delete mixed[o]; }
    }
    mixed[p] = CUR[p];
    if (S.W.installed.indexOf(p) < 0) S.W.installed.push(p);
    S.scenario(tag + ", importing " + p);
    const fi = S.FIND.size;
    if (CUR[p].fns.onInstall !== undefined) S.exec(p, "onInstall", CUR[p].fns.onInstall, []);
    if (CUR[p].fns.onLoad !== undefined) S.exec(p, "onLoad", CUR[p].fns.onLoad, []);
    S.flush();
    S.advance(1500);
    S.prompt();
    S.renders();
    // A throw in a package still on the old build is the old build's.
    for (const k of Array.from(S.FIND.keys()).slice(fi)) if (mixed[S.FIND.get(k).pkg] !== CUR[S.FIND.get(k).pkg]) S.FIND.delete(k);
  }
  S.scenario(tag + ", imported over");
  play(20);
  S.advance(60000);
  const v1 = snap();
  compare(tag, "imported over", v0, v1);

  // 3. The next login: a fresh page with the current build.
  S.use(CUR);
  S.scenario(tag + ", next login");
  S.watchVars(true);
  S.newWorld(CURNAMES, v1);
  S.load("load");
  play(20);
  for (const c of ["help", "status", ""]) for (const p of CURNAMES) type(p + (c ? " " + c : ""));
  S.renders();
  const v2 = snap();
  LAST_AFTER = v2;
  compare(tag, "next login", v0, v2);
  LAST_AFTER = null;
  remember();
  S.watchVars(false);

  // 4. Back to the release (a downgrade): it may start fresh, never throw.
  //    Old code can't be changed, so a throw here means the current build
  //    reshaped something under a name the release still reads.
  S.use(OLD);
  S.scenario(tag + ", downgraded");
  const fd = S.FIND.size;
  S.newWorld(oldNames, v2);
  S.load("install");
  play();
  S.aliases();
  S.renders();
  for (const k of Array.from(S.FIND.keys()).slice(fd)) {
    const f = S.FIND.get(k);
    problem(tag, "downgrade", f.pkg, f.where + ": " + f.msg);
    S.FIND.delete(k);
  }
  return { tag, packages: oldNames.length, commands: cmds, saved: Object.keys(v0).length };
}

// A fresh install of the current build, for the names it reads only when
// nothing is saved yet (the old names it migrates from).
S.use(CUR);
S.scenario("fresh install");
S.watchVars(true);
S.newWorld(CURNAMES, {});
S.load("install");
play(5);
remember();
S.watchVars(false);

const runs = [];
for (const rel of OPT.releases) for (const pass of [0, 1]) runs.push(upgradeFrom(rel, pass));

// Throws in the current build while upgrading.
for (const f of S.FIND.values()) if (f.kind === "throws") problem(Array.from(f.scenarios)[0], "throws", f.pkg, f.where + ": " + f.msg);

// Every variable the current build touches must be in the inventory.
const staticVars = {};
for (const p of CURNAMES) for (const v of CUR[p].vars) (staticVars[v] = staticVars[v] || new Set()).add(p);
for (const k of Object.keys(USED)) (staticVars[k] = staticVars[k] || new Set()), USED[k].forEach(p => staticVars[k].add(p));
for (const k of Object.keys(staticVars).sort()) {
  if (!INV.get(k)) problem("inventory", "unlisted", k, "used by " + Array.from(staticVars[k]).sort().join(", ") + " but not in docs/dev/variables.md");
}

// And every row in the inventory must still be used (a retired name stays
// listed as legacy while the code that migrates it is there).
const usedNames = Object.keys(staticVars);
for (const r of Object.values(INV.rows).concat(INV.fam)) {
  const hit = r.re ? usedNames.some(n => r.re.test(n)) : !!staticVars[r.name];
  if (!hit) problem("inventory", "stale", r.name, "listed in docs/dev/variables.md, but nothing in the current build uses it");
}

if (OPT.json) {
  console.log(JSON.stringify({ runs, problems: REPORT, used: Object.fromEntries(Object.entries(staticVars).map(([k, v]) => [k, Array.from(v).sort()])) }, null, 1));
} else {
  for (const r of runs) console.log(r.tag + ": " + r.packages + " packages, " + r.commands + " commands, " + r.saved + " variables saved");
  let last = "";
  const sorted = REPORT.slice().sort((a, b) => (a.tag + a.kind + a.name).localeCompare(b.tag + b.kind + b.name));
  for (const p of sorted) {
    if (p.tag !== last) { console.log("\n" + p.tag); last = p.tag; }
    console.log("  " + p.kind.padEnd(10) + p.name + ": " + p.msg);
  }
  // Settings no release saved: the run says nothing about them.
  const unseen = Object.values(INV.rows).concat(INV.fam).filter(r => r.kind === "setting" && r.since !== OPT.next && !(r.re ? Array.from(SEEN).some(n => r.re.test(n)) : SEEN.has(r.name))).map(r => r.name);
  if (unseen.length) console.log("\nnot exercised (no release saved them while being set up): " + unseen.join(", "));
  const fresh = Object.values(INV.rows).concat(INV.fam).filter(r => r.kind === "setting" && r.since === OPT.next).map(r => r.name);
  if (fresh.length) console.log("new since the last release (checked from the next one on): " + fresh.join(", "));
  const fails = REPORT.length;
  const nrel = OPT.releases.length;
  console.log("\n" + fails + " problem" + (fails === 1 ? "" : "s") + " (" + nrel + " release" + (nrel === 1 ? "" : "s") + " upgraded and downgraded, two passes each)");
}
process.exit(REPORT.length ? 1 : 0);
