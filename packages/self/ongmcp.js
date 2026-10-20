// onGMCP: the work is in self_gmcp (#136: this runs on every GMCP message, so it stays short).
var lkH = client.loom && client.loom.hooks && client.loom.hooks.self;
if (!lkH || !lkH.gmcp) { run_function("self_gmcp", [], "self"); lkH = client.loom.hooks.self; }
lkH.gmcp(args);
