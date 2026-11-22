// coffers_setup -- run from onLoad and onInstall, and by any reflex that
// finds the namespace missing. Namespace, registry, one-time migration of the
// gc_* variables, then every piece of client.loom.coffers built from stored
// variables, once: each piece is only built when missing. COFFERS RESET
// drops the helpers so edits to them take effect without a page reload.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.coffers) client.loom.coffers = {};
client.loom.registry.coffers = { version: "1.4.2", keyword: "COFFERS", desc: "{{description}}",
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
// Rebuilt every run (helpers, not data), so an edited table reaches players
// without COFFERS RESET. Bump CO.tiersId when the table changes: the rank
// ratchet then reseats quietly instead of announcing ranks already held.
CO.tiers = [[0, "Destitute"], [1000, "Beggar"], [2500, "Wretched"], [5000, "Humble"], [10000, "Meagre"], [25000, "Frugal"], [50000, "Ordinary"], [100000, "Comforted"], [250000, "Prosperous"], [500000, "Affluent"], [1000000, "Wealthy"], [2500000, "Opulent"], [5000000, "Magnate"], [10000000, "Rich"], [25000000, "Patrician"], [50000000, "Illustrious"], [100000000, "Magnificent"], [250000000, "Exalted"], [500000000, "Sovereign"], [1000000000, "Legendary"]];
CO.tiersId = 2;
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
// A new rank table: forget the old ratchet so the next tick sets it from the
// current fortune without a MILESTONE notice.
if (CO.rec.tiersId !== CO.tiersId) { delete CO.rec.tierAt; CO.rec.tiersId = CO.tiersId; }
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
//     With no key it also takes back that source's aim (counted as one).
//   entry.aim({ source, base, to, done }) -> true when it is shown: a daily
//     aim a link keeps here (loom's, #448), as levelgraph and talpieces take
//     theirs; base and to are fortunes (gold + bank). In memory only (CO.aim).
//     The player's goal wins in the tab while set.
// While today's aim stands unreached, propose turns proposals away (Ricardo,
// 2026-11-08): the aim already counts every way of making gold, spending
// against it, so a hunt goal or a recoup on top would only push harder.
// Once it's reached (or dropped, or its link is off) they come as before.
// Shopping's is exempt: it is the player's own GOAL click.
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
    if (src !== "shopping" && CO.aimGates()) return false;
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
    if (k === null && CO.aim && CO.aim.source === src) { CO.aim = null; n++; run_function("coffers_render", [], "coffers"); }
    else if (n) run_function("coffers_render", [], "coffers");
    return n;
  },
  aim: function (a) {
    if (!a || !a.source || typeof a.to !== "number" || isNaN(a.to) || typeof a.base !== "number" || isNaN(a.base)) return false;
    var nu = { source: String(a.source), base: a.base, to: a.to, done: !!a.done };
    if (JSON.stringify(nu) !== JSON.stringify(CO.aim)) {
      CO.aim = nu;
      run_function("coffers_render", [], "coffers");
    }
    return true;
  }
};
if (CO.aim === undefined) CO.aim = null;
// True while today's aim stands and isn't reached (the fortune counted live,
// so the gate opens the moment the aim is met, not when the link catches up).
CO.aimGates = function () {
  var A = CO.aim;
  if (!A || A.done || !(A.to > A.base)) return false;
  var w = CO.look && CO.look.wealth ? CO.look.wealth() : null;
  return !(w !== null && w >= A.to);
};

