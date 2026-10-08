if (!client.loom || !client.loom.defcon || !client.loom.defcon.classes) run_function("defcon_setup", [], "defcon");
var D = client.loom.defcon;
// DEFCON UP: the class's own commands, then the common ones.
run_function("defcon_table", [], "defcon");
var dcCmds = D.tbl.up.concat(D.common);
for (var dcI = 0; dcI < dcCmds.length; dcI++) send_command(dcCmds[dcI]);
display_notice("[defcon] defences up for " + D.tbl.name + (D.tbl.known ? "" : " (class not configured yet: common defences only)") + ".", "cyan");
