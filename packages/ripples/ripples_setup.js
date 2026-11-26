// ripples_setup -- the Mnemosyne's wades, ripple by ripple. Run from onLoad,
// onInstall, RIPPLES RESET and any reflex that finds the namespace missing.
// Data is kept across a rerun; helpers are rebuilt.
//
// What it follows (Ricardo's wade log, 2026-11-14/15):
//   run start    "You silently slip beneath the water and the world is as it once was."
//   boon screen  "As the Mnemosyne stretches ever on ... flickers of power ..." (ends a
//                ripple), a rule, one "Name:   description" line per option, a rule,
//                "BOON CLAIM <boon name> ...", maybe "BOON REROLL ... (N remaining)."
//   claim        "A fulgent eddy falls still." (no name: BOON CLAIMED is asked, quietly)
//   ripple start countdown 5..0, one line naming the place, "GO!"
//   WADE STATUS  "You wade N ripples deep into the tides of memory:" ... asked
//                quietly after GO!, after kills and every RIPPLES POLL seconds
//   run end      "The Mnemosyne relinquishes memory's grip upon you."
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.ripples) client.loom.ripples = {};
var R = client.loom.ripples;
client.loom.registry.ripples = { version: "0.1.0", keyword: "RIPPLES", desc: "{{description}}",
  redraw: function () { run_function("ripples_render", [], "ripples"); },
  // Busy only while a quiet question it sent is unanswered.
  busy: function () { var X = client.loom && client.loom.ripples; return !!(X && (X.cap && X.cap.ours || X.ccap)); } };
R.tab = "Ripples";

function rpParse(name, want) {
  var v;
  try { v = get_variable(name); if (typeof v == "string") v = v.length ? JSON.parse(v) : null; } catch (e) { v = null; }
  if (want === "array") return Array.isArray(v) ? v : [];
  return (v && typeof v == "object" && !Array.isArray(v)) ? v : null;
}

// ---- Saved data ----------------------------------------------------------
// A saved run of any other shape is dropped; missing parts are filled in.
function rpRun(r) {
  if (!r || typeof r != "object" || Array.isArray(r) || !Array.isArray(r.ripples) || !Array.isArray(r.screens)) return null;
  if (!Array.isArray(r.held)) r.held = [];
  r.t0 = Number(r.t0) || 0; r.t1 = Number(r.t1) || 0; r.renown = Number(r.renown) || 0;
  if (r.lives === undefined) r.lives = null;
  if (r.rerolls === undefined) r.rerolls = null;
  if (typeof r.threads != "number") r.threads = null;
  r.ripples = r.ripples.filter(function (c) { return c && typeof c == "object" && !Array.isArray(c); });
  for (var i = 0; i < r.ripples.length; i++) {
    var c = r.ripples[i];
    c.n = Number(c.n) || i + 1; c.t0 = Number(c.t0) || r.t0; c.t1 = Number(c.t1) || 0;
    c.kills = Number(c.kills) || 0; c.xp = Number(c.xp) || 0; c.gold = Number(c.gold) || 0; c.lost = Number(c.lost) || 0;
    if (!c.dmg || typeof c.dmg != "object" || Array.isArray(c.dmg)) c.dmg = {};
    if (!Array.isArray(c.aff)) c.aff = [];
    if (c.wave === undefined) c.wave = null;
    if (c.lvl === undefined) c.lvl = null;
    if (c.spd === undefined) c.spd = null;
    if (c.minHp === undefined) c.minHp = null;
    if (c.minPct === undefined) c.minPct = null;
    c.flees = Number(c.flees) || 0;
  }
  r.screens = r.screens.filter(function (x) { return x && typeof x == "object" && Array.isArray(x.opts); });
  return r;
}
if (!R.runs) R.runs = rpParse("ripples_runs", "array").map(rpRun).filter(function (r) { return r; });
if (R.run === undefined) R.run = rpRun(rpParse("ripples_run"));
if (!R.codex) {
  R.codex = rpParse("ripples_codex") || {};
  if (!R.codex.boons || typeof R.codex.boons != "object") R.codex.boons = {};
  if (!R.codex.affixes || typeof R.codex.affixes != "object") R.codex.affixes = {};
}
if (!R.names) R.names = rpParse("ripples_names") || {};
if (R.poll === undefined) {
  var rpPoll = String(get_variable("ripples_poll") || "").trim().toLowerCase();
  R.poll = rpPoll === "off" ? 0 : parseInt(rpPoll, 10);
  if (isNaN(R.poll) || R.poll < 0) R.poll = 30;
}
if (!R.view) R.view = "wade";
if (!R.sort) R.sort = "taken";
if (R.cap === undefined) R.cap = null;      // a WADE STATUS being read
if (R.ccap === undefined) R.ccap = null;    // a BOON CLAIMED being read
if (R.scr === undefined) R.scr = null;      // a boon screen being read
if (!R.asked) R.asked = 0;                  // when we last sent WADE STATUS
if (!R.due) R.due = 0;                      // when the next one is due
if (!R.ready) R.ready = 0;                  // when "You may once more wade" came
R.maxRuns = 60;

