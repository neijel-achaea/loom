// onGMCP: the work is in conjuration_gmcp (#136: this runs on every GMCP message, so it stays short).
var lkH = client.loom && client.loom.hooks && client.loom.hooks.conjuration;
if (!lkH || !lkH.gmcp) { run_function("conjuration_gmcp", [], "conjuration"); lkH = client.loom.hooks.conjuration; }
lkH.gmcp(args);
