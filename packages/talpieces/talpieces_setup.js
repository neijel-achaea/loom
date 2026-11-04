// talpieces_setup -- run from onLoad and onInstall, and by any reflex that
// finds the namespace missing. Namespace, registry, one-time migration from
// the talismans package, and the piece book. Safe to run again: the pieces and
// history already in memory are kept unless TP.pieces has been cleared (RESET).
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.talpieces) client.loom.talpieces = {};
client.loom.registry.talpieces = { version: "1.2.0", keyword: "TALPIECES", desc: "{{description}}",
  // Redrawn by loom when the tab theme changes (#310).
  redraw: function () { run_function("talpieces_render", [], "talpieces"); } };
var TP = client.loom.talpieces;

function tpHas(name) {
  var v;
  try { v = get_variable(name); } catch (e) { v = undefined; }
  return v !== null && v !== undefined && v !== "";
}

// One-time migration: tal_* variables -> talpieces_*. A new variable that
// already holds data wins; the old one is deleted either way.
var tpMoves = [["tal_pieces", "talpieces_pieces"], ["tal_hist", "talpieces_hist"], ["tal_graph_h", "talpieces_graph_h"]];
for (var tpI = 0; tpI < tpMoves.length; tpI++) {
  if (tpHas(tpMoves[tpI][0])) {
    if (!tpHas(tpMoves[tpI][1])) set_variable(tpMoves[tpI][1], get_variable(tpMoves[tpI][0]));
    delete_variable(tpMoves[tpI][0]);
  }
}
// tal_graph_on held "1"/"0"; talpieces_graph holds "on"/"off".
if (tpHas("tal_graph_on")) {
  if (!tpHas("talpieces_graph")) set_variable("talpieces_graph", String(get_variable("tal_graph_on")) === "0" ? "off" : "on");
  delete_variable("tal_graph_on");
}
// The old package kept its state in sixteen loose client.tal* keys; drop them
// so a reimport without a page reload doesn't leave two copies around.
var tpOld = ["tal", "talHist", "talGraphOn", "talChartH", "talNowC", "talNowR", "talBuilding", "talBuildTimer", "talForceMark", "talSeed", "talGoalCommon", "talGoalRare", "talGoalTotal", "talBucket", "talHistSoft", "talHistCap"];
for (var tpJ = 0; tpJ < tpOld.length; tpJ++) {
  if (client[tpOld[tpJ]] !== undefined) {
    if (tpOld[tpJ] === "talBuildTimer") { try { clearTimeout(client.talBuildTimer); } catch (e) {} }
    delete client[tpOld[tpJ]];
  }
}

if (!tpHas("talpieces_pieces")) set_variable("talpieces_pieces", "{}");
if (!tpHas("talpieces_hist")) set_variable("talpieces_hist", "[]");
if (!tpHas("talpieces_graph")) set_variable("talpieces_graph", "on");
if (!tpHas("talpieces_graph_h")) set_variable("talpieces_graph_h", "110");
// Queue TALISMAN COMBINE for each piece row of a listing (as the old package
// always did); OFF leaves combining to you.
if (!tpHas("talpieces_combine")) set_variable("talpieces_combine", "on");

