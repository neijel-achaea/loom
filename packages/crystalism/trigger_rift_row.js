// IR CRYSTAL rows while a run is reading the rift; TOUCH CRYSTAL once the
// listing has been quiet for 0.4s.
if (!client.loom || !client.loom.crystalism || !client.loom.crystalism.shapes) run_function("crystalism_setup", [], "crystalism");
var CR = client.loom.crystalism;
if (CR.state === "ir") {
  var crRe = /\[\s*(\d+)\]\s*crystal\s+([a-z]+)/g;
  var crM = crRe.exec(args[1]);
  while (crM !== null) {
    if (CR.shapes.indexOf(crM[2]) !== -1) CR.rift[crM[2]] = parseInt(crM[1], 10);
    crM = crRe.exec(args[1]);
  }
  clearTimeout(CR.settle);
  CR.settle = setTimeout(function () { run_function("crystalism_touch", [], "crystalism"); }, 400);
}
