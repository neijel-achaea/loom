if (!client.loom || !client.loom.magi || !client.loom.magi.shapes) run_function("magi_setup", [], "magi");
var MG = client.loom.magi;
if (MG.state === "touch") {
  MG.facets = parseInt(args[1], 10);
  clearTimeout(MG.watchdog);
  run_function("magi_plan", [], "magi");
}