// The places, by the line the game prints just before GO!. Names for the
// ones met so far; another line shows as itself until RIPPLES NAME.
R.places = [
  [/halls of Judgement Mountain/, "Judgement Mountain"],
  [/streets of Lost Kasmarkin/, "Lost Kasmarkin"],
  [/fey creatures from the enchanted water/, "the fey lake"],
  [/in defence of the Duchy/, "the Duchy"],
  [/secur\w+ the city streets/, "Arcadia"],
  [/minstrels of Tirfo Thuinn/, "Tirfo Thuinn"],
  [/drowned pirates/, "the pirate ship"]
];

R.paused = function () { return get_variable("pauseTriggers") == "on"; };
R.say = function (t, c) { display_notice("[ripples] " + t, c || "cyan"); };
R.n = function (v) { v = Math.round(Number(v) || 0); var s = String(Math.abs(v)), o = ""; while (s.length > 3) { o = "," + s.slice(-3) + o; s = s.slice(0, -3); } return (v < 0 ? "-" : "") + s + o; };
R.k = function (v) { v = Number(v) || 0; return Math.abs(v) >= 1000 ? (Math.round(v / 100) / 10) + "k" : String(Math.round(v)); };
R.dur = function (ms) { var s = Math.max(0, Math.round((Number(ms) || 0) / 1000)); var m = Math.floor(s / 60); return m >= 60 ? Math.floor(m / 60) + "h " + (m % 60) + "m" : m + ":" + ("0" + (s % 60)).slice(-2); };
R.place = function (rip) {
  if (!rip) return "?";
  var intro = rip.intro || "";
  if (R.names[intro]) return R.names[intro];
  for (var i = 0; i < R.places.length; i++) if (R.places[i][0].test(intro)) return R.places[i][1];
  return intro ? intro.replace(/[.!]$/, "").slice(0, 32) : "ripple " + rip.n;
};
R.cur = function () {
  var r = R.run;
  if (!r || !r.ripples.length) return null;
  var c = r.ripples[r.ripples.length - 1];
  return c.t1 ? null : c;
};
R.save = function () {
  try { if (R.run) set_variable("ripples_run", JSON.stringify(R.run)); else delete_variable("ripples_run"); } catch (e) {}
  R.saveAt = Date.now();
};
R.saveAll = function () {
  R.save();
  try { set_variable("ripples_runs", JSON.stringify(R.runs)); } catch (e) {}
  try { set_variable("ripples_codex", JSON.stringify(R.codex)); } catch (e) {}
};
R.draw = function () {
  if (R.drawT) return;
  R.drawT = setTimeout(function () { R.drawT = null; run_function("ripples_render", [], "ripples"); }, 60);
};

