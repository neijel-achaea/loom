// harvesting_room -- on entering a room: queue the plants of this environment
// that are below their minimum stock and start harvesting.
if (!client.loom || !client.loom.harvesting || !client.loom.harvesting.plants) run_function("harvesting_setup", [], "harvesting");
var H = client.loom.harvesting;
H.queue = [];
H.current = null;
H.waitBal = false;
if (get_variable("harvesting_on") == "on" && get_variable("pauseTriggers") != "on") {
  var hvList = H.plants[H.here] || [];
  for (var hvI = 0; hvI < hvList.length; hvI++) {
    var hvP = hvList[hvI];
    var hvHave = H.stock[H.map[hvP] || hvP] || 0;
    var hvMin = (H.min[hvP] != null) ? H.min[hvP] : H.defMin;
    if (hvHave < hvMin) H.queue.push(hvP);
  }
  if (H.queue.length) run_function("harvesting_next", [], "harvesting");
}
