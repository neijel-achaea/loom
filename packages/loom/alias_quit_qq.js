// Pre-quit housekeeping. Closing the huntstats hunt is integration work and
// moves into the v0.4 integrations; for now it only runs if huntstats is
// there: v0.2 registers itself, the older one kept its hunt in client.track.
if (client.loom && client.loom.registry && client.loom.registry.huntstats) run_function("huntstats_finalize", [], "huntstats");
else if (client.track) run_function("hs_finalize", [], "huntstats");

// Pre-quit commands
send_command("inr all");
send_command("pg");

send_command("quit", 1);
