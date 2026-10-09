// hunting_gold -- gold spilled from a corpse. AUTOGOLD ON picks it up when the
// kill was yours (or announced) in the last 5 seconds, ALL picks up any gold,
// OFF leaves it. Into the backpack when security has one set.
if (!client.loom || !client.loom.hunting || !client.loom.hunting.classes) run_function("hunting_setup", [], "hunting");
var HU = client.loom.hunting;
var huMode = get_variable("hunting_autogold");
var huMine = HU.kill && (new Date().getTime() - HU.kill < 5000);
if (huMode == "all" || (huMode == "on" && huMine)) {
  if (get_variable("pauseTriggers") == "on") {
    display_notice("[hunting] gold left on the ground: triggers are paused.", "orange");
  } else {
    HU.kill = 0;
    send_command("queue add be get gold", 1);
    var huPack = (client.loom.security && client.loom.security.backpack) || get_variable("backpack");
    if (huPack) send_command("queue add be put gold in " + huPack, 1);
  }
}
