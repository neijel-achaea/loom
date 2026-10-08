if (get_variable("pauseTriggers") != "on") {
  var H = client.hv;
  if (H && H.current && !H.waitBal) run_function("hv_next", [], "harvesting");
}