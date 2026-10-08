var S = client.loom.sigils;
var on = get_variable("sigils_on");
var thr = get_variable("sigils_threshold");
var n = Object.keys(get_variable("sigils_flagged") || {}).length;
var ni = Object.keys(get_variable("sigils_ignored") || {}).length;
display_notice("[sigils] watch " + (on ? "ON" : "OFF") + ", threshold " + thr + " months, "
  + n + " room(s) flagged, " + ni + " ignored. SIGILS HELP for commands.", on ? "lime" : "cyan");