// Recoup (#234, Ricardo): one loss of at least the threshold proposes a goal
// to earn it back, through coffers' own proposals. The threshold (Ricardo):
// by default your average gold per day, the Day by day graph's "/day"
// figure (CO.recoup = -1, coffers_recoup absent or "day"); 20,000 while that
// isn't known yet (under a day kept, or not positive). A fixed amount, or 0 =
// OFF, with COFFERS RECOUP <amount|OFF>. Through coffers'
// own proposals (source "coffers", key "recoup"). CO.recoupBase is the
// fortune before the first such spend (coffers_recoup_base); a later big
// spend adds to the same proposal (the whole gap to that fortune). Withdrawn
// once the fortune is back to the base; the base is let go once the
// proposal is accepted or wiped (neither pending nor dismissed).
if (CO.recoup === undefined) {
  var rcRaw = gcRaw("coffers_recoup");
  CO.recoup = (rcRaw === undefined || rcRaw === null || rcRaw === "" || String(rcRaw).toLowerCase() === "day") ? -1 : gcNum("coffers_recoup", -1, 0, 2000000000);
}
CO.recoupFallback = 20000;
// Gold per day over the day buffer (as the tab shows it), or 0 when not known.
CO.perDay = function () {
  var D = CO.days || [];
  if (D.length < 2) return 0;
  var span = (D[D.length - 1][0] - D[0][0]) / 86400;
  if (span < 1) return 0;
  var gain = (D[D.length - 1][1] + D[D.length - 1][2]) - (D[0][1] + D[0][2]);
  return gain > 0 ? Math.round(gain / span) : 0;
};
// The threshold in force now: 0 = off.
CO.recoupLine = function () {
  if (CO.recoup >= 0) return CO.recoup;
  return CO.perDay() || CO.recoupFallback;
};
if (CO.recoupBase === undefined) { CO.recoupBase = gcNum("coffers_recoup_base", 0, 0, 2000000000000); }
CO.recoupSave = function () { try { if (CO.recoupBase > 0) set_variable("coffers_recoup_base", String(CO.recoupBase)); else delete_variable("coffers_recoup_base"); } catch (e) {} };
CO.recoupPending = function () {
  for (var i = 0; i < CO.proposals.length; i++) if (CO.proposals[i].src === "coffers" && CO.proposals[i].key === "recoup") return true;
  return !!CO.dismissed["coffers|recoup"];
};
CO.recoupClear = function () {
  CO.entry.withdraw("coffers", "recoup");
  if (CO.recoupBase > 0) { CO.recoupBase = 0; CO.recoupSave(); }
};
// Called by coffers_tick with the fortune now, the change since the last
// reading, and the threshold read before this reading touched the day rows.
CO.recoupCheck = function (W, d, line) {
  if (line === undefined) line = CO.recoupLine();
  if (!(line > 0)) { if (CO.recoupBase > 0 || CO.recoupPending()) CO.recoupClear(); return; }
  if (CO.recoupBase > 0) {
    if (W >= CO.recoupBase) { CO.recoupClear(); return; }
    if (!CO.recoupPending() && !(d < 0 && -d >= line)) { CO.recoupBase = 0; CO.recoupSave(); }
  }
  if (d < 0 && -d >= line) {
    if (!(CO.recoupBase > 0)) { CO.recoupBase = W - d; CO.recoupSave(); }
    var gap = CO.recoupBase - W;
    CO.entry.propose({ source: "coffers", key: "recoup", amount: gap, why: "earn back the " + CO.f.n(gap) + " gold you spent" });
  }
};

// Gold given to you (#53): "Grulk gives 5,000 gold sovereigns to you."
// Kept in memory only, newest last, the last 30: { who, amount, t }.
if (!CO.gifts) CO.gifts = [];
// The read-only look other packages see through loom: never its variables.
//   look.gifts(since) -> copies of the gifts received after time `since`
//     (all of this page load's with no argument), oldest first.
//   look.wealth() -> the fortune now (gold + bank), or null before GMCP.
//   look.pace(days) -> net gold a day (earned less spent) over the last
//     `days` days of the day buffer (7 if not given), or null with less than
//     a day of history (#448's daily aim, as levelgraph's and talpieces').
CO.look = {
  wealth: function () {
    var L = CO.live || {};
    if (typeof L.gold !== "number" || typeof L.bank !== "number") return null;
    return L.gold + L.bank;
  },
  pace: function (days) {
    var hs = CO.days || [];
    if (hs.length < 2) return null;
    var last = hs[hs.length - 1], cut = last[0] - (days || 7) * 86400, ref = hs[0];
    for (var i = hs.length - 1; i >= 0; i--) { if (hs[i][0] <= cut) { ref = hs[i]; break; } }
    var span = (last[0] - ref[0]) / 86400;
    if (span < 1) return null;
    return ((last[1] + last[2]) - (ref[1] + ref[2])) / span;
  },
  gifts: function (since) {
    var out = [];
    for (var i = 0; i < CO.gifts.length; i++) { if (!since || CO.gifts[i].t > since) out.push({ who: CO.gifts[i].who, amount: CO.gifts[i].amount, t: CO.gifts[i].t }); }
    return out;
  }
};