// ---- Runs and ripples ----------------------------------------------------
R.startRun = function () {
  if (R.run) R.endRun("?");
  var now = Date.now();
  R.run = { id: now, t0: now, t1: 0, end: "", lives: null, rerolls: null, renown: 0, threads: null, ripples: [], screens: [], held: [] };
  R.ready = 0;
  R.save();
  R.draw();
};
R.endRun = function (why) {
  var r = R.run;
  if (!r) return;
  var now = Date.now();
  var c = R.cur();
  if (c) { c.flees = R.fleesIn(c); c.t1 = now; c.done = false; }
  r.t1 = now;
  r.end = why || (r.lives === 0 ? "died" : "left");
  r.depth = 0;
  for (var i = 0; i < r.ripples.length; i++) if (r.ripples[i].n > r.depth) r.depth = r.ripples[i].n;
  R.runs.push(r);
  while (R.runs.length > R.maxRuns) R.runs.shift();
  R.run = null;
  R.cap = null; R.ccap = null; R.scr = null;
  R.saveAll();
  R.say("run over: ripple " + r.depth + " in " + R.dur(r.t1 - r.t0) + (r.renown ? ", " + R.n(r.renown) + " renown" : "") + ".", "cyan");
  if (client.loom.notify) client.loom.notify("ripples");
  R.draw();
};
R.startRipple = function () {
  if (!R.run) R.startRun();
  var r = R.run, now = Date.now();
  var c = R.cur();
  if (c) { c.flees = R.fleesIn(c); c.t1 = now; c.done = false; }
  var last = r.ripples.length ? r.ripples[r.ripples.length - 1].n : 0;
  r.ripples.push({ n: last + 1, t0: now, t1: 0, done: false, intro: R.intro || "", kills: 0, xp: 0, gold: 0, dmg: {}, lost: 0, aff: [], obj: "", wave: null, lvl: null, spd: null, reroll: false, renown: 0, lives: r.lives, minHp: null, minPct: null, flees: 0, fleeBase: R.fleesNow() });
  R.intro = "";
  R.due = now + 1500;
  R.save();
  if (client.loom.notify) client.loom.notify("ripples");
  R.draw();
};
R.endRipple = function () {
  var c = R.cur();
  if (!c) return;
  c.flees = R.fleesIn(c);
  c.t1 = Date.now();
  c.done = true;
  R.save();
  if (client.loom.notify) client.loom.notify("ripples");
};

