if (!client.wl) { display_notice("[social] not built - trigger any line to build.", "cyan"); }
else {
  var v = args[1].toLowerCase();
  client.wl.debug = (v === "on");
  set_variable("wlDebug", client.wl.debug ? "1" : "0");
  display_notice("[social] debug " + (client.wl.debug ? "ON - heartbeat each poll" : "OFF"), "cyan");
}