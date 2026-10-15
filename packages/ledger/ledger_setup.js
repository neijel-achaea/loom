// ledger_setup -- run from onLoad and onInstall, by LEDGER REBUILD (which
// empties the namespace first), and by any reflex that finds the namespace
// missing. Namespace, registry, one-time migration of the lg_* variables and
// the old client.lg, then the state, each part built if missing.
//
// Publishes client.loom.ledger.day: today's Achaean day number (year * 300 +
// month * 25 + day, months from 0), 0 while unknown. patrolling and
// standings read it when ledger is installed.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.ledger) client.loom.ledger = {};
client.loom.registry.ledger = { version: "0.3.2", keyword: "LEDGER", desc: "{{description}}" };
var LG = client.loom.ledger;

// One-time migration: lg_* -> ledger_*. A new variable that already holds
// data wins; the old one is deleted either way.
var lgMoves = [["items", "[]"], ["seq", "0"], ["day", ""], ["debug", ""]];
for (var lgI = 0; lgI < lgMoves.length; lgI++) {
  var lgOld;
  try { lgOld = get_variable("lg_" + lgMoves[lgI][0]); } catch (e) { lgOld = undefined; }
  if (lgOld !== undefined && lgOld !== null) {
    var lgNew;
    try { lgNew = get_variable("ledger_" + lgMoves[lgI][0]); } catch (e) { lgNew = undefined; }
    if (lgNew === undefined || lgNew === null || ("" + lgNew) === "" || ("" + lgNew) === lgMoves[lgI][1]) set_variable("ledger_" + lgMoves[lgI][0], lgOld);
    delete_variable("lg_" + lgMoves[lgI][0]);
  }
}
// Fresh profile: the stores start empty (never clobbered on a reimport).
var lgHave;
try { lgHave = get_variable("ledger_items"); } catch (e) { lgHave = undefined; }
if (lgHave === undefined || lgHave === null || ("" + lgHave) === "") { set_variable("ledger_items", "[]"); set_variable("ledger_seq", "0"); }

// The old package kept its state in client.lg. On a reimport without a page
// reload, what is in memory carries over.
if (client.lg) {
  var lgCarry = ["day", "armed", "inBlock", "pendingDigest", "debug"];
  for (var lgJ = 0; lgJ < lgCarry.length; lgJ++) {
    if (LG[lgCarry[lgJ]] === undefined && client.lg[lgCarry[lgJ]] !== undefined) LG[lgCarry[lgJ]] = client.lg[lgCarry[lgJ]];
  }
}
try { delete client.lg; } catch (e) { client.lg = undefined; }

LG.months = ["Sarapin", "Daedalan", "Aeguary", "Miraman", "Scarlatan", "Ero", "Valnuary", "Lupar", "Phaestian", "Chronos", "Glacian", "Mayan"];
if (LG.day === undefined) {
  LG.day = 0;
  var lgStored;
  try { lgStored = get_variable("ledger_day"); } catch (e) { lgStored = undefined; }
  if (lgStored && ("" + lgStored).length) LG.day = parseInt(lgStored, 10) || 0;
}
// ord(12) -> "12th": days are shown the way the game writes them.
LG.ord = function (n) {
  var t = n % 100;
  if (t >= 11 && t <= 13) return n + "th";
  return n + (["th", "st", "nd", "rd"][n % 10] || "th");
};
if (LG.armed === undefined) LG.armed = false;
if (LG.inBlock === undefined) LG.inBlock = false;
if (LG.pendingDigest === undefined) LG.pendingDigest = false;
if (LG.debug === undefined) LG.debug = (get_variable("ledger_debug") === "1");
if (LG.debug) display_notice("[ledger] set up (day " + LG.day + ")", "cyan");

