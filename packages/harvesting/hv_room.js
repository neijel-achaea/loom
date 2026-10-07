// Call from your onGMCP handler on room change:
//   run_function("hv_room", [], "harvesting");
if (!client.hv) run_function("hv_build", [], "harvesting");
var H = client.hv;
H.queue = [];
H.current = null;
H.waitBal = false;
if (get_variable("hv_on") == "on" && get_variable("pauseTriggers") == "off") {
  var env = String(get_variable("currentEnvironment") || "").toLowerCase();
  var list = H.env[env] || [];
  for (var i = 0; i < list.length; i++) {
    var p = list[i];
    var have = H.stock[H.map[p] || p] || 0;
    var min = (H.min[p] != null) ? H.min[p] : H.defMin;
    if (have < min) H.queue.push(p);
  }
  if (H.queue.length) run_function("hv_next", [], "harvesting");
}