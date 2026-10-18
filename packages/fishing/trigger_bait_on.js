// "You carefully thread <bait> onto the hook of <pole>." (also after
// "Throwing away your existing bait, "): the hook is baited, so CL only casts.
if (!client.loom || !client.loom.fishing) run_function("fishing_setup", [], "fishing");
client.loom.fishing.baited = true;
client.loom.fishing.rebaiting = false;
