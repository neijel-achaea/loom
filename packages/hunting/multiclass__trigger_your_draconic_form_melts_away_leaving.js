if (!client.loom || !client.loom.hunting || !client.loom.hunting.classes) run_function("hunting_setup", [], "hunting");
var HU = client.loom.hunting;
// Back to lesserform: fresh rage cooldowns, after-form command.
HU.cd = {};
var huAf = get_variable("hunting_after_form");
if (huAf) send_command(huAf);
