if (!client.loom || !client.loom.talpieces || !client.loom.talpieces.pieces) run_function("talpieces_setup", [], "talpieces");
var TP = client.loom.talpieces;
// Reset only when a NEW list starts, so a header repeated on later pages
// (or the debounce not yet fired) does not wipe rows already captured.
if (!TP.building) {
  TP.reset();
  TP.building = true;
  run_function("talpieces_sync", [], "talpieces");
}
try {
  if (TP.buildTimer) { clearTimeout(TP.buildTimer); }
  TP.buildTimer = setTimeout(function () { client.loom.talpieces.building = false; try { run_function("talpieces_flush", [], "talpieces"); } catch (e) {} }, 5000);
} catch (e) {}