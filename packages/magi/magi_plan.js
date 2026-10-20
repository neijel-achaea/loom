// magi_plan -- water-fill: give each crystal to the shape with the
// fewest so far, then queue REFINE commands, lowest shapes first.
var MG = client.loom.magi;
var mgCounts = {}, mgAdd = {};
for (var mgI = 0; mgI < MG.shapes.length; mgI++) { mgCounts[MG.shapes[mgI]] = MG.rift[MG.shapes[mgI]] || 0; mgAdd[MG.shapes[mgI]] = 0; }
var mgBudget = Math.min(Math.floor(MG.facets / MG.facetsPerCrystal), MG.hardCap, MG.askCap);
if (mgBudget < 1) {
  display_notice("[magi] nothing to refine (" + MG.facets + " facets stored).", "cyan");
  MG.state = "idle";
} else {
  for (var mgB = 0; mgB < mgBudget; mgB++) {
    var mgBest = null, mgVal = Infinity;
    for (var mgJ = 0; mgJ < MG.shapes.length; mgJ++) {
      var mgS = MG.shapes[mgJ];
      if (mgCounts[mgS] + mgAdd[mgS] < mgVal) { mgVal = mgCounts[mgS] + mgAdd[mgS]; mgBest = mgS; }
    }
    mgAdd[mgBest] += 1;
  }
  var mgOrder = MG.shapes.slice();
  mgOrder.sort(function (a, b) { return mgCounts[a] - mgCounts[b]; });
  MG.queue = [];
  var mgParts = [];
  for (var mgK = 0; mgK < mgOrder.length; mgK++) {
    var mgN = mgAdd[mgOrder[mgK]];
    if (mgN > 0) mgParts.push(mgOrder[mgK] + " +" + mgN);
    while (mgN > 0) {
      var mgStep = Math.min(mgN, MG.maxPerCommand);
      MG.queue.push("refine " + mgStep + " " + mgOrder[mgK]);
      mgN -= mgStep;
    }
  }
  display_notice("[magi] refining " + mgBudget + " crystals in " + MG.queue.length + " commands (" + mgParts.join(", ") + ").", "cyan");
  MG.state = "refining";
  run_function("magi_pump", [], "magi");
}
