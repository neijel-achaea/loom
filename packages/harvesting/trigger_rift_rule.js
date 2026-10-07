var H = client.hv;
if (H && H.inRift) {
  if (H.quiet) gag_current_line();
  H.dashes++;
  if (H.dashes >= 2) {
    H.inRift = false;
    if (H.quiet) {
      H.quiet = false;
      run_function("hv_room", [], "harvesting");
    }
  }
}