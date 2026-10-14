// social_flush -- end of a QW capture (its "Plus another" line, or the 30s
// safety when no reply came): compare with the previous set and announce
// watched names that came online or went offline.
var S = client.loom.social;
S.capturing = false;
clearTimeout(S.safetyT);
clearTimeout(S.flushT);
var soText = S.buf.join(" ").replace(/Plus another[\s\S]*$/, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
S.buf = [];
var soParts = soText.split(/,|\band\b/);
var soNames = [];
for (var soI = 0; soI < soParts.length; soI++) {
  var soS = soParts[soI].replace(/[^A-Za-z]/g, "");
  if (/^[A-Z][a-z]+$/.test(soS)) soNames.push(soS.toLowerCase());
}
S.lastCount = soNames.length;
if (!soNames.length) {
  if (S.reportOnce) { display_notice("[social] poll returned no names (kept the previous set).", "cyan"); S.reportOnce = false; }
} else {
  var soNow = {};
  for (var soJ = 0; soJ < soNames.length; soJ++) soNow[soNames[soJ]] = true;
  var soUp = 0, soDown = 0, soPrimed = false;
  if (S.prev === null) {
    soPrimed = true;
  } else {
    // name -> colour of its highest-priority watched group
    var soIdx = {};
    for (var soG = 0; soG < S.groups.length; soG++) {
      var soGr = S.groups[soG];
      if (!S.watch[soGr]) continue;
      for (var soN in S.lists[soGr]) { if (!soIdx[soN]) soIdx[soN] = S.color[soGr]; }
    }
    for (var soA in soNow) {
      if (!S.prev[soA]) { soUp++; if (soIdx[soA]) display_notice("[social] " + soA.charAt(0).toUpperCase() + soA.slice(1) + " has awoken.", soIdx[soA]); }
    }
    for (var soB in S.prev) {
      if (!soNow[soB]) { soDown++; if (soIdx[soB]) display_notice("[social] " + soB.charAt(0).toUpperCase() + soB.slice(1) + " has drifted into slumber.", soIdx[soB]); }
    }
  }
  S.prev = soNow;
  if (S.reportOnce || S.debug) {
    display_notice(soPrimed ? "[social] primed with " + soNames.length + " names." : "[social] poll: " + soUp + " new, " + soDown + " gone (" + soNames.length + " online).", "cyan");
    S.reportOnce = false;
  }
}
