// defcon_list -- DEFCON LIST: the current class's table by tier, with
// curing priorities; the player's own entries marked with *, the init and
// after-morph commands numbered (for DEFCON INIT REMOVE <n>).
var D = client.loom.defcon;
var C = "cyan";
run_function("defcon_table", [], "defcon");
var T = D.tbl;
var dcLvl = (D.level === undefined || D.level === null) ? 5 : D.level;
var dcAny = false;
for (var dcM in T.mine) { if (T.mine.hasOwnProperty(dcM)) dcAny = true; }
dcAny = dcAny || T.removed.length > 0 || T.initMine.length > 0 || T.afterMine.length > 0
  || ((D.custom[T.name] || {}).init || {}).remove || ((D.custom[T.name] || {}).aftermorph || {}).remove;
display_notice("[defcon] " + T.name + (T.known ? "" : " (general defences)") + " at DEFCON " + dcLvl + ". tier: defence (priority)" + (dcAny ? ", * = yours" : ""), C);
for (var dcT = 1; dcT <= 5; dcT++) {
  var dcRow = [];
  for (var dcI = 0; dcI < T.defs.length; dcI++) {
    var dcD = T.defs[dcI];
    if (dcD[1] === dcT) dcRow.push((T.mine[dcD[0]] ? "*" : "") + dcD[0] + " (" + dcD[2] + (dcD[3] ? ", off below" : "") + ")");
  }
  display_notice("  " + dcT + (dcT >= dcLvl ? " kept  " : " down  ") + (dcRow.join(", ") || "-"), dcT >= dcLvl ? "lime" : C);
}
if (T.removed.length) display_notice("  removed by you: " + T.removed.join(", "), C);
var dcCmds = (label, list, mine) => {
  if (!list.length) return;
  var out = [];
  for (var i = 0; i < list.length; i++) out.push((i + 1) + ". " + (mine.indexOf(list[i]) >= 0 ? "*" : "") + list[i]);
  display_notice("  " + label + ": " + out.join("   "), C);
};
dcCmds("DEFCON INIT", T.init, T.initMine);
dcCmds("after the morph", T.aftermorph, T.afterMine);
if (dcAny) display_notice("  DEFCON EXPORT prints this table to share; DEFCON RESET ALL drops your changes.", C);
