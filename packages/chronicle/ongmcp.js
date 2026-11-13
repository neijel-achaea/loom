// The work is in chronicle_gmcp (#136: this runs on every GMCP message, so it stays short).
var crH = client.loom && client.loom.hooks && client.loom.hooks.chronicle;
if (!crH || !crH.gmcp) { run_function("chronicle_gmcp", [], "chronicle"); crH = client.loom.hooks.chronicle; }
crH.gmcp(args);
