run_function("tal_ensure", [], "talismans");
if (client.talBuilding) {
  // Real list row (paged, with a Set column):
  //   " B 1  a Black Dragon's claw   6   Dragon   blackdragonclaw"
  // also tolerates the parens/no-Set variant: " B (1) a Red Dragon's scale 2 reddragonscale"
  //   args[1] = count, args[3] = level, args[4] = colour, args[5] = piece type.
  var count = args[1] ? parseInt(args[1], 10) : 1;
  var level = parseInt(args[3], 10);
  var color = String(args[4]).toLowerCase();
  var type  = String(args[5]).toLowerCase();
  if (type !== "pieces" && !isNaN(count) && !isNaN(level)) {
    client.tal.add(color, type, level, count);
    run_function("tal_sync", [], "talismans");
  }
  // Debounced end-of-list: 5s after the last row/MORE, stop capturing.
  // Only touches client.* so it is safe inside a timer callback.
  try {
    if (client.talBuildTimer) { clearTimeout(client.talBuildTimer); }
    client.talBuildTimer = setTimeout(function () { client.talBuilding = false; try { run_function("tal_hist_flush", [], "talismans"); } catch (e) {} }, 5000);
  } catch (e) { client.talBuilding = false; }
}