// For triggers: set client.loom.standings.sug = { who: "Name", step: -3, why: "tried to
// steal from you" } and run this. It queues the dealing for review instead of
// recording it, since a standing is a judgement call; STANDINGS OK records it.
// The queueing itself is the entry point other packages use too (#36):
// client.loom.standings.entry.suggest, in standings_ensure.
run_function("standings_ensure", [], "standings");
var sg = client.loom.standings.sug;
client.loom.standings.sug = null;
if (sg && sg.who) { client.loom.standings.entry.suggest(sg); }
