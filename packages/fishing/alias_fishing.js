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
    + (get_variable("pauseTriggers") === "on" ? ", PAUSED (LOOM PAUSE)" : "")
    + ". FISHING HELP for commands.", C);
} else if (fiSub === "help") {
  run_function("fishing_help", [], "fishing");
} else if (fiSub === "bait") {
  if (fiArg !== "") set_variable("fishing_bait", fiArg.toLowerCase());
  display_notice("[fishing] bait: " + (get_variable("fishing_bait") || "not set") + ".", C);
} else if (fiSub === "cast") {
  FI.dir = fiArg.toLowerCase();
  run_function("fishing_cast", [], "fishing");
} else if (fiSub === "ding") {
  var fiD = fiArg.toLowerCase();
  if (fiD === "on" || fiD === "off") set_variable("fishing_ding", fiD);
  display_notice("[fishing] ding " + (get_variable("fishing_ding") === "off" ? "OFF: new records stay quiet." : "ON: a new yearly record tells the party \"Ding fish!\"."), C);
}
