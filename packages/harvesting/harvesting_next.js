var H = client.loom.harvesting;
H.waitBal = false;
if (H.queue.length == 0) {
  H.current = null;
} else {
  H.current = H.queue.shift();
  send_command("harvest " + H.current);
}
