// Pre-quit housekeeping. Closing the huntstats session is integration work
// and moves into the v0.4 integrations; for now it only runs if huntstats is
// there (client.track is huntstats' session state).
if (client.track) run_function("hs_finalize", [], "huntstats");

// Pre-quit commands
send_command("inr all");
send_command("pg");

send_command("quit", 1);
