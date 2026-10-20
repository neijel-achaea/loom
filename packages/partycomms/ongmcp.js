// onGMCP: the work is in partycomms_gmcp (#136: this runs on every GMCP message, so it stays short).
var lkH = client.loom && client.loom.hooks && client.loom.hooks.partycomms;
if (!lkH || !lkH.gmcp) { run_function("partycomms_gmcp", [], "partycomms"); lkH = client.loom.hooks.partycomms; }
lkH.gmcp(args);
