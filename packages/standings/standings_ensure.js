// Builds client.loom.standings: the book (db, view, cal) and the helpers (F)
// from stored variables, once. Each character keeps its own book, since Nexus stores variables per
// character. STANDINGS REBUILD drops the helpers so edits to them take effect.
function stLoad(name, def) {
  var raw;
  try { raw = get_variable(name); } catch (e) { raw = undefined; }
  if (raw === undefined || raw === null || raw === "") { return def; }
  if (typeof raw === "object") { return raw; }
  try { return JSON.parse(raw); } catch (e) { return def; }
}

// Nudge sizes by step (1 = +, 2 = ++, 3 = +++). Logs store the step, not the
// amount, so these can be retuned later without rewriting any history.
var SIZES = [0, 0.5, 1.5, 4];
// Bands, lowest first: [upper bound, label, colour]. Renaming later is a data edit.
var BANDS = [[-6, "Hated", "#d9534f"], [-2.5, "Distrusted", "#e07a4f"], [-0.5, "Wary", "#d8b45a"], [0.5, "Neutral", "#9a9aa3"], [2.5, "Warm", "#8fc3d8"], [6, "Trusted", "#5a9be0"], [10.01, "Kin", "#7b8ff0"]];
var MONTHS = ["Sarapin", "Daedalan", "Aeguary", "Miraman", "Scarlatan", "Ero", "Valnuary", "Lupar", "Phaestian", "Chronos", "Glacian", "Mayan"];

// Standing from a log: each nudge counts for less the closer the standing
// already is to the end it pushes toward, so trust is slow to earn and quick
// to lose. Bounded to -10..+10 by construction. An entry with a fifth field
// is a "set": it places the standing at that value outright (for catching up
// on history from before the book), and later nudges build on it.
function stScore(log) {
  var s = 0;
  for (var i = 0; i < log.length; i++) {
    var st = log[i][2];
    if (log[i].length > 4 && typeof log[i][4] === "number") { s = Math.max(-10, Math.min(10, log[i][4])); }
    else if (st > 0) { s += SIZES[st] * (10 - s) / 10; }
    else if (st < 0) { s -= SIZES[-st] * (10 + s) / 10; }
  }
  return Math.round(s * 100) / 100;
}
function stBand(s) {
  for (var i = 0; i < BANDS.length; i++) { if (s <= BANDS[i][0]) { return BANDS[i]; } }
  return BANDS[BANDS.length - 1];
}
function stKey(name) { return String(name).toLowerCase(); }
function stProper(name) { var n = String(name); return n.charAt(0).toUpperCase() + n.slice(1).toLowerCase(); }
function stSigned(s) { return (s > 0 ? "+" : "") + (Math.round(s * 10) / 10).toFixed(1); }
function stSteps(st) {
  if (st === 0) { return "note"; }
  var ch = st > 0 ? "+" : "-";
  var out = "";
  for (var i = 0; i < Math.abs(st); i++) { out += ch; }
  return out;
}

