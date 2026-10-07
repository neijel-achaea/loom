var days = parseInt(args[1], 10);
if (isNaN(days) || days < 1) { days = 1; }

var enemyLocations = {};
var stored = get_variable("enemyLocations");
if (stored) { try { enemyLocations = JSON.parse(stored); } catch (e) {} }

var cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
var recent = [];

for (var key in enemyLocations) {
  var rec = enemyLocations[key];
  if (rec && rec.time >= cutoff) { recent.push(rec); }
}

var windowLabel = (days === 1) ? "24h" : days + " days";

if (recent.length === 0) {
  display_notice("[reclamation] No Eleusis enemy sightings in the last " + windowLabel + ".", "cyan");
} else {
  recent.sort(function (a, b) { return b.time - a.time; });   // most recent first
  display_notice("[reclamation] Eleusis sightings (last " + windowLabel + "):", "cyan");
  for (var i = 0; i < recent.length; i++) {
    var r = recent[i];
    var mins = Math.round((Date.now() - r.time) / 60000);
    var age = mins < 60 ? mins + "m" : Math.round(mins / 60) + "h";
    display_notice("  " + r.name + " - " + r.location + " (" + age + " ago)", "cyan");
  }
}