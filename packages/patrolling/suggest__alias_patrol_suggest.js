var p = client.patrol;
var last = get_variable("patrol_last") || {};
var now = Date.now();
var names = Object.keys((p && p.areas) || {});
var scores = [];
var total = 0;
for (var i = 0; i < names.length; i++) {
  var h = last[names[i]] ? (now - last[names[i]]) / 3600000 : 168;   // never patrolled = treat as a week stale
  var s = p.areas[names[i]] * h;
  scores.push(s);
  total += s;
}
if (total <= 0) {
  display_notice("[patrolling] No areas configured - add some to p.areas in onLoad.", "#ffcc55");
} else {
  var r = Math.random() * total;
  var k = 0;
  while (k < names.length - 1 && r >= scores[k]) { r -= scores[k]; k++; }
  var pick = names[k];
  var ago = last[pick] ? Math.round((now - last[pick]) / 3600000) + "h ago" : "never";
  display_notice("[patrolling] Suggest: " + pick + " (weight " + p.areas[pick] + ", last patrolled " + ago + ")", "cyan");
}