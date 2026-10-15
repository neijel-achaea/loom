// Patrolling follows the room itself, and checks each new room when ON.
if (!client.loom || !client.loom.patrolling || !client.loom.patrolling.expected) run_function("patrolling_setup", [], "patrolling");
var P = client.loom.patrolling;
if (args.gmcp_method == "Room.Info") {
  var paG = args.gmcp_args || {};
  P.room = { id: paG.num, name: paG.name || "", area: paG.area || "", env: paG.environment || "" };
  P.active = false;
  P.gag = false;
  // What PLANTS found belongs to the room it was found in, and only until you
  // leave it: coming back with patrolling off shows nothing (#166).
  P.plantsHere = null;
  if (get_variable("patrolling_on") == "on") run_function("patrolling_check", [], "patrolling");
}
