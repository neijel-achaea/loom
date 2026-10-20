// onGMCP: the work is in dmgchart_gmcp (#136: this runs on every GMCP message, so it stays short).
var lkH = client.loom && client.loom.hooks && client.loom.hooks.dmgchart;
if (!lkH || !lkH.gmcp) { run_function("dmgchart_gmcp", [], "dmgchart"); lkH = client.loom.hooks.dmgchart; }
lkH.gmcp(args);
