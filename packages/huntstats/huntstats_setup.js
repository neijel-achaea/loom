// huntstats_setup -- run from onLoad and onInstall, and by any reflex that
// finds the namespace missing. Namespace, registry, one-time migration of the
// hs_* variables and the old loose client keys, the Dragonhood table, helpers
// and settings, each built if missing.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.huntstats) client.loom.huntstats = {};
client.loom.registry.huntstats = { version: "0.2.6", keyword: "HUNTSTATS", desc: "{{description}}" };
var HS = client.loom.huntstats;

// One-time migration: hs_* -> huntstats_*. A new variable that already holds
// data wins; the old one is deleted either way.
var hsMoves = [["areas", "{}"], ["log", "[]"], ["open", ""]];
for (var hsI = 0; hsI < hsMoves.length; hsI++) {
  var hsOld;
  try { hsOld = get_variable("hs_" + hsMoves[hsI][0]); } catch (e) { hsOld = undefined; }
  if (hsOld !== undefined && hsOld !== null) {
    var hsNew;
    try { hsNew = get_variable("huntstats_" + hsMoves[hsI][0]); } catch (e) { hsNew = undefined; }
    if (hsNew === undefined || hsNew === null || hsNew === "" || hsNew === hsMoves[hsI][1]) set_variable("huntstats_" + hsMoves[hsI][0], hsOld);
    delete_variable("hs_" + hsMoves[hsI][0]);
  }
}
// Fresh profile: the stores start empty (never clobbered on a reimport).
var hsHave;
try { hsHave = get_variable("huntstats_log"); } catch (e) { hsHave = undefined; }
if (hsHave === undefined || hsHave === null || hsHave === "") set_variable("huntstats_log", "[]");
try { hsHave = get_variable("huntstats_areas"); } catch (e) { hsHave = undefined; }
if (hsHave === undefined || hsHave === null || hsHave === "") set_variable("huntstats_areas", "{}");

// The old package kept its state in loose client keys. A session still in
// memory on a reimport without a page reload carries over; it has already
// been resumed, so the checkpoint isn't recovered a second time.
if (client.track && !HS.cur) { HS.cur = client.track; HS.resumed = true; }
if (client.hsResumed) HS.resumed = true;
var hsOldKeys = ["track", "dragonXP", "hsResumed", "hsLastSave", "_dragonBtnLabel"];
for (var hsJ = 0; hsJ < hsOldKeys.length; hsJ++) {
  if (client[hsOldKeys[hsJ]] !== undefined) delete client[hsOldKeys[hsJ]];
}

// Total experience at the start of each level, 1-99. Dragonhood is the share
// of the experience to level 99 already earned.
if (!HS.xpTable) {
  HS.xpTable = {
    1:0, 2:5000, 3:10500, 4:20550, 5:35205, 6:50525, 7:70577, 8:95043, 9:122000,
    10:152000, 11:185000, 12:225000, 13:267000, 14:312000, 15:359000, 16:407000,
    17:456000, 18:506000, 19:561000, 20:621000, 21:691000, 22:761000, 23:836000,
    24:916000, 25:1001000, 26:1091000, 27:1186000, 28:1286000, 29:1391000,
    30:1501000, 31:1616000, 32:1736000, 33:1861000, 34:1986000, 35:2116000,
    36:2251000, 37:2391000, 38:2536000, 39:2686000, 40:2941000, 41:3096000,
    42:3256000, 43:3416000, 44:3581000, 45:3746000, 46:3916000, 47:4150000,
    48:4353395, 49:4794382, 50:5279468, 51:5813062, 52:6400016, 53:7045665,
    54:7755879, 55:8537115, 56:9396474, 57:10341769, 58:11381594, 59:12525401,
    60:13783589, 61:15167596, 62:16690004, 63:18364653, 64:20206766, 65:22233091,
    66:24462048, 67:26913901, 68:29610939, 69:32576939, 70:35840356, 71:39430114,
    72:43378848, 73:47722456, 74:52500425, 75:60000000, 76:70000000, 77:83000000,
    78:100000000, 79:120000000, 80:150000000, 81:185000000, 82:225000000,
    83:270000000, 84:320000000, 85:375000000, 86:435000000, 87:500000000,
    88:570000000, 89:645000000, 90:725000000, 91:810000000, 92:900000000,
    93:995000000, 94:1095000000, 95:1200000000, 96:1310000000, 97:1425000000,
    98:1545000000, 99:1670000000
  };
}

