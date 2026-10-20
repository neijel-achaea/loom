// A pearl drops from a corpse: pick it up (left to crystalism while it's
// still installed, so it isn't picked up twice).
if (!client.loom || !client.loom.magi || !client.loom.magi.shapes) run_function("magi_setup", [], "magi");
if (get_variable("magi_pearls") == "on" && get_variable("pauseTriggers") != "on" && !client.loom.magi.oldInstalled().length) send_command("queue add eb get pearl");
