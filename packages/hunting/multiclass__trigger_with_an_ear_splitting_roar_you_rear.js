if (!client.loom || !client.loom.hunting || !client.loom.hunting.classes) run_function("hunting_setup", [], "hunting");
var HU = client.loom.hunting;
// Dragonform is up (the roar, or an elder dragon's "Reveling in your total
// mastery of the form…"): fresh rage cooldowns, resume packages, after-form command.
HU.cd = {};
set_variable("pauseTriggers", "off");
var huAf = get_variable("hunting_after_form");
if (huAf) send_command(huAf);
