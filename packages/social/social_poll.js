// social_poll -- every 5s: send QW and capture its lines (trigger_qw).
var S = client.loom.social;
if (S && (get_variable("social_poll") == "on" || S.reportOnce) && get_variable("pauseTriggers") != "on") {
  if (S.debug) display_notice("[social] tick -> qw", "cyan");
  S.buf = [];
  S.capturing = true;
  clearTimeout(S.safetyT);
  S.safetyT = setTimeout(function () { run_function("social_flush", [], "social"); }, 1500);
  send_command("qw");
}
