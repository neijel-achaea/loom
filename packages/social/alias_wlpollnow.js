if (!client.wl) { display_notice("[social] not ready yet - trigger any line to build", "cyan"); }
else {
  client.wl.reportOnce = true;
  client.wl.enabled = true;
  client.wl.buf = [];
  client.wl.capturing = true;
  clearTimeout(client.wl.safetyT);
  client.wl.safetyT = setTimeout(function () { client.wl.flush(); }, 1500);
  send_command("qw");
}