// A fish landed: the hook is bare (re-baited with FISHING REBAIT ON).
if (!client.loom || !client.loom.fishing || !client.loom.fishing.bare) run_function("fishing_setup", [], "fishing");
client.loom.fishing.bare("fish landed");
