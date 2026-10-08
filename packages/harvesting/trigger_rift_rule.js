if (client.loom && client.loom.harvesting && client.loom.harvesting.inRift) {
  var H = client.loom.harvesting;
  if (H.quiet) gag_current_line();
  H.dashes++;
  if (H.dashes >= 2) {
    H.inRift = false;
    if (H.quiet) {
      H.quiet = false;
      run_function("harvesting_room", [], "harvesting");
    }
  }
}
