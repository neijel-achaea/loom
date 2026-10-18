// "As the fish strains your line beyond its breaking point, it snaps
// suddenly, costing you your fish and bait.": fish and bait gone, so the
// hook is bare (re-baited with FISHING REBAIT ON).
if (!client.loom || !client.loom.fishing || !client.loom.fishing.bare) run_function("fishing_setup", [], "fishing");
client.loom.fishing.bare("line snapped");
