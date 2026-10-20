// onGMCP: the work is in hunting_gmcp (#136: this runs on every GMCP message, so it stays short).
var lkH = client.loom && client.loom.hooks && client.loom.hooks.hunting;
if (!lkH || !lkH.gmcp) { run_function("hunting_gmcp", [], "hunting"); lkH = client.loom.hooks.hunting; }
lkH.gmcp(args);
