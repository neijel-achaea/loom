// levelgraph_setup -- run from onLoad and onInstall, and by any reflex that
// finds the namespace missing. Namespace, registry, one-time migration of the
// lvl_* variables, then the two buffers and settings, each built if missing.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.levelgraph) client.loom.levelgraph = {};
client.loom.registry.levelgraph = { version: "1.1.1", keyword: "LEVELGRAPH", desc: "{{description}}",
  // Redrawn by loom when the tab theme changes (#310).
  redraw: function () { run_function("levelgraph_render", [], "levelgraph"); } };
var LG = client.loom.levelgraph;

// One-time migration: lvl_* -> levelgraph_*. A new variable that already
// holds data wins; the old one is deleted either way. The older lvl_hist is
// folded into the day buffer below, then deleted too.
var lgMoves = ["min", "day", "graph_long", "graph_sess", "graph_h", "span_days", "span_mins"];
for (var lgI = 0; lgI < lgMoves.length; lgI++) {
  var lgOld;
  try { lgOld = get_variable("lvl_" + lgMoves[lgI]); } catch (e) { lgOld = undefined; }
  if (lgOld !== undefined && lgOld !== null) {
    var lgNew;
    try { lgNew = get_variable("levelgraph_" + lgMoves[lgI]); } catch (e) { lgNew = undefined; }
    if (lgNew === undefined || lgNew === null || lgNew === "" || lgNew === "[]") set_variable("levelgraph_" + lgMoves[lgI], lgOld);
    delete_variable("lvl_" + lgMoves[lgI]);
  }
}
// The old package kept its state in nine loose client.lvl* keys; drop them so
// a reimport without a page reload doesn't leave two copies around. Buffers
// still in memory carry over.
if (client.lvlMin && !LG.min) LG.min = client.lvlMin;
if (client.lvlDay && !LG.day) LG.day = client.lvlDay;
var lgOldKeys = ["lvlChartH", "lvlDay", "lvlDays", "lvlForceMark", "lvlGraphLong", "lvlGraphSess", "lvlLastWrite", "lvlMin", "lvlMins"];
for (var lgJ = 0; lgJ < lgOldKeys.length; lgJ++) {
  if (client[lgOldKeys[lgJ]] !== undefined) delete client[lgOldKeys[lgJ]];
}

// Two independent ring buffers, each bounded by construction:
//   levelgraph_day  one point per calendar day, trailing 100 days  (long-term trend)
//   levelgraph_min  one point per wall-clock minute, trailing 120  (current session)
// Both store [unixSeconds, level, nl]. Progress is level + nl/100.
function lvlDayKey(t) {
  var d = new Date(t * 1000);
  return d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate();
}
function lvlLoadArr(name) {
  var a = [];
  try { a = JSON.parse(get_variable(name)) || []; } catch (e) { a = []; }
  if (Object.prototype.toString.call(a) !== "[object Array]") { a = []; }
  return a;
}
function lvlNum(name, def, lo, hi) {
  var v = def;
  try { if (get_variable(name) !== undefined) { v = parseInt(get_variable(name), 10); } } catch (e) { v = def; }
  if (!v || isNaN(v) || v < lo) { v = def; }
  if (v > hi) { v = hi; }
  return v;
}

if (!LG.min) { LG.min = lvlLoadArr("levelgraph_min"); }

if (!LG.day) {
  var day = lvlLoadArr("levelgraph_day");
  if (day.length === 0) {
    // One-time migration: fold any legacy lvl_hist down to one point per day
    // so previously collected history is not thrown away.
    var old = lvlLoadArr("lvl_hist");
    var lastKey = "";
    for (var mi = 0; mi < old.length; mi++) {
      var k = lvlDayKey(old[mi][0]);
      if (k === lastKey && day.length > 0) { day[day.length - 1] = old[mi]; }
      else { day.push(old[mi]); lastKey = k; }
    }
    if (day.length > 0) {
      try { set_variable("levelgraph_day", JSON.stringify(day)); } catch (e) {}
    }
  }
  try { if (get_variable("lvl_hist") !== undefined && get_variable("lvl_hist") !== null) delete_variable("lvl_hist"); } catch (e) {}
  LG.day = day;
}

