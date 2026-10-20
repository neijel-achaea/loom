// onGMCP: the work is in levelgraph_gmcp (#136: this runs on every GMCP message, so it stays short).
var lkH = client.loom && client.loom.hooks && client.loom.hooks.levelgraph;
if (!lkH || !lkH.gmcp) { run_function("levelgraph_gmcp", [], "levelgraph"); lkH = client.loom.hooks.levelgraph; }
lkH.gmcp(args);
