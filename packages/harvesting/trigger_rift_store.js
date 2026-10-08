if (!client.loom || !client.loom.harvesting || !client.loom.harvesting.plants) run_function("harvesting_setup", [], "harvesting");
var H = client.loom.harvesting;
H.stock[args[2]] = parseInt(args[3].replace(/,/g, ""), 10);
if (H.inrFor) {
  H.map[H.inrFor] = args[2];
  H.inrFor = null;
}
run_function("harvesting_save", [], "harvesting");
