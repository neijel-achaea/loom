if (!client.loom || !client.loom.defcon || !client.loom.defcon.classes) run_function("defcon_setup", [], "defcon");
var D = client.loom.defcon;
if (args.gmcp_method == "Char.Status" && args.gmcp_args.class) {
  var dcWas = D.cls;
  D.cls = args.gmcp_args.class;
  if (get_variable("defcon_class") !== D.cls) set_variable("defcon_class", D.cls);
  // A class change (dragonform included): the game has already loaded that
  // class's curing list, so just say what level it was left at.
  if (dcWas && dcWas !== D.cls && D.upDone) {
    run_function("defcon_table", [], "defcon");
    display_notice("[defcon] " + D.tbl.name + ": " + ((D.level === undefined || D.level === null) ? "no DEFCON level set in this class yet." : "DEFCON " + D.level + "."), "cyan");
  }
  // First class message of the session: raise defences if DEFCON AUTOUP is on.
  if (!D.upDone) {
    D.upDone = true;
    if (get_variable("defcon_autoup") == "on") run_function("defcon_up", [], "defcon");
  }
}