// --- the piece book -------------------------------------------------------
// pieces[colour][type][level] = how many pieces of that level you hold.
// A level-n piece counts as 2^(n-1) level-1 pieces toward the goal.
if (!TP.pieces) {
  var tpP = {};
  try { tpP = JSON.parse(get_variable("talpieces_pieces")) || {}; } catch (e) { tpP = {}; }
  TP.pieces = tpP;
}
TP.reqCommon = 64;
TP.reqRare = 4;
TP.colors = ["black", "blue", "gold", "green", "red", "silver"];
TP.commonTypes = ["bone", "claw", "eye", "heart", "leather", "scale", "tooth"];
TP.colorrare = { black: "sac", blue: "lung", gold: "stem", green: "sac", red: "belly", silver: "larynx" };
TP.exceptions = { "brain stem": "stem", "acid sac": "sac", "poison sac": "sac" };
TP.real = function (type) { return this.exceptions[type] || type; };
TP.getcount = function (color, type) {
  var rt = this.real(type);
  var c = this.pieces[color];
  if (!c || !c[rt]) { return 0; }
  var total = 0, lv = c[rt];
  for (var k in lv) {
    if (lv.hasOwnProperty(k)) {
      var y = Number(lv[k]) || 0;
      if (y > 0) { total += Math.pow(2, Number(k) - 1) * y; }
    }
  }
  return total;
};
TP.add = function (color, type, level, count) {
  color = String(color).toLowerCase();
  var rt = this.real(String(type).toLowerCase());
  if (!this.pieces[color]) { this.pieces[color] = {}; }
  if (!this.pieces[color][rt]) { this.pieces[color][rt] = {}; }
  var key = String(level);
  this.pieces[color][rt][key] = (Number(this.pieces[color][rt][key]) || 0) + (Number(count) || 0);
};
TP.remove = function (color, type, level, count) {
  color = String(color).toLowerCase();
  var rt = this.real(String(type).toLowerCase());
  if (!this.pieces[color] || !this.pieces[color][rt]) { return; }
  var key = String(level);
  var n = (Number(this.pieces[color][rt][key]) || 0) - (Number(count) || 0);
  this.pieces[color][rt][key] = n > 0 ? n : 0;
};
// Pieces counted toward the goal, capped per type: [common, rare].
TP.totals = function () {
  var c = 0, r = 0;
  for (var ci = 0; ci < this.colors.length; ci++) {
    var color = this.colors[ci];
    for (var ti = 0; ti < this.commonTypes.length; ti++) {
      var n = this.getcount(color, this.commonTypes[ti]);
      c += (n > this.reqCommon) ? this.reqCommon : n;
    }
    var rn = this.getcount(color, this.colorrare[color]);
    r += (rn > this.reqRare) ? this.reqRare : rn;
  }
  return [c, r];
};
TP.reset = function () { this.pieces = {}; };

// --- history --------------------------------------------------------------
// Each entry is a compact array [unixSeconds, cappedCommonOwned, cappedRareOwned].
// Capped means counted toward the goal, so 100 black claws still scores 64.
if (!TP.hist) {
  var tpH = [];
  try { tpH = JSON.parse(get_variable("talpieces_hist")) || []; } catch (e) { tpH = []; }
  if (Object.prototype.toString.call(tpH) !== "[object Array]") { tpH = []; }
  TP.hist = tpH;
}
TP.graphOn = String(get_variable("talpieces_graph")) !== "off";
var tpCh = parseInt(get_variable("talpieces_graph_h"), 10);
if (!tpCh || isNaN(tpCh) || tpCh < 40) { tpCh = 110; }
if (tpCh > 400) { tpCh = 400; }
TP.chartH = tpCh;
// The days the graph shows (TALPIECES SPAN): a view only, the history itself is kept
// whole for RATE, SEED and compaction. 0 means all of it.
var tpSp = String(get_variable("talpieces_span_days") || "");
if (tpSp === "all") { TP.span = 0; }
else {
  tpSp = parseInt(tpSp, 10);
  TP.span = (!tpSp || isNaN(tpSp)) ? 30 : (tpSp < 7 ? 7 : (tpSp > 365 ? 365 : tpSp));
}
// Goal: 6 colours x 7 common types x 64, plus 6 x 4 rare.
TP.goalCommon = 2688;
TP.goalRare = 24;
TP.goalTotal = 2712;
TP.bucket = 3600;
TP.histSoft = 700;
TP.histCap = 1500;
if (TP.building === undefined) TP.building = false;
if (TP.forceMark === undefined) TP.forceMark = false;

// The read-only look other packages see through loom (#159, #54): what you
// hold against what the set needs, never the piece book itself. Counts are
// in level-1 pieces, as the goal counts them.
//   look.colours() -> [{ colour, types: [{ type, have, need, rare }] }],
//     the 7 commons and the colour's rare, for every colour.
TP.look = {
  colours: function () {
    var out = [];
    for (var ci = 0; ci < TP.colors.length; ci++) {
      var c = TP.colors[ci], ty = [];
      for (var ti = 0; ti < TP.commonTypes.length; ti++) ty.push({ type: TP.commonTypes[ti], have: TP.getcount(c, TP.commonTypes[ti]), need: TP.reqCommon, rare: false });
      ty.push({ type: TP.colorrare[c], have: TP.getcount(c, TP.colorrare[c]), need: TP.reqRare, rare: true });
      out.push({ colour: c, types: ty });
    }
    return out;
  },
  // look.total() -> pieces counted toward the goal now, and look.goal() the
  // goal (#448).
  total: function () { var x = TP.totals(); return x[0] + x[1]; },
  goal: function () { return TP.goalTotal; },
  // look.pace(days) -> pieces a day over the last `days` days (7 if not
  // given), as the tab's "Pace, last 7 days"; null without two points.
  pace: function (days) {
    var hs = TP.hist || [];
    if (hs.length < 2) return null;
    var last = hs[hs.length - 1], cut = last[0] - (days || 7) * 86400, ref = hs[0];
    for (var i = hs.length - 1; i >= 0; i--) { if (hs[i][0] <= cut) { ref = hs[i]; break; } }
    var span = (last[0] - ref[0]) / 86400;
    if (span <= 0) return null;
    return ((last[1] + last[2]) - (ref[1] + ref[2])) / span;
  }
};

