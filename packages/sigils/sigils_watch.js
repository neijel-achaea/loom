var S = client.loom.sigils;
var mode = S.argv[0] || "";
var next = get_variable("sigils_on") ? false : true;
if (mode === "on") next = true;
if (mode === "off") next = false;
var thr = get_variable("sigils_threshold");

run_function("sigils_settle", [], "sigils");
set_variable("sigils_on", next);
S.queue = [];
S.await = null;
if (next) {
  display_notice("[sigils] watch ON. Probing every room, flagging under " + thr + " months (monolith and flame).", "lime");
} else {
  var n = Object.keys(get_variable("sigils_flagged") || {}).length;
  display_notice("[sigils] watch OFF. " + n + " room(s) flagged. SIGILS REPORT to see them.", "lime");
}
