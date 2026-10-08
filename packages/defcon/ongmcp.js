if (!client.loom || !client.loom.defcon || !client.loom.defcon.classes) run_function("defcon_setup", [], "defcon");
var D = client.loom.defcon;
if (args.gmcp_method == "Char.Status" && args.gmcp_args.class) {
  D.cls = args.gmcp_args.class;
  // First class message of the session: raise defences if DEFCON AUTOUP is on.
  if (!D.upDone) {
    D.upDone = true;
    if (get_variable("defcon_autoup") == "on") run_function("defcon_up", [], "defcon");
  }
}
