if (!client.loom || !client.loom.hunting || !client.loom.hunting.classes) run_function("hunting_setup", [], "hunting");
var HU = client.loom.hunting;

// Class: hunting follows it itself. On a change: that class's keys and costs,
// and fresh cooldowns, since ability names can repeat across classes.
if (args.gmcp_method == "Char.Status" && args.gmcp_args.class) {
  if (args.gmcp_args.class != HU.cls) {
    HU.cls = args.gmcp_args.class;
    HU.cd = {};
    set_variable("hunting_class", HU.cls);
    run_function("hunting_buttons", [], "hunting");
  }
}

// Your own name, so autogold only treats "X has been slain by <you>." as your kill.
if ((args.gmcp_method == "Char.Name" || args.gmcp_method == "Char.Status") && args.gmcp_args.name) {
  if (String(args.gmcp_args.name) !== HU.name) {
    HU.name = String(args.gmcp_args.name);
    set_variable("hunting_name", HU.name);
  }
}

if (args.gmcp_method == "Char.Vitals") {
  // A staff attack changed in artificing since the keys were drawn: redraw,
  // so the staff key casts the new one. Read only, never called into.
  var huStaffNow = client.loom.artificing && client.loom.artificing.staff;
  if (huStaffNow && HU.staffDrawn && huStaffNow !== HU.staffDrawn) run_function("hunting_buttons", [], "hunting");

  var v = args.gmcp_args;
  HU.bal = String(v.bal) == "1";
  HU.eq = String(v.eq) == "1";
  HU.ep = to_number(v.ep); HU.maxep = to_number(v.maxep);
  HU.wp = to_number(v.wp); HU.maxwp = to_number(v.maxwp);

  // Dragonform in auto mode: pick gut or incantation from endurance vs willpower.
  if (get_variable("hunting_dragon_mode") == "auto") {
    var huBefore = get_variable("hunting_dragon_attack");
    run_function("hunting_dragon_best", [], "hunting");
    if (get_variable("hunting_dragon_attack") != huBefore) run_function("hunting_buttons", [], "hunting");
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
    HU.rage = rage;
  }
  // Balance and equilibrium arrive on every vitals message, so refresh the
  // highlights each time (the main attack lights on bal + eq).
  run_function("hunting_highlight", [], "hunting");
}
