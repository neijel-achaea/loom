if (!client.loom || !client.loom.defcon || !client.loom.defcon.classes) run_function("defcon_setup", [], "defcon");
var D = client.loom.defcon;
// Druids flail a quarterstaff as soon as they wield one.
if (D.cls == "Druid" && get_variable("pauseTriggers") != "on") send_command("flail staff");
