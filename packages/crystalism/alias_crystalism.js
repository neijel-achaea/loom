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
    display_notice("[crystalism] " + (crSub === "pearls" ? "pearl pickup " : "portal for city members ") + crVal.toUpperCase() + ".", C);
  } else {
    display_notice("[crystalism] CRYSTALISM " + crSub.toUpperCase() + " ON or OFF.", "orange");
  }
} else if (crSub === "debug") {
  display_notice("[crystalism] state=" + CR.state + " facets=" + CR.facets + " rift=" + JSON.stringify(CR.rift) + " queue=" + JSON.stringify(CR.queue), C);
} else {
  display_notice("[crystalism] unknown command '" + crSub + "'. CRYSTALISM HELP for commands.", "orange");
}
