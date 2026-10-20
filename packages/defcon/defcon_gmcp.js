// defcon_gmcp -- the work behind onGMCP, as a function made once per load
// (client.loom.hooks.defcon.gmcp). Nexus compiles a script afresh every time it
// runs, and long ones cost on every GMCP message, so the script itself stays two
// lines and calls this (#136). Run from onLoad and onInstall, so a reimport
// replaces it.
if (!client.loom) client.loom = {};
if (!client.loom.hooks) client.loom.hooks = {};
if (!client.loom.hooks.defcon) client.loom.hooks.defcon = {};
client.loom.hooks.defcon.gmcp = function (args) {
  if (!client.loom || !client.loom.defcon || !client.loom.defcon.classes) run_function("defcon_setup", [], "defcon");
  var D = client.loom.defcon;
  // A payload that came empty or as something other than an object reads as
  // an empty one (#135).
  var dcG = (args.gmcp_args && typeof args.gmcp_args == "object") ? args.gmcp_args : {};
  if (args.gmcp_method == "Char.Status" && dcG.class) {
    var dcWas = D.cls;
    D.cls = dcG.class;
    if (get_variable("defcon_class") !== D.cls) set_variable("defcon_class", D.cls);
    // A class change (dragonform included): the game has already loaded that
    // class's curing list, so just say what level it was left at.
    if (dcWas && dcWas !== D.cls && D.upDone) {
      run_function("defcon_table", [], "defcon");
      display_notice("[defcon] " + D.tbl.name + ": " + ((D.level === undefined || D.level === null) ? "no DEFCON level set in this class yet." : "DEFCON " + D.level + "."), "cyan");
    }
    // First class message of the session: send the init commands if DEFCON
    // INIT AUTO is on.
    if (!D.upDone) {
      D.upDone = true;
      if (get_variable("defcon_autoinit") == "on") run_function("defcon_up", [], "defcon");
    }
  }

  // Morph (Druid, Sentinel), from charstats: a change completes a pending
  // DEFCON UP morph (defcon_aftermorph).
  if (args.gmcp_method == "Char.Vitals" && dcG.charstats) {
    var dcStats = Array.isArray(dcG.charstats) ? dcG.charstats : [], dcMorph = null;
    for (var dcS = 0; dcS < dcStats.length; dcS++) {
      var dcMs = String(dcStats[dcS]).match(/^Morph:\s*(.+)$/);
      if (dcMs) dcMorph = dcMs[1];
    }
    if (dcMorph !== null && dcMorph !== D.morph) {
      D.morph = dcMorph;
      // Only the form DEFCON UP asked for (or, if it named none, any form):
      // the first reading after a load is often "None".
      if (D.afterMorph && (D.afterMorph.want ? dcMorph.toLowerCase() == D.afterMorph.want : !/^none$/i.test(dcMorph))) run_function("defcon_aftermorph", [], "defcon");
    }
  }
};
