// "You reel your line in completely.": the line is in by hand. The bait stays
// on the hook (CL won't bait again), and any tease or jerk still waiting is
// dropped so it doesn't go out to an empty line.
if (!client.loom || !client.loom.fishing || !client.loom.fishing.cancel) run_function("fishing_setup", [], "fishing");
client.loom.fishing.cancel();
