// HARVESTING [subcommand ...]: the one command for this package.
if (!client.loom || !client.loom.harvesting || !client.loom.harvesting.plants) run_function("harvesting_setup", [], "harvesting");
var H = client.loom.harvesting;
var hvA = String(args[1] || "").toLowerCase().trim().split(/\s+/);
var C = "cyan";
if (hvA[0] === "" || hvA[0] === "status") {
  run_function("harvesting_status", [], "harvesting");
} else if (hvA[0] === "help") {
  run_function("harvesting_help", [], "harvesting");
} else if (hvA[0] === "on") {
  set_variable("harvesting_on", "on");
  H.quiet = true;
  send_command("ir herbs");
  display_notice("[harvesting] ON: reading your rift stock.", "lime");
} else if (hvA[0] === "off") {
  set_variable("harvesting_on", "off");
  H.queue = [];
  H.current = null;
  H.waitBal = false;
  display_notice("[harvesting] OFF.", "lime");
} else if (hvA[0] === "stock") {
  send_command("ir herbs");
} else if (hvA[0] === "min" && hvA.length == 2 && /^\d+$/.test(hvA[1])) {
  H.defMin = parseInt(hvA[1], 10);
  set_variable("harvesting_default_min", H.defMin);
  display_notice("[harvesting] default minimum: " + H.defMin + ".", "lime");
} else if (hvA[0] === "min" && hvA.length == 3 && (hvA[2] === "default" || /^\d+$/.test(hvA[2]))) {
  if (hvA[2] === "default") delete H.min[hvA[1]];
  else H.min[hvA[1]] = parseInt(hvA[2], 10);
  run_function("harvesting_save", [], "harvesting");
  display_notice("[harvesting] minimum for " + hvA[1] + ": " + (H.min[hvA[1]] != null ? H.min[hvA[1]] : H.defMin + " (default)") + ".", "lime");
} else if (hvA[0] === "min") {
  display_notice("[harvesting] HARVESTING MIN <n>, or HARVESTING MIN <plant> <n|default>.", "orange");
} else if (hvA[0] === "reset") {
  H.queue = [];
  H.current = null;
  H.quiet = false;
  run_function("harvesting_setup", [], "harvesting");
  display_notice("[harvesting] reset: queue cleared, state reloaded from saved variables.", "lime");
} else if (hvA[0] === "debug") {
  display_notice("[harvesting] here=" + H.here + " queue=" + JSON.stringify(H.queue) + " current=" + H.current + " waitBal=" + H.waitBal + " inRift=" + H.inRift + " quiet=" + H.quiet + " map=" + JSON.stringify(H.map), C);
} else {
  display_notice("[harvesting] unknown command '" + hvA[0] + "'. HARVESTING HELP for commands.", "orange");
}
