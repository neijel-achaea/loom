if (get_variable("pauseTriggers") != "on") {
  var H = client.hv;
  if (H && H.current) {
    H.inrFor = H.current;
    H.waitBal = true;
    send_command("queue add be inr " + H.current);
  }
}