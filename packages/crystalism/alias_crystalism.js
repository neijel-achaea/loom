// CRYSTALISM [subcommand ...]: the one command for this package.
if (!client.loom || !client.loom.crystalism || !client.loom.crystalism.shapes) run_function("crystalism_setup", [], "crystalism");
var CR = client.loom.crystalism;
var crW = String(args[1] || "").trim().toLowerCase().split(/\s+/);
var crSub = crW[0];
var crVal = crW[1] || "";
var C = "cyan";
if (crSub === "" || crSub === "status") {
  run_function("crystalism_status", [], "crystalism");
} else if (crSub === "help") {
  run_function("crystalism_help", [], "crystalism");
} else if (crSub === "refine") {
  if (crVal !== "" && !/^\d+$/.test(crVal)) {
    display_notice("[crystalism] CRYSTALISM REFINE [n]: n is how many crystals at most.", "orange");
  } else {
    CR.askCap = crVal ? parseInt(crVal, 10) : Infinity;
    run_function("crystalism_refine", [], "crystalism");
  }
} else if (crSub === "stop") {
  if (CR.state === "idle") display_notice("[crystalism] no refine run going.", C);
  else run_function("crystalism_abort", [], "crystalism");
} else if (crSub === "pearls" || crSub === "portal") {
  if (crVal === "on" || crVal === "off") {
    set_variable("crystalism_" + crSub, crVal);
    display_notice("[crystalism] " + (crSub === "pearls" ? "pearl pickup " : "portal for city members ") + crVal.toUpperCase() + ".", "lime");
  } else {
    display_notice("[crystalism] CRYSTALISM " + crSub.toUpperCase() + " ON or OFF.", "orange");
  }
} else if (crSub === "min") {
  // CRYSTALISM MIN <n> | MIN <shape> <n|default> | MIN (show) (#44)
  var crArg2 = crW[2] || "";
  if (crVal === "") {
    var crMs = [];
    for (var crMi = 0; crMi < CR.shapes.length; crMi++) { var crSh = CR.shapes[crMi]; crMs.push(crSh + " " + (CR.min[crSh] != null ? CR.min[crSh] : CR.defMin) + (CR.rift[crSh] != null ? " (have " + CR.rift[crSh] + ")" : "")); }
    display_notice("[crystalism] default minimum " + CR.defMin + "; " + crMs.join(", ") + ".", C);
  } else if (/^\d+$/.test(crVal) && crArg2 === "") {
    CR.defMin = parseInt(crVal, 10);
    set_variable("crystalism_default_min", CR.defMin);
    if (client.loom.notify) client.loom.notify("crystalism");
    display_notice("[crystalism] default minimum: " + CR.defMin + ".", "lime");
  } else if (CR.shapes.indexOf(crVal) >= 0 && (crArg2 === "default" || /^\d+$/.test(crArg2))) {
    if (crArg2 === "default") delete CR.min[crVal]; else CR.min[crVal] = parseInt(crArg2, 10);
    set_variable("crystalism_min", JSON.stringify(CR.min));
    if (client.loom.notify) client.loom.notify("crystalism");
    display_notice("[crystalism] minimum for " + crVal + ": " + (CR.min[crVal] != null ? CR.min[crVal] : CR.defMin + " (default)") + ".", "lime");
  } else {
    display_notice("[crystalism] CRYSTALISM MIN <n>, or CRYSTALISM MIN <shape> <n|default>. Shapes: " + CR.shapes.join(", ") + ".", "orange");
  }
} else if (crSub === "debug") {
  display_notice("[crystalism] state=" + CR.state + " facets=" + CR.facets + " rift=" + JSON.stringify(CR.rift) + " queue=" + JSON.stringify(CR.queue), C);
} else {
  display_notice("[crystalism] unknown command '" + crSub + "'. CRYSTALISM HELP for commands.", "orange");
}
