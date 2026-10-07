// Prune old entries from enemyLocations
var maxAgeDays = 10;
var cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;

var enemyLocations = {};
var stored = get_variable("enemyLocations");
if (stored) { try { enemyLocations = JSON.parse(stored); } catch (e) { enemyLocations = {}; } }

var kept = {};
for (var key in enemyLocations) {
  var rec = enemyLocations[key];
  if (rec && rec.time >= cutoff) { kept[key] = rec; }
  }

set_variable("enemyLocations", JSON.stringify(kept));