// ---- Boon screens ----------------------------------------------------------
R.openScreen = function () {
  if (!R.run) R.startRun();
  var r = R.run;
  if (R.cur()) R.endRipple();
  var after = r.ripples.length ? r.ripples[r.ripples.length - 1].n : 0;
  // Kept aside until its options are read: it may be the same screen again.
  R.scr = { after: after, t: Date.now(), opts: [], took: "", rerolled: false, rule: 0 };
};
// A screen read whole. The same options again with nothing claimed since is
// the same screen shown again (BOON OPTIONS); other options mean a reroll.
R.finishScreen = function (s) {
  var r = R.run;
  if (!r || s.done) return;
  s.done = true;
  var prev = r.screens.length ? r.screens[r.screens.length - 1] : null;
  if (prev && !prev.took && prev.after === s.after) {
    if (prev.opts.join("|") === s.opts.join("|")) { R.scr = prev; prev.done = true; return; }
    prev.rerolled = true;
  }
  delete s.rule;
  r.screens.push(s);
  R.save();
  R.annotate(s);
};
// True when the line belonged to the screen; anything after its last line
// closes it and is read as usual.
R.screenLine = function (t) {
  var s = R.scr;
  if (s.rule >= 2 || s.closing) {
    var m0 = /^BOON REROLL to discard these options and see new ones \((\d+) remaining\)\.$/.exec(t);
    if (m0) { R.run.rerolls = parseInt(m0[1], 10); R.finishScreen(s); R.scr = null; R.save(); return true; }
    if (/^BOON CLAIM <boon name>/.test(t)) { s.closing = true; R.finishScreen(s); return true; }
    if (t === "") return true;
    R.finishScreen(s);
    R.scr = null;
    return false;
  }
  if (/^-{20,}$/.test(t)) { s.rule++; return true; }
  if (s.rule === 1) {
    var m = /^(\S[^:]{1,45}):\s{2,}(\S.*)$/.exec(t);
    if (m) {
      var nm = m[1].trim();
      if (s.opts.indexOf(nm) < 0) s.opts.push(nm);
      var cb = R.codex.boons[nm] || (R.codex.boons[nm] = {});
      cb.d = m[2].trim();
      return true;
    }
    return false;
  }
  return t === "" || t === "Wading the Mnemosyne." || t === "There are no obvious exits.";
};
// What you've done with each option before, in the main window.
R.annotate = function (s) {
  var st = R.boonStats();
  var lines = [];
  for (var i = 0; i < s.opts.length; i++) {
    var nm = s.opts[i];
    if (nm === "Restoration") continue;
    var b = st[nm];
    var held = R.run && R.run.held.indexOf(nm) >= 0;
    var txt;
    if (!b || !b.offered) txt = "new: never offered before";
    else txt = "taken " + b.taken + " of " + b.offered + (b.reach !== null ? ", runs with it reached " + b.reach : "") + (held ? " (held: taking it again echoes it)" : "");
    lines.push("  " + nm + ": " + txt);
  }
  if (lines.length) { R.say("these offers, from your past runs:", "cyan"); for (var j = 0; j < lines.length; j++) display_notice(lines[j], "cyan"); }
  R.draw();
};
R.claimed = function () {
  var r = R.run;
  if (!r) return;
  var s = null;
  for (var i = r.screens.length - 1; i >= 0; i--) if (!r.screens[i].took) { s = r.screens[i]; break; }
  if (!s) return;
  s.took = "?";
  R.scr = null;
  // The claim line names nothing: BOON CLAIMED tells which, quietly.
  if (!R.paused()) {
    R.ccap = { s: s, at: Date.now(), on: false, rules: 0, rows: [], before: r.held.slice(), echo: JSON.parse(JSON.stringify(r.echo || {})) };
    send_command("boon claimed");
  }
  R.save();
  R.draw();
};
// BOON CLAIMED answers with a table (Ricardo, 2026-11-26):
//   Boon        Echoes     Rarity
//   ------------------------------
//   Draconic Sweep   1     uncommon
//   ------------------------------
// It's read from its header to its closing rule, and only those lines are
// hidden; anything before the header is left alone.
R.claimLine = function (t) {
  var q = R.ccap;
  if (!q.on) {
    if (/^Boon\s+Echoes\s+Rarity\s*$/.test(t)) { q.on = true; return true; }
    return false;
  }
  if (/^-{20,}$/.test(t)) { q.rules++; if (q.rules >= 2) R.claimDone(); return true; }
  var m = /^(\S.*?)\s+(\d+)\s+([A-Za-z]+)\s*$/.exec(t);
  if (m) { q.rows.push({ name: m[1].trim(), echo: parseInt(m[2], 10), rar: m[3].toLowerCase() }); return true; }
  if (t === "") return true;
  // Not the table after all: stop reading, read the line as usual.
  R.claimDone();
  return false;
};
R.claimDone = function () {
  var q = R.ccap;
  R.ccap = null;
  if (!q || !R.run) return;
  var r = R.run, took = "?";
  if (q.rows.length) {
    var now = {}, names = [];
    for (var i = 0; i < q.rows.length; i++) {
      var w = q.rows[i];
      now[w.name] = w.echo; names.push(w.name);
      var cb = R.codex.boons[w.name] || (R.codex.boons[w.name] = {});
      cb.r = w.rar;
    }
    // The claim: an option that's new in the list, or whose echoes grew.
    var grew = [];
    for (var k = 0; k < q.s.opts.length; k++) {
      var nm = q.s.opts[k];
      if (now[nm] !== undefined && now[nm] > (q.echo[nm] || 0)) grew.push(nm);
    }
    if (grew.length === 1) took = grew[0];
    else if (grew.length === 0 && q.s.opts.indexOf("Restoration") >= 0) took = "Restoration";
    r.held = names;
    r.echo = now;
  }
  q.s.took = took;
  if (took === "?") R.say("couldn't tell which boon you claimed (RIPPLES TOOK <boon> sets it).", "orange");
  R.save();
  R.draw();
};

