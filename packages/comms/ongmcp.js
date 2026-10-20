// onGMCP: the work is in comms_gmcp (#136: this runs on every GMCP message, so it stays short).
var lkH = client.loom && client.loom.hooks && client.loom.hooks.comms;
if (!lkH || !lkH.gmcp) { run_function("comms_gmcp", [], "comms"); lkH = client.loom.hooks.comms; }
lkH.gmcp(args);
