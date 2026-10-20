// hunting_gmcp -- the work behind onGMCP, as a function made once per load
// (client.loom.hooks.hunting.gmcp). Nexus compiles a script afresh every time it
// runs, and long ones cost on every GMCP message, so the script itself stays two
// lines and calls this (#136). Run from onLoad and onInstall, so a reimport
// replaces it.
if (!client.loom) client.loom = {};
if (!client.loom.hooks) client.loom.hooks = {};
if (!client.loom.hooks.hunting) client.loom.hooks.hunting = {};
client.loom.hooks.hunting.gmcp = function (args) {
  if (!client.loom || !client.loom.hunting || !client.loom.hunting.classes) run_function("hunting_setup", [], "hunting");
  var HU = client.loom.hunting;
  // A payload that came empty or as something other than an object reads as
  // an empty one (#135).
  var huG = (args.gmcp_args && typeof args.gmcp_args == "object") ? args.gmcp_args : {};

  // Class: hunting follows it itself. On a change: that class's keys and costs,
  // and fresh cooldowns, since ability names can repeat across classes.
  if (args.gmcp_method == "Char.Status" && huG.class) {
    if (huG.class != HU.cls) {
      HU.cls = huG.class;
      HU.cd = {};
      set_variable("hunting_class", HU.cls);
      run_function("hunting_buttons", [], "hunting");
    }
  }

  // Your own name, so autogold only treats "X has been slain by <you>." as your kill.
  if ((args.gmcp_method == "Char.Name" || args.gmcp_method == "Char.Status") && huG.name) {
    if (String(huG.name) !== HU.name) {
      HU.name = String(huG.name);
      set_variable("hunting_name", HU.name);
    }
  }

  if (args.gmcp_method == "Char.Vitals") {
    // A staff attack changed in artificing since the keys were drawn: redraw,
    // so the staff key casts the new one. Read only, never called into.
    var huStaffNow = client.loom.artificing && client.loom.artificing.staff;
    if (huStaffNow && HU.staffDrawn && huStaffNow !== HU.staffDrawn) run_function("hunting_buttons", [], "hunting");

    var v = huG;
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

    var stats = huG.charstats;
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
    // Specialisation (Infernal, Paladin, Runewarden): some keys depend on it,
    // so a change lays the keys out again.
    // Morph (Sentinel): picks the main attack, like the spec.
    var huSpec = null, huMorph = null;
    if (stats) {
      for (var huS = 0; huS < stats.length; huS++) {
        var huSm = String(stats[huS]).match(/^Spec:\s*(.+)$/);
        if (huSm) huSpec = huSm[1];
        var huMm = String(stats[huS]).match(/^Morph:\s*(.+)$/);
        if (huMm) huMorph = huMm[1];
      }
    }
    var huRedraw = false;
    if (huSpec !== null && huSpec !== HU.spec) {
      // A real change (not the first reading after a load) drops the main
      // attack picked by hand, so the new spec's default takes over.
      if (HU.spec !== undefined && HU.mains[HU.cls]) { delete HU.mains[HU.cls]; set_variable("hunting_mains", JSON.stringify(HU.mains)); }
      HU.spec = huSpec;
      huRedraw = true;
    }
    if (huMorph !== null && huMorph !== HU.morph) {
      if (HU.morph !== undefined && HU.mains[HU.cls]) { delete HU.mains[HU.cls]; set_variable("hunting_mains", JSON.stringify(HU.mains)); }
      HU.morph = huMorph;
      huRedraw = true;
      // The new morph has arrived: whatever paused for it is done.
      if (HU.paused) { set_variable("pauseTriggers", "off"); HU.paused = false; }
    }
    if (huRedraw) run_function("hunting_buttons", [], "hunting");
    // Balance and equilibrium arrive on every vitals message, so refresh the
    // highlights each time (the main attack lights on bal + eq).
    run_function("hunting_highlight", [], "hunting");
  }
};
