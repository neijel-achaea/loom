if (get_variable("pauseTriggers") != "on") {
  var H = client.hv;
  if (H && H.waitBal) run_function("hv_next", [], "harvesting");
  else if (H && H.current) send_command("harvest " + H.current);
}