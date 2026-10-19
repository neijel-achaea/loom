// smoke.js -- run built packages in node against missing, late, odd and
// corrupt data, and report every script that throws (#135).
// Driven by tools/smoke.py; see its docstring. Usage:
//   node tools/smoke.js <dist dir> <json options>
// Options: { only: [pkg...], verbose: bool }
"use strict";
const fs = require("fs");
const path = require("path");

const DIST = process.argv[2];
const OPT = JSON.parse(process.argv[3] || "{}");

// ---- Packages ---------------------------------------------------------
// The packages Loom ships: dist/versions.json (retired ones aren't in it).
const versions = JSON.parse(fs.readFileSync(path.join(DIST, "versions.json"), "utf8")).packages;
const ALL = Object.keys(versions).sort();
const PKGS = {};
for (const name of ALL) {
  const raw = JSON.parse(fs.readFileSync(path.join(DIST, name + ".nxs"), "utf8"));
  const p = { name, fns: {}, reflexes: [], vars: new Set() };
  (function walk(items) {
    for (const it of items || []) {
      if (it.type === "function") p.fns[it.name] = it.code;
      if ((it.type === "trigger" || it.type === "alias") && it.enabled !== false) p.reflexes.push(it);
      if (it.items) walk(it.items);
    }
  })(raw.items);
  // Every variable the package names literally, for the corrupt-data runs.
  const all = Object.values(p.fns).concat(p.reflexes.flatMap(r => (r.actions || []).map(a => a.script || "")));
  for (const code of all) {
    const re = /(?:get|set|delete)_variable\(\s*"([A-Za-z0-9_]+)"/g;
    let m;
    while ((m = re.exec(code)) !== null) p.vars.add(m[1]);
  }
  PKGS[name] = p;
}

// ---- Findings ---------------------------------------------------------
// key: pkg | where | message -> { pkg, where, msg, scenarios:Set, stack }
const FIND = new Map();
function finding(pkg, where, kind, msg, scen, stack) {
  const key = pkg + "|" + where + "|" + kind + "|" + msg;
  if (!FIND.has(key)) FIND.set(key, { pkg, where, kind, msg, scenarios: new Set(), stack: stack || "" });
  FIND.get(key).scenarios.add(scen);
}

// ---- The Nexus world, rebuilt for every scenario ------------------------
let W; // current world
let SCEN = "";
const STACK = []; // package of the script running now

function where(pkg, kind, name) { return kind + " " + name; }

// Compile once per text.
const CACHE = new Map();
function compiled(code) {
  let f = CACHE.get(code);
  if (!f) { f = new Function("args", code); CACHE.set(code, f); }
  return f;
}

// Run one script as Nexus would: a throw is caught (Nexus logs it to the
// console and carries on), and recorded here.
const STATS = { runs: 0, byKind: {}, tabs: new Set(), sent: 0 };
function exec(pkg, label, code, args) {
  STATS.runs++; const kd = label.split(" ")[0]; STATS.byKind[kd] = (STATS.byKind[kd] || 0) + 1;
  STACK.push(pkg);
  try { return compiled(code)(args); }
  catch (e) {
    const msg = String(e && e.message || e).split("\n")[0];
    const st = String(e && e.stack || "").split("\n").slice(0, 3).join(" | ");
    finding(pkg, label, "throws", msg, SCEN, st);
  } finally { STACK.pop(); }
}

function newWorld(installed, vars) {
  W = {
    installed: installed.slice(),
    vars: Object.assign({}, vars || {}),
    timers: [],
    intervals: [],
    now: 1760000000000,
    sent: [],
    notices: [],
    tabs: {},
    line: "",
  };
  const G = global;
  for (const k of Object.keys(G)) if (k === "client") delete G[k];
  G.client = {};
  G.window = G;
  G.get_variable = k => (Object.prototype.hasOwnProperty.call(W.vars, k) ? W.vars[k] : null);
  G.set_variable = (k, v) => { W.vars[k] = v; };
  G.delete_variable = k => { delete W.vars[k]; };
  G.send_command = c => { W.sent.push(String(c)); STATS.sent++; };
  G.display_notice = (t, fg) => { W.notices.push({ t: String(t), fg: fg || "", pkg: STACK[STACK.length - 1] || "" }); };
  G.print = (t) => {};
  G.alert = () => {};
  G.gag_current_line = () => {};
  G.colorize_current_line = () => {};
  G.replace_current_line = () => {};
  G.current_text = () => W.line;
  G.to_number = v => { const n = Number(v); return isNaN(n) ? 0 : n; };
  G.set_custom_tab_html = (name, html) => { W.tabs[name] = String(html); STATS.tabs.add(name); };
  G.buttons_set_label = G.buttons_set_highlight = G.buttons_set_commands = G.buttons_set_default = () => {};
  G.nexusclient = { add_html_line: () => {} };
  G.fetch = () => new Promise(() => {});
  G.XMLHttpRequest = function () { this.open = () => {}; this.send = () => {}; this.setRequestHeader = () => {}; };
  G.location = { href: "https://play.achaea.com/" };
  const el = () => ({ style: {}, classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } }, setAttribute() {}, appendChild() {}, remove() {}, addEventListener() {}, querySelector() { return null; }, querySelectorAll() { return []; }, textContent: "", innerHTML: "", id: "" });
  G.document = {
    getElementById: () => null,
    createElement: el,
    head: el(),
    body: el(),
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener() {},
  };
  G.setTimeout = (f, ms) => { const t = { f, at: W.now + (Number(ms) || 0), pkg: STACK[STACK.length - 1] || "" }; W.timers.push(t); return t; };
  G.clearTimeout = t => { W.timers = W.timers.filter(x => x !== t); };
  G.setInterval = (f, ms) => { const t = { f, ms: Number(ms) || 1000, pkg: STACK[STACK.length - 1] || "" }; W.intervals.push(t); return t; };
  G.clearInterval = t => { W.intervals = W.intervals.filter(x => x !== t); };
  Date.now = () => W.now;
  G.run_function = (name, args, pkg) => {
    const caller = STACK[STACK.length - 1];
    let owner = pkg || caller;
    let code = owner && W.installed.includes(owner) ? PKGS[owner] && PKGS[owner].fns[name] : undefined;
    if (code === undefined && !pkg) {
      for (const p of W.installed) if (PKGS[p].fns[name] !== undefined) { owner = p; code = PKGS[p].fns[name]; break; }
    }
    if (code === undefined) {
      // A call into a package that isn't installed is what partial installs
      // look like; Nexus logs it and returns nothing.
      finding(caller || "?", "run_function " + (pkg ? pkg + ":" : "") + name, "missing", "calls a function that isn't installed", SCEN);
      return undefined;
    }
    return exec(owner, "function " + name, code, args);
  };
}

