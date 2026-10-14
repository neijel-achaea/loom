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
client.loom.registry.ledger = { version: "0.2.2", keyword: "LEDGER", desc: "{{description}}" };
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
