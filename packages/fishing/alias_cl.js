// CL <direction>: the play-speed shortcut for FISHING CAST.
if (!client.loom || !client.loom.fishing) run_function("fishing_setup", [], "fishing");
client.loom.fishing.dir = String(args[1] || "").toLowerCase();
run_function("fishing_cast", [], "fishing");
