var v = args[1].toLowerCase();
if (!client.wl) { display_notice("[social] not ready yet - trigger any line to build.", "cyan"); }
else {
  client.wl.enabled = (v === "on");
  set_variable("wlEnabled", client.wl.enabled ? "1" : "0");
  display_notice("[social] polling " + (client.wl.enabled ? "enabled" : "disabled"), "cyan");
}