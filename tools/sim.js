// sim.js -- a Nexus page in node: built packages' scripts run with the
// client calls stubbed, GMCP and game lines fed by hand, time advanced by
// hand. Shared by smoke.js (#135) and upgrade.js (#134).
"use strict";
const fs = require("fs");
const path = require("path");

// ---- Packages ---------------------------------------------------------
// Read built packages from a dist folder: { name: { fns, reflexes, vars } }.
// `names` defaults to dist/versions.json's list, or every .nxs there.
function loadDist(dir, names) {
  if (!names) {
    const vf = path.join(dir, "versions.json");
    names = fs.existsSync(vf) ? Object.keys(JSON.parse(fs.readFileSync(vf, "utf8")).packages)
      : fs.readdirSync(dir).filter(f => f.endsWith(".nxs")).map(f => f.slice(0, -4));
    names.sort();
  }
  const out = {};
  for (const name of names) {
    const raw = JSON.parse(fs.readFileSync(path.join(dir, name + ".nxs"), "utf8"));
    const p = { name, fns: {}, reflexes: [], vars: new Set() };
    (function walk(items) {
      for (const it of items || []) {
        if (it.type === "function") p.fns[it.name] = it.code;
        if ((it.type === "trigger" || it.type === "alias") && it.enabled !== false) p.reflexes.push(it);
        if (it.items) walk(it.items);
      }
    })(raw.items);
    // Every variable the package names literally.
    const all = Object.values(p.fns).concat(p.reflexes.flatMap(r => (r.actions || []).map(a => a.script || "")));
    for (const code of all) {
      const re = /(?:get|set|delete)_variable\(\s*"([A-Za-z0-9_]+)"(?=\s*[,)])/g;
      let m;
      while ((m = re.exec(code)) !== null) p.vars.add(m[1]);
    }
    out[name] = p;
  }
  return out;
}
// The packages scripts run from. Swapping it mid-world is an upgrade: the
// page (client, saved variables) stays, the code changes.
let PKGS = {};
function use(pkgs) { PKGS = pkgs; }

// Variable reads, writes and deletes, by package, when watching is on.
let VARLOG = null;
function watchVars(on) { VARLOG = on ? {} : null; }
function logVar(k, op) {
  if (!VARLOG) return;
  const p = STACK[STACK.length - 1] || "?";
  const e = VARLOG[k] = VARLOG[k] || {};
  (e[p] = e[p] || new Set()).add(op);
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
function scenario(s) { SCEN = s; }
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
  G.get_variable = k => (logVar(k, "r"), Object.prototype.hasOwnProperty.call(W.vars, k) ? W.vars[k] : null);
  G.set_variable = (k, v) => { logVar(k, "w"); W.vars[k] = v; };
  G.delete_variable = k => { logVar(k, "d"); delete W.vars[k]; };
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
  // As in a browser, a cleared timer never runs, even one already due.
  G.clearTimeout = t => { if (t) t.cancelled = true; W.timers = W.timers.filter(x => x !== t); };
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
      if (t.cancelled) continue;
      STACK.push(t.pkg);
      try { t.f(); }
      catch (e) { finding(t.pkg, "timer", "throws", String(e && e.message || e).split("\n")[0], SCEN, String(e && e.stack || "").split("\n").slice(0, 3).join(" | ")); }
      finally { STACK.pop(); }
    }
  }
}
// Moves the clock on, running timers in time order as it goes, as a browser
// does (a timer set while another runs waits for its own time, not the end).
function advance(ms) {
  const end = W.now + ms;
  // intervals fire once per advance (enough to run their code)
  for (const t of W.intervals.slice()) {
    STACK.push(t.pkg);
    try { t.f(); }
    catch (e) { finding(t.pkg, "interval", "throws", String(e && e.message || e).split("\n")[0], SCEN); }
    finally { STACK.pop(); }
  }
  for (let guard = 0; guard < 20000; guard++) {
    let next = null;
    for (const t of W.timers) if (t.at <= end && (!next || t.at < next.at)) next = t;
    if (!next) break;
    W.timers = W.timers.filter(x => x !== next);
    if (next.at > W.now) W.now = next.at;
    if (next.cancelled) continue;
    STACK.push(next.pkg);
    try { next.f(); }
    catch (e) { finding(next.pkg, "timer", "throws", String(e && e.message || e).split("\n")[0], SCEN, String(e && e.stack || "").split("\n").slice(0, 3).join(" | ")); }
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

module.exports = {
  loadDist, use, watchVars, scenario,
  get PKGS() { return PKGS; }, get W() { return W; }, get VARLOG() { return VARLOG; },
  FIND, STATS, STACK, GOOD, ODD_ARGS, METHODS, SUBS, ME,
  finding, exec, newWorld, flush, advance, gmcp, prompt, line, match,
  aliases, triggersBlind, renders, load, uninstall, promptsQuiet,
};
