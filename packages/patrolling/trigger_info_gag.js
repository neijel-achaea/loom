if (!client.loom || !client.loom.patrolling || !client.loom.patrolling.expected) run_function("patrolling_setup", [], "patrolling");
var P = client.loom.patrolling;
if (P.active && P.gag && !/Number of objects/i.test(current_text())) gag_current_line();
