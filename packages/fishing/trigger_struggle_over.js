// "You reel in the last bit of line and your struggle is over." (often with
// "You've landed <fish>." on the same line): the other way a catch ends. The
// hook is bare either way (re-baited with FISHING REBAIT ON).
if (!client.loom || !client.loom.fishing || !client.loom.fishing.bare) run_function("fishing_setup", [], "fishing");
client.loom.fishing.bare(/You've landed/.test(String(args[0] || "")) ? "fish landed" : "struggle over");
