// magi_refine -- start a run: read the rift (IR CRYSTAL), then the
// stored facets (TOUCH CRYSTAL), then plan. MG.askCap is set by the command.
var MG = client.loom.magi;
if (MG.state !== "idle") {
  display_notice("[magi] a refine run is already going (" + MG.state + "). MAGI REFINE STOP to cancel it.", "orange");
} else {
  MG.state = "ir";
  MG.rift = {};
  MG.facets = 0;
  MG.queue = [];
  clearTimeout(MG.watchdog);
  MG.watchdog = setTimeout(function () { run_function("magi_watchdog", [], "magi"); }, 8000);
  send_command("ir crystal");
}