if (LG.graphLong === undefined) {
  var gl = "1";
  try { if (get_variable("levelgraph_graph_long") !== undefined) { gl = String(get_variable("levelgraph_graph_long")); } } catch (e) { gl = "1"; }
  LG.graphLong = (gl !== "0");
}
if (LG.graphSess === undefined) {
  var gs = "1";
  try { if (get_variable("levelgraph_graph_sess") !== undefined) { gs = String(get_variable("levelgraph_graph_sess")); } } catch (e) { gs = "1"; }
  LG.graphSess = (gs !== "0");
}
if (LG.chartH === undefined) { LG.chartH = lvlNum("levelgraph_graph_h", 105, 40, 400); }
if (LG.days === undefined) { LG.days = lvlNum("levelgraph_span_days", 100, 7, 365); }
if (LG.mins === undefined) { LG.mins = lvlNum("levelgraph_span_mins", 120, 15, 720); }

// The session (#335, Ricardo: as COFFERS does, independent of the graph's
// span): opened by the first sample, closed by LEVELGRAPH NEW or by a silence
// longer than the gap (LEVELGRAPH GAP, levelgraph_gap, default 30 minutes).
// Its gain, rate and time to the next level count from its start.
//   LG.sess  {s, last, p0}: start and last sample (unix seconds), progress at
//            the start (level + percent/100); saved as levelgraph_sess
if (LG.gap === undefined) { LG.gap = lvlNum("levelgraph_gap", 30, 5, 240); }
if (LG.sess === undefined) {
  var lgSs = null;
  try { lgSs = JSON.parse(get_variable("levelgraph_sess") || "null"); } catch (e) { lgSs = null; }
  if (!lgSs || typeof lgSs !== "object" || !(lgSs.s > 0) || !(lgSs.last >= lgSs.s) || typeof lgSs.p0 !== "number" || isNaN(lgSs.p0)) lgSs = null;
  LG.sess = lgSs;
}
LG.saveSess = function () {
  try { if (LG.sess) set_variable("levelgraph_sess", JSON.stringify(LG.sess)); else delete_variable("levelgraph_sess"); } catch (e) {}
  LG.sessSaved = Math.floor(Date.now() / 1000);
};
// Deaths (#336): [[unix seconds, killer], ...], newest last, saved as
// levelgraph_deaths. Kept as long as the minute graph can show them (its span),
// at most LG.deathCap.
LG.deathCap = 50;
if (!Array.isArray(LG.deaths)) {
  var lgDs = null;
  try { lgDs = JSON.parse(get_variable("levelgraph_deaths") || "[]"); } catch (e) { lgDs = null; }
  LG.deaths = Array.isArray(lgDs) ? lgDs.filter(function (d) { return Array.isArray(d) && d[0] > 0 && typeof d[1] == "string"; }) : [];
}
LG.addDeath = function (by) {
  var now = Math.floor(Date.now() / 1000), keep = now - LG.mins * 60;
  LG.deaths.push([now, by || "?"]);
  LG.deaths = LG.deaths.filter(function (d) { return d[0] >= keep; }).slice(-LG.deathCap);
  try { set_variable("levelgraph_deaths", JSON.stringify(LG.deaths)); } catch (e) {}
};
// The open session's figures, or null: {span (s), gain (levels), perHour, togo (s, -1 unknown), p0, s}.
LG.sessFigures = function (cur) {
  var S = LG.sess;
  if (!S || !cur) return null;
  var span = S.last - S.s;
  var gain = (cur[1] + cur[2] / 100) - S.p0;
  var perHour = span >= 60 ? gain / (span / 3600) : 0;
  var togo = perHour > 0 ? (1 - cur[2] / 100) / perHour * 3600 : -1;
  return { span: span, gain: gain, perHour: perHour, togo: togo, p0: S.p0, s: S.s };
};

