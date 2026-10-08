if (client.loom && client.loom.harvesting && client.loom.harvesting.inRift) {
  var H = client.loom.harvesting;
  if (H.quiet) gag_current_line();
  var hvRe = /\[\s*([\d,]+)\]\s+(.+?)(?=\s+\[|\s*$)/g;
  var hvM;
  while ((hvM = hvRe.exec(args[0])) !== null) {
    H.stock[hvM[2]] = parseInt(hvM[1].replace(/,/g, ""), 10);
  }
  run_function("harvesting_save", [], "harvesting");
}
