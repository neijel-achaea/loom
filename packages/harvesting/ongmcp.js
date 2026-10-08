if (!client.loom || !client.loom.harvesting || !client.loom.harvesting.plants) run_function("harvesting_setup", [], "harvesting");
var H = client.loom.harvesting;
// Harvesting follows the room itself: remember the environment and check what
// needs harvesting here.
if (args.gmcp_method == "Room.Info") {
  H.here = String(args.gmcp_args.environment || "").toLowerCase();
  // First room of the session with harvesting on: read the rift first. The
  // room is checked again once the listing ends (trigger_rift_rule).
  if (!H.started) {
    H.started = true;
    if (get_variable("harvesting_on") == "on" && get_variable("pauseTriggers") != "on") {
      H.quiet = true;
      send_command("ir herbs");
    }
  }
  // While a quiet rift listing is on its way, the room is checked when it ends.
  if (!H.quiet) run_function("harvesting_room", [], "harvesting");
}
