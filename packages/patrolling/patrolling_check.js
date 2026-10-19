// patrolling_check -- PLANTS and INFO HERE, captured by the triggers below.
var P = client.loom.patrolling;
if (get_variable("pauseTriggers") != "on") {
  P.present = [];
  P.shrines = [];
  P.active = true;
  P.activeAt = Date.now();
  P.gag = false;
  send_command("PLANTS", 1);
  send_command("INFO HERE", 1);
}
