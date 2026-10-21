// The blank line after the plant list (#361): the list is over. Gagged, so a
// check leaves no empty line behind, if Nexus hands this line to triggers
// (the prompt may not be); otherwise the prompt itself ends it (P.onPrompt).
if (!client.loom || !client.loom.patrolling || !client.loom.patrolling.expected) run_function("patrolling_setup", [], "patrolling");
var P = client.loom.patrolling;
if (P.active && P.gag) { gag_current_line(); P.finish(); }
