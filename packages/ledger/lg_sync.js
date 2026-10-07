// Ask the game for the date. Suppressed while triggers are paused,
// because that is the one thing that must not reach the server.
run_function("lg_build", [], "ledger");
var pause = get_variable("pauseTriggers");
if (pause == "off") {
  client.lg.armed = true;
  send_command("date");
} else {
  if (client.lg.debug) { display_notice("[ledger] sync skipped - triggers paused", "orange"); }
}