// The entry point other packages feed (#34), through loom's integrations.
// Their items appear in the ledger straight away (reminders, not
// judgements), marked with their source, and are theirs to update and take
// back: each is keyed by source + key, so an integration only ever touches
// its own items, never the player's. Defined on every run, so a reimport
// replaces it.
//   entry.upsert({ source, key, text, due, dueIn }) -> the item's number,
//     or 0 when not added. due is an Achaean day number (as LG.day), dueIn
//     days from today; neither = a standing item. An existing item for that
//     source and key is updated quietly (its due notice re-armed if the date
//     moved); a new one is announced.
//   entry.withdraw(source[, key]) -> how many items were taken back; for a
//     condition that cleared, or a link switched off.
// The player may DONE or DROP a generated item: it then stays away
// (ledger_dismissed) until its source withdraws it, i.e. until its
// condition clears; if the condition comes back, so does the item.
LG.dismissed = {};
try { LG.dismissed = JSON.parse(get_variable("ledger_dismissed") || "{}") || {}; } catch (e) { LG.dismissed = {}; }
LG.saveDismissed = function () {
  var any = false;
  for (var k in LG.dismissed) { if (LG.dismissed.hasOwnProperty(k)) { any = true; break; } }
  if (any) set_variable("ledger_dismissed", JSON.stringify(LG.dismissed));
  else delete_variable("ledger_dismissed");
};
LG.entry = {
  upsert: function (it) {
    if (!it || !it.source || it.key === undefined || it.key === null || !it.text) return 0;
    var src = String(it.source), key = String(it.key);
    if (LG.dismissed[src + "|" + key]) return 0;
    var items;
    try { items = JSON.parse(get_variable("ledger_items")) || []; } catch (e) { items = []; }
    var today = LG.day;
    var due = null;
    if (it.due) due = parseInt(it.due, 10) || null;
    else if (it.dueIn !== undefined && it.dueIn !== null && today > 0) due = today + (parseInt(it.dueIn, 10) || 0);
    for (var i = 0; i < items.length; i++) {
      if (items[i].source === src && items[i].key === key) {
        var moved = items[i].due !== due;
        items[i].text = String(it.text);
        items[i].due = due;
        if (moved) items[i].notified = false;
        set_variable("ledger_items", JSON.stringify(items));
        run_function("ledger_check", [], "ledger");
        return items[i].id;
      }
    }
    var seq = parseInt(get_variable("ledger_seq") || "0", 10) + 1;
    items.push({ id: seq, text: String(it.text), source: src, key: key, status: "open", created: today, touched: today, due: due, repeat: null, tag: null, link: null, notified: false });
    set_variable("ledger_items", JSON.stringify(items));
    set_variable("ledger_seq", "" + seq);
    display_notice("[ledger] #" + seq + " from " + src + ": " + it.text, "cyan");
    run_function("ledger_check", [], "ledger");
    return seq;
  },
  // entry.get(source, key) -> a copy of that source's item, or null; so an
  // integration can tell whether its reminder is already standing.
  get: function (source, key) {
    var items;
    try { items = JSON.parse(get_variable("ledger_items")) || []; } catch (e) { items = []; }
    for (var i = 0; i < items.length; i++) { if (items[i].source === String(source) && items[i].key === String(key)) return JSON.parse(JSON.stringify(items[i])); }
    return null;
  },
  withdraw: function (source, key) {
    if (!source) return 0;
    var src = String(source), k = (key === undefined || key === null) ? null : String(key);
    var items;
    try { items = JSON.parse(get_variable("ledger_items")) || []; } catch (e) { items = []; }
    var n = 0, last = null;
    for (var i = items.length - 1; i >= 0; i--) {
      if (items[i].source === src && (k === null || items[i].key === k)) { last = items[i]; items.splice(i, 1); n++; }
    }
    // Its condition cleared: a dismissal of it is over, so it can come back.
    var dropped = false;
    for (var dk in LG.dismissed) {
      if (LG.dismissed.hasOwnProperty(dk) && (k === null ? dk.indexOf(src + "|") === 0 : dk === src + "|" + k)) { delete LG.dismissed[dk]; dropped = true; }
    }
    if (dropped) LG.saveDismissed();
    if (n) {
      set_variable("ledger_items", JSON.stringify(items));
      display_notice("[ledger] " + src + " took back " + (n === 1 ? "#" + last.id + ": " + last.text : n + " items"), "cyan");
      run_function("ledger_render", [], "ledger");
    }
    return n;
  }
};
