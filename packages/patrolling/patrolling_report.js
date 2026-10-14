var P = client.loom.patrolling;
var paEnv = P.room.env || "unknown";
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
  if (P.shrines.length) { paOut.push("SHRINE/TOTEM: " + P.shrines.join(" ; ")); paCol = "orange"; }
  display_notice("[patrolling] " + paEnv + ": " + paOut.join("  |  "), paCol);
}