// Run every due timer, in bounded rounds (some re-queue themselves forever).
function flush(rounds) {
  for (let r = 0; r < (rounds || 6); r++) {
    const due = W.timers.filter(t => t.at <= W.now);
    if (!due.length) break;
    W.timers = W.timers.filter(t => t.at > W.now);
    for (const t of due) {
      STACK.push(t.pkg);
      try { t.f(); }
      catch (e) { finding(t.pkg, "timer", "throws", String(e && e.message || e).split("\n")[0], SCEN, String(e && e.stack || "").split("\n").slice(0, 3).join(" | ")); }
      finally { STACK.pop(); }
    }
  }
}
function advance(ms) {
  const end = W.now + ms;
  // intervals fire once per advance (enough to run their code)
  for (const t of W.intervals.slice()) {
    STACK.push(t.pkg);
    try { t.f(); }
    catch (e) { finding(t.pkg, "interval", "throws", String(e && e.message || e).split("\n")[0], SCEN); }
    finally { STACK.pop(); }
  }
  W.now = end;
  flush();
}

// ---- What the game sends ------------------------------------------------
const ME = "Neijel";
const GOOD = [
  ["Char.Name", { name: ME, fullname: "Neijel Aystiir" }],
  ["Char.Status", { name: ME, fullname: "Neijel Aystiir", age: "42", race: "Human", specialisation: "", level: "80 (42%)", xp: "42%", xprank: "1200", class: "Druid", city: "Eleusis (2)", house: "The Merchant Collective", order: "Gaia", boundcredits: "0", unboundcredits: "5", lessons: "100", explorerrank: "120", mayancrowns: "0", boundmayancrowns: "0", gold: "12,345", bank: "500", unread_news: "0", unread_msgs: "0", target: "None", gender: "male" }],
  ["Char.Vitals", { hp: "3000", maxhp: "3500", mp: "2000", maxmp: "2500", ep: "10000", maxep: "12000", wp: "9000", maxwp: "10000", nl: "42", bal: "1", eq: "1", vote: "1", string: "H:3000/3500 M:2000/2500", charstats: ["Bleed: 0", "Rage: 12"] }],
  ["Char.Skills.Groups", [{ name: "Groves", rank: "Transcendent" }, { name: "Survival", rank: "Mythical" }]],
  ["Char.Skills.List", { group: "groves", list: ["Panic", "Rejuvenate"], descs: ["", ""] }],
  ["Char.Afflictions.List", [{ name: "clumsiness", cure: "eat kelp", desc: "" }]],
  ["Char.Afflictions.Add", { name: "asthma", cure: "eat kelp", desc: "" }],
  ["Char.Afflictions.Remove", ["asthma"]],
  ["Char.Defences.List", [{ name: "deafness", desc: "deaf" }, { name: "mass", desc: "" }]],
  ["Char.Defences.Add", { name: "insomnia", desc: "" }],
  ["Char.Defences.Remove", ["insomnia"]],
  ["Room.Info", { num: 1234, name: "A forest path", area: "Eleusis", environment: "Forest", coords: "1,2,3,0", map: "", exits: { n: 1235, s: 1233 }, details: ["shop"] }],
  ["Room.Players", [{ name: ME, fullname: "Neijel Aystiir" }, { name: "Falau", fullname: "Falau the Ithin" }]],
  ["Room.AddPlayer", { name: "Ana", fullname: "Ana" }],
  ["Room.RemovePlayer", "Ana"],
  ["Char.Items.List", { location: "room", items: [{ id: "555", name: "a black panther", attrib: "m", icon: "animal" }, { id: "9", name: "a monolith sigil", attrib: "" }, { id: "77", name: "a gold sovereign", attrib: "t" }] }],
  ["Char.Items.List", { location: "inv", items: [{ id: "1", name: "a fishing pole", attrib: "lw" }, { id: "2", name: "a vial of health", attrib: "c" }] }],
  ["Char.Items.Add", { location: "room", item: { id: "556", name: "a grey wolf", attrib: "m" } }],
  ["Char.Items.Update", { location: "room", item: { id: "556", name: "a grey wolf", attrib: "md" } }],
  ["Char.Items.Remove", { location: "room", item: { id: "556", name: "a grey wolf" } }],
  ["IRE.Target.Set", "555"],
  ["IRE.Target.Info", { id: "555", short_desc: "a black panther", hpperc: "80%" }],
  ["Comm.Channel.List", [{ name: "ct", caption: "City", command: "ct" }, { name: "says", caption: "Says", command: "say" }]],
  ["Comm.Channel.Text", { channel: "ct", talker: "Falau", text: "\u001b[1;33m(Eleusis): Falau says, \"Hello.\"\u001b[0;37m" }],
  ["Comm.Channel.Text", { channel: "tell Falau", talker: "Falau", text: "Falau tells you, \"Hi.\"" }],
  ["Comm.Channel.Players", [{ name: "Falau", channels: ["ct"] }]],
  ["IRE.Rift.List", [{ name: "ginseng", amount: "120", desc: "ginseng root" }]],
  ["IRE.Rift.Change", { name: "ginseng", amount: "121", desc: "ginseng root" }],
];
// The same messages as they may come when something is off: empty, null,
// a bare string, a list where an object is expected, numbers as numbers.
const ODD_ARGS = [{}, null, "", [], "garbage", 0];
const METHODS = Array.from(new Set(GOOD.map(g => g[0])));

