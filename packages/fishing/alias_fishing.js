// FISHING [subcommand ...]: the one command for this package. Only its own
// subcommands match the alias; any other word after FISHING goes to the game.
if (!client.loom || !client.loom.fishing) run_function("fishing_setup", [], "fishing");
var FI = client.loom.fishing;
var fiSub = String(args[1] || "").toLowerCase();
var fiArg = String(args[2] || "").trim();
var C = "cyan";
if (fiSub === "" || fiSub === "status") {
  display_notice("[fishing] bait " + (get_variable("fishing_bait") || "not set")
    + ", ding " + (get_variable("fishing_ding") === "off" ? "off" : "on")
    + ", rebait " + (get_variable("fishing_rebait") === "on" ? "on" : "off")
    + (get_variable("pauseTriggers") === "on" ? ", PAUSED (LOOM PAUSE)" : "")
    + ". FISHING HELP for commands.", C);
} else if (fiSub === "help") {
  run_function("fishing_help", [], "fishing");
} else if (fiSub === "bait") {
  if (fiArg !== "") set_variable("fishing_bait", fiArg.toLowerCase());
  display_notice("[fishing] bait: " + (get_variable("fishing_bait") || "not set") + ".", fiArg !== "" ? "lime" : C);
} else if (fiSub === "cast") {
  FI.dir = fiArg.toLowerCase();
  run_function("fishing_cast", [], "fishing");
} else if (fiSub === "ding") {
  var fiD = fiArg.toLowerCase();
  if (fiD === "on" || fiD === "off") set_variable("fishing_ding", fiD);
  display_notice("[fishing] ding " + (get_variable("fishing_ding") === "off" ? "OFF: new records stay quiet." : "ON: a new yearly record tells the party \"Ding fish!\"."), (fiD === "on" || fiD === "off") ? "lime" : C);
} else if (fiSub === "rebait") {
  var fiR = fiArg.toLowerCase();
  if (fiR === "on" || fiR === "off") set_variable("fishing_rebait", fiR);
  display_notice("[fishing] rebait " + (get_variable("fishing_rebait") === "on" ? "ON: after a catch the hook is baited again, so CL only casts." : "OFF: CL baits the hook when it is bare, then casts."), (fiR === "on" || fiR === "off") ? "lime" : C);
}
