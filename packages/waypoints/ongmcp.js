// Waypoints follows the room itself: the room you're in is highlighted in
// the tab, and ADD saves it.
if (!client.loom || !client.loom.waypoints || !client.loom.waypoints.list) run_function("waypoints_setup", [], "waypoints");
if (args.gmcp_method == "Room.Info") {
  var wpG = (args.gmcp_args && typeof args.gmcp_args == "object") ? args.gmcp_args : {};
  var WP = client.loom.waypoints;
  WP.here = wpG.num ? { id: String(wpG.num), name: WP.roomName(wpG.name), area: String(wpG.area || ""), env: String(wpG.environment || "") } : null;
  run_function("waypoints_render", [], "waypoints");
}
