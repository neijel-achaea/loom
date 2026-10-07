run_function("tal_ensure", [], "talismans");
if (client.talBuilding) {
  send_command("MORE");
  try {
    if (client.talBuildTimer) { clearTimeout(client.talBuildTimer); }
    client.talBuildTimer = setTimeout(function () { client.talBuilding = false; try { run_function("tal_hist_flush", [], "talismans"); } catch (e) {} }, 5000);
  } catch (e) {}
}