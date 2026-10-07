if (get_variable("pauseTriggers") == "off") {
  var H = client.hv;
  if (H && H.current && !H.waitBal) run_function("hv_next", [], "harvesting");
}