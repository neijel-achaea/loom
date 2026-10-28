// "You have been slain by X." (#336): a skull on the session graph where you
// died, X on hover. The line is the usual one; send the real wording if a
// death goes unmarked.
if (!client.loom || !client.loom.levelgraph || !client.loom.levelgraph.day) run_function("levelgraph_setup", [], "levelgraph");
var LG = client.loom.levelgraph;
LG.addDeath(String(args[1] || "").trim());
run_function("levelgraph_render", [], "levelgraph");
