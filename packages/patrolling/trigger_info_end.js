if (!client.loom || !client.loom.patrolling || !client.loom.patrolling.expected) run_function("patrolling_setup", [], "patrolling");
var P = client.loom.patrolling;
if (P.active) { gag_current_line(); P.active = false; P.gag = false; run_function("patrolling_report", [], "patrolling"); }