// ---- Accounts (#236): where the money comes from and where it goes ------
// GMCP's gold + bank stays the only truth. Every prompt coffers books a
// change of fortune (coffers_tick, a prompt after the money moved) becomes a
// row; game lines that name an amount (CO.srcDefs) queue labels with
// CO.note, and the booking takes them all: whatever they don't explain is
// "unknown" (source "?"). Exact sums only, no guessing: a label can only
// explain money, never make or hide any. Unknown rows keep the game lines
// that came since the prompt before, so the line that moved the money can be
// found (Nexus keeps no logs) and added to the table.
// The money lines, data: { id, re, sign (+1 in, -1 out), amt (group with the
// amount), det (group with a detail: who, what) }. Rebuilt every run, so a
// reimport brings new ones at once. Several lines can share an id.
// A line with no amount (no amt) is "open": it takes whatever the exact lines
// leave unexplained on that move, and only when that goes its way (sign).
CO.srcDefs = [
  { id: "pickup", re: /^You pick up ([\d,]+) gold sovereigns?\.$/, sign: 1, amt: 1 },
  { id: "pickup", re: /^You pick up .+ of golden sovereigns\.$/, sign: 1 },
  { id: "gift", re: /^([A-Z][a-z]+) gives ([\d,]+) gold sovereigns? to you\.$/, sign: 1, amt: 2, det: 1 },
  { id: "container", re: /^You get ([\d,]+) gold sovereigns? from (.+)\.$/, sign: 1, amt: 1, det: 2 },
  { id: "gave", re: /^You give ([\d,]+) gold sovereigns? to ([A-Z][a-z]+)\.$/, sign: -1, amt: 1, det: 2 },
  { id: "drop", re: /^You drop ([\d,]+) gold sovereigns?\.$/, sign: -1, amt: 1 },
  { id: "shop", re: /^You pay ([\d,]+) (?:gold )?sovereigns? and receive (.+)\.$/, sign: -1, amt: 1, det: 2 },
  { id: "shop", re: /^You purchase [\d,]+ (.+) for ([\d,]+) gold\.$/, sign: -1, amt: 2, det: 1 }
];
// Names as the tab and LOG show them, in the order the donuts colour them.
CO.srcNames = { pickup: "picked up", gift: "gifts", container: "out of containers", gave: "given away", drop: "dropped", shop: "shops", "?": "unknown" };
CO.srcOrder = ["pickup", "gift", "container", "gave", "drop", "shop"];
CO.srcName = function (id) { return CO.srcNames[id] || id; };
CO.movesMax = 200;     // rows kept
CO.movesLines = 40;    // newest unknown rows that keep their lines
CO.linesPerRow = 15;   // lines kept with one unknown row

if (!CO.moves) {
  var mvRaw = gcArr("coffers_moves"), mvOk = [];
  for (var mvI = 0; mvI < mvRaw.length; mvI++) {
    var mv = mvRaw[mvI];
    if (mv && typeof mv === "object" && typeof mv.t === "number" && typeof mv.d === "number") {
      if (!Array.isArray(mv.l)) mv.l = [];
      mvOk.push(mv);
    }
  }
  CO.moves = mvOk;
}
// Each row's own number (n), for the tab to open one: times repeat within a second.
if (CO.moveSeq === undefined) {
  CO.moveSeq = 1;
  for (var msI = 0; msI < CO.moves.length; msI++) { if (!(CO.moves[msI].n > 0)) CO.moves[msI].n = CO.moveSeq; CO.moveSeq = Math.max(CO.moveSeq, CO.moves[msI].n + 1); }
}
if (!CO.queue) CO.queue = [];    // labels waiting for the booking: { s, a (signed), d, age }
if (!CO.strays) CO.strays = [];  // labels no change of fortune came for (memory only, last 10)
if (!CO.lineBuf) CO.lineBuf = [];
if (CO.lineN === undefined) { CO.lineN = 0; CO.lineMark = 0; }

