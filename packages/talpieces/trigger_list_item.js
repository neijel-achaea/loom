if (!client.loom || !client.loom.talpieces || !client.loom.talpieces.pieces) run_function("talpieces_setup", [], "talpieces");
var TP = client.loom.talpieces;
if (TP.building) {
  // Real list row (paged, with a Set column):
  //   " B 1  a Black Dragon's claw   6   Dragon   blackdragonclaw"
  // also tolerates the parens/no-Set variant: " B (1) a Red Dragon's scale 2 reddragonscale"
  //   args[1] = count, args[3] = level, args[4] = colour, args[5] = piece type.
  var count = args[1] ? parseInt(args[1], 10) : 1;
  var level = parseInt(args[3], 10);
  var color = String(args[4]).toLowerCase();
  var type  = String(args[5]).toLowerCase();
  if (type !== "pieces" && !isNaN(count) && !isNaN(level)) {
    TP.add(color, type, level, count);
    run_function("talpieces_sync", [], "talpieces");
  }
  // Debounced end-of-list: 5s after the last row/MORE, stop capturing.
  // The callback names client.loom.talpieces in full: TP may mean something
  // else by the time it runs.
  try {
    if (TP.buildTimer) { clearTimeout(TP.buildTimer); }
    TP.buildTimer = setTimeout(function () { client.loom.talpieces.building = false; try { run_function("talpieces_flush", [], "talpieces"); } catch (e) {} }, 5000);
  } catch (e) { TP.building = false; }
}