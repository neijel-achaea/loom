// IR CRYSTAL rows while a run is reading the rift; TOUCH CRYSTAL once the
// listing has been quiet for 0.4s.
if (!client.loom || !client.loom.magi || !client.loom.magi.shapes) run_function("magi_setup", [], "magi");
var MG = client.loom.magi;
if (MG.state === "ir") {
  var mgRe = /\[\s*(\d+)\]\s*crystal\s+([a-z]+)/g;
  var mgM = mgRe.exec(args[1]);
  while (mgM !== null) {
    if (MG.shapes.indexOf(mgM[2]) !== -1) MG.rift[mgM[2]] = parseInt(mgM[1], 10);
    mgM = mgRe.exec(args[1]);
  }
  clearTimeout(MG.settle);
  MG.settle = setTimeout(function () { run_function("magi_touch", [], "magi"); }, 400);
}