// Goals (#460): a smaller target than the Elder Dragon, shown as its own bar
// in the tab. Two kinds, one shown at a time:
//   TP.pgoal  the player's own (TALPIECES GOAL): { n, base, t, done }, collect
//             n pieces counting from base (look.total() when set) at unix
//             time t; saved as talpieces_goal. Reached, it stays shown until
//             cleared.
//   TP.aim    one a link keeps here (loom's daily aim, #448), through
//             TP.entry; { source, base, to, done }, in memory only.
// The player's goal wins while set (Ricardo).
if (TP.pgoal === undefined) {
  var tpGo = null;
  try { tpGo = JSON.parse(get_variable("talpieces_goal") || "null"); } catch (e) { tpGo = null; }
  if (!tpGo || typeof tpGo !== "object" || !(tpGo.n >= 1) || typeof tpGo.base !== "number" || isNaN(tpGo.base)) tpGo = null;
  else tpGo = { n: Math.floor(tpGo.n), base: tpGo.base, t: tpGo.t > 0 ? tpGo.t : 0, done: !!tpGo.done };
  TP.pgoal = tpGo;
}
TP.saveGoal = function () {
  try { if (TP.pgoal) set_variable("talpieces_goal", JSON.stringify(TP.pgoal)); else delete_variable("talpieces_goal"); } catch (e) {}
};
if (TP.aim === undefined) TP.aim = null;
// The target the tab shows, or null: { kind: "goal"|"aim", base, to, done, t, src }.
TP.target = function () {
  if (TP.pgoal) return { kind: "goal", base: TP.pgoal.base, to: TP.pgoal.base + TP.pgoal.n, done: TP.pgoal.done, t: TP.pgoal.t, src: "" };
  if (TP.aim) return { kind: "aim", base: TP.aim.base, to: TP.aim.to, done: TP.aim.done, t: 0, src: TP.aim.source };
  return null;
};
// Run after the pieces change (not mid-way through a listing): a goal of the
// player's own reached is announced once.
TP.goalCheck = function () {
  if (!TP.pgoal || TP.pgoal.done) return;
  var tot = TP.look.total();
  if (!(tot >= TP.pgoal.base + TP.pgoal.n)) return;
  TP.pgoal.done = true;
  TP.saveGoal();
  display_notice("[talpieces] \u2713 Goal reached: " + TP.pgoal.n + " piece" + (TP.pgoal.n === 1 ? "" : "s") + " collected. TALPIECES GOAL sets the next one.", "lime");
};
// The write-side entry point other packages feed through loom (#460): a link
// keeps one aim here, under its source.
//   entry.aim({ source, base, to, done }) -> true when it is shown; the
//     tab is redrawn when it changed.
//   entry.withdraw(source) -> 1 when that source's aim was taken back.
TP.entry = {
  aim: function (a) {
    if (!a || !a.source || typeof a.to !== "number" || isNaN(a.to) || typeof a.base !== "number" || isNaN(a.base)) return false;
    var nu = { source: String(a.source), base: a.base, to: a.to, done: !!a.done };
    if (JSON.stringify(nu) !== JSON.stringify(TP.aim)) {
      TP.aim = nu;
      run_function("talpieces_render", [], "talpieces");
    }
    return true;
  },
  withdraw: function (source) {
    if (!TP.aim || (source && TP.aim.source !== String(source))) return 0;
    TP.aim = null;
    run_function("talpieces_render", [], "talpieces");
    return 1;
  }
};
