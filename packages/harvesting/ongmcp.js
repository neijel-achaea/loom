// Harvesting follows the room itself: on every room change, remember the
// environment and check what needs harvesting here.
if (args.gmcp_method == "Room.Info") {
  if (!client.loom) client.loom = {};
  if (!client.loom.harvesting) client.loom.harvesting = {};
  client.loom.harvesting.env = String(args.gmcp_args.environment || "");
  run_function("hv_room", [], "harvesting");
}
