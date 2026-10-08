if (!client.loom || !client.loom.harvesting || !client.loom.harvesting.plants) run_function("harvesting_setup", [], "harvesting");
var H = client.loom.harvesting;
H.inRift = true;
H.dashes = 0;
if (H.quiet) gag_current_line();
