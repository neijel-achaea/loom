if (!client.loom || !client.loom.talpieces || !client.loom.talpieces.pieces) run_function("talpieces_setup", [], "talpieces");
var TP = client.loom.talpieces;
if (TP.building) {
  send_command("MORE");
  try {
    if (TP.buildTimer) { clearTimeout(TP.buildTimer); }
    TP.buildTimer = setTimeout(function () { client.loom.talpieces.building = false; try { run_function("talpieces_flush", [], "talpieces"); } catch (e) {} }, 5000);
  } catch (e) {}
}