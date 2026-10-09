if (!client.loom || !client.loom.hunting || !client.loom.hunting.classes) run_function("hunting_setup", [], "hunting");
var HU = client.loom.hunting;
HU.cd[args[1]] = true;
run_function("hunting_highlight", [], "hunting");
