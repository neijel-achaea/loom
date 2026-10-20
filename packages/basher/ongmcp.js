// onGMCP: the work is in basher_gmcp (#136: this runs on every GMCP message, so it stays short).
var lkH = client.loom && client.loom.hooks && client.loom.hooks.basher;
if (!lkH || !lkH.gmcp) { run_function("basher_gmcp", [], "basher"); lkH = client.loom.hooks.basher; }
lkH.gmcp(args);
