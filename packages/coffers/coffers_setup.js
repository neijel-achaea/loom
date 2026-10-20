// coffers_setup -- run from onLoad and onInstall, and by any reflex that
// finds the namespace missing. Namespace, registry, one-time migration of the
// gc_* variables, then every piece of client.loom.coffers built from stored
// variables, once: each piece is only built when missing. COFFERS REBUILD
// drops the helpers so edits to them take effect without a page reload.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.coffers) client.loom.coffers = {};
client.loom.registry.coffers = { version: "0.3.5", keyword: "COFFERS", desc: "{{description}}",
  // Redrawn by loom when the tab theme changes (#310).
  redraw: function () { run_function("coffers_render", [], "coffers"); } };
var CO = client.loom.coffers;

// One-time migration: gc_* -> coffers_*. A new variable that already holds
// data wins; the old one is deleted either way.
var coMoves = ["min", "days", "sessions", "rec", "sess", "graph_sess", "graph_long", "graph_h", "span_mins", "span_days", "gap", "bigcoin", "goal", "goal_base", "goal_t", "goal_done"];
for (var coI = 0; coI < coMoves.length; coI++) {
  var coOld;
  try { coOld = get_variable("gc_" + coMoves[coI]); } catch (e) { coOld = undefined; }
  if (coOld !== undefined && coOld !== null) {
    var coNew;
    try { coNew = get_variable("coffers_" + coMoves[coI]); } catch (e) { coNew = undefined; }
    if (coNew === undefined || coNew === null || coNew === "") set_variable("coffers_" + coMoves[coI], coOld);
    delete_variable("gc_" + coMoves[coI]);
  }
}
// The old package kept its state in 23 loose client.gc* keys; drop them so a
// reimport without a page reload doesn't leave two copies around. Data still
// in memory (it can be a few seconds fresher than the saved copy) carries over.
var coOldKeys = ["gc", "gcArgs", "gcBig", "gcChartH", "gcDaySpan", "gcDays", "gcF", "gcForce", "gcGap", "gcGoal", "gcGoalBase", "gcGoalDone", "gcGoalT", "gcGraphLong", "gcGraphSess", "gcLastWrite", "gcLive", "gcMin", "gcMins", "gcRec", "gcSess", "gcSessions", "gcTiers"];
var coCarry = { gcLive: "live", gcMin: "min", gcDays: "days", gcSessions: "sessions", gcRec: "rec", gcSess: "sess" };
for (var coK in coCarry) {
  if (coCarry.hasOwnProperty(coK) && client[coK] !== undefined && CO[coCarry[coK]] === undefined) CO[coCarry[coK]] = client[coK];
}
for (var coJ = 0; coJ < coOldKeys.length; coJ++) {
  if (client[coOldKeys[coJ]] !== undefined) delete client[coOldKeys[coJ]];
}

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

// Shared formatting helpers, stored on the namespace so every function can use them.
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
  var T = client.loom.coffers.tiers;
  var idx = 0;
  for (var i = 0; i < T.length; i++) { if (w >= T[i][0]) { idx = i; } }
  return idx;
}

// Wealth tiers, lowest first: [threshold, title]. Data, not branching.
if (!CO.tiers) {
  CO.tiers = [[0, "Empty Pockets"], [10000, "Coin Purse"], [100000, "Strongbox"], [500000, "Coffer"], [1000000, "Counting House"], [2500000, "Vault"], [5000000, "Treasury"], [10000000, "Hoard"], [50000000, "Dragon's Hoard"], [250000000, "Mountain of Gold"]];
}
if (!CO.f) {
  CO.f = { n: gcN, s: gcS, k: gcK, dur: gcDur, dayKey: gcDayKey, dayStart: gcDayStart, date: gcDate, hm: gcHM, tier: gcTier };
}

if (!CO.live) { CO.live = {}; }
if (!CO.min) { CO.min = gcArr("coffers_min"); }
if (!CO.days) { CO.days = gcArr("coffers_days"); }
if (!CO.sessions) { CO.sessions = gcArr("coffers_sessions"); }
if (!CO.rec) {
  var rec = gcJSON("coffers_rec", {});
  if (!rec || typeof rec !== "object") { rec = {}; }
  CO.rec = rec;
}
if (CO.sess === undefined) {
  var ss = gcJSON("coffers_sess", null);
  if (!ss || typeof ss !== "object" || ss.s === undefined) { ss = null; }
  CO.sess = ss;
}
if (CO.graphSess === undefined) { CO.graphSess = gcFlag("coffers_graph_sess"); }
if (CO.graphLong === undefined) { CO.graphLong = gcFlag("coffers_graph_long"); }
if (CO.chartH === undefined) { CO.chartH = gcNum("coffers_graph_h", 105, 40, 400); }
if (CO.mins === undefined) { CO.mins = gcNum("coffers_span_mins", 180, 15, 720); }
if (CO.daySpan === undefined) { CO.daySpan = gcNum("coffers_span_days", 100, 7, 365); }
if (CO.gap === undefined) { CO.gap = gcNum("coffers_gap", 30, 5, 240); }
if (CO.big === undefined) { CO.big = gcNum("coffers_bigcoin", 1000, 0, 1000000000); }
// The goal is an amount to earn, measured from the fortune held when it was
// set (coffers_goal_base). A base of -1 means "not yet taken": the next prompt fills it.
if (CO.goal === undefined) { CO.goal = gcNum("coffers_goal", 0, 0, 2000000000); }
if (CO.goalBase === undefined) { CO.goalBase = gcNum("coffers_goal_base", -1, -1, 2000000000000); }
if (CO.goalT === undefined) { CO.goalT = gcNum("coffers_goal_t", 0, 0, 4000000000); }
if (CO.goalDone === undefined) { CO.goalDone = String(gcRaw("coffers_goal_done")) === "1"; }
// Where an accepted goal came from (a package's proposal, #35); "" when set by hand.
if (CO.goalSrc === undefined) { var gsRaw = gcRaw("coffers_goal_src"); CO.goalSrc = (gsRaw === undefined || gsRaw === null) ? "" : String(gsRaw); }