// Queue a label for the next booking. amount null: an open label, with the
// sign it may take (CO.srcDefs).
CO.note = function (src, amount, detail, sign) {
  if (src && amount === null && (sign === 1 || sign === -1)) {
    CO.queue.push({ s: String(src), a: 0, open: sign, d: detail ? String(detail) : "", age: 0 });
    if (CO.queue.length > 50) CO.queue.shift();
    return true;
  }
  var a = Math.round(Number(amount));
  if (!src || !a) return false;
  CO.queue.push({ s: String(src), a: a, d: detail ? String(detail) : "", age: 0 });
  if (CO.queue.length > 50) CO.queue.shift();
  return true;
};
// Every game line (coffers every line): keep it for unknown rows, and label it
// if it is a money line.
CO.line = function (t) {
  t = t === undefined || t === null ? "" : String(t);
  if (!t || /^\s*$/.test(t)) return;
  // The prompt itself says nothing about money (the usual "3000h, 2000m, ..." shape).
  if (/^\d+h, \d+m\b/.test(t)) return;
  CO.lineBuf.push(t.length > 200 ? t.slice(0, 200) + "…" : t);
  if (CO.lineBuf.length > 40) CO.lineBuf.shift();
  CO.lineN++;
  for (var i = 0; i < CO.srcDefs.length; i++) {
    var D = CO.srcDefs[i], m = D.re.exec(t);
    if (m) {
      if (!D.amt) { CO.note(D.id, null, D.det ? m[D.det] : "", D.sign); return; }
      var a = parseInt(String(m[D.amt]).replace(/,/g, ""), 10);
      if (a > 0) CO.note(D.id, D.sign * a, D.det ? m[D.det] : "");
      return;
    }
  }
};
// { id: [in, out] } totals; "?" is unknown.
CO.addSrc = function (o, id, a) {
  if (!o[id] || !Array.isArray(o[id])) o[id] = [0, 0];
  if (a > 0) o[id][0] += a; else o[id][1] -= a;
};
// Run by coffers_tick on every prompt it reads: d is the change of fortune
// (0 when none). Books a row when the fortune moved; otherwise ages the
// labels, and drops those two readings old as strays.
CO.book = function (d, now, S, T) {
  var Q = CO.queue, i;
  var seen = CO.lineN - CO.lineMark;
  CO.lineMark = CO.lineN;
  if (!d) {
    var keep = [], net = 0, open = false;
    for (i = 0; i < Q.length; i++) { net += Q[i].a; if (Q[i].open) open = true; }
    for (i = 0; i < Q.length; i++) {
      if (net === 0 && !open) continue; // in and out again (picked up, dropped): nothing to explain
      Q[i].age++;
      if (Q[i].age < 2) keep.push(Q[i]);
      else { CO.strays.push({ t: now, s: Q[i].s, a: Q[i].a }); if (CO.strays.length > 10) CO.strays.shift(); }
    }
    CO.queue = keep;
    return null;
  }
  var row = { n: CO.moveSeq++, t: now, d: d, l: [] }, sum = 0, opens = [];
  for (i = 0; i < Q.length; i++) {
    if (Q[i].open) { opens.push(Q[i]); continue; }
    row.l.push([Q[i].s, Q[i].a, Q[i].d]); sum += Q[i].a;
  }
  CO.queue = [];
  var u = d - sum;
  // The open labels take what's left, if it goes their way: the first one
  // names it (several open lines on one move can't be told apart).
  for (i = 0; i < opens.length && u; i++) {
    if ((u > 0 ? 1 : -1) === opens[i].open) { row.l.push([opens[i].s, u, opens[i].d]); u = 0; }
  }
  if (u) {
    row.u = u;
    var n = Math.min(seen, CO.linesPerRow, CO.lineBuf.length);
    row.x = n > 0 ? CO.lineBuf.slice(-n) : [];
  }
  CO.moves.push(row);
  while (CO.moves.length > CO.movesMax) CO.moves.shift();
  var withLines = 0;
  for (i = CO.moves.length - 1; i >= 0; i--) {
    if (CO.moves[i].x) { withLines++; if (withLines > CO.movesLines) delete CO.moves[i].x; }
  }
  if (S) { if (!S.src || typeof S.src !== "object") S.src = {}; }
  if (T) { if (!T[5] || typeof T[5] !== "object") T[5] = {}; }
  for (i = 0; i < row.l.length; i++) { if (S) CO.addSrc(S.src, row.l[i][0], row.l[i][1]); if (T) CO.addSrc(T[5], row.l[i][0], row.l[i][1]); }
  if (u) { if (S) CO.addSrc(S.src, "?", u); if (T) CO.addSrc(T[5], "?", u); }
  CO.movesDirty = true;
  return row;
};
// Totals merged from several { id: [in, out] } objects.
CO.srcSum = function (list) {
  var out = {};
  for (var i = 0; i < list.length; i++) {
    var o = list[i];
    if (!o || typeof o !== "object") continue;
    for (var k in o) if (o.hasOwnProperty(k) && Array.isArray(o[k])) { if (!out[k]) out[k] = [0, 0]; out[k][0] += o[k][0] || 0; out[k][1] += o[k][1] || 0; }
  }
  return out;
};
// Share of the flow (in + out) that a source explains, 0-100, or null when
// nothing moved. side: 0 in, 1 out, absent both.
CO.explained = function (o, side) {
  if (!o || typeof o !== "object") return null;
  var flow = 0, unk = 0;
  for (var k in o) if (o.hasOwnProperty(k) && Array.isArray(o[k])) {
    var f = side === undefined ? (o[k][0] || 0) + (o[k][1] || 0) : (o[k][side] || 0);
    flow += f;
    if (k === "?") unk += f;
  }
  return flow > 0 ? Math.floor((flow - unk) / flow * 100) : null;
};
// The period the Accounts view shows: session, today or the last 7 days.
CO.srcFor = function (period, now) {
  if (period === "session") return CO.sess && CO.sess.src ? CO.srcSum([CO.sess.src]) : {};
  var D = CO.days || [], list = [];
  var from = period === "week" ? CO.f.dayStart(now) - 6 * 86400 : CO.f.dayStart(now);
  for (var i = D.length - 1; i >= 0; i--) { if (D[i][0] < from) break; list.push(D[i][5]); }
  return CO.srcSum(list);
};
// One row in words: "picked up +1,240", "gifts (Grulk) +5,000 · unknown -300".
CO.describe = function (row) {
  var parts = [];
  for (var i = 0; i < row.l.length; i++) parts.push(CO.srcName(row.l[i][0]) + (row.l[i][2] ? " (" + row.l[i][2] + ")" : "") + (row.l.length > 1 || row.u ? " " + CO.f.s(row.l[i][1]) : ""));
  if (row.u) parts.push("unknown" + (row.l.length ? " " + CO.f.s(row.u) : ""));
  return parts.join(" · ");
};

