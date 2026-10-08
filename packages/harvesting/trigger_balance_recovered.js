if (get_variable("pauseTriggers") != "on" && client.loom && client.loom.harvesting) {
  var H = client.loom.harvesting;
  if (H.waitBal) run_function("harvesting_next", [], "harvesting");
  else if (H.current) send_command("harvest " + H.current);
}