// The entry point other packages feed (#35), through loom's integrations: a
// proposed goal waits as a suggestion, tagged with its source, until the
// player accepts it (COFFERS ACCEPT: it becomes the goal) or dismisses it.
// Defined on every run, so a reimport replaces it.
//   entry.propose({ source, key, amount, why }) -> true when queued or
//     updated. One proposal per source and key: a newer one replaces the
//     older quietly. A dismissed one stays away until its source withdraws
//     it (its condition cleared); then it can come back.
//   entry.withdraw(source[, key]) -> how many proposals were taken back.
if (!CO.proposals) { CO.proposals = gcArr("coffers_proposals"); }
if (!CO.dismissed) { var cdRaw = gcJSON("coffers_dismissed", {}); CO.dismissed = (cdRaw && typeof cdRaw === "object") ? cdRaw : {}; }
CO.saveProposals = function () {
  try { set_variable("coffers_proposals", JSON.stringify(CO.proposals)); } catch (e) {}
  var any = false;
  for (var k in CO.dismissed) { if (CO.dismissed.hasOwnProperty(k)) { any = true; break; } }
  try { if (any) set_variable("coffers_dismissed", JSON.stringify(CO.dismissed)); else delete_variable("coffers_dismissed"); } catch (e) {}
};
CO.entry = {
  propose: function (pr) {
    if (!pr || !pr.source || pr.key === undefined || pr.key === null) return false;
    var amount = Math.round(Number(pr.amount));
    if (!(amount > 0)) return false;
    var src = String(pr.source), key = String(pr.key);
    if (CO.dismissed[src + "|" + key]) return false;
    var why = String(pr.why || "");
    var t = Math.floor(new Date().getTime() / 1000);
    var P = CO.proposals;
    for (var i = 0; i < P.length; i++) {
      if (P[i].src === src && P[i].key === key) {
        P[i].amount = amount; P[i].why = why; P[i].t = t;
        CO.saveProposals();
        run_function("coffers_render", [], "coffers");
        return true;
      }
    }
    P.push({ src: src, key: key, amount: amount, why: why, t: t });
    while (P.length > 10) { P.shift(); }
    CO.saveProposals();
    display_notice("[coffers] " + src + " proposes a goal: earn " + CO.f.n(amount) + " gold" + (why ? " \u2014 " + why : "") + ". COFFERS ACCEPT to add it to your goal, COFFERS DISMISS to drop it.", "cyan");
    run_function("coffers_render", [], "coffers");
    return true;
  },
  withdraw: function (source, key) {
    if (!source) return 0;
    var src = String(source), k = (key === undefined || key === null) ? null : String(key);
    var P = CO.proposals, n = 0;
    for (var i = P.length - 1; i >= 0; i--) {
      if (P[i].src === src && (k === null || P[i].key === k)) { P.splice(i, 1); n++; }
    }
    var dropped = false;
    for (var dk in CO.dismissed) {
      if (CO.dismissed.hasOwnProperty(dk) && (k === null ? dk.indexOf(src + "|") === 0 : dk === src + "|" + k)) { delete CO.dismissed[dk]; dropped = true; }
    }
    if (n || dropped) CO.saveProposals();
    if (n) run_function("coffers_render", [], "coffers");
    return n;
  }
};

// Gold given to you (#53): "Grulk gives 5,000 gold sovereigns to you."
// Kept in memory only, newest last, the last 30: { who, amount, t }.
if (!CO.gifts) CO.gifts = [];
// The read-only look other packages see through loom: never its variables.
//   look.gifts(since) -> copies of the gifts received after time `since`
//     (all of this page load's with no argument), oldest first.
CO.look = {
  gifts: function (since) {
    var out = [];
    for (var i = 0; i < CO.gifts.length; i++) { if (!since || CO.gifts[i].t > since) out.push({ who: CO.gifts[i].who, amount: CO.gifts[i].amount, t: CO.gifts[i].t }); }
    return out;
  }
};
