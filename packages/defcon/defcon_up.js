if (!client.loom || !client.loom.defcon || !client.loom.defcon.classes) run_function("defcon_setup", [], "defcon");
var D = client.loom.defcon;
// The skill check comes first (#173), so INIT never sends a command for an
// ability this character hasn't learned (insomnia on a young alt): the check
// runs DEFCON INIT again when it's done (D.initGo), at most D.skillMs later.
// Without send_GMCP there's no check, and INIT goes out at once.
if (!D.initGo && D.skillCheck && D.skillCheck("init", true)) {
  // waiting for the check
} else {
D.initGo = false;
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
// Commands for abilities not learned yet are left out (#173).
var dcLeft = [];
var dcKeepCmd = (c) => { if (D.cmdOff && D.cmdOff(c)) { dcLeft.push(String(c)); return false; } return true; };
dcCmds = dcCmds.filter(dcKeepCmd);
if (D.afterMorph) D.afterMorph.cmds = D.afterMorph.cmds.filter(dcKeepCmd);
for (var dcI = 0; dcI < dcCmds.length; dcI++) send_command(dcCmds[dcI]);
display_notice("[defcon] init sent for " + D.tbl.name + (D.tbl.known ? "" : " (class not configured yet: common defences only)") + (D.afterMorph ? "; the rest once the morph completes" : "") + (dcLeft.length ? " (left out, not learned yet: " + dcLeft.join(", ") + ")" : "") + ".", "lime");
}
