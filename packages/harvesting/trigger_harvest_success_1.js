if (get_variable("pauseTriggers") != "on" && client.loom && client.loom.harvesting) {
  var H = client.loom.harvesting;
  if (H.current) {
    H.inrFor = H.current;
    H.waitBal = true;
    send_command("queue add be inr " + H.current);
  }
}