// ---- WADE STATUS ------------------------------------------------------------
R.statusStart = function (n) {
  var ours = R.asked && Date.now() - R.asked < 5000;
  R.asked = 0;
  R.cap = { n: n, ours: ours, f: {}, aff: [], fx: false, rules: 0, last: "" };
};
R.statusLine = function (t) {
  var q = R.cap;
  if (/^-{20,}$/.test(t)) {
    q.rules++;
    if (q.fx && q.last === "rule") { R.statusDone(); return true; }
    q.last = "rule";
    return true;
  }
  q.last = "";
  if (t === "") return true;
  if (/^Ongoing effects:/.test(t)) { q.fx = true; return true; }
  var m = /^(\S[^:]{1,45}):\s+(\S.*)$/.exec(t);
  if (m && q.fx) {
    var nm = m[1].trim();
    if (q.aff.indexOf(nm) < 0) q.aff.push(nm);
    R.codex.affixes[nm] = m[2].trim();
    return true;
  }
  if (m) { q.f[m[1].trim().toLowerCase()] = m[2].trim(); return true; }
  // Anything else isn't the status: stop reading, show it.
  R.statusDone();
  return false;
};
R.statusDone = function () {
  var q = R.cap;
  R.cap = null;
  if (!q) return;
  if (!R.run) R.startRun();
  var r = R.run, f = q.f;
  var c = R.cur();
  if (!c && r.ripples.length === 0) { R.intro = ""; R.startRipple(); c = R.cur(); }
  var lives = parseInt(f["remaining lives"], 10);
  if (!isNaN(lives)) {
    if (c && r.lives !== null && lives < r.lives) c.lost += r.lives - lives;
    r.lives = lives;
  }
  var rr = parseInt(f["rerolls"], 10);
  if (!isNaN(rr)) r.rerolls = rr;
  if (c) {
    if (q.n && c.n !== q.n) c.n = q.n;
    var w = parseInt(f["wave progress"], 10);
    if (!isNaN(w)) { c.wave = w; c.wKills = c.kills; }
    if (f["objective"]) c.obj = f["objective"];
    if (f["reward"]) c.reward = f["reward"];
    var lv = parseInt(f["denizen levels increased by"], 10);
    if (!isNaN(lv)) c.lvl = lv;
    var sp = parseInt(f["denizen speed increased by"], 10);
    if (!isNaN(sp)) c.spd = sp;
    for (var i = 0; i < q.aff.length; i++) if (c.aff.indexOf(q.aff[i]) < 0) c.aff.push(q.aff[i]);
  }
  R.due = Date.now() + (R.poll > 0 ? R.poll * 1000 : 1e12);
  R.save();
  R.draw();
};

