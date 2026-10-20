// onGMCP: the work is in room_gmcp (#136: this runs on every GMCP message, so it stays short).
var lkH = client.loom && client.loom.hooks && client.loom.hooks.room;
if (!lkH || !lkH.gmcp) { run_function("room_gmcp", [], "room"); lkH = client.loom.hooks.room; }
lkH.gmcp(args);
