if (!client.loom || !client.loom.patrolling || !client.loom.patrolling.expected) run_function("patrolling_setup", [], "patrolling");
var P = client.loom.patrolling;
if (P.active && P.gag && !/Number of objects/i.test(current_text())) {
  gag_current_line();
  // Friendly gods' shrines and totems aren't reported (#164).
  var paIt = P.look ? P.look.item(current_text()) : null;
  if (!paIt || paIt.stance !== "friendly") P.shrines.push(current_text().trim());
}
