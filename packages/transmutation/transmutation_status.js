if (!client.loom || !client.loom.transmutation || !client.loom.transmutation.envs) run_function("transmutation_setup", [], "transmutation");
var TR = client.loom.transmutation;
var trHere = TR.areas[TR.area];
var trWhere = !TR.area ? "?" : TR.area + (trHere === undefined ? " (mineral not known yet)" : trHere ? " (" + trHere + ")" : " (no minerals)");
TR.say((TR.on ? "ON" : "OFF") + ", default minimum " + TR.defMin + ", area here: " + trWhere + (TR.envs[TR.here] ? "" : ", not a place to extract") + ". TRANSMUTATION HELP for commands.");
// Short: the minerals of areas you know, and any with a minimum of its own.
var trOut = [], trSeen = {};
for (var trA in TR.areas) { if (TR.areas.hasOwnProperty(trA) && TR.areas[trA]) trSeen[TR.areas[trA]] = true; }
for (var trK in TR.min) { if (TR.min.hasOwnProperty(trK)) trSeen[trK] = true; }
for (var trI = 0; trI < TR.minerals.length; trI++) {
  var trM = TR.minerals[trI];
  if (!trSeen[trM]) continue;
  var trH = TR.have(trM);
  if (trH == null || trH < TR.minOf(trM)) trOut.push(trM + " " + (trH == null ? "?" : trH) + "/" + TR.minOf(trM));
}
TR.say(trOut.length ? "below minimum: " + trOut.join(", ") : "every mineral of the areas you know is at or above its minimum.");
