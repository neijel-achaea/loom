// onGMCP: the work is in roleplay_gmcp (#136: this runs on every GMCP message, so it stays short).
var lkH = client.loom && client.loom.hooks && client.loom.hooks.roleplay;
if (!lkH || !lkH.gmcp) { run_function("roleplay_gmcp", [], "roleplay"); lkH = client.loom.hooks.roleplay; }
lkH.gmcp(args);
