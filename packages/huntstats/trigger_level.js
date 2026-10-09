// "Level: <n> (<p>%)" in game output, such as SCORE: the precise figure,
// between the whole-percent GMCP updates.
if (!client.loom || !client.loom.huntstats || !client.loom.huntstats.xpTable) run_function("huntstats_setup", [], "huntstats");
var HS = client.loom.huntstats;
var hsL = parseInt(args[1], 10);
var hsP = parseFloat(args[2]);
if (!isNaN(hsL)) HS.level = hsL;
if (!isNaN(hsP)) HS.nl = hsP;
