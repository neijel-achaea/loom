var P = client.loom.patrolling;
var paEnv = P.room.env || "unknown";
// What PLANTS found here, for the look (#166); loom redraws Here.
P.plantsHere = { id: P.room.id, env: paEnv, present: (P.present || []).slice() };
if (client.loom.notify) client.loom.notify("patrolling");
if (P.learn) {
  P.learn = false;
  display_notice('[patrolling] table entry ->  "' + paEnv + '": ' + JSON.stringify(P.present) + ',', "cyan");
} else {
  var paExp = P.expected[paEnv];
  var paOut = [];
  var paCol = "lime";
  if (!paExp) {
    paOut.push("no expected list for '" + paEnv + "' (PATROLLING LEARN prints one)");
    paCol = "orange";
  } else {
    var paMiss = [];
    for (var paI = 0; paI < paExp.length; paI++) { if (P.present.indexOf(paExp[paI]) < 0) paMiss.push(paExp[paI]); }
    if (paMiss.length) { paOut.push("missing " + paMiss.join(", ")); paCol = "orange"; }
    else paOut.push("all present");
  }
  display_notice("[patrolling] " + paEnv + ": " + paOut.join("  |  "), paCol);
}
