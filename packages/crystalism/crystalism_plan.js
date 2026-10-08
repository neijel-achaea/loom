// crystalism_plan -- water-fill: give each crystal to the shape with the
// fewest so far, then queue REFINE commands, lowest shapes first.
var CR = client.loom.crystalism;
var crCounts = {}, crAdd = {};
for (var crI = 0; crI < CR.shapes.length; crI++) { crCounts[CR.shapes[crI]] = CR.rift[CR.shapes[crI]] || 0; crAdd[CR.shapes[crI]] = 0; }
var crBudget = Math.min(Math.floor(CR.facets / CR.facetsPerCrystal), CR.hardCap, CR.askCap);
if (crBudget < 1) {
  display_notice("[crystalism] nothing to refine (" + CR.facets + " facets stored).", "cyan");
  CR.state = "idle";
} else {
  for (var crB = 0; crB < crBudget; crB++) {
    var crBest = null, crVal = Infinity;
    for (var crJ = 0; crJ < CR.shapes.length; crJ++) {
      var crS = CR.shapes[crJ];
      if (crCounts[crS] + crAdd[crS] < crVal) { crVal = crCounts[crS] + crAdd[crS]; crBest = crS; }
    }
    crAdd[crBest] += 1;
  }
  var crOrder = CR.shapes.slice();
  crOrder.sort(function (a, b) { return crCounts[a] - crCounts[b]; });
  CR.queue = [];
  var crParts = [];
  for (var crK = 0; crK < crOrder.length; crK++) {
    var crN = crAdd[crOrder[crK]];
    if (crN > 0) crParts.push(crOrder[crK] + " +" + crN);
    while (crN > 0) {
      var crStep = Math.min(crN, CR.maxPerCommand);
      CR.queue.push("refine " + crStep + " " + crOrder[crK]);
      crN -= crStep;
    }
  }
  display_notice("[crystalism] refining " + crBudget + " crystals in " + CR.queue.length + " commands (" + crParts.join(", ") + ").", "cyan");
  CR.state = "refining";
  run_function("crystalism_pump", [], "crystalism");
}
