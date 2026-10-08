if (!client.hv) run_function("hv_build", [], "harvesting");
var H = client.hv;
var out = [];
for (var env in H.env) {
  var list = H.env[env];
  for (var i = 0; i < list.length; i++) {
    var p = list[i];
    var have = H.stock[H.map[p] || p];
    var min = (H.min[p] != null) ? H.min[p] : H.defMin;
    if (have == null || have < min) out.push(p + " " + (have == null ? "?" : have) + "/" + min);
  }
}
display_notice("[harvesting] Harvesting " + (get_variable("hv_on") == "on" ? "ON" : "OFF") + " | environment: " + ((client.loom && client.loom.harvesting && client.loom.harvesting.env) || "?"), "cyan");
display_notice(out.length ? "[harvesting] Below minimum: " + out.join(", ") : "Everything at or above minimum.", "cyan");