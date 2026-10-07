var areas = {};
try { areas = JSON.parse(get_variable("hs_areas")) || {}; } catch (e) { areas = {}; }
var arr = [];
for (var k in areas) {
  if (areas.hasOwnProperty(k)) {
    var a = areas[k]; var hrs = a.ms / 3600000;
    arr.push({ area: k, xpHr: hrs > 0 ? Math.round(a.xp / hrs) : 0, goldHr: hrs > 0 ? Math.round(a.gold / hrs) : 0, sessions: a.sessions, ms: a.ms });
  }
}
if (arr.length === 0) { display_notice("[huntstats] no area history yet", "yellow"); }
else {
  arr.sort(function (x, y) { return y.ms - x.ms; });
  display_notice("[huntstats] Areas by total ime (lifetime):", "white");
  for (var j = 0; j < arr.length; j++) {
    var r = arr[j]; var m = Math.floor(r.ms / 60000); var dur = Math.floor(m / 60) + "h " + (m % 60) + "m";
    display_notice("  " + r.area + " - " + r.xpHr.toLocaleString() + " xp/hr, " + r.goldHr.toLocaleString() + " gold/hr (" + r.sessions + " sessions, " + dur + ")");
  }
}