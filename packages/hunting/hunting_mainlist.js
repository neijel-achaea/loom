// hunting_mainlist -- the current class's main attacks into HU.mainList
// ([{ name, label, cmd, added }]) and the one in use into HU.mainNow.
// Order: the class file's "mains", then those added with HUNTING MAIN x = cmd
// (an added one with the same name replaces the file's). In use: the one
// picked with HUNTING MAIN, else the class's default for your spec
// (specMain) or morph (morphMain), else the first. A spec or morph change
// drops the hand-picked one (see onGMCP).
var HU = client.loom.hunting;
var mlEntry = HU.classes[HU.cls] || {};
var mlFile = mlEntry.mains || {};
var mlAdded = HU.mainsAdded[HU.cls] || {};
var mlByName = {};
HU.mainList = [];
for (var mlK in mlFile) {
  var mlRow = { name: mlK, label: mlFile[mlK][0], cmd: mlFile[mlK][1], added: false };
  mlByName[mlK] = mlRow;
  HU.mainList.push(mlRow);
}
for (var mlA in mlAdded) {
  // Typed in game: queued on balance and equilibrium unless it is a queue
  // command already.
  var mlCmd = /^queue\s/i.test(mlAdded[mlA]) ? mlAdded[mlA] : "queue add eb!wu!t!p " + mlAdded[mlA];
  var mlLabel = mlA.charAt(0).toUpperCase() + mlA.substring(1);
  if (mlByName[mlA]) { mlByName[mlA].cmd = mlCmd; mlByName[mlA].added = true; }
  else { var mlNew = { name: mlA, label: mlLabel, cmd: mlCmd, added: true }; mlByName[mlA] = mlNew; HU.mainList.push(mlNew); }
}
var mlPick = HU.mains[HU.cls];
if (!mlPick || !mlByName[mlPick]) mlPick = (mlEntry.specMain && HU.spec && mlEntry.specMain[HU.spec]) || "";
if (!mlPick || !mlByName[mlPick]) mlPick = (mlEntry.morphMain && HU.morph && mlEntry.morphMain[HU.morph]) || "";
if (!mlPick || !mlByName[mlPick]) mlPick = HU.mainList.length ? HU.mainList[0].name : "";
HU.mainNow = mlPick ? mlByName[mlPick] : null;
