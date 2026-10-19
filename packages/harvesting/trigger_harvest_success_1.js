if (get_variable("pauseTriggers") != "on" && client.loom && client.loom.harvesting) {
  var H = client.loom.harvesting;
  if (H.current) {
    H.inrFor = H.current;
    H.waitBal = true;
    H.sentAt = Date.now();
    send_command("queue add be inr " + H.current);
  }
}