// The read-only look other packages see through loom (#448): progress as
// level + percent/100, and the pace over the last days. Defined on every run.
//   look.progress() -> the latest progress, or null before any sample
//   look.pace(days) -> levels a day over the last `days` days of the day
//     buffer (7 if not given), or null with less than a day of history
LG.look = {
  progress: function () {
    var a = (LG.min && LG.min.length) ? LG.min : (LG.day || []);
    if (!a.length) return null;
    var p = a[a.length - 1];
    return p[1] + p[2] / 100;
  },
  pace: function (days) {
    var hs = LG.day || [];
    if (hs.length < 2) return null;
    var last = hs[hs.length - 1], cut = last[0] - (days || 7) * 86400, ref = hs[0];
    for (var i = hs.length - 1; i >= 0; i--) { if (hs[i][0] <= cut) { ref = hs[i]; break; } }
    var span = (last[0] - ref[0]) / 86400;
    if (span < 1) return null;
    return ((last[1] + last[2] / 100) - (ref[1] + ref[2] / 100)) / span;
  }
};

// Goals (#460, the goal half of #214). Two kinds, one shown at a time:
//   LG.goal  the player's own (LEVELGRAPH GOAL): { to, base, t, done }, a
//            target progress (level + percent/100), the progress and unix
//            time it was set at, and whether it was reached; saved as
//            levelgraph_goal. Reached, it stays shown until cleared.
//   LG.aim   one a link keeps here (loom's daily aim, #448), through
//            LG.entry; { source, base, to, done }, in memory only (the link
//            puts it back on every load).
// The player's goal wins while set (Ricardo).
if (LG.goal === undefined) {
  var lgGo = null;
  try { lgGo = JSON.parse(get_variable("levelgraph_goal") || "null"); } catch (e) { lgGo = null; }
  if (!lgGo || typeof lgGo !== "object" || !(lgGo.to > 0) || typeof lgGo.base !== "number" || isNaN(lgGo.base)) lgGo = null;
  else lgGo = { to: lgGo.to, base: lgGo.base, t: lgGo.t > 0 ? lgGo.t : 0, done: !!lgGo.done };
  LG.goal = lgGo;
}
LG.saveGoal = function () {
  try { if (LG.goal) set_variable("levelgraph_goal", JSON.stringify(LG.goal)); else delete_variable("levelgraph_goal"); } catch (e) {}
};
if (LG.aim === undefined) LG.aim = null;
// lvlName(104.59) -> "level 104 at 59%"; lvlName(105) -> "level 105".
LG.lvlName = function (v) {
  var l = Math.floor(v + 1e-6), pct = Math.round((v - l) * 100);
  if (pct >= 100) { l++; pct = 0; }
  return "level " + l + (pct ? " at " + pct + "%" : "");
};
// The target the tab shows, or null: { kind: "goal"|"aim", to, base, done, t, src }.
LG.target = function () {
  if (LG.goal) return { kind: "goal", to: LG.goal.to, base: LG.goal.base, done: LG.goal.done, t: LG.goal.t, src: "" };
  if (LG.aim) return { kind: "aim", to: LG.aim.to, base: LG.aim.base, done: LG.aim.done, t: 0, src: LG.aim.source };
  return null;
};
// Called after each sample with the progress now: a goal of the player's
// own reached is announced once.
LG.goalCheck = function (prg) {
  if (!LG.goal || LG.goal.done || typeof prg !== "number" || !(prg >= LG.goal.to - 1e-6)) return;
  LG.goal.done = true;
  LG.saveGoal();
  display_notice("[levelgraph] \u2713 Goal reached: " + LG.lvlName(LG.goal.to) + ". LEVELGRAPH GOAL sets the next one.", "lime");
};

// The write-side entry point other packages feed through loom (#460), as
// ledger's and coffers' entry: a link keeps one aim here, under its source.
//   entry.aim({ source, base, to, done }) -> true when it is shown; the
//     tab is redrawn when it changed.
//   entry.withdraw(source) -> 1 when that source's aim was taken back.
LG.entry = {
  aim: function (a) {
    if (!a || !a.source || typeof a.to !== "number" || isNaN(a.to) || typeof a.base !== "number" || isNaN(a.base)) return false;
    var nu = { source: String(a.source), base: a.base, to: a.to, done: !!a.done };
    if (JSON.stringify(nu) !== JSON.stringify(LG.aim)) {
      LG.aim = nu;
      run_function("levelgraph_render", [], "levelgraph");
    }
    return true;
  },
  withdraw: function (source) {
    if (!LG.aim || (source && LG.aim.source !== String(source))) return 0;
    LG.aim = null;
    run_function("levelgraph_render", [], "levelgraph");
    return 1;
  }
};
