// patrolling_suggest -- a weighted random area: weight x hours since patrolled
// (never patrolled counts as a week).
var P = client.loom.patrolling;
var paLast = get_variable("patrolling_last") || {};
var paNow = new Date().getTime();
var paNames = Object.keys(P.areas);
var paScores = [];
var paTotal = 0;
for (var paI = 0; paI < paNames.length; paI++) {
  var paH = paLast[paNames[paI]] ? (paNow - paLast[paNames[paI]]) / 3600000 : 168;
  var paS = P.areas[paNames[paI]] * paH;
  paScores.push(paS);
  paTotal += paS;
}
if (paTotal <= 0) {
  display_notice("[patrolling] no areas with a weight above 0.", "orange");
} else {
  var paR = Math.random() * paTotal;
  var paK = 0;
  while (paK < paNames.length - 1 && paR >= paScores[paK]) { paR -= paScores[paK]; paK++; }
  var paPick = paNames[paK];
  var paAgo = paLast[paPick] ? Math.round((paNow - paLast[paPick]) / 3600000) + "h ago" : "never";
  display_notice("[patrolling] suggest: " + paPick + " (weight " + P.areas[paPick] + ", last patrolled " + paAgo + ").", "cyan");
}
