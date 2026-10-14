// dmgchart_setup -- run from onLoad and onInstall, by DMGCHART REBUILD (which
// empties the namespace first, as run_function cannot pass parameters), and
// by any reflex that finds the namespace missing. Namespace, registry,
// one-time migration of the dc_* variables and the old client.dc, then the
// state, each part built if missing.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
client.loom.registry.dmgchart = { version: "0.3.3", keyword: "DMGCHART", desc: "{{description}}" };
if (!client.loom.dmgchart) client.loom.dmgchart = {};
var DC = client.loom.dmgchart;

// One-time migration: dc_* -> dmgchart_*. A new variable that already holds
// data wins; the old one is deleted either way.
var dcMoves = [["gap", ""], ["sessions", "[]"], ["open", ""]];
for (var dcI = 0; dcI < dcMoves.length; dcI++) {
  var dcOld;
  try { dcOld = get_variable("dc_" + dcMoves[dcI][0]); } catch (e) { dcOld = undefined; }
  if (dcOld !== undefined && dcOld !== null) {
    var dcNew;
    try { dcNew = get_variable("dmgchart_" + dcMoves[dcI][0]); } catch (e) { dcNew = undefined; }
    if (dcNew === undefined || dcNew === null || dcNew === "" || dcNew === dcMoves[dcI][1]) set_variable("dmgchart_" + dcMoves[dcI][0], dcOld);
    delete_variable("dc_" + dcMoves[dcI][0]);
  }
}

// The old package kept everything in client.dc. On a reimport without a page
// reload, the fight, open session, view and colours in memory carry over.
if (client.dc) {
  var dcCarry = ["fight", "lastInc", "sess", "sessSaved", "view", "colors", "spareIdx", "hp"];
  for (var dcJ = 0; dcJ < dcCarry.length; dcJ++) {
    if (DC[dcCarry[dcJ]] === undefined && client.dc[dcCarry[dcJ]] !== undefined) DC[dcCarry[dcJ]] = client.dc[dcCarry[dcJ]];
  }
  delete client.dc;
}

if (DC.gap === undefined) {
  DC.gap = parseFloat(get_variable("dmgchart_gap"));
  if (isNaN(DC.gap) || DC.gap <= 0) DC.gap = 6;
}
if (DC.window === undefined) {
  DC.window = parseFloat(get_variable("dmgchart_window"));
  if (isNaN(DC.window) || DC.window <= 0) DC.window = 6;
}
if (!DC.recent) DC.recent = [];
DC.tab = "DmgChart";
if (!DC.colors) DC.colors = { "cutting": "#d9534f", "blunt": "#b08968", "magical": "#9b6bd6", "unblockable": "#d8d8d8", "poison": "#6abf4b", "fire": "#f0883e", "cold": "#5bc0de", "electricity": "#f2d43d", "asphyxiation": "#7f8fa6", "psychic": "#e36bb8", "raw": "#8c8c8c", "bleed": "#8b1e2d" };
DC.spare = ["#4fb0a5", "#c9a0dc", "#a3c45a", "#e0b070", "#6f8fd8", "#d97a9a"];
if (DC.spareIdx === undefined) DC.spareIdx = 0;
if (DC.fight === undefined) DC.fight = null;
if (DC.lastInc === undefined) DC.lastInc = null;
DC.ev = null;
if (DC.view === undefined) DC.view = "";
if (!DC.saved) {
  DC.saved = [];
  try { var dcRaw = get_variable("dmgchart_sessions"); if (dcRaw && String(dcRaw).length) DC.saved = JSON.parse(dcRaw) || []; } catch (e) { DC.saved = []; }
}
DC.nextId = 1;
for (var dcK = 0; dcK < DC.saved.length; dcK++) { if (DC.saved[dcK].id >= DC.nextId) DC.nextId = DC.saved[dcK].id + 1; }
if (DC.sess === undefined) {
  DC.sess = null;
  try { var dcOpen = get_variable("dmgchart_open"); if (dcOpen && String(dcOpen).length) DC.sess = JSON.parse(dcOpen); } catch (e) { DC.sess = null; }
}
if (DC.sessSaved === undefined) DC.sessSaved = 0;
