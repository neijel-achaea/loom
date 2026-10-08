if (!client.loom || !client.loom.hunting || !client.loom.hunting.costs) run_function("hunting_setup", [], "hunting");
var HU = client.loom.hunting;
HU.cd["Stormbolt"] = false;
HU.glob = false;
run_function("hunting_highlight", [], "hunting");
