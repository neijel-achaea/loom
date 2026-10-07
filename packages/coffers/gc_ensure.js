// Builds every client.gc* piece from stored variables, once. Safe to call
// from anywhere: each piece is only built when missing. COFFERS REBUILD drops
// the helper object so edits to it take effect without a page reload.
function gcRaw(name) {
  var raw;
  try { raw = get_variable(name); } catch (e) { raw = undefined; }
  return raw;
}
function gcJSON(name, def) {
  var raw = gcRaw(name);
  if (raw === undefined || raw === null || raw === "") { return def; }
  if (typeof raw === "object") { return raw; }
  try { return JSON.parse(raw); } catch (e) { return def; }
}
function gcArr(name) {
  var a = gcJSON(name, []);
  if (Object.prototype.toString.call(a) !== "[object Array]") { a = []; }
  return a;
}
function gcNum(name, def, lo, hi) {
  var raw = gcRaw(name);
  var v = def;
  if (raw !== undefined && raw !== null && raw !== "") { v = parseInt(String(raw), 10); }
  if (isNaN(v) || v < lo) { v = def; }
  if (v > hi) { v = hi; }
  return v;
}
function gcFlag(name) {
  var raw = gcRaw(name);
  return !(raw !== undefined && raw !== null && String(raw) === "0");
}

// Shared formatting helpers, stored on client so every function can use them.
function gcN(n) {
  var neg = n < 0;
  var s = String(Math.round(Math.abs(n)));
  var out = "";
  while (s.length > 3) { out = "," + s.slice(-3) + out; s = s.slice(0, -3); }
  return (neg ? "-" : "") + s + out;
}
function gcS(n) { return (n > 0 ? "+" : "") + gcN(n); }
function gcK(n) {
  var a = Math.abs(n);
  var sg = n < 0 ? "-" : "";
  if (a < 1000) { return sg + String(Math.round(a)); }
  if (a < 1000000) { return sg + (a < 10000 ? Math.round(a / 100) / 10 : Math.round(a / 1000)) + "k"; }
  return sg + (a < 10000000 ? Math.round(a / 100000) / 10 : Math.round(a / 1000000)) + "M";
}
function gcDur(secs) {
  if (secs < 3600) { return Math.max(0, Math.round(secs / 60)) + "m"; }
  if (secs >= 86400) { return Math.round(secs / 86400 * 10) / 10 + "d"; }
  var h = Math.floor(secs / 3600);
  var m = Math.round((secs - h * 3600) / 60);
  return h + "h" + (m > 0 ? " " + m + "m" : "");
}
function gcDayKey(t) {
  var d = new Date(t * 1000);
  return d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate();
}
function gcDayStart(t) {
  var d = new Date(t * 1000);
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}
function gcDate(t) {
  var MN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var d = new Date(t * 1000);
  return d.getDate() + " " + MN[d.getMonth()];
}
function gcHM(t) {
  var d = new Date(t * 1000);
  var m = d.getMinutes();
  return d.getHours() + ":" + (m < 10 ? "0" : "") + m;
}
function gcTier(w) {
  var T = client.gcTiers;
  var idx = 0;
  for (var i = 0; i < T.length; i++) { if (w >= T[i][0]) { idx = i; } }
  return idx;
}

// Wealth tiers, lowest first: [threshold, title]. Data, not branching.
if (!client.gcTiers) {
  client.gcTiers = [[0, "Empty Pockets"], [10000, "Coin Purse"], [100000, "Strongbox"], [500000, "Coffer"], [1000000, "Counting House"], [2500000, "Vault"], [5000000, "Treasury"], [10000000, "Hoard"], [50000000, "Dragon's Hoard"], [250000000, "Mountain of Gold"]];
}
if (!client.gcF) {
  client.gcF = { n: gcN, s: gcS, k: gcK, dur: gcDur, dayKey: gcDayKey, dayStart: gcDayStart, date: gcDate, hm: gcHM, tier: gcTier };
}

if (!client.gcLive) { client.gcLive = {}; }
if (!client.gcMin) { client.gcMin = gcArr("gc_min"); }
if (!client.gcDays) { client.gcDays = gcArr("gc_days"); }
if (!client.gcSessions) { client.gcSessions = gcArr("gc_sessions"); }
if (!client.gcRec) {
  var rec = gcJSON("gc_rec", {});
  if (!rec || typeof rec !== "object") { rec = {}; }
  client.gcRec = rec;
}
if (client.gcSess === undefined) {
  var ss = gcJSON("gc_sess", null);
  if (!ss || typeof ss !== "object" || ss.s === undefined) { ss = null; }
  client.gcSess = ss;
}
if (client.gcGraphSess === undefined) { client.gcGraphSess = gcFlag("gc_graph_sess"); }
if (client.gcGraphLong === undefined) { client.gcGraphLong = gcFlag("gc_graph_long"); }
if (client.gcChartH === undefined) { client.gcChartH = gcNum("gc_graph_h", 105, 40, 400); }
if (client.gcMins === undefined) { client.gcMins = gcNum("gc_span_mins", 180, 15, 720); }
if (client.gcDaySpan === undefined) { client.gcDaySpan = gcNum("gc_span_days", 100, 7, 365); }
if (client.gcGap === undefined) { client.gcGap = gcNum("gc_gap", 30, 5, 240); }
if (client.gcBig === undefined) { client.gcBig = gcNum("gc_bigcoin", 1000, 0, 1000000000); }
// The goal is an amount to earn, measured from the fortune held when it was
// set (gc_goal_base). A base of -1 means "not yet taken": the next prompt fills it.
if (client.gcGoal === undefined) { client.gcGoal = gcNum("gc_goal", 0, 0, 2000000000); }
if (client.gcGoalBase === undefined) { client.gcGoalBase = gcNum("gc_goal_base", -1, -1, 2000000000000); }
if (client.gcGoalT === undefined) { client.gcGoalT = gcNum("gc_goal_t", 0, 0, 4000000000); }
if (client.gcGoalDone === undefined) { client.gcGoalDone = String(gcRaw("gc_goal_done")) === "1"; }