// defcon_table -- picks the table for the current class into D.tbl
// ({ name, up, defs, known }) and that class's remembered level into D.level
// (undefined: never applied in this class). Unknown classes get the generic
// defences. Levels are kept per table name (defcon_levels), since the game
// keeps a curing list per class: every dragon colour shares "Dragon".
var D = client.loom.defcon;
var dcKey = D.alias[D.cls] || D.cls;
var dcEntry = D.classes[dcKey];
if (dcEntry) {
  D.tbl = { name: dcKey, up: dcEntry.up, defs: dcEntry.defs, known: true };
} else {
  D.tbl = { name: D.cls || "unknown", up: [], defs: D.generic, known: false };
}

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
