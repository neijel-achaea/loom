// patrolling_check -- PLANTS, captured by the triggers below (#361: INFO HERE
// is gone; shrines and totems show in Here from GMCP).
var P = client.loom.patrolling;
if (get_variable("pauseTriggers") != "on") {
  P.present = [];
  P.active = true;
  P.activeAt = Date.now();
  P.gag = false;
  P.prompts = 0;
  send_command("PLANTS", 1);
}
