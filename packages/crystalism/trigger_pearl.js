// A pearl drops from a corpse: pick it up.
if (get_variable("crystalism_pearls") == "on" && get_variable("pauseTriggers") != "on") send_command("queue add eb get pearl");
