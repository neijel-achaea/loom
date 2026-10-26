if (!client.loom || !client.loom.hunting || !client.loom.hunting.classes) run_function("hunting_setup", [], "hunting");
var HU = client.loom.hunting;
HU.cd[args[1]] = true;
// Its own cooldown outlasts the global one, so when the ability that
// started the global cooldown is ready again, the global one is over too,
// even if its line ("You can use another Battlerage ability again") never
// matched (wrapped, reworded or hidden by something else).
if (!HU.glob && HU.globBy === args[1]) HU.glob = true;
run_function("hunting_highlight", [], "hunting");
