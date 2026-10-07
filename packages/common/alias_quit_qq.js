run_function("hs_finalize", null, "huntstats");

// List of pre-quit commands
send_command("inr all");
send_command("pg");

send_command("quit", 1);