// IC day number (as the Ledger counts it) for a real time. Read from the
// Ledger when it is loaded; otherwise extrapolated from the last reading,
// since one Achaean day is one real hour. 0 means unknown.
function stIc(t) {
  // Ledger's day, wherever this version of ledger keeps it.
  var lg = (client.loom && client.loom.ledger && client.loom.ledger.day > 0) ? client.loom.ledger : client.lg;
  var cal = client.loom.standings.cal;
  if (lg && lg.day > 0) {
    if (!cal || cal.d !== lg.day) {
      client.loom.standings.cal = { d: lg.day, t: Math.floor(new Date().getTime() / 1000) };
      try { set_variable("standings_cal", JSON.stringify(client.loom.standings.cal)); } catch (e) {}
    }
    return lg.day;
  }
  if (cal && cal.d > 0) { return cal.d + Math.floor((t - cal.t) / 3600); }
  return 0;
}
function stIcTxt(d) {
  if (!d || d <= 0) { return ""; }
  var n = d - 1;
  var y = Math.floor(n / 300);
  var rem = n - y * 300;
  return ((rem % 25) + 1) + " " + MONTHS[Math.floor(rem / 25)] + " " + y;
}
function stRealTxt(t) {
  var MN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var d = new Date(t * 1000);
  return d.getDate() + " " + MN[d.getMonth()] + " " + d.getFullYear();
}
// Dealings are nudges, not notes; they weight averages and show acquaintance.
function stDealings(ent) {
  var n = 0;
  for (var i = 0; i < ent.log.length; i++) { if (ent.log[i][2] !== 0) { n++; } }
  return n;
}
// People carrying a tag. "eleusis" matches both "eleusis" and "city:eleusis".
function stHasTag(ent, q) {
  var tags = ent.tags || [];
  for (var i = 0; i < tags.length; i++) {
    if (tags[i] === q) { return true; }
    var c = tags[i].indexOf(":");
    if (c >= 0 && tags[i].slice(c + 1) === q) { return true; }
  }
  return false;
}
// Weighted average over the people carrying a tag: each person counts by how
// many dealings they have had, at least one.
function stTagAvg(q) {
  var db = client.loom.standings.db.e;
  var sum = 0, w = 0, n = 0;
  for (var k in db) {
    if (db.hasOwnProperty(k) && !db[k].org && stHasTag(db[k], q)) {
      var wt = Math.max(1, stDealings(db[k]));
      sum += db[k].s * wt;
      w += wt;
      n++;
    }
  }
  return { avg: w > 0 ? Math.round(sum / w * 100) / 100 : 0, n: n, w: w };
}
// Social package lists, in the social package's own priority order:
// groups names the lists, lists[group] holds lowercase names as keys, and
// color[group] is the list's highlight colour (client.loom.social, or the
// legacy client.hl view of the same lists). Optional:
// with no social package loaded there are simply no chips.
function stLists(name) {
  var out = [];
  var so = client.loom.social;
  var groups = (so && so.groups) || (client.hl && client.hl.groups);
  if (!groups || !groups.length) { return out; }
  var lists = (so && so.lists) || client.hl;
  var colors = (so && so.color) || (client.hl && client.hl.color) || {};
  var key = stKey(name);
  for (var i = 0; i < groups.length; i++) {
    var g = groups[i];
    if (lists[g] && lists[g][key]) { out.push([g, colors[g] || "#9a9aa3"]); }
  }
  return out;
}
function stSave() { try { set_variable("standings_db", JSON.stringify(client.loom.standings.db)); } catch (e) {} }

if (!client.loom) { client.loom = {}; }
if (!client.loom.registry) { client.loom.registry = {}; }
if (!client.loom.standings) { client.loom.standings = {}; }
client.loom.registry.standings = { version: "0.2.1", keyword: "STANDINGS", desc: "{{description}}" };
var ST = client.loom.standings;

// One-time migration from the pre-0.2 names: st_db/st_cal become
// standings_db/standings_cal, and the old session objects are dropped.
var stMoves = [["st_db", "standings_db"], ["st_cal", "standings_cal"]];
for (var stM = 0; stM < stMoves.length; stM++) {
  var stOld = get_variable(stMoves[stM][0]);
  if (stOld === null || stOld === undefined) { continue; }
  var stNew = get_variable(stMoves[stM][1]);
  if (stNew === null || stNew === undefined || stNew === "") { set_variable(stMoves[stM][1], stOld); }
  delete_variable(stMoves[stM][0]);
}
if (client.st) { client.st = undefined; }
if (client.stF) { client.stF = undefined; }

if (!ST.F) {
  ST.F = { SIZES: SIZES, BANDS: BANDS, MONTHS: MONTHS, score: stScore, band: stBand, key: stKey, proper: stProper, signed: stSigned, steps: stSteps, ic: stIc, icTxt: stIcTxt, realTxt: stRealTxt, dealings: stDealings, hasTag: stHasTag, tagAvg: stTagAvg, lists: stLists, save: stSave };
}
if (!ST.db) {
  var stDb = stLoad("standings_db", null);
  if (!stDb || typeof stDb !== "object" || !stDb.e) { stDb = { e: {}, pending: [] }; }
  if (!stDb.pending) { stDb.pending = []; }
  // Stored standings are a cache: recompute them from the logs with the
  // current rules, so a change to the scoring heals old entries on load.
  for (var stK in stDb.e) { if (stDb.e.hasOwnProperty(stK)) { stDb.e[stK].s = stScore(stDb.e[stK].log || []); } }
  ST.db = stDb;
  ST.view = null;
  ST.cal = stLoad("standings_cal", null);
}
