// MAGI [subcommand ...]: the one command for this package.
if (!client.loom || !client.loom.magi || !client.loom.magi.shapes) run_function("magi_setup", [], "magi");
var MG = client.loom.magi;
var mgW = String(args[1] || "").trim().toLowerCase().split(/\s+/);
var mgSub = mgW[0];
var mgVal = mgW[1] || "";
function mgSay(t, c) { display_notice("[magi] " + t, c || "cyan"); }
function mgElement(ab) { for (var k in MG.staffs) { if (MG.staffs.hasOwnProperty(k) && MG.staffs[k] === ab) return k; } return ab; }

if (mgSub === "" || mgSub === "status") {
  run_function("magi_status", [], "magi");
} else if (mgSub === "help") {
  run_function("magi_help", [], "magi");

// ---- Crystalism ----------------------------------------------------------
} else if (mgSub === "refine" && mgVal === "stop") {
  if (MG.state === "idle") mgSay("no refine run going.");
  else run_function("magi_abort", [], "magi");
} else if (mgSub === "refine") {
  if (mgVal !== "" && !/^\d+$/.test(mgVal)) {
    mgSay("MAGI REFINE [n]: n is how many crystals at most. MAGI REFINE STOP cancels a run.", "orange");
  } else {
    MG.askCap = mgVal ? parseInt(mgVal, 10) : Infinity;
    run_function("magi_refine", [], "magi");
  }
} else if (mgSub === "pearls" || mgSub === "portal") {
  if (mgVal === "on" || mgVal === "off") {
    set_variable("magi_" + mgSub, mgVal);
    mgSay((mgSub === "pearls" ? "pearl pickup " : "portal for city members ") + mgVal.toUpperCase() + ".", "lime");
  } else {
    mgSay("MAGI " + mgSub.toUpperCase() + " ON or OFF.", "orange");
  }
} else if (mgSub === "min") {
  // MAGI MIN <n> | MIN <shape> <n|default> | MIN (show) (#44)
  var mgArg2 = mgW[2] || "";
  if (mgVal === "") {
    var mgMs = [];
    for (var mgMi = 0; mgMi < MG.shapes.length; mgMi++) { var mgSh = MG.shapes[mgMi]; mgMs.push(mgSh + " " + (MG.min[mgSh] != null ? MG.min[mgSh] : MG.defMin) + (MG.rift[mgSh] != null ? " (have " + MG.rift[mgSh] + ")" : "")); }
    mgSay("default minimum " + MG.defMin + "; " + mgMs.join(", ") + ".");
  } else if (/^\d+$/.test(mgVal) && mgArg2 === "") {
    MG.defMin = parseInt(mgVal, 10);
    set_variable("magi_default_min", MG.defMin);
    if (client.loom.notify) client.loom.notify("magi");
    mgSay("default minimum: " + MG.defMin + ".", "lime");
  } else if (MG.shapes.indexOf(mgVal) >= 0 && (mgArg2 === "default" || /^\d+$/.test(mgArg2))) {
    if (mgArg2 === "default") delete MG.min[mgVal]; else MG.min[mgVal] = parseInt(mgArg2, 10);
    set_variable("magi_min", JSON.stringify(MG.min));
    if (client.loom.notify) client.loom.notify("magi");
    mgSay("minimum for " + mgVal + ": " + (MG.min[mgVal] != null ? MG.min[mgVal] : MG.defMin + " (default)") + ".", "lime");
  } else {
    mgSay("MAGI MIN <n>, or MAGI MIN <shape> <n|default>. Shapes: " + MG.shapes.join(", ") + ".", "orange");
  }

// ---- Artificing ----------------------------------------------------------
} else if (mgSub === "staff") {
  if (!mgVal) {
    mgSay("staff attack: " + mgElement(MG.staff) + " (" + MG.staff + "). MAGI STAFF FIRE, FROST or LIGHTNING.");
  } else if (!MG.staffs[mgVal]) {
    mgSay("pick FIRE, FROST or LIGHTNING.", "orange");
  } else {
    MG.staff = MG.staffs[mgVal];
    set_variable("magi_staff", MG.staff);
    // hunting, when installed, puts it on its staff key with the next prompt.
    mgSay("staff attack: " + mgVal + " (" + MG.staff + ").", "lime");
  }
} else if (mgSub === "treaty" || mgSub === "tf") {
  if (MG.elementals.indexOf(mgVal) < 0) {
    mgSay("a treaty can be formed with: " + MG.elementals.join(", ").toUpperCase() + ". MAGI TREATY <elemental>.", "orange");
  } else {
    // The communion breaks if anything else is sent, so everything that
    // follows pauseTriggers holds back, and curing stops sipping.
    MG.treaty = { elemental: mgVal, at: Date.now() };
    set_variable("pauseTriggers", "on");
    send_command("curing sipping off");
    send_command("treaty form " + mgVal);
  }
} else if (mgSub === "resume") {
  run_function("magi_resume", [], "magi");
  mgSay("triggers unpaused and sipping on.", "lime");

} else if (mgSub === "debug") {
  mgSay("refine state=" + MG.state + " facets=" + MG.facets + " rift=" + JSON.stringify(MG.rift) + " queue=" + JSON.stringify(MG.queue)
    + " staff=" + MG.staff + " treaty=" + JSON.stringify(MG.treaty) + " pause=" + (get_variable("pauseTriggers") || "unset")
    + " old packages=" + (MG.oldInstalled().join(",") || "none"));
} else {
  mgSay("unknown command '" + mgSub + "'. MAGI HELP for commands.", "orange");
}
