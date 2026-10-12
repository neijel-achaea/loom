if (!client.loom || !client.loom.hunting || !client.loom.hunting.classes) run_function("hunting_setup", [], "hunting");
var HU = client.loom.hunting;
// The list means "off cooldown AND affordable": an ability missing from it
// is only known to be on cooldown if you could have afforded it.
var huAvail = {};
var huList = args[1].replace(/\.\s*$/, "").split(/,\s*/);
for (var huI = 0; huI < huList.length; huI++) { huAvail[huList[huI]] = true; }
// Shieldbreaks have no cooldown, so their absence from the list says nothing.
var huRz = (HU.classes[HU.cls] && HU.classes[HU.cls].razes) || [];
for (var huName in HU.costs) {
  if (huRz.indexOf(huName) >= 0) continue;
  if (huAvail[huName]) {
    HU.cd[huName] = true;
  } else if (HU.rage >= HU.costs[huName]) {
    HU.cd[huName] = false;
  }
}
HU.glob = true;
run_function("hunting_highlight", [], "hunting");
