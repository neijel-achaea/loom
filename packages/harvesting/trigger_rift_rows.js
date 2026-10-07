var H = client.hv;
if (H && H.inRift) {
  if (H.quiet) gag_current_line();
  var re = /\[\s*([\d,]+)\]\s+(.+?)(?=\s+\[|\s*$)/g;
  var m;
  while ((m = re.exec(args[0])) !== null) {
    H.stock[m[2]] = parseInt(m[1].replace(/,/g, ""), 10);
  }
  run_function("hv_save", [], "harvesting");
}