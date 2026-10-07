if (args.gmcp_method == "Room.Info") {
  var p = client.patrol;
  if (p) {
    p.env = (args.gmcp_args && args.gmcp_args.environment) || "";
    p.active = false; p.phase = null;               // clear any half-finished check
    if (p.on) run_function("patrol_check", null, "patrolling");
  }
}