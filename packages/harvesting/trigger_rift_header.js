if (!client.hv) run_function("hv_build", [], "harvesting");
client.hv.inRift = true;
client.hv.dashes = 0;
if (client.hv.quiet) gag_current_line();