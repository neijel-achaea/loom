// TRANSMUTATION AREAS [mineral]: the areas known, by mineral.
if (!client.loom || !client.loom.transmutation || !client.loom.transmutation.envs) run_function("transmutation_setup", [], "transmutation");
var TR = client.loom.transmutation;
var trWant = String(get_variable("transmutation_arg") || "").toLowerCase();
var trBy = {}, trNone = [], trN = 0;
for (var trA in TR.areas) {
  if (!TR.areas.hasOwnProperty(trA)) continue;
  var trM = TR.areas[trA];
  if (!trM) { trNone.push(trA); continue; }
  if (trWant && trM != trWant) continue;
  if (!trBy[trM]) trBy[trM] = [];
  trBy[trM].push(trA);
  trN++;
}
if (!trN && !(trNone.length && !trWant)) {
  TR.say(trWant ? "no area known for " + trWant + " yet." : "no areas known yet: walk a mountain or underground room with TRANSMUTATION ON, or type MINERALS.");
} else {
  for (var trI = 0; trI < TR.minerals.length; trI++) {
    var trK = TR.minerals[trI];
    if (trBy[trK]) TR.say(trK + " (" + (TR.have(trK) == null ? "?" : TR.have(trK)) + "/" + TR.minOf(trK) + "): " + trBy[trK].sort().join(", "));
  }
  if (trNone.length && !trWant) TR.say("no minerals: " + trNone.sort().join(", "));
}