// ---- Every line -------------------------------------------------------------
// Returns true when the line should be hidden (only output it asked for).
R.line = function (raw) {
  var t = String(raw === undefined || raw === null ? "" : raw).replace(/\u00a0/g, " ").replace(/\s+$/, "");
  if (/^\d+h, \d+m\b/.test(t)) return false;                 // a prompt
  if (R.ccap && R.claimLine(t)) return true;
  var m;
  if (/^You wade (\d+) ripples? deep into the tides of memory:$/.test(t)) {
    m = /^You wade (\d+)/.exec(t);
    R.statusStart(parseInt(m[1], 10));
    return R.cap.ours;
  }
  if (t.indexOf("flickers of power that may aide you") >= 0) { R.openScreen(); return false; }
  if (R.scr && R.screenLine(t)) return false;
  if (t === "You silently slip beneath the water and the world is as it once was.") { R.startRun(); return false; }
  // Threads come by message a minute or so after you leave (Ricardo,
  // 2026-11-26): "The Mnemosyne releases its hold, weaving 8 shimmering
  // threads into your possession." Seen on arrival or when read with MSGS.
  if (t.indexOf("The Mnemosyne releases its hold, weaving ") >= 0) {
    var tm = /weaving (\d+) shimmering threads? into your possession/.exec(t);
    if (tm) R.threads(parseInt(tm[1], 10));
    return false;
  }
  if (!R.run) {
    if (t === "You may once more wade the depths of the Mnemosyne.") { R.ready = Date.now(); R.draw(); }
    return false;
  }
  var c = R.cur();
  var ch = t.charAt(0);
  if (ch === "H" && (m = /^Health lost: (\d+) \(([^)]+)\)\.$/.exec(t))) {
    if (c) { var ty = m[2].replace(/^physical /, ""); c.dmg[ty] = (c.dmg[ty] || 0) + parseInt(m[1], 10); R.draw(); }
    return false;
  }
  if (ch === "Y") {
    if ((m = /^You have gained (\d+) experience/.exec(t))) { if (c) { c.xp += parseInt(m[1], 10); R.draw(); } return false; }
    if ((m = /^You pick up ([\d,]+) gold sovereigns?\.$/.exec(t))) { if (c) { c.gold += parseInt(m[1].replace(/,/g, ""), 10); R.draw(); } return false; }
    if (/^You have slain /.test(t)) {
      if (c) { c.kills++; if (R.due - Date.now() > 10000 && Date.now() - (c.lastPoll || 0) > 10000) R.due = Date.now() + 800; R.draw(); }
      return false;
    }
    if ((m = /^You have been slain by (.+?)\.$/.exec(t))) { if (c) c.killer = m[1]; R.run.killer = m[1]; R.due = Date.now() + 1500; return false; }
    if (t === "You may once more wade the depths of the Mnemosyne.") { R.ready = Date.now(); R.draw(); return false; }
    if (/^You begin to seek a path free of the Mnemosyne's depths/.test(t)) { R.run.leaving = Date.now(); return false; }
    return false;
  }
  if (t === "A fulgent eddy falls still.") { R.claimed(); return false; }
  if (t === "Claim another boon.") {
    // A second pick from the same screen (a boss's reward).
    var ls = R.run.screens[R.run.screens.length - 1];
    if (ls && ls.took) { R.run.screens.push({ after: ls.after, t: Date.now(), opts: ls.opts.slice(), took: "", rerolled: false, extra: true, done: true }); R.save(); R.draw(); }
    return false;
  }
  if (t === "A fresh eddy of possibility coalesces - you have gained a boon reroll.") { var lr = R.run.ripples[R.run.ripples.length - 1]; if (lr) lr.reroll = true; return false; }
  if ((m = /\(You gain ([\d,]+) Renown\.\)$/.exec(t))) {
    var ren = parseInt(m[1].replace(/,/g, ""), 10);
    R.run.renown += ren;
    var lr2 = R.run.ripples[R.run.ripples.length - 1];
    if (lr2) lr2.renown = (lr2.renown || 0) + ren;
    R.save(); R.draw();
    return false;
  }
  if (t === "The Mnemosyne relinquishes memory's grip upon you.") { R.endRun(); return false; }
  // The countdown, the place, GO!
  if (/^[0-5]$/.test(t)) { R.count = t; R.intro = ""; return false; }
  if (t === "GO!") { R.count = null; R.startRipple(); return false; }
  if (R.count === "0") { R.intro = t; R.count = null; return false; }
  return false;
};
// A WADE STATUS being read comes first: its lines are hidden only when it
// was ours. A line that isn't part of it ends it and is read as usual.
R.lineRest = R.line;
R.line = function (raw) {
  if (R.cap) {
    var ours = R.cap.ours;
    var t = String(raw === undefined || raw === null ? "" : raw).replace(/\u00a0/g, " ").replace(/\s+$/, "");
    if (/^\d+h, \d+m\b/.test(t)) return false;
    if (R.statusLine(t)) return ours;
  }
  return R.lineRest(raw);
};

// ---- The prompt ---------------------------------------------------------------
// After each prompt's lines: close what the prompt ends, ask WADE STATUS when due.
R.prompt = function () {
  if (R.ccap && !R.ccap.on && Date.now() - R.ccap.at > 10000) R.claimDone();   // no answer: give up
  if (R.cap) R.statusDone();
  if (R.count === "0") R.count = null;
  var c = R.cur();
  var now = Date.now();
  if (c && R.poll > 0 && !R.cap && !R.ccap && !R.scr && now >= R.due && !R.paused() && !(R.run && R.run.leaving)) {
    R.asked = now;
    c.lastPoll = now;
    R.due = now + R.poll * 1000;
    send_command("wade status");
  }
  if (R.run && now - (R.saveAt || 0) > 30000) R.save();
};

