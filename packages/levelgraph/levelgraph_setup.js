// levelgraph_setup -- run from onLoad and onInstall, and by any reflex that
// finds the namespace missing. Namespace, registry, one-time migration of the
// lvl_* variables, then the two buffers and settings, each built if missing.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.levelgraph) client.loom.levelgraph = {};
client.loom.registry.levelgraph = { version: "0.2.3", keyword: "LEVELGRAPH", desc: "{{description}}",
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