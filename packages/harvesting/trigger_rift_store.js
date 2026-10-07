if (!client.hv) run_function("hv_build", [], "harvesting");
var H = client.hv;
H.stock[args[2]] = parseInt(args[3].replace(/,/g, ""), 10);
if (H.inrFor) {
  H.map[H.inrFor] = args[2];
  H.inrFor = null;
}
run_function("hv_save", [], "harvesting");