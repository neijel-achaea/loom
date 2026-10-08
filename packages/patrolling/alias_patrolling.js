// PATROLLING [subcommand ...]: the one command for this package.
if (!client.loom || !client.loom.patrolling || !client.loom.patrolling.expected) run_function("patrolling_setup", [], "patrolling");
var P = client.loom.patrolling;
var paRaw = String(args[1] || "").trim();
var paW = paRaw.toLowerCase().split(/\s+/);
var paSub = paW[0];
var paRest = paRaw.substring(paW[0].length).trim();
var C = "cyan";
if (paSub === "" || paSub === "status") {
  run_function("patrolling_status", [], "patrolling");
} else if (paSub === "help") {
  run_function("patrolling_help", [], "patrolling");
} else if (paSub === "on" || paSub === "off") {
  set_variable("patrolling_on", paSub);
  if (paSub === "off") { P.active = false; P.gag = false; }
  display_notice("[patrolling] " + paSub.toUpperCase() + ".", C);
  if (paSub === "on") run_function("patrolling_check", [], "patrolling");
} else if (paSub === "here") {
  run_function("patrolling_check", [], "patrolling");
} else if (paSub === "learn") {
  P.learn = true;
  run_function("patrolling_check", [], "patrolling");
} else if (paSub === "suggest") {
  run_function("patrolling_suggest", [], "patrolling");
} else if (paSub === "stamp") {
  var paIn = (paRest || P.room.area || "").toLowerCase();
  var paMatch = "";
  for (var paA in P.areas) { if (paA.toLowerCase() == paIn) paMatch = paA; }
  if (paMatch) {
    var paLast = get_variable("patrolling_last") || {};
    paLast[paMatch] = new Date().getTime();
    set_variable("patrolling_last", paLast);
    display_notice("[patrolling] " + paMatch + " stamped as patrolled.", C);
  } else {
    display_notice("[patrolling] area '" + (paRest || P.room.area || "?") + "' isn't in the table.", "orange");
  }
} else if (paSub === "fire") {
  var paClan = get_variable("patrolling_clan");
  if (!paClan) display_notice("[patrolling] no clan set. PATROLLING CLAN <clan>.", "orange");
  else { send_command("clan switch " + paClan); send_command("clt Fire at me! " + P.room.name + " (" + P.room.id + ") at " + P.room.area); }
} else if (paSub === "clan" || paSub === "god") {
  if (paRest === "") {
    display_notice("[patrolling] " + paSub + ": " + (get_variable("patrolling_" + paSub) || "none") + ".", C);
  } else {
    var paV = (paRest.toLowerCase() === "off") ? "" : paRest.toLowerCase();
    set_variable("patrolling_" + paSub, paV);
    display_notice("[patrolling] " + paSub + ": " + (paV || "none") + ".", C);
  }
} else if (paSub === "reset") {
  run_function("patrolling_setup", [], "patrolling");
  display_notice("[patrolling] tables reloaded.", C);
} else if (paSub === "debug") {
  display_notice("[patrolling] room=" + JSON.stringify(P.room) + " active=" + P.active + " present=" + JSON.stringify(P.present) + " shrines=" + JSON.stringify(P.shrines), C);
} else {
  display_notice("[patrolling] unknown command '" + paSub + "'. PATROLLING HELP for commands.", "orange");
}
