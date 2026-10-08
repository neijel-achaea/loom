// Replanting: write it to the clan log, dated when ledger knows the date.
if (!client.loom || !client.loom.patrolling || !client.loom.patrolling.expected) run_function("patrolling_setup", [], "patrolling");
var P = client.loom.patrolling;
var paClan = get_variable("patrolling_clan");
if (paClan && get_variable("pauseTriggers") != "on") {
  run_function("patrolling_date", [], "patrolling");
  send_command("writelog " + paClan + " " + (P.dateTxt || "date not known") + " - Replanted " + args[1] + " at " + P.room.name + " (" + P.room.id + ") in " + P.room.area);
}
