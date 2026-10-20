// onGMCP: the work is in defcon_gmcp (#136: this runs on every GMCP message, so it stays short).
var lkH = client.loom && client.loom.hooks && client.loom.hooks.defcon;
if (!lkH || !lkH.gmcp) { run_function("defcon_gmcp", [], "defcon"); lkH = client.loom.hooks.defcon; }
lkH.gmcp(args);
