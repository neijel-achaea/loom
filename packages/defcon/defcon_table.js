// defcon_table -- builds the table for the current class into D.tbl and
// that class's remembered level into D.level (undefined: never applied in
// this class). Unknown classes get the generic defences. Levels and the
// player's own changes are kept per table name, since the game keeps a
// curing list per class: every dragon colour shares "Dragon".
//
// D.tbl = { name, known, init, aftermorph, defs,
//           mine: { defence: "added" | "changed" }, removed: [defence],
//           initMine: [cmd], afterMine: [cmd] }
// The defaults come from the class file; the player's changes
// (defcon_custom, see defcon_edit) are laid over them, so a later fix to a
// default still arrives, except where the player changed that entry.
var D = client.loom.defcon;
if (!D.custom) {
  D.custom = {};
  var dcCr = get_variable("defcon_custom");
  if (dcCr && typeof dcCr == "object") D.custom = dcCr;
  else if (dcCr) { try { D.custom = JSON.parse(dcCr) || {}; } catch (e) { D.custom = {}; } }
}
var dcKey = D.alias[D.cls] || D.cls;
var dcEntry = D.classes[dcKey];
var dcName = dcEntry ? dcKey : (D.cls || "unknown");
// Class files used "up" before 0.4.0; both are read.
var dcBase = dcEntry
  ? { init: dcEntry.init || dcEntry.up || [], aftermorph: dcEntry.aftermorph || [], defs: dcEntry.defs }
  : { init: [], aftermorph: [], defs: D.generic };
var dcMine = D.custom[dcName] || {};

// Defences: defaults in order, the player's changes in place, additions last.
var dcCd = dcMine.defs || {};
var dcDefs = [], dcMineMark = {}, dcRemoved = [], dcSeen = {};
for (var dcI = 0; dcI < dcBase.defs.length; dcI++) {
  var dcRow = dcBase.defs[dcI], dcN = dcRow[0];
  dcSeen[dcN] = true;
  if (dcCd.hasOwnProperty(dcN)) {
    if (dcCd[dcN] === null) { dcRemoved.push(dcN); continue; }
    dcDefs.push([dcN].concat(dcCd[dcN]));
    dcMineMark[dcN] = "changed";
  } else {
    dcDefs.push(dcRow);
  }
}
for (var dcA in dcCd) {
  if (dcCd.hasOwnProperty(dcA) && !dcSeen[dcA] && dcCd[dcA] !== null) {
    dcDefs.push([dcA].concat(dcCd[dcA]));
    dcMineMark[dcA] = "added";
  }
}

// Command lists: defaults minus the ones removed, then the ones added.
function dcCmdList(base, mine) {
  var rm = (mine && mine.remove) || [], add = (mine && mine.add) || [], out = [];
  for (var i = 0; i < base.length; i++) { if (rm.indexOf(base[i]) < 0) out.push(base[i]); }
  return out.concat(add);
}

D.tbl = {
  name: dcName,
  known: !!dcEntry,
  init: dcCmdList(dcBase.init, dcMine.init),
  aftermorph: dcCmdList(dcBase.aftermorph, dcMine.aftermorph),
  defs: dcDefs,
  mine: dcMineMark,
  removed: dcRemoved,
  initMine: ((dcMine.init && dcMine.init.add) || []).slice(),
  afterMine: ((dcMine.aftermorph && dcMine.aftermorph.add) || []).slice(),
  base: dcBase
};

if (!D.levels) {
  var dcRaw = get_variable("defcon_levels");
  D.levels = {};
  if (dcRaw && typeof dcRaw == "object") D.levels = dcRaw;
  else if (dcRaw) { try { D.levels = JSON.parse(dcRaw); } catch (e) { D.levels = {}; } }
}
// One-time migration: the old single defcon_level belongs to the class you
// are in when it is first seen with a class known, then is cleared.
var dcOldLevel = get_variable("defcon_level");
if (dcOldLevel !== null && dcOldLevel !== undefined && D.cls) {
  if (D.levels[D.tbl.name] === undefined) D.levels[D.tbl.name] = to_number(dcOldLevel);
  set_variable("defcon_levels", JSON.stringify(D.levels));
  delete_variable("defcon_level");
}
D.level = D.levels[D.tbl.name];
// The table or level may have changed: tell loom (#176, the Self tab).
if (client.loom.notify) client.loom.notify("defcon");