function gmcp(method, args) {
  W.lastGmcp = method;
  for (const p of W.installed) {
    if (PKGS[p].fns.onGMCP !== undefined) exec(p, "onGMCP (" + method + ")", PKGS[p].fns.onGMCP, { gmcp_method: method, gmcp_args: args });
  }
}
function prompt() {
  gmcp("Char.Vitals", GOOD[2][1]);
  line("3000h, 2000m, 10000e, 9000w ex-");
}

// A game line, through every trigger whose pattern matches it.
function line(s) {
  W.line = s;
  for (const p of W.installed) {
    for (const r of PKGS[p].reflexes) {
      if (r.type !== "trigger") continue;
      const m = match(r, s);
      if (!m) continue;
      for (const a of r.actions || []) if (a.type === "script" && a.script) exec(p, "trigger " + (r.name || r.text), a.script, m);
    }
  }
}
function match(r, s) {
  const t = String(r.text || "");
  try {
    if (r.matching === "regexp") { return new RegExp(t, r.case_sensitive ? "" : "i").exec(s); }
    if (r.matching === "exact") return (r.case_sensitive ? s === t : s.toLowerCase() === t.toLowerCase()) ? [s] : null;
    if (r.matching === "substring") return (r.case_sensitive ? s.indexOf(t) >= 0 : s.toLowerCase().indexOf(t.toLowerCase()) >= 0) ? [s] : null;
    return (r.case_sensitive ? s.indexOf(t) === 0 : s.toLowerCase().indexOf(t.toLowerCase()) === 0) ? [s] : null;
  } catch (e) { return null; }
}

