var input = (args[1] || "").trim().toLowerCase();
var p = client.patrol;
var names = Object.keys((p && p.areas) || {});
var match = "";
for (var i = 0; i < names.length; i++) { if (names[i].toLowerCase() == input) match = names[i]; }
if (match) {
  var last = get_variable("patrol_last") || {};
  last[match] = Date.now();
  set_variable("patrol_last", last);
  display_notice("[patrolling] Stamped " + match + " as patrolled.", "cyan");
} else {
  display_notice("[patrolling] Area '" + args[1] + "' not found.", "orange");
}