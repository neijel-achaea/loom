if (!client.loom || !client.loom.crystalism || !client.loom.crystalism.shapes) run_function("crystalism_setup", [], "crystalism");
var CR = client.loom.crystalism;
if (CR.state === "touch") {
  CR.facets = parseInt(args[1], 10);
  clearTimeout(CR.watchdog);
  run_function("crystalism_plan", [], "crystalism");
}
