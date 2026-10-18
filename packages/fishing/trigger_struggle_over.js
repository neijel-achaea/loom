// "You reel in the last bit of line and your struggle is over.": the fight is
// over and the bait gone; drop anything still waiting.
if (!client.loom || !client.loom.fishing || !client.loom.fishing.cancel) run_function("fishing_setup", [], "fishing");
client.loom.fishing.cancel();
client.loom.fishing.baited = false;
