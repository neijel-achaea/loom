if (!client.loom || !client.loom.harvesting || !client.loom.harvesting.plants) run_function("harvesting_setup", [], "harvesting");
var H = client.loom.harvesting;
var hvOut = [];
var hvSeen = {};
for (var hvEnv in H.plants) {
  var hvList = H.plants[hvEnv];
  for (var hvI = 0; hvI < hvList.length; hvI++) {
    var hvP = hvList[hvI];
    if (hvSeen[hvP]) continue;
    hvSeen[hvP] = true;
    var hvHave = H.stock[H.map[hvP] || hvP];
    var hvMin = (H.min[hvP] != null) ? H.min[hvP] : H.defMin;
    if (hvHave == null || hvHave < hvMin) hvOut.push(hvP + " " + (hvHave == null ? "?" : hvHave) + "/" + hvMin);
  }
}
display_notice("[harvesting] " + (get_variable("harvesting_on") == "on" ? "ON" : "OFF") + ", default minimum " + H.defMin + ", environment here: " + (H.here || "?") + ". HARVESTING HELP for commands.", "cyan");
display_notice(hvOut.length ? "[harvesting] below minimum: " + hvOut.join(", ") : "[harvesting] everything at or above its minimum.", "cyan");