// Helpers, rebuilt on every setup so a reimport picks up new code.
// dragon(): Dragonhood % from the current level reading, or null.
HS.dragon = function () {
  var t = HS.xpTable;
  if (HS.level === undefined || HS.nl === undefined) return null;
  var l = Math.floor(HS.level);
  if (l >= 99) return 100;
  if (t[l] === undefined || t[l + 1] === undefined) return null;
  return ((t[l] + (HS.nl / 100) * (t[l + 1] - t[l])) / t[99]) * 100;
};
// xpToNext(): experience left to the next level, or null.
HS.xpToNext = function () {
  var t = HS.xpTable;
  if (HS.level === undefined || HS.nl === undefined) return null;
  var l = Math.floor(HS.level);
  if (l >= 99 || t[l] === undefined || t[l + 1] === undefined) return null;
  return (100 - HS.nl) / 100 * (t[l + 1] - t[l]);
};
// xpToDragon(): experience left to level 99, or null.
HS.xpToDragon = function () {
  var t = HS.xpTable;
  if (HS.level === undefined || HS.nl === undefined) return null;
  var l = Math.floor(HS.level);
  if (l >= 99) return 0;
  if (t[l] === undefined || t[l + 1] === undefined) return null;
  return t[99] - (t[l] + (HS.nl / 100) * (t[l + 1] - t[l]));
};
HS.dur = function (ms) { var m = Math.floor(ms / 60000); return Math.floor(m / 60) + "h " + (m % 60) + "m"; };
// The party (#87): names added by hand with HUNTSTATS PARTY ADD, kept until
// removed or cleared, across hunts and reloads (saved as huntstats_party).
// Each hunt starts with the party as it stands, and names added during a
// hunt join it; the hunt's players are what the log and the tab show.
if (!HS.party) {
  HS.party = [];
  try { HS.party = JSON.parse(get_variable("huntstats_party") || "[]") || []; } catch (e) { HS.party = []; }
}
if (HS.splitTell === undefined) HS.splitTell = (String(get_variable("huntstats_splittell") || "") === "on");
HS.saveParty = function () { try { set_variable("huntstats_party", JSON.stringify(HS.party)); } catch (e) {} };
// fresh(): empty accumulators for a new hunt, keeping the area; the party
// carries over.
HS.fresh = function () {
  if (!HS.cur) HS.cur = {};
  HS.cur.xp = 0; HS.cur.gold = 0; HS.cur.kills = 0;
  HS.cur.firstXpAt = 0; HS.cur.lastXpAt = 0;
  HS.cur.startDragonPct = null; HS.cur.players = {};
  for (var fI = 0; fI < HS.party.length; fI++) HS.cur.players[HS.party[fI]] = 1;
  HS.cur.ledger = {}; HS.cur.unknown = [];
};
// The gold split (#89). HS.cur.ledger holds each of the hunt's people's net
// gold from this hunt ("you" and the party): picked up, less dropped, plus
// given to them, less given away. Gold dropped and picked up within the party
// just moves; gold that leaves to someone outside it leaves the pot; someone
// who put in their own gold ends negative and is paid back by the split. Gold others pass between
// themselves shows no amount ("gives some gold sovereigns"), so it goes in
// HS.cur.unknown instead. Anyone outside the party is ignored.
// held(who, n): add n (or take it, if negative) to who's gold in hand.
HS.held = function (who, n) {
  var T = HS.cur;
  if (!T || T.area === undefined || isNaN(n)) return;
  if (who !== "you" && !(T.players && T.players[who])) return;
  if (!T.ledger) T.ledger = {};
  T.ledger[who] = (T.ledger[who] || 0) + n;
  HS.save();
};
HS.inHunt = function (who) { return who === "you" || !!(HS.cur && HS.cur.players && HS.cur.players[who]); };
HS.n = function (x) { return Math.round(x).toLocaleString(); };
// split(tell): the split of the hunt under way as lines of text, or null
// when there is no party or no gold. Even shares, and the fewest transfers
// that get everyone there (largest debtor pays largest creditor first).
// With tell, the party tell report instead: one line per person under your
// own name (HS.me, from GMCP), then TOTAL and SPLIT, readable by everyone.
HS.split = function (tell) {
  var T = HS.cur;
  if (!T) return null;
  var who = ["you"];
  for (var sK in (T.players || {})) { if (T.players.hasOwnProperty(sK)) who.push(sK); }
  if (who.length < 2) return null;
  var L = T.ledger || {};
  var total = 0;
  for (var sI = 0; sI < who.length; sI++) total += (L[who[sI]] || 0);
  if (total <= 0) return null;
  var share = total / who.length;
  var me = HS.me || "Me";
  function nm(w) { return w === "you" ? me : w; }
  var pay = [], get = [];
  for (var sM = 0; sM < who.length; sM++) {
    var b = (L[who[sM]] || 0) - share;
    if (b >= 1) pay.push({ who: who[sM], amt: b });
    else if (b <= -1) get.push({ who: who[sM], amt: -b });
  }
  pay.sort(function (x, y) { return y.amt - x.amt; });
  get.sort(function (x, y) { return y.amt - x.amt; });
  var moves = [], movesTell = [];
  var pI = 0, gI = 0;
  while (pI < pay.length && gI < get.length) {
    var m = Math.min(pay[pI].amt, get[gI].amt);
    if (Math.round(m) >= 1) {
      var from = pay[pI].who, to = get[gI].who;
      moves.push(from === "you" ? "you give " + to + " " + HS.n(m) : (to === "you" ? from + " gives you " + HS.n(m) : from + " gives " + to + " " + HS.n(m)));
      movesTell.push(nm(from) + " gives " + nm(to) + " " + HS.n(m));
    }
    pay[pI].amt -= m; get[gI].amt -= m;
    if (pay[pI].amt < 1) pI++;
    if (get[gI].amt < 1) gI++;
  }
  var lines = [];
  if (tell) {
    for (var tJ = 0; tJ < who.length; tJ++) lines.push(nm(who[tJ]) + ": " + HS.n(L[who[tJ]] || 0) + " gold");
    lines.push("TOTAL: " + HS.n(total) + " gold, " + HS.n(share) + " each");
    lines.push("SPLIT: " + (movesTell.length ? movesTell.join(", ") : "already even"));
    if (T.unknown && T.unknown.length) lines.push("Not counted (no amount shown): " + T.unknown.join(", ").replace(/\byou\b/g, me));
    return lines;
  }
  var heldTxt = [];
  for (var sJ = 0; sJ < who.length; sJ++) heldTxt.push(who[sJ] + " " + HS.n(L[who[sJ]] || 0));
  lines.push("split: " + HS.n(total) + " gold among " + who.length + ", " + HS.n(share) + " each. Net this hunt: " + heldTxt.join(", ") + ".");
  lines.push(moves.length ? "to settle: " + moves.join("; ") + "." : "already even.");
  if (T.unknown && T.unknown.length) lines.push("not counted (the game shows no amount): " + T.unknown.join(", ") + ".");
  return lines;
};
// tellSplit(): send the report to party tell, one line each; false when
// there is nothing to send or outbound commands are paused.
HS.tellSplit = function () {
  var tl = HS.split(true);
  if (!tl || get_variable("pauseTriggers") == "on") return false;
  for (var tI = 0; tI < tl.length; tI++) send_command("pt " + tl[tI], 1);
  return true;
};
// save(): checkpoint the open hunt so a refresh, crash or disconnect can
// recover it. Throttled to once every five seconds unless forced.
HS.save = function (force) {
  var now = Date.now();
  if (!force && HS.lastSave && (now - HS.lastSave) <= 5000) return;
  HS.lastSave = now;
  try { set_variable("huntstats_open", JSON.stringify(HS.cur)); } catch (e) {}
};

// The Dragonhood F-key setting existed briefly before release; drop it.
try { if (get_variable("huntstats_button") !== undefined && get_variable("huntstats_button") !== null) delete_variable("huntstats_button"); } catch (e) {}