// ---- Health, flees, damage colour ---------------------------------------------
// The lowest health in each ripple: how close you came to dying.
R.vitals = function (g) {
  var hp = parseInt(g.hp, 10), mx = parseInt(g.maxhp, 10);
  if (isNaN(hp) || isNaN(mx) || mx <= 0) return;
  R.maxhp = mx;
  var c = R.cur();
  if (!c) return;
  var p = Math.round(hp / mx * 100);
  if (c.minHp === null || c.minHp === undefined || hp < c.minHp) { c.minHp = hp; c.minPct = p; c.minAt = Date.now(); }
};
// The basher's flees, through loom (link basher-ripples): a running count,
// so a ripple's flees are the count now less the count when it began.
R.fleesNow = function () {
  var LL = client.loom.loom;
  var v = (LL && LL.answer) ? LL.answer("ripples", "basher.flees") : undefined;
  return typeof v == "number" ? v : null;
};
R.fleesIn = function (c) {
  if (!c) return 0;
  if (c.t1) return c.flees || 0;
  var now = R.fleesNow();
  if (now === null) return c.flees || 0;
  if (c.fleeBase === null || c.fleeBase === undefined || now < c.fleeBase) c.fleeBase = 0;   // a reload since
  return now - c.fleeBase;
};
R.hasFlees = function () { return R.fleesNow() !== null; };
// Damage taken per second, coloured as huntstats colours it (link
// huntstats-ripples, HUNTSTATS TANK); without it, the same rule at its
// default of 3% of your max health a second.
R.tone = function (dps) {
  var LL = client.loom.loom;
  var t = (LL && LL.answer) ? LL.answer("ripples", "damage.tone", dps) : undefined;
  if (t && t.colour) return t;
  if (!R.maxhp) return null;
  var cap = 0.03 * R.maxhp;
  if (dps < cap / 2) return { colour: "#8fd694", word: "under half of what you heal (3% of max health a second)", cap: cap };
  if (dps <= cap) return { colour: "#e8c65a", word: "up to what you heal (3% of max health a second)", cap: cap };
  return { colour: "#ff6a5e", word: "more than you heal (3% of max health a second)", cap: cap };
};
// Denizens left, guessed from the wave's progress at the last WADE STATUS
// and the kills by then: null when there's nothing to go on.
R.left = function (c) {
  if (!c || !c.wave || c.wave >= 100 || !c.wKills) return null;
  return Math.max(0, Math.round(c.wKills / (c.wave / 100) - c.kills));
};
// Renaming a place everywhere it shows: every place line now shown under
// that name gets the new one, kept for the ripples to come.
R.rename = function (from, to) {
  var intros = {}, all = R.ripplesAll(true), n = 0;
  for (var i = 0; i < all.length; i++) if (all[i].intro && R.place(all[i]).toLowerCase() === String(from).toLowerCase()) intros[all[i].intro] = 1;
  for (var k in intros) if (intros.hasOwnProperty(k)) {
    if (to) R.names[k] = String(to).slice(0, 40); else delete R.names[k];
    n++;
  }
  if (n) { try { set_variable("ripples_names", JSON.stringify(R.names)); } catch (e) {} R.draw(); }
  return n;
};

// The threads go to the last finished run, once: reading the message again
// changes nothing.
R.threads = function (n) {
  var r = R.runs.length ? R.runs[R.runs.length - 1] : null;
  if (!r || (r.threads !== null && r.threads !== undefined)) return;
  r.threads = n;
  try { set_variable("ripples_runs", JSON.stringify(R.runs)); } catch (e) {}
  R.say(n + " threads for the run that reached ripple " + R.depthOf(r) + ".", "lime");
  R.draw();
};

