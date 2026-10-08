if (!client.loom || !client.loom.patrolling || !client.loom.patrolling.expected) run_function("patrolling_setup", [], "patrolling");
var P = client.loom.patrolling;
if (P.active) { P.present.push(args[1]); gag_current_line(); }
