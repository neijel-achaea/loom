// ledger_sync -- ask the game for the date. Suppressed while triggers are
// paused, because that is the one thing that must not reach the server. An
// unset pauseTriggers (no loom package) counts as off.
if (!client.loom || !client.loom.ledger || !client.loom.ledger.months) run_function("ledger_setup", [], "ledger");
var pause = get_variable("pauseTriggers");
if (pause !== "on") {
  client.loom.ledger.armed = true;
  send_command("date");
} else {
  if (client.loom.ledger.debug) { display_notice("[ledger] sync skipped - triggers paused", "orange"); }
}
