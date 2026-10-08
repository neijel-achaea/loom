// Lightning strike: tell the clan where, when a clan is set.
if (!client.loom || !client.loom.patrolling || !client.loom.patrolling.expected) run_function("patrolling_setup", [], "patrolling");
var P = client.loom.patrolling;
var paClan = get_variable("patrolling_clan");
if (paClan && get_variable("pauseTriggers") != "on") {
  send_command("clan switch " + paClan);
  send_command("clt Lightning strike at " + (P.room.area || "an unknown area"));
}