// ---- Numbers for the tab and the notices ------------------------------------
R.allRuns = function () { return R.run ? R.runs.concat([R.run]) : R.runs.slice(); };
R.secs = function (c) { return Math.max(1, ((c.t1 || Date.now()) - c.t0) / 1000); };
R.dmgTotal = function (c) { var s = 0; for (var k in c.dmg) if (c.dmg.hasOwnProperty(k)) s += c.dmg[k]; return s; };
R.median = function (a) {
  if (!a.length) return null;
  var b = a.slice().sort(function (x, y) { return x - y; });
  var h = Math.floor(b.length / 2);
  return b.length % 2 ? b[h] : Math.round((b[h - 1] + b[h]) / 2 * 10) / 10;
};
R.depthOf = function (run) { var d = 0; for (var i = 0; i < run.ripples.length; i++) if (run.ripples[i].n > d) d = run.ripples[i].n; return d; };
R.boonStats = function () {
  var out = {}, runs = R.allRuns();
  for (var i = 0; i < runs.length; i++) {
    var run = runs[i], seen = {};
    for (var j = 0; j < run.screens.length; j++) {
      var s = run.screens[j];
      for (var k = 0; k < s.opts.length; k++) {
        var nm = s.opts[k];
        if (s.extra && s.took !== nm) continue;   // a second pick: the screen was counted once
        var b = out[nm] || (out[nm] = { offered: 0, taken: 0, depths: [], last: 0 });
        if (!s.extra) b.offered++;
        if (s.t > b.last) b.last = s.t;
        if (s.took === nm) { b.taken++; if (!seen[nm] && run !== R.run) { seen[nm] = 1; b.depths.push(R.depthOf(run)); } }
      }
    }
  }
  for (var n in out) if (out.hasOwnProperty(n)) out[n].reach = out[n].depths.length ? R.median(out[n].depths) : null;
  return out;
};
// Every finished ripple at its depth: survived means no life lost there.
R.ripplesAll = function (withLive) {
  var out = [], runs = R.allRuns();
  for (var i = 0; i < runs.length; i++) {
    for (var j = 0; j < runs[i].ripples.length; j++) {
      var c = runs[i].ripples[j];
      if (c.t1 || withLive) out.push(c);
    }
  }
  return out;
};
R.affixStats = function () {
  var all = R.ripplesAll(false), byDepth = {}, out = {};
  for (var i = 0; i < all.length; i++) {
    var c = all[i], d = byDepth[c.n] || (byDepth[c.n] = { n: 0, ok: 0, dps: 0 });
    d.n++; if (!c.lost) d.ok++; d.dps += R.dmgTotal(c) / R.secs(c);
  }
  for (var j = 0; j < all.length; j++) {
    var cc = all[j];
    for (var k = 0; k < (cc.aff || []).length; k++) {
      var nm = cc.aff[k];
      var a = out[nm] || (out[nm] = { seen: 0, ok: 0, first: 99, base: 0, dps: 0, bdps: 0, lost: 0 });
      var bd = byDepth[cc.n];
      a.seen++; if (!cc.lost) a.ok++; a.lost += cc.lost || 0;
      if (cc.n < a.first) a.first = cc.n;
      a.base += bd.ok / bd.n;
      a.dps += R.dmgTotal(cc) / R.secs(cc);
      a.bdps += bd.dps / bd.n;
    }
  }
  for (var n in out) if (out.hasOwnProperty(n)) {
    var o = out[n];
    o.vs = Math.round((o.ok / o.seen - o.base / o.seen) * 100);
    o.dpsPct = o.bdps > 0 ? Math.round((o.dps / o.bdps - 1) * 100) : 0;
  }
  return out;
};
R.best = function () {
  var b = null;
  for (var i = 0; i < R.runs.length; i++) {
    var r = R.runs[i], d = R.depthOf(r), t = r.t1 - r.t0;
    if (!b || d > b.d || (d === b.d && t < b.t)) b = { run: r, d: d, t: t };
  }
  return b;
};

// ---- The tab's clicks ------------------------------------------------------------
if (!window.loomRipplesSx) window.loomRipplesSx = {};
window.loomRipples = {
  view: function (v) { var X = client.loom && client.loom.ripples; if (X) { X.view = v; run_function("ripples_render", [], "ripples"); } },
  rename: function (from) {
    var X = client.loom && client.loom.ripples, to;
    if (!X) return;
    try { to = window.prompt("New name for " + from + " (empty: the default):", from); } catch (e) { to = null; }
    if (to === null || to === undefined) return;
    to = String(to).trim();
    if (X.rename(from, to)) X.say(to ? from + " is now " + to + "." : from + " is back to its default name.", "lime");
  },
  sort: function (k) { var X = client.loom && client.loom.ripples; if (X) { X.sort = k; run_function("ripples_render", [], "ripples"); } },
  keep: function (el) { try { window.loomRipplesSx[el.getAttribute("data-rp-sx")] = el.scrollLeft; } catch (e) {} }
};
// Wide tables scroll sideways; a redraw puts each back where you left it.
R.restoreScroll = function () {
  try {
    var els = document.querySelectorAll("[data-rp-sx]");
    for (var i = 0; i < els.length; i++) {
      var v = window.loomRipplesSx[els[i].getAttribute("data-rp-sx")];
      if (v && els[i].scrollLeft !== v) els[i].scrollLeft = v;
    }
  } catch (e) {}
};