// Every alias of the installed packages, with the usual subcommands. The
// keyword comes from the alias's own pattern.
const SUBS = ["", " help", " status", " list", " debug", " on", " off", " 123", " xyz", " add", " del", " clear", " show"];
function aliases() {
  for (const p of W.installed) {
    for (const r of PKGS[p].reflexes) {
      if (r.type !== "alias") continue;
      const kw = /^\^\(?\??:?([a-z][a-z_]*)/i.exec(String(r.text || ""));
      if (!kw) continue;
      for (const sub of SUBS) {
        const s = kw[1] + sub;
        const m = match(r, s);
        if (!m) continue;
        W.line = s;
        for (const a of r.actions || []) if (a.type === "script" && a.script) exec(p, "alias " + kw[1] + sub, a.script, m);
        flush();
      }
    }
  }
}
// Every trigger, fired with a made-up match: as if the game's wording had
// drifted just enough to match with odd groups, or the line came before
// anything was set up.
function triggersBlind() {
  for (const p of W.installed) {
    for (const r of PKGS[p].reflexes) {
      if (r.type !== "trigger") continue;
      const fake = ["Something odd happens.", "Falau", "12", "a thing", "north", "5", "x"];
      W.line = fake[0];
      for (const a of r.actions || []) if (a.type === "script" && a.script) exec(p, "trigger " + (r.name || r.text), a.script, fake);
    }
  }
  flush();
}
// Every tab, drawn: functions named like a render.
function renders() {
  for (const p of W.installed) {
    for (const n of Object.keys(PKGS[p].fns)) {
      if (/(_render|_online|_draw)$/.test(n) || /_render_/.test(n)) exec(p, "function " + n, PKGS[p].fns[n], []);
    }
    const reg = client.loom && client.loom.registry && client.loom.registry[p];
    if (reg && typeof reg.redraw === "function") { STACK.push(p); try { reg.redraw(); } catch (e) { finding(p, "registry redraw", "throws", String(e.message || e), SCEN); } finally { STACK.pop(); } }
    if (reg && typeof reg.busy === "function") { STACK.push(p); try { reg.busy(); } catch (e) { finding(p, "registry busy", "throws", String(e.message || e), SCEN); } finally { STACK.pop(); } }
  }
  flush();
}
function load(how) {
  for (const p of W.installed) {
    if (how === "install" && PKGS[p].fns.onInstall !== undefined) exec(p, "onInstall", PKGS[p].fns.onInstall, []);
    if (PKGS[p].fns.onLoad !== undefined) exec(p, "onLoad", PKGS[p].fns.onLoad, []);
  }
  flush();
}
function uninstall() {
  for (const p of W.installed) if (PKGS[p].fns.onUninstall !== undefined) exec(p, "onUninstall", PKGS[p].fns.onUninstall, []);
  flush();
}

// Twenty prompts in a row: no package may repeat a warning on each one.
function promptsQuiet() {
  const from = W.notices.length;
  for (let i = 0; i < 20; i++) { advance(1500); prompt(); }
  const seen = {};
  for (const n of W.notices.slice(from)) {
    if (!/orange|red/i.test(n.fg)) continue;
    const k = n.pkg + "|" + n.t.replace(/\d+/g, "#");
    seen[k] = (seen[k] || 0) + 1;
  }
  for (const k of Object.keys(seen)) if (seen[k] >= 4) {
    const [pkg, t] = k.split("|");
    finding(pkg || "?", "notice", "repeats", "\"" + t.slice(0, 90) + "\" " + seen[k] + "x in 20 prompts", SCEN);
  }
}

// ---- Scenarios ---------------------------------------------------------
// Each runs a fresh world with the given packages and saved variables.
function standard(pkgs, vars, tag, opts) {
  opts = opts || {};
  SCEN = tag;
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
