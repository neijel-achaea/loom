// social_poll -- every S.interval (5s unless SOCIAL POLL EVERY): send QW and capture its lines (trigger_line).
// The capture ends on QW's own last line, "Plus another N whose presence you
// cannot fully sense (M total)." or just "(M total)." (#75), so a lagged reply is still gagged.
// While a capture is open no new QW is sent; a reply that never comes (a
// disconnect) is given up after 30s.
var S = client.loom.social;
if (S && (get_variable("social_poll") == "on" || S.reportOnce) && get_variable("pauseTriggers") != "on") {
  if (S.capturing) {
    if (S.debug) display_notice("[social] tick skipped: still waiting for the last QW", "cyan");
  } else {
    if (S.debug) display_notice("[social] tick -> qw", "cyan");
    S.buf = [];
    S.capturing = true;
    clearTimeout(S.safetyT);
    S.safetyT = setTimeout(function () { run_function("social_flush", [], "social"); }, 30000);
    send_command("qw");
  }
}
