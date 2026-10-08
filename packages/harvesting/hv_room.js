// Called from harvesting's own onGMCP on every room change.
if (!client.hv) run_function("hv_build", [], "harvesting");
var H = client.hv;
H.queue = [];
H.current = null;
H.waitBal = false;
if (get_variable("hv_on") == "on" && get_variable("pauseTriggers") != "on") {
  var env = String((client.loom && client.loom.harvesting && client.loom.harvesting.env) || "").toLowerCase();
  var list = H.env[env] || [];
  for (var i = 0; i < list.length; i++) {
    var p = list[i];
    var have = H.stock[H.map[p] || p] || 0;
    var min = (H.min[p] != null) ? H.min[p] : H.defMin;
    if (have < min) H.queue.push(p);
  }
  if (H.queue.length) run_function("hv_next", [], "harvesting");
}