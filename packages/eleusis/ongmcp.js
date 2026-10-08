// The monolith watcher follows the room itself: on every room change,
// remember it and probe the monolith.
if (args.gmcp_method == "Room.Info") {
  if (!client.loom) client.loom = {};
  if (!client.loom.eleusis) client.loom.eleusis = {};
  client.loom.eleusis.room = { id: args.gmcp_args.num, name: args.gmcp_args.name };
  run_function("mono_enter", [], "eleusis");
}
