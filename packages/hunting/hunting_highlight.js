// hunting_highlight -- lights the F-keys: a battlerage ability when it is off
// cooldown, the global battlerage cooldown is clear and you have the rage for
// it; the main attack keys (set by hunting_buttons) on balance + equilibrium.
var HU = client.loom.hunting;
var huSlots = HU.slots || {};

for (var huName in huSlots) {
  if (HU.costs[huName] === undefined) continue;
  var huLit = HU.glob && (HU.cd[huName] !== false) && HU.rage >= HU.costs[huName];
  buttons_set_highlight(huSlots[huName], huLit ? 1 : 0);
}

var huMain = HU.main || [];
var huReady = HU.bal && HU.eq;
for (var huI = 0; huI < huMain.length; huI++) {
  buttons_set_highlight(huMain[huI], huReady ? 1 : 0);
}
