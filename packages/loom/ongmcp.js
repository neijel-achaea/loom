// onGMCP: the work is in loom_gmcp (#136: this runs on every GMCP message, so it stays short).
var lkH = client.loom && client.loom.hooks && client.loom.hooks.loom;
if (!lkH || !lkH.gmcp) { run_function("loom_gmcp", [], "loom"); lkH = client.loom.hooks.loom; }
lkH.gmcp(args);