// The tab's two views (Wealth, Accounts) and the Accounts period, kept as
// plain strings; the unknown-only filter and the opened row are per page.
if (!CO.view) { var cvRaw = gcRaw("coffers_view"); CO.view = String(cvRaw) === "accounts" ? "accounts" : "wealth"; }
if (!CO.period) { var cpRaw = String(gcRaw("coffers_period")); CO.period = (cpRaw === "today" || cpRaw === "week") ? cpRaw : "session"; }
if (CO.unknownOnly === undefined) CO.unknownOnly = false;
if (CO.openRow === undefined) CO.openRow = 0;
CO.setView = function (v) {
  CO.view = v === "accounts" ? "accounts" : "wealth";
  try { if (CO.view === "accounts") set_variable("coffers_view", "accounts"); else delete_variable("coffers_view"); } catch (e) {}
  run_function("coffers_render", [], "coffers");
};
CO.setPeriod = function (p) {
  CO.period = (p === "today" || p === "week") ? p : "session";
  try { if (CO.period !== "session") set_variable("coffers_period", CO.period); else delete_variable("coffers_period"); } catch (e) {}
  run_function("coffers_render", [], "coffers");
};
// The tab's clickable parts call through this (inline handlers, as chronicle's).
window.loomCoffers = {
  view: function (v) { var C = client.loom && client.loom.coffers; if (C && C.setView) C.setView(v); },
  period: function (p) { var C = client.loom && client.loom.coffers; if (C && C.setPeriod) C.setPeriod(p); },
  unknown: function () { var C = client.loom && client.loom.coffers; if (C) { C.unknownOnly = !C.unknownOnly; run_function("coffers_render", [], "coffers"); } },
  open: function (t) { var C = client.loom && client.loom.coffers; if (C) { C.openRow = C.openRow === t ? 0 : t; run_function("coffers_render", [], "coffers"); } }
};
