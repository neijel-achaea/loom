// onGMCP: the work is in huntstats_gmcp (#136: this runs on every GMCP message, so it stays short).
var lkH = client.loom && client.loom.hooks && client.loom.hooks.huntstats;
if (!lkH || !lkH.gmcp) { run_function("huntstats_gmcp", [], "huntstats"); lkH = client.loom.hooks.huntstats; }
lkH.gmcp(args);
