if (!client.loom || !client.loom.defcon || !client.loom.defcon.classes) run_function("defcon_setup", [], "defcon");
var D = client.loom.defcon;
// DEFCON INIT: the common commands, then the class's own, last: anything sent
// while morphing breaks the morph, so a class can end on one. Commands the
// class lists in "aftermorph" wait for the morph to complete
// (defcon_aftermorph, from the game's line or the Morph charstat).
run_function("defcon_table", [], "defcon");
var dcCmds = D.common.concat(D.tbl.init);
var dcAfter = D.tbl.aftermorph || [];
D.afterMorph = null;
if (dcAfter.length) {
  var dcWant = "";
  for (var dcJ = 0; dcJ < D.tbl.init.length; dcJ++) {
    var dcMm = String(D.tbl.init[dcJ]).match(/\bmorph\s+(\w+)\s*$/i);
    if (dcMm) dcWant = dcMm[1].toLowerCase();
  }
  if (dcWant && String(D.morph || "").toLowerCase() == dcWant) {
    // Already in that form: no morph to wait for.
    var dcKeep = [];
    for (var dcK = 0; dcK < dcCmds.length; dcK++) { if (!/\bmorph\s+\w+\s*$/i.test(dcCmds[dcK])) dcKeep.push(dcCmds[dcK]); }
    dcCmds = dcKeep.concat(dcAfter);
  } else {
    D.afterMorph = { cmds: dcAfter.slice(), want: dcWant };
  }
}
for (var dcI = 0; dcI < dcCmds.length; dcI++) send_command(dcCmds[dcI]);
display_notice("[defcon] init sent for " + D.tbl.name + (D.tbl.known ? "" : " (class not configured yet: common defences only)") + (D.afterMorph ? "; the rest once the morph completes" : "") + ".", "cyan");
