if (!client.hv) run_function("hv_build", [], "harvesting");
var H = client.hv;
var a = (args[1] || "status").toLowerCase().trim().split(/\s+/);
if (a[0] == "on") {
  set_variable("hv_on", "on");
  H.quiet = true;
  send_command("ir herbs");
  display_notice("[harvesting] Harvesting ON - refreshing rift stock.", "cyan");
} else if (a[0] == "off") {
  set_variable("hv_on", "off");
  H.queue = [];
  H.current = null;
  H.waitBal = false;
  display_notice("[harvesting] Harvesting OFF.", "cyan");
} else if (a[0] == "min" && a.length == 3) {
  if (a[2] == "default") delete H.min[a[1]];
  else H.min[a[1]] = parseInt(a[2], 10);
  run_function("hv_save", [], "harvesting");
  display_notice("[harvesting] Minimum for " + a[1] + ": " + (H.min[a[1]] != null ? H.min[a[1]] : H.defMin + " (default)"), "cyan");
} else if (a[0] == "reset") {
  delete client.hv;
  run_function("hv_build", [], "harvesting");
  display_notice("[harvesting] Harvesting state rebuilt from saved variables.", "cyan");
} else {
  run_function("hv_status", [], "harvesting");
}