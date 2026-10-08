if (!client.loom) client.loom = {};
if (!client.loom.hunting) client.loom.hunting = {};
var HU = client.loom.hunting;

// Class: hunting follows it itself and lays out the F-key buttons on change.
if (args.gmcp_method == "Char.Status" && args.gmcp_args.class) {
  if (args.gmcp_args.class != HU.cls) {
    HU.cls = args.gmcp_args.class;
    run_function("set_buttons", [], "hunting");
  }
}

if (args.gmcp_method == "Char.Vitals") {
  // Dragonform in auto mode: pick gut or incantation from endurance vs willpower.
  if (get_variable("dragonMode") == "auto") {
    run_function("best_dragon_mode", [], "hunting");
    run_function("set_buttons", [], "hunting");
  }

  var stats = args.gmcp_args.charstats;
  var rage = null;
  if (stats) {
    for (var i = 0; i < stats.length; i++) {
      var m = stats[i].match(/^Rage:\s*(\d+)/);
      if (m) { rage = parseInt(m[1], 10); }
    }
  }
  if (rage !== null) {
    set_variable("my_rage", rage);
    run_function("hl_buttons", [], "hunting");
  }
}
