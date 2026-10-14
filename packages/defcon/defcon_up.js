if (!client.loom || !client.loom.defcon || !client.loom.defcon.classes) run_function("defcon_setup", [], "defcon");
var D = client.loom.defcon;
// DEFCON UP: the common commands, then the class's own, last: anything sent
// while morphing breaks the morph, so a class can end on one.
run_function("defcon_table", [], "defcon");
var dcCmds = D.common.concat(D.tbl.up);
for (var dcI = 0; dcI < dcCmds.length; dcI++) send_command(dcCmds[dcI]);
display_notice("[defcon] defences up for " + D.tbl.name + (D.tbl.known ? "" : " (class not configured yet: common defences only)") + ".", "cyan");
