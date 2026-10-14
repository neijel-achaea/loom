var target = (args[1] || "").toLowerCase();

if (!target) {
  display_notice("[reclamation] Usage: WHEREIS <name>", "orange");
} else {
  var enemyLocations = {};
  var stored = get_variable("enemyLocations");
  if (stored) { try { enemyLocations = JSON.parse(stored); } catch (e) {} }

  var rec = enemyLocations[target];
  if (rec) {
    var mins = Math.round((Date.now() - rec.time) / 60000);
    display_notice("[reclamation] " + rec.name + " last seen at " + rec.location + " (" + mins + "m ago).", "cyan");
  } else {
    display_notice("[reclamation] No Eleusis sighting recorded for " + target + ".", "cyan");
  }
}