// onGMCP: the work is in coffers_gmcp (#136: this runs on every GMCP message, so it stays short).
var lkH = client.loom && client.loom.hooks && client.loom.hooks.coffers;
if (!lkH || !lkH.gmcp) { run_function("coffers_gmcp", [], "coffers"); lkH = client.loom.hooks.coffers; }
lkH.gmcp(args);
