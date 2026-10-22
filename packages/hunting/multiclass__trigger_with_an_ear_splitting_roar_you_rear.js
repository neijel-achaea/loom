if (!client.loom || !client.loom.hunting || !client.loom.hunting.classes) run_function("hunting_setup", [], "hunting");
var HU = client.loom.hunting;
// Dragonform is up (the roar, or the end of an elder dragon's "Reveling in
// your total mastery of the form… You are Dragon!", matched on its last
// words because the game may wrap the long line): fresh rage cooldowns, resume packages, after-form command.
HU.cd = {};
HU.glob = true;
set_variable("pauseTriggers", "off");
var huAf = get_variable("hunting_after_form");
if (huAf) send_command(huAf);
