run_function("tal_ensure", [], "talismans");
// Reset only when a NEW list starts, so a header repeated on later pages
// (or the debounce not yet fired) does not wipe rows already captured.
if (!client.talBuilding) {
  client.tal.reset();
  client.talBuilding = true;
  run_function("tal_sync", [], "talismans");
}
try {
  if (client.talBuildTimer) { clearTimeout(client.talBuildTimer); }
  client.talBuildTimer = setTimeout(function () { client.talBuilding = false; try { run_function("tal_hist_flush", [], "talismans"); } catch (e) {} }, 5000);
} catch (e) {}