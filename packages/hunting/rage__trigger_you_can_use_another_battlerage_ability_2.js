if (!client.loom || !client.loom.hunting || !client.loom.hunting.classes) run_function("hunting_setup", [], "hunting");
var HU = client.loom.hunting;
for (var huName in HU.costs) {
  if (HU.rage >= HU.costs[huName]) { HU.cd[huName] = false; }
}
HU.glob = true;
run_function("hunting_highlight", [], "hunting");
