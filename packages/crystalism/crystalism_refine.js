// crystalism_refine -- start a run: read the rift (IR CRYSTAL), then the
// stored facets (TOUCH CRYSTAL), then plan. CR.askCap is set by the command.
var CR = client.loom.crystalism;
if (CR.state !== "idle") {
  display_notice("[crystalism] a refine run is already going (" + CR.state + "). CRYSTALISM STOP to cancel it.", "orange");
} else {
  CR.state = "ir";
  CR.rift = {};
  CR.facets = 0;
  CR.queue = [];
  clearTimeout(CR.watchdog);
  CR.watchdog = setTimeout(function () { run_function("crystalism_watchdog", [], "crystalism"); }, 8000);
  send_command("ir crystal");
}
