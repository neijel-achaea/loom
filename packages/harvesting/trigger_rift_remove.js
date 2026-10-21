// Taking plants out of the rift (OUTR, or curing pulling from it) states the
// new total, as storing does (#356): keep the stock in step with the game.
if (!client.loom || !client.loom.harvesting || !client.loom.harvesting.plants) run_function("harvesting_setup", [], "harvesting");
var H = client.loom.harvesting;
H.stock[args[2]] = parseInt(args[3].replace(/,/g, ""), 10);
run_function("harvesting_save", [], "harvesting